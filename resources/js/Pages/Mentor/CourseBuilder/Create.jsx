import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth, categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        level: 'beginner',
        price: '',
        description: '',
        tagline: '',
        thumbnail: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mentor.courses.store'));
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Create New Course" />

            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create New Course</h1>
                    <p className="text-gray-500 font-medium">Step 1: Basic Information. You can add the curriculum later.</p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-[40px] p-10 sm:p-12 shadow-2xl shadow-gray-200/20 border border-gray-100 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title */}
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Title</label>
                            <input
                                type="text"
                                value={data.title}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                placeholder="e.g. Mastering Laravel 12 with Docker"
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Tagline */}
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Short Tagline</label>
                            <input
                                type="text"
                                value={data.tagline}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                placeholder="A catchy one-liner for your course"
                                onChange={(e) => setData('tagline', e.target.value)}
                            />
                            <InputError message={errors.tagline} />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Category</label>
                            <select
                                value={data.category_id}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground appearance-none"
                                onChange={(e) => setData('category_id', e.target.value)}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.category_id} />
                        </div>

                        {/* Level */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Difficulty Level</label>
                            <select
                                value={data.level}
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground appearance-none"
                                onChange={(e) => setData('level', e.target.value)}
                                required
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <InputError message={errors.level} />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Price (IDR)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">IDR</span>
                                <input
                                    type="number"
                                    value={data.price}
                                    className="w-full bg-muted border-none rounded-2xl pl-16 pr-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                    placeholder="0"
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.price} />
                        </div>

                        {/* Thumbnail */}
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Thumbnail</label>
                            <input
                                type="file"
                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-foreground"
                                onChange={(e) => setData('thumbnail', e.target.files[0])}
                                accept="image/*"
                            />
                            <p className="text-[10px] text-gray-400 px-1 italic">Recommended size: 1280x720 (16:9). Max size: 2MB.</p>
                            <InputError message={errors.thumbnail} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-foreground uppercase tracking-widest px-1">Course Description</label>
                        <textarea
                            value={data.description}
                            rows="6"
                            className="w-full bg-muted border-none rounded-[32px] px-8 py-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-600 leading-relaxed"
                            placeholder="Describe what students will learn in this course..."
                            onChange={(e) => setData('description', e.target.value)}
                            required
                        ></textarea>
                        <InputError message={errors.description} />
                    </div>

                    <div className="pt-6 flex items-center justify-between gap-6">
                        <Link href={route('mentor.courses.index')} className="text-sm font-extrabold text-gray-400 hover:text-foreground transition-colors uppercase tracking-widest px-4">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-white px-12 py-5 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {processing ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
