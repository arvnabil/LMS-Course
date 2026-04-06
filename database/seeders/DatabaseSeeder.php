<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Create Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $mentorRole = Role::firstOrCreate(['name' => 'mentor', 'guard_name' => 'web']);
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

        // 1. Create Admins
        $superAdmin = User::create([
            'full_name' => 'Super Admin',
            'email' => 'nabil@activ.co.id',
            'password' => Hash::make('123123123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole([$adminRole, $mentorRole, $studentRole]);

        $lmsAdmin = User::create([
            'full_name' => 'LMS Admin (All Roles)',
            'email' => 'lms@activ.co.id',
            'password' => Hash::make('123123123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $lmsAdmin->assignRole([$adminRole, $mentorRole, $studentRole]);

        $adminTest = User::create([
            'full_name' => 'Admin Test',
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
        $adminTest->assignRole($adminRole);

        // 2. Create Mentors
        $mentor = User::create([
            'full_name' => 'Professional Mentor',
            'email' => 'mentor@example.test',
            'password' => Hash::make('password'),
            'role' => 'mentor',
            'email_verified_at' => now(),
        ]);
        $mentor->assignRole($mentorRole);

        // 3. Create Students
        $student = User::create([
            'full_name' => 'Active Student',
            'email' => 'student@example.test',
            'password' => Hash::make('password'),
            'role' => 'student',
            'email_verified_at' => now(),
        ]);
        $student->assignRole($studentRole);

        // 4. Create Categories
        $categories = [
            ['name' => 'Web Development', 'icon' => 'code'],
            ['name' => 'Data Science', 'icon' => 'bar-chart'],
            ['name' => 'Mobile Development', 'icon' => 'smartphone'],
            ['name' => 'Design', 'icon' => 'pen-tool'],
            ['name' => 'Business', 'icon' => 'briefcase'],
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'icon' => $cat['icon'],
            ]);
        }

        // 5. Seed Complete Course
        $this->call([
            CourseSeeder::class,
        ]);
    }
}
