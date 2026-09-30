<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SiteSetting;

class AdminNoticeMarqueeController extends Controller
{
    /**
     * Display the Notice Marquee settings page.
     */
    public function index()
    {
        $defaultMarquee = [
            'is_active' => true,
            'scroll_duration_seconds' => 8,
            'notices_en' => "Welcome to Guruz\nFree Delivery on orders over ৳1000",
            'notices_bn' => "গুরুজ-এ স্বাগতম\n১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি"
        ];

        $defaultWidget = [
            'is_active' => true,
            'interval_seconds' => 6,
            'display_duration_seconds' => 5,
            'visitor_base_count' => 41258,
            'messages_raw' => "করিম (ঢাকা) — ১ মিনিট আগে স্পার্ক হাই ভোল্টেজ ক্যাবল অর্ডার করেছেন\nআরিফ (চট্টগ্রাম) — ২ মিনিট আগে গুরুজ প্রিমিয়াম এক্সটেনশন সকেট অর্ডার করেছেন\nশফিক (সিলেট) — ৩ মিনিট আগে সার্ভিস ক্লেইম অর্ডার করেছেন\nতানজিনা (রাজশাহী) — ৫ মিনিট আগে ১.৫ আরএম প্রোডাক্ট অর্ডার করেছেন\nসুমন (খুলনা) — ৭ মিনিট আগে ২.৫ আরএম তার অর্ডার করেছেন\nকামরুল (কুমিল্লা) — ১০ মিনিট আগে ক্যাবল সকেট অর্ডার করেছেন\nআফরোজা (বরিশাল) — ১৫ মিনিট আগে পাওয়ার প্রোডাক্টস অর্ডার করেছেন\nএই মুহূর্তে Guruz e-commerce-এ 41,258 জন মানুষ পণ্য দেখছেন।"
        ];

        $savedMarquee = SiteSetting::get('notice_marquee');
        $marqueeSettings = $savedMarquee ? json_decode($savedMarquee, true) : $defaultMarquee;

        $savedWidget = SiteSetting::get('live_visitor_widget');
        $widgetSettings = $savedWidget ? json_decode($savedWidget, true) : $defaultWidget;

        if (empty($widgetSettings['messages_raw']) && !empty($widgetSettings['messages_bn'])) {
            $widgetSettings['messages_raw'] = is_array($widgetSettings['messages_bn']) 
                ? implode("\n", $widgetSettings['messages_bn']) 
                : $widgetSettings['messages_bn'];
        }

        return Inertia::render('Admin/NoticeMarqueePage', [
            'settings' => $marqueeSettings,
            'widgetSettings' => $widgetSettings,
        ]);
    }

    /**
     * Save the updated notice marquee and visitor widget settings.
     */
    public function update(Request $request)
    {
        $marqueeValidated = $request->validate([
            'is_active' => 'boolean',
            'scroll_duration_seconds' => 'required|numeric|min:1|max:300',
            'notices_en' => 'nullable|string',
            'notices_bn' => 'nullable|string',
        ]);

        SiteSetting::set('notice_marquee', json_encode($marqueeValidated), 'appearance');

        if ($request->has('widget_is_active')) {
            $widgetValidated = $request->validate([
                'widget_is_active' => 'boolean',
                'widget_interval_seconds' => 'required|numeric|min:1|max:300',
                'widget_display_duration_seconds' => 'required|numeric|min:1|max:300',
                'widget_messages_raw' => 'required|string',
            ]);

            $messagesArray = array_values(array_filter(array_map('trim', explode("\n", $widgetValidated['widget_messages_raw']))));

            $widgetData = [
                'is_active' => (bool)$widgetValidated['widget_is_active'],
                'interval_seconds' => (int)$widgetValidated['widget_interval_seconds'],
                'display_duration_seconds' => (int)$widgetValidated['widget_display_duration_seconds'],
                'messages_raw' => $widgetValidated['widget_messages_raw'],
                'messages_bn' => $messagesArray,
            ];

            SiteSetting::set('live_visitor_widget', json_encode($widgetData), 'appearance');
        }

        return redirect()->back()->with('success', 'Marquee & Live Popup settings updated successfully.');
    }
}
