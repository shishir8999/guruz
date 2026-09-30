<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminMediaController extends Controller
{
    public function index()
    {
        $disk = Storage::disk('public');
        $allFiles = $disk->allFiles();
        
        $mediaFiles = [];
        
        // Filter out unwanted files like .gitignore, etc.
        foreach ($allFiles as $file) {
            if (Str::startsWith($file, '.')) {
                continue;
            }
            if (Str::endsWith($file, '.gitignore')) {
                continue;
            }
            // Skip the build folder if public/build contains frontend assets
            if (Str::startsWith($file, 'build/')) {
                continue;
            }
            
            $mediaFiles[] = [
                'name' => basename($file),
                'path' => $file,
                'url' => Storage::url($file),
                'size' => $disk->size($file),
                'last_modified' => $disk->lastModified($file),
                'extension' => pathinfo($file, PATHINFO_EXTENSION),
                'is_image' => in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'])
            ];
        }
        
        // Sort by last modified descending
        usort($mediaFiles, function ($a, $b) {
            return $b['last_modified'] <=> $a['last_modified'];
        });

        return Inertia::render('Admin/MediaManager', [
            'files' => $mediaFiles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            // Prefix to avoid collisions, but keep original name recognizable
            $filename = pathinfo($originalName, PATHINFO_FILENAME) . '-' . time() . '-' . Str::random(5) . '.' . $file->getClientOriginalExtension();
            
            $path = $file->storeAs('uploads', $filename, 'public');

            return redirect()->back()->with('success', 'File uploaded successfully.');
        }

        return redirect()->back()->with('error', 'File upload failed.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        $path = $request->input('path');
        
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return redirect()->back()->with('success', 'File deleted successfully.');
        }

        return redirect()->back()->with('error', 'File not found.');
    }
}
