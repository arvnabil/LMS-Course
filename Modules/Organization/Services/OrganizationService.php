<?php

namespace Modules\Organization\Services;

use App\Models\User;
use Modules\Course\Models\Course;
use Modules\Organization\Models\OrganizationCourse;
use Modules\Organization\Models\OrganizationMember;

class OrganizationService
{
    /**
     * Check if the course is free for the user via any organization membership.
     */
    public function isCourseFreeForUser(User $user, Course $course): bool
    {
        // Get all organization IDs the user belongs to
        $orgIds = OrganizationMember::where('user_id', $user->id)
            ->whereHas('organization', fn($q) => $q->where('is_active', true))
            ->pluck('organization_id');

        if ($orgIds->isEmpty()) {
            return false;
        }

        // Check if the course is assigned to any of those organizations
        return OrganizationCourse::whereIn('organization_id', $orgIds)
            ->where('course_id', $course->id)
            ->exists();
    }

    /**
     * Get the effective price for a user viewing a course.
     * Returns original price, final price, and sponsorship info.
     */
    public function getEffectivePrice(User $user, Course $course): array
    {
        $orgIds = OrganizationMember::where('user_id', $user->id)
            ->whereHas('organization', fn($q) => $q->where('is_active', true))
            ->pluck('organization_id');

        if ($orgIds->isNotEmpty()) {
            $orgCourse = OrganizationCourse::whereIn('organization_id', $orgIds)
                ->where('course_id', $course->id)
                ->with('organization:id,name')
                ->first();

            if ($orgCourse) {
                return [
                    'original_price' => (float) $course->price,
                    'final_price' => 0,
                    'is_org_sponsored' => true,
                    'org_name' => $orgCourse->organization->name,
                ];
            }
        }

        return [
            'original_price' => (float) $course->price,
            'final_price' => (float) $course->price,
            'is_org_sponsored' => false,
            'org_name' => null,
        ];
    }

    /**
     * Get all course IDs that are assigned to the user's organizations.
     */
    public function getUserOrganizationCourseIds(User $user): array
    {
        $orgIds = OrganizationMember::where('user_id', $user->id)
            ->whereHas('organization', fn($q) => $q->where('is_active', true))
            ->pluck('organization_id');

        if ($orgIds->isEmpty()) {
            return [];
        }

        return OrganizationCourse::whereIn('organization_id', $orgIds)
            ->pluck('course_id')
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Get the user's primary organization info (for badge display).
     */
    public function getUserOrganizationInfo(User $user): ?array
    {
        $membership = OrganizationMember::where('user_id', $user->id)
            ->whereHas('organization', fn($q) => $q->where('is_active', true))
            ->with(['organization' => fn($q) => $q->withCount('courseRecords')])
            ->first();

        if (!$membership) {
            return null;
        }

        $org = $membership->organization;

        return [
            'id' => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'logo' => $org->logo,
            'role' => $membership->role,
            'course_count' => $org->course_records_count,
        ];
    }
}
