<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Basic Web Permissions for all entities
        $permissions = [
            // Analytics
            'view_analytics',
            
            // Users
            'view_users',
            'create_users',
            'edit_users',
            'delete_users',
            
            // Roles & Permissions
            'view_roles',
            'create_roles',
            'edit_roles',
            'delete_roles',

            // Categories
            'view_categories',
            'create_categories',
            'edit_categories',
            'delete_categories',

            // Courses (Moderation for Admin)
            'view_all_courses',
            'edit_all_courses',
            'delete_all_courses',

            // Transactions
            'view_transactions',

            // Mentor Specific
            'view_own_courses',
            'create_courses',
            'edit_own_courses',
            'delete_own_courses',
            'view_own_students',
            'review_submissions',
            'view_earnings',
            'manage_withdrawals',

            // Transactions
            'view_transactions',
            
            // Mentor Specific
            'view_own_courses',
            'create_courses',
            'edit_own_courses',
            'delete_own_courses',
            'view_own_students',
            'review_submissions',
            'view_earnings',
            'manage_withdrawals',
        ];

        // Create Permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 2. Define standard Roles & Assign Permissions
        
        // Super Admin (Gets all permissions via Gate::before in AuthServiceProvider usually, but let's assign explicitly here too)
        $roleAdmin = Role::firstOrCreate(['name' => 'admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        // Mentor
        $roleMentor = Role::firstOrCreate(['name' => 'mentor']);
        $roleMentor->givePermissionTo([
            'view_own_courses',
            'create_courses',
            'edit_own_courses',
            'delete_own_courses',
            'view_own_students',
            'review_submissions',
            'view_earnings',
            'manage_withdrawals',
        ]);

        // Student
        $roleStudent = Role::firstOrCreate(['name' => 'student']);
        // Base students usually only need standard web auth access, no specific admin panel permissions.
        // Public features (browse, enroll, learn) are typically open to any authenticated user.

        // 3. Migrate existing Users from the string 'role' column to Spatie roles
        $users = User::all();
        foreach ($users as $user) {
            // Assign role based on the legacy 'role' column string
            if ($user->role === 'admin') {
                $user->assignRole($roleAdmin);
            } elseif ($user->role === 'mentor') {
                $user->assignRole($roleMentor);
            } else {
                $user->assignRole($roleStudent);
            }
        }
    }
}
