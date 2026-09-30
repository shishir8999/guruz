<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSmsController extends Controller
{
    public function gateway()
    {
        $settings = SiteSetting::where('group', 'sms')->pluck('value', 'key');

        return Inertia::render('Admin/Sms/SmsSettings', [
            'gateways' => [
                'twilio' => [
                    'active'  => (bool)($settings['twilio_active'] ?? false),
                    'sid'     => $settings['twilio_sid'] ?? '',
                    'token'   => $settings['twilio_token'] ?? '',
                    'from'    => $settings['twilio_from'] ?? '',
                ],
                'bulksmsbd' => [
                    'active'    => (bool)($settings['bulksmsbd_active'] ?? false),
                    'api_key'   => $settings['bulksmsbd_api_key'] ?? '',
                    'sender_id' => $settings['bulksmsbd_sender_id'] ?? '',
                ],
                'greenweb' => [
                    'active' => (bool)($settings['greenweb_active'] ?? false),
                    'token'  => $settings['greenweb_token'] ?? '',
                ],
            ]
        ]);
    }

    public function updateGateway(Request $request)
    {
        $fields = [
            'twilio_active', 'twilio_sid', 'twilio_token', 'twilio_from',
            'bulksmsbd_active', 'bulksmsbd_api_key', 'bulksmsbd_sender_id',
            'greenweb_active', 'greenweb_token',
        ];
        foreach ($fields as $field) {
            SiteSetting::set($field, $request->input($field, ''), 'sms');
        }

        return back()->with('success', 'SMS Gateway settings saved successfully!');
    }

    public function templates()
    {
        try {
            $templates = \Illuminate\Support\Facades\DB::table('sms_templates')->get();
        } catch (\Exception $e) {
            $templates = collect([]);
        }
        return Inertia::render('Admin/Sms/SmsTemplates', [
            'templates' => $templates
        ]);
    }

    public function whatsapp()
    {
        $settings = SiteSetting::where('group', 'whatsapp')->pluck('value', 'key');
        try {
            $templates = \Illuminate\Support\Facades\DB::table('whatsapp_templates')->get();
        } catch (\Exception $e) {
            $templates = collect([]);
        }

        return Inertia::render('Admin/Sms/WhatsAppMarketing', [
            'templates' => $templates,
            'whatsapp_settings' => [
                'phone'    => $settings['whatsapp_phone'] ?? '',
                'api_key'  => $settings['whatsapp_api_key'] ?? '',
            ]
        ]);
    }

    public function updateWhatsapp(Request $request)
    {
        SiteSetting::set('whatsapp_phone', $request->input('phone', ''), 'whatsapp');
        SiteSetting::set('whatsapp_api_key', $request->input('api_key', ''), 'whatsapp');

        return back()->with('success', 'WhatsApp settings saved!');
    }

    public function storeWhatsappTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        \Illuminate\Support\Facades\DB::table('whatsapp_templates')->insert([
            'name' => $request->name,
            'body' => $request->body,
            'variables' => json_encode([]),
            'language' => 'en',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'WhatsApp template created!');
    }

    public function updateWhatsappTemplate(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        \Illuminate\Support\Facades\DB::table('whatsapp_templates')->where('id', $id)->update([
            'name' => $request->name,
            'body' => $request->body,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'WhatsApp template updated!');
    }

    public function destroyWhatsappTemplate($id)
    {
        \Illuminate\Support\Facades\DB::table('whatsapp_templates')->where('id', $id)->delete();
        return back()->with('success', 'WhatsApp template deleted!');
    }

    public function storeTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        \Illuminate\Support\Facades\DB::table('sms_templates')->insert([
            'name' => $request->name,
            'body' => $request->body,
            'variables' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Template created successfully!');
    }

    public function updateTemplate(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        \Illuminate\Support\Facades\DB::table('sms_templates')->where('id', $id)->update([
            'name' => $request->name,
            'body' => $request->body,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Template updated successfully!');
    }

    public function destroyTemplate($id)
    {
        \Illuminate\Support\Facades\DB::table('sms_templates')->where('id', $id)->delete();
        return back()->with('success', 'Template deleted successfully!');
    }
}
