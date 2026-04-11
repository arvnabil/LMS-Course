<?php

namespace Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\FileStorageService;
use Modules\Settings\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        $onedriveConnected = \DB::table('onedrive_tokens')->exists();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'onedriveConnected' => $onedriveConnected,
            'defaultStorageProvider' => $settings['default_storage_provider'] ?? 'local'
        ]);
    }

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
            'default_storage_provider' => 'nullable|string|in:local,onedrive,google_drive,s3',
        ]);

        $settings = $validated;
        unset($settings['platform_logo']);

        // Handle logo upload
        if ($request->hasFile('platform_logo')) {
            $path = FileStorageService::store($request->file('platform_logo'), 'settings');
            $settings['platform_logo'] = $path;
        }

        foreach ($settings as $key => $value) {
            if ($value !== null) {
                $group = str_starts_with($key, 'onedrive_') ? 'onedrive' : (str_starts_with($key, 'default_storage_') ? 'integrations' : 'branding');
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => $group]
                );
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
