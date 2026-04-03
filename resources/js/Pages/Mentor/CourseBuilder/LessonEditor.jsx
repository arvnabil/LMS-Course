import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function LessonEditor({ auth, lesson }) {
    const { data, setData, post, processing, errors } = useForm({
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        thumbnail: null,
        _method: 'PUT'
    });

    const [thumbnailPreview, setThumbnailPreview] = useState(lesson.thumbnail);

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('mentor.lessons.update', lesson.id));
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Edit Lesson: ${lesson.title}`} />

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

                <form onSubmit={submit} className="bg-white rounded-[40px] p-10 sm:p-12 shadow-2xl shadow-gray-200/20 border border-gray-100 space-y-10">
                    {lesson.type === 'video' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Video URL (YouTube)</label>
                                <input
                                    type="url"
                                    value={data.video_url}
                                    className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    onChange={(e) => setData('video_url', e.target.value)}
                                />
                                <InputError message={errors.video_url} />
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Lesson Video Thumbnail</label>
                                <div 
                                    className="relative aspect-video rounded-3xl bg-muted overflow-hidden border-2 border-dashed border-gray-200 hover:border-primary/50 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('lesson-thumbnail').click()}
                                >
                                    {thumbnailPreview ? (
                                        <img src={thumbnailPreview} className="w-full h-full object-cover" />
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
                                <input 
                                    id="lesson-thumbnail"
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />
                                <InputError message={errors.thumbnail} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Lesson Content / Description</label>
                        <textarea
                            value={data.content}
                            rows="10"
                            className="w-full bg-muted border-none rounded-[32px] px-8 py-6 text-sm font-medium leading-relaxed"
                            placeholder="Write your lesson content here..."
                            onChange={(e) => setData('content', e.target.value)}
                        ></textarea>
                        <InputError message={errors.content} />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href={route('mentor.courses.edit', lesson.section.course_id)} className="px-8 py-4 text-sm font-extrabold text-gray-400">Cancel</Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-white px-12 py-5 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1"
                        >
                            {processing ? 'Saving...' : 'Save Content'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
