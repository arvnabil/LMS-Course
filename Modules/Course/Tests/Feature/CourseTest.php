<?php

namespace Modules\Course\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_can_be_rendered(): void
    {
        $response = $this->get('/catalog');
        $response->assertStatus(200);
    }

    public function test_mentor_can_access_course_builder(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'mentor']);
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentor->assignRole('mentor');

        $response = $this
            ->actingAs($mentor)
            ->get('/dashboard/mentor/courses');

        $response->assertStatus(200);
    }

    public function test_student_cannot_access_mentor_dashboard(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'student']);
        $student = User::factory()->create(['role' => 'student']);
        $student->assignRole('student');

        $response = $this
            ->actingAs($student)
            ->get('/dashboard/mentor/courses');

        $response->assertStatus(403);
    }
}
