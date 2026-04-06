<?php

namespace Modules\Quiz\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_can_access_submissions(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'mentor']);
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentor->assignRole('mentor');

        $response = $this
            ->actingAs($mentor)
            ->get('/dashboard/mentor/submissions');

        $response->assertStatus(200);
    }
}
