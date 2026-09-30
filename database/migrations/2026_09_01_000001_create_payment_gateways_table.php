<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // bkash, nagad, rocket, bangla_qr, bank, upi_india, cod, sslcommerz, stripe
            $table->string('name');
            $table->string('name_bn')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('account_number')->nullable();
            $table->string('account_type')->nullable()->default('Personal'); // Personal, Merchant, Agent
            $table->string('qr_image_url')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('branch_name')->nullable();
            $table->string('account_holder_name')->nullable();
            $table->string('routing_number')->nullable();
            $table->text('instructions')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default gateways with initial data
        $gateways = [
            [
                'code' => 'cod',
                'name' => 'Cash on Delivery',
                'name_bn' => 'ক্যাশ অন ডেলিভারি',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => null,
                'account_type' => null,
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => null,
                'routing_number' => null,
                'instructions' => 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'bkash',
                'name' => 'bKash',
                'name_bn' => 'বিকাশ',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => '01700000000',
                'account_type' => 'Personal',
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => null,
                'routing_number' => null,
                'instructions' => 'উক্ত বিকাশ নাম্বারে Send Money করে TrxID ও প্রেরকের নম্বর দিন।',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'nagad',
                'name' => 'Nagad',
                'name_bn' => 'নগদ',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => '01700000000',
                'account_type' => 'Personal',
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => null,
                'routing_number' => null,
                'instructions' => 'উক্ত নগদ নাম্বারে Send Money করে TrxID ও প্রেরকের নম্বর দিন।',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'rocket',
                'name' => 'Rocket',
                'name_bn' => 'রকেট',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => '01700000000',
                'account_type' => 'Personal',
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => null,
                'routing_number' => null,
                'instructions' => 'উক্ত রকেট নাম্বারে Send Money করে TrxID ও প্রেরকের নম্বর দিন।',
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'bangla_qr',
                'name' => 'Bangla QR',
                'name_bn' => 'বাংলা কিউআর',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => '01700000000',
                'account_type' => 'Merchant',
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => null,
                'routing_number' => null,
                'instructions' => 'যেকোনো ব্যাংক বা এমএফএস অ্যাপ থেকে কিউআর স্ক্যান করে পেমেন্ট করুন।',
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'bank',
                'name' => 'Bank Transfer',
                'name_bn' => 'ব্যাংক ট্রান্সফার',
                'logo_url' => null,
                'is_active' => true,
                'account_number' => '123456789012',
                'account_type' => 'Current / Savings',
                'qr_image_url' => null,
                'bank_name' => 'Islami Bank Bangladesh PLC / City Bank',
                'branch_name' => 'Uttara Branch, Dhaka',
                'account_holder_name' => 'Guruz BD Limited',
                'routing_number' => '125272648',
                'instructions' => 'ব্যাংক অ্যাকাউন্টে টাকা জমা দিয়ে ডিপোজিট স্লিপ নম্বর বা ট্রানজেকশন আইডি প্রদান করুন।',
                'sort_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'upi_india',
                'name' => 'India UPI',
                'name_bn' => 'ইউপিআই (ভারত)',
                'logo_url' => null,
                'is_active' => false,
                'account_number' => 'guruzbd@upi',
                'account_type' => 'UPI ID',
                'qr_image_url' => null,
                'bank_name' => null,
                'branch_name' => null,
                'account_holder_name' => 'Guruz BD',
                'routing_number' => null,
                'instructions' => 'Pay to our UPI ID or scan QR code and submit UPI Reference / UTR Number.',
                'sort_order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('payment_gateways')->insert($gateways);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_gateways');
    }
};
