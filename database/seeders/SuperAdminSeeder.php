<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure the admin role exists (it should from RolePermissionSeeder)
        $adminRole = Role::where('name', 'admin')->first();

        if (!$adminRole) {
            $adminRole = Role::create(['name' => 'admin']);
        }

        // Create the Super Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'full_name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'admin', // Backward compatibility column
            ]
        );

        // Assign the Spatie role
        $admin->assignRole($adminRole);

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Email: admin@admin.com');
        $this->command->info('Password: password');
    }
}
