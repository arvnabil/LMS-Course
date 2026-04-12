<?php

namespace Modules\Certificate\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Modules\Certificate\Models\CertificateTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Services\FileStorageService;

class CertificateTemplateController extends Controller
{
    public function index()
    {
        $templates = CertificateTemplate::latest()->paginate(15);
        return Inertia::render('Admin/CertificateTemplates', [
            'templates' => $templates,
        ]);
    }

    public function create()
    {
        // Default layout parameters for a new template
        $defaultLayout = [
            'student_name' => ['x' => 50, 'y' => 50, 'fontSize' => 36, 'color' => '#000000', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'bold'],
            'course_title' => ['x' => 50, 'y' => 60, 'fontSize' => 24, 'color' => '#4b5563', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
            'date' => ['x' => 50, 'y' => 70, 'fontSize' => 16, 'color' => '#6b7280', 'align' => 'center', 'fontFamily' => 'sans-serif', 'fontWeight' => 'normal'],
            'certificate_code' => ['x' => 50, 'y' => 80, 'fontSize' => 12, 'color' => '#9ca3af', 'align' => 'center', 'fontFamily' => 'monospace', 'fontWeight' => 'normal'],
        ];

        return Inertia::render('Admin/CertificateDesigner', [
            'template' => [
                'id' => null,
                'name' => '',
                'background_image' => null,
                'is_active' => false,
                'layout_data' => $defaultLayout,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'background_image' => 'nullable', // Manual check for file vs string
            'layout_data' => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('background_image')) {
            $validated['background_image'] = FileStorageService::store($request->file('background_image'), 'certificates/templates');
        } else {
            $validated['background_image'] = $request->background_image;
        }

        $layoutData = json_decode($validated['layout_data'], true);

        if ($validated['is_active'] ?? false) {
            CertificateTemplate::where('is_active', true)->update(['is_active' => false]);
        }

        CertificateTemplate::create([
            'name' => $validated['name'],
            'background_image' => $validated['background_image'],
            'layout_data' => $layoutData,
            'is_active' => $validated['is_active'] ?? false,
        ]);

        return redirect()->route('admin.certificate-templates.index')->with('success', 'Template created successfully.');
    }

    public function edit(CertificateTemplate $certificateTemplate)
    {
        // Resolve OneDrive IDs to proxy URLs for frontend preview
        if ($certificateTemplate->background_image && !str_starts_with($certificateTemplate->background_image, '/storage/')) {
            $certificateTemplate->background_image = route('onedrive.public.show', $certificateTemplate->background_image);
        }

        return Inertia::render('Admin/CertificateDesigner', [
            'template' => $certificateTemplate,
        ]);
    }

    public function update(Request $request, CertificateTemplate $certificateTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'background_image' => 'nullable',
            'layout_data' => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('background_image')) {
            // Use centralized FileStorageService to handle deletion of old asset correctly
            FileStorageService::delete($certificateTemplate->background_image);
            $validated['background_image'] = FileStorageService::store($request->file('background_image'), 'certificates/templates');
        } else {
            $validated['background_image'] = $request->background_image ?? $certificateTemplate->background_image;
        }

        $layoutData = json_decode($validated['layout_data'], true);

        if ($validated['is_active'] ?? false) {
            CertificateTemplate::where('id', '!=', $certificateTemplate->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $certificateTemplate->update([
            'name' => $validated['name'],
            'background_image' => $validated['background_image'],
            'layout_data' => $layoutData,
            'is_active' => $validated['is_active'] ?? false,
        ]);

        return redirect()->route('admin.certificate-templates.index')->with('success', 'Template updated successfully.');
    }

    public function destroy(CertificateTemplate $certificateTemplate)
    {
        if ($certificateTemplate->is_active) {
            return back()->with('error', 'Cannot delete active template. Please set another template as active first.');
        }

        if ($certificateTemplate->background_image) {
            FileStorageService::delete($certificateTemplate->background_image);
        }

        $certificateTemplate->delete();

        return redirect()->route('admin.certificate-templates.index')->with('success', 'Template deleted successfully.');
    }

    public function toggleActive(CertificateTemplate $certificateTemplate)
    {
        CertificateTemplate::where('id', '!=', $certificateTemplate->id)->update(['is_active' => false]);
        $certificateTemplate->update(['is_active' => true]);
        
        return back()->with('success', 'Active template updated.');
    }
}
