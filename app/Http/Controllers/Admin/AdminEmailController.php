<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\EmailTemplate;

class AdminEmailController extends Controller
{
    public function smtp()
    {
        $dbSettings = SiteSetting::where('group', 'smtp')->pluck('value', 'key');
        return Inertia::render('Admin/Emails/SmtpSettings', [
            'smtp' => [
                'mail_mailer'      => $dbSettings['mail_mailer']      ?? env('MAIL_MAILER', 'smtp'),
                'mail_host'        => $dbSettings['mail_host']        ?? env('MAIL_HOST', 'smtp.mailgun.org'),
                'mail_port'        => $dbSettings['mail_port']        ?? env('MAIL_PORT', 587),
                'mail_username'    => $dbSettings['mail_username']    ?? env('MAIL_USERNAME', ''),
                'mail_password'    => $dbSettings['mail_password']    ?? env('MAIL_PASSWORD', ''),
                'mail_encryption'  => $dbSettings['mail_encryption']  ?? env('MAIL_ENCRYPTION', 'tls'),
                'mail_from_address'=> $dbSettings['mail_from_address']?? env('MAIL_FROM_ADDRESS', 'hello@example.com'),
                'mail_from_name'   => $dbSettings['mail_from_name']   ?? env('MAIL_FROM_NAME', 'Example'),
            ]
        ]);
    }

    public function updateSmtp(Request $request)
    {
        $request->validate([
            'mail_host'         => 'required|string|max:255',
            'mail_port'         => 'required|integer',
            'mail_username'     => 'nullable|string|max:255',
            'mail_password'     => 'nullable|string|max:255',
            'mail_encryption'   => 'nullable|string|max:10',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name'    => 'required|string|max:255',
        ]);

        $fields = ['mail_mailer','mail_host','mail_port','mail_username','mail_password','mail_encryption','mail_from_address','mail_from_name'];
        foreach ($fields as $field) {
            SiteSetting::set($field, $request->input($field, ''), 'smtp');
        }

        return back()->with('success', 'SMTP সেটিং সফলভাবে সেভ করা হয়েছে!');
    }

    public function testSmtp(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        try {
            \App\Services\EmailService::configureSmtp();
            \Illuminate\Support\Facades\Mail::raw('অভিনন্দন! আপনার Guruz ই-কমার্স প্ল্যাটফর্মের SMTP ইমেইল সেটআপ সফলভাবে কাজ করছে। 🎉', function ($message) use ($request) {
                $message->to($request->test_email)
                    ->subject('Guruz SMTP Test Email Successful');
            });

            return back()->with('success', 'টেস্ট ইমেইল সফলভাবে ' . $request->test_email . ' ঠিকানায় পাঠানো হয়েছে!');
        } catch (\Exception $e) {
            return back()->with('error', 'ইমেইল পাঠাতে ব্যর্থ হয়েছে: ' . $e->getMessage());
        }
    }

    public function templates()
    {
        if (EmailTemplate::count() === 0) {
            // Seed defaults
            $defaults = [
                ['name' => 'Order Confirmation', 'subject' => 'Your order has been confirmed!', 'body_html' => '<h1>Thank you for your order!</h1><p>We are processing it now.</p>', 'status' => 'active'],
                ['name' => 'Password Reset', 'subject' => 'Reset your password', 'body_html' => '<p>Click here to reset your password.</p>', 'status' => 'active'],
                ['name' => 'Welcome Email', 'subject' => 'Welcome to our marketplace!', 'body_html' => '<h2>Welcome!</h2><p>We are glad to have you.</p>', 'status' => 'inactive'],
            ];
            foreach ($defaults as $d) {
                EmailTemplate::create([
                    'name' => $d['name'],
                    'subject' => $d['subject'],
                    'body_html' => $d['body_html'],
                ]);
            }
        }

        $templates = EmailTemplate::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'subject' => $t->subject,
                // adding a mock status just for the UI matching since migration has no status
                'status' => 'active' 
            ];
        });

        return Inertia::render('Admin/Emails/EmailTemplates', [
            'templates' => $templates
        ]);
    }

    public function edit(EmailTemplate $template)
    {
        return Inertia::render('Admin/Emails/EditTemplate', [
            'template' => $template
        ]);
    }

    public function update(Request $request, EmailTemplate $template)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'body_html' => 'required|string',
        ]);

        $template->update($request->only(['subject', 'body_html']));

        return redirect()->route('admin.emails.templates')->with('success', 'Email template updated successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'body_html' => 'nullable|string',
        ]);

        EmailTemplate::create([
            'name' => $request->name,
            'subject' => $request->subject,
            'body_html' => $request->body_html ?? '',
        ]);

        return redirect()->route('admin.emails.templates')->with('success', 'Template created!');
    }

    public function destroy(EmailTemplate $template)
    {
        $template->delete();
        return redirect()->route('admin.emails.templates')->with('success', 'Template deleted.');
    }

    public function bulk()
    {
        return Inertia::render('Admin/Emails/BulkEmail');
    }

    public function bulkSend(Request $request)
    {
        $request->validate([
            'to' => 'required|string',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $emails = array_map('trim', explode(',', $request->to));
        $validEmails = array_filter($emails, fn($e) => filter_var($e, FILTER_VALIDATE_EMAIL));

        if (empty($validEmails)) {
            return back()->withErrors(['to' => 'No valid email addresses provided.']);
        }

        foreach ($validEmails as $email) {
            try {
                \Illuminate\Support\Facades\Mail::raw($request->body, function ($message) use ($email, $request) {
                    $message->to($email)->subject($request->subject);
                });
            } catch (\Exception $e) {
                return back()->withErrors(['to' => 'Failed to send: ' . $e->getMessage()]);
            }
        }

        return redirect()->route('admin.emails.bulk')->with('success', count($validEmails) . ' email(s) sent successfully!');
    }
}
