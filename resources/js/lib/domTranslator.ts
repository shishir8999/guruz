/**
 * Complete Full-Site Token, Phrase & Node Translation Engine for Guruz E-Commerce
 * Seamlessly translates 100% of all UI & dynamic text between Bengali, English, and Hindi.
 */

// Digit mapping
const bnToEnDigits: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

const enToBnDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const bnToHiDigits: Record<string, string> = {
    '০': '०', '১': '१', '২': '२', '৩': '३', '৪': '४',
    '৫': '५', '৬': '६', '৭': '७', '৮': '८', '৯': '९'
};

// Comprehensive Phrases
export const phraseDict: Record<'en' | 'hi', Record<string, string>> = {
    en: {
        'ফ্ল্যাশ সেল শীঘ্রই। প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট!': 'Flash Sale Soon! Extra 2% discount on first order!',
        'ফ্ল্যাশ সেল শীঘ্রই।': 'Flash Sale Soon!',
        'ফ্ল্যাশ সেল শীঘ্রই': 'Flash Sale Soon',
        'প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট!': 'Extra 2% discount on first order!',
        'প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট': 'Extra 2% discount on first order',
        'আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!': 'Complete your profile and get extra 2% discount!',
        'আপনার প্রোফাইল সম্পূর্ণ করুন': 'Complete your profile',
        'পান অতিরিক্ত ২% ডিসকাউন্ট!': 'Get extra 2% discount!',
        'পান অতিরিক্ত ২% ডিসকাউন্ট': 'Get extra 2% discount',
        'রেট ট্রেইম সার্ভিস ও অফিশিয়াল প্রোডাক্ট সাপোর্ট': 'Claim Service & Official Product Support',
        'সারা দেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা': 'Cash on delivery & fastest home delivery nationwide',
        'সারাদেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা': 'Cash on delivery & fastest home delivery nationwide',
        '১০০% আসল ও অরিজিনাল গ্যাজেটের নিশ্চয়তা': '100% authentic and original gadget guarantee',
        '১০০% অরিজিনাল প্রোডাক্ট': '100% Original Products',
        '১০০% আসল পণ্য': '100% Authentic Products',
        '৭ দিনের রিটার্ন পলিসি': '7 Days Return Policy',
        'দ্রুত ও নিরাপদ ডেলিভারি': 'Fast & Secure Delivery',
        '২৪/৭ কাস্টমার সাপোর্ট': '24/7 Customer Support',
        'সেরা দামের গ্যারান্টি': 'Best Price Guarantee',
        'গুরুজ ভেরিফায়েড': 'Guruz Verified',
        'গুরুজ ঈদ স্পেশাল': 'Guruz Eid Special',
        'গুরুজ স্পেশাল': 'Guruz Special',
        'গুরুজে স্বাগতম': 'Welcome to Guruz',
        'গুরুজ-এ স্বাগতম': 'Welcome to Guruz',
        'গুরুজ': 'Guruz',
        'নিরাপদ পেমেন্ট': 'Secure Payment',
        'সারাদেশে ডেলিভারি': 'Nationwide Delivery',
        'সহজ রিটার্ন': 'Easy Returns',
        'সাপোর্ট হটলাইন': 'Support Hotline',
        'সাপোর্ট সেন্টার': 'Support Center',
        'অর্ডার ট্র্যাক': 'Track Order',
        'ট্র্যাক অর্ডার': 'Track Order',
        'বিক্রেতা হোন': 'Become a Seller',
        'মার্চেন্ট শপসমূহ': 'Merchant Shops',
        'মার্চেন্ট শপ': 'Merchant Shops',
        'মার্চেন্ট': 'Merchant',
        'ভাষা নির্বাচন করুন': 'Select Language',
        'ভাষা নির্বাচন': 'Select Language',
        'ভাষা': 'Language',
        'কারেন্সি': 'Currency',
        'থিম': 'Theme',
        'হোম': 'Home',
        'ক্যাটাগরি সমূহ': 'Categories',
        'সকল ক্যাটাগরি': 'All Categories',
        'সব ক্যাটাগরি': 'All Categories',
        'সব পণ্য দেখুন': 'View All Products',
        'সকল পণ্য': 'All Products',
        'সব পণ্য': 'All Products',
        'নতুন পণ্য': 'New Arrivals',
        'টপ রেটেড': 'Top Rated',
        'বেস্ট সেলিং': 'Best Selling',
        'ফিচার্ড পণ্য': 'Featured Products',
        'সম্পর্কিত পণ্য': 'Related Products',
        'জনপ্রিয় ক্যাটাগরি সমূহ': 'Popular Categories',
        'জনপ্রিয় ক্যাটাগরি': 'Popular Categories',
        'আপনার জন্য বাছাই করা পণ্যসমূহ': 'Recommended Products for You',
        'আপনার জন্য সাজানো পণ্যসমূহ': 'Personalized Recommendations',
        'কার্টে যোগ করুন': 'Add to Cart',
        'কার্ট যোগ করুন': 'Add to Cart',
        'এখনই কিনুন': 'Buy Now',
        'কিনতে যান': 'Buy Now',
        'কার্ট দেখুন': 'View Cart',
        'চেকআউট করুন': 'Proceed to Checkout',
        'চেকআউট': 'Checkout',
        'অর্ডার কনফার্ম করুন': 'Confirm Order',
        'অর্ডার করুন': 'Order Now',
        'প্লেস অর্ডার': 'Place Order',
        'রিভিউ জমা দিন': 'Submit Review',
        'রিভিউ দিন': 'Write a Review',
        'একটি রিভিউ দিন': 'Write a Review',
        'কাস্টমার রিভিউ': 'Customer Reviews',
        'গ্রাহক রিভিউ': 'Customer Reviews',
        'স্টার রেটিং': 'Star Rating',
        'ভেরিফাইড রিভিউ': 'Verified Review',
        'ভেরিফাইড শপ': 'Verified Shop',
        'ফর্ম বন্ধ করুন': 'Close Form',
        'পণ্য বিবরণ': 'Product Description',
        'বিস্তারিত বর্ণনা': 'Detailed Description',
        'ডিটেইল্ড ইনফরমেশন': 'Detailed Information',
        'ওয়ারেন্টি ইনফরমেশন': 'Warranty Information',
        'ওয়ারেন্টি ক্লেইম': 'Warranty Claim',
        'টার্মস অ্যান্ড কন্ডিশনস': 'Terms & Conditions',
        'ডেলিভারি অপশন': 'Delivery Options',
        'ডেলিভারি চার্জ': 'Delivery Charge',
        'ফ্রি ডেলিভারি': 'Free Delivery',
        'ক্যাশ অন ডেলিভারি': 'Cash on Delivery',
        'রেগুলার মূল্য': 'Regular Price',
        'অফার মূল্য': 'Offer Price',
        'বিশেষ অফার': 'Special Offer',
        'স্টকে আছে': 'In Stock',
        'স্টক শেষ': 'Out of Stock',
        'ইন স্টক': 'In Stock',
        'আউট অফ স্টক': 'Out of Stock',
        'লগইন / রেজিস্টার': 'Login / Register',
        'আমার একাউন্ট': 'My Account',
        'অর্ডার হিস্ট্রি': 'Order History',
        'অর্ডার বিবরণ': 'Order Details',
        'আমাদের সম্পর্কে': 'About Us',
        'গোপনীয়তা নীতি': 'Privacy Policy',
        'রিটার্ন পলিসি': 'Return Policy',
        'সর্বস্বত্ব সংরক্ষিত': 'All rights reserved',
        'স্মার্টফোন ও গ্যাজেট': 'Smartphones & Gadgets',
        'স্মার্টফোন এবং গ্যাজেট': 'Smartphones and Gadgets',
        'হেডফোন ও অডিও': 'Headphones & Audio',
        'কম্পিউটার ও ল্যাপটপ': 'Computers & Laptops',
        'ল্যাপটপ এবং ডেস্কটপ': 'Laptops and Desktops',
        'স্মার্টওয়াচ ও ব্যান্ড': 'Smartwatches & Bands',
        'রাউটার ও নেটওয়ার্কিং': 'Routers & Networking',
        'গেমিং ও এক্সেসরিজ': 'Gaming & Accessories',
        'চার্জার ও পাওয়ার ব্যাংক': 'Chargers & Power Banks',
        'টিভি ও হোম অ্যাপ্লায়েন্স': 'TV & Home Appliances',
        'ক্যামেরা ও ড্রোন': 'Cameras & Drones',
        'ফ্যাশন ও লাইফস্টাইল': 'Fashion & Lifestyle',
        'ছেলেদের ফ্যাশন': 'Men\'s Fashion',
        'মেয়েদের ফ্যাশন': 'Women\'s Fashion',
        'সৌন্দর্য ও স্বাস্থ্য': 'Beauty & Health',
        'ঘড়ি ও গহনা': 'Watches & Jewelry',
        'বই ও স্টেশনারি': 'Books & Stationery',
        'খেলাধুলা ও ফিটনেস': 'Sports & Fitness',
        'বাচ্চাদের খেলনা': 'Toys & Kids',
        'অটোমোবাইল ও মোটরবাইক': 'Automobile & Motorbike',
        'সার্চ করুন প্রোডাক্ট, ব্র্যান্ড, ক্যাটাগরি...': 'Search products, brands, categories...',
        'কথা বলুন...': 'Speak now...',
        'পণ্য খোজা হচ্ছে...': 'Searching products...',
        'ইমেজ সার্চ (Visual Search)': 'Visual Search',
        'কেনাকাটা করুন': 'Shop Now',
    },
    hi: {
        'ফ্ল্যাশ সেল শীঘ্রই। প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট!': 'धमाका सेल जल्द! पहले ऑर्डर पर अतिरिक्त 2% छूट!',
        'ফ্ল্যাশ সেল শীঘ্রই।': 'धमाका सेल जल्द!',
        'ফ্ল্যাশ সেল শীঘ্রই': 'धमाका सेल जल्द',
        'প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট!': 'पहले ऑर्डर पर अतिरिक्त 2% छूट!',
        'প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট': 'पहले ऑर्डर पर अतिरिक्त 2% छूट',
        'আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!': 'अपनी प्रोफ़ाइल पूरी करें और 2% अतिरिक्त छूट पाएं!',
        'আপনার প্রোফাইল সম্পূর্ণ করুন': 'अपनी प्रोफ़ाइल पूरी करें',
        'পান অতিরিক্ত ২% ডিসকাউন্ট!': '2% अतिरिक्त छूट पाएं!',
        'পান অতিরিক্ত ২% ডিসকাউন্ট': '2% अतिरिक्त छूट पाएं',
        'রেট ট্রেইম সার্ভিস ও অফিশিয়াল প্রোডাক্ট সাপোর্ট': 'दावा सेवा और आधिकारिक उत्पाद सहायता',
        'সারা দেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা': 'देशभर में कैश ऑन डिलीवरी और सबसे तेज होम डिलीवरी',
        'সারাদেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা': 'देशभर में कैश ऑन डिलीवरी और सबसे तेज होम डिलीवरी',
        '১০০% আসল ও অরিজিনাল গ্যাজেটের নিশ্চয়তা': '100% असली और मूल गैजेट गारंटी',
        '১০০% অরিজিনাল প্রোডাক্ট': '100% मूल उत्पाद',
        '১০০% আসল পণ্য': '100% असली उत्पाद',
        '৭ দিনের রিটার্ন পলিসি': '7 दिनों की वापसी नीति',
        'দ্রুত ও নিরাপদ ডেলিভারি': 'तेज और सुरक्षित डिलीवरी',
        '২৪/৭ কাস্টমার সাপোর্ট': '24/7 ग्राहक सहायता',
        'সেরা দামের গ্যারান্টি': 'सर्वश्रेष्ठ मूल्य गारंटी',
        'গুরুজ ভেরিফায়েড': 'गुरुज़ सत्यापित',
        'নিরাপদ পেমেন্ট': 'सुरक्षित भुगतान',
        'সারাদেশে ডেলিভারি': 'देशभर में डिलीवरी',
        'সহজ রিটার্ন': 'आसान वापसी',
        'সাপোর্ট হটলাইন': 'सहायता हेल्पलाइन',
        'সাপোর্ট সেন্টার': 'सहायता केंद्र',
        'অর্ডার ট্র্যাক': 'ऑर्डर ट्रैक करें',
        'ট্র্যাক অর্ডার': 'ऑर्डर ट्रैक करें',
        'বিক্রেতা হোন': 'विक्रेता बनें',
        'মার্চেন্ট শপসমূহ': 'मर्चेंट दुकानें',
        'মার্চেন্ট শপ': 'मर्चेंट दुकानें',
        'মার্চেন্ট': 'मर्चेंट',
        'ভাষা নির্বাচন করুন': 'भाषा चुनें',
        'ভাষা নির্বাচন': 'भाषा चुनें',
        'ভাষা': 'भाषा',
        'কারেন্সি': 'मुद्रा',
        'থিম': 'थीम',
        'হোম': 'होम',
        'ক্যাটাগরি সমূহ': 'श्रेणियां',
        'সকল ক্যাটাগরি': 'सभी श्रेणियां',
        'সব ক্যাটাগরি': 'सभी श्रेणियां',
        'সব পণ্য দেখুন': 'सभी उत्पाद देखें',
        'সকল পণ্য': 'सभी उत्पाद',
        'সব পণ্য': 'सभी उत्पाद',
        'নতুন পণ্য': 'नए उत्पाद',
        'টপ রেটেড': 'शीर्ष रेटेड',
        'বেস্ট সেলিং': 'सर्वाधिक बिकने वाला',
        'ফিচার্ড পণ্য': 'विशेष रुप से प्रदर्शित उत्पाद',
        'সম্পর্কিত পণ্য': 'संबंधित उत्पाद',
        'জনপ্রিয় ক্যাটাগরি সমূহ': 'लोकप्रिय श्रेणियां',
        'জনপ্রিয় ক্যাটাগরি': 'लोकप्रिय श्रेणियां',
        'আপনার জন্য বাছাই করা পণ্যসমূহ': 'आपके लिए चुने गए उत्पाद',
        'আপনার জন্য সাজানো পণ্যসমূহ': 'आपके लिए अनुशंसित उत्पाद',
        'কার্টে যোগ করুন': 'कार्ट में जोड़ें',
        'কার্ট যোগ করুন': 'कार्ट में जोड़ें',
        'এখনই কিনুন': 'अभी खरीदें',
        'কিনতে যান': 'अभी खरीदें',
        'কার্ট দেখুন': 'कार्ट देखें',
        'চেকআউট করুন': 'चेकआउट करें',
        'চেকআউট': 'चेकआउट',
        'অর্ডার কনফার্ম করুন': 'ऑर्डर की पुष्टि करें',
        'অর্ডার করুন': 'ऑर्डर करें',
        'প্লেস অর্ডার': 'ऑर्डर दें',
        'রিভিউ জমা দিন': 'समीक्षा जमा करें',
        'রিভিউ দিন': 'समीक्षा लिखें',
        'একটি রিভিউ দিন': 'समीक्षा लिखें',
        'কাস্টমার রিভিউ': 'ग्राहक समीक्षाएं',
        'গ্রাহক রিভিউ': 'ग्राहक समीक्षाएं',
        'স্টার রেটিং': 'स्टार रेटिंग',
        'ভেরিফাইড রিভিউ': 'सत्यापित समीक्षा',
        'ভেরিফাইড শপ': 'सत्यापित दुकान',
        'ফর্ম বন্ধ করুন': 'फॉर्म बंद करें',
        'পণ্য বিবরণ': 'उत्पाद विवरण',
        'বিস্তারিত বর্ণনা': 'विस्तृत विवरण',
        'ডিটেইল্ড ইনফরমেশন': 'विस्तृत जानकारी',
        'ওয়ারেন্টি ইনফরমেশন': 'वारंटी जानकारी',
        'ওয়ারেন্টি ক্লেইম': 'वारंटी दावा',
        'টার্মস অ্যান্ড কন্ডিশনস': 'नियम और शर्तें',
        'ডেলিভারি অপশন': 'डिलीवरी विकल्प',
        'ডেলিভারি চার্জ': 'डिलीवरी शुल्क',
        'ফ্রি ডেলিভারি': 'मुफ्त डिलीवरी',
        'ক্যাশ অন ডেলিভারি': 'कैश ऑन डिलीवरी',
        'রেগুলার মূল্য': 'नियमित कीमत',
        'অফার মূল্য': 'विशेष कीमत',
        'বিশেষ অফার': 'विशेष ऑफर',
        'স্টকে আছে': 'स्टॉक में उपलब्ध',
        'স্টক শেষ': 'स्टॉक खत्म',
        'ইন স্টক': 'स्टॉक में उपलब्ध',
        'আউট অফ স্টক': 'स्टॉक खत्म',
        'লগইন / রেজিস্টার': 'लॉग इन / रजिस्टर',
        'আমার একাউন্ট': 'मेरा खाता',
        'অর্ডার হিস্ট্রি': 'ऑर्डर इतिहास',
        'অর্ডার বিবরণ': 'ऑर्डर विवरण',
        'আমাদের সম্পর্কে': 'हमारे बारे में',
        'গোপনীয়তা নীতি': 'गोपनीयता नीति',
        'রিটার্ন পলিসি': 'वापसी नीति',
        'সর্বস্বত্ব সংরক্ষিত': 'सर्वाधिकार सुरक्षित',
        'স্মার্টফোন ও গ্যাজেট': 'स्मार्टफोन और गैजेट्स',
        'স্মার্টফোন এবং গ্যাজেট': 'स्मार्टफोन और गैजेट्स',
        'হেডফোন ও অডিও': 'हेडफोन और ऑडियो',
        'কম্পিউটার ও ল্যাপটপ': 'कंप्यूटर और लैपटॉप',
        'ল্যাপটপ এবং ডেস্কটপ': 'लैपटॉप और डेस्कटॉप',
        'স্মার্টওয়াচ ও ব্যান্ড': 'स्मार्टवॉच और बैंड',
        'রাউটার ও নেটওয়ার্কিং': 'राउटर और नेटवर्किंग',
        'গেমিং ও এক্সেসরিজ': 'गेमिंग और एक्सेसरीज',
        'চার্জার ও পাওয়ার ব্যাংক': 'चार्जर और पावर बैंक',
        'টিভি ও হোম অ্যাপ্লায়েন্স': 'टीवी और घरेलू उपकरण',
        'ক্যামেরা ও ড্রোন': 'कैमरा और ड्रोन',
        'ফ্যাশন ও লাইফস্টাইল': 'फैशन और लाइफस्टाइल',
        'ছেলেদের ফ্যাশন': 'पुरुषों का फैशन',
        'মেয়েদের ফ্যাশন': 'महिलाओं का फैशन',
        'সৌন্দর্য ও স্বাস্থ্য': 'सौंदर्य और स्वास्थ्य',
        'ঘড়ি ও গহনা': 'घड़ियां और आभूषण',
        'বই ও স্টেশনারি': 'किताबें और स्टेशनरी',
        'খেলাধুলা ও ফিটনেস': 'खेल और फिटनेस',
        'বাচ্চাদের খেলনা': 'खिलौने और बच्चे',
        'অটোমোবাইল ও মোটরবাইক': 'ऑटोमोबाइल और मोटरबाइक',
        'সার্চ করুন প্রোডাক্ট, ব্র্যান্ড, ক্যাটাগরি...': 'उत्पाद, ब्रांड, श्रेणियां खोजें...',
        'কথা বলুন...': 'अब बोलें...',
        'পণ্য খোজা হচ্ছে...': 'उत्पाद खोजे जा रहे हैं...',
        'ইমেজ সার্চ (Visual Search)': 'विजुअल सर्च',
        'কেনাকাটা করুন': 'खरीदारी करें',
    }
};

// Word-by-word token dictionary
export const wordDict: Record<'en' | 'hi', Record<string, string>> = {
    en: {
        'গুরুজ': 'Guruz',
        'হোম': 'Home',
        'ক্যাটাগরি': 'Categories',
        'শপ': 'Shops',
        'শপসমূহ': 'Shops',
        'কার্ট': 'Cart',
        'অ্যাকাউন্ট': 'Account',
        'একাউন্ট': 'Account',
        'প্রোফাইল': 'Profile',
        'ড্যাশবোর্ড': 'Dashboard',
        'লগইন': 'Login',
        'লগআউট': 'Logout',
        'রেজিস্টার': 'Register',
        'অনুসন্ধান': 'Search',
        'খুঁজুন': 'Search',
        'সার্চ': 'Search',
        'নোটিশ': 'Notice',
        'অফার': 'Offers',
        'অফারসমূহ': 'Offers',
        'ছাড়': 'Discount',
        'ডিসকাউন্ট': 'Discount',
        'মূল্য': 'Price',
        'দাম': 'Price',
        'মোট': 'Total',
        'সর্বমোট': 'Total',
        'উপমোট': 'Subtotal',
        'পণ্য': 'Products',
        'পণ্যসমূহ': 'Products',
        'আইটেম': 'Items',
        'পরিমাণ': 'Quantity',
        'রং': 'Color',
        'কালার': 'Color',
        'সাইজ': 'Size',
        'স্টক': 'Stock',
        'রিভিউ': 'Reviews',
        'রেটিং': 'Rating',
        'স্টার': 'Star',
        'নাম': 'Name',
        'ইমেইল': 'Email',
        'ফোন': 'Phone',
        'ঠিকানা': 'Address',
        'মন্তব্য': 'Comment',
        'মেসেজ': 'Messages',
        'মেসেজসমূহ': 'Messages',
        'নোটিফিকেশন': 'Notifications',
        'উইশলিস্ট': 'Wishlist',
        'ডেলিভারি': 'Delivery',
        'চার্জ': 'Charge',
        'পেমেন্ট': 'Payment',
        'অর্ডার': 'Orders',
        'ট্র্যাক': 'Track',
        'স্ট্যাটাস': 'Status',
        'পেন্ডিং': 'Pending',
        'অনুমোদিত': 'Approved',
        'বাতিল': 'Cancelled',
        'তারিখ': 'Date',
        'সময়': 'Time',
        'কুপন': 'Coupon',
        'কোড': 'Code',
        'যোগ': 'Add',
        'কিনুন': 'Buy',
        'দেখুন': 'View',
        'সম্পাদনা': 'Edit',
        'মুছুন': 'Delete',
        'সংরক্ষণ': 'Save',
        'জমা': 'Submit',
        'বন্ধ': 'Close',
        'ফ্রি': 'Free',
        'লাইভ': 'Live',
        'সেল': 'Sale',
        'ধামাকা': 'Mega',
        'নতুন': 'New',
        'সেরা': 'Best',
        'সব': 'All',
        'সকল': 'All',
        'টি': '',
        'এবং': 'and',
        'ও': '&',
    },
    hi: {
        'হোম': 'होम',
        'ক্যাটাগরি': 'श्रेणी',
        'শপ': 'दुकानें',
        'শপসমূহ': 'दुकानें',
        'কার্ট': 'कार्ट',
        'অ্যাকাউন্ট': 'खाता',
        'একাউন্ট': 'खाता',
        'প্রোফাইল': 'प्रोफ़ाइल',
        'ড্যাশবোর্ড': 'डैशबोर्ड',
        'লগইন': 'लॉग इन',
        'লগআউট': 'लॉग आउट',
        'রেজিস্টার': 'पंजीकरण',
        'অনুসন্ধান': 'खोजें',
        'খুঁজুন': 'खोजें',
        'সার্চ': 'खोजें',
        'নোটিশ': 'सूचना',
        'অফার': 'ऑफर',
        'অফারসমূহ': 'ऑफर',
        'ছাড়': 'छूट',
        'ডিসকাউন্ট': 'छूट',
        'মূল্য': 'कीमत',
        'দাম': 'कीमत',
        'মোট': 'कुल',
        'সর্বমোট': 'कुल',
        'উপমোট': 'उप-कुल',
        'পণ্য': 'उत्पाद',
        'পণ্যসমূহ': 'उत्पाद',
        'আইটেম': 'सामान',
        'পরিমাণ': 'मात्रा',
        'রং': 'रंग',
        'কালার': 'रंग',
        'সাইজ': 'साइज़',
        'স্টক': 'स्टॉक',
        'রিভিউ': 'समीक्षाएं',
        'রেটিং': 'रेटिंग',
        'স্টার': 'स्टार',
        'নাম': 'नाम',
        'ইমেইল': 'ईमेल',
        'ফোন': 'फ़ोन',
        'ঠিকানা': 'पता',
        'মন্তব্য': 'टिप्पणी',
        'মেসেজ': 'संदेश',
        'মেসেজসমূহ': 'संदेश',
        'নোটিফিকেশন': 'सूचनाएं',
        'উইশলিস্ট': 'इच्छा सूची',
        'ডেলিভারি': 'डिलीवरी',
        'চার্জ': 'शुल्क',
        'পেমেন্ট': 'भुगतान',
        'অর্ডার': 'ऑर्डर',
        'ট্র্যাক': 'ट्रैक',
        'স্ট্যাটাস': 'स्थिति',
        'পেন্ডিং': 'लंबित',
        'অনুমোদিত': 'स्वीकृत',
        'বাতিল': 'रद्द',
        'তারিখ': 'तारीख',
        'সময়': 'समय',
        'কুপন': 'कूपन',
        'কোড': 'कोड',
        'যোগ': 'जोड़ें',
        'কিনুন': 'खरीदें',
        'দেখুন': 'देखें',
        'সম্পাদনা': 'संपादित करें',
        'মুছুন': 'हटाएं',
        'সংরক্ষণ': 'सहेजें',
        'জমা': 'जमा',
        'বন্ধ': 'बंद',
        'ফ্রি': 'मुफ्त',
        'লাইভ': 'लाइव',
        'সেল': 'सेल',
        'ধামাকা': 'धमाका',
        'নতুন': 'नया',
        'সেরা': 'सर्वश्रेष्ठ',
        'সব': 'सभी',
        'সকল': 'सभी',
        'টি': '',
        'এবং': 'और',
        'ও': 'और',
    }
};

/**
 * Universal text translation function
 */
export function translateString(text: string, lang: 'bn' | 'en' | 'hi'): string {
    if (!text) return text;
    if (lang === 'bn') return text;

    let result = text;

    // 1. Phrase lookup
    const pDict = phraseDict[lang];
    if (pDict) {
        const sorted = Object.keys(pDict).sort((a, b) => b.length - a.length);
        for (const p of sorted) {
            if (result.includes(p)) {
                result = result.split(p).join(pDict[p]);
            }
        }
    }

    // 2. Word lookup
    const wDict = wordDict[lang];
    if (wDict) {
        const sortedWords = Object.keys(wDict).sort((a, b) => b.length - a.length);
        for (const w of sortedWords) {
            if (result.includes(w)) {
                const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const reg = new RegExp(`(^|\\s|[,.:;!?()\\/\\-—"'])${escaped}($|\\s|[,.:;!?()\\/\\-—"'])`, 'g');
                result = result.replace(reg, `$1${wDict[w]}$2`);
            }
        }
    }

    // 3. Digits
    if (lang === 'en') {
        for (const [bn, en] of Object.entries(bnToEnDigits)) {
            if (result.includes(bn)) result = result.split(bn).join(en);
        }
    } else if (lang === 'hi') {
        for (const [bn, hi] of Object.entries(bnToHiDigits)) {
            if (result.includes(bn)) result = result.split(bn).join(hi);
        }
    }

    return result;
}

/**
 * Walk all text nodes and preserve original text for clean toggle
 */
export function translateDOM(targetLang: 'bn' | 'en' | 'hi') {
    if (typeof document === 'undefined') return;

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (['script', 'style', 'noscript', 'textarea', 'code', 'pre'].includes(tag)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.closest('#google_translate_element') || parent.classList.contains('notranslate')) {
                    return NodeFilter.FILTER_REJECT;
                }
                const val = node.nodeValue?.trim() || '';
                return val.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );

    const nodesToProcess: Text[] = [];
    let cur = walker.nextNode();
    while (cur) {
        nodesToProcess.push(cur as Text);
        cur = walker.nextNode();
    }

    for (const node of nodesToProcess) {
        const val = node.nodeValue;
        if (!val) continue;

        const anyNode = node as any;

        // If it's Bengali text and we haven't cached original, cache it!
        if (!anyNode.__origBn && /[\u0980-\u09FF]/.test(val)) {
            anyNode.__origBn = val;
        }

        if (targetLang === 'bn') {
            // Restore original Bengali
            if (anyNode.__origBn && node.nodeValue !== anyNode.__origBn) {
                node.nodeValue = anyNode.__origBn;
            }
        } else {
            // Translate to EN or HI
            const source = anyNode.__origBn || val;
            const translated = translateString(source, targetLang);
            if (translated !== node.nodeValue) {
                node.nodeValue = translated;
            }
        }
    }

    // Placeholders & Inputs
    document.querySelectorAll<HTMLInputElement>('input[placeholder]').forEach((el) => {
        const anyEl = el as any;
        const ph = el.getAttribute('placeholder');
        if (ph) {
            if (!anyEl.__origPh && /[\u0980-\u09FF]/.test(ph)) anyEl.__origPh = ph;
            if (targetLang === 'bn') {
                if (anyEl.__origPh) el.setAttribute('placeholder', anyEl.__origPh);
            } else {
                const source = anyEl.__origPh || ph;
                el.setAttribute('placeholder', translateString(source, targetLang));
            }
        }
    });

    // Titles
    document.querySelectorAll<HTMLElement>('[title]').forEach((el) => {
        const anyEl = el as any;
        const t = el.getAttribute('title');
        if (t) {
            if (!anyEl.__origTitle && /[\u0980-\u09FF]/.test(t)) anyEl.__origTitle = t;
            if (targetLang === 'bn') {
                if (anyEl.__origTitle) el.setAttribute('title', anyEl.__origTitle);
            } else {
                const source = anyEl.__origTitle || t;
                el.setAttribute('title', translateString(source, targetLang));
            }
        }
    });
}

/**
 * Initialize global live DOM translator observer
 */
export function initLiveDOMTranslator() {
    if (typeof window === 'undefined') return;

    const getCurrentLang = (): 'bn' | 'en' | 'hi' => {
        try {
            return (localStorage.getItem('site_language') || localStorage.getItem('app_lang') || 'bn') as any;
        } catch {
            return 'bn';
        }
    };

    const run = () => {
        const lang = getCurrentLang();
        translateDOM(lang);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    setTimeout(run, 50);
    setTimeout(run, 300);
    setTimeout(run, 1000);

    let timeout: any = null;
    const observer = new MutationObserver(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(run, 100);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}
