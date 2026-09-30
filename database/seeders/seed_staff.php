<?php

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Staff;

$u1 = User::firstOrCreate(
    ['email' => 'rahman@guruz.com'],
    ['name' => 'আব্দুর রহমান', 'password' => bcrypt('password'), 'phone' => '01711223344']
);

$u2 = User::firstOrCreate(
    ['email' => 'sharmin@guruz.com'],
    ['name' => 'শারমিন আক্তার', 'password' => bcrypt('password'), 'phone' => '01899887766']
);

Staff::firstOrCreate(
    ['user_id' => $u1->id],
    ['department' => 'Finance', 'position' => 'Senior Accountant', 'is_active' => true, 'salary' => 35000]
);

Staff::firstOrCreate(
    ['user_id' => $u2->id],
    ['department' => 'Customer Service', 'position' => 'Support Executive', 'is_active' => true, 'salary' => 25000]
);

echo "Seeded " . Staff::count() . " staff records.\n";
