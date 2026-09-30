<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function warranty()
    {
        return redirect()->route('warranty.claim');
    }

    public function benefits()
    {
        $page = Page::where('slug', 'benefits')->first();

        return Inertia::render('Static/Policy', [
            'type'    => 'benefits',
            'title'   => $page->title_bn ?? $page->title ?? 'মেম্বারশিপ ও কাস্টমার সুবিধাসমূহ (Member Benefits)',
            'content' => $page->content_bn ?? $page->content ?? null,
        ]);
    }

    public function terms()
    {
        return $this->policy('terms');
    }

    public function privacy()
    {
        return $this->policy('privacy');
    }

    public function policy($type = 'privacy')
    {
        $titles = [
            'privacy'  => 'Privacy Policy — গোপনীয়তা নীতি',
            'terms'    => 'Terms & Conditions — সেবা ও শর্তাবলী',
            'shipping' => 'Shipping & Delivery Policy — শিপিং ও ডেলিভারি নীতি',
            'returns'  => 'Returns & Refunds Policy — রিটার্ন ও রিফান্ড নীতি',
            'payment'  => 'Payment Policy — পেমেন্ট নিরাপত্তা নীতি',
            'company'  => 'Company Policy — কোম্পানি পলিসি',
            'security' => 'Security Policy — নিরাপত্তা তথ্য',
        ];

        $page = Page::where('slug', $type)->first();

        return Inertia::render('Static/Policy', [
            'type'    => $type,
            'title'   => $page->title_bn ?? $page->title ?? ($titles[$type] ?? 'Policy Details'),
            'content' => $page->content_bn ?? $page->content ?? null,
        ]);
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->first();

        if (!$page) {
            return Inertia::render('Static/Policy', [
                'type'    => $slug,
                'title'   => ucfirst(str_replace('-', ' ', $slug)),
                'content' => 'এই পেজের তথ্য শীঘ্রই প্রকাশ করা হবে।',
            ]);
        }

        return Inertia::render('Static/Policy', [
            'type'    => $page->slug,
            'title'   => $page->title_bn ?? $page->title,
            'content' => $page->content_bn ?? $page->content ?? $page->short_description,
        ]);
    }

    public function faq()
    {
        return Inertia::render('Static/Policy', [
            'type'  => 'faq',
            'title' => 'FAQ — সাধারণ জিজ্ঞাসা ও সমাধান',
        ]);
    }

    public function contact()
    {
        return Inertia::render('Static/Policy', [
            'type'  => 'contact',
            'title' => 'Contact Us — আমাদের সাথে যোগাযোগ করুন',
        ]);
    }

    public function submitContact(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        return back()->with('success', 'আপনার মেসেজ সফলভাবে প্রাপ্ত হয়েছে! আমরা দ্রুত যোগাযোগ করব।');
    }
}
