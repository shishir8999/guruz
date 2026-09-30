<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Notice Marquees Table
        if (!Schema::hasTable('notice_marquees')) {
            Schema::create('notice_marquees', function (Blueprint $table) {
                $table->id();
                $table->text('text_en')->nullable();
                $table->text('text_bn')->nullable();
                $table->string('link_url')->nullable();
                $table->string('bg_color')->nullable();
                $table->string('text_color')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. CMS Pages Table
        if (!Schema::hasTable('cms_pages')) {
            Schema::create('cms_pages', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->longText('content')->nullable();
                $table->string('meta_title')->nullable();
                $table->text('meta_description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 3. Ensure essential columns exist in related tables if running incrementally
        if (Schema::hasTable('customer_wallets')) {
            Schema::table('customer_wallets', function (Blueprint $table) {
                if (!Schema::hasColumn('customer_wallets', 'total_earned')) {
                    $table->decimal('total_earned', 12, 2)->default(0.00)->after('balance');
                }
            });
        }

        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'currency')) {
                    $table->string('currency', 10)->default('BDT')->after('payment_method');
                }
                if (!Schema::hasColumn('orders', 'delivered_at')) {
                    $table->timestamp('delivered_at')->nullable()->after('status');
                }
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'address')) {
                    $table->text('address')->nullable()->after('phone');
                }
                if (!Schema::hasColumn('users', 'birthday')) {
                    $table->date('birthday')->nullable()->after('address');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notice_marquees');
        Schema::dropIfExists('cms_pages');
    }
};
