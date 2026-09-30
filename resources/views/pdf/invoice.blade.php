@php
$t = [
    'en' => [
        'INVOICE' => 'INVOICE',
        'Issued By' => 'ISSUED BY',
        'Bill To' => 'BILL TO',
        'Address not provided' => 'Address not provided',
        'Phone' => 'Phone',
        'Email' => 'Email',
        'Order Details' => 'ORDER DETAILS',
        'Date' => 'Date',
        'Status' => 'Status',
        'Payment Status' => 'Payment Status',
        'Payment' => 'Payment',
        'Item Description' => 'ITEM DESCRIPTION',
        'Unit Price' => 'UNIT PRICE',
        'Qty' => 'QTY',
        'Total' => 'TOTAL',
        'Terms & Conditions' => 'TERMS & CONDITIONS',
        'Subtotal' => 'Subtotal',
        'Shipping' => 'Shipping',
        'Discount' => 'Discount',
        'Grand Total' => 'Grand Total',
        'Generated securely by' => 'Generated securely by',
    ],
    'bn' => [
        'INVOICE' => 'ইনভয়েস',
        'Issued By' => 'ইস্যুকারী',
        'Bill To' => 'গ্রাহক',
        'Address not provided' => 'ঠিকানা দেওয়া হয়নি',
        'Phone' => 'ফোন',
        'Email' => 'ইমেইল',
        'Order Details' => 'অর্ডারের বিবরণ',
        'Date' => 'তারিখ',
        'Status' => 'অবস্থা',
        'Payment Status' => 'পেমেন্ট অবস্থা',
        'Payment' => 'পেমেন্ট মাধ্যম',
        'Item Description' => 'পণ্যের বিবরণ',
        'Unit Price' => 'একক মূল্য',
        'Qty' => 'পরিমাণ',
        'Total' => 'মোট মূল্য',
        'Terms & Conditions' => 'শর্তাবলী',
        'Subtotal' => 'সাবটোটাল',
        'Shipping' => 'ডেলিভারি চার্জ',
        'Discount' => 'ডিসকাউন্ট',
        'Grand Total' => 'সর্বমোট',
        'Generated securely by' => 'নিরাপদভাবে তৈরি করেছে',
    ]
];
$lang = $lang ?? 'en';
$text = function($key) use ($t, $lang) {
    return $t[$lang][$key] ?? $key;
};

$statusBn = [
    'pending' => 'পেন্ডিং',
    'processing' => 'প্রসেসিং',
    'shipped' => 'শিপড',
    'delivered' => 'ডেলিভার্ড',
    'cancelled' => 'ক্যান্সেলড',
    'returned' => 'রিটার্নড',
];
$orderStatus = $lang == 'bn' ? ($statusBn[strtolower($order->status)] ?? $order->status) : $order->status;
$paymentMethod = $lang == 'bn' && strtolower($order->payment_method) == 'cod' ? 'ক্যাশ অন ডেলিভারি' : strtoupper($order->payment_method);

$paymentStatusBn = [
    'paid' => 'পেইড',
    'unpaid' => 'আনপেইড',
];
$paymentStatusText = $lang == 'bn' ? ($paymentStatusBn[strtolower($order->payment_status ?? 'unpaid')] ?? 'আনপেইড') : strtoupper($order->payment_status ?? 'UNPAID');
$watermarkText = !empty($settings['watermark']) ? $settings['watermark'] : $paymentStatusText;
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    
    <!-- Load Bengali Font for Web View -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        @page {
            margin: 0;
            size: A4;
        }
        
        body {
            font-family: 'Noto Sans Bengali', 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        
        /* Unique Premium Header with Pattern */
        .header-banner {
            background-color: {{ $settings['color'] }};
            background-image: radial-gradient(circle at 100% 150%, rgba(255,255,255,0.1) 24%, transparent 25%),
                              radial-gradient(circle at 0% 150%, rgba(255,255,255,0.1) 24%, transparent 25%);
            background-size: 100px 100px;
            color: #ffffff;
            padding: 40px 50px;
            height: 110px;
            border-bottom: 5px solid rgba(0,0,0,0.1);
        }
        
        .header-left {
            float: left;
            width: 50%;
        }
        
        .header-right {
            float: right;
            width: 50%;
            text-align: right;
        }
        
        .invoice-title {
            font-size: 46px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .invoice-subtitle {
            font-size: 16px;
            font-weight: 600;
            background: rgba(255,255,255,0.2);
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            margin-top: 8px;
        }
        
        /* Main Container */
        .container {
            padding: 40px 50px;
        }
        
        .logo {
            max-width: 220px;
            max-height: 80px;
            object-fit: contain;
            filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));
            background: white;
            padding: 10px;
            border-radius: 8px;
        }
        
        .brand-text {
            font-size: 32px;
            font-weight: 900;
            margin: 0;
            letter-spacing: 1px;
            color: white;
            padding-top: 15px;
        }
        
        /* Grid Layout */
        .info-grid {
            width: 100%;
            margin-bottom: 45px;
            border-spacing: 0;
        }
        
        .info-grid td {
            vertical-align: top;
            width: 33.33%;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-grid td.spacer {
            width: 2%;
            background: transparent;
            border: none;
            padding: 0;
        }
        
        .info-box h3 {
            font-size: 13px;
            text-transform: uppercase;
            color: {{ $settings['color'] }};
            margin-top: 0;
            margin-bottom: 12px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        
        .info-box p {
            margin: 0;
            line-height: 1.7;
            font-size: 13px;
            color: #475569;
            white-space: pre-line;
        }
        
        /* Table Styling */
        .items-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 40px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        
        .items-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 16px;
            text-align: left;
            border-bottom: 2px solid #cbd5e1;
        }
        
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
            color: #1e293b;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        
        .text-right {
            text-align: right !important;
        }
        
        .text-center {
            text-align: center !important;
        }
        
        /* Totals Section */
        .totals-container {
            width: 100%;
        }
        
        .totals-table {
            width: 45%;
            float: right;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 12px 16px;
            font-size: 14px;
            color: #475569;
            border-bottom: 1px solid #f1f5f9;
        }
        
        .totals-table tr:last-child td {
            background-color: {{ $settings['color'] }};
            color: #ffffff;
            font-weight: 800;
            font-size: 18px;
            border-radius: 6px;
            border-bottom: none;
        }
        
        /* Footer/Notes */
        .notes-box {
            width: 50%;
            float: left;
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 6px solid {{ $settings['color'] }};
        }
        
        .notes-box h4 {
            margin: 0 0 10px 0;
            font-size: 13px;
            font-weight: 700;
            color: {{ $settings['color'] }};
            text-transform: uppercase;
        }
        
        .notes-box p {
            margin: 0;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
            white-space: pre-line;
        }
        
        .clear {
            clear: both;
        }
        
        /* Watermark */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 140px;
            color: {{ $settings['color'] }};
            opacity: 0.03;
            z-index: -1;
            text-transform: uppercase;
            font-weight: 900;
            white-space: nowrap;
        }
        
        .page-footer {
            position: fixed;
            bottom: 30px;
            left: 50px;
            right: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px dashed #cbd5e1;
            padding-top: 15px;
        }

        /* Web View Styles (Ignored by DomPDF) */
        @media screen {
            body {
                background-color: #e2e8f0;
                display: flex;
                justify-content: center;
                padding: 40px 0;
            }
            .invoice-wrapper {
                width: 700px;
                background: white;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05);
                border-radius: 12px;
                position: relative;
                overflow: hidden;
                min-height: 990px;
            }
            .page-footer {
                position: absolute;
            }
            .action-buttons {
                position: fixed;
                bottom: 30px;
                right: 30px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 999;
            }
            .btn-action {
                background-color: {{ $settings['color'] }};
                color: white;
                border: none;
                padding: 14px 24px;
                font-size: 15px;
                font-weight: bold;
                border-radius: 50px;
                cursor: pointer;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                font-family: inherit;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: transform 0.2s, opacity 0.2s;
            }
            .btn-action:hover {
                transform: translateY(-2px);
                opacity: 0.95;
            }
            .btn-secondary {
                background-color: #334155;
            }
            .btn-lang {
                background-color: #10b981;
            }
        }
        @media print {
            .no-print { display: none !important; }
            .invoice-wrapper { box-shadow: none; margin: 0; width: 100%; border-radius: 0; min-height: auto; }
        }
    </style>
</head>
<body>

<div class="invoice-wrapper">

    <!-- Background Watermark -->
    <div class="watermark">{{ $watermarkText }}</div>

    <!-- Premium Header with Dual Logos (Main Site Logo + Vendor Shop Logo) -->
    <div class="header-banner">
        <div class="header-left">
            <div style="display: table;">
                <!-- Main Website Logo -->
                <div style="display: table-cell; vertical-align: middle; padding-right: 15px;">
                    @if(!empty($settings['site_logo']))
                        <img src="{{ $settings['site_logo'] }}" class="logo" alt="Main Site Logo" style="max-height: 48px; background: white; padding: 4px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    @else
                        <h1 class="brand-text" style="font-size: 24px; font-weight: 900; margin:0; color:white;">SPARK / GURUZ</h1>
                    @endif
                </div>

                <!-- Vendor Shop Badge & Logo -->
                @if(!empty($settings['vendor_name']))
                <div style="display: table-cell; vertical-align: middle; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 15px;">
                    @if(!empty($settings['vendor_logo']))
                        <img src="{{ $settings['vendor_logo'] }}" class="logo" alt="Vendor Shop Logo" style="max-height: 42px; background: white; padding: 4px 8px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    @else
                        <div style="font-size: 13px; font-weight: 800; color: #fde047; text-transform: uppercase; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 6px;">
                            🏪 {{ $settings['vendor_name'] }}
                        </div>
                    @endif
                </div>
                @endif
            </div>
        </div>
        <div class="header-right">
            <h1 class="invoice-title">{{ $text('INVOICE') }}</h1>
            <div class="invoice-subtitle">#{{ $order->order_number }}</div>
        </div>
        <div class="clear"></div>
    </div>

    <!-- Main Content -->
    <div class="container">
        
        <table class="info-grid">
            <tr>
                <!-- Company Info -->
                <td class="info-box">
                    <h3>{{ $text('Issued By') }}</h3>
                    <p>{{ $settings['company_info'] }}</p>
                </td>
                
                <td class="spacer"></td>
                
                <!-- Billing Info -->
                <td class="info-box">
                    <h3>{{ $text('Bill To') }}</h3>
                    <p>
                        <strong>{{ $order->customer_name ?? ($order->user->name ?? 'Customer') }}</strong><br>
                        {{ $order->shipping_address ?? $text('Address not provided') }}<br>
                        {{ $text('Phone') }}: {{ $order->customer_phone ?? ($order->user->phone ?? 'N/A') }}<br>
                        {{ $text('Email') }}: {{ $order->user ? $order->user->email : 'N/A' }}
                    </p>
                </td>
                
                <td class="spacer"></td>
                
                <!-- Order Details -->
                <td class="info-box">
                    <h3>{{ $text('Order Details') }}</h3>
                    <p>
                        <strong>{{ $text('Date') }}:</strong> {{ $order->created_at->format('M d, Y') }}<br>
                        <strong>{{ $text('Status') }}:</strong> <span style="font-weight: 700; color: {{ $settings['color'] }}">{{ strtoupper($orderStatus) }}</span><br>
                        <strong>{{ $text('Payment Status') ?? 'Payment Status' }}:</strong> 
                        <span style="font-weight: 700; color: {{ strtolower($order->payment_status) == 'paid' ? '#10b981' : '#ef4444' }}">
                            {{ $paymentStatusText }}
                        </span><br>
                        @if($order->payment_method)
                            <strong>{{ $text('Payment') }}:</strong> {{ $paymentMethod }}
                        @endif
                    </p>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 45%;">{{ $text('Item Description') }}</th>
                    <th class="text-center" style="width: 15%;">{{ $text('Unit Price') }}</th>
                    <th class="text-center" style="width: 15%;">{{ $text('Qty') }}</th>
                    <th class="text-right" style="width: 25%;">{{ $text('Total') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        <strong style="display:block; margin-bottom: 4px; font-weight: 600;">{{ $item->product ? $item->product->name : 'Unknown Product' }}</strong>
                    </td>
                    <td class="text-center">Tk. {{ number_format($item->price, 2) }}</td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">Tk. {{ number_format($item->price * $item->quantity, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals & Notes Section -->
        <div class="totals-container">
            @if(!empty($settings['terms']))
            <div class="notes-box">
                <h4>{{ $text('Terms & Conditions') }}</h4>
                <p>{{ $settings['terms'] }}</p>
            </div>
            @endif

            <table class="totals-table">
                <tr>
                    <td>{{ $text('Subtotal') }}:</td>
                    <td class="text-right">Tk. {{ number_format($order->subtotal ?? $order->total, 2) }}</td>
                </tr>
                <tr>
                    <td>{{ $text('Shipping') }}:</td>
                    <td class="text-right">Tk. {{ number_format($order->shipping_cost ?? 0, 2) }}</td>
                </tr>
                @if($order->discount > 0)
                <tr>
                    <td style="color: #e11d48;">{{ $text('Discount') }}:</td>
                    <td class="text-right" style="color: #e11d48;">-Tk. {{ number_format($order->discount, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td>{{ $text('Grand Total') }}:</td>
                    <td class="text-right">Tk. {{ number_format($order->total, 2) }}</td>
                </tr>
            </table>
            <div class="clear"></div>
        </div>

    </div>

    <div class="page-footer">
        Generated securely by Guruz eCommerce System &bull; {{ date('M d, Y H:i') }}
    </div>

</div> <!-- End of invoice-wrapper -->

    @if(!request()->has('download'))
    <div class="action-buttons no-print">
        <!-- Language Switcher -->
        <a href="?lang={{ $lang == 'en' ? 'bn' : 'en' }}" class="btn-action btn-lang">
            {{ $lang == 'en' ? 'বাংলা সংস্করণ' : 'English Version' }}
        </a>
        
        <button onclick="window.print()" class="btn-action btn-secondary">
            Print Invoice
        </button>
        <a href="?lang={{ $lang }}&download=1" class="btn-action">
            Download PDF
        </a>
    </div>
    @endif

</body>
</html>
