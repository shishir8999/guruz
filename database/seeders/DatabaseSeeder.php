<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Shop;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Super Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@guruz.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('password'),
                'phone'    => '01700000000',
            ]
        );
        UserRole::firstOrCreate(['user_id' => $admin->id, 'role' => 'admin']);

        // 2. Create Seller User & Shop
        $seller = User::firstOrCreate(
            ['email' => 'seller@guruz.com'],
            [
                'name'     => 'Guruz Official Store',
                'password' => Hash::make('password'),
                'phone'    => '01800000000',
            ]
        );
        UserRole::firstOrCreate(['user_id' => $seller->id, 'role' => 'vendor']);

        $shop = Shop::firstOrCreate(
            ['user_id' => $seller->id],
            [
                'name'            => 'Guruz Official Gadgets & Electronics',
                'slug'            => 'guruz-official',
                'status'          => 'active',
                'commission_rate' => 5.00,
                'rating'          => 4.90,
            ]
        );

        // 3. Create Demo Customer User
        $customer = User::firstOrCreate(
            ['email' => 'customer@guruz.com'],
            [
                'name'     => 'Shishir Ahmed',
                'password' => Hash::make('password'),
                'phone'    => '01900000000',
            ]
        );
        UserRole::firstOrCreate(['user_id' => $customer->id, 'role' => 'customer']);

        // 4. Create Real Categories
        $categoriesData = [
            ['slug' => 'electronics', 'name' => 'ইলেকট্রনিক্স', 'icon' => '⚡'],
            ['slug' => 'fashion', 'name' => '👗 ফ্যাশন', 'icon' => '👗'],
            ['slug' => 'beauty', 'name' => '💄 বিউটি', 'icon' => '💄'],
            ['slug' => 'grocery', 'name' => '🛒 গ্রোসারি', 'icon' => '🛒'],
            ['slug' => 'home-living', 'name' => '🏠 ঘর ও লিভিং', 'icon' => '🏠'],
            ['slug' => 'mobile', 'name' => '📲 মোবাইল', 'icon' => '📲'],
            ['slug' => 'baby', 'name' => '🍼 বেবি', 'icon' => '🍼'],
            ['slug' => 'sports', 'name' => '⚽ স্পোর্টস', 'icon' => '⚽'],
            ['slug' => 'books', 'name' => '📚 বই', 'icon' => '📚'],
        ];

        $categoriesMap = [];
        foreach ($categoriesData as $c) {
            $categoriesMap[$c['slug']] = Category::firstOrCreate(
                ['slug' => $c['slug']],
                ['name' => $c['name'], 'icon' => $c['icon']]
            );
        }

        $brand = Brand::firstOrCreate(
            ['slug' => 'guruz-brand'],
            ['name' => 'Guruz Authorized']
        );

        // 5. Create Real Products matching guruzbd.com
        $realProducts = [
            [
                'name' => 'UGREEN CR113 4-in-1 USB 3.0 Hub',
                'slug' => 'ugreen-cr113-4-in-1-usb-hub',
                'price' => 1450.00,
                'sale_price' => 1190.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Anker Soundcore R50i True Wireless Earbuds',
                'slug' => 'anker-soundcore-r50i',
                'price' => 2200.00,
                'sale_price' => 1790.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Anker Soundcore R60i NC Active Noise Cancelling',
                'slug' => 'anker-soundcore-r60i-nc',
                'price' => 3200.00,
                'sale_price' => 2650.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'OLAX M100 সিম সাপোর্টেড পকেট রাউটার 4G',
                'slug' => 'olax-m100-pocket-router',
                'price' => 2850.00,
                'sale_price' => 2290.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'TP-Link Archer C80 AC1900 Dual-Band Gigabit Router',
                'slug' => 'tp-link-archer-c80',
                'price' => 4500.00,
                'sale_price' => 3890.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'TP-Link Archer C6 AC1200 Gigabit Router',
                'slug' => 'tp-link-archer-c6',
                'price' => 3400.00,
                'sale_price' => 2850.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Logitech K120 USB Keyboard (Official Warranted)',
                'slug' => 'logitech-k120-keyboard',
                'price' => 850.00,
                'sale_price' => 690.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'A4TECH OP-730D 2X Click Optical Wired Mouse',
                'slug' => 'a4tech-op-730d-mouse',
                'price' => 650.00,
                'sale_price' => 490.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Logitech B100 Optical USB Mouse',
                'slug' => 'logitech-b100-mouse',
                'price' => 550.00,
                'sale_price' => 450.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Boya BY-M1 Pro II 3.5mm Lavalier Microphone',
                'slug' => 'boya-by-m1-pro-ii',
                'price' => 1650.00,
                'sale_price' => 1350.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'MAONO PD100X RGB USB/XLR Dynamic Microphone',
                'slug' => 'maono-pd100x-mic',
                'price' => 4800.00,
                'sale_price' => 4200.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'FIFINE AmpliGame AM8 RGB USB/XLR Microphone',
                'slug' => 'fifine-am8-mic',
                'price' => 5500.00,
                'sale_price' => 4850.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500',
                'category_slug' => 'electronics',
            ],
            [
                'name' => 'Osaka FP 126-P Portable Electric Juicer Blender',
                'slug' => 'osaka-fp-126-p-juicer',
                'price' => 1850.00,
                'sale_price' => 1390.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500',
                'category_slug' => 'home-living',
            ],
            [
                'name' => 'Miyako LK0508 Electric Fast Boiling Kettle 2L',
                'slug' => 'miyako-lk0508-kettle',
                'price' => 1350.00,
                'sale_price' => 990.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500',
                'category_slug' => 'home-living',
            ],
            [
                'name' => 'Prestige Mini Multi Cooker 2L Non-Stick',
                'slug' => 'prestige-mini-multi-cooker',
                'price' => 2400.00,
                'sale_price' => 1850.00,
                'primary_image_url' => 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500',
                'category_slug' => 'home-living',
            ],
        ];

        $i = 1;
        foreach ($realProducts as $p) {
            $cat = $categoriesMap[$p['category_slug']] ?? reset($categoriesMap);
            Product::firstOrCreate(
                ['slug' => $p['slug']],
                [
                    'shop_id'           => $shop->id,
                    'category_id'       => $cat->id,
                    'brand_id'          => $brand->id,
                    'name'              => $p['name'],
                    'sku'               => 'GRZ-PROD-' . ($i++),
                    'price'             => $p['price'],
                    'sale_price'        => $p['sale_price'],
                    'stock_quantity'    => 50,
                    'description'       => 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.',
                    'primary_image_url' => $p['primary_image_url'],
                    'rating'            => 4.90,
                    'total_reviews'     => rand(15, 80),
                    'is_featured'       => true,
                    'is_active'         => true,
                ]
            );
        }

        // 6. Seed CMS Pages
        if (\Illuminate\Support\Facades\DB::table('cms_pages')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('cms_pages')->insert([
                ['title' => 'About Us', 'slug' => 'about-us', 'content' => json_encode(['html' => '<p>Welcome to Guruz BD</p>']), 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Privacy Policy', 'slug' => 'privacy-policy', 'content' => json_encode(['html' => '<p>Privacy matters</p>']), 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Terms & Conditions', 'slug' => 'terms-and-conditions', 'content' => json_encode(['html' => '<p>Terms of service</p>']), 'is_active' => false, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // 7. Seed Blog Data
        if (\Illuminate\Support\Facades\DB::table('blog_categories')->count() === 0) {
            $blogCatId = \Illuminate\Support\Facades\DB::table('blog_categories')->insertGetId([
                'name' => 'Technology', 'slug' => 'technology', 'created_at' => now(), 'updated_at' => now()
            ]);
            \Illuminate\Support\Facades\DB::table('blog_categories')->insert([
                ['name' => 'Guides', 'slug' => 'guides', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Announcements', 'slug' => 'announcements', 'created_at' => now(), 'updated_at' => now()],
            ]);

            $postId = \Illuminate\Support\Facades\DB::table('blog_posts')->insertGetId([
                'title' => 'Top 10 Gadgets of 2026', 'slug' => 'top-10-gadgets-2026', 'category_id' => $blogCatId,
                'author_id' => $admin->id, 'content' => 'Lorem ipsum...', 'is_published' => true, 'created_at' => now(), 'updated_at' => now()
            ]);

            \Illuminate\Support\Facades\DB::table('blog_comments')->insert([
                ['post_id' => $postId, 'user_id' => $customer->id, 'author_name' => $customer->name, 'body' => 'Great list!', 'is_approved' => true, 'created_at' => now(), 'updated_at' => now()]
            ]);

            \Illuminate\Support\Facades\DB::table('blog_tags')->insert([
                ['name' => 'Smartphone', 'slug' => 'smartphone', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Laptop', 'slug' => 'laptop', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }
}
