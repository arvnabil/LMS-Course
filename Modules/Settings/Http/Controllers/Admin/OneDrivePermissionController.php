<?php

namespace Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OneDrivePermission;
use Illuminate\Http\Request;

class OneDrivePermissionController extends Controller
{
    /**
     * List all mentors and their OneDrive permissions.
     */
    public function index()
    {
        $mentors = User::role('mentor')
            ->with('oneDrivePermission')
            ->get();

        return response()->json([
            'mentors' => $mentors->map(function ($mentor) {
                return [
                    'id' => $mentor->id,
                    'full_name' => $mentor->full_name,
                    'email' => $mentor->email,
                    'permissions' => $mentor->oneDrivePermission ?? [
                        'can_use_shared_link' => false,
                        'can_upload' => false,
                        'can_use_library' => false,
                    ],
                ];
            })
        ]);
    }

    /**
     * Update or create OneDrive permissions for a user.
     */
    public function update(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'can_use_shared_link' => 'required|boolean',
            'can_upload' => 'required|boolean',
            'can_use_library' => 'required|boolean',
        ]);

        $permission = OneDrivePermission::updateOrCreate(
            ['user_id' => $request->user_id],
            [
                'can_use_shared_link' => $request->can_use_shared_link,
                'can_upload' => $request->can_upload,
                'can_use_library' => $request->can_use_library,
            ]
        );

        return response()->json([
            'message' => 'Permissions updated successfully.',
            'permission' => $permission
        ]);
    }

    /**
     * Delete permissions for a user (effectively revoking all access).
     */
    public function destroy($userId)
    {
        OneDrivePermission::where('user_id', $userId)->delete();

        return response()->json([
            'message' => 'Access revoked successfully.'
        ]);
    }
}
