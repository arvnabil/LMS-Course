<?php

namespace Modules\Payment\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_mentor_can_access_earnings(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'mentor']);
        $mentor = User::factory()->create(['role' => 'mentor']);
        $mentor->assignRole('mentor');

        $response = $this
            ->actingAs($mentor)
            ->get('/dashboard/mentor/earnings');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_transactions(): void
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $response = $this
            ->actingAs($admin)
            ->get('/dashboard/admin/transactions');

        $response->assertStatus(200);
    }
}
