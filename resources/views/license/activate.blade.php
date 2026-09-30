<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Domain-Locked License Required — Guruz E-Commerce</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', 'Hind Siliguri', sans-serif;
        }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
    
    <!-- Background Glow Orbs -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-lg relative z-10">
        
        <!-- Main Card -->
        <div class="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <!-- Shield & Lock Header -->
            <div class="text-center space-y-3">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-0.5 shadow-lg shadow-indigo-500/20">
                    <div class="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-3xl">
                        🔒
                    </div>
                </div>

                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 uppercase tracking-wider">
                    <span>🛡️ একক-ডোমেইন লাইসেন্স সুরক্ষা</span>
                </div>

                <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Domain Security Lock System
                </h1>
                
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal max-w-md mx-auto">
                    এই প্ল্যাটফর্মটির সোর্স কোড সম্পূর্ণ সুরক্ষিত। অনুমোদিত ডোমেইন ও ওনারের জিমেইল সিগনেচার ছাড়া এই ওয়েবসাইট কোনো হোস্টিং বা সিপ্যানেলে রান করা অসম্ভব।
                </p>
            </div>

            <!-- Target Domain Badge -->
            <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div class="space-y-0.5">
                    <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">বর্তমান হোস্টিং ডোমেইন</div>
                    <div class="font-mono font-black text-indigo-400 text-sm break-all">{{ $domain }}</div>
                </div>
                <div class="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[11px]">
                    লকড (Locked)
                </div>
            </div>

            <!-- Error Notification -->
            @if(session('error'))
            <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <span class="text-base shrink-0">❌</span>
                <span class="leading-relaxed">{{ session('error') }}</span>
            </div>
            @endif

            @if(session('success'))
            <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                <span class="text-base shrink-0">✅</span>
                <span class="leading-relaxed">{{ session('success') }}</span>
            </div>
            @endif

            <!-- Activation Form -->
            <form action="{{ url('/activate-license') }}" method="POST" class="space-y-4">
                @csrf

                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label for="owner_email" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                            অথর / ওনারের জিমেইল (Owner Gmail) <span class="text-rose-500">*</span>
                        </label>
                        <span class="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            🔒 অপরিবর্তনযোগ্য
                        </span>
                    </div>
                    <input 
                        type="email" 
                        name="owner_email" 
                        id="owner_email" 
                        required 
                        readonly
                        value="shishirbarai019@gmail.com"
                        class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-300 cursor-not-allowed select-none focus:outline-none"
                    />
                    <p class="text-[11px] text-slate-500 mt-1">
                        🔒 এই জিমেইলটি স্থায়ীভাবে নির্ধারিত এবং পরিবর্তন অযোগ্য।
                    </p>
                </div>

                <div>
                    <label for="license_key" class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        ডোমেইন-লকড লাইসেন্স কী (License Key) <span class="text-rose-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="license_key" 
                        id="license_key" 
                        required 
                        value="{{ old('license_key') }}"
                        placeholder="যেমন: GURUZ-XXXX-YYYY-ZZZZ-WWWW" 
                        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition tracking-wider uppercase"
                    />
                    <p class="text-[11px] text-slate-500 mt-1">
                        এই কী শুধুমাত্র <strong>{{ $domain }}</strong> ডোমেইনেই কাজ করবে।
                    </p>
                </div>

                <div>
                    <label for="client_name" class="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        ক্লায়েন্ট বা প্রতিষ্ঠানের নাম (ঐচ্ছিক)
                    </label>
                    <input 
                        type="text" 
                        name="client_name" 
                        id="client_name" 
                        value="{{ old('client_name') }}"
                        placeholder="আপনার নাম বা কোম্পানির নাম" 
                        class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                </div>

                <button 
                    type="submit" 
                    class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-rose-600 hover:from-indigo-600 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                    <span>🛡️ লাইসেন্স ভেরিফাই ও সাইট আনলক করুন</span>
                </button>
            </form>

            <!-- Bottom Support Help -->
            <div class="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-1">
                <p>লাইসেন্স কী না থাকলে সফটওয়্যার অথরের সাথে যোগাযোগ করুন।</p>
                <p class="font-mono text-[11px] text-slate-400">Cryptographically Protected by Guruz Shield • Single-Domain Mode</p>
            </div>

        </div>

    </div>

</body>
</html>
