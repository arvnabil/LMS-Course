<?php

namespace Modules\Organization\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Modules\Organization\Models\Organization;
use Modules\Organization\Models\OrganizationCourse;
use Modules\Organization\Models\OrganizationMember;
use Modules\Course\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display list of all organizations.
     */
    public function index()
    {
        $organizations = Organization::withCount(['memberRecords', 'courseRecords'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Organizations/Index', [
            'organizations' => $organizations,
        ]);
    }

    /**
     * Show create form.
     */
    public function create()
    {
        return Inertia::render('Admin/Organizations/Form');
    }

    /**
     * Store a new organization.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|max:2048',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure unique slug
        $count = Organization::where('slug', $validated['slug'])->count();
        if ($count > 0) {
            $validated['slug'] .= '-' . ($count + 1);
        }

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('organizations', 'public');
        }

        Organization::create($validated);

        return redirect()->route('admin.organizations.index')
            ->with('success', 'Organization created successfully.');
    }

    /**
     * Show organization details with members and courses.
     */
    public function show(Organization $organization)
    {
        $organization->load([
            'members:id,full_name,email,avatar,role',
            'courses:courses.id,title,slug,thumbnail,price',
        ]);

        $organization->loadCount(['memberRecords', 'courseRecords']);

        // Get available users (not already in this org) for the search
        $availableUsers = User::whereNotIn('id', $organization->members->pluck('id'))
            ->select('id', 'full_name', 'email', 'role')
            ->limit(100)
            ->get();

        // Get available courses (not already assigned) for the search
        $availableCourses = Course::where('status', 'published')
            ->whereNotIn('id', $organization->courses->pluck('id'))
            ->select('id', 'title', 'slug', 'price', 'thumbnail')
            ->limit(100)
            ->get();

        return Inertia::render('Admin/Organizations/Show', [
            'organization' => $organization,
            'availableUsers' => $availableUsers,
            'availableCourses' => $availableCourses,
        ]);
    }

    /**
     * Show edit form.
     */
    public function edit(Organization $organization)
    {
        return Inertia::render('Admin/Organizations/Form', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update organization.
     */
    public function update(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('organizations', 'public');
        }

        $organization->update($validated);

        return redirect()->route('admin.organizations.show', $organization)
            ->with('success', 'Organization updated successfully.');
    }

    /**
     * Delete organization.
     */
    public function destroy(Organization $organization)
    {
        $organization->delete();

        return redirect()->route('admin.organizations.index')
            ->with('success', 'Organization deleted successfully.');
    }

    /**
     * Add a member to the organization.
     */
    public function addMember(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|in:admin,member',
        ]);

        // Check if already a member
        if ($organization->members()->where('user_id', $validated['user_id'])->exists()) {
            return back()->with('error', 'User is already a member of this organization.');
        }

        OrganizationMember::create([
            'organization_id' => $organization->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'] ?? 'member',
            'joined_at' => now(),
        ]);

        return back()->with('success', 'Member added successfully.');
    }

    /**
     * Remove a member from the organization.
     */
    public function removeMember(Organization $organization, User $user)
    {
        OrganizationMember::where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->delete();

        return back()->with('success', 'Member removed successfully.');
    }

    /**
     * Assign a course to the organization.
     */
    public function assignCourse(Request $request, Organization $organization)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        // Check if already assigned
        if ($organization->courses()->where('course_id', $validated['course_id'])->exists()) {
            return back()->with('error', 'Course is already assigned to this organization.');
        }

        OrganizationCourse::create([
            'organization_id' => $organization->id,
            'course_id' => $validated['course_id'],
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Course assigned successfully.');
    }

    /**
     * Unassign a course from the organization.
     */
    public function unassignCourse(Organization $organization, Course $course)
    {
        OrganizationCourse::where('organization_id', $organization->id)
            ->where('course_id', $course->id)
            ->delete();

        return back()->with('success', 'Course unassigned successfully.');
    }
}
