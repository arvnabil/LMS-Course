import GuestLayout from '@/Layouts/GuestLayout';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import ThemeStyleInjector from '@/Components/ThemeStyleInjector';
import Modal from '@/Components/Modal';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const CourseCard = ({ course, isEnrolled, onPlayClick, auth, orgPricing }) => (
    <div className="bg-surface rounded-[28px] p-5 shadow-2xl shadow-black/10 border border-border overflow-hidden flex flex-col group max-w-xs mx-auto">
        <div className="aspect-video bg-muted rounded-[20px] mb-5 overflow-hidden relative border border-border/50">
            {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl">
                    🖼️
                </div>
            )}
            {onPlayClick && (
                <div 
                    className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/30 transition-all cursor-pointer z-10"
                    onClick={onPlayClick}
                >
                    <div className="w-16 h-12 sm:w-20 sm:h-14 bg-primary rounded-[16px] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
            )}
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight italic">
                    {orgPricing?.is_org_sponsored ? (
                        <span className="flex flex-col">
                            <span className="text-[10px] text-primary uppercase tracking-[0.2em] font-extrabold not-italic mb-1 flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Sponsored by {orgPricing.org_name}
                            </span>
                            <span className="flex items-baseline gap-2">
                                <span className="text-primary">FREE</span>
                                <span className="text-sm text-muted-foreground line-through font-bold opacity-60">IDR {Number(orgPricing.original_price).toLocaleString('id-ID')}</span>
                            </span>
                        </span>
                    ) : (
                        course.price > 0 ? (
                            <span className="flex flex-col">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-extrabold not-italic mb-1">Lifetime Access</span>
                                IDR {Number(course.price).toLocaleString('id-ID')}
                            </span>
                        ) : 'FREE'
                    )}
                </p>
            </div>
            
            <div className="px-1">
                {isEnrolled ? (
                    <Link
                        href={route('student.learn', course.slug)}
                        className="w-full bg-sidebar-active text-white py-4 rounded-[20px] font-extrabold text-[13px] uppercase tracking-[0.15em] shadow-xl shadow-sidebar-active/20 hover:bg-sidebar-active/90 transition-all translate-y-0 hover:-translate-y-1 block text-center"
                    >
                        Continue Learning
                    </Link>
                ) : (
                    <Link
                        href={auth?.user ? route('payment.checkout', course.slug) : route('login')}
                        className="w-full bg-primary text-white py-4 rounded-[20px] font-extrabold text-[13px] uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 block text-center"
                    >
                        {orgPricing?.is_org_sponsored ? 'Enroll Now' : (Number(course.price) === 0 ? 'Enroll for Free' : 'Buy Course Now')}
                    </Link>
                )}
            </div>

            <ul className="space-y-4 px-4 pb-2">
                <li className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Full Lifetime Access
                </li>
                <li className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Certificate of Completion
                </li>
                <li className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                     <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                         <svg className="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                     </div>
                     {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0) + (s.quizzes?.length || 0), 0)} High-Quality Items
                </li>
            </ul>
        </div>
    </div>
);

export default function CourseDetail({ course = {}, isDashboard = false, isEnrolled = false, enrollment = null, orgPricing = null }) {
    const { auth } = usePage().props;
    const Layout = isDashboard ? DashboardLayout : GuestLayout;

    // Default to expanding the first section
    const [expandedSections, setExpandedSections] = useState(
        course.sections?.length > 0 ? [course.sections[0].id] : []
    );
    const [previewItem, setPreviewItem] = useState(null);
    const [previewStarted, setPreviewStarted] = useState(false);
    
    // Player states for custom controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const progressInterval = useRef(null);

    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const toggleSection = (id) => {
        setExpandedSections(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    // Sync curriculum progress logic from Learn.jsx
    const allCourseItems = course.sections?.sort((a, b) => a.order - b.order).flatMap(s => {
        const items = [
            ...(s.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
            ...(s.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }))
        ].sort((a, b) => a.order - b.order);
        return items;
    }) || [];

    const getItemKey = (item) => {
        const isQuiz = item.itemType === 'quiz' || item.questions_count !== undefined || item.quiz_id;
        return `${isQuiz ? 'quiz' : 'lesson'}-${item.id}`;
    };

    const itemStates = useMemo(() => {
        const states = {};
        if (!isEnrolled || !enrollment) return states;

        let previousIncomplete = false;
        const progress = enrollment.lesson_progress || enrollment.lessonProgress || [];
        const attempts = enrollment.quiz_attempts || enrollment.quizAttempts || [];
        const submissions = enrollment.submissions || [];

        allCourseItems.forEach((item, index) => {
            const itemKey = getItemKey(item);
            const isLesson = !itemKey.startsWith('quiz');
            
            const isCompleted = isLesson 
                ? progress.some(lp => lp.lesson_id === item.id && (lp.is_completed || lp.completed_at))
                : (
                    attempts?.some(a => a.quiz_id === item.id && a.is_passed) || 
                    submissions?.some(s => 
                        s.quiz_id === item.id && 
                        s.status === 'approved' && 
                        (!item.passing_score || s.score >= item.passing_score)
                    )
                );
            
            states[itemKey] = {
                id: item.id,
                title: item.title,
                isCompleted,
                isLocked: index > 0 && previousIncomplete
            };

            if (!isCompleted) {
                previousIncomplete = true;
            }
        });

        console.log('Course Detail Progress Detail:', states);
        return states;
    }, [isEnrolled, enrollment, allCourseItems]);

    const handleItemClick = (item) => {
        const itemKey = getItemKey(item);
        const isLockedByProgress = isEnrolled && itemStates[itemKey]?.isLocked;
        
        const isUnlocked = (isEnrolled && !isLockedByProgress) || item.is_preview;
        if (!isUnlocked) return;

        if (isEnrolled || item.questions_count !== undefined) {
             router.visit(route('student.learn', [course.slug, item.id]));
        } else {
             setIsPlaying(false);
             setHasStarted(false);
             setPreviewStarted(false);
             setPreviewItem(item);
        }
    };

    const handleCardPlayClick = () => {
        // Find first preview video
        const targetVideo = course.sections?.flatMap(s => s.lessons || [])
            .find(l => l.type === 'video' && l.is_preview);

        if (targetVideo) {
             setIsPlaying(false);
             setHasStarted(false);
             setPreviewStarted(false);
             setPreviewItem(targetVideo);
        }
    };

    // YouTube API integration for Modal
    useEffect(() => {
        if (!previewItem || previewItem.type !== 'video') return;
        const videoId = getYouTubeId(previewItem.video_url);
        if (!videoId) return;

        // Reset states
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasStarted(false);

        const onPlayerReady = (event) => {
            setDuration(event.target.getDuration());
        };

        const onPlayerStateChange = (event) => {
            // 1 = playing
            if (event.data === 1) {
                setIsPlaying(true);
                setHasStarted(true);
                if (progressInterval.current) clearInterval(progressInterval.current);
                progressInterval.current = setInterval(() => {
                    if (playerRef.current && playerRef.current.getCurrentTime) {
                        setCurrentTime(playerRef.current.getCurrentTime());
                    }
                }, 500);
            } else {
                setIsPlaying(false);
                if (progressInterval.current) clearInterval(progressInterval.current);
            }
        };

        const loadVideo = () => {
            const playerElement = document.getElementById('modal-yt-player');
            if (!playerElement) {
                // If element not found, retry once after a short delay
                setTimeout(() => {
                    const retryElement = document.getElementById('modal-yt-player');
                    if (retryElement) finalizeLoad();
                }, 100);
                return;
            }
            finalizeLoad();
        };

        const finalizeLoad = () => {
            const videoId = getYouTubeId(previewItem.video_url);
            if (!videoId) return;

            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch(e) {}
            }

            playerRef.current = new window.YT.Player('modal-yt-player', {
                videoId: videoId,
                playerVars: {
                    controls: 0,
                    rel: 0,
                    modestbranding: 1,
                    disablekb: 1,
                    playsinline: 1,
                    showinfo: 0,
                    mute: 0,
                },
                events: {
                    onStateChange: onPlayerStateChange,
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
            
            // Check periodically if YT is ready
            const checkYT = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(checkYT);
                    loadVideo();
                }
            }, 100);
        } else {
            // Small timeout to ensure Modal DOM is ready
            setTimeout(loadVideo, 50);
        }

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch(e) {}
                playerRef.current = null;
            }
        };
    }, [previewItem?.id]);

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
        playerRef.current.seekTo(seconds, true);
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

    const firstPreviewVideo = course.sections?.flatMap(s => s.lessons || [])
        .find(l => l.type === 'video' && l.is_preview);

    return (
        <Layout
            header={isDashboard ? <h2 className="font-semibold text-xl text-foreground leading-tight">Course Details</h2> : null}
        >
            <ThemeStyleInjector />
            <Head title={course.title} />

            {/* Course Background Banner */}
            <div 
                className={isDashboard 
                    ? "relative overflow-hidden rounded-[40px] p-8 md:p-12 mb-10 border border-gray-100 bg-muted" 
                    : "relative bg-muted py-20 border-b border-gray-100"
                }
                style={course.cover_image ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${course.cover_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : {}}
            >
                <div className={`${isDashboard ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"} relative z-10`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${course.cover_image ? 'bg-white/10 text-white border-white/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{course.category?.name || 'Uncategorized'}</span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${course.cover_image ? 'bg-white/10 text-white border-white/20' : 'bg-sidebar-active/10 text-sidebar-active border-sidebar-active/20'}`}>{course.level}</span>
                            </div>
                            <h1 className={`text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-sm ${course.cover_image ? 'text-white' : 'text-foreground'}`}>
                                {course.title}
                            </h1>
                            <p className={`text-lg font-medium leading-relaxed max-w-xl ${course.cover_image ? 'text-white/80' : 'text-muted-foreground'}`}>
                                {stripHtml(course.description).substring(0, 160)}...
                            </p>
                            <div className="flex items-center gap-8 pt-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        ))}
                                    </div>
                                    <span className="text-sm font-extrabold text-foreground">4.9 <span className="text-muted-foreground font-bold ml-1">(850 Reviews)</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 translate-y-[1px]">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-gray-400">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <span className="text-sm font-extrabold text-foreground">1.2k <span className="text-muted-foreground font-bold ml-1">Students</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Preview / Enrollment Card */}
                        <div className="lg:hidden lg:justify-self-end w-full relative z-20 px-4">
                            <CourseCard 
                                course={course} 
                                isEnrolled={isEnrolled} 
                                onPlayClick={firstPreviewVideo ? handleCardPlayClick : null} 
                                auth={auth} 
                                orgPricing={orgPricing}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className={isDashboard ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-10 lg:pt-20"}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                    <div className="lg:col-span-2 space-y-16">
                        {/* Description */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">ABOUT THIS COURSE</h2>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground font-medium leading-[1.8] text-[15px] space-y-4" dangerouslySetInnerHTML={{ __html: course.description }} />
                        </section>

                        {/* Curriculum */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Course Curriculum</h2>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] bg-primary px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                                    {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0) + (s.quizzes?.length || 0), 0)} ITEMS
                                </span>
                            </div>
                            <div className="space-y-6">
                                {course.sections?.sort((a,b) => a.order - b.order).map((section, idx) => {
                                    const isExpanded = expandedSections.includes(section.id);
                                    const itemsCount = (section.lessons?.length || 0) + (section.quizzes?.length || 0);

                                    return (
                                        <div key={section.id} className="bg-surface rounded-[32px] overflow-hidden border border-border shadow-sm transition-all duration-300">
                                            {/* Section Header (Clickable to collapse) */}
                                            <div 
                                                onClick={() => toggleSection(section.id)}
                                                className="flex items-center justify-between p-8 cursor-pointer hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">SECTION {idx + 1}</p>
                                                    <h3 className="text-lg font-extrabold text-foreground">{section.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-primary px-3 py-1 rounded-lg">
                                                        {itemsCount} ITEMS
                                                    </span>
                                                    <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section Content */}
                                            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                <div className="space-y-3 px-8 pb-8 pt-0">
                                                    {[...(section.lessons || []).map(l => ({ ...l, itemType: 'lesson' })), ...(section.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }))].sort((a,b) => a.order - b.order).map((item, i) => {
                                                        const itemKey = getItemKey(item);
                                                        const isLockedByProgress = isEnrolled && itemStates[itemKey]?.isLocked;
                                                        const isCompleted = isEnrolled && itemStates[itemKey]?.isCompleted;
                                                        const isUnlocked = (isEnrolled && !isLockedByProgress) || item.is_preview;
                                                        
                                                        return (
                                                            <div 
                                                                key={i} 
                                                                onClick={() => handleItemClick(item)}
                                                                className={`flex items-center gap-5 px-6 py-5 rounded-2xl border transition-all ${isUnlocked ? 'cursor-pointer hover:border-primary/30 hover:bg-muted/50 bg-muted/30 dark:bg-white/5 border-transparent group' : 'opacity-50 bg-muted/10 border-transparent cursor-not-allowed'}`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg shadow-sm border border-border overflow-hidden transition-all ${isUnlocked ? 'group-hover:border-primary/50' : ''}`}>
                                                                     {item.thumbnail ? (
                                                                         <img src={item.thumbnail} className="w-full h-full object-cover rounded-xl" alt="" />
                                                                     ) : (
                                                                         item.itemType === 'quiz' ? '🧠' : '📄'
                                                                     )}
                                                                 </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-sm font-bold transition-colors ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</span>
                                                                    {item.is_preview && !isEnrolled ? (
                                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5 italic">Unlocked for Preview</span>
                                                                    ) : (
                                                                        isCompleted && !isLockedByProgress ? (
                                                                            <span className="text-[9px] font-black text-success uppercase tracking-widest mt-0.5 italic flex items-center gap-1">
                                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                                                                Completed
                                                                            </span>
                                                                        ) : null
                                                                    )}
                                                                </div>
                                                                <div className={`ml-auto flex items-center gap-4 transition-colors ${isUnlocked ? 'text-muted-foreground group-hover:text-primary' : 'text-muted-foreground/40'}`}>
                                                                    {isLockedByProgress ? (
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> // Lock Closed
                                                                    ) : isCompleted ? (
                                                                         <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                                                                             <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                                                                         </div>
                                                                    ) : isUnlocked ? (
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> // Lock Open
                                                                    ) : (
                                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> // Lock Closed
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar (Sticky) */}
                    <div className="lg:col-span-1 px-4 lg:px-0">
                        <aside className="sticky top-24 space-y-8 lg:-mt-[280px] xl:-mt-[340px] z-20 pb-10">
                            {/* Desktop Preview / Enrollment Card */}
                            <div className="hidden lg:block w-full">
                                <CourseCard 
                                    course={course} 
                                    isEnrolled={isEnrolled} 
                                    onPlayClick={firstPreviewVideo ? handleCardPlayClick : null} 
                                    auth={auth} 
                                    orgPricing={orgPricing}
                                />
                            </div>

                            {/* Mentor Info */}
                            <section className="bg-surface rounded-[48px] p-10 border border-border text-center space-y-8 shadow-sm">
                                <div className="w-28 h-28 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-5xl overflow-hidden border-4 border-surface shadow-xl relative group">
                                    {course.mentor?.avatar_url ? (
                                        <img src={course.mentor.avatar_url} alt={course.mentor.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <span className="text-primary font-black">{course.mentor?.full_name?.[0] || 'M'}</span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground tracking-tight">{course.mentor?.full_name}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">COURSE INSTRUCTOR</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-foreground tracking-tighter italic">12k+</p>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">STUDENTS</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-foreground tracking-tighter italic">4.9</p>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">RATING</p>
                                    </div>
                                </div>
                                <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">VIEW ALL COURSES</button>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>


            {/* Preview Modal */}
            <Modal show={previewItem !== null} onClose={() => { setPreviewItem(null); setPreviewStarted(false); }} maxWidth="2xl">
                {previewItem && (
                    <div className="bg-surface rounded-3xl overflow-hidden relative">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                            <div>
                                <h3 className="text-lg font-extrabold text-foreground tracking-tight">{previewItem.title}</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Free Preview</p>
                            </div>
                            <button onClick={() => { setPreviewItem(null); setPreviewStarted(false); }} className="w-9 h-9 bg-surface rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all shadow-sm">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            {previewItem.type === 'video' ? (
                                (previewItem.video_url?.includes('youtube.com') || previewItem.video_url?.includes('youtu.be')) ? (
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-border/50 relative group">
                                        <div id="modal-yt-player" className="w-full h-full"></div>
                                        
                                        {/* Click to Toggle Play/Pause (Background layer) */}
                                        <div 
                                            className="absolute inset-0 z-0 cursor-pointer"
                                            onClick={togglePlay}
                                        ></div>

                                        {/* Custom Thumbnail & Play Button Overlay (Top layer) */}
                                        {!hasStarted && (
                                            <div 
                                                className="absolute inset-0 z-20 cursor-pointer group/overlay transition-all duration-700 overflow-hidden bg-black"
                                                onClick={togglePlay}
                                            >
                                                <img 
                                                    src={previewItem.thumbnail || `https://i.ytimg.com/vi/${getYouTubeId(previewItem.video_url)}/maxresdefault.jpg`} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/overlay:scale-105" 
                                                    alt="Video Thumbnail"
                                                    onError={(e) => {
                                                        const videoId = getYouTubeId(previewItem.video_url);
                                                        if (e.target.src.includes('maxresdefault.jpg')) {
                                                            e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                                        }
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover/overlay:bg-black/30 transition-colors flex items-center justify-center">
                                                    <div className="w-16 h-12 sm:w-20 sm:h-14 bg-primary rounded-[16px] flex items-center justify-center shadow-2xl transition-all duration-300 group-hover/overlay:scale-110">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                            <path d="M8 5v14l11-7z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Custom Overlay Controls */}
                                        <div className={`absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 flex flex-col gap-4 z-10 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
                                            {/* Custom Progress Bar */}
                                            <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/progress overflow-hidden" 
                                                 onClick={(e) => {
                                                     const rect = e.currentTarget.getBoundingClientRect();
                                                     const pos = (e.clientX - rect.left) / rect.width;
                                                     seekTo(pos * duration);
                                                 }}>
                                                <div className="absolute inset-y-0 left-0 bg-primary transition-all pointer-events-none" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <button onClick={togglePlay} className="text-white hover:text-primary transition-colors cursor-pointer">
                                                        {isPlaying ? (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                                        ) : (
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                        )}
                                                    </button>
                                                    
                                                    <div className="text-[10px] font-bold text-white uppercase tracking-widest tabular-nums font-mono">
                                                        {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-border/50 relative flex items-center justify-center">
                                        {previewItem.video_url ? (
                                            <video src={previewItem.video_url} controls autoPlay={previewStarted} poster={previewItem.thumbnail} className="w-full h-full object-contain"></video>
                                        ) : (
                                             <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Video Content Available</div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:font-medium prose-p:leading-relaxed prose-a:text-primary">
                                    {previewItem.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: previewItem.content }} />
                                    ) : (
                                        <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No Article Content Available</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
}
