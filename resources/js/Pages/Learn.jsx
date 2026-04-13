import Toast from '@/Components/Toast';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';
import QuizPlayerInline from '@/Components/QuizPlayerInline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';

// Helper component for rendering text files
function TextFileViewer({ url }) {
    const [textContent, setTextContent] = useState('Loading...');
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load');
                return res.text();
            })
            .then(text => setTextContent(text))
            .catch(() => {
                setError(true);
                setTextContent('Failed to load text file content.');
            });
    }, [url]);

    return (
        <div className="w-full h-full bg-gray-900 p-6 sm:p-10 overflow-y-auto">
            <pre className={`text-sm leading-relaxed font-mono whitespace-pre-wrap ${error ? 'text-red-400' : 'text-gray-200'}`}>
                {textContent}
            </pre>
        </div>
    );
}

export default function Learn({ auth, course, currentLesson, enrollment }) {
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);

    const [expandedSections, setExpandedSections] = useState(() => {
        if (!course?.sections || !currentLesson) return [];
        const activeSection = course.sections.find(s => 
            (s.lessons || []).some(l => l.id === currentLesson.id && !currentLesson.is_quiz) ||
            (s.quizzes || []).some(q => q.id === currentLesson.id && !!currentLesson.is_quiz)
        );
        return activeSection ? [activeSection.id] : (course.sections[0] ? [course.sections[0].id] : []);
    });

    const toggleSection = (id) => {
        setExpandedSections(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const [videoWatched, setVideoWatched] = useState(false);
    const [watchProgress, setWatchProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoRetryCount, setVideoRetryCount] = useState(0);
    const [streamVersion, setStreamVersion] = useState(Date.now());
    const [hasStarted, setHasStarted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const playerRef = useRef(null);
    const progressInterval = useRef(null);
    const lastMaxTime = useRef(0);
    const pendingResumeTime = useRef(0);
    const isRecovering = useRef(false);

    const [isQuizPlaying, setIsQuizPlaying] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlTimeoutRef = useRef(null);
    const videoContainerRef = useRef(null);
    const videoRef = useRef(null);

    const completedLessons = enrollment.lesson_progress?.map(lp => lp.lesson_id) || [];
    
    // Helper to check if a specific item (lesson/quiz/submission) is passed based on LATEST data
    const checkItemProgress = (item) => {
        if (!item) return false;
        const isLesson = !item.is_quiz && item.itemType === 'lesson';
        
        if (isLesson) {
            const progressArray = enrollment.lesson_progress || enrollment.lessonProgress || [];
            return progressArray.some(lp => lp.lesson_id == item.id && (lp.is_completed || lp.completed_at));
        }
        
        // Quizzes & Submissions: Must pass the LATEST attempt
        const threshold = Number(item.passing_score || 85);
        if (item.type === 'submission') {
            const subs = enrollment.submissions?.filter(s => String(s.quiz_id) == String(item.id)) || [];
            const latest = subs.sort((a, b) => b.id - a.id)[0];
            return latest?.status === 'approved' && Number(latest.score || 0) >= threshold;
        } else {
            const attempts = (enrollment.quiz_attempts || enrollment.quizAttempts || [])?.filter(a => String(a.quiz_id) == String(item.id)) || [];
            const latest = attempts.sort((a, b) => b.id - a.id)[0];
            return latest && (latest.is_passed || Number(latest.score) >= threshold) && Number(latest.score) >= threshold;
        }
    };
    
    // Pre-calculate items and states first so we have a single source of truth
    const allCourseItems = course.sections?.flatMap(s => {
        const items = [
            ...(s.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
            ...(s.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }))
        ].sort((a, b) => a.order - b.order);
        return items;
    }) || [];

    const currentItemType = currentLesson?.is_quiz ? 'quiz' : 'lesson';
    const currentIndex = allCourseItems.findIndex(l => l.id === currentLesson?.id && l.itemType === currentItemType);
    const nextLesson = allCourseItems[currentIndex + 1];
    const prevLesson = allCourseItems[currentIndex - 1];

    const itemStates = {};
    let previousIncomplete = false;

    allCourseItems.forEach((item, index) => {
        const itemKey = `${item.itemType}-${item.id}`;
        const isCompleted = checkItemProgress(item);
        const isCurrentlyActive = item.id == currentLesson?.id && (item.is_quiz ? 'quiz' : 'lesson') === currentItemType;

        itemStates[itemKey] = {
            isCompleted,
            isLocked: index > 0 && previousIncomplete && !isCurrentlyActive
        };

        if (!isCompleted) {
            previousIncomplete = true;
        }
    });

    const completedCount = allCourseItems.filter(item => itemStates[`${item.itemType}-${item.id}`].isCompleted).length;
    const progressPercent = allCourseItems.length > 0 ? Math.round((completedCount / allCourseItems.length) * 100) : 0;

    const currentItemKey = `${currentItemType}-${currentLesson?.id}`;
    const isAlreadyCompleted = itemStates[currentItemKey]?.isCompleted || false;

    // Foolproof check for quiz/submission failure (or not yet passed)
    const isAnyQuizItem = !!(currentLesson?.is_quiz || currentLesson?.type === 'quiz' || currentLesson?.type === 'submission');
    const forceBlockProgress = isAnyQuizItem && !isAlreadyCompleted;

    // Export for debugging
    if (typeof window !== 'undefined') {
        window.quizDebug = { currentItemKey, isAlreadyCompleted, forceBlockProgress, itemState: itemStates[currentItemKey], currentLessonId: currentLesson?.id, enrollment };
    }

    useEffect(() => {
        setIsQuizPlaying(false);
        setIsBuffering(false);
        
        // Reset buffering for files
        if (currentLesson?.lesson_type === 'file') {
            setIsBuffering(true);
        }

        // Check for resume time on video lessons
        if (currentLesson?.type === 'video') {
            if (isAlreadyCompleted) {
                // If they already completed it, start from the beginning cleanly
                localStorage.removeItem(`lesson_${currentLesson.id}_resume_time`);
            } else {
                const savedTime = localStorage.getItem(`lesson_${currentLesson.id}_resume_time`);
                if (savedTime && parseFloat(savedTime) > 10) {
                    setResumeTime(parseFloat(savedTime));
                    setShowResumeModal(true);
                }
            }
        }

        // Reset retry count when lesson changes
        setVideoRetryCount(0);
        setStreamVersion(Date.now());
    }, [currentLesson?.id, isAlreadyCompleted]);

    console.log('Enrollment Data Debug:', {
        lessonProgress: enrollment.lesson_progress || enrollment.lessonProgress,
        completedCount,
        progressPercent,
        allCourseItems: allCourseItems.length
    });

    const markAsComplete = () => {
        const navigateTo = (item) => {
            if (item.itemType === 'quiz') {
                router.get(route('student.learn', [course.slug]), { quiz_id: item.id });
            } else {
                router.get(route('student.learn', [course.slug, item.id]));
            }
        };

        if (isAlreadyCompleted) {
            if (nextLesson) {
                navigateTo(nextLesson);
            } else {
                setToast({ message: "Course completed! Redirecting...", type: 'success' });
                setTimeout(() => {
                    router.get(route('student.courses.completed', course.slug));
                }, 1000);
            }
            return;
        }

        // Block completion if video not fully watched
        if (currentLesson?.type === 'video' && !videoWatched) {
            setToast({ message: "Please watch the entire video before completing this lesson.", type: 'error' });
            return;
        }

        router.post(route('student.lessons.complete', currentLesson.id), {}, {
            onSuccess: () => {
                if (nextLesson) {
                    setToast({ message: "Lesson completed! Moving to next...", type: 'success' });
                    setTimeout(() => {
                        navigateTo(nextLesson);
                    }, 1000);
                } else {
                    setToast({ message: "Course completed! Outstanding work! 🎉", type: 'success' });
                    setTimeout(() => {
                        router.get(route('student.courses.completed', course.slug));
                    }, 1500);
                }
            }
        });
    };

    const goToPrevious = () => {
        if (prevLesson) {
            if (prevLesson.itemType === 'quiz') {
                router.get(route('student.learn', [course.slug]), { quiz_id: prevLesson.id });
            } else {
                router.get(route('student.learn', [course.slug, prevLesson.id]));
            }
        }
    };

    // YouTube video ID extraction
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(currentLesson?.video_url);

    // Current lesson specific submission/quiz status
    const currentSubmission = currentLesson?.is_quiz ? enrollment.submissions
        ?.filter(s => s.quiz_id === currentLesson.id)
        ?.sort((a, b) => b.id - a.id)?.[0] : null;

    const isSubmissionPending = currentSubmission?.status === 'pending';
    const isSubmissionApproved = currentSubmission?.status === 'approved';

    // YouTube iframe API integration
    useEffect(() => {
        setVideoWatched(false);
        setWatchProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setHasStarted(false);
        lastMaxTime.current = 0;

        if (currentLesson?.type !== 'video' || !videoId) return;

        // Load the YouTube Iframe API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstTag = document.getElementsByTagName('script')[0];
            firstTag.parentNode.insertBefore(tag, firstTag);
        }

        const createPlayer = () => {
            const playerElement = document.getElementById('yt-player');
            if (!playerElement) {
                setTimeout(() => {
                    if (document.getElementById('yt-player')) finalizeCreate();
                }, 100);
                return;
            }
            finalizeCreate();
        };

        const finalizeCreate = () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch(e) {}
            }

            playerRef.current = new window.YT.Player('yt-player', {
                videoId: videoId,
                playerVars: {
                    controls: 0,        // Hide default YouTube controls
                    rel: 0,
                    modestbranding: 1,
                    disablekb: 1,       // Disable keyboard seeking
                    fs: 0,              // Disable full screen via default button
                    playsinline: 1,
                    showinfo: 0,
                    autohide: 1,
                    iv_load_policy: 3,
                },
                events: {
                    onStateChange: (event) => onPlayerStateChange(event, isAlreadyCompleted),
                    onReady: onPlayerReady,
                },
            });
        };

        if (!window.YT || !window.YT.Player) {
            if (!document.getElementById('youtube-iframe-api')) {
                const tag = document.createElement('script');
                tag.id = 'youtube-iframe-api';
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstTag = document.getElementsByTagName('script')[0];
                firstTag.parentNode.insertBefore(tag, firstTag);
            }
            
            const checkYT = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkYT);
                    createPlayer();
                }
            }, 100);
        } else {
            // Small timeout to ensure DOM is ready
            setTimeout(createPlayer, 50);
        }

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch(e) {}
                playerRef.current = null;
            }
        };
    }, [currentLesson?.id, videoId]);

    const onPlayerReady = useCallback((event) => {
        // Sync volume and mute state
        if (event.target) {
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
            else event.target.unMute();
        }
    }, [volume, isMuted]);

    const onPlayerStateChange = useCallback((event) => {
        if (!playerRef.current) return;

        // 1 = playing
        if (event.data === 1) {
            setIsPlaying(true);
            setHasStarted(true);
            setIsBuffering(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = setInterval(() => {
                if (!playerRef.current) return;
                try {
                    const current = playerRef.current.getCurrentTime();
                    const dur = playerRef.current.getDuration();
                    
                    // Prevent fast forward beyond what was already watched
                    if (!isAlreadyCompleted && current > lastMaxTime.current + 2) {
                        playerRef.current.seekTo(lastMaxTime.current, true);
                        setToast({ message: "Selesaikan materi ini dulu sebelum skip!", type: 'warning' });
                    } else if (isAlreadyCompleted || current > lastMaxTime.current) {
                        lastMaxTime.current = isAlreadyCompleted ? dur : current;
                    }
                    
                    setCurrentTime(current);
                    setDuration(dur);

                    if (dur > 0) {
                        const pct = Math.round((current / dur) * 100);
                        setWatchProgress(pct);
                        if (pct >= 98) {
                            setVideoWatched(true);
                        }

                        // Save resume time
                        if (current > 10) {
                            localStorage.setItem(`lesson_${currentLesson.id}_resume_time`, current);
                        }
                    }
                } catch(e) {}
            }, 500);
        } else {
            setIsPlaying(false);
            if (event.data === 3) {
                setIsBuffering(true);
            } else {
                // Only hide buffering if we aren't in a state where it's actually still loading
                setIsBuffering(false);
            }
            if (progressInterval.current) clearInterval(progressInterval.current);
        }

        // 0 = ended
        if (event.data === 0) {
            setVideoWatched(true);
            setWatchProgress(100);
            setIsPlaying(false);
            setHasStarted(false);
            // Clear resume time since it's finished
            if (currentLesson) {
                localStorage.removeItem(`lesson_${currentLesson.id}_resume_time`);
            }
        }
    }, [isAlreadyCompleted, currentLesson]);

    const togglePlay = () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                setHasStarted(true);
                playerRef.current.playVideo();
            }
        } else if (videoRef.current) {
            if (videoRef.current.paused) {
                setHasStarted(true);
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const seekTo = (seconds) => {
        if (isAlreadyCompleted || seconds <= lastMaxTime.current + 2) {
            if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
                playerRef.current.seekTo(seconds, true);
            } else if (videoRef.current) {
                videoRef.current.currentTime = seconds;
            }
            setCurrentTime(seconds);
        } else {
            setToast({ message: "Selesaikan materi ini dulu sebelum skip!", type: 'warning' });
        }
    };

    const toggleMute = () => {
        if (playerRef.current && typeof playerRef.current.mute === 'function') {
            if (isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            } else {
                playerRef.current.mute();
                setIsMuted(true);
            }
        } else if (videoRef.current) {
            const newMuted = !videoRef.current.muted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    const handleVolumeChange = (newVolume) => {
        const vol = parseInt(newVolume);
        setVolume(vol);
        
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
            playerRef.current.setVolume(vol);
            if (vol > 0 && isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            } else if (vol === 0 && !isMuted) {
                playerRef.current.mute();
                setIsMuted(true);
            }
        } else if (videoRef.current) {
            videoRef.current.volume = vol / 100;
            const newMuted = vol === 0;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    const toggleFullscreen = () => {
        if (!videoContainerRef.current) return;

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch(err => {
                setToast({ message: `Error attempting to enable full-screen mode: ${err.message}`, type: 'error' });
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes (e.g. Esc key)
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    const formatMinutes = (minutes) => {
        if (!minutes || minutes <= 0) return null;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) {
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
        return `${m}m`;
    };

    const handleResume = () => {
        if (resumeTime > 0) {
            if (playerRef.current) {
                playerRef.current.seekTo(resumeTime, true);
                lastMaxTime.current = Math.max(lastMaxTime.current, resumeTime);
                playerRef.current.playVideo();
                setIsPlaying(true);
                setHasStarted(true);
            } else if (videoRef.current) {
                // Set as pending to seek safely after metadata loads
                pendingResumeTime.current = resumeTime;
                lastMaxTime.current = Math.max(lastMaxTime.current, resumeTime);
                
                // If it's already loaded, trigger the seek manually and play
                if (videoRef.current.readyState >= 2) {
                    videoRef.current.currentTime = resumeTime;
                    videoRef.current.play().catch(() => setIsPlaying(false));
                } else {
                    // Start loading and a fresh version if not already
                    setStreamVersion(Date.now());
                }
                
                setIsPlaying(true);
                setHasStarted(true);
            }
        }
        setShowResumeModal(false);
    };

    const handleRestart = () => {
        localStorage.removeItem(`lesson_${currentLesson.id}_resume_time`);
        setShowResumeModal(false);
        if (playerRef.current) {
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
            setIsPlaying(true);
            setHasStarted(true);
        } else if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
            setHasStarted(true);
        }
    };

    // Mobile Control Autohide Logic
    useEffect(() => {
        if (isPlaying && showControls) {
            if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
            controlTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
        return () => {
            if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        };
    }, [isPlaying, showControls]);

    const handleVideoContainerClick = () => {
        if (!hasStarted) return;
        setShowControls(true);
        if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
        
        // If already showing, toggle play/pause? 
        // Actually, better to just show controls first tap, then toggle if tapped again while controls are visible
        // However, most premium players show controls on first tap.
    };


    return (
        <>
            <ThemeStyleInjector />
            <Head title={`Learning: ${course.title}`} />
            
            <div className="font-sans bg-white dark:bg-zinc-950 h-screen flex flex-col text-foreground overflow-hidden selection:bg-primary/10">
                {/* Top Header Bar - Toggleable */}
                <header className={`bg-white dark:bg-zinc-950 border-b border-border px-4 py-2 flex items-center justify-between z-50 transition-all duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full absolute w-full'}`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                            title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {sidebarOpen ? (
                                    <><path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5"/><polyline points="7 10 7 14"/></>
                                ) : (
                                    <><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>
                                )}
                            </svg>
                        </button>
                        <Link href={route('dashboard')} className="text-gray-400 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors">
                            <span className="sm:inline hidden">← Dashboard</span>
                            <span className="sm:hidden font-extrabold text-lg">←</span>
                        </Link>
                        <span className="text-gray-300 sm:inline hidden">|</span>
                        <h1 className="text-sm font-bold text-foreground truncate max-w-[120px] sm:max-w-xs lg:max-w-md hidden sm:block">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Watch Progress Indicator for video */}
                        {currentLesson?.type === 'video' && !isAlreadyCompleted && (
                            <div className="flex items-center gap-2">
                                <div className="w-16 sm:w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${videoWatched ? 'bg-emerald-400' : 'bg-primary'}`} 
                                        style={{ width: `${watchProgress}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-primary sm:text-gray-400 uppercase tracking-wider">
                                    {videoWatched ? '✓ Done' : `${watchProgress}%`}
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                            )}
                        </button>
                        <button 
                            onClick={() => setHeaderVisible(false)} 
                            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                            title="Hide Header"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 15-6-6-6 6"/>
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Show Header Button (when hidden) */}
                {!headerVisible && (
                    <button 
                        onClick={() => setHeaderVisible(true)} 
                        className="fixed top-2 right-2 z-50 w-9 h-9 rounded-xl bg-gray-200 hover:bg-gray-200 backdrop-blur-xl flex items-center justify-center transition-all cursor-pointer border border-gray-200"
                        title="Show Header"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>
                )}

                <div className="flex flex-1 overflow-hidden relative">
                    {/* Background Backdrop for Mobile Sidebar */}
                    {sidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300" 
                            onClick={() => setSidebarOpen(false)}
                        ></div>
                    )}

                    {/* Sidebar */}
                    <aside className={`bg-white dark:bg-zinc-950 border-r border-border/50 shrink-0 flex flex-col transition-all duration-500 ease-out overflow-hidden z-40 h-full lg:relative absolute shadow-2xl lg:shadow-none ${sidebarOpen ? 'w-[280px] sm:w-80 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'}`}>
                        <div className="w-[280px] sm:w-80 flex flex-col h-full">
                            {/* Course Info */}
                            <div className="px-6 py-8 border-b border-border/60 bg-white dark:bg-white/5 space-y-5">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-primary dark:text-primary-foreground/60 uppercase tracking-tighter">Current Course</p>
                                    <h2 className="text-sm font-black text-foreground leading-tight line-clamp-2">{course.title}</h2>
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{completedCount}/{allCourseItems.length} Completed</p>
                                        <p className="text-xs font-black text-primary uppercase tracking-tight">{progressPercent}%</p>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden shadow-inner">
                                        <div className="bg-primary h-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercent}%` }}>
                                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum List */}
                            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
                                {course.sections?.map((section, sIdx) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const sectionDuration = section.lessons?.reduce((acc, l) => acc + (parseInt(l.duration_minutes) || 0), 0) || 0;
                                    
                                    return (
                                    <div key={section.id} className="space-y-2">
                                        <div 
                                            onClick={() => toggleSection(section.id)}
                                            className="px-6 py-4 flex items-center justify-between cursor-pointer group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-border/40"
                                        >
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-black text-primary/60 dark:text-primary-foreground/40 uppercase tracking-[0.2em]">Module {sIdx + 1} {sectionDuration > 0 && ` • ${formatMinutes(sectionDuration)}`}</p>
                                                <h3 className="text-[11px] font-black text-foreground/70 group-hover:text-primary transition-colors uppercase tracking-wider line-clamp-1">{section.title}</h3>
                                            </div>
                                            <div className={`w-6 h-6 rounded-lg bg-gray-100 dark:bg-muted/50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-all duration-300 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                        
                                        <div className={`space-y-0.5 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            {[
                                                ...(section.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
                                                ...(section.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }))
                                            ].sort((a, b) => a.order - b.order).map((item) => {
                                                const isLesson = item.itemType === 'lesson';
                                                const { isCompleted, isLocked } = itemStates[`${item.itemType}-${item.id}`];
                                                
                                                const isActive = currentLesson?.id === item.id && (isLesson ? !currentLesson.is_quiz : !!currentLesson.is_quiz);

                                                if (isLocked) {
                                                    return (
                                                        <div 
                                                            key={`${item.itemType}-${item.id}`} 
                                                            className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 bg-gray-50/30 opacity-60 transition-all border border-transparent"
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                                </svg>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-500 truncate">{item.title}</span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={`${item.itemType}-${item.id}`}
                                                        href={isLesson ? route('student.learn', [course.slug, item.id]) : '#'}
                                                        onClick={(e) => {
                                                            if (!isLesson) {
                                                                e.preventDefault();
                                                                router.get(route('student.learn', [course.slug]), { quiz_id: item.id });
                                                            }
                                                        }}
                                                        className={`w-full text-left px-3 md:px-5 py-2.5 md:py-3.5 rounded-xl flex items-center gap-4 transition-all duration-500 group border-2 ${
                                                            isActive 
                                                                ? 'bg-primary text-white shadow-xl shadow-primary/25 border-primary scale-[1.02] z-10' 
                                                                : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-border/30'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                                            isCompleted 
                                                                ? (isActive ? 'bg-white/20' : 'bg-emerald-500/10') 
                                                                : (isActive ? 'bg-white/20' : 'bg-muted')
                                                        }`}>
                                                            {isCompleted ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={isActive ? 'text-white' : 'text-emerald-500'}>
                                                                    <polyline points="20 6 9 17 4 12"/>
                                                                </svg>
                                                            ) : (
                                                                <div className={isActive ? 'text-white' : 'text-gray-500'}>
                                                                    {isLesson ? (
                                                                        item.type === 'video' ? (
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                                        ) : item.type === 'file' ? (
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                                                        ) : (
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                                        )
                                                                    ) : (
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[13px] font-bold truncate transition-colors ${isActive ? 'text-white' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                                            {item.title}
                                                        </span>
                                                        {item.duration_minutes > 0 && (
                                                            <span className={`text-[9px] font-bold tabular-nums opacity-60 ${isActive ? 'text-white' : ''}`}>
                                                                {formatMinutes(item.duration_minutes)}
                                                            </span>
                                                        )}
                                                        {!isLesson && (
                                                            <span className={`ml-auto text-[8px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-lg border transition-all ${
                                                                isActive 
                                                                    ? 'bg-white/10 text-white border-white/20 backdrop-blur-sm'
                                                                    : (theme === 'dark' ? 'bg-white/5 text-white/50 border-white/10' : 'bg-primary/5 text-primary border-primary/20')
                                                            }`}>
                                                                {item.type === 'submission' ? 'Assign' : 'Quiz'}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto relative bg-white dark:bg-zinc-950 scroll-smooth">
                        {/* Quiz/Assignment Content Area */}
                        {currentLesson?.is_quiz ? (
                            isQuizPlaying ? (
                                <QuizPlayerInline quiz={currentLesson} onCancel={() => setIsQuizPlaying(false)} />
                            ) : (
                                    <div className="w-full flex-1 bg-white dark:bg-zinc-900/30 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden relative min-h-[600px]">
                                        <div className="max-w-2xl w-full h-full bg-surface p-10 sm:p-16 rounded-[48px] shadow-2xl shadow-black/5 border border-border text-center space-y-10 animate-in fade-in zoom-in duration-500 overflow-y-auto scrollbar-hide">
                                            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                                                <span className="text-4xl">{currentLesson.type === 'submission' ? '📥' : '🧠'}</span>
                                            </div>
                                            <div className="space-y-4">
                                                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{currentLesson.title}</h2>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                                    {currentLesson.type === 'submission' ? 'Final Assignment Submission' : `Multiple Choice Quiz • Passing Score: ${currentLesson.passing_score}%`}
                                                </p>
                                                
                                                {(() => {
                                                    // Handle Quiz Attempts
                                                    if (currentLesson.type !== 'submission') {
                                                        const attempts = enrollment?.quiz_attempts || enrollment?.quizAttempts || [];
                                                        const attempt = attempts
                                                            ?.filter(a => String(a.quiz_id) == String(currentLesson.id))
                                                            ?.sort((a, b) => b.id - a.id)?.[0];
                                                        
                                                        if (attempt) {
                                                            return (
                                                                <div className="flex flex-col items-center gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`text-4xl font-black ${Number(attempt.score) >= Number(currentLesson.passing_score || 85) ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                            {Math.round(Number(attempt.score))}%
                                                                        </span>
                                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${Number(attempt.score) >= Number(currentLesson.passing_score || 85) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                                            {Number(attempt.score) >= Number(currentLesson.passing_score || 85) ? 'PASSED' : 'FAILED'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Last Attempt Score</p>
                                                                </div>
                                                            );
                                                        }
                                                    } 
                                                    // Handle Assignment Submissions
                                                    else {
                                                        const submissions = enrollment?.submissions || [];
                                                        const submission = submissions
                                                            ?.filter(s => String(s.quiz_id) == String(currentLesson.id))
                                                            ?.sort((a, b) => b.id - a.id)?.[0];
                                                            
                                                        if (submission) {
                                                            const isPassed = submission.status === 'approved' && (!currentLesson.passing_score || Number(submission.score) >= Number(currentLesson.passing_score));
                                                            return (
                                                                <div className="flex flex-col items-center gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                                                    <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                                                                        submission.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                                        submission.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                                    }`}>
                                                                        {submission.status === 'approved' ? '✅ Approved' : submission.status === 'rejected' ? '❌ Rejected' : '🕒 Pending Review'}
                                                                    </div>
                                                                    {(submission.status === 'approved' || submission.status === 'rejected') && (
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`text-3xl font-black ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                                {Math.round(Number(submission.score || 0))}%
                                                                            </span>
                                                                            <span className={`px-4 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${isPassed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                                                {isPassed ? 'PASSED' : 'FAILED'}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {submission.mentor_feedback && (
                                                                        <div className="mt-6 p-5 bg-primary/5 rounded-3xl border border-primary/10 text-left animate-in fade-in slide-in-from-top-4 duration-700 w-full max-w-lg mx-auto">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">💬</div>
                                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Feedback dari Mentor</span>
                                                                            </div>
                                                                            <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium italic pl-1 border-l-2 border-primary/20 ml-4">
                                                                                "{submission.mentor_feedback}"
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                })()}
                                            </div>

                                            <div className="space-y-4 pt-4">
                                                <button 
                                                    onClick={() => {
                                                        if (isSubmissionPending) {
                                                            setToast({ message: "Submission is still under review! Please wait.", type: 'warning' });
                                                            return;
                                                        }
                                                        setIsQuizPlaying(true);
                                                    }}
                                                    className={`w-full inline-flex items-center justify-center gap-3 md:gap-4 px-6 py-3.5 md:px-10 md:py-6 rounded-full font-extrabold shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                                                        isSubmissionPending ? 'bg-gray-400 text-white cursor-not-allowed opacity-50' : 'bg-primary text-white shadow-primary/20 hover:bg-primary-hover'
                                                    }`}
                                                >
                                                    <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest">
                                                        {isSubmissionPending ? 'Pending Review' : (isAlreadyCompleted ? 'RETAKE ASSESSMENT' : 'START ASSESSMENT')}
                                                    </span>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                                                </button>
                                                {isAlreadyCompleted && (
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anda dapat mengerjakan ulang untuk meningkatkan skor.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                            )
                        ) : currentLesson?.type === 'video' ? (
                            /* Video Player Area */
                            <div ref={videoContainerRef} className="w-full shrink-0 aspect-video bg-black flex items-center justify-center relative group overflow-hidden">
                                    {(currentLesson?.video_source?.includes('onedrive') || 
                                      currentLesson?.video_url?.includes('sharepoint.com') || 
                                      currentLesson?.video_url?.includes('onedrive.live.com') ||
                                      (currentLesson?.video_id && !videoId)) ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <video 
                                                key={`onedrive-video-${streamVersion}`}
                                                ref={videoRef}
                                                src={`/onedrive/stream/${currentLesson.video_id}?v=${streamVersion}`}
                                                className="w-full h-full outline-none"
                                                playsInline
                                                onPlay={() => {
                                                    setIsPlaying(true);
                                                    setHasStarted(true);
                                                }}
                                                onPause={() => setIsPlaying(false)}
                                                onWaiting={() => setIsBuffering(true)}
                                                onPlaying={() => setIsBuffering(false)}
                                                onCanPlay={() => setIsBuffering(false)}
                                                onLoadStart={() => setIsBuffering(true)}
                                                onLoadedData={() => setIsBuffering(false)}
                                                onLoadedMetadata={(e) => {
                                                    setDuration(e.target.duration);
                                                    setIsBuffering(false);
                                                    setVideoRetryCount(0); 
                                                    
                                                    // Handle silent refresh resume
                                                    if (pendingResumeTime.current > 0) {
                                                        const targetTime = pendingResumeTime.current;
                                                        pendingResumeTime.current = 0; 
                                                        isRecovering.current = true;
                                                        
                                                        // Increased delay to 800ms for stability
                                                        setTimeout(() => {
                                                            if (e.target) {
                                                                e.target.currentTime = targetTime;
                                                                const playPromise = e.target.play();
                                                                if (playPromise !== undefined) {
                                                                    playPromise.catch(error => {
                                                                        console.warn("Autoplay/Resume interrupted:", error.name);
                                                                    });
                                                                }
                                                                
                                                                // Re-enable seek protection after 5 seconds of stability
                                                                setTimeout(() => {
                                                                    isRecovering.current = false;
                                                                }, 5000);
                                                            }
                                                        }, 800);
                                                    }
                                                }}
                                                onError={(e) => {
                                                    const errorCode = e.target.error ? e.target.error.code : 'unknown';
                                                    console.error("Video Playback Error (OneDrive - Detailed):", {
                                                        code: errorCode,
                                                        message: e.target.error ? e.target.error.message : '',
                                                        currentTime: e.target.currentTime,
                                                        itemId: currentLesson.video_id
                                                    });
                                                    
                                                    // Silent refresh mechanism for expired links or corrupted segments
                                                    if (videoRetryCount < 3) {
                                                        let current = videoRef.current?.currentTime || currentTime;
                                                        
                                                        // If it's a DECODE ERROR (Code 3), try to skip forward 1.5s to bypass corruption
                                                        if (errorCode === 3) {
                                                            console.log("Decode error detected. Skipping forward 1.5s to bypass corruption...");
                                                            current += 1.5;
                                                        }

                                                        // Prevent re-triggering if we are already at 0 or very close to it
                                                        if (current < 1 && videoRetryCount > 0) return;

                                                        console.log(`Attempting silent refresh (Retry ${videoRetryCount + 1})... Resuming from ${current}s`);
                                                        
                                                        // Stop current playback before refresh to prevent AbortError
                                                        if (videoRef.current) {
                                                            try { videoRef.current.pause(); } catch(e) {}
                                                        }

                                                        pendingResumeTime.current = current;
                                                        setVideoRetryCount(prev => prev + 1);
                                                        setStreamVersion(Date.now());
                                                        
                                                        // Force load with new src
                                                        setTimeout(() => {
                                                            if (videoRef.current) {
                                                                videoRef.current.load();
                                                            }
                                                        }, 50);
                                                    } else {
                                                        setToast({ 
                                                            message: "Failed to load video. Please ensure the OneDrive link is still valid and you have permissions.", 
                                                            type: 'error' 
                                                        });
                                                    }
                                                }}
                                                onTimeUpdate={(e) => {
                                                    const current = e.target.currentTime;
                                                    const dur = e.target.duration || 0;
                                                    
                                                    if (!isAlreadyCompleted && !isRecovering.current && current > lastMaxTime.current + 2) {
                                                        e.target.currentTime = lastMaxTime.current;
                                                    } else if (isAlreadyCompleted || current > lastMaxTime.current) {
                                                        // If already completed, we allow seeking anywhere by keeping lastMaxTime ahead
                                                        lastMaxTime.current = isAlreadyCompleted ? Math.max(dur, current) : current;
                                                    }
                                                    
                                                    setCurrentTime(current);
                                                    setDuration(dur);
                                                    if (dur > 0) {
                                                        const pct = Math.round((current / dur) * 100);
                                                        setWatchProgress(pct);
                                                        if (pct >= 98) setVideoWatched(true);
                                                        if (current > 10) localStorage.setItem(`lesson_${currentLesson.id}_resume_time`, current);
                                                    }
                                                }}
                                                onEnded={() => {
                                                    setVideoWatched(true);
                                                    setWatchProgress(100);
                                                    setIsPlaying(false);
                                                    setHasStarted(false);
                                                    localStorage.removeItem(`lesson_${currentLesson.id}_resume_time`);
                                                    markAsComplete();
                                                }}
                                            />
                                        </div>
                                    ) : videoId ? (
                                        <div id="yt-player" className="w-full h-full"></div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary/10 to-gray-950"></div>
                                            <p className="mt-6 text-gray-400 text-[10px] font-extrabold uppercase tracking-[0.2em] relative z-10">Waiting for Video Source...</p>
                                        </div>
                                    )}

                                    {/* Buffering Spinner Overlay */}
                                    {isBuffering && (hasStarted || currentLesson?.lesson_type === 'file') && (
                                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-300">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Buffering...</p>
                                        </div>
                                    )}

                                    {/* Invisible click area for toggle play/pause while playing */}
                                    {hasStarted && (
                                        <div 
                                            className="absolute inset-0 z-0 cursor-pointer"
                                            onClick={() => {
                                                if (!showControls && isPlaying) {
                                                    setShowControls(true);
                                                } else {
                                                    togglePlay();
                                                }
                                            }}
                                            onDoubleClick={toggleFullscreen}
                                        ></div>
                                    )}
                                    
                                    {/* Custom Thumbnail & Play Button Overlay */}
                                    {!hasStarted && (
                                        <div 
                                            className="absolute inset-0 z-20 cursor-pointer group/overlay transition-all duration-700 overflow-hidden"
                                            onClick={togglePlay}
                                        >
                                            {currentLesson.thumbnail || videoId ? (
                                                <img 
                                                    src={currentLesson.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/overlay:scale-105" 
                                                    alt="Video Thumbnail"
                                                    onError={(e) => {
                                                        if (videoId && !currentLesson.thumbnail) {
                                                            if (e.target.src.includes('maxresdefault.jpg')) {
                                                                  e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                                            } else if (e.target.src.includes('hqdefault.jpg')) {
                                                                  e.target.src = `https://i.ytimg.com/vi/${videoId}/0.jpg`;
                                                            }
                                                        } else {
                                                            e.target.style.display = 'none';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary/20 to-gray-950"></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/10 group-hover/overlay:bg-black/30 transition-colors flex items-center justify-center">
                                                <div className="w-20 h-14 sm:w-24 sm:h-16 bg-primary rounded-[18px] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:shadow-primary/40 border border-white/10 backdrop-blur-sm">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Custom Overlay Controls */}
                                    <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-500 flex flex-col gap-3 sm:gap-4 z-10 ${
                                        (showControls || !isPlaying) ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
                                    }`}>
                                        {/* Custom Progress Bar */}
                                        <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/progress overflow-hidden" 
                                             onClick={(e) => {
                                                 const rect = e.currentTarget.getBoundingClientRect();
                                                 const pos = (e.clientX - rect.left) / rect.width;
                                                 seekTo(pos * duration);
                                             }}>
                                            <div className="absolute inset-y-0 left-0 bg-primary transition-all pointer-events-none" style={{ width: `${watchProgress}%` }}></div>
                                            <div className="absolute inset-y-0 left-0 bg-white/30 transition-all pointer-events-none" style={{ width: `${(lastMaxTime.current / duration) * 100}%` }}></div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <button onClick={togglePlay} className="text-white hover:text-primary transition-colors cursor-pointer outline-none">
                                                    {isPlaying ? (
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                                    ) : (
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                    )}
                                                </button>
                                                
                                                <div className="text-[10px] font-bold text-white uppercase tracking-widest tabular-nums">
                                                    {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                {/* Volume Control */}
                                                <div className="flex items-center gap-2 group/volume relative">
                                                    <button onClick={toggleMute} className="text-white hover:text-primary transition-colors cursor-pointer outline-none">
                                                        {isMuted || volume === 0 ? (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                                                        ) : volume < 50 ? (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                                                        ) : (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                                                        )}
                                                    </button>
                                                    <div className={`w-0 overflow-hidden transition-all duration-300 flex items-center ${showControls ? 'sm:w-20 w-16 ml-1' : 'group-hover/volume:w-20'}`}>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="100" 
                                                            value={volume} 
                                                            onChange={(e) => handleVolumeChange(e.target.value)}
                                                            className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
                                                        />
                                                    </div>
                                                </div>

                                                <div className={`px-3 py-1 bg-white/10 rounded-full text-[8px] font-extrabold text-white uppercase tracking-widest border border-white/10 hidden sm:block ${isAlreadyCompleted ? 'opacity-50' : ''}`}>
                                                    {isAlreadyCompleted ? 'Seek Protection Disabled' : 'Seek Protection Enabled'}
                                                </div>

                                                <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors cursor-pointer outline-none">
                                                    {isFullscreen ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                        ) : null}

                        {/* File Display Area */}
                        {currentLesson?.type === 'file' && currentLesson?.file_id && (() => {
                            const streamUrl = `/onedrive/stream/${currentLesson.file_id}?t=${new Date(currentLesson.updated_at).getTime()}`;
                            const fileNameClean = (currentLesson.file_name || currentLesson.title || '').toLowerCase();
                            const mimeClean = (currentLesson.mime_type || '').toLowerCase();

                            // 1. PPT/Presentation Detection (Prioritized)
                            const isPpt = fileNameClean.includes('.pptx') || 
                                          fileNameClean.includes('.ppt') || 
                                          mimeClean.includes('presentation') || 
                                          mimeClean.includes('powerpoint') ||
                                          mimeClean.includes('officedocument.presentationml') ||
                                          /presentation|powerpoint|slide|materi/i.test(currentLesson.title);

                            // 2. PDF Detection
                            const isPdf = !isPpt && (
                                          fileNameClean.includes('.pdf') || 
                                          mimeClean === 'application/pdf' || 
                                          currentLesson.file_url?.toLowerCase().includes('.pdf') ||
                                          /e-book|ebook|pdf|modul/i.test(currentLesson.title) ||
                                          (fileNameClean && fileNameClean.endsWith('.pdf')) ||
                                          // Fallback for unidentified OneDrive files (default to PDF as safest viewer)
                                          (currentLesson.type === 'file' && currentLesson.file_id?.length > 20 && !mimeClean)
                                          );
                            
                            // 3. Image Detection
                            const isImage = !isPpt && !isPdf && (
                                            fileNameClean.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) || 
                                            mimeClean.startsWith('image/')
                                            );

                            // 4. Text Detection
                            const isText = !isPpt && !isPdf && !isImage && (
                                           fileNameClean.endsWith('.txt') || 
                                           mimeClean === 'text/plain'
                                           );

                             const fileName = currentLesson.file_name || currentLesson.title;
                            
                            // Debug logs to help identify why preview might be failing
                            console.log('File Detection Debug:', {
                                id: currentLesson.id,
                                title: currentLesson.title,
                                file_name: currentLesson.file_name,
                                mime_type: currentLesson.mime_type,
                                file_url: currentLesson.file_url,
                                isPdf,
                                isImage,
                                isText
                            });

                            return (
                                <div className="w-full flex flex-col bg-white dark:bg-zinc-900/30">
                                    {/* Premium File Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-white/5 shadow-sm z-10 gap-4 sm:gap-2">
                                        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                                                 {isPdf ? '📄' : isImage ? '🖼️' : isPpt ? '📽️' : '📁'}
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                 <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">
                                                     {fileName}
                                                 </h3>
                                                 <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                     {isPdf ? 'PDF Document' : isImage ? 'Image File' : isPpt ? 'Presentation' : 'Resource File'}
                                                 </p>
                                             </div>
                                        </div>
                                        <a 
                                            href={streamUrl}
                                            download={fileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group w-full sm:w-auto"
                                        >
                                            <span className="group-hover:translate-y-0.5 transition-transform">⬇️</span>
                                            Download
                                        </a>
                                    </div>

                                    {/* Viewer Area */}
                                    <div className="w-full shrink-0 aspect-video overflow-hidden relative flex items-center justify-center bg-gray-900 shadow-inner">
                                         {isPdf ? (
                                             <iframe 
                                                 src={`${streamUrl}#toolbar=0`}
                                                 className="w-full h-full border-none"
                                                 title="PDF Viewer"
                                                 onLoad={() => setIsBuffering(false)}
                                             />
                                         ) : isPpt ? (
                                             <iframe 
                                                 src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + '/storage/onedrive/' + currentLesson.file_id)}`}
                                                 className="w-full h-full border-none"
                                                 title="PowerPoint Viewer"
                                                 onLoad={() => setIsBuffering(false)}
                                                 allowFullScreen
                                             />
                                         ) : isImage ? (
                                            <div className="p-8 w-full h-full flex items-center justify-center">
                                                <img 
                                                    src={streamUrl}
                                                    alt={fileName}
                                                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-transform hover:scale-[1.01]"
                                                    onLoad={() => setIsBuffering(false)}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        setIsBuffering(false);
                                                        setToast({ message: 'Gagal memuat gambar.', type: 'error' });
                                                    }}
                                                />
                                            </div>
                                        ) : isText ? (
                                            <div className="w-full h-full bg-gray-900 overflow-auto">
                                                <TextFileViewer url={streamUrl} />
                                            </div>
                                        ) : (
                                            <div className="w-full p-20 text-center">
                                                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                                                    📎
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">File tersedia</h4>
                                                <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">Pratinjau tidak tersedia untuk tipe file ini. Silakan download untuk melihat isi file.</p>
                                                <a 
                                                    href={streamUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-105 transition-all"
                                                >Unduh Sekarang</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Content Area Below Video */}
                        {!currentLesson?.is_quiz && (
                            <div className="bg-white dark:bg-zinc-950 p-4 sm:p-10 lg:p-14">
                                <div className="max-w-4xl mx-auto w-full">
                                    {/* Lesson Title & Content */}
                                    <div className="space-y-4 flex-1 mb-8">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">{currentLesson?.title || 'Welcome to the Course'}</h1>
                                        <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-sm max-w-none text-gray-500 dark:text-gray-400 font-medium leading-relaxed`}>
                                            {currentLesson?.content ? (
                                                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                                            ) : (
                                                currentLesson?.type === 'video' ? null : 'No description available for this lesson.'
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}

                        {/* Unified Navigation Footer */}
                        {!isQuizPlaying && (
                            <div className="bg-white dark:bg-zinc-950 px-6 sm:px-10 lg:px-14 pb-12 w-full border-t border-gray-50 dark:border-white/5 pt-8">
                                <div className="max-w-4xl mx-auto w-full">
                                    <div className="flex items-center justify-between gap-4">
                                        <button 
                                            onClick={goToPrevious}
                                            disabled={!prevLesson}
                                            className="px-4 md:px-6 py-2.5 md:py-3 rounded-2xl border border-gray-200 bg-gray-100 text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest hover:border-gray-200 hover:text-foreground/70 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            ← Previous
                                        </button>
                                        <button 
                                            onClick={markAsComplete}
                                            disabled={
                                                (currentLesson?.type === 'video' && !isAlreadyCompleted && !videoWatched) || 
                                                forceBlockProgress
                                            }
                                            className={`px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all cursor-pointer ${
                                                ((currentLesson?.type === 'video' && !isAlreadyCompleted && !videoWatched) || forceBlockProgress)
                                                    ? 'bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed' 
                                                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-95'
                                            }`}
                                        >
                                            {forceBlockProgress ? 'Finish Quiz First' : (
                                                isAlreadyCompleted ? (nextLesson ? 'Continue Next →' : 'Finish Course 🏆') : (
                                                    currentLesson?.type === 'video' && !videoWatched 
                                                        ? `Watch to Unlock (${watchProgress}%)` 
                                                        : (nextLesson ? 'Complete & Next →' : 'Complete & Finish 🏆')
                                                )
                                            )}
                                        </button>
                                    </div>
                                    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
                                </div>
                            </div>
                        )}
                        
                        
                        {/* Always render toast container in case it wasn't rendered above */}
                        {isQuizPlaying && toast && <Toast {...toast} onClose={() => setToast(null)} />}

                        {/* Resume Video Modal */}
                        <Modal show={showResumeModal} onClose={() => setShowResumeModal(false)} maxWidth="md">
                            <div className="p-8 sm:p-10 space-y-8 text-center">
                                <div className="w-20 h-20 bg-primary rounded-[28px] flex items-center justify-center mx-auto text-3xl shadow-2xl shadow-primary/20">
                                    🕒
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Resume Watching?</h3>
                                    <p className="text-gray-500 font-medium">
                                        We noticed you were watching earlier. Would you like to continue from <span className="text-primary font-bold">{formatTime(resumeTime)}</span> or start over?
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <button 
                                        onClick={handleResume}
                                        className="w-full bg-primary text-white py-4 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1"
                                    >
                                        Continue Watching
                                    </button>
                                    <button 
                                        onClick={handleRestart}
                                        className="w-full py-4 text-gray-400 font-bold hover:text-foreground transition-colors uppercase text-[10px] tracking-widest"
                                    >
                                        Start from Beginning
                                    </button>
                                </div>
                            </div>
                        </Modal>

                    </main>
                </div>
            </div>
        </>
    );
}
