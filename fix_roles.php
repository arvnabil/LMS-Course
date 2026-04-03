<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

echo "Starting role sync...\n";

// Ensure roles exist
$roles = ['admin', 'mentor', 'student', 'org_admin'];
foreach ($roles as $roleName) {
    Role::findOrCreate($roleName);
}

// Sync all users
User::all()->each(function ($user) {
    if ($user->role) {
        if (!$user->hasRole($user->role)) {
            try {
                $user->assignRole($user->role);
                echo "Assigned role '{$user->role}' to {$user->email}\n";
            } catch (\Exception $e) {
                echo "Error assigning role to {$user->email}: " . $e->getMessage() . "\n";
            }
        }
    }
});

// Specifically ensure User ID 1 is admin
$admin = User::find(1);
if ($admin && !$admin->hasRole('admin')) {
    $admin->assignRole('admin');
    $admin->update(['role' => 'admin']);
    echo "Forced admin role for {$admin->email}\n";
}

echo "Role sync complete.\n";
