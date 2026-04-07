<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->filled('role')) {
            $query->role($request->role); // Spatie scope
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                return $q->where('full_name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();
        $roles = Role::all();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'availableRoles' => $roles,
            'filters' => $request->only(['role', 'search']),
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->syncRoles($validated['roles']);

        // Keep the legacy string column updated for backward compatibility
        // with old checks until they are fully purged
        if (count($validated['roles']) > 0) {
            $user->update(['role' => $validated['roles'][0]]);
        }

        return back()->with('success', 'User roles updated successfully.');
    }

    public function toggleBan(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot ban yourself.');
        }

        $user->update(['is_banned' => !$user->is_banned]);

        $status = $user->is_banned ? 'banned' : 'unbanned';
        return back()->with('success', "User has been {$status}.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
        ]);

        $ids = array_filter($request->ids, function ($id) {
            return $id != auth()->id();
        });

        if (count($ids) === 0) {
            return back()->with('error', 'Cannot delete the selected users.');
        }

        User::whereIn('id', $ids)->delete();

        return back()->with('success', count($ids) . ' users deleted successfully.');
    }
}
