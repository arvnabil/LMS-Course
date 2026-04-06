import Toast from '@/Components/Toast';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/Context/ThemeContext';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';
import QuizPlayerInline from '@/Components/QuizPlayerInline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';


export default function Learn({ auth, course, currentLesson, enrollment }) {
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [headerVisible, setHeaderVisible] = useState(true);

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
    const [hasStarted, setHasStarted] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const playerRef = useRef(null);
    const progressInterval = useRef(null);
    const lastMaxTime = useRef(0);

    const [isQuizPlaying, setIsQuizPlaying] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const [showResumeModal, setShowResumeModal] = useState(false);

    const completedLessons = enrollment.lesson_progress?.map(lp => lp.lesson_id) || [];
    const completedQuizzes = enrollment.quiz_attempts?.filter(a => a.is_passed).map(a => a.quiz_id) || [];
    const completedSubmissions = enrollment.submissions?.filter(s => s.status === 'approved').map(s => s.quiz_id) || [];
    
    const isAlreadyCompleted = currentLesson?.id && (
        currentLesson.is_quiz 
            ? (
                currentLesson.type === 'submission'
                    ? enrollment.submissions?.some(s => 
                        s.quiz_id === currentLesson.id && 
                        s.status === 'approved' && 
                        (!currentLesson.passing_score || s.score >= currentLesson.passing_score)
                    )
                    : (completedQuizzes.includes(currentLesson.id) || enrollment.submissions?.some(s => 
                        s.quiz_id === currentLesson.id && 
                        s.status === 'approved' && 
                        (!currentLesson.passing_score || s.score >= currentLesson.passing_score)
                    ))
            )
            : completedLessons.includes(currentLesson.id)
    );

    useEffect(() => {
        setIsQuizPlaying(false);
        
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
    }, [currentLesson?.id, isAlreadyCompleted]);

    // Navigation logic
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

    // Pre-calculate completion and lock status for all items
    const itemStates = {};
    let previousIncomplete = false;

    allCourseItems.forEach((item, index) => {
        const itemKey = `${item.itemType}-${item.id}`;
        const isLesson = item.itemType === 'lesson';
        
        // Use either snake_case or camelCase to be safe
        const progress = enrollment.lesson_progress || enrollment.lessonProgress || [];
        const isCompleted = isLesson 
            ? progress.some(lp => lp.lesson_id === item.id && (lp.is_completed || lp.completed_at))
            : (
                (enrollment.quiz_attempts || enrollment.quizAttempts)?.some(a => a.quiz_id === item.id && a.is_passed) || 
                enrollment.submissions?.some(s => 
                    s.quiz_id === item.id && 
                    s.status === 'approved' && 
                    (!item.passing_score || s.score >= item.passing_score)
                )
            );
        
        itemStates[itemKey] = {
            isCompleted,
            // Re-enabling sequential lock logic as requested by user
            isLocked: index > 0 && previousIncomplete
        };

        if (!isCompleted) {
            previousIncomplete = true;
        }
    });

    const completedCount = allCourseItems.filter(item => itemStates[`${item.itemType}-${item.id}`].isCompleted).length;
    const progressPercent = allCourseItems.length > 0 ? Math.round((completedCount / allCourseItems.length) * 100) : 0;

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

    const onPlayerReady = useCallback(() => {
        // Player is ready
    }, []);

    const onPlayerStateChange = useCallback((event) => {
        if (!playerRef.current) return;

        // 1 = playing
        if (event.data === 1) {
            setIsPlaying(true);
            setHasStarted(true);
            if (progressInterval.current) clearInterval(progressInterval.current);
            progressInterval.current = setInterval(() => {
                if (!playerRef.current) return;
                try {
                    const current = playerRef.current.getCurrentTime();
                    const dur = playerRef.current.getDuration();
                    
                    // Prevent fast forward beyond what was already watched
                    if (!isAlreadyCompleted && current > lastMaxTime.current + 2) {
                        playerRef.current.seekTo(lastMaxTime.current, true);
                        setToast({ message: "Fast forwarding is disabled for this course.", type: 'warning' });
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
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            setHasStarted(true);
            playerRef.current.playVideo();
        }
    };

    const seekTo = (seconds) => {
        if (!playerRef.current) return;
        // Only allow seeking backward
        if (isAlreadyCompleted || seconds <= lastMaxTime.current) {
            playerRef.current.seekTo(seconds, true);
        } else {
            setToast({ message: "You can only seek back to parts you've already watched.", type: 'warning' });
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    };

    const handleResume = () => {
        if (playerRef.current && resumeTime > 0) {
            playerRef.current.seekTo(resumeTime, true);
            lastMaxTime.current = Math.max(lastMaxTime.current, resumeTime);
            playerRef.current.playVideo();
            setIsPlaying(true);
            setHasStarted(true);
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
        }
    };


    return (
        <>
            <ThemeStyleInjector />
            <Head title={`Learning: ${course.title}`} />
            
            <div className="font-sans bg-muted min-h-screen flex flex-col text-foreground">
                {/* Top Header Bar - Toggleable */}
                <header className={`bg-surface border-b border-border px-4 py-2 flex items-center justify-between z-50 transition-all duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full absolute w-full'}`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
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
                            ← Dashboard
                        </Link>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-sm font-bold text-foreground truncate max-w-xs lg:max-w-md">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Watch Progress Indicator for video */}
                        {currentLesson?.type === 'video' && !isAlreadyCompleted && (
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${videoWatched ? 'bg-emerald-400' : 'bg-primary'}`} 
                                        style={{ width: `${watchProgress}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    {videoWatched ? '✓ Watched' : `${watchProgress}%`}
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
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
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all cursor-pointer"
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

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className={`bg-surface border-r border-border flex-shrink-0 flex flex-col transition-all duration-500 ease-out overflow-hidden ${sidebarOpen ? 'w-80' : 'w-0'}`}>
                        <div className="w-80 min-w-[320px] flex flex-col h-full">
                            {/* Course Info */}
                            <div className="px-6 py-6 border-b border-border space-y-4">
                                <h2 className="text-base font-extrabold text-foreground leading-tight truncate">{course.title}</h2>
                                <div className="space-y-2">
                                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{completedCount}/{allCourseItems.length} Items</p>
                                        <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{progressPercent}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum List */}
                            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
                                {course.sections?.map((section, sIdx) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    
                                    return (
                                    <div key={section.id} className="space-y-2">
                                        <div 
                                            onClick={() => toggleSection(section.id)}
                                            className="flex items-center justify-between px-3 cursor-pointer group"
                                        >
                                            <h3 className="text-[10px] font-extrabold text-gray-400 group-hover:text-primary transition-colors uppercase tracking-widest">Section {sIdx + 1}: {section.title}</h3>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center text-gray-400 group-hover:text-primary transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
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
                                                        <div key={`${item.itemType}-${item.id}`} className="w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 opacity-50 cursor-not-allowed">
                                                            <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground/60 truncate">{item.title}</span>
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
                                                        className={`w-full text-left dark:text-white px-3 py-3 rounded-2xl flex items-center gap-3 transition-all group ${
                                                            isActive 
                                                                ? 'bg-sidebar-active text-white dark:text-primary shadow-lg shadow-black/5' 
                                                                : 'hover:bg-muted'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                                            isCompleted ? 'bg-success' : (isActive ? 'bg-white/20' : 'bg-muted')
                                                        }`}>
                                                            {isCompleted ? (
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                            ) : (
                                                                <span className={`text-[8px] ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                                                    {isLesson ? (item.type === 'video' ? '▶' : '📄') : '📝'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-foreground group-hover:text-primary'}`}>
                                                            {item.title}
                                                        </span>
                                                        {!isLesson && (
                                                            <span className={`ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors ${
                                                                isActive 
                                                                    ? 'bg-white/20 text-white border-white/20'
                                                                    : (theme === 'dark' ? 'bg-white/10 text-white border-white/10' : 'bg-primary/10 text-primary border-primary/10')
                                                            }`}>
                                                                {item.type === 'submission' ? 'Assignment' : 'Quiz'}
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
                    <main className="flex-1 overflow-y-auto flex flex-col relative">
                        {/* Quiz/Assignment Content Area */}
                        {currentLesson?.is_quiz && (
                            isQuizPlaying ? (
                                <QuizPlayerInline quiz={currentLesson} onCancel={() => setIsQuizPlaying(false)} />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 bg-muted/30">
                                    <div className="max-w-2xl w-full bg-surface p-12 rounded-[48px] shadow-2xl shadow-black/5 border border-border text-center space-y-10">
                                        <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
                                            <span className="text-4xl text-white">{currentLesson.type === 'submission' ? '📤' : '🧠'}</span>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{currentLesson.title}</h2>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                                {currentLesson.type === 'submission' ? 'Final Assignment Submission' : `Multiple Choice Quiz • Passing Score: ${currentLesson.passing_score}%`}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        {(() => {
                                            const attempt = enrollment.quiz_attempts
                                                ?.filter(a => a.quiz_id === currentLesson.id)
                                                ?.sort((a, b) => b.id - a.id)?.[0];
                                                
                                            if (attempt) {
                                                return (
                                                    <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                                                        attempt.is_passed ? 'bg-success text-white' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                        {attempt.is_passed ? '✅ Passed' : '❌ Failed'} • Score: {Math.round(attempt.score)}%
                                                    </div>
                                                );
                                            }
                                            const submission = enrollment.submissions
                                                ?.filter(s => s.quiz_id === currentLesson.id)
                                                ?.sort((a, b) => b.id - a.id)?.[0];
                                            if (submission) {
                                                const isPassed = submission.status === 'approved' && (!currentLesson.passing_score || submission.score >= currentLesson.passing_score);
                                                return (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                                                            submission.status === 'approved' ? 'bg-success text-white' : 
                                                            submission.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                            {submission.status === 'approved' ? '✅ Approved' : submission.status === 'rejected' ? '❌ Rejected' : '🕒 Pending Review'}
                                                        </div>
                                                        {submission.status === 'approved' && (
                                                            <div className={`text-[10px] font-black uppercase tracking-widest ${isPassed ? 'text-success' : 'text-red-500'}`}>
                                                                Score: {submission.score || 0} / 100 
                                                                {!isPassed && ` (Required: ${currentLesson.passing_score})`}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        <div className="pt-6">
                                            <button 
                                                onClick={() => {
                                                    if (isSubmissionPending) {
                                                        setToast({ message: "Submission is still under review! Please wait for a mentor to approve or reject your work.", type: 'warning' });
                                                        return;
                                                    }
                                                    // Only block if passing_score is met (or no passing_score exists)
                                                    const hasPassed = isSubmissionApproved && (!currentLesson.passing_score || (currentSubmission?.score || 0) >= currentLesson.passing_score);
                                                    
                                                    if (hasPassed) {
                                                        setToast({ message: "This assignment has already been approved and you've passed! 🎉", type: 'success' });
                                                        return;
                                                    }
                                                    setIsQuizPlaying(true);
                                                }}
                                                className={`inline-flex items-center gap-4 px-10 py-5 rounded-full font-extrabold shadow-xl transition-all hover:scale-105 cursor-pointer ${
                                                    isSubmissionPending ? 'bg-gray-400 text-white cursor-not-allowed opacity-50' : 'bg-primary text-white shadow-primary/20 hover:bg-primary-hover'
                                                }`}
                                            >
                                                <span className="text-sm font-extrabold uppercase tracking-widest">
                                                    {isSubmissionPending ? 'Pending Review' : (currentLesson.type === 'submission' ? 'Start Submission' : 'Start Quiz')}
                                                </span>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                        {/* Video Player Area */}
                        {!currentLesson?.is_quiz && currentLesson?.type === 'video' && (
                            <div className="w-full bg-black flex items-center justify-center relative group">
                                {videoId ? (
                                    <div className="w-full aspect-video relative">
                                        <div id="yt-player" className="w-full h-full"></div>
                                        
                                        {/* Click to Toggle Play/Pause */}
                                        <div 
                                            className="absolute inset-0 z-0 cursor-pointer"
                                            onClick={togglePlay}
                                        ></div>

                                        {/* Custom Thumbnail & Play Button Overlay */}
                                        {videoId && !hasStarted && (
                                            <div 
                                                className="absolute inset-0 z-20 cursor-pointer group/overlay transition-all duration-700 overflow-hidden"
                                                onClick={togglePlay}
                                            >
                                                <img 
                                                    src={currentLesson.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/overlay:scale-105" 
                                                    alt="Video Thumbnail"
                                                    onError={(e) => {
                                                        if (!currentLesson.thumbnail) {
                                                            if (e.target.src.includes('maxresdefault.jpg')) {
                                                                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                                            } else if (e.target.src.includes('hqdefault.jpg')) {
                                                                e.target.src = `https://i.ytimg.com/vi/${videoId}/0.jpg`;
                                                            }
                                                        } else {
                                                            // If custom thumbnail fails, try youtube as ultimate fallback
                                                            e.target.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
                                                        }
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover/overlay:bg-black/30 transition-colors flex items-center justify-center">
                                                    <div className="w-20 h-14 sm:w-24 sm:h-16 bg-primary rounded-[18px] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:shadow-primary/40">
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Custom Overlay Controls */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-4 z-10">
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
                                                    <button onClick={togglePlay} className="text-white hover:text-primary transition-colors cursor-pointer">
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
                                                    <div className={`px-3 py-1 bg-white/10 rounded-full text-[8px] font-extrabold text-white uppercase tracking-widest border border-white/10 ${isAlreadyCompleted ? 'opacity-50' : ''}`}>
                                                        {isAlreadyCompleted ? 'Seek Protection Disabled' : 'Seek Protection Enabled'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video relative flex items-center justify-center">
                                        {currentLesson.thumbnail ? (
                                            <img src={currentLesson.thumbnail} className="absolute inset-0 w-full h-full object-cover" alt="Lesson Thumbnail" />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary/10 to-gray-950"></div>
                                        )}
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-20 h-14 bg-primary rounded-[18px] flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 border border-white/10 backdrop-blur-sm">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                            <p className="mt-6 text-gray-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">Video coming soon</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Area Below Video */}
                        {!currentLesson?.is_quiz && (
                            <div className="flex-1 bg-muted p-6 sm:p-10 lg:p-14 flex flex-col">
                                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                                    {/* Lesson Title & Content */}
                                    <div className="space-y-4 flex-1 mb-8">
                                        <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">{currentLesson?.title || 'Welcome to the Course'}</h1>
                                        <div className="prose prose-invert prose-sm max-w-none text-gray-500 font-medium leading-relaxed">
                                            {currentLesson?.content || 'Please select a lesson from the sidebar to begin learning.'}
                                        </div>
                                    </div>

                                    {/* Navigation Footer for Lessons */}
                                    <div className="pt-8 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                                        <button 
                                            onClick={goToPrevious}
                                            disabled={!prevLesson}
                                            className="px-6 py-3 rounded-2xl border border-gray-200 bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-gray-200 hover:text-foreground/70 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            ← Previous
                                        </button>
                                        <button 
                                            onClick={markAsComplete}
                                            disabled={currentLesson?.type === 'video' && !isAlreadyCompleted && !videoWatched}
                                            className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                                                currentLesson?.type === 'video' && !isAlreadyCompleted && !videoWatched
                                                    ? 'bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed'
                                                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-95'
                                            }`}
                                        >
                                            {isAlreadyCompleted ? (nextLesson ? 'Continue Next →' : 'Finish Course 🏆') : (
                                                currentLesson?.type === 'video' && !videoWatched 
                                                    ? `Watch to Unlock (${watchProgress}%)` 
                                                    : (nextLesson ? 'Complete & Next →' : 'Complete & Finish 🏆')
                                            )}
                                        </button>
                                    </div>
                                    {toast && <Toast {...toast} onClose={() => setToast(null)} />}
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer for Quizzes (Only when NOT playing) */}
                        {currentLesson?.is_quiz && !isQuizPlaying && (
                            <div className="bg-muted px-6 sm:px-10 lg:px-14 pb-8 w-full mt-auto">
                                <div className="max-w-4xl mx-auto w-full">
                                    <div className="flex items-center justify-between gap-4">
                                        <button 
                                            onClick={goToPrevious}
                                            disabled={!prevLesson}
                                            className="px-6 py-3 rounded-2xl border border-gray-200 bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-gray-200 hover:text-foreground/70 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            ← Previous
                                        </button>
                                        <button 
                                            onClick={markAsComplete}
                                            disabled={!isAlreadyCompleted}
                                            className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                                                !isAlreadyCompleted 
                                                    ? 'bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed' 
                                                    : 'bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-95'
                                            }`}
                                        >
                                            {isAlreadyCompleted ? (nextLesson ? 'Continue Next →' : 'Finish Course 🏆') : 'Finish Quiz First'}
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
