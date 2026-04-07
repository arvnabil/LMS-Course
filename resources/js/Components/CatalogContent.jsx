import { Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function CatalogContent({ categories = [], courses = { data: [] }, filters = {}, basePath = '/catalog', detailRouteName = 'courses.public.show' }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedLevels, setSelectedLevels] = useState(filters.levels || []);
    const isFirstRender = useRef(true);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const toggleLevel = (level) => {
        if (selectedLevels.includes(level)) {
            setSelectedLevels(selectedLevels.filter(l => l !== level));
        } else {
            setSelectedLevels([...selectedLevels, level]);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(basePath, {
                search,
                category: selectedCategory,
                levels: selectedLevels
            }, {
                preserveState: true,
                replace: true
            });
        }, 500); // 0.5s debounce for search

        return () => clearTimeout(timer);
    }, [search, selectedCategory, selectedLevels, basePath]);

    // Helper for pagination
    const getPageUrl = (page) => {
        const url = new URL(basePath, window.location.origin);
        url.searchParams.set('page', page);
        return url.pathname + url.search;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-12">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 space-y-10">
                {/* Search */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Search</h3>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search course..." 
                            className="w-full bg-muted border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Category</h3>
                    <div className="flex flex-wrap lg:flex-col gap-2">
                        <button 
                            onClick={() => setSelectedCategory('')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold group text-left ${!selectedCategory ? 'bg-primary text-white shadow-lg shadow-primary/20 border-none' : 'bg-muted hover:bg-surface text-foreground border border-transparent'}`}
                        >
                            <span className={!selectedCategory ? 'text-white' : 'group-hover:text-primary transition-colors'}>All Categories</span>
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.slug} 
                                onClick={() => setSelectedCategory(cat.slug)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold group text-left ${selectedCategory === cat.slug ? 'bg-primary text-white shadow-lg shadow-primary/20 border-none' : 'bg-muted hover:bg-surface text-foreground border border-transparent'}`}
                            >
                                <span className={selectedCategory === cat.slug ? 'text-white' : 'group-hover:text-primary transition-colors'}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Level</h3>
                    <div className="space-y-2">
                        {['beginner', 'intermediate', 'advanced'].map(level => (
                            <label key={level} className="flex items-center gap-3 cursor-pointer group capitalize">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-md border-gray-200 text-primary focus:ring-primary/20"
                                    checked={selectedLevels.includes(level)}
                                    onChange={() => toggleLevel(level)}
                                />
                                <span className="text-sm font-medium text-gray-500 group-hover:text-foreground">{level}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Content Grid */}
            <div className="flex-1 space-y-10">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 font-medium">
                        Showing <span className="text-foreground font-bold">{courses.total}</span> available courses
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {courses.data.map(course => (
                        <Link key={course.id} href={route(detailRouteName, course.slug)} className="group">
                            <div className="bg-surface rounded-[32px] p-4 border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all h-full flex flex-col">
                                <div className="aspect-video bg-muted rounded-[24px] mb-6 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                                        {course.category?.name}
                                    </div>
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl group-hover:scale-105 transition-transform duration-700">
                                            🖼️
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center pointer-events-none">
                                        <div className="w-16 h-11 bg-primary rounded-[14px] flex items-center justify-center shadow-2xl translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-110">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-1">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 px-2 flex-1 flex flex-col">
                                    <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="mt-auto space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase overflow-hidden">
                                                {course.mentor?.avatar_url ? (
                                                    <img src={course.mentor.avatar_url} alt={course.mentor.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    course.mentor?.full_name?.[0] || 'M'
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-gray-500">{course.mentor?.full_name}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-extrabold text-foreground capitalize">{course.level}</span>
                                            </div>
                                            {course.is_org_sponsored ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-wider mb-0.5">Sponsored by {course.org_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-extrabold text-primary">FREE</p>
                                                        <p className="text-xs text-muted-foreground line-through font-bold opacity-60 italic">IDR {Number(course.price).toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-lg font-extrabold text-primary">
                                                    {course.price > 0 ? `IDR ${Number(course.price).toLocaleString('id-ID')}` : 'FREE'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {courses.data.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-foreground">No courses found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {courses.last_page > 1 && (
                    <div className="flex justify-center gap-2 pt-10">
                        {Array.from({ length: courses.last_page }, (_, i) => i + 1).map(page => (
                            <Link
                                key={page}
                                href={basePath}
                                data={{ ...filters, page }}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${courses.current_page === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-border text-gray-400 hover:text-primary hover:border-primary'}`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
