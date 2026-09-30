<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DummyWalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $u = \App\Models\User::firstOrCreate(["email" => "johndoe@example.com"], ["name" => "John Doe", "password" => bcrypt("password")]);
        $s = \App\Models\Shop::updateOrCreate(["slug" => "spark-cables"], ["user_id" => $u->id, "name" => "Spark Cables Shop", "status" => "active"]);
        \App\Models\SellerWallet::updateOrCreate(["shop_id" => $s->id], ["balance" => 450.00]);
    }
}
