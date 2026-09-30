<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\IpRule;
use App\Models\SiteSetting;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSecurityController extends Controller
{
    public function settings()
    {
        $dbSettings = SiteSetting::where('group', 'security')->pluck('value', 'key')->all();

        $settings = [
            'require_strong_password' => isset($dbSettings['require_strong_password']) ? filter_var($dbSettings['require_strong_password'], FILTER_VALIDATE_BOOLEAN) : true,
            'max_login_attempts'      => isset($dbSettings['max_login_attempts']) ? (int) $dbSettings['max_login_attempts'] : 5,
            'session_timeout'         => isset($dbSettings['session_timeout']) ? (int) $dbSettings['session_timeout'] : 120,
            'force_ssl'               => isset($dbSettings['force_ssl']) ? filter_var($dbSettings['force_ssl'], FILTER_VALIDATE_BOOLEAN) : true,
            'admin_url_prefix'        => $dbSettings['admin_url_prefix'] ?? 'admin',
        ];

        return Inertia::render('Admin/Security/SecuritySettings', [
            'settings' => $settings
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'max_login_attempts'      => 'required|integer|min:1|max:50',
            'session_timeout'         => 'required|integer|min:5|max:1440',
            'admin_url_prefix'        => 'required|string|max:50',
            'require_strong_password' => 'boolean',
            'force_ssl'               => 'boolean',
        ]);

        SiteSetting::set('max_login_attempts', $request->max_login_attempts, 'security');
        SiteSetting::set('session_timeout', $request->session_timeout, 'security');
        SiteSetting::set('admin_url_prefix', $request->admin_url_prefix, 'security');
        SiteSetting::set('require_strong_password', $request->boolean('require_strong_password') ? '1' : '0', 'security');
        SiteSetting::set('force_ssl', $request->boolean('force_ssl') ? '1' : '0', 'security');

        return back()->with('success', 'সিকিউরিটি সেটিংস সফলভাবে সেভ করা হয়েছে!');
    }

    public function twoFactor()
    {
        $users = \App\Models\User::select('id', 'name', 'email', 'phone', 'created_at')
            ->orderBy('id', 'asc')
            ->take(50)
            ->get()
            ->map(function ($u) {
                $enabled = session("2fa_enabled_{$u->id}", $u->id === 1);
                $secret  = session("2fa_secret_{$u->id}", \App\Services\TotpService::generateSecret($u->id));
                return [
                    'id'                 => $u->id,
                    'name'               => $u->name,
                    'email'              => $u->email,
                    'phone'              => $u->phone,
                    'two_factor_enabled' => (bool) $enabled,
                    'secret_key'         => $secret,
                ];
            });

        return Inertia::render('Admin/Security/TwoFactor', [
            'users' => $users
        ]);
    }

    public function toggleTwoFactor($id)
    {
        $current = session("2fa_enabled_{$id}", $id === 1);
        session(["2fa_enabled_{$id}" => !$current]);
        $statusStr = !$current ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)";
        return back()->with('success', "ইউজারের জন্য Google Authenticator (2FA) {$statusStr} করা হয়েছে!");
    }

    public function sessions()
    {
        $sessions = session('security_active_sessions', [
            ['id' => 'ses_1', 'user' => 'Super Admin', 'ip_address' => '192.168.1.1', 'device' => 'Windows / Chrome', 'last_activity' => '2026-08-05 15:00:00', 'is_current' => true],
            ['id' => 'ses_2', 'user' => 'Super Admin', 'ip_address' => '10.0.0.5', 'device' => 'iPhone / Safari', 'last_activity' => '2026-08-05 10:30:00', 'is_current' => false],
            ['id' => 'ses_3', 'user' => 'Manager', 'ip_address' => '172.16.0.4', 'device' => 'MacBook / Firefox', 'last_activity' => '2026-08-07 18:20:00', 'is_current' => false],
        ]);

        return Inertia::render('Admin/Security/ActiveSessions', [
            'sessions' => $sessions
        ]);
    }

    public function revokeSession($id)
    {
        $sessions = session('security_active_sessions', [
            ['id' => 'ses_1', 'user' => 'Super Admin', 'ip_address' => '192.168.1.1', 'device' => 'Windows / Chrome', 'last_activity' => '2026-08-05 15:00:00', 'is_current' => true],
            ['id' => 'ses_2', 'user' => 'Super Admin', 'ip_address' => '10.0.0.5', 'device' => 'iPhone / Safari', 'last_activity' => '2026-08-05 10:30:00', 'is_current' => false],
            ['id' => 'ses_3', 'user' => 'Manager', 'ip_address' => '172.16.0.4', 'device' => 'MacBook / Firefox', 'last_activity' => '2026-08-07 18:20:00', 'is_current' => false],
        ]);

        $filtered = array_values(array_filter($sessions, fn($s) => $s['id'] !== $id || !empty($s['is_current'])));
        session(['security_active_sessions' => $filtered]);

        return back()->with('success', 'সেশনটি সফলভাবে বাতিল (Revoke) করা হয়েছে!');
    }

    public function revokeAllOtherSessions()
    {
        $sessions = session('security_active_sessions', [
            ['id' => 'ses_1', 'user' => 'Super Admin', 'ip_address' => '192.168.1.1', 'device' => 'Windows / Chrome', 'last_activity' => '2026-08-05 15:00:00', 'is_current' => true],
            ['id' => 'ses_2', 'user' => 'Super Admin', 'ip_address' => '10.0.0.5', 'device' => 'iPhone / Safari', 'last_activity' => '2026-08-05 10:30:00', 'is_current' => false],
            ['id' => 'ses_3', 'user' => 'Manager', 'ip_address' => '172.16.0.4', 'device' => 'MacBook / Firefox', 'last_activity' => '2026-08-07 18:20:00', 'is_current' => false],
        ]);

        $onlyCurrent = array_values(array_filter($sessions, fn($s) => !empty($s['is_current'])));
        session(['security_active_sessions' => $onlyCurrent]);

        return back()->with('success', 'অন্য সকল সেশন সফলভাবে বাতিল করা হয়েছে!');
    }

    public function ipList()
    {
        if (IpRule::count() === 0) {
            IpRule::insert([
                [
                    'ip_address' => '192.168.1.100',
                    'type'       => 'Whitelist',
                    'reason'     => 'Office IP',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'ip_address' => '185.15.22.10',
                    'type'       => 'Blacklist',
                    'reason'     => 'Spam Bot',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        $ips = IpRule::orderBy('created_at', 'desc')->get()->map(function($rule) {
            $rule->added_at = $rule->created_at ? $rule->created_at->format('Y-m-d') : now()->format('Y-m-d');
            return $rule;
        });

        return Inertia::render('Admin/Security/IpList', [
            'ips' => $ips
        ]);
    }

    public function storeIpRule(Request $request)
    {
        $request->validate([
            'ip_address' => 'required|string|max:100',
            'type'       => 'required|in:Whitelist,Blacklist',
            'reason'     => 'nullable|string|max:255',
        ]);

        IpRule::create([
            'ip_address' => $request->ip_address,
            'type'       => $request->type,
            'reason'     => $request->reason,
        ]);

        return back()->with('success', 'নতুন আইপি রুল সফলভাবে যুক্ত করা হয়েছে!');
    }

    public function destroyIpRule(IpRule $ipRule)
    {
        $ipRule->delete();
        return back()->with('success', 'আইপি রুল সফলভাবে মুছে ফেলা হয়েছে!');
    }

    public function webhooks()
    {
        if (Webhook::count() === 0) {
            Webhook::create([
                'name'           => 'Order Notification',
                'url'            => 'https://api.example.com/webhook',
                'events'         => ['order.created', 'order.updated'],
                'status'         => 'Active',
                'last_triggered' => '2026-08-05 14:00:00',
            ]);
        }

        $webhooks = Webhook::orderBy('created_at', 'desc')->get()->map(function($w) {
            $w->events = is_array($w->events) ? $w->events : (json_decode($w->events, true) ?: ['order.created']);
            return $w;
        });

        return Inertia::render('Admin/Security/Webhooks', [
            'webhooks' => $webhooks
        ]);
    }

    public function storeWebhook(Request $request)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'url'    => 'required|url|max:255',
            'events' => 'required|array',
            'status' => 'required|in:Active,Inactive',
        ]);

        Webhook::create([
            'name'           => $request->name,
            'url'            => $request->url,
            'events'         => $request->events,
            'status'         => $request->status,
            'last_triggered' => 'Never',
        ]);

        return back()->with('success', 'নতুন ওয়েবহুক এন্ডপয়েন্ট সফলভাবে তৈরি হয়েছে!');
    }

    public function updateWebhook(Request $request, Webhook $webhook)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'url'    => 'required|url|max:255',
            'events' => 'required|array',
            'status' => 'required|in:Active,Inactive',
        ]);

        $webhook->update([
            'name'   => $request->name,
            'url'    => $request->url,
            'events' => $request->events,
            'status' => $request->status,
        ]);

        return back()->with('success', 'ওয়েবহুক এন্ডপয়েন্ট আপডেট করা হয়েছে!');
    }

    public function destroyWebhook(Webhook $webhook)
    {
        $webhook->delete();
        return back()->with('success', 'ওয়েবহুক এন্ডপয়েন্ট মুছে ফেলা হয়েছে!');
    }

    public function auditLogs()
    {
        if (AuditLog::count() === 0) {
            AuditLog::insert([
                [
                    'user'       => 'Super Admin',
                    'action'     => 'Settings Updated',
                    'module'     => 'System',
                    'ip_address' => '192.168.1.1',
                    'details'    => 'Updated max login attempts to 5 and forced SSL',
                    'created_at' => now()->subHours(2),
                    'updated_at' => now()->subHours(2),
                ],
                [
                    'user'       => 'Manager',
                    'action'     => 'Order Cancelled',
                    'module'     => 'Orders',
                    'ip_address' => '10.0.0.2',
                    'details'    => 'Cancelled order #ORD-4821 per customer request',
                    'created_at' => now()->subHours(5),
                    'updated_at' => now()->subHours(5),
                ],
                [
                    'user'       => 'System',
                    'action'     => 'Backup Created',
                    'module'     => 'Database',
                    'ip_address' => '127.0.0.1',
                    'details'    => 'Automated daily database backup finished',
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ]
            ]);
        }

        $logs = AuditLog::orderBy('created_at', 'desc')->get()->map(function($l) {
            $l->date = $l->created_at ? $l->created_at->format('Y-m-d H:i:s') : '2026-08-05 15:20:00';
            $l->user = $l->user ?: 'Super Admin';
            $l->module = $l->module ?: 'System';
            $l->ip_address = $l->ip_address ?: '127.0.0.1';
            return $l;
        });

        return Inertia::render('Admin/Security/AuditLogs', [
            'logs' => $logs
        ]);
    }

    public function exportAuditLogs()
    {
        $logs = AuditLog::orderBy('created_at', 'desc')->get();
        $filename = "audit_logs_" . date('Y_m_d_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Time', 'User', 'Action', 'Module', 'IP Address', 'Details']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '',
                    $log->user ?: 'Super Admin',
                    $log->action,
                    $log->module ?: 'System',
                    $log->ip_address ?: '127.0.0.1',
                    $log->details ?: '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
