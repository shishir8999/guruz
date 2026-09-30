<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * MIGRATION: Guruz E-Commerce - Admin & CMS Tables
 * Converted from Supabase PostgreSQL → Laravel MySQL
 * Source: 20260702145215, 20260702150321, 20260710074602,
 *         20260709111958, 20260712144526, 20260716141609
 * Tables: staff, blog, cms, campaigns, seller_courier_accounts,
 *         stock_transfers, shop_badges, email_send_log, etc.
 */
return new class extends Migration
{
    private function make(string $table, \Closure $cb): void
    {
        if (!Schema::hasTable($table)) Schema::create($table, $cb);
    }

    public function up(): void
    {
        // STAFF (from 20260702145215)
        $this->make('staff', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $t->string('department')->nullable(); // admin, warehouse, customer_care
            $t->string('position')->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        // STAFF PERMISSIONS (from 20260718145227)
        $this->make('staff_permissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->string('permission'); // orders.view, products.manage, etc.
            $t->timestamps();
            $t->unique(['user_id', 'permission']);
        });

        // CUSTOM ROLES (from 20260702145215)
        $this->make('custom_roles', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('display_name')->nullable();
            $t->text('description')->nullable();
            $t->timestamps();
        });

        // PERMISSIONS (from 20260702145215)
        $this->make('permissions', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique(); // orders.view, products.create
            $t->string('group')->nullable(); // orders, products, users
            $t->timestamps();
        });

        // ROLE PERMISSIONS (from 20260702145215)
        $this->make('role_permissions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('role_id')->constrained('custom_roles')->onDelete('cascade');
            $t->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $t->unique(['role_id', 'permission_id']);
            $t->timestamps();
        });

        // CMS PAGES (from 20260702150321)
        $this->make('cms_pages', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->json('content')->nullable();
            $t->string('meta_title')->nullable();
            $t->text('meta_description')->nullable();
            $t->boolean('is_published')->default(false);
            $t->timestamps();
        });

        // BLOG CATEGORIES (from 20260702150321)
        $this->make('blog_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->timestamps();
        });

        // BLOG TAGS (from 20260702150321)
        $this->make('blog_tags', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->timestamps();
        });

        // BLOG POSTS (from 20260702150321)
        $this->make('blog_posts', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->text('excerpt')->nullable();
            $t->longText('content')->default('');
            $t->string('cover_url')->nullable();
            $t->foreignId('category_id')->nullable()->constrained('blog_categories')->onDelete('set null');
            $t->foreignId('author_id')->nullable()->constrained('users')->onDelete('set null');
            $t->boolean('is_published')->default(false);
            $t->timestamp('published_at')->nullable();
            $t->timestamps();
        });

        // BLOG POST TAGS
        $this->make('blog_post_tags', function (Blueprint $t) {
            $t->foreignId('post_id')->constrained('blog_posts')->onDelete('cascade');
            $t->foreignId('tag_id')->constrained('blog_tags')->onDelete('cascade');
            $t->primary(['post_id', 'tag_id']);
        });

        // BLOG COMMENTS (from 20260702150321)
        $this->make('blog_comments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('post_id')->constrained('blog_posts')->onDelete('cascade');
            $t->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $t->string('author_name')->nullable();
            $t->text('body');
            $t->boolean('is_approved')->default(false);
            $t->timestamps();
        });

        // EMAIL TEMPLATES (from 20260702150321)
        $this->make('email_templates', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('subject');
            $t->longText('body_html')->default('');
            $t->json('variables')->nullable(); // ["name", "order_id"]
            $t->timestamps();
        });

        // SMS TEMPLATES (from 20260702150321)
        $this->make('sms_templates', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->text('body')->default('');
            $t->json('variables')->nullable();
            $t->timestamps();
        });

        // CAMPAIGNS (from 20260702150321)
        $this->make('campaigns', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('channel')->default('email'); // email, sms, whatsapp, push
            $t->string('status')->default('draft'); // draft, scheduled, sent, failed
            $t->string('subject')->nullable();
            $t->text('body')->nullable();
            $t->timestamp('scheduled_at')->nullable();
            $t->timestamp('sent_at')->nullable();
            $t->integer('recipients_count')->default(0);
            $t->timestamps();
        });

        // FORM SUBMISSIONS (from 20260702150321)
        $this->make('form_submissions', function (Blueprint $t) {
            $t->id();
            $t->string('form_name')->default('contact');
            $t->string('name')->nullable();
            $t->string('email')->nullable();
            $t->string('phone')->nullable();
            $t->text('message')->nullable();
            $t->json('extra')->nullable();
            $t->string('status')->default('new'); // new, read, replied
            $t->timestamps();
        });

        // API KEYS (from 20260702150321)
        $this->make('api_keys', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('key_prefix', 20);
            $t->string('key_hash');
            $t->json('scopes')->nullable();
            $t->timestamp('last_used_at')->nullable();
            $t->boolean('is_revoked')->default(false);
            $t->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $t->timestamps();
        });

        // KB ARTICLES (Knowledge Base — from 20260702150321)
        $this->make('kb_articles', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->string('category')->nullable();
            $t->longText('body')->default('');
            $t->boolean('is_published')->default(false);
            $t->timestamps();
        });

        // SELLER COURIER ACCOUNTS (from 20260709111958)
        $this->make('seller_courier_accounts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->foreignId('courier_id')->constrained('couriers')->onDelete('cascade');
            $t->string('account_id')->nullable();
            $t->string('api_key')->nullable();
            $t->boolean('is_active')->default(true);
            $t->unique(['shop_id', 'courier_id']);
            $t->timestamps();
        });

        // WALLET TRANSACTIONS (from 20260709111958)
        $this->make('wallet_transactions', function (Blueprint $t) {
            $t->id();
            $t->morphs('walletable'); // can be customer_wallet or seller_wallet
            $t->decimal('amount', 12, 2);
            $t->string('type'); // credit, debit
            $t->string('reason')->nullable(); // order_cashback, payout, refund, manual
            $t->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');
            $t->decimal('balance_after', 12, 2)->default(0);
            $t->timestamps();
        });

        // STOCK TRANSFERS (from 20260710074602)
        $this->make('stock_transfers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->string('from_location')->nullable();
            $t->string('to_location')->nullable();
            $t->enum('status', ['pending', 'in_transit', 'completed', 'cancelled'])->default('pending');
            $t->text('note')->nullable();
            $t->timestamps();
        });

        // STOCK TRANSFER ITEMS (from 20260710074602)
        $this->make('stock_transfer_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('transfer_id')->constrained('stock_transfers')->onDelete('cascade');
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->integer('quantity');
            $t->timestamps();
        });

        // SHOP ATTRIBUTES (from 20260710074602)
        $this->make('shop_attributes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->string('key');
            $t->string('value')->nullable();
            $t->timestamps();
        });

        // SHOP BADGES (from 20260712144526)
        $this->make('shop_badges', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->string('badge'); // top_seller, verified, fast_shipping
            $t->string('label')->nullable();
            $t->timestamp('awarded_at')->useCurrent();
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        });

        // ACTIVE CARTS (from 20260712164037)
        $this->make('active_carts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $t->json('items'); // [{product_id, qty, price}]
            $t->decimal('total', 12, 2)->default(0);
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        });

        // SAVED CARTS (from 20260712160632)
        $this->make('saved_carts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->string('name')->nullable();
            $t->json('items');
            $t->timestamps();
        });

        // ABANDONED CHECKOUTS (from 20260712161545)
        $this->make('abandoned_checkouts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $t->string('email')->nullable();
            $t->json('cart_data');
            $t->boolean('recovery_email_sent')->default(false);
            $t->timestamp('recovered_at')->nullable();
            $t->timestamps();
        });

        // GROUP BUYS (from 20260712160349)
        $this->make('group_buys', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->decimal('group_price', 12, 2);
            $t->integer('min_participants')->default(2);
            $t->integer('current_participants')->default(0);
            $t->timestamp('ends_at');
            $t->enum('status', ['open', 'completed', 'failed'])->default('open');
            $t->timestamps();
        });

        // USER BONUS COUPONS (from 20260712162936)
        $this->make('user_bonus_coupons', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->string('code')->unique();
            $t->string('type')->default('percent');
            $t->decimal('value', 10, 2)->default(0);
            $t->timestamp('expires_at')->nullable();
            $t->boolean('is_used')->default(false);
            $t->timestamps();
        });

        // PRICE DROP ALERTS (from 20260712161142)
        $this->make('price_drop_alerts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->decimal('target_price', 12, 2);
            $t->boolean('is_notified')->default(false);
            $t->timestamps();
        });

        // EMAIL SEND LOG (from 20260716141609)
        $this->make('email_send_log', function (Blueprint $t) {
            $t->id();
            $t->string('to_email');
            $t->string('to_name')->nullable();
            $t->string('subject');
            $t->string('template')->nullable();
            $t->enum('status', ['pending', 'sent', 'failed', 'bounced'])->default('pending');
            $t->text('error')->nullable();
            $t->timestamp('sent_at')->nullable();
            $t->timestamps();
        });

        // WHATSAPP TEMPLATES (from 20260719151507)
        $this->make('whatsapp_templates', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->string('language')->default('bn');
            $t->text('body');
            $t->json('variables')->nullable();
            $t->string('status')->default('pending'); // pending, approved, rejected
            $t->timestamps();
        });

        // WHATSAPP MESSAGE LOG (from 20260719151507)
        $this->make('whatsapp_message_log', function (Blueprint $t) {
            $t->id();
            $t->string('to_phone');
            $t->foreignId('template_id')->nullable()->constrained('whatsapp_templates')->onDelete('set null');
            $t->json('variables')->nullable();
            $t->enum('status', ['queued', 'sent', 'delivered', 'failed'])->default('queued');
            $t->string('waba_message_id')->nullable();
            $t->timestamps();
        });

        // RETURN REQUESTS (from 20260719150701)
        $this->make('return_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->string('reason');
            $t->text('description')->nullable();
            $t->string('image_url')->nullable();
            $t->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $t->text('admin_note')->nullable();
            $t->timestamps();
        });

        // VENDOR KYC DOCUMENTS (from 20260719155757)
        $this->make('vendor_kyc_documents', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->string('document_type'); // nid, trade_license, tin_certificate, bank_statement
            $t->string('file_path');
            $t->string('original_filename')->nullable();
            $t->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $t->text('rejection_reason')->nullable();
            $t->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $t->timestamp('reviewed_at')->nullable();
            $t->timestamps();
        });

        // SELLER NOTICES (from 20260708165008)
        $this->make('seller_notices', function (Blueprint $t) {
            $t->id();
            $t->string('title');
            $t->text('body');
            $t->string('type')->default('info'); // info, warning, critical
            $t->boolean('is_active')->default(true);
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        });

        // BARGAIN OFFERS (from 20260715181943)
        $this->make('bargain_offers', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $t->decimal('offered_price', 12, 2);
            $t->decimal('counter_price', 12, 2)->nullable();
            $t->enum('status', ['pending', 'accepted', 'rejected', 'countered'])->default('pending');
            $t->timestamps();
        });

        // ACTIVITY LOGS (from 20260702145215)
        $this->make('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $t->string('action');
            $t->string('entity_type')->nullable();
            $t->unsignedBigInteger('entity_id')->nullable();
            $t->json('metadata')->nullable();
            $t->string('ip_address', 45)->nullable();
            $t->string('user_agent')->nullable();
            $t->timestamps();
        });

        // ADMIN LOGIN ATTEMPTS (from 20260717201500)
        $this->make('admin_login_attempts', function (Blueprint $t) {
            $t->id();
            $t->string('email');
            $t->string('ip_address', 45);
            $t->boolean('was_successful')->default(false);
            $t->timestamps();
            $t->index('email');
            $t->index('ip_address');
        });

        // CATEGORY REQUESTS (from 20260710081313)
        $this->make('category_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $t->string('requested_name');
            $t->text('reason')->nullable();
            $t->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $t->timestamps();
        });

        // SEASONAL THEMES (from 20260710060452)
        $this->make('seasonal_themes', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('primary_color')->nullable();
            $t->string('secondary_color')->nullable();
            $t->string('banner_url')->nullable();
            $t->boolean('is_active')->default(false);
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('ends_at')->nullable();
            $t->timestamps();
        });

        // BACKUPS (from 20260702150321)
        $this->make('backups', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->unsignedBigInteger('size_bytes')->nullable();
            $t->string('storage_path')->nullable();
            $t->string('status')->default('ready');
            $t->timestamps();
        });

        // COURIER SYNC LOGS (from 20260719150150)
        $this->make('courier_sync_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('shipment_id')->nullable()->constrained('shipments')->onDelete('set null');
            $t->string('courier_name');
            $t->string('event_type');
            $t->json('payload')->nullable();
            $t->boolean('processed')->default(false);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        $tables = [
            'courier_sync_logs', 'backups', 'seasonal_themes',
            'category_requests', 'admin_login_attempts', 'activity_logs',
            'bargain_offers', 'seller_notices', 'vendor_kyc_documents',
            'return_requests', 'whatsapp_message_log', 'whatsapp_templates',
            'email_send_log', 'price_drop_alerts', 'user_bonus_coupons',
            'group_buys', 'abandoned_checkouts', 'saved_carts', 'active_carts',
            'shop_badges', 'shop_attributes', 'stock_transfer_items',
            'stock_transfers', 'seller_courier_accounts', 'wallet_transactions',
            'kb_articles', 'api_keys', 'form_submissions', 'campaigns',
            'sms_templates', 'email_templates', 'blog_comments', 'blog_post_tags',
            'blog_posts', 'blog_tags', 'blog_categories', 'cms_pages',
            'role_permissions', 'permissions', 'custom_roles',
            'staff_permissions', 'staff',
        ];
        foreach ($tables as $t) {
            Schema::dropIfExists($t);
        }
    }
};
