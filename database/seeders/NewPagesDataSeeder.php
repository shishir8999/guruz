<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\StaffAttendance;
use App\Models\StaffSalary;
use App\Models\StaffLeave;
use App\Models\TransactionLog;
use App\Models\CartFollowup;
use App\Models\KnowledgeBaseArticle;
use App\Models\CourierLog;
use App\Models\DebugLog;
use App\Models\VisitorAnalytic;
use App\Models\User;
use Carbon\Carbon;

class NewPagesDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@guruz.com')->first();
        $adminId = $admin ? $admin->id : null;

        // 1. Staff Attendance
        if (StaffAttendance::count() === 0) {
            $attendances = [
                ['staff_name' => 'Tanvir Ahmed', 'department' => 'Operations', 'date' => Carbon::today()->toDateString(), 'status' => 'Present', 'check_in' => '09:02 AM', 'check_out' => '06:15 PM', 'notes' => 'On time'],
                ['staff_name' => 'Nusrat Jahan', 'department' => 'Customer Care', 'date' => Carbon::today()->toDateString(), 'status' => 'Present', 'check_in' => '08:55 AM', 'check_out' => '05:45 PM', 'notes' => 'Morning shift'],
                ['staff_name' => 'Rakibul Islam', 'department' => 'Logistics', 'date' => Carbon::today()->toDateString(), 'status' => 'Late', 'check_in' => '09:48 AM', 'check_out' => '06:30 PM', 'notes' => 'Traffic delay reported'],
                ['staff_name' => 'Mehedi Hasan', 'department' => 'IT & Systems', 'date' => Carbon::today()->toDateString(), 'status' => 'Present', 'check_in' => '09:10 AM', 'check_out' => '06:00 PM', 'notes' => 'Workstation check'],
                ['staff_name' => 'Sabrina Akter', 'department' => 'Accounts', 'date' => Carbon::today()->toDateString(), 'status' => 'Leave', 'check_in' => null, 'check_out' => null, 'notes' => 'Medical leave approved'],
                ['staff_name' => 'Farhan Chowdhury', 'department' => 'Marketing', 'date' => Carbon::today()->toDateString(), 'status' => 'Absent', 'check_in' => null, 'check_out' => null, 'notes' => 'Unexcused absence'],
            ];
            foreach ($attendances as $row) {
                StaffAttendance::create($row);
            }
        }

        // 2. Staff Salary
        if (StaffSalary::count() === 0) {
            $salaries = [
                ['name' => 'Tanvir Ahmed', 'designation' => 'Operations Manager', 'department' => 'Operations', 'salary' => 45000, 'month' => 'August 2026', 'status' => 'Paid', 'paid_at' => Carbon::now()->subDays(5), 'payment_method' => 'Bank Transfer', 'transaction_reference' => 'SAL-TXN-101'],
                ['name' => 'Nusrat Jahan', 'designation' => 'Support Lead', 'department' => 'Customer Care', 'salary' => 32000, 'month' => 'August 2026', 'status' => 'Paid', 'paid_at' => Carbon::now()->subDays(5), 'payment_method' => 'bKash', 'transaction_reference' => 'SAL-TXN-102'],
                ['name' => 'Rakibul Islam', 'designation' => 'Dispatch Executive', 'department' => 'Logistics', 'salary' => 28000, 'month' => 'August 2026', 'status' => 'Pending', 'paid_at' => null, 'payment_method' => null, 'transaction_reference' => null],
                ['name' => 'Mehedi Hasan', 'designation' => 'Senior Developer', 'department' => 'IT & Systems', 'salary' => 60000, 'month' => 'August 2026', 'status' => 'Paid', 'paid_at' => Carbon::now()->subDays(4), 'payment_method' => 'Bank Transfer', 'transaction_reference' => 'SAL-TXN-103'],
                ['name' => 'Sabrina Akter', 'designation' => 'Accountant', 'department' => 'Accounts', 'salary' => 35000, 'month' => 'August 2026', 'status' => 'Pending', 'paid_at' => null, 'payment_method' => null, 'transaction_reference' => null],
            ];
            foreach ($salaries as $row) {
                StaffSalary::create($row);
            }
        }

        // 3. Staff Leaves
        if (StaffLeave::count() === 0) {
            $leaves = [
                ['staff_name' => 'Sabrina Akter', 'leave_type' => 'Medical Leave', 'start_date' => Carbon::today()->toDateString(), 'end_date' => Carbon::today()->addDays(2)->toDateString(), 'days_count' => 3, 'reason' => 'Doctor prescribed medical rest', 'status' => 'Approved', 'approved_by' => $adminId],
                ['staff_name' => 'Rakibul Islam', 'leave_type' => 'Casual Leave', 'start_date' => Carbon::today()->addDays(5)->toDateString(), 'end_date' => Carbon::today()->addDays(6)->toDateString(), 'days_count' => 2, 'reason' => 'Family occasion', 'status' => 'Pending', 'approved_by' => null],
                ['staff_name' => 'Farhan Chowdhury', 'leave_type' => 'Emergency Leave', 'start_date' => Carbon::today()->subDays(3)->toDateString(), 'end_date' => Carbon::today()->subDays(2)->toDateString(), 'days_count' => 2, 'reason' => 'Personal emergency', 'status' => 'Approved', 'approved_by' => $adminId],
                ['staff_name' => 'Nusrat Jahan', 'leave_type' => 'Annual Leave', 'start_date' => Carbon::today()->addDays(10)->toDateString(), 'end_date' => Carbon::today()->addDays(14)->toDateString(), 'days_count' => 5, 'reason' => 'Annual holiday vacation', 'status' => 'Pending', 'approved_by' => null],
            ];
            foreach ($leaves as $row) {
                StaffLeave::create($row);
            }
        }

        // 4. Transaction Logs
        if (TransactionLog::count() === 0) {
            $transactions = [
                ['txn_id' => 'TXN-909182A', 'user_id' => $adminId, 'user_name' => 'Shishir Rahman', 'amount' => 12500, 'type' => 'Credit', 'method' => 'bKash', 'status' => 'Completed', 'reference' => 'BKASH_ORDER_8891', 'transaction_date' => Carbon::now()->subHours(2)],
                ['txn_id' => 'TXN-882719B', 'user_id' => null, 'user_name' => 'John Doe', 'amount' => 4500, 'type' => 'Debit', 'method' => 'Visa', 'status' => 'Pending', 'reference' => 'CARD_PAY_9011', 'transaction_date' => Carbon::now()->subHours(5)],
                ['txn_id' => 'TXN-771829C', 'user_id' => null, 'user_name' => 'Jane Smith', 'amount' => 8900, 'type' => 'Credit', 'method' => 'Nagad', 'status' => 'Failed', 'reference' => 'NAGAD_FAIL_3321', 'transaction_date' => Carbon::now()->subDay()],
                ['txn_id' => 'TXN-661928D', 'user_id' => null, 'user_name' => 'Alice Cooper', 'amount' => 2100, 'type' => 'Credit', 'method' => 'Mastercard', 'status' => 'Completed', 'reference' => 'MC_TXN_4482', 'transaction_date' => Carbon::now()->subDays(2)],
                ['txn_id' => 'TXN-552819E', 'user_id' => null, 'user_name' => 'Bob Marley', 'amount' => 15600, 'type' => 'Debit', 'method' => 'Bank Transfer', 'status' => 'Completed', 'reference' => 'EFT_SALARY_SETTLE', 'transaction_date' => Carbon::now()->subDays(3)],
                ['txn_id' => 'TXN-443928F', 'user_id' => null, 'user_name' => 'Charlie Puth', 'amount' => 3200, 'type' => 'Credit', 'method' => 'Upay', 'status' => 'Refunded', 'reference' => 'UPAY_REFUND_998', 'transaction_date' => Carbon::now()->subDays(4)],
            ];
            foreach ($transactions as $row) {
                TransactionLog::create($row);
            }
        }

        // 5. Cart Followups
        if (CartFollowup::count() === 0) {
            $followups = [
                ['code' => '#CF-1001', 'customer_name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '01711223344', 'cart_value' => 4500, 'stage' => '1st Email Sent', 'status' => 'In Progress', 'last_contacted_at' => Carbon::now()->subMinutes(15)],
                ['code' => '#CF-1002', 'customer_name' => 'Sarah Smith', 'email' => 'sarah.s@example.com', 'phone' => '01822334455', 'cart_value' => 1200, 'stage' => 'Recovered', 'status' => 'Success', 'last_contacted_at' => Carbon::now()->subHour()],
                ['code' => '#CF-1003', 'customer_name' => 'David Mark', 'email' => 'david@example.com', 'phone' => '01933445566', 'cart_value' => 2300, 'stage' => '2nd Email Sent', 'status' => 'In Progress', 'last_contacted_at' => Carbon::now()->subHours(3)],
                ['code' => '#CF-1004', 'customer_name' => 'Mike Johnson', 'email' => 'mike.j@example.com', 'phone' => '01644556677', 'cart_value' => 3400, 'stage' => 'Final Notice', 'status' => 'Failed', 'last_contacted_at' => Carbon::now()->subDay()],
            ];
            foreach ($followups as $row) {
                CartFollowup::create($row);
            }
        }

        // 6. Knowledge Base Articles
        if (KnowledgeBaseArticle::count() === 0) {
            $articles = [
                ['code' => '#KB-3001', 'title' => 'Getting Started Guide', 'slug' => 'getting-started-guide', 'category' => 'General', 'content' => 'Welcome to Guruz! This comprehensive guide walks you through finding products, placing orders, tracking packages, and using discount coupons.', 'views_count' => 1240, 'status' => 'Published', 'author_id' => $adminId],
                ['code' => '#KB-3002', 'title' => 'How to Return an Item', 'slug' => 'how-to-return-an-item', 'category' => 'Returns & Refunds', 'content' => 'Step-by-step instructions on initiating a return claim, packaging items securely, and receiving your refund via bKash, Nagad, or Bank Transfer.', 'views_count' => 850, 'status' => 'Published', 'author_id' => $adminId],
                ['code' => '#KB-3003', 'title' => 'Shipping Policy Overview', 'slug' => 'shipping-policy-overview', 'category' => 'Shipping', 'content' => 'Everything you need to know about our courier partners (Steadfast, Pathao, RedX), delivery timeframes inside and outside Dhaka, and delivery charges.', 'views_count' => 420, 'status' => 'Draft', 'author_id' => $adminId],
                ['code' => '#KB-3004', 'title' => 'Managing Your Account Settings', 'slug' => 'managing-your-account-settings', 'category' => 'Account', 'content' => 'Learn how to update your shipping addresses, enable two-factor authentication (2FA), and change your account passwords securely.', 'views_count' => 2100, 'status' => 'Published', 'author_id' => $adminId],
            ];
            foreach ($articles as $row) {
                KnowledgeBaseArticle::create($row);
            }
        }

        // 7. Courier Logs
        if (CourierLog::count() === 0) {
            $courierLogs = [
                ['courier' => 'Steadfast', 'endpoint' => 'POST /api/v1/create_order', 'status' => 'Success', 'status_code' => 200, 'payload' => '{"order_id": 1234, "recipient": "John Doe", "amount": 2500}', 'response' => '{"status": 200, "consignment_id": 98124, "tracking_code": "SF-98124"}', 'tracking_id' => 'SF-98124'],
                ['courier' => 'Pathao', 'endpoint' => 'GET /aladdin/api/v1/cities', 'status' => 'Success', 'status_code' => 200, 'payload' => '{}', 'response' => '{"type": "success", "data": [{"city_id": 1, "city_name": "Dhaka"}]}', 'tracking_id' => null],
                ['courier' => 'RedX', 'endpoint' => 'POST /v1/parcel', 'status' => 'Success', 'status_code' => 200, 'payload' => '{"customer_name": "Rahim", "delivery_area": "Mirpur"}', 'response' => '{"tracking_id": "RX9912", "status": "booked"}', 'tracking_id' => 'RX9912'],
                ['courier' => 'Steadfast', 'endpoint' => 'GET /api/v1/status/SF-12345', 'status' => 'Success', 'status_code' => 200, 'payload' => '{}', 'response' => '{"delivery_status": "delivered", "date": "2026-08-05"}', 'tracking_id' => 'SF-12345'],
                ['courier' => 'Pathao', 'endpoint' => 'POST /aladdin/api/v1/orders', 'status' => 'Failed', 'status_code' => 401, 'payload' => '{"merchant_order_id": "ORD-5541"}', 'response' => '{"message": "Unauthorized client credentials"}', 'tracking_id' => null],
            ];
            foreach ($courierLogs as $row) {
                CourierLog::create($row);
            }
        }

        // 8. Debug Logs
        if (DebugLog::count() === 0) {
            $debugLogs = [
                ['type' => 'error', 'channel' => 'laravel.log', 'message' => 'SQLSTATE[HY000]: General error: 1364 Field "user_id" doesn\'t have a default value', 'file_path' => 'app/Http/Controllers/OrderController.php', 'line_number' => 142, 'ip_address' => '127.0.0.1'],
                ['type' => 'warning', 'channel' => 'laravel.log', 'message' => 'Cache miss for key "product_categories_tree". Rebuilding automatically...', 'file_path' => 'app/Services/CategoryService.php', 'line_number' => 58, 'ip_address' => '127.0.0.1'],
                ['type' => 'info', 'channel' => 'scheduler.log', 'message' => 'Scheduled task [App\Console\Commands\SyncInventory] executed successfully in 1.42s.', 'file_path' => 'app/Console/Kernel.php', 'line_number' => 33, 'ip_address' => '127.0.0.1'],
                ['type' => 'error', 'channel' => 'worker.log', 'message' => 'Stripe API Error: Request req_9xYz8s2 failed. Invalid API Key provided.', 'file_path' => 'app/Services/Payment/StripeGateway.php', 'line_number' => 84, 'ip_address' => '192.168.1.10'],
                ['type' => 'info', 'channel' => 'laravel.log', 'message' => 'Superadmin session authenticated successfully for admin@guruz.com', 'file_path' => 'app/Http/Controllers/Auth/LoginController.php', 'line_number' => 67, 'ip_address' => '127.0.0.1'],
                ['type' => 'warning', 'channel' => 'query-debug.log', 'message' => 'Slow database query detected (>500ms): SELECT * FROM products WHERE status = "active"', 'file_path' => 'app/Http/Controllers/ProductController.php', 'line_number' => 112, 'ip_address' => '127.0.0.1'],
            ];
            foreach ($debugLogs as $row) {
                DebugLog::create($row);
            }
        }

        // 9. Visitor Analytics
        if (VisitorAnalytic::count() === 0) {
            $devices = ['Desktop', 'Mobile', 'Tablet'];
            $browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
            $cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal'];
            $urls = ['/', '/products', '/shops', '/categories', '/flash-sales', '/about-us'];

            for ($i = 0; $i < 30; $i++) {
                VisitorAnalytic::create([
                    'ip_address' => '103.102.1' . rand(10, 99) . '.' . rand(10, 250),
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'device' => $devices[array_rand($devices)],
                    'browser' => $browsers[array_rand($browsers)],
                    'os' => 'Windows 11',
                    'page_url' => $urls[array_rand($urls)],
                    'referrer' => 'https://google.com',
                    'country' => 'Bangladesh',
                    'city' => $cities[array_rand($cities)],
                    'session_id' => 'sess_' . bin2hex(random_bytes(8)),
                    'visited_at' => Carbon::now()->subMinutes(rand(5, 2880)),
                ]);
            }
        }
    }
}
