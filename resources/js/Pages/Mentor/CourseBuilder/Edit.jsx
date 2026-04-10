import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

export default function Edit({ auth, course, categories = [], onedrive_permissions }) {
    const [activeTab, setActiveTab] = useState('curriculum'); // Default to curriculum
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');


    // Form for Basic Info
    const basicInfoForm = useForm({
        _method: 'PUT',
        title: course.title,
        category_id: course.category_id,
        level: course.level || 'beginner',
        price: course.price,
        description: course.description,
        tagline: course.tagline || '',
        status: course.status || 'draft',
        thumbnail: null,
        cover_image: null,
    });

    const updateBasicInfo = (e) => {
        e.preventDefault();
        basicInfoForm.post(route('mentor.courses.update', course.id));
    };

    const toggleStatus = () => {
        const newStatus = basicInfoForm.data.status === 'published' ? 'draft' : 'published';
        basicInfoForm.setData('status', newStatus);
    };

    const addSection = (e) => {
        e.preventDefault();
        router.post(route('mentor.sections.store', course.id), {
            title: newSectionTitle
        }, {
            onSuccess: () => {
                setNewSectionTitle('');
                setIsAddingSection(false);
            }
        });
    };

    const [modalState, setModalState] = useState({ isOpen: false, type: '', payload: null });
    const [modalInputValue, setModalInputValue] = useState('');
    const [quizType, setQuizType] = useState('multiple_choice');
    const [videoSource, setVideoSource] = useState('youtube');
    const [fileSource, setFileSource] = useState('onedrive_shared_link');

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', id: null, title: '' });

    const openModal = (type, payload = {}) => {
        setModalState({ isOpen: true, type, payload });
        setModalInputValue(payload.initialValue || '');
        if (payload.quizType) setQuizType(payload.quizType);
        setVideoSource('youtube'); // Reset to default when opening to avoid stale state
    };
    
    const closeModal = () => {
        setModalState({ isOpen: false, type: '', payload: null });
        setQuizType('multiple_choice');
        setVideoSource('youtube');
    };

    const openDeleteModal = (type, id, title) => {
        setDeleteModal({ isOpen: true, type, id, title });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, type: '', id: null, title: '' });
    };

    const confirmDelete = () => {
        const { type, id } = deleteModal;
        let deleteRoute = '';
        
        if (type === 'section') deleteRoute = route('mentor.sections.destroy', id);
        else if (type === 'lesson') deleteRoute = route('mentor.lessons.destroy', id);
        else if (type === 'quiz') deleteRoute = route('mentor.quizzes.destroy', id);

        if (deleteRoute) {
            router.delete(deleteRoute, {
                onSuccess: closeDeleteModal
            });
        }
    };

    const handleModalSubmit = (e) => {
        e.preventDefault();
        const { type, payload } = modalState;
        if (type === 'addLesson') {
            const finalVideoSource = payload.type === 'video' ? (videoSource || 'youtube') : null;
            const finalFileSource = payload.type === 'file' ? (fileSource || 'onedrive_shared_link') : null;
            console.log("Submitting New Lesson:", {
                title: modalInputValue,
                type: payload.type,
                video_source: finalVideoSource,
                file_source: finalFileSource
            });
            router.post(route('mentor.lessons.store', payload.sectionId), { 
                title: modalInputValue, 
                type: payload.type,
                video_source: finalVideoSource,
                file_source: finalFileSource
            }, { onSuccess: closeModal });
        } else if (type === 'addQuiz') {
            router.post(route('mentor.quizzes.store', payload.sectionId), { title: modalInputValue, type: quizType }, { onSuccess: closeModal });
        } else if (type === 'editSection') {
            router.put(route('mentor.sections.update', payload.sectionId), { title: modalInputValue }, { onSuccess: closeModal });
        } else if (type === 'editLesson') {
            router.put(route('mentor.lessons.update', payload.id), { title: modalInputValue }, { onSuccess: closeModal });
        } else if (type === 'editQuiz') {
            router.put(route('mentor.quizzes.update', payload.id), { title: modalInputValue, type: quizType }, { onSuccess: closeModal });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSectionDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = course.sections.findIndex((s) => s.id === active.id);
            const newIndex = course.sections.findIndex((s) => s.id === over.id);
            const newSections = arrayMove(course.sections, oldIndex, newIndex);
            
            // Optimistic update
            course.sections = newSections;

            router.post(route('mentor.courses.reorder-sections', course.id), {
                section_ids: newSections.map(s => s.id)
            }, { preserveScroll: true });
        }
    };

    const handleItemDragEnd = (section, event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const combinedItems = [
                ...section.lessons.map(l => ({ ...l, sortId: `lesson-${l.id}`, sortType: 'lesson' })),
                ...section.quizzes.map(q => ({ ...q, sortId: `quiz-${q.id}`, sortType: 'quiz' }))
            ].sort((a, b) => a.order - b.order);

            const oldIndex = combinedItems.findIndex((i) => i.sortId === active.id);
            const newIndex = combinedItems.findIndex((i) => i.sortId === over.id);
            const newItemsOrder = arrayMove(combinedItems, oldIndex, newIndex);

            router.post(route('mentor.sections.reorder-items', section.id), {
                items: newItemsOrder.map(i => ({ id: i.id, type: i.sortType }))
            }, { preserveScroll: true });
        }
    };

    // Helper components for sorting
    const SortableItem = ({ id, children }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 50 : 'auto',
            opacity: isDragging ? 0.5 : 1,
        };
        return (
            <div ref={setNodeRef} style={style} className="relative group/sortable">
                <div {...attributes} {...listeners} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover/sortable:opacity-100 transition-opacity z-10 text-gray-400 hover:text-primary">
                    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="2" cy="2" r="2" fill="currentColor"/><circle cx="2" cy="9" r="2" fill="currentColor"/><circle cx="2" cy="16" r="2" fill="currentColor"/>
                        <circle cx="10" cy="2" r="2" fill="currentColor"/><circle cx="10" cy="9" r="2" fill="currentColor"/><circle cx="10" cy="16" r="2" fill="currentColor"/>
                    </svg>
                </div>
                {children}
            </div>
        );
    };

    const SortableSectionWrapper = ({ id, children }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            zIndex: isDragging ? 40 : 'auto',
        };
        return (
            <div ref={setNodeRef} style={style} className="relative group/section-sortable">
                <div {...attributes} {...listeners} className="absolute -left-10 top-8 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover/section-sortable:opacity-100 transition-opacity z-10 text-gray-400 hover:text-primary hidden lg:block">
                    <svg width="16" height="24" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="2" cy="2" r="2" fill="currentColor"/><circle cx="2" cy="9" r="2" fill="currentColor"/><circle cx="2" cy="16" r="2" fill="currentColor"/>
                        <circle cx="10" cy="2" r="2" fill="currentColor"/><circle cx="10" cy="9" r="2" fill="currentColor"/><circle cx="10" cy="16" r="2" fill="currentColor"/>
                    </svg>
                </div>
                {children}
            </div>
        );
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Edit: ${course.title}`} />

            <div className="space-y-10 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Link href={route('mentor.courses.index')} className="text-gray-400 hover:text-primary transition-colors text-sm font-bold">Courses</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500 text-sm font-bold">Edit Course</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{course.title}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                                course.status === 'published' ? 'bg-accent-lime text-black' : 'bg-amber-500 text-white'
                            }`}>
                                Status: {course.status}
                            </span>
                            {course.status === 'draft' && (
                                <p className="text-[10px] text-gray-400 font-bold uppercase italic">Ready to go live?</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted rounded-full w-fit">
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all ${
                            activeTab === 'curriculum' ? 'bg-surface text-primary shadow-sm' : 'text-foreground/40 hover:text-foreground'
                        }`}
                    >
                        Curriculum
                    </button>
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all ${
                            activeTab === 'basic' ? 'bg-surface text-primary shadow-sm' : 'text-foreground/40 hover:text-foreground'
                        }`}
                    >
                        Basic Info
                    </button>
                    <Link
                        href={route('mentor.courses.certificate-template', course.id)}
                        className={`px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all ${
                            activeTab === 'certificate' ? 'bg-surface text-primary shadow-sm' : 'text-foreground/40 hover:text-foreground'
                        }`}
                    >
                        Certificate Template
                    </Link>
                </div>

                {/* Tab Content: Curriculum */}
                {activeTab === 'curriculum' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-foreground">Course Content</h2>
                            {!isAddingSection && (
                                <button
                                    onClick={() => setIsAddingSection(true)}
                                    className="text-sm font-extrabold text-primary hover:underline"
                                >
                                    + Add New Section
                                </button>
                            )}
                        </div>

                        {isAddingSection && (
                            <form onSubmit={addSection} className="bg-white p-8 rounded-[32px] border-2 border-dashed border-primary/20 flex flex-col sm:flex-row gap-6 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-extrabold text-foreground uppercase tracking-widest px-1">Section Title</label>
                                    <input
                                        autoFocus
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold"
                                        placeholder="e.g. Introduction to the course"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingSection(false)}
                                        className="px-6 py-4 text-sm font-extrabold text-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary text-white px-8 py-4 rounded-2xl text-sm font-extrabold shadow-lg shadow-primary/20"
                                    >
                                        Add Section
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-6">
                            <DndContext 
                                sensors={sensors} 
                                collisionDetection={closestCenter} 
                                onDragEnd={handleSectionDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext items={course.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                    {course.sections?.map((section, sIdx) => (
                                        <SortableSectionWrapper key={section.id} id={section.id}>
                                            <div className="bg-surface rounded-[40px] border border-border shadow-xl shadow-gray-200/10 dark:shadow-none overflow-hidden hover:border-primary/20 transition-colors group/section">
                                                <div className="bg-muted/50 px-10 py-6 flex items-center justify-between border-b border-border">
                                                    <h3 className="font-extrabold text-foreground flex items-center gap-3">
                                                        <span className="text-foreground/30">Section {sIdx + 1}:</span> 
                                                        {section.title}
                                                        <button onClick={() => openModal('editSection', { sectionId: section.id, initialValue: section.title })} className="p-2 rounded-lg hover:bg-primary/10 text-foreground/20 hover:text-primary transition-all">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                        </button>
                                                    </h3>
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => openModal('addLesson', { sectionId: section.id, type: 'video' })} className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline">🎥 Video</button>
                                                        <button onClick={() => openModal('addLesson', { sectionId: section.id, type: 'article' })} className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline">📄 Article</button>
                                                        <button onClick={() => openModal('addLesson', { sectionId: section.id, type: 'file' })} className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline">📎 File</button>
                                                        <button onClick={() => openModal('addQuiz', { sectionId: section.id })} className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline">🧠 Quiz</button>
                                                        <span className="w-px h-4 bg-border"></span>
                                                        <button 
                                                            onClick={() => openDeleteModal('section', section.id, section.title)}
                                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-foreground/20 hover:text-rose-500 transition-all cursor-pointer"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-3">
                                                    {(() => {
                                                        const combinedItems = [
                                                            ...(section.lessons || []).map(l => ({ ...l, sortId: `lesson-${l.id}`, sortType: 'lesson' })),
                                                            ...(section.quizzes || []).map(q => ({ ...q, sortId: `quiz-${q.id}`, sortType: 'quiz' }))
                                                        ].sort((a, b) => a.order - b.order);

                                                        if (combinedItems.length === 0) {
                                                            return <p className="text-center py-6 text-xs font-bold text-gray-300 uppercase tracking-widest">No content in this section</p>;
                                                        }

                                                        return (
                                                            <DndContext 
                                                                sensors={sensors} 
                                                                collisionDetection={closestCenter} 
                                                                onDragEnd={(e) => handleItemDragEnd(section, e)}
                                                                modifiers={[restrictToVerticalAxis]}
                                                            >
                                                                <SortableContext items={combinedItems.map(i => i.sortId)} strategy={verticalListSortingStrategy}>
                                                                    <div className="space-y-3">
                                                                        {combinedItems.map((item, index) => {
                                                                            if (item.sortType === 'lesson') {
                                                                                return (
                                                                                    <SortableItem key={item.sortId} id={item.sortId}>
                                                                                        <div className="flex items-center justify-between bg-surface border border-border p-5 pl-12 rounded-3xl hover:border-primary/30 transition-all group/item">
                                                                                            <div className="flex items-center gap-4">
                                                                                                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-gray-400">{index + 1}</span>
                                                                                                {item.thumbnail ? (
                                                                                                    <img src={item.thumbnail} className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" alt="" />
                                                                                                ) : (
                                                                                                    <span className="text-xl">
                                                                                                        {item.type === 'video' ? '🎥' : item.type === 'file' ? '📎' : '📄'}
                                                                                                    </span>
                                                                                                )}
                                                                                                <div className="flex flex-col">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span className="text-sm font-bold text-foreground/70 group-hover/item:text-foreground transition-colors">{item.title}</span>
                                                                                                        <button onClick={() => openModal('editLesson', { id: item.id, initialValue: item.title })} className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded hover:bg-primary/10 hover:text-primary">
                                                                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                                                        {item.type} {item.duration_minutes ? `• ${item.duration_minutes}m` : ''}
                                                                                                        {item.is_preview ? <span className="ml-2 text-blue-500 font-extrabold tracking-tighter italic">Preview On</span> : ''}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <button
                                                                                                    onClick={() => router.patch(route('mentor.lessons.toggle-preview', item.id))}
                                                                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                                                                        item.is_preview 
                                                                                                            ? 'bg-blue-50 text-blue-500 shadow-inner' 
                                                                                                            : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'
                                                                                                    }`}
                                                                                                    title={item.is_preview ? "Disable Preview" : "Enable Preview"}
                                                                                                >
                                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                                                                                                    </svg>
                                                                                                </button>
                                                                                                <Link 
                                                                                                    href={route('mentor.lessons.edit', item.id)} 
                                                                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                                                                                >
                                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                                                    Edit Content
                                                                                                </Link>
                                                                                                <button 
                                                                                                    onClick={() => openDeleteModal('lesson', item.id, item.title)}
                                                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground/20 hover:bg-rose-500/10 hover:text-rose-500 transition-all cursor-pointer"
                                                                                                >
                                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </SortableItem>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <SortableItem key={item.sortId} id={item.sortId}>
                                                                                        <div className="flex items-center justify-between bg-accent-lime/5 border border-accent-lime/10 p-5 pl-12 rounded-3xl hover:border-accent-lime/30 transition-all group">
                                                                                            <div className="flex items-center gap-4">
                                                                                                <span className="w-8 h-8 rounded-full bg-accent-lime/20 flex items-center justify-center text-[10px] font-bold text-accent-lime">Q</span>
                                                                                                <span className="text-xl">🧠</span>
                                                                                                <div className="flex flex-col">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span className="text-sm font-bold text-gray-600 group-hover:text-foreground transition-colors">{item.title}</span>
                                                                                                        <button onClick={() => openModal('editQuiz', { id: item.id, initialValue: item.title, quizType: item.type })} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] hover:text-accent-lime">✏️</button>
                                                                                                    </div>
                                                                                                    <span className="text-[10px] text-accent-lime font-bold uppercase tracking-widest">Quiz • {item.type.replace('_', ' ')}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <Link 
                                                                                                    href={route('mentor.quizzes.edit', item.id)} 
                                                                                                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-accent-lime text-black text-[10px] font-extrabold uppercase tracking-widest hover:bg-accent-lime/90 hover:scale-105 transition-all shadow-lg shadow-accent-lime/20"
                                                                                                >
                                                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                                                    Edit Questions
                                                                                                </Link>
                                                                                                <button 
                                                                                                    onClick={() => openDeleteModal('quiz', item.id, item.title)}
                                                                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-lime/40 hover:text-red-500 transition-colors cursor-pointer"
                                                                                                >
                                                                                                    🗑️
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </SortableItem>
                                                                                );
                                                                            }
                                                                        })}
                                                                    </div>
                                                                </SortableContext>
                                                            </DndContext>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </SortableSectionWrapper>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                )}

                {/* Tab Content: Basic Info */}
                {activeTab === 'basic' && (
                    <form onSubmit={updateBasicInfo} className="bg-white rounded-[40px] p-10 sm:p-12 shadow-2xl shadow-gray-200/20 border border-gray-100 space-y-10 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Title</label>
                                <input
                                    type="text"
                                    value={basicInfoForm.data.title}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold"
                                    onChange={(e) => basicInfoForm.setData('title', e.target.value)}
                                />
                                <InputError message={basicInfoForm.errors.title} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Category</label>
                                <select
                                    value={basicInfoForm.data.category_id}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                                    onChange={(e) => basicInfoForm.setData('category_id', e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={basicInfoForm.errors.category_id} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Level</label>
                                <select
                                    value={basicInfoForm.data.level}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold appearance-none"
                                    onChange={(e) => basicInfoForm.setData('level', e.target.value)}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                <InputError message={basicInfoForm.errors.level} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Price (IDR)</label>
                                <input
                                    type="number"
                                    value={basicInfoForm.data.price}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold"
                                    onChange={(e) => basicInfoForm.setData('price', e.target.value)}
                                />
                                <InputError message={basicInfoForm.errors.price} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Status</label>
                                <div className="flex items-center gap-4 h-[56px]">
                                    <button
                                        type="button"
                                        onClick={toggleStatus}
                                        className={`flex-1 h-full rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all border-2 ${
                                            basicInfoForm.data.status === 'published'
                                                ? 'bg-accent-lime/10 border-accent-lime text-foreground'
                                                : 'bg-muted border-transparent text-gray-400'
                                        }`}
                                    >
                                        {basicInfoForm.data.status === 'published' ? '✅ Published' : '📁 Set as Published'}
                                    </button>
                                </div>
                                <InputError message={basicInfoForm.errors.status} />
                            </div>

                            {/* Thumbnail */}
                            <div className="col-span-2 space-y-4">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Thumbnail (Square/Card)</label>
                                <div className="flex flex-col sm:flex-row gap-6 items-start bg-muted/30 p-6 rounded-[32px] border-2 border-dashed border-gray-100">
                                    <div className="w-40 aspect-video rounded-2xl overflow-hidden border border-gray-200 shrink-0 bg-white">
                                        {basicInfoForm.data.thumbnail ? (
                                            <img src={URL.createObjectURL(basicInfoForm.data.thumbnail)} className="w-full h-full object-cover" />
                                        ) : course.thumbnail ? (
                                            <img src={course.thumbnail} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">🖼️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="file"
                                            className="w-full text-sm font-bold text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-extrabold file:bg-primary file:text-white hover:file:bg-primary-hover transition-all"
                                            onChange={(e) => basicInfoForm.setData('thumbnail', e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <p className="text-[10px] text-gray-400 px-1 italic font-bold">Recommended: 800x600. Max size: 2MB.</p>
                                        <InputError message={basicInfoForm.errors.thumbnail} />
                                    </div>
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div className="col-span-2 space-y-4">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Banner/Sampul (Wide)</label>
                                <div className="flex flex-col gap-6 bg-muted/30 p-6 rounded-[32px] border-2 border-dashed border-gray-100">
                                    <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 bg-white">
                                        {basicInfoForm.data.cover_image ? (
                                            <img src={URL.createObjectURL(basicInfoForm.data.cover_image)} className="w-full h-full object-cover" />
                                        ) : course.cover_image ? (
                                            <img src={course.cover_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">🏞️</div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="file"
                                            className="w-full text-sm font-bold text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-extrabold file:bg-primary file:text-white hover:file:bg-primary-hover transition-all"
                                            onChange={(e) => basicInfoForm.setData('cover_image', e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <p className="text-[10px] text-gray-400 px-1 italic font-bold">Recommended: 1920x820. Max size: 5MB.</p>
                                        <InputError message={basicInfoForm.errors.cover_image} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Description</label>
                            <textarea
                                value={basicInfoForm.data.description}
                                rows="6"
                                className="w-full bg-muted border-none rounded-[32px] px-8 py-6 text-sm font-medium leading-relaxed"
                                onChange={(e) => basicInfoForm.setData('description', e.target.value)}
                            ></textarea>
                            <InputError message={basicInfoForm.errors.description} />
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={basicInfoForm.processing}
                                className="bg-primary text-white px-12 py-5 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50"
                            >
                                {basicInfoForm.processing ? 'Updating...' : 'Save All Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <Modal show={modalState.isOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={handleModalSubmit} className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shadow-inner">
                            {modalState.type === 'addLesson' && (
                                modalState.payload?.type === 'video' ? '🎥' : 
                                modalState.payload?.type === 'file' ? '📎' : '📄'
                            )}
                            {modalState.type === 'addQuiz' && '🧠'}
                            {modalState.type === 'editSection' && '✏️'}
                        </div>
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                            {modalState.type === 'addLesson' && `Add ${
                                modalState.payload?.type === 'video' ? 'Video' : 
                                modalState.payload?.type === 'file' ? 'File' : 'Article'
                            }`}
                            {modalState.type === 'addQuiz' && 'Add Quiz'}
                            {modalState.type === 'editSection' && 'Edit Section'}
                        </h2>
                    </div>
                    
                    <div className="space-y-2 mb-10">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">
                            {modalState.type === 'editSection' ? 'Section Title' : 'Title'}
                        </label>
                        <input
                            type="text"
                            value={modalInputValue}
                            onChange={(e) => setModalInputValue(e.target.value)}
                            className="w-full bg-muted border-none rounded-3xl px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
                            placeholder="Enter title here..."
                            required
                            autoFocus
                        />
                    </div>

                    {(modalState.type === 'addQuiz' || modalState.type === 'editQuiz') && (
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Quiz Type</label>
                                {modalState.type === 'editQuiz' && (
                                    <span className="text-[10px] text-yellow-500 font-bold italic">Changing type might affect how content is displayed.</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setQuizType('multiple_choice')}
                                    className={`p-4 rounded-3xl border-2 text-left transition-all ${quizType === 'multiple_choice' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'}`}
                                >
                                    <div className="text-xl mb-2">🧩</div>
                                    <p className="text-xs font-bold">Multiple Choice</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setQuizType('submission')}
                                    className={`p-4 rounded-3xl border-2 text-left transition-all ${quizType === 'submission' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'}`}
                                >
                                    <div className="text-xl mb-2">📥</div>
                                    <p className="text-xs font-bold">Assignment/Submission</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {modalState.type === 'addLesson' && modalState.payload?.type === 'video' && (
                        <div className="space-y-4 mb-10">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Video Source</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'youtube', label: 'YouTube', icon: '📺', permission: true },
                                    { id: 'onedrive_shared_link', label: 'OneDrive Link', icon: '🔗', permission: onedrive_permissions?.can_use_shared_link },
                                    { id: 'onedrive_upload', label: 'Upload', icon: '☁️', permission: onedrive_permissions?.can_upload },
                                    { id: 'onedrive_library', label: 'Library', icon: '📂', permission: onedrive_permissions?.can_use_library },
                                ].filter(tab => tab.permission).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setVideoSource(tab.id)}
                                        className={`p-4 rounded-[24px] border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                                            videoSource === tab.id 
                                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                                                : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'
                                        }`}
                                    >
                                        <div className="text-xl mb-3">{tab.icon}</div>
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {modalState.type === 'addLesson' && modalState.payload?.type === 'file' && (
                        <div className="space-y-4 mb-10">
                            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">File Source</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'onedrive_shared_link', label: 'OneDrive Link', icon: '🔗', permission: onedrive_permissions?.can_use_shared_link },
                                    { id: 'onedrive_upload', label: 'Upload', icon: '☁️', permission: onedrive_permissions?.can_upload },
                                    { id: 'onedrive_library', label: 'Library', icon: '📂', permission: onedrive_permissions?.can_use_library },
                                ].filter(tab => tab.permission).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setFileSource(tab.id)}
                                        className={`p-4 rounded-[24px] border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                                            fileSource === tab.id 
                                                ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                                                : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'
                                        }`}
                                    >
                                        <div className="text-xl mb-3">{tab.icon}</div>
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">{tab.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={closeModal} 
                            className="px-8 py-4 rounded-full text-xs font-extrabold text-gray-400 uppercase tracking-widest hover:text-foreground hover:bg-muted transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-primary text-white px-10 py-4 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.05] active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteModal.isOpen} onClose={closeDeleteModal} maxWidth="md">
                <div className="p-10 text-center space-y-8">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center text-4xl mx-auto shadow-inner animate-pulse">
                        🗑️
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Confirm Deletion</h2>
                        <p className="text-sm font-bold text-gray-400">
                            Are you sure you want to delete <span className="text-foreground">"{deleteModal.title}"</span>? 
                            This action cannot be undone and all associated content will be lost.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={closeDeleteModal} 
                            className="flex-1 py-4 rounded-full text-xs font-extrabold text-gray-400 uppercase tracking-widest hover:text-foreground transition-all"
                        >
                            No, Keep it
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmDelete} 
                            className="flex-1 bg-red-500 text-white py-4 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-600 hover:scale-[1.05] active:scale-95 transition-all"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
