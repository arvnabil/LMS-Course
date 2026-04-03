<?php

namespace Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Modules\Settings\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'primary_color' => 'nullable|string',
            'sidebar_active_color' => 'nullable|string',
            'platform_name' => 'nullable|string',
            'platform_logo' => 'nullable|image|max:2048',
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
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => 'branding']
                );
            }
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
