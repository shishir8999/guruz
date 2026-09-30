-- Guruz Database Tables Update Script
-- Generated: 2026-09-03 23:35:25
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for `notice_marquees`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notice_marquees` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `text_en` text DEFAULT NULL,
  `text_bn` text DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `bg_color` varchar(255) DEFAULT NULL,
  `text_color` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cms_pages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payment_gateways`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_gateways` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_bn` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `gateway_type` varchar(255) NOT NULL DEFAULT 'manual',
  `environment` varchar(255) NOT NULL DEFAULT 'live',
  `api_key` text DEFAULT NULL,
  `secret_key` text DEFAULT NULL,
  `app_key` text DEFAULT NULL,
  `app_secret` text DEFAULT NULL,
  `merchant_id` varchar(255) DEFAULT NULL,
  `token_id` text DEFAULT NULL,
  `webhook_secret` text DEFAULT NULL,
  `callback_url` varchar(255) DEFAULT NULL,
  `extra_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra_config`)),
  `account_number` varchar(255) DEFAULT NULL,
  `account_type` varchar(255) DEFAULT 'Personal',
  `qr_image_url` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `routing_number` varchar(255) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_gateways_code_unique` (`code`),
  KEY `idx_gw_code_active` (`code`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure logo_url exists in payment_gateways if table already existed
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payment_gateways' AND column_name = 'logo_url');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `payment_gateways` ADD COLUMN `logo_url` VARCHAR(255) NULL AFTER `name_bn`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure standard gateways exist
INSERT IGNORE INTO `payment_gateways` (`code`, `name`, `name_bn`, `is_active`, `gateway_type`, `environment`, `account_number`, `account_type`, `sort_order`, `instructions`) VALUES
('cod', 'Cash on Delivery', 'ক্যাশ অন ডেলিভারি', 1, 'manual', 'live', NULL, 'Cash', 1, 'ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে সম্পূর্ণ মূল্য পরিশোধ করুন।'),
('bkash', 'bKash Merchant', 'বিকাশ পেমেন্ট', 1, 'automated_api', 'live', NULL, 'Merchant', 2, 'বিকাশ অনলাইন গেটওয়ে দ্বারা সরাসরি নিরাপদ পেমেন্ট সম্পন্ন করুন।'),
('nagad', 'Nagad Manual', 'নগদ ম্যানুয়াল', 1, 'manual', 'live', '01700000000', 'Merchant / Personal', 9, 'নগদ অ্যাপ থেকে ‘Send Money’ বা ‘Merchant Pay’ সম্পন্ন করে TrxID ও প্রেরক নম্বর লিখুন।'),
('rocket', 'Rocket Personal', 'রকেট ম্যানুয়াল', 1, 'manual', 'live', '01700000000-8', 'Personal', 10, 'রকেট একাউন্ট থেকে সেন্ড মানি করে TrxID ও প্রেরক নম্বর নিচে প্রদান করুন।'),
('bank', 'Bank Transfer', 'ব্যাংক ট্রান্সফার', 0, 'manual', 'live', '20501234567890', 'Corporate / Current', 11, 'ব্যাংক অ্যাকাউন্টে টাকা জমা দিয়ে ডিপোজিট স্লিপ নম্বর বা ট্রানজেকশন রেফারেন্স আইডি নিচে প্রদান করুন।'),
('sslcommerz', 'SSLCommerz', 'এসএসএল কমার্জ', 1, 'automated_api', 'sandbox', NULL, 'Personal', 6, 'SSLCommerz-এর মাধ্যমে ভিসা, মাস্টারকার্ড, বিকাশ, নগদ, রকেট সহ যেকোনো মাধ্যমে নিরাপদ অটোমেটেড পেমেন্ট সম্পন্ন করুন।'),
('manual_bkash', 'Manual bKash', 'বিকাশ ম্যানুয়াল', 1, 'manual', 'live', NULL, 'Personal', 8, 'ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন'),
('upi_india', 'Instant UPI (India)', 'ইউপিআই পেমেন্ট (ভারত 🇮🇳)', 1, 'manual', 'live', 'guruzbd@upi', 'UPI ID', 11, 'PhonePe, Google Pay, Paytm, BHIM ইউপিআই দিয়ে পেমেন্ট'),
('manual_dropdown', 'Manual Payment Dropdown Header', 'ম্যানুয়াল পেমেন্ট মেথড হেডার আইকন', 1, 'manual', 'live', NULL, 'Personal', 12, 'চেকআউট পেজে ম্যানুয়াল পেমেন্ট ড্রপডাউন হেডারের কাস্টম লোগো');

-- Deactivate unused gateways by default
UPDATE `payment_gateways` SET `is_active` = 0 WHERE `code` IN ('shurjopay', 'uddoktapay', 'aamarpay', 'bangla_qr');

-- --------------------------------------------------------
-- Table structure for `live_chat_threads`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `live_chat_threads` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL DEFAULT 'ভিজিটর',
  `customer_phone` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `current_page` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'open',
  `last_message` text DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `unread_admin_count` int(10) unsigned NOT NULL DEFAULT 0,
  `unread_user_count` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `live_chat_threads_session_id_unique` (`session_id`),
  KEY `live_chat_threads_user_id_foreign` (`user_id`),
  CONSTRAINT `live_chat_threads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `live_chat_messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `live_chat_messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `live_chat_thread_id` bigint(20) unsigned NOT NULL,
  `sender_type` varchar(255) NOT NULL DEFAULT 'customer',
  `sender_id` bigint(20) unsigned DEFAULT NULL,
  `sender_name` varchar(255) NOT NULL DEFAULT 'কাস্টমার',
  `message` text NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_type` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `live_chat_messages_live_chat_thread_id_foreign` (`live_chat_thread_id`),
  KEY `live_chat_messages_sender_id_foreign` (`sender_id`),
  CONSTRAINT `live_chat_messages_live_chat_thread_id_foreign` FOREIGN KEY (`live_chat_thread_id`) REFERENCES `live_chat_threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `live_chat_messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` bigint(20) unsigned NOT NULL,
  `receiver_id` bigint(20) unsigned NOT NULL,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `body` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_shop_id_foreign` (`shop_id`),
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `customer_wallets`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_wallets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_earned` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_spent` decimal(12,2) NOT NULL DEFAULT 0.00,
  `points` int(11) NOT NULL DEFAULT 0,
  `tier` varchar(255) NOT NULL DEFAULT 'bronze',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_wallets_user_id_unique` (`user_id`),
  KEY `idx_wallets_user_id` (`user_id`),
  CONSTRAINT `customer_wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `customer_wallet_transactions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_wallet_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `customer_wallet_id` bigint(20) unsigned NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_wallet_transactions_customer_wallet_id_foreign` (`customer_wallet_id`),
  KEY `idx_cwt_wallet_type` (`customer_wallet_id`,`type`),
  CONSTRAINT `customer_wallet_transactions_customer_wallet_id_foreign` FOREIGN KEY (`customer_wallet_id`) REFERENCES `customer_wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`),
  KEY `idx_coupons_code_active` (`code`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupon_usages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupon_usages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `order_id` bigint(20) unsigned NOT NULL,
  `discount_applied` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coupon_usages_coupon_id_foreign` (`coupon_id`),
  KEY `coupon_usages_user_id_foreign` (`user_id`),
  KEY `coupon_usages_order_id_foreign` (`order_id`),
  CONSTRAINT `coupon_usages_coupon_id_foreign` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `user_bonus_coupons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_bonus_coupons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'percent',
  `value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_bonus_coupons_code_unique` (`code`),
  KEY `user_bonus_coupons_user_id_foreign` (`user_id`),
  CONSTRAINT `user_bonus_coupons_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `warranty_claims`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `warranty_claims` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `claim_number` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `mobile_number` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `brand_name` varchar(255) DEFAULT NULL,
  `product_model` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `issue_category` varchar(255) NOT NULL,
  `problem_details` text NOT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `google_drive_link` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `admin_seen_at` timestamp NULL DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warranty_claims_claim_number_unique` (`claim_number`),
  KEY `warranty_claims_user_id_foreign` (`user_id`),
  CONSTRAINT `warranty_claims_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure admin_seen_at exists in warranty_claims
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'warranty_claims' AND column_name = 'admin_seen_at');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `warranty_claims` ADD COLUMN `admin_seen_at` TIMESTAMP NULL DEFAULT NULL AFTER `status`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Table structure for `shop_followers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `shop_followers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shop_followers_shop_id_user_id_unique` (`shop_id`,`user_id`),
  KEY `shop_followers_user_id_foreign` (`user_id`),
  CONSTRAINT `shop_followers_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shop_followers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payout_requests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payout_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','approved','rejected','processed') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `account_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`account_details`)),
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payout_requests_shop_id_foreign` (`shop_id`),
  CONSTRAINT `payout_requests_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payouts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payouts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payouts_shop_id_foreign` (`shop_id`),
  CONSTRAINT `payouts_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `category_requests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `requested_name` varchar(255) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `requested_category` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_requests_shop_id_foreign` (`shop_id`),
  CONSTRAINT `category_requests_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `pickup_requests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pickup_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `request_number` varchar(255) DEFAULT NULL,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `pickup_address` text DEFAULT NULL,
  `parcel_count` int(11) NOT NULL DEFAULT 1,
  `estimated_weight` varchar(255) NOT NULL DEFAULT '1 kg',
  `notes` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `courier_consignment_id` varchar(255) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cod_amount` decimal(12,2) DEFAULT 0.00,
  `is_cod_collected` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `units`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `units` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `units_shop_id_foreign` (`shop_id`),
  CONSTRAINT `units_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `push_notifications`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `push_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `target` varchar(255) NOT NULL DEFAULT 'All App Users',
  `status` enum('sent','active','scheduled','draft') NOT NULL DEFAULT 'draft',
  `sent_count` bigint(20) unsigned NOT NULL DEFAULT 0,
  `scheduled_for` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `ip_rules`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ip_rules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) NOT NULL,
  `type` enum('Whitelist','Blacklist') NOT NULL DEFAULT 'Whitelist',
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `webhooks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `webhooks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `events` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`events`)),
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `last_triggered` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `languages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `languages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `languages_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `vendor_landing_sections`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vendor_landing_sections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `section_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `content_type` varchar(255) NOT NULL DEFAULT 'Text & Icons',
  `visibility` enum('Visible','Hidden') NOT NULL DEFAULT 'Visible',
  `status` enum('Active','Draft') NOT NULL DEFAULT 'Active',
  `description` text DEFAULT NULL,
  `position` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `sms_templates`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sms_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `body` text NOT NULL DEFAULT '',
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sms_templates_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `footer_widgets`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `footer_widgets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `footer_links`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `footer_links` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `footer_widget_id` bigint(20) unsigned NOT NULL,
  `label` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `footer_links_footer_widget_id_foreign` (`footer_widget_id`),
  CONSTRAINT `footer_links_footer_widget_id_foreign` FOREIGN KEY (`footer_widget_id`) REFERENCES `footer_widgets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `subscribers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscribers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscribers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `hero_sliders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `hero_sliders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `button_text` varchar(255) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `top_banners`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `top_banners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `pages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `seo_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `featured_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `title_bn` varchar(255) DEFAULT NULL,
  `subtitle_en` varchar(255) DEFAULT NULL,
  `subtitle_bn` varchar(255) DEFAULT NULL,
  `content_bn` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `site_settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`),
  KEY `idx_settings_key` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `purchases`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `po_number` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('Pending','Received','Cancelled') NOT NULL DEFAULT 'Pending',
  `purchase_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchases_po_number_unique` (`po_number`),
  KEY `purchases_shop_id_foreign` (`shop_id`),
  CONSTRAINT `purchases_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `warehouses`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `warehouses_shop_id_foreign` (`shop_id`),
  CONSTRAINT `warehouses_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Additional Column Updates for Existing Tables
-- --------------------------------------------------------
-- customer_wallets.total_earned
SET @dbname = DATABASE();
SET @tablename = 'customer_wallets';
SET @columnname = 'total_earned';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER balance;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @tablename = 'orders';
SET @columnname = 'currency';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) NOT NULL DEFAULT \'BDT\' AFTER payment_method;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'delivered_at';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL DEFAULT NULL AFTER status;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @tablename = 'users';
SET @columnname = 'address';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL DEFAULT NULL AFTER phone;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'birthday';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL DEFAULT NULL AFTER address;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'admin_seen_at';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL DEFAULT NULL AFTER birthday;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'facebook_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) NULL DEFAULT NULL AFTER google_id;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'github_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) NULL DEFAULT NULL AFTER facebook_id;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- --------------------------------------------------------
-- Table structure & modifications for `coupons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL DEFAULT 'percentage',
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `used_count` int(11) NOT NULL DEFAULT 0,
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure coupon limitations exist if table already existed
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coupons' AND column_name = 'min_order_amount');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `coupons` ADD COLUMN `min_order_amount` DECIMAL(10,2) NULL DEFAULT 0.00 AFTER `value`;', 'ALTER TABLE `coupons` MODIFY COLUMN `min_order_amount` DECIMAL(10,2) NULL DEFAULT 0.00;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coupons' AND column_name = 'max_discount_amount');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `coupons` ADD COLUMN `max_discount_amount` DECIMAL(10,2) NULL DEFAULT NULL AFTER `min_order_amount`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Popular default brands
-- --------------------------------------------------------
INSERT IGNORE INTO `brands` (`name`, `slug`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
('Apple', 'apple', 1, 1, NOW(), NOW()),
('Samsung', 'samsung', 1, 1, NOW(), NOW()),
('Xiaomi', 'xiaomi', 1, 1, NOW(), NOW()),
('Anker', 'anker', 1, 1, NOW(), NOW()),
('Baseus', 'baseus', 1, 1, NOW(), NOW()),
('Logitech', 'logitech', 1, 1, NOW(), NOW()),
('TP-Link', 'tp-link', 1, 1, NOW(), NOW()),
('UGREEN', 'ugreen', 1, 1, NOW(), NOW()),
('Remax', 'remax', 1, 1, NOW(), NOW()),
('Joyroom', 'joyroom', 1, 1, NOW(), NOW()),
('Hoco', 'hoco', 1, 1, NOW(), NOW()),
('Sony', 'sony', 1, 1, NOW(), NOW()),
('A4TECH', 'a4tech', 1, 1, NOW(), NOW()),
('Boya', 'boya', 1, 1, NOW(), NOW());

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `payment_status` varchar(50) NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(255) NOT NULL DEFAULT 'cod',
  `payment_trx_id` varchar(255) DEFAULT NULL,
  `payment_sender_number` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(100) DEFAULT NULL,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'BDT',
  `exchange_rate` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `currency_amount` decimal(12,2) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `shipping_address` text NOT NULL,
  `country` varchar(50) NOT NULL DEFAULT 'Bangladesh',
  `city` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `courier_name` varchar(255) DEFAULT NULL,
  `courier_tracking_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `admin_seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_shop_id_foreign` (`shop_id`),
  KEY `idx_orders_user_status` (`user_id`,`status`),
  KEY `idx_orders_order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure coupon_code exists in orders if already created
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'coupon_code');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `orders` ADD COLUMN `coupon_code` VARCHAR(100) NULL AFTER `discount`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure payment_status is varchar(50) so all status types work without strict enum errors
ALTER TABLE `orders` MODIFY COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'unpaid';

-- Ensure admin_seen_at exists in orders
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders' AND column_name = 'admin_seen_at');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `orders` ADD COLUMN `admin_seen_at` TIMESTAMP NULL DEFAULT NULL AFTER `notes`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  KEY `idx_order_items_lookup` (`order_id`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure product_image exists in order_items if already created
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'order_items' AND column_name = 'product_image');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `order_items` ADD COLUMN `product_image` VARCHAR(500) NULL AFTER `product_name`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------
-- Table structure for `delivery_charges`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `title_en` varchar(100) DEFAULT NULL,
  `charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estimated_days` varchar(100) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `delivery_charges_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial default rates if not present: Inside Dhaka = 80, Outside Dhaka = 120
INSERT IGNORE INTO `delivery_charges` (`code`, `title`, `title_en`, `charge`, `estimated_days`, `is_default`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES
('inside_dhaka', 'ঢাকার ভিতরে', 'Inside Dhaka', 80.00, '২-৩ দিন', 1, 1, 1, NOW(), NOW()),
('outside_dhaka', 'ঢাকার বাইরে', 'Outside Dhaka', 120.00, '৩-৫ দিন', 0, 1, 2, NOW(), NOW());

-- --------------------------------------------------------
-- Table structure for `user_bonus_coupons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_bonus_coupons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'percent',
  `value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_bonus_coupons_code_unique` (`code`),
  KEY `user_bonus_coupons_user_id_foreign` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure min_order_amount & max_discount_amount exist in user_bonus_coupons if already created
SET @colCount1 = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_bonus_coupons' AND column_name = 'min_order_amount');
SET @alterStmt1 = IF(@colCount1 = 0, 'ALTER TABLE `user_bonus_coupons` ADD COLUMN `min_order_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `value`;', 'SELECT 1;');
PREPARE stmt1 FROM @alterStmt1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @colCount2 = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'user_bonus_coupons' AND column_name = 'max_discount_amount');
SET @alterStmt2 = IF(@colCount2 = 0, 'ALTER TABLE `user_bonus_coupons` ADD COLUMN `max_discount_amount` DECIMAL(10,2) NULL AFTER `min_order_amount`;', 'SELECT 1;');
PREPARE stmt2 FROM @alterStmt2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- --------------------------------------------------------
-- Table structure for `billing_plans`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `billing_plans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `billing_cycle` varchar(50) NOT NULL DEFAULT 'Monthly',
  `max_products` int(11) NOT NULL DEFAULT 100,
  `max_staff` int(11) NOT NULL DEFAULT 2,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `billing_plans` (`id`, `name`, `price`, `billing_cycle`, `max_products`, `max_staff`, `features`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Starter Plan', 999.00, 'Monthly', 100, 2, '["100 Products Listing","2 Staff Accounts","Basic Analytics","Standard Support"]', 1, 1, NOW(), NOW()),
(2, 'Professional Plan', 2499.00, 'Monthly', 500, 5, '["500 Products Listing","5 Staff Accounts","Advanced Analytics","Priority Support","Custom Domain"]', 1, 2, NOW(), NOW()),
(3, 'Enterprise Plan', 4999.00, 'Monthly', 5000, 20, '["Unlimited Products","20 Staff Accounts","Realtime Analytics","24/7 Dedicated Support","Custom Integrations"]', 1, 3, NOW(), NOW());

-- --------------------------------------------------------
-- Table structure for `staff_attendances`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_attendances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` bigint(20) unsigned DEFAULT NULL,
  `staff_name` varchar(255) NOT NULL,
  `department` varchar(100) NOT NULL DEFAULT 'General',
  `date` date NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Present',
  `check_in` varchar(50) DEFAULT NULL,
  `check_out` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_attendances_staff_id_foreign` (`staff_id`),
  KEY `idx_staff_attendances_date_status` (`date`,`status`),
  CONSTRAINT `staff_attendances_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `staff_salaries`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_salaries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `month` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `paid_at` datetime DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_salaries_staff_id_foreign` (`staff_id`),
  KEY `idx_staff_salaries_status_month` (`status`,`month`),
  CONSTRAINT `staff_salaries_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `staff_leaves`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_leaves` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` bigint(20) unsigned DEFAULT NULL,
  `staff_name` varchar(255) NOT NULL,
  `leave_type` varchar(100) NOT NULL DEFAULT 'Casual Leave',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_count` int(11) NOT NULL DEFAULT 1,
  `reason` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_leaves_staff_id_foreign` (`staff_id`),
  KEY `staff_leaves_approved_by_foreign` (`approved_by`),
  KEY `idx_staff_leaves_status_start_date` (`status`,`start_date`),
  CONSTRAINT `staff_leaves_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE SET NULL,
  CONSTRAINT `staff_leaves_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `transaction_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transaction_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `txn_id` varchar(100) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `type` varchar(50) NOT NULL DEFAULT 'Credit',
  `method` varchar(100) NOT NULL DEFAULT 'bKash',
  `status` varchar(50) NOT NULL DEFAULT 'Completed',
  `reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `transaction_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_logs_txn_id_unique` (`txn_id`),
  KEY `transaction_logs_user_id_foreign` (`user_id`),
  KEY `idx_transaction_logs_status_method` (`status`,`method`),
  CONSTRAINT `transaction_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cart_followups`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_followups` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `cart_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `stage` varchar(100) NOT NULL DEFAULT '1st Email Sent',
  `status` varchar(50) NOT NULL DEFAULT 'In Progress',
  `last_contacted_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_followups_user_id_foreign` (`user_id`),
  KEY `idx_cart_followups_status_stage` (`status`,`stage`),
  CONSTRAINT `cart_followups_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `knowledge_base_articles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `knowledge_base_articles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'General',
  `content` longtext DEFAULT NULL,
  `views_count` int(10) unsigned NOT NULL DEFAULT 0,
  `status` varchar(50) NOT NULL DEFAULT 'Published',
  `author_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `knowledge_base_articles_slug_unique` (`slug`),
  KEY `knowledge_base_articles_author_id_foreign` (`author_id`),
  KEY `idx_knowledge_base_articles_status_category` (`status`,`category`),
  CONSTRAINT `knowledge_base_articles_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `courier_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courier_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `courier` varchar(100) NOT NULL,
  `endpoint` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Success',
  `status_code` int(11) NOT NULL DEFAULT 200,
  `payload` longtext DEFAULT NULL,
  `response` longtext DEFAULT NULL,
  `tracking_id` varchar(255) DEFAULT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courier_logs_order_id_foreign` (`order_id`),
  KEY `idx_courier_logs_courier_status` (`courier`,`status`),
  CONSTRAINT `courier_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `debug_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `debug_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `message` text NOT NULL,
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `channel` varchar(100) NOT NULL DEFAULT 'laravel.log',
  `file_path` varchar(255) DEFAULT NULL,
  `line_number` int(11) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debug_logs_user_id_foreign` (`user_id`),
  KEY `idx_debug_logs_type_channel` (`type`,`channel`),
  CONSTRAINT `debug_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `visitor_analytics`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visitor_analytics` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `device` varchar(50) NOT NULL DEFAULT 'Desktop',
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `referrer` varchar(500) DEFAULT NULL,
  `country` varchar(100) NOT NULL DEFAULT 'Bangladesh',
  `city` varchar(100) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `visited_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_analytics_user_id_foreign` (`user_id`),
  KEY `idx_visitor_analytics_visited_device` (`visited_at`,`device`),
  KEY `idx_visitor_analytics_ip` (`ip_address`),
  CONSTRAINT `visitor_analytics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- Table structure for `offers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `offers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `promo_code` varchar(255) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `offers_user_id_foreign` (`user_id`),
  KEY `idx_offers_user_status` (`user_id`,`status`),
  CONSTRAINT `offers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `product_reviews`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `order_id` bigint(20) unsigned DEFAULT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_reviews_product_id_foreign` (`product_id`),
  KEY `product_reviews_user_id_foreign` (`user_id`),
  KEY `product_reviews_order_id_foreign` (`order_id`),
  CONSTRAINT `product_reviews_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure user_name, user_email, status exist in product_reviews if table already existed
SET @colCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'product_reviews' AND column_name = 'user_name');
SET @alterStmt = IF(@colCount = 0, 'ALTER TABLE `product_reviews` ADD COLUMN `user_name` VARCHAR(255) NULL AFTER `user_id`, ADD COLUMN `user_email` VARCHAR(255) NULL AFTER `user_name`, ADD COLUMN `status` VARCHAR(255) NOT NULL DEFAULT \'pending\' AFTER `is_verified`;', 'SELECT 1;');
PREPARE stmt FROM @alterStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure default promo code SPECIAL20 is in coupons table
INSERT IGNORE INTO `coupons` (`code`, `type`, `value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `used_count`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
('SPECIAL20', 'percentage', 20.00, 500.00, 500.00, 1000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1, NOW(), NOW());

-- Ensure is_featured exists on shops
SET @shopColCount = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'shops' AND column_name = 'is_featured');
SET @alterShopStmt = IF(@shopColCount = 0, 'ALTER TABLE `shops` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `status`;', 'SELECT 1;');
PREPARE stmt FROM @alterShopStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure shop_id exists on coupons
SET @couponShopCol = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'coupons' AND column_name = 'shop_id');
SET @alterCouponStmt = IF(@couponShopCol = 0, 'ALTER TABLE `coupons` ADD COLUMN `shop_id` BIGINT(20) UNSIGNED NULL AFTER `id`;', 'SELECT 1;');
PREPARE stmt FROM @alterCouponStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure shop_id exists on order_items
SET @itemShopCol = (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'order_items' AND column_name = 'shop_id');
SET @alterItemStmt = IF(@itemShopCol = 0, 'ALTER TABLE `order_items` ADD COLUMN `shop_id` BIGINT(20) UNSIGNED NULL AFTER `order_id`;', 'SELECT 1;');
PREPARE stmt FROM @alterItemStmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;




