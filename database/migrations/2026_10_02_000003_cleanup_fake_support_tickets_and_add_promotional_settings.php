<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Delete all fake auto-seeded support tickets
        if (Schema::hasTable('vendor_support_tickets')) {
            DB::table('vendor_support_tickets')
                ->whereIn('ticket_number', ['#TKT-991', '#TKT-985', '#TKT-942'])
                ->delete();
        }

        // 2. Set default promotional section labels in site_settings if not already set
        if (Schema::hasTable('site_settings')) {
            $defaultLabels = [
                'promo_label_flash_sale' => '⚡ Flash Sale / ফ্ল্যাশ সেল সেকশনে যোগ করুন',
                'promo_label_featured'   => '⭐ Guruz Verified / Featured Product',
                'promo_label_special'    => '🎁 Guruz Special / গুরুজ স্পেশাল সেকশনে যোগ করুন',
            ];

            foreach ($defaultLabels as $key => $val) {
                $exists = DB::table('site_settings')->where('key', $key)->exists();
                if (!$exists) {
                    DB::table('site_settings')->insert([
                        'key'        => $key,
                        'value'      => $val,
                        'group'      => 'promotions',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed for cleanup
    }
};
