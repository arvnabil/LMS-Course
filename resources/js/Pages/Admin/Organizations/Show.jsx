import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function OrganizationShow({ auth, organization, availableUsers, availableCourses }) {
    const [activeTab, setActiveTab] = useState('members');
    const [memberSearch, setMemberSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('member');

    // Filter available users by search
    const filteredUsers = availableUsers.filter(u =>
        u.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(memberSearch.toLowerCase())
    ).slice(0, 10);

    // Filter available courses by search
    const filteredCourses = availableCourses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
    ).slice(0, 10);

    const addMember = (userId) => {
        router.post(route('admin.organizations.members.add', organization.id), {
            user_id: userId,
            role: selectedRole,
        }, { preserveScroll: true });
        setMemberSearch('');
    };

    const removeMember = (userId) => {
        if (confirm('Remove this member from the organization?')) {
            router.delete(route('admin.organizations.members.remove', [organization.id, userId]), {
                preserveScroll: true,
            });
        }
    };

    const assignCourse = (courseId) => {
        router.post(route('admin.organizations.courses.assign', organization.id), {
            course_id: courseId,
        }, { preserveScroll: true });
        setCourseSearch('');
    };

    const unassignCourse = (courseId) => {
        if (confirm('Remove this course from the organization?')) {
            router.delete(route('admin.organizations.courses.unassign', [organization.id, courseId]), {
                preserveScroll: true,
            });
        }
    };

    const formatPrice = (price) => {
        return price > 0 ? `Rp ${Number(price).toLocaleString('id-ID')}` : 'Free';
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={organization.name} />

            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                            {organization.logo ? (
                                <img src={`/storage/${organization.logo}`} alt={organization.name} className="w-full h-full object-cover" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{organization.name}</h1>
                            <p className="text-sm text-gray-400 font-medium mt-1">{organization.description || 'No description'}</p>
                        </div>
                    </div>
                    <Link
                        href={route('admin.organizations.edit', organization.id)}
                        className="bg-muted text-foreground px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Edit
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 text-center">
                        <p className="text-3xl font-extrabold text-foreground">{organization.member_records_count}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Members</p>
                    </div>
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 text-center">
                        <p className="text-3xl font-extrabold text-foreground">{organization.course_records_count}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Assigned Courses</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`flex-1 py-5 text-center font-extrabold text-sm transition-all cursor-pointer ${activeTab === 'members' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-foreground'}`}
                        >
                            Members ({organization.members?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className={`flex-1 py-5 text-center font-extrabold text-sm transition-all cursor-pointer ${activeTab === 'courses' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-foreground'}`}
                        >
                            Courses ({organization.courses?.length || 0})
                        </button>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="space-y-6">
                                {/* Search & Add */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder="Search user by name or email to add..."
                                    />
                                    {memberSearch.length > 1 && filteredUsers.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 max-h-60 overflow-y-auto">
                                            {filteredUsers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => addMember(user.id)}
                                                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted transition-colors text-left cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                                                        {user.full_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{user.full_name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary uppercase">+ Add</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Member List */}
                                <div className="space-y-2">
                                    {organization.members?.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm py-8">No members yet. Search and add users above.</p>
                                    )}
                                    {organization.members?.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between bg-muted rounded-2xl px-5 py-4 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                                                    {member.avatar_url ? (
                                                        <img 
                                                            src={member.avatar_url.startsWith('http') ? member.avatar_url : `/storage/${member.avatar_url}`} 
                                                            alt={member.full_name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-primary">{member.full_name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{member.full_name}</p>
                                                    <p className="text-xs text-gray-400">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${member.pivot?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                                                    {member.pivot?.role || 'member'}
                                                </span>
                                                <button
                                                    onClick={() => removeMember(member.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer p-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === 'courses' && (
                            <div className="space-y-6">
                                {/* Search & Add */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={courseSearch}
                                        onChange={(e) => setCourseSearch(e.target.value)}
                                        className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all"
                                        placeholder="Search course to assign..."
                                    />
                                    {courseSearch.length > 1 && filteredCourses.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 max-h-60 overflow-y-auto">
                                            {filteredCourses.map((course) => (
                                                <button
                                                    key={course.id}
                                                    onClick={() => assignCourse(course.id)}
                                                    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-muted transition-colors text-left cursor-pointer"
                                                >
                                                    <div className="w-10 h-10 bg-muted rounded-xl overflow-hidden shrink-0">
                                                        {course.thumbnail ? (
                                                            <img src={`/storage/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">C</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{course.title}</p>
                                                        <p className="text-xs text-gray-400">{formatPrice(course.price)}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-primary uppercase">+ Assign</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Assigned Course List */}
                                <div className="space-y-2">
                                    {organization.courses?.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm py-8">No courses assigned. Search and add courses above.</p>
                                    )}
                                    {organization.courses?.map((course) => (
                                        <div key={course.id} className="flex items-center justify-between bg-muted rounded-2xl px-5 py-4 group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                                    {course.thumbnail ? (
                                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">C</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{course.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {course.price > 0 ? (
                                                            <>
                                                                <span className="line-through text-gray-400 text-xs">{formatPrice(course.price)}</span>
                                                                <span className="text-xs font-extrabold text-green-600">→ GRATIS</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">Free course</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => unassignCourse(course.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
