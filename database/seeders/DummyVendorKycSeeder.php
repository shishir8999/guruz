<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DummyVendorKycSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $u = \App\Models\User::firstOrCreate(
            ["email" => "pendingowner@example.com"],
            ["name" => "Pending Owner", "password" => bcrypt("password")]
        );
        $s = \App\Models\Shop::updateOrCreate(
            ["slug" => "real-pending-shop"],
            ["user_id" => $u->id, "name" => "Real Pending Electronics", "status" => "pending"]
        );

        \App\Models\VendorKyc::updateOrCreate(
            ['shop_id' => $s->id],
            [
                'user_id' => $s->user_id,
                'nid_number' => '1234567890123',
                'trade_license_number' => 'TRD-998877',
                'status' => 'Pending'
            ]
        );
    }
}
