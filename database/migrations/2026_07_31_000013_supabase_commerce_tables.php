<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MIGRATION: Guruz E-Commerce - Core Commerce Tables
 * Converted from Supabase PostgreSQL → Laravel MySQL
 * Source: 20260702140359, 20260702154911, 20260702192641
 * Tables: hero_slides, flash_sales, flash_sale_products,
 *         earnings_ledger, payout_requests
 */
return new class extends Migration
{
    private function make(string $table, \Closure $cb): void
    {
        if (!Schema::hasTable($table)) Schema::create($table, $cb);
    }

    public function up(): void
    {
        // HERO SLIDES (from 20260702154911)
        $this->make('hero_slides', function (Blueprint $t) {
            $t->id();
            $t->string('title_en');
            $t->string('title_bn')->nullable();
            $t->string('subtitle_en')->nullable();
            $t->string('subtitle_bn')->nullable();
            $t->string('cta_label_en')->nullable();
            $t->string('cta_label_bn')->nullable();
            $t->string('cta_url')->nullable();
            $t->string('image_url')->nullable();
            $t->string('mobile_image_url')->nullable();
            $t->string('bg_color')->nullable();
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        // FLASH SALES (from 20260702140359)
        $this->make('flash_sales', function (Blueprint $t) {
            $t->id();
            $t->string('title_en');
            $t->string('title_bn')->nullable();
            $t->timestamp('starts_at')->useCurrent();
            $t->timestamp('ends_at')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // FLASH SALE PRODUCTS
        $this->make('flash_sale_products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('flash_sale_id')->constrained('flash_sales')->onDelete('cascade');
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->decimal('sale_price', 12, 2);
            $t->unique(['flash_sale_id', 'product_id']);
            $t->timestamps();
        });

        // EARNINGS LEDGER (from 20260702192641)
        $this->make('earnings_ledger', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $t->decimal('amount', 12, 2);
            $t->string('type'); // sale, refund, adjustment, payout
            $t->text('note')->nullable();
            $t->timestamps();
        });

        // PAYOUT REQUESTS (from 20260702192641)
        $this->make('payout_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->decimal('amount', 12, 2);
            $t->string('bank_name')->nullable();
            $t->string('account_number')->nullable();
            $t->string('account_name')->nullable();
            $t->enum('status', ['pending', 'approved', 'paid', 'rejected'])->default('pending');
            $t->text('admin_note')->nullable();
            $t->timestamp('paid_at')->nullable();
            $t->timestamps();
        });

        // PRODUCT BRANDS (from 20260705125331)
        $this->make('product_brands', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('logo_url')->nullable();
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
        });

        // PRODUCT UNITS (from 20260705125331)
        $this->make('product_units', function (Blueprint $t) {
            $t->id();
            $t->string('name_en');
            $t->string('name_bn')->nullable();
            $t->string('short')->nullable(); // kg, pcs, ltr
            $t->timestamps();
        });

        // PRODUCT ATTRIBUTES (from 20260705125331)
        $this->make('product_attributes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->string('name'); // Color, Size, Weight
            $t->json('values'); // ["Red","Blue","Green"]
            $t->timestamps();
        });

        // PRODUCT QUESTIONS (from 20260704135124)
        $this->make('product_questions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->text('question');
            $t->boolean('is_answered')->default(false);
            $t->timestamps();
        });

        // PRODUCT ANSWERS (from 20260704135124)
        $this->make('product_answers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('question_id')->constrained('product_questions')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->text('answer');
            $t->timestamps();
        });

        // PRODUCT MESSAGES (from 20260704135124)
        $this->make('product_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->text('message');
            $t->boolean('is_read')->default(false);
            $t->timestamps();
        });

        // WISHLISTS (from 20260704135124)
        $this->make('wishlists', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->unique(['user_id', 'product_id']);
            $t->timestamps();
        });

        // COURIERS (from 20260703030854)
        $this->make('couriers', function (Blueprint $t) {
            $t->id();
            $t->string('name'); // steadfast, pathao, carrybee, redx
            $t->string('api_key')->nullable();
            $t->string('api_secret')->nullable();
            $t->string('base_url')->nullable();
            $t->boolean('is_active')->default(true);
            $t->json('config')->nullable();
            $t->timestamps();
        });

        // SHIPMENTS (from 20260703030854)
        $this->make('shipments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $t->foreignId('courier_id')->nullable()->constrained('couriers')->onDelete('set null');
            $t->string('tracking_id')->nullable();
            $t->string('consignment_id')->nullable();
            $t->enum('status', ['pending', 'picked', 'in_transit', 'delivered', 'returned'])->default('pending');
            $t->json('tracking_events')->nullable();
            $t->decimal('charge', 10, 2)->default(0);
            $t->timestamps();
        });

        // SHOP BANK INFO (from 20260703130441)
        $this->make('shop_bank_info', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->unique()->constrained('shops')->onDelete('cascade');
            $t->string('bank_name')->nullable();
            $t->string('account_number')->nullable();
            $t->string('account_name')->nullable();
            $t->string('branch')->nullable();
            $t->string('routing_number')->nullable();
            $t->string('bkash_number')->nullable();
            $t->string('nagad_number')->nullable();
            $t->timestamps();
        });

        // SHOP FOLLOWERS (from 20260703141210)
        $this->make('shop_followers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->unique(['shop_id', 'user_id']);
            $t->timestamps();
        });

        // SHOP REVIEWS (from 20260710094531)
        $this->make('shop_reviews', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->tinyInteger('rating'); // 1-5
            $t->text('comment')->nullable();
            $t->boolean('is_verified')->default(false);
            $t->timestamps();
        });

        // NOTIFICATIONS (from 20260702145215)
        $this->make('notifications', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->string('type'); // order_update, promo, wallet, system
            $t->string('title');
            $t->text('body')->nullable();
            $t->string('link')->nullable();
            $t->string('icon')->nullable();
            $t->boolean('is_read')->default(false);
            $t->timestamps();
        });

        // SITE SETTINGS (from 20260702144412) — already exists, skip
        // customer_wallets / seller_wallets — already done

        // SUPPORT TICKETS (from 20260702150321)
        $this->make('support_tickets', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $t->string('subject');
            $t->text('description')->default('');
            $t->string('status')->default('open'); // open, in_progress, resolved, closed
            $t->string('priority')->default('normal'); // low, normal, high, urgent
            $t->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $t->timestamps();
        });

        // TICKET REPLIES
        $this->make('ticket_replies', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ticket_id')->constrained('support_tickets')->onDelete('cascade');
            $t->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $t->text('body');
            $t->boolean('is_admin_reply')->default(false);
            $t->timestamps();
        });

        // PHONE OTPs (from 20260704174644)
        $this->make('phone_otps', function (Blueprint $t) {
            $t->id();
            $t->string('phone');
            $t->string('otp', 10);
            $t->string('purpose')->default('login'); // login, register, reset
            $t->boolean('is_used')->default(false);
            $t->timestamp('expires_at');
            $t->timestamps();
            $t->index('phone');
        });

        // COUPONS update (from 20260702150321) — already exists
        // but add min_order_amount if missing
        if (Schema::hasTable('coupons') && !Schema::hasColumn('coupons', 'min_order_amount')) {
            Schema::table('coupons', function (Blueprint $t) {
                $t->decimal('min_order_amount', 10, 2)->default(0)->after('discount_value');
                $t->decimal('max_discount', 10, 2)->nullable()->after('min_order_amount');
            });
        }
    }

    public function down(): void
    {
        $tables = [
            'ticket_replies', 'support_tickets', 'notifications',
            'shop_reviews', 'shop_followers', 'shop_bank_info',
            'shipments', 'couriers', 'wishlists', 'product_messages',
            'product_answers', 'product_questions', 'product_attributes',
            'product_units', 'product_brands', 'payout_requests',
            'earnings_ledger', 'flash_sale_products', 'flash_sales',
            'hero_slides', 'phone_otps',
        ];
        foreach (array_reverse($tables) as $t) {
            Schema::dropIfExists($t);
        }
    }
};
