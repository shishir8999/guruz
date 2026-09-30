<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerNotice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerNoticeController extends Controller
{
    public function index(Request $request): Response
    {
        // Seed sample super admin notices if table is empty
        if (SellerNotice::count() === 0) {
            SellerNotice::create([
                'title'        => '📢 গুরুত্বপূর্ণ নোটিশ: ঈদ অফার ক্যাম্পেইন প্রস্তুতি ও কুরিয়ার পিকআপ গাইডলাইন',
                'body'         => 'সকল সম্মানিত ভেন্ডরদের জানানো যাচ্ছে যে, আসন্ন ঈদ ক্যাম্পেইনে স্টক আপডেট ও সময়মতো পার্সেল প্যাকেজিং নিশ্চিত করুন।',
                'content'      => "প্রিয় ভেন্ডরবৃন্দ,\n\nআগামী সপ্তাহ থেকে আমাদের প্ল্যাটফর্মে বিশাল ঈদ মেগা অফার শুরু হতে যাচ্ছে। সমস্ত অর্ডার সময়মতো প্রসেস করার জন্য নিম্নলিখিত বিষয়গুলো নিশ্চিত করুন:\n\n১. আপনার শপের প্রোডাক্ট স্টক সঠিক রাখুন।\n২. পার্সেল প্যাকেজিং দুপুর ১২:০০ টার মধ্যে সম্পন্ন করুন যাতে কুরিয়ার ডেলিভারি সার্ভিস সময়মতো পিকআপ করতে পারে।\n৩. কাস্টমারদের প্রশ্নের উত্তর দ্রুত প্রদান করুন।\n\nধন্যবাদ,\nসুপার অ্যাডমিন টিম।",
                'type'         => 'Urgent',
                'status'       => 'published',
                'is_active'    => true,
                'published_at' => now()->subHours(5),
            ]);

            SellerNotice::create([
                'title'        => '🛠️ সিস্টেম মেইনটেন্যান্স ও ব্যাকএন্ড আপগ্রেড নোটিশ',
                'body'         => 'আগামী ১৫ই আগস্ট রাত ১২:০০ টা থেকে ২:০০ টা পর্যন্ত সিস্টেমে নিয়মিত রক্ষণাবেক্ষণ কাজ চলবে।',
                'content'      => "সম্মানিত সেলারগণ,\n\nআমাদের প্ল্যাটফর্মের সার্ভার পারফরম্যান্স ও পেআউট গেটওয়ে আরও দ্রুততর করতে আগামী ১৫ই আগস্ট রাত ১২:০০ টা থেকে রাত ২:০০ টা পর্যন্ত সিস্টেম আপগ্রেড চলবে।\n\nএই সময়ে কিছুক্ষণের জন্য ভেন্ডর ড্যাশবোর্ড স্লো হতে পারে। এই সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।\n\nধন্যবাদ,\nসিস্টেম ইঞ্জিনিয়ারিং টিম।",
                'type'         => 'Maintenance',
                'status'       => 'published',
                'is_active'    => true,
                'published_at' => now()->subDays(1),
            ]);

            SellerNotice::create([
                'title'        => '💳 নতুন ইনস্ট্যান্ট পেআউট (Instant Withdrawal) নিয়মাবলী',
                'body'         => 'ভেন্ডর ড্যাশবোর্ড থেকে পেআউট রিকোয়েস্ট পাঠানোর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে সরাসরি ব্যাংক বা বিকাশ অ্যাকাউন্টে ফান্ড জমা হবে।',
                'content'      => "প্রিয় সেলার,\n\nআমরা আনন্দের সাথে জানাচ্ছি যে, এখন থেকে ভেন্ডর ড্যাশবোর্ডের Payouts সেকশন থেকে যেকোনো সময় সর্বনিম্ন ১,০০০ টাকা উইথড্রয়াল রিকোয়েস্ট পাঠাতে পারবেন। রিকোয়েস্ট পাঠানোর পর সুপার অ্যাডমিন প্যানেল থেকে ভেরিফাই করে আপনার দেয়া ব্যাংক বা মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা পাঠিয়ে দেওয়া হবে।\n\nআপনার ব্যাঙ্কিং তথ্য অ্যাকাউন্টের Banking Settings থেকে সঠিক আছে কিনা তা যাচাই করে নিন।",
                'type'         => 'Policy',
                'status'       => 'published',
                'is_active'    => true,
                'published_at' => now()->subDays(3),
            ]);
        }

        $notices = SellerNotice::where('is_active', true)
            ->latest('published_at')
            ->latest('id')
            ->get()
            ->map(function ($n) {
                $pubDate = $n->published_at ? \Illuminate\Support\Carbon::parse($n->published_at)->format('M d, Y h:i A') : ($n->created_at ? \Illuminate\Support\Carbon::parse($n->created_at)->format('M d, Y h:i A') : 'Recently');
                $rawDate = $n->created_at ? \Illuminate\Support\Carbon::parse($n->created_at)->toISOString() : '';

                return [
                    'id'           => $n->id,
                    'title'        => $n->title,
                    'body'         => $n->body ?: substr(strip_tags($n->content), 0, 150) . '...',
                    'content'      => $n->content ?: $n->body,
                    'type'         => ucfirst($n->type ?: 'General'),
                    'status'       => $n->status,
                    'date'         => $pubDate,
                    'raw_date'     => $rawDate,
                ];
            });

        return Inertia::render('Seller/Notice', [
            'notices' => $notices
        ]);
    }
}
