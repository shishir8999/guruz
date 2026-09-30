<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormSubmission;
use App\Models\AbandonedCheckout;
use App\Models\CartFollowup;
use App\Models\KnowledgeBaseArticle;
use App\Models\DebugLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFormModuleController extends Controller
{
    public function submissions()
    {
        $submissions = FormSubmission::latest()->get()->map(function ($sub) {
            return [
                'id' => '#SUB-' . str_pad($sub->id, 3, '0', STR_PAD_LEFT),
                'name' => $sub->name,
                'email' => $sub->email,
                'subject' => $sub->form_name ?? 'Website Inquiry',
                'date' => $sub->created_at->diffForHumans(),
                'status' => $sub->status ?? 'Unread',
            ];
        });

        return Inertia::render('Admin/Forms/Submissions', [
            'initialSubmissions' => $submissions
        ]);
    }

    public function abandonedCheckouts()
    {
        $checkouts = AbandonedCheckout::with('user')->latest()->get()->map(function ($ac) {
            $itemsCount = is_array($ac->cart_data) ? count($ac->cart_data) : 1;
            return [
                'id' => '#AC-' . str_pad($ac->id, 3, '0', STR_PAD_LEFT),
                'customer' => $ac->user ? $ac->user->name : 'Guest User',
                'email' => $ac->email ?? ($ac->user ? $ac->user->email : 'unknown@guest.com'),
                'items' => $itemsCount,
                'total' => '৳3,500',
                'date' => $ac->created_at->diffForHumans(),
                'status' => $ac->recovered_at ? 'Recovered' : ($ac->recovery_email_sent ? 'Email Sent' : 'Pending'),
            ];
        });

        return Inertia::render('Admin/Forms/AbandonedCheckouts', [
            'initialCheckouts' => $checkouts
        ]);
    }

    public function cartFollowups()
    {
        $followups = CartFollowup::latest()->get()->map(function ($cf) {
            return [
                'id' => $cf->code ?? ('#CF-' . str_pad($cf->id, 4, '0', STR_PAD_LEFT)),
                'customer' => $cf->customer_name,
                'email' => $cf->email,
                'value' => '৳' . number_format($cf->cart_value),
                'stage' => $cf->stage,
                'time' => $cf->last_contacted_at ? $cf->last_contacted_at->diffForHumans() : $cf->created_at->diffForHumans(),
                'status' => $cf->status,
            ];
        });

        return Inertia::render('Admin/Forms/CartFollowups', [
            'initialFollowups' => $followups
        ]);
    }

    public function knowledgeBase()
    {
        $articles = KnowledgeBaseArticle::latest()->get()->map(function ($art) {
            return [
                'id' => $art->code ?? ('#KB-' . str_pad($art->id, 4, '0', STR_PAD_LEFT)),
                'title' => $art->title,
                'category' => $art->category,
                'views' => $art->views_count > 1000 ? round($art->views_count / 1000, 1) . 'k' : (string)$art->views_count,
                'date' => $art->created_at->diffForHumans(),
                'status' => $art->status,
            ];
        });

        return Inertia::render('Admin/Forms/KnowledgeBase', [
            'initialArticles' => $articles
        ]);
    }

    public function debugLogs()
    {
        $logs = DebugLog::latest()->take(50)->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'type' => $log->type,
                'time' => $log->created_at->format('Y-m-d H:i:s'),
                'message' => $log->message,
            ];
        });

        return Inertia::render('Admin/Developer/DebugLogs', [
            'initialLogs' => $logs
        ]);
    }
}
