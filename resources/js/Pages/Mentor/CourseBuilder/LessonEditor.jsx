import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import Toast from '@/Components/Toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


export default function LessonEditor({ auth, lesson, onedrive_permissions, initial_folder_id }) {
    console.log("Lesson Data Loaded:", lesson);
    const initialSource = lesson.type === 'file' 
        ? ((lesson.file_source && lesson.file_source !== '') ? lesson.file_source : 'onedrive_shared_link')
        : ((lesson.video_source && lesson.video_source !== '') ? lesson.video_source : 'youtube');
    const [activeSource, setActiveSource] = useState(initialSource);

    // Sync activeSource when lesson prop changes (crucial for Inertia navigation)
    useEffect(() => {
        if (lesson.type === 'file' && lesson.file_source && lesson.file_source !== '') {
            setActiveSource(lesson.file_source);
            setData('file_source', lesson.file_source);
        } else if (lesson.type === 'video' && lesson.video_source && lesson.video_source !== '') {
            setActiveSource(lesson.video_source);
            setData('video_source', lesson.video_source);
        }
    }, [lesson.id, lesson.video_source, lesson.file_source, lesson.type]);
    
    const { data, setData, post, processing, errors, transform } = useForm({
        duration_minutes: lesson.duration_minutes || '',
        content: lesson.content || '',
        video_source: lesson.video_source || '',
        video_id: lesson.video_id || '',
        video_url: lesson.video_url || '',
        file_source: lesson.file_source || '',
        file_id: lesson.file_id || '',
        file_url: lesson.file_url || '',
        file_name: lesson.file_name || '',
        mime_type: lesson.mime_type || '',
        thumbnail: null,
        _method: 'PUT'
    });

    const uploadForm = useForm({
        video: null,
    });

    const [thumbnailPreview, setThumbnailPreview] = useState(lesson.thumbnail);
    const [uploadProgress, setUploadProgress] = useState(0);

    // OneDrive Library State
    const [files, setFiles] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(initial_folder_id || 'root');
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [navStack, setNavStack] = useState(initial_folder_id && initial_folder_id !== 'root' ? ['root', initial_folder_id] : ['root']);

    // Shared Link State
    const [sharedLink, setSharedLink] = useState((lesson.video_source === 'onedrive_shared_link' ? lesson.video_url : '') || (lesson.file_source === 'onedrive_shared_link' ? lesson.file_url : ''));
    const [isResolvingLink, setIsResolvingLink] = useState(false);
    const [toast, setToast] = useState(null);


    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (500MB limit matching server)
        if (file.size > 500 * 1024 * 1024) {
            setToast({ message: 'File is too large (max 500MB).', type: 'error' });
            return;
        }

        router.post(route('mentor.lessons.upload-video', lesson.id), {
            video: file,
            _method: 'POST'
        }, {
            preserveScroll: true,
            forceFormData: true,
            onStart: () => {
                setToast({ message: 'Uploading to server...', type: 'info' });
            },
            onProgress: (progress) => {
                setUploadProgress(progress.percentage);
                if (progress.percentage === 100) {
                    setToast({ message: 'Transmitting to OneDrive, please wait...', type: 'info' });
                }
            },
            onSuccess: () => {
                setUploadProgress(0);
                setToast({ message: 'Video uploaded and processed successfully!', type: 'success' });
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors)[0] || 'Upload failed. Check server limits.';
                setToast({ message: errorMsg, type: 'error' });
            }
        });
    };

    const fetchFiles = async (folderId = 'root') => {
        setIsLoadingFiles(true);
        try {
            const response = await axios.get(route('mentor.onedrive.files', folderId));
            setFiles(response.data.items);
            setCurrentFolderId(response.data.current_id);
        } catch (err) {
            console.error('Failed to fetch OneDrive files', err);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const navigateTo = (folderId) => {
        setNavStack([...navStack, folderId]);
        fetchFiles(folderId);
    };

    const navigateBack = () => {
        if (navStack.length > 1) {
            const newStack = [...navStack];
            newStack.pop();
            const prevFolderId = newStack[newStack.length - 1];
            setNavStack(newStack);
            fetchFiles(prevFolderId);
        }
    };

    const selectFile = (file) => {
        setData({
            ...data,
            video_source: 'onedrive_library',
            video_id: file.id,
            video_url: null
        });
    };

    const selectFileItem = (file) => {
        setData({
            ...data,
            file_source: 'onedrive_library',
            file_id: file.id,
            file_url: null,
            file_name: file.name,
            mime_type: file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            setToast({ message: 'File is too large (max 50MB).', type: 'error' });
            return;
        }

        router.post(route('mentor.lessons.upload-file', lesson.id), {
            file: file,
            _method: 'POST'
        }, {
            preserveScroll: true,
            forceFormData: true,
            onStart: () => {
                setToast({ message: 'Uploading file to server...', type: 'info' });
            },
            onProgress: (progress) => {
                setUploadProgress(progress.percentage);
                if (progress.percentage === 100) {
                    setToast({ message: 'Transmitting to OneDrive, please wait...', type: 'info' });
                }
            },
            onSuccess: () => {
                setUploadProgress(0);
                setToast({ message: 'File uploaded and processed successfully!', type: 'success' });
            },
            onError: (errors) => {
                const errorMsg = Object.values(errors)[0] || 'Upload failed.';
                setToast({ message: errorMsg, type: 'error' });
            }
        });
    };

    const resolveSharedLink = async () => {
        if (!sharedLink) return;
        setIsResolvingLink(true);
        try {
            const response = await axios.post(route('mentor.onedrive.resolve'), { url: sharedLink });
            
            if (lesson.type === 'file') {
                setData(data => ({
                    ...data,
                    file_source: 'onedrive_shared_link',
                    file_id: response.data.id,
                    file_url: sharedLink
                }));
            } else {
                setData(data => ({
                    ...data,
                    video_source: 'onedrive_shared_link',
                    video_id: response.data.id,
                    video_url: sharedLink
                }));
            }
            
            setToast({ message: `Resolved: ${response.data.name}`, type: 'success' });
        } catch (err) {
            console.error('Resolve Error:', err.response?.data || err.message);
            setToast({ 
                message: err.response?.data?.error || 'Failed to resolve sharing link.', 
                type: 'error' 
            });
        } finally {
            setIsResolvingLink(false);
        }
    };

    useEffect(() => {
        setData('video_source', activeSource);
        if (activeSource === 'onedrive_library' && files.length === 0) {
            fetchFiles(currentFolderId);
        }
    }, [activeSource]);

    useEffect(() => {
        if (activeSource === 'onedrive_shared_link') {
            setData('video_url', sharedLink);
        }
    }, [sharedLink, activeSource]);


    const submit = (e) => {
        e.preventDefault();
        
        // Use transform to guarantee the data being sent matches the current UI state
        // This avoids race conditions with React's asynchronous setData
        post(route('mentor.lessons.update', lesson.id), {
            onBefore: () => {
                // You can also use transform() here or earlier. 
                // Using transform() is better as it's the standard Inertia way.
            },
            onSuccess: () => setToast({ message: 'Lesson updated successfully!', type: 'success' }),
            onError: () => setToast({ message: 'Failed to update lesson. Please check the form.', type: 'error' }),
        });
    };

    // Define the transformation logic to ensure state is synced before POST
    useEffect(() => {
        transform((data) => ({
            ...data,
            video_source: lesson.type === 'video' ? activeSource : data.video_source,
            video_url: lesson.type === 'video' && activeSource === 'onedrive_shared_link' ? sharedLink : data.video_url,
            file_source: lesson.type === 'file' ? activeSource : data.file_source,
            file_url: lesson.type === 'file' && activeSource === 'onedrive_shared_link' ? sharedLink : data.file_url,
        }));
    }, [activeSource, sharedLink, transform]);


    const tabs = [
        { id: 'youtube', label: 'YouTube Link', icon: '📺' },
        ...(onedrive_permissions?.can_use_shared_link ? [{ id: 'onedrive_shared_link', label: 'OneDrive Shared Link', icon: '🔗' }] : []),
        ...(onedrive_permissions?.can_upload ? [{ id: 'onedrive_upload', label: 'Upload to OneDrive', icon: '☁️' }] : []),
        ...(onedrive_permissions?.can_use_library ? [{ id: 'onedrive_library', label: 'OneDrive Library', icon: '📂' }] : []),
    ];

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Edit Lesson: ${lesson.title}`} />

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Link href={route('mentor.courses.edit', lesson.section.course_id)} className="text-gray-400 hover:text-primary transition-colors text-sm font-bold">Curriculum</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500 text-sm font-bold">Edit Lesson</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{lesson.title}</h1>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-[40px] p-10 sm:p-12 shadow-2xl shadow-gray-200/20 border border-gray-100 space-y-12">
                    
                    {/* General Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-8 rounded-[32px] border border-gray-100">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1 block">Lesson Title</label>
                            <input
                                type="text"
                                value={lesson.title}
                                disabled
                                className="w-full bg-white/50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                                placeholder="Pelajaran"
                            />
                            <p className="text-[10px] text-gray-400 font-bold px-1 italic">* Title can be changed in the curriculum view</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1 block">Duration (Minutes)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={data.duration_minutes}
                                    className="w-full bg-white border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none"
                                    placeholder="e.g. 15"
                                    onChange={(e) => setData('duration_minutes', e.target.value)}
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">MIN</span>
                            </div>
                            <InputError message={errors.duration_minutes} />
                        </div>
                    </div>
                    
                    {lesson.type === 'video' && (
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1 block mb-4">Video Source Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveSource(tab.id);
                                                setData('video_source', tab.id);
                                            }}
                                            className={`p-6 rounded-[32px] border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                                                activeSource === tab.id 
                                                    ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10' 
                                                    : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'
                                            }`}
                                        >
                                            <div className="text-2xl mb-4">{tab.icon}</div>
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{tab.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                                <div className="space-y-4">
                                    {activeSource === 'youtube' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">YouTube Video URL</label>
                                            <input
                                                type="url"
                                                value={data.video_url}
                                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                onChange={(e) => setData('video_url', e.target.value)}
                                            />
                                            <InputError message={errors.video_url} />
                                        </div>
                                    )}

                                    {activeSource === 'onedrive_shared_link' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">OneDrive Shared URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={sharedLink}
                                                    className="flex-1 bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                                    placeholder="Paste OneDrive share link..."
                                                    onChange={(e) => setSharedLink(e.target.value)}
                                                />
                                                <button 
                                                    type="button"
                                                    disabled={isResolvingLink}
                                                    onClick={resolveSharedLink}
                                                    className="bg-primary text-white px-6 rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    {isResolvingLink ? '...' : 'LINK'}
                                                </button>
                                            </div>
                                            {data.video_id && data.video_source === 'onedrive_shared_link' && (
                                                <p className="text-[10px] text-green-500 font-bold px-2">✓ Link resolved to ID: {data.video_id}</p>
                                            )}
                                            <InputError message={errors.video_url} />
                                        </div>
                                    )}

                                    {activeSource === 'onedrive_upload' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest">Upload to OneDrive</label>
                                                {data.video_id && data.video_source === 'onedrive_upload' && (
                                                    <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-1 rounded-full">✓ AKTIF</span>
                                                )}
                                            </div>

                                            {/* Logic to show Active Video or Processing state */}
                                            {(data.video_id && data.video_source === 'onedrive_upload') ? (
                                                <div className="relative bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
                                                    {/* Tombol Silang to Reset */}
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setData('video_id', null);
                                                            setData('video_url', null);
                                                        }}
                                                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
                                                        title="Ganti Video"
                                                    >
                                                        ✕
                                                    </button>

                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">🎬</div>
                                                    <div>
                                                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Video Berhasil Diupload</p>
                                                        <p className="text-[10px] text-gray-500 font-bold mb-4 italic">ID: {data.video_id}</p>
                                                        <div className="flex justify-center">
                                                            <div className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 uppercase">
                                                                Selected & Active
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 mt-4 font-bold uppercase tracking-tighter">* Klik [Save All Changes] di bawah untuk menyimpan pilihan ini</p>
                                                    </div>
                                                </div>
                                            ) : (lesson.video_source === 'onedrive_upload' && lesson.video_id === 'PROCESSING') ? (
                                                <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                                     <div className="text-3xl mb-3 animate-bounce">⏳</div>
                                                     <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Video Sedang Diproses</p>
                                                     <p className="text-[10px] text-amber-500 font-bold max-w-[200px]">
                                                        Server sedang mengirim video Bapak ke OneDrive. Silakan refresh halaman dalam 1-2 menit.
                                                     </p>
                                                     <button 
                                                        type="button" 
                                                        onClick={() => window.location.reload()}
                                                        className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-amber-200 hover:scale-105 transition-all"
                                                     >
                                                        CEK STATUS SEKARANG
                                                     </button>
                                                </div>
                                            ) : (
                                                <div 
                                                    className="relative group bg-muted border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-primary/50 transition-all cursor-pointer"
                                                    onClick={() => !uploadForm.processing && document.getElementById('video-upload-input').click()}
                                                >
                                                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📤</span>
                                                    <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">
                                                        {uploadForm.processing ? 'Uploading to Server...' : 'Drop or Browse Video'}
                                                    </span>
                                                    {uploadProgress > 0 && (
                                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl">
                                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                                                                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                            </div>
                                                            <span className="text-sm font-black text-primary">{Math.round(uploadProgress)}%</span>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-2">Uploading to Server...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <input id="video-upload-input" type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                                            <InputError message={errors.video} />
                                        </div>
                                    )}

                                    {activeSource === 'onedrive_library' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest">OneDrive Browser</label>
                                                {navStack.length > 1 && (
                                                    <button type="button" onClick={navigateBack} className="text-[10px] font-black text-primary hover:underline">← BACK</button>
                                                )}
                                            </div>
                                            <div className="bg-muted rounded-2xl border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto">
                                                {isLoadingFiles ? (
                                                    <div className="p-10 text-center text-xs font-bold text-gray-400 animate-pulse">Loading files...</div>
                                                ) : (
                                                    <div className="divide-y divide-gray-100">
                                                        {files.length === 0 && <div className="p-10 text-center text-xs text-gray-400 font-bold">Folder is empty</div>}
                                                        {files.map((file) => (
                                                            <div key={file.id} 
                                                                className={`p-4 flex items-center justify-between group transition-colors ${file.is_folder ? 'cursor-pointer hover:bg-white' : ''}`}
                                                                onClick={() => file.is_folder && navigateTo(file.id)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl">{file.is_folder ? '📁' : '🎬'}</span>
                                                                    <div>
                                                                        <p className={`text-xs font-bold truncate max-w-[150px] ${data.video_id === file.id ? 'text-primary' : ''}`}>{file.name}</p>
                                                                        <p className="text-[9px] text-gray-400 font-medium">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                                                    </div>
                                                                </div>
                                                                {!file.is_folder && file.is_video && (
                                                                    <button 
                                                                        type="button" 
                                                                        onClick={(e) => { e.stopPropagation(); selectFile(file); }}
                                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${data.video_id === file.id ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-primary hover:text-white'}`}
                                                                    >
                                                                        {data.video_id === file.id ? 'SELECTED' : 'SELECT'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Lesson Video Thumbnail</label>
                                    <div 
                                        className="relative aspect-video rounded-3xl bg-muted overflow-hidden border-2 border-dashed border-gray-200 hover:border-primary/50 transition-all cursor-pointer group"
                                        onClick={() => document.getElementById('lesson-thumbnail').click()}
                                    >
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail Preview" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                <span className="text-3xl mb-2">🖼️</span>
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest">Upload Thumbnail</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">Replace Thumbnail</span>
                                        </div>
                                    </div>
                                    <input id="lesson-thumbnail" type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                                    <InputError message={errors.thumbnail} />
                                </div>
                            </div>
                        </div>
                    )}

                    {lesson.type === 'file' && (
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1 block mb-4">File Source Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        ...(onedrive_permissions?.can_use_shared_link ? [{ id: 'onedrive_shared_link', label: 'OneDrive Shared Link', icon: '🔗' }] : []),
                                        ...(onedrive_permissions?.can_upload ? [{ id: 'onedrive_upload', label: 'Upload to OneDrive', icon: '☁️' }] : []),
                                        ...(onedrive_permissions?.can_use_library ? [{ id: 'onedrive_library', label: 'OneDrive Library', icon: '📂' }] : []),
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveSource(tab.id);
                                                setData('file_source', tab.id);
                                            }}
                                            className={`p-6 rounded-[32px] border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                                                activeSource === tab.id 
                                                    ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10' 
                                                    : 'border-gray-50 bg-muted/50 text-gray-400 hover:border-primary/20 hover:bg-white'
                                            }`}
                                        >
                                            <div className="text-2xl mb-4">{tab.icon}</div>
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{tab.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activeSource === 'onedrive_shared_link' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">OneDrive Shared URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={sharedLink}
                                                className="flex-1 bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                                placeholder="Paste OneDrive share link for PDF/Image/Text..."
                                                onChange={(e) => setSharedLink(e.target.value)}
                                            />
                                            <button 
                                                type="button"
                                                disabled={isResolvingLink}
                                                onClick={resolveSharedLink}
                                                className="bg-primary text-white px-6 rounded-2xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                {isResolvingLink ? '...' : 'LINK'}
                                            </button>
                                        </div>
                                        {data.file_id && data.file_source === 'onedrive_shared_link' && (
                                            <p className="text-[10px] text-green-500 font-bold px-2">✓ Link resolved to ID: {data.file_id}</p>
                                        )}
                                        <p className="text-[9px] text-gray-400 font-bold px-2">Supported: PDF, TXT, JPG, PNG, GIF, WebP</p>
                                    </div>
                                )}

                                {activeSource === 'onedrive_upload' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest">Upload File to OneDrive</label>
                                            {data.file_id && data.file_source === 'onedrive_upload' && (
                                                <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-1 rounded-full">✓ AKTIF</span>
                                            )}
                                        </div>

                                        {(data.file_id && data.file_source === 'onedrive_upload') ? (
                                            <div className="relative bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setData('file_id', null);
                                                        setData('file_url', null);
                                                    }}
                                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
                                                    title="Ganti File"
                                                >
                                                    ✕
                                                </button>
                                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">📎</div>
                                                <div>
                                                    <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">File Berhasil Diupload</p>
                                                    <p className="text-[10px] text-gray-500 font-bold mb-4 italic">ID: {data.file_id}</p>
                                                    <div className="flex justify-center">
                                                        <div className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-primary/20 uppercase">
                                                            Selected & Active
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-gray-400 mt-4 font-bold uppercase tracking-tighter">* Klik [Save All Changes] di bawah untuk menyimpan</p>
                                                </div>
                                            </div>
                                        ) : (lesson.file_source === 'onedrive_upload' && lesson.file_id === 'PROCESSING') ? (
                                            <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                                 <div className="text-3xl mb-3 animate-bounce">⏳</div>
                                                 <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">File Sedang Diproses</p>
                                                 <p className="text-[10px] text-amber-500 font-bold max-w-[200px]">
                                                    Server sedang mengirim file ke OneDrive. Silakan refresh dalam 1-2 menit.
                                                 </p>
                                                 <button 
                                                    type="button" 
                                                    onClick={() => window.location.reload()}
                                                    className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-amber-200 hover:scale-105 transition-all"
                                                 >
                                                    CEK STATUS SEKARANG
                                                 </button>
                                            </div>
                                        ) : (
                                            <div 
                                                className="relative group bg-muted border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-primary/50 transition-all cursor-pointer"
                                                onClick={() => !uploadForm.processing && document.getElementById('file-upload-input').click()}
                                            >
                                                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📤</span>
                                                <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">
                                                    {uploadForm.processing ? 'Uploading...' : 'Browse File (PDF, Image, TXT)'}
                                                </span>
                                                {uploadProgress > 0 && (
                                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl">
                                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                                                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                        </div>
                                                        <span className="text-sm font-black text-primary">{Math.round(uploadProgress)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <input id="file-upload-input" type="file" className="hidden" accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileUpload} />
                                        <InputError message={errors.file} />
                                    </div>
                                )}

                                {activeSource === 'onedrive_library' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest">OneDrive Browser</label>
                                            {navStack.length > 1 && (
                                                <button type="button" onClick={navigateBack} className="text-[10px] font-black text-primary hover:underline">← BACK</button>
                                            )}
                                        </div>
                                        <div className="bg-muted rounded-2xl border border-gray-100 overflow-hidden max-h-[300px] overflow-y-auto">
                                            {isLoadingFiles ? (
                                                <div className="p-10 text-center text-xs font-bold text-gray-400 animate-pulse">Loading files...</div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {files.length === 0 && <div className="p-10 text-center text-xs text-gray-400 font-bold">Folder is empty</div>}
                                                    {files.map((file) => {
                                                        const isDocFile = !file.is_folder && !file.is_video && /\.(pdf|txt|jpg|jpeg|png|gif|webp)$/i.test(file.name);
                                                        const fileIcon = file.is_folder ? '📁' : /\.pdf$/i.test(file.name) ? '📕' : /\.txt$/i.test(file.name) ? '📝' : /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) ? '🖼️' : '📄';
                                                        return (
                                                        <div key={file.id} 
                                                            className={`p-4 flex items-center justify-between group transition-colors ${file.is_folder ? 'cursor-pointer hover:bg-white' : ''}`}
                                                            onClick={() => file.is_folder && navigateTo(file.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xl">{fileIcon}</span>
                                                                <div>
                                                                    <p className={`text-xs font-bold truncate max-w-[150px] ${data.file_id === file.id ? 'text-primary' : ''}`}>{file.name}</p>
                                                                    <p className="text-[9px] text-gray-400 font-medium">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                                                </div>
                                                            </div>
                                                            {isDocFile && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); selectFileItem(file); }}
                                                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${data.file_id === file.id ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-primary hover:text-white'}`}
                                                                >
                                                                    {data.file_id === file.id ? 'SELECTED' : 'SELECT'}
                                                                </button>
                                                            )}
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1 block">Lesson Content / Description</label>
                        <div className="bg-white border rounded-[32px] overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all border-gray-100">
                            <ReactQuill 
                                theme="snow" 
                                value={data.content} 
                                onChange={(value) => setData('content', value)}
                                placeholder="Write your lesson content here..."
                                className="h-[300px] border-none"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}],
                                        ['link', 'image', 'video'],
                                        ['clean']
                                    ]
                                }}
                            />
                        </div>
                        <style jsx global>{`
                            .quill .ql-toolbar {
                                border: none;
                                border-bottom: 1px solid #f3f4f6;
                                padding: 1.5rem 2rem;
                                border-radius: 32px 32px 0 0;
                                background: #f9fafb;
                            }
                            .quill .ql-container {
                                border: none;
                                font-family: inherit;
                                font-size: 0.875rem;
                            }
                            .quill .ql-editor {
                                padding: 2rem;
                                min-height: 250px;
                            }
                            .quill .ql-editor p {
                                margin-bottom: 1rem;
                            }
                        `}</style>
                        <InputError message={errors.content} />
                    </div>

                    <div className="flex justify-end gap-4 border-t border-gray-50 pt-10">
                        <Link href={route('mentor.courses.edit', lesson.section.course_id)} className="px-8 py-4 text-sm font-extrabold text-gray-400 hover:text-foreground transition-colors">Cancel</Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-white px-12 py-5 rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1"
                        >
                            {processing ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
