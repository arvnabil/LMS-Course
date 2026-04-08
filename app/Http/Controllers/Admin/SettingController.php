<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $onedriveConnected = \Illuminate\Support\Facades\DB::table('onedrive_tokens')->where('id', 1)->exists();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'onedriveConnected' => $onedriveConnected
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'primary_color' => 'nullable|string',
            'sidebar_active_color' => 'nullable|string',
            'platform_name' => 'nullable|string',
            'platform_logo' => 'nullable|image|max:2048',
            'onedrive_client_id' => 'nullable|string',
            'onedrive_client_secret' => 'nullable|string',
            'onedrive_tenant_id' => 'nullable|string',
            'onedrive_redirect_uri' => 'nullable|url',
            'onedrive_base_path' => 'nullable|string',
        ]);

        $settings = $validated;
        unset($settings['platform_logo']);

        // Handle logo upload
        if ($request->hasFile('platform_logo')) {
            $path = $request->file('platform_logo')->store('settings', 'public');
            $settings['platform_logo'] = '/storage/' . $path;
        }

        foreach ($settings as $key => $value) {
            if ($value !== null) {
                $group = str_starts_with($key, 'onedrive_') ? 'integration' : 'branding';
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => $group]
                );
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
