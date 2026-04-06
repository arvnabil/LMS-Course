<?php

namespace Modules\Certificate\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_access_certificates(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'student']);
        $student = User::factory()->create(['role' => 'student']);
        $student->assignRole('student');

        $response = $this
            ->actingAs($student)
            ->get('/dashboard/certificates');

        $response->assertStatus(200);
    }
}
