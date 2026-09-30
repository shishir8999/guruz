-- ============================================================
-- GURUZ E-Commerce MySQL Database Dump for cPanel Import
-- Generated: 2026-08-23 21:46:47
-- MySQL Version Compatibility: 5.7+ / 8.0+ / MariaDB 10.3+
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+06:00';

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `completed_orders_count` int(10) unsigned NOT NULL DEFAULT 0,
  `email` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('active','blocked','suspended') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `birthday` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('1', 'Updated Test User', '01711223344', NULL, '0', 'admin@guruz.com', NULL, NULL, NULL, '$2y$12$qbhBIemuWs6aSkbOqhgZM.atOYRejTKPkCOH46CLkLAUJEO2P6EY2', 'active', '2026-08-09 22:46:16', NULL, '2026-08-05 16:30:03', '2026-08-21 22:51:04', '1995-05-15', NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('2', 'Guruz Official Store', '01800000000', 'avatars/m16WFHD8EF3KshuHhg33KmnSdiAnIZh3woS1c2rQ.png', '0', 'seller@guruz.com', NULL, NULL, NULL, '$2y$12$kjandEGwg5nhv32lC.8eYeZMBrzRnCls3eBZXCqHg/Mj/BqB.neXm', 'active', NULL, NULL, '2026-08-05 16:30:03', '2026-08-14 18:28:17', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('3', 'Shishir Ahmed', '01900000000', NULL, '0', 'customer@guruz.com', NULL, NULL, NULL, '$2y$12$J/DBNOU./3Vb0.VgyBG9nuqa6eW/aHzp5EjMctZqmiyI/Y8n9v4Zi', 'active', NULL, NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('4', 'Shishir Super Admin', '01700000001', '/uploads/avatars/avatar_4_1786705777.png', '0', 'shishirbarai2050@gmail.com', NULL, NULL, NULL, '$2y$12$Ixmm/I.Vmmq7VKvkPCyEvOdNHHNk6XWDS42RCtUGXtLNgQM2hiMoC', 'active', '2026-08-22 21:09:17', NULL, '2026-08-05 16:48:54', '2026-08-22 21:09:17', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('8', 'John Doe', NULL, NULL, '0', 'johndoe@example.com', NULL, NULL, NULL, '$2y$12$ASp2XNsTnKXrkguFGgRLTOBa1GZDnsm8rcbtKiCHIGGO0apQQ9OPS', 'active', NULL, NULL, '2026-08-09 20:10:51', '2026-08-09 20:10:51', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('9', 'Pending Owner', NULL, NULL, '0', 'pendingowner@example.com', NULL, NULL, NULL, '$2y$12$LFARhTniULy8xLsMOuRfRegvYblXZ40qLNnshl1NqvWaxteoOHT3a', 'active', NULL, NULL, '2026-08-09 20:19:31', '2026-08-09 20:19:31', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('13', 'shishir barai', '+8801982708789', NULL, '0', 'shishirbarai019@gmail.com', NULL, NULL, NULL, '$2y$12$SOvCNXWMsf.XnlDc.QFMbOcm4J6i0SZVkz52KXzV68X6Bw2S132ze', 'active', NULL, NULL, '2026-08-10 22:10:40', '2026-08-10 22:10:40', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('14', 'shishir barai', '+8801982708789', NULL, '0', 'shishirbarai01982708789@gmail.com', NULL, NULL, NULL, '$2y$12$Y9EuEPPCYLpMWfkqNa4UnusHNjNc9u2BnQ0y2OGclSW7C.BwmsP8C', 'active', NULL, NULL, '2026-08-11 01:59:21', '2026-08-11 01:59:21', NULL, NULL);
INSERT INTO `users` (`id`, `name`, `phone`, `avatar_url`, `completed_orders_count`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `status`, `last_login_at`, `remember_token`, `created_at`, `updated_at`, `birthday`, `address`) VALUES ('16', 'Babita Barai', NULL, NULL, '0', 'bbarai345@gmail.com', NULL, NULL, NULL, NULL, 'active', NULL, NULL, '2026-08-15 00:10:37', '2026-08-15 00:10:37', NULL, NULL);

-- --------------------------------------------------------
-- Table structure for `shops`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `shops`;
CREATE TABLE `shops` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `banner_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `custom_domain` varchar(255) DEFAULT NULL,
  `custom_domain_status` varchar(255) NOT NULL DEFAULT 'Active & Verified',
  `custom_domain_dns_verified` tinyint(1) NOT NULL DEFAULT 1,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `rating` decimal(3,2) NOT NULL DEFAULT 5.00,
  `commission_rate` decimal(5,2) NOT NULL DEFAULT 10.00,
  `status` enum('pending','active','suspended','closed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shops_slug_unique` (`slug`),
  KEY `shops_user_id_foreign` (`user_id`),
  KEY `shops_status_index` (`status`),
  CONSTRAINT `shops_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `shops`
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('1', '2', 'Guruz Official Gadgets & Electronics', 'guruz-official', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '4.90', '5.00', 'active', '2026-08-05 16:30:03', '2026-08-14 12:22:49');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('2', '1', 'Spark Cables Shop', 'spark-cables', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-09 20:10:51', '2026-08-11 00:34:30');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('3', '9', 'Real Pending Electronics', 'real-pending-shop', '/storage/shops/r917M6rCa6F2eAP4Eh1O2yze7T7Tw7iY2XFlpqGE.jpg', '/storage/shops/IhC7OSg8Sfu7rJ1KfC7Xy53XBZ1VHiubMr3bHt1s.png', NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-09 20:19:31', '2026-08-12 21:57:14');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('5', '3', 'Shishir Ahmed\'s Shop', 'shishir-ahmed-shop-3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-12 05:13:55', '2026-08-12 05:13:55');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('6', '4', 'Shishir Super Admin\'s Shop', 'shishir-super-admin-shop-4', '/uploads/avatars/avatar_4_1786705777.png', '/storage/shops/B4I8tNHhBZPnXQ2U1MRiXM8vccv9jgkSuQNtGUBL.png', NULL, '01982708789', 'shishirbarai019@gmail.com', 'http://sparkcables.com/', NULL, 'Active & Verified', '1', 'kalabari,kotalipara,gopalgonj', 'dhaka', NULL, '5.00', '10.00', 'active', '2026-08-12 05:13:55', '2026-08-14 17:09:37');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('7', '8', 'John Doe\'s Shop', 'john-doe-shop-8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-12 05:13:55', '2026-08-12 05:13:55');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('8', '13', 'shishir barai\'s Shop', 'shishir-barai-shop-13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-12 05:13:55', '2026-08-12 05:13:55');
INSERT INTO `shops` (`id`, `user_id`, `name`, `slug`, `logo_url`, `banner_url`, `description`, `phone`, `email`, `website`, `custom_domain`, `custom_domain_status`, `custom_domain_dns_verified`, `address`, `city`, `zone`, `rating`, `commission_rate`, `status`, `created_at`, `updated_at`) VALUES ('9', '14', 'shishir barai\'s Shop', 'shishir-barai-shop-14', '/storage/shops/OBRCBmsIVvEzgi5ksNiMQ88orvjaHEa9BsiEeb1b.jpg', '/storage/shops/cRQk5jMqBefc0bZkD6GBTCkLX0xn98TAowu6InYW.png', NULL, NULL, NULL, NULL, NULL, 'Active & Verified', '1', NULL, NULL, NULL, '5.00', '10.00', 'active', '2026-08-12 05:13:55', '2026-08-13 23:18:28');

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_foreign` (`parent_id`),
  KEY `categories_name_index` (`name`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `categories`
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('1', 'ইলেকট্রনিক্স', 'electronics', '⚡', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:08:16');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('2', 'ফ্যাশন', 'fashion', '👗', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:10:28');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('3', 'বিউটি', 'beauty', '💄', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('4', 'গ্রোসারি', 'grocery', '🛒', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('5', 'ঘর ও লিভিং', 'home-living', '🏠', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('6', 'মোবাইল', 'mobile', '📱', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('7', 'বেবি', 'baby', '👶', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('8', 'স্পোর্টস', 'sports', '⚽', NULL, NULL, '1', '0', '2026-08-05 16:30:04', '2026-08-08 20:07:55');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('10', 'gchjfgyu', 'yytity', '📦', NULL, NULL, '1', '1', '2026-08-09 19:59:41', '2026-08-09 19:59:41');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('11', 'Smart Home & IoT Devices', 'smart-home-iot-devices', NULL, NULL, NULL, '0', '0', '2026-08-14 12:23:01', '2026-08-14 12:23:01');
INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image_url`, `parent_id`, `is_featured`, `display_order`, `created_at`, `updated_at`) VALUES ('12', 'dgddg', 'dgddg', NULL, NULL, NULL, '0', '0', '2026-08-14 12:23:03', '2026-08-14 12:23:03');

-- --------------------------------------------------------
-- Table structure for `brands`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `brands_slug_unique` (`slug`),
  KEY `brands_name_index` (`name`),
  KEY `brands_shop_id_foreign` (`shop_id`),
  CONSTRAINT `brands_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `brands`
INSERT INTO `brands` (`id`, `shop_id`, `name`, `slug`, `logo_url`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES ('1', NULL, 'Guruz Authorized', 'guruz-brand', NULL, '1', '1', '2026-08-05 16:30:04', '2026-08-08 20:05:07');
INSERT INTO `brands` (`id`, `shop_id`, `name`, `slug`, `logo_url`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES ('3', NULL, 'ttuytytyu', 'uttutu', '/storage/brands/eI8xCm64uhfsuom2Iou6cCBiRE8rJSi1p1pioPPk.png', '1', '1', '2026-08-14 17:45:11', '2026-08-14 17:45:21');

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `brand_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `product_type` varchar(255) NOT NULL DEFAULT 'single',
  `slug` varchar(255) NOT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `weight` decimal(8,2) DEFAULT NULL,
  `warranty_type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `specification` text DEFAULT NULL,
  `primary_image_url` varchar(255) DEFAULT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attributes`)),
  `rating` decimal(3,2) NOT NULL DEFAULT 5.00,
  `total_reviews` int(11) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_flash_sale` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_retail` tinyint(1) NOT NULL DEFAULT 1,
  `is_wholesale` tinyint(1) NOT NULL DEFAULT 0,
  `min_vip_level` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `colors` text DEFAULT NULL,
  `sizes` text DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_shop_id_foreign` (`shop_id`),
  KEY `products_category_id_foreign` (`category_id`),
  KEY `products_brand_id_foreign` (`brand_id`),
  KEY `products_name_index` (`name`),
  KEY `products_sku_index` (`sku`),
  KEY `products_is_active_index` (`is_active`),
  KEY `products_is_featured_index` (`is_featured`),
  KEY `products_created_at_index` (`created_at`),
  KEY `products_unit_id_foreign` (`unit_id`),
  CONSTRAINT `products_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `products`
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('1', '1', '1', '1', NULL, NULL, 'UGREEN CR113 4-in-1 USB 3.0 Hub', 'single', 'ugreen-cr113-4-in-1-usb-hub', 'GRZ-PROD-1', '4444.00', NULL, '1190.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', NULL, '4.90', '53', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('2', '1', '1', '1', NULL, NULL, 'Anker Soundcore R50i True Wireless Earbuds', 'single', 'anker-soundcore-r50i', 'GRZ-PROD-2', '2200.00', NULL, '1790.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', NULL, '4.90', '39', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('3', '1', '1', '1', NULL, NULL, 'Anker Soundcore R60i NC Active Noise Cancelling', 'single', 'anker-soundcore-r60i-nc', 'GRZ-PROD-3', '3200.00', NULL, '2650.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500', NULL, '4.90', '27', '1', '1', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:35:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('4', '1', '1', '1', NULL, NULL, 'OLAX M100 সিম সাপোর্টেড পকেট রাউটার 4G', 'single', 'olax-m100-pocket-router', 'GRZ-PROD-4', '2850.00', NULL, '2290.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', NULL, '4.90', '39', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('5', '1', '1', '1', NULL, NULL, 'TP-Link Archer C80 AC1900 Dual-Band Gigabit Router', 'single', 'tp-link-archer-c80', 'GRZ-PROD-5', '4500.00', NULL, '3890.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', NULL, '4.90', '76', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('6', '1', '1', '1', NULL, NULL, 'TP-Link Archer C6 AC1200 Gigabit Router', 'single', 'tp-link-archer-c6', 'GRZ-PROD-6', '3400.00', NULL, '2850.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', NULL, '4.90', '51', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('7', '1', '1', '1', NULL, NULL, 'Logitech K120 USB Keyboard (Official Warranted)', 'single', 'logitech-k120-keyboard', 'GRZ-PROD-7', '850.00', NULL, '690.00', '49', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', NULL, '4.90', '24', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 18:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('8', '1', '1', '1', NULL, NULL, 'A4TECH OP-730D 2X Click Optical Wired Mouse', 'single', 'a4tech-op-730d-mouse', 'GRZ-PROD-8', '650.00', NULL, '490.00', '49', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', NULL, '4.90', '35', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 18:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('9', '1', '1', '1', NULL, NULL, 'Logitech B100 Optical USB Mouse', 'single', 'logitech-b100-mouse', 'GRZ-PROD-9', '550.00', NULL, '450.00', '49', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500', NULL, '4.90', '40', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 18:07:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('10', '1', '1', '1', NULL, NULL, 'Boya BY-M1 Pro II 3.5mm Lavalier Microphone', 'single', 'boya-by-m1-pro-ii', 'GRZ-PROD-10', '1650.00', NULL, '1350.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', NULL, '4.90', '62', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('11', '1', '1', '1', NULL, NULL, 'MAONO PD100X RGB USB/XLR Dynamic Microphone', 'single', 'maono-pd100x-mic', 'GRZ-PROD-11', '4800.00', NULL, '4200.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', NULL, '4.90', '46', '1', '1', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:35:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('12', '1', '1', '1', NULL, NULL, 'FIFINE AmpliGame AM8 RGB USB/XLR Microphone', 'single', 'fifine-am8-mic', 'GRZ-PROD-12', '5500.00', NULL, '4850.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', NULL, '4.90', '33', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('13', '1', '5', '1', NULL, NULL, 'Osaka FP 126-P Portable Electric Juicer Blender', 'single', 'osaka-fp-126-p-juicer', 'GRZ-PROD-13', '1850.00', NULL, '1390.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '4.90', '42', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('14', '1', '5', '1', NULL, NULL, 'Miyako LK0508 Electric Fast Boiling Kettle 2L', 'single', 'miyako-lk0508-kettle', 'GRZ-PROD-14', '1350.00', NULL, '990.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '4.90', '61', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('15', '1', '5', '1', NULL, NULL, 'Prestige Mini Multi Cooker 2L Non-Stick', 'single', 'prestige-mini-multi-cooker', 'GRZ-PROD-15', '2400.00', NULL, '1850.00', '50', NULL, NULL, 'Official Guruz BD product with 100% authenticity guarantee and fast nationwide cash on delivery.', NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '4.90', '64', '1', '0', '1', '1', '0', NULL, '2026-08-05 16:30:04', '2026-08-05 16:30:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('16', '1', NULL, NULL, NULL, 'pcs', 'UGREEN USB 3.0 Hub', 'single', 'ugreen-usb-30-hub', NULL, '1150.00', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-09 20:36:51', '2026-08-09 20:58:55', '2026-08-09 20:58:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('17', '1', NULL, NULL, NULL, 'pcs', 'Logitech Mouse', 'single', 'logitech-mouse', NULL, '450.00', NULL, NULL, '0', NULL, NULL, NULL, NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-09 20:36:51', '2026-08-10 07:42:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('18', '1', '1', '1', NULL, NULL, 'JKHKKJH', 'single', 'jkhkkjh-TmlTbw', 'SKU-P4CA0JA', '1111.00', NULL, '1000.00', '10', NULL, NULL, 'HKHKHKHK', NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-10 07:38:08', '2026-08-10 07:42:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('19', '1', '10', '1', NULL, NULL, 'uytuyrtuiy', 'single', 'uytuyrtuiy-Jr5ch8', 'SKU-94460Z8', '1111.00', NULL, '1111.00', '10', NULL, NULL, 'jyhjhyjhyj', NULL, 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-10 07:44:48', '2026-08-10 21:22:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('20', '9', NULL, NULL, NULL, NULL, 'Premium Wireless Headphones', 'single', 'premium-wireless-headphones-9-787', NULL, '2500.00', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, '5.00', '0', '0', '1', '1', '1', '0', NULL, '2026-08-13 21:28:52', '2026-08-14 16:35:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('21', '9', NULL, NULL, NULL, NULL, 'Premium Wireless Headphones', 'single', 'premium-wireless-headphones-9-471', NULL, '2500.00', NULL, NULL, '0', NULL, NULL, NULL, NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-13 21:28:52', '2026-08-13 23:28:45', '2026-08-13 23:28:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('22', '9', NULL, NULL, NULL, NULL, 'Premium Wireless Headphones', 'single', 'premium-wireless-headphones-9-625', NULL, '2500.00', NULL, NULL, '1', NULL, NULL, NULL, NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-13 21:29:00', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('23', '6', '2', '1', NULL, 'hfhf', 'Kobe go asbe Tumi amr kache//কবে গো আসবে তুমি আমার কাছে😭😭😭', 'single', 'kobe-go-asbe-tumi-amr-kachekbe-go-asbe-tumi-amar-kache-e2naqx', 'SKU-1YA1GNK', '5.00', NULL, '4.00', '6', NULL, NULL, 'Kobe go asbe Tumi amr kache//কবে গো আসবে তুমি আমার কাছে😭😭😭', NULL, NULL, '\"[]\"', '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 07:27:13', '2026-08-14 08:50:40', '2026-08-14 08:50:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('24', '6', '2', '1', NULL, 'hfhf', 'ন এবং AI সাহায্যে আপনার প্রোডা', 'single', 'n-ebng-ai-sahazze-apnar-proda-Fiaulw', 'SKU-7IE1DHL', '10.00', NULL, '9.00', '4', NULL, NULL, 'ন এবং AI সাহায্যে আপনার প্রোডা', NULL, NULL, '\"[]\"', '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 07:32:23', '2026-08-14 08:50:46', '2026-08-14 08:50:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('25', '6', NULL, NULL, NULL, 'pcs', 'UGREEN USB 3.0 Hub', 'single', 'ugreen-usb-30-hub-6a7e7bbc57ed2', 'SKU-LOOEVANE', '1150.00', '805.00', '1150.00', '0', NULL, NULL, 'No description provided.', NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-14 08:21:48', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('26', '6', NULL, NULL, NULL, 'pcs', 'Logitech Mouse', 'single', 'logitech-mouse-6a7e7bbc598c4', 'SKU-EEMJSLUG', '450.00', '315.00', '450.00', '0', NULL, NULL, 'No description provided.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 08:21:48', '2026-08-14 08:21:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('27', '6', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7e7be1f1df3', 'SPK-CBL-15RM', '4500.00', '3500.00', '4200.00', '750', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 08:22:25', '2026-08-14 08:50:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('28', '6', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7e7be1f30f8', 'GRZ-EXT-5M', '1200.00', '750.00', '990.00', '400', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-14 08:22:25', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('30', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a17ed11', 'SPK-CBL-15RM-NEMY', '4500.00', '3500.00', '4200.00', '150', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:55', '2026-08-14 14:32:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('31', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a1811f8', 'GRZ-EXT-5M-YORL', '1200.00', '750.00', '990.00', '80', NULL, 'No warranty', 'Heavy-duty multi-plug extension socket with surge protector.', '', '/storage/products/6a7ed678b9396-1786697336.webp', NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:48:56', NULL, '[]', '[]', '[]', '[]', NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('32', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a181e14', 'SPK-CBL-15RM-GPBV', '2100.00', '2000.00', '2220.00', '10', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('33', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a182b08', 'GRZ-EXT-5M-EK5O', '5400.00', '4750.00', '5430.00', '60', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('34', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a183a34', 'SPK-CBL-15RM-TPXI', '8700.00', '7500.00', '8640.00', '130', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('35', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a1845a2', 'GRZ-EXT-5M-UOIV', '12000.00', '10250.00', '11850.00', '200', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('36', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a185128', 'SPK-CBL-15RM-WNDW', '15300.00', '13000.00', '15060.00', '270', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '1', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 16:35:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('37', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a185c07', 'GRZ-EXT-5M-AJNV', '18600.00', '15750.00', '18270.00', '340', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('38', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a18678e', 'SPK-CBL-15RM-SWLS', '21900.00', '18500.00', '21480.00', '410', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('39', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a187652', 'GRZ-EXT-5M-6YFT', '25200.00', '21250.00', '24690.00', '480', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('40', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a1883da', 'SPK-CBL-15RM-4Z7O', '28500.00', '24000.00', '27900.00', '550', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('41', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a188faa', 'GRZ-EXT-5M-OD9S', '31800.00', '26750.00', '31110.00', '620', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('42', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a189c62', 'SPK-CBL-15RM-8VZU', '35100.00', '29500.00', '34320.00', '690', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('43', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a18a6a2', 'GRZ-EXT-5M-NKDD', '38400.00', '32250.00', '37530.00', '760', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('44', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a18b516', 'SPK-CBL-15RM-CUF6', '41700.00', '35000.00', '40740.00', '830', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '1', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 16:24:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('45', '9', NULL, '1', NULL, 'Pcs', 'Guruz Premium Extension Socket 5M', 'single', 'guruz-premium-extension-socket-5m-6a7ed2a18c3d2', 'GRZ-EXT-5M-7PGA', '45000.00', '37750.00', '43950.00', '900', NULL, NULL, 'Heavy-duty multi-plug extension socket with surge protector.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('46', '9', NULL, NULL, NULL, 'Coil', 'Spark High Voltage Cable 1.5RM', 'single', 'spark-high-voltage-cable-15rm-6a7ed2a18cf5b', 'SPK-CBL-15RM-HQKT', '48300.00', '40500.00', '47160.00', '970', NULL, NULL, 'High quality copper wire cable for household and industrial usage.', NULL, NULL, NULL, '5.00', '0', '0', '0', '1', '1', '0', NULL, '2026-08-14 14:32:33', '2026-08-14 14:32:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `products` (`id`, `shop_id`, `category_id`, `brand_id`, `unit_id`, `unit`, `name`, `product_type`, `slug`, `sku`, `price`, `purchase_price`, `sale_price`, `stock_quantity`, `weight`, `warranty_type`, `description`, `specification`, `primary_image_url`, `attributes`, `rating`, `total_reviews`, `is_featured`, `is_flash_sale`, `is_active`, `is_retail`, `is_wholesale`, `min_vip_level`, `created_at`, `updated_at`, `deleted_at`, `colors`, `sizes`, `materials`, `tags`, `video_url`, `meta_title`, `meta_description`) VALUES ('47', '8', '10', '3', NULL, NULL, 'vcnggh', 'single', 'vcnggh-3AZLRj', 'SKU-QXKOSJR', '50.00', NULL, '40.00', '50', NULL, NULL, 'tghththt', NULL, '/storage/products/JMFSLreOC9YZnkWxl0X6G7zXDOzXGQUbMFUI93VI.png', NULL, '5.00', '0', '0', '1', '1', '1', '0', NULL, '2026-08-14 18:02:47', '2026-08-14 18:05:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
-- Table structure for `product_images`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_foreign` (`product_id`),
  CONSTRAINT `product_images_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `product_images`
INSERT INTO `product_images` (`id`, `product_id`, `url`, `is_primary`, `sort_order`, `created_at`, `updated_at`) VALUES ('1', '19', '/storage/products/gallery/go3Tr3Yaq64q07Jal3TF6jaqURB9pN0pBHfGN00h.jpg', '0', '0', '2026-08-10 21:07:40', '2026-08-10 21:07:40');

-- --------------------------------------------------------
-- Table structure for `product_variants`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `attributes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`attributes`)),
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_variants_product_id_foreign` (`product_id`),
  CONSTRAINT `product_variants_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  `delivered_at` timestamp NULL DEFAULT NULL,
  `payment_status` enum('unpaid','paid','refunded','partially_refunded') NOT NULL DEFAULT 'unpaid',
  `payment_method` varchar(255) NOT NULL DEFAULT 'cod',
  `payment_trx_id` varchar(255) DEFAULT NULL,
  `payment_sender_number` varchar(255) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_shop_id_foreign` (`shop_id`),
  CONSTRAINT `orders_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `orders`
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shop_id`, `status`, `delivered_at`, `payment_status`, `payment_method`, `payment_trx_id`, `payment_sender_number`, `transaction_id`, `subtotal`, `shipping_fee`, `discount`, `total`, `currency`, `exchange_rate`, `currency_amount`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country`, `city`, `zone`, `courier_name`, `courier_tracking_id`, `notes`, `created_at`, `updated_at`) VALUES ('3', 'GRZ-5ITHHAZX', '1', NULL, 'processing', NULL, 'unpaid', 'cod', NULL, NULL, NULL, '1790.00', '60.00', '0.00', '1850.00', 'BDT', '1.0000', NULL, 'Updated Test User', 'admin@guruz.com', '01700000001', 'kalabari,kotalipara,gopalgonj', 'Bangladesh', 'dhaka', NULL, NULL, NULL, NULL, '2026-08-09 19:32:04', '2026-08-21 23:06:20');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shop_id`, `status`, `delivered_at`, `payment_status`, `payment_method`, `payment_trx_id`, `payment_sender_number`, `transaction_id`, `subtotal`, `shipping_fee`, `discount`, `total`, `currency`, `exchange_rate`, `currency_amount`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country`, `city`, `zone`, `courier_name`, `courier_tracking_id`, `notes`, `created_at`, `updated_at`) VALUES ('4', 'GRZ-IKDBGHAV', '1', NULL, 'shipped', NULL, 'unpaid', 'cod', NULL, NULL, NULL, '7780.00', '60.00', '0.00', '7840.00', 'BDT', '1.0000', NULL, 'Updated Test User', 'admin@guruz.com', '01700000001', 'kalabari,kotalipara,gopalgonj', 'Bangladesh', 'dhaka', NULL, NULL, NULL, NULL, '2026-08-11 21:08:25', '2026-08-21 23:06:20');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shop_id`, `status`, `delivered_at`, `payment_status`, `payment_method`, `payment_trx_id`, `payment_sender_number`, `transaction_id`, `subtotal`, `shipping_fee`, `discount`, `total`, `currency`, `exchange_rate`, `currency_amount`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country`, `city`, `zone`, `courier_name`, `courier_tracking_id`, `notes`, `created_at`, `updated_at`) VALUES ('5', 'ORD-90234', '1', '9', 'processing', NULL, 'paid', 'bKash', NULL, NULL, NULL, '1350.00', '100.00', '0.00', '1450.00', 'BDT', '1.0000', NULL, 'Updated Test User', 'admin@guruz.com', '+8801700000001', 'House 14, Road 5, Block B, Banani, Dhaka', 'Bangladesh', NULL, NULL, NULL, NULL, NULL, '2026-08-14 00:31:06', '2026-08-21 23:06:20');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shop_id`, `status`, `delivered_at`, `payment_status`, `payment_method`, `payment_trx_id`, `payment_sender_number`, `transaction_id`, `subtotal`, `shipping_fee`, `discount`, `total`, `currency`, `exchange_rate`, `currency_amount`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country`, `city`, `zone`, `courier_name`, `courier_tracking_id`, `notes`, `created_at`, `updated_at`) VALUES ('6', 'GRZ-OS4IMPDF', '1', NULL, 'pending', NULL, 'unpaid', 'cod', NULL, NULL, NULL, '990.00', '60.00', '0.00', '1050.00', 'BDT', '1.0000', NULL, 'Updated Test User', 'admin@guruz.com', '+8801982708789', 'foridpur', 'Bangladesh', 'dhaka', NULL, NULL, NULL, NULL, '2026-08-14 15:06:07', '2026-08-21 23:06:20');
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `shop_id`, `status`, `delivered_at`, `payment_status`, `payment_method`, `payment_trx_id`, `payment_sender_number`, `transaction_id`, `subtotal`, `shipping_fee`, `discount`, `total`, `currency`, `exchange_rate`, `currency_amount`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `country`, `city`, `zone`, `courier_name`, `courier_tracking_id`, `notes`, `created_at`, `updated_at`) VALUES ('7', 'POS-XJTOJL8P', '1', '1', 'delivered', NULL, 'paid', 'bkash', NULL, NULL, NULL, '1630.00', '0.00', '0.00', '1630.00', 'BDT', '1.0000', NULL, 'Updated Test User', 'admin@guruz.com', 'N/A', 'In-Store POS Counter Sale', 'Bangladesh', NULL, NULL, NULL, NULL, NULL, '2026-08-14 18:07:47', '2026-08-21 23:06:20');

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_product_id_foreign` (`product_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `order_items`
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('3', '3', '2', 'Anker Soundcore R50i True Wireless Earbuds', '1790.00', '1', '1790.00', NULL, '2026-08-09 19:32:04', '2026-08-09 19:32:04');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('4', '4', '5', 'TP-Link Archer C80 AC1900 Dual-Band Gigabit Router', '3890.00', '2', '7780.00', NULL, '2026-08-11 21:08:25', '2026-08-11 21:08:25');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('5', '6', '31', 'Guruz Premium Extension Socket 5M', '990.00', '1', '990.00', NULL, '2026-08-14 15:06:07', '2026-08-14 15:06:07');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('6', '7', '7', 'Logitech K120 USB Keyboard (Official Warranted)', '690.00', '1', '690.00', NULL, '2026-08-14 18:07:47', '2026-08-14 18:07:47');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('7', '7', '8', 'A4TECH OP-730D 2X Click Optical Wired Mouse', '490.00', '1', '490.00', NULL, '2026-08-14 18:07:47', '2026-08-14 18:07:47');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('8', '7', '9', 'Logitech B100 Optical USB Mouse', '450.00', '1', '450.00', NULL, '2026-08-14 18:07:47', '2026-08-14 18:07:47');
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`, `subtotal`, `options`, `created_at`, `updated_at`) VALUES ('9', '5', '1', 'Premium Cotton Men Shirt / কটন শার্ট', '1450.00', '1', '1450.00', NULL, '2026-08-21 23:06:20', '2026-08-21 23:06:20');

-- --------------------------------------------------------
-- Table structure for `warranty_claims`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `warranty_claims`;
CREATE TABLE `warranty_claims` (
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
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `warranty_claims_claim_number_unique` (`claim_number`),
  KEY `warranty_claims_user_id_foreign` (`user_id`),
  CONSTRAINT `warranty_claims_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `warranty_claims`
INSERT INTO `warranty_claims` (`id`, `claim_number`, `user_id`, `customer_name`, `mobile_number`, `email`, `order_id`, `product_name`, `brand_name`, `product_model`, `purchase_date`, `issue_category`, `problem_details`, `video_path`, `google_drive_link`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES ('1', 'WRN-PK0U-5551', NULL, 'shishir barai', '01982708789', 'shishirbarai01982708789@gmail.com', '56365', 'hjhhjhg', 'bbgchg', '4563456', '2026-08-20', 'Display Issue', 'gtjhfggjhgfj', NULL, 'https://drive.google.com/file/d/10kVLMHRkM2FpyuIPBOmpH04qnf8X150w/view?usp=drive_link', 'pending', NULL, '2026-08-23 21:43:51', '2026-08-23 21:43:51');

-- --------------------------------------------------------
-- Table structure for `vendor_kycs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `vendor_kycs`;
CREATE TABLE `vendor_kycs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `nid_number` varchar(255) DEFAULT NULL,
  `nid_front_image` varchar(255) DEFAULT NULL,
  `nid_back_image` varchar(255) DEFAULT NULL,
  `trade_license_number` varchar(255) DEFAULT NULL,
  `trade_license_image` varchar(255) DEFAULT NULL,
  `bank_statement_image` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `routing_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `rejection_reason` text DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vendor_kycs_shop_id_foreign` (`shop_id`),
  KEY `vendor_kycs_user_id_foreign` (`user_id`),
  KEY `vendor_kycs_reviewed_by_foreign` (`reviewed_by`),
  CONSTRAINT `vendor_kycs_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vendor_kycs_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `vendor_kycs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `vendor_kycs`
INSERT INTO `vendor_kycs` (`id`, `shop_id`, `user_id`, `nid_number`, `nid_front_image`, `nid_back_image`, `trade_license_number`, `trade_license_image`, `bank_statement_image`, `bank_name`, `account_name`, `account_number`, `branch_name`, `routing_number`, `status`, `rejection_reason`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES ('1', '1', '2', '1234567890123', NULL, NULL, 'TRD-998877', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, '2026-08-09 20:16:07', '4', '2026-08-09 20:14:54', '2026-08-09 20:16:07');
INSERT INTO `vendor_kycs` (`id`, `shop_id`, `user_id`, `nid_number`, `nid_front_image`, `nid_back_image`, `trade_license_number`, `trade_license_image`, `bank_statement_image`, `bank_name`, `account_name`, `account_number`, `branch_name`, `routing_number`, `status`, `rejection_reason`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES ('2', '3', '9', '1234567890123', NULL, NULL, 'TRD-998877', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Approved', NULL, '2026-08-09 20:26:28', '4', '2026-08-09 20:19:31', '2026-08-09 20:26:28');
INSERT INTO `vendor_kycs` (`id`, `shop_id`, `user_id`, `nid_number`, `nid_front_image`, `nid_back_image`, `trade_license_number`, `trade_license_image`, `bank_statement_image`, `bank_name`, `account_name`, `account_number`, `branch_name`, `routing_number`, `status`, `rejection_reason`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`) VALUES ('3', '9', '14', NULL, NULL, NULL, NULL, NULL, NULL, 'City Bank Ltd.', 'shishir barai', '1102 9384 8102 9901', 'Gulshan Branch, Dhaka', '225271892', 'Approved', NULL, NULL, NULL, '2026-08-13 22:30:27', '2026-08-13 22:30:27');

-- --------------------------------------------------------
-- Table structure for `payout_requests`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payout_requests`;
CREATE TABLE `payout_requests` (
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

-- Dumping data for table `payout_requests`
INSERT INTO `payout_requests` (`id`, `shop_id`, `amount`, `status`, `payment_method`, `account_details`, `admin_notes`, `created_at`, `updated_at`) VALUES ('1', '1', '54300.00', 'processed', 'Bank Transfer', '{\"account\":\"AC: 123.456.7890 | Branch: Uttara\"}', NULL, '2026-08-09 19:58:17', '2026-08-09 20:56:18');

-- --------------------------------------------------------
-- Table structure for `coupons`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
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
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `wishlists`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE `wishlists` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlists_user_id_product_id_unique` (`user_id`,`product_id`),
  KEY `wishlists_product_id_foreign` (`product_id`),
  CONSTRAINT `wishlists_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `wishlists`
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('3', '1', '1', '2026-08-11 21:41:29', '2026-08-11 21:41:29');
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('16', '14', '5', '2026-08-12 04:48:40', '2026-08-12 04:48:40');
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('18', '13', '5', '2026-08-14 12:15:22', '2026-08-14 12:15:22');
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('19', '13', '1', '2026-08-14 12:15:25', '2026-08-14 12:15:25');
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('22', '13', '25', '2026-08-14 12:15:31', '2026-08-14 12:15:31');
INSERT INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`, `updated_at`) VALUES ('23', '13', '26', '2026-08-14 12:15:31', '2026-08-14 12:15:31');

-- --------------------------------------------------------
-- Table structure for `customer_wallets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customer_wallets`;
CREATE TABLE `customer_wallets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `points` int(11) NOT NULL DEFAULT 0,
  `tier` varchar(255) NOT NULL DEFAULT 'bronze',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_wallets_user_id_unique` (`user_id`),
  CONSTRAINT `customer_wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `customer_wallets`
INSERT INTO `customer_wallets` (`id`, `user_id`, `balance`, `points`, `tier`, `created_at`, `updated_at`) VALUES ('1', '14', '100.00', '100', 'bronze', '2026-08-12 05:05:00', '2026-08-12 05:05:00');
INSERT INTO `customer_wallets` (`id`, `user_id`, `balance`, `points`, `tier`, `created_at`, `updated_at`) VALUES ('2', '13', '100.00', '100', 'bronze', '2026-08-14 12:14:55', '2026-08-14 12:14:55');

-- --------------------------------------------------------
-- Table structure for `seller_wallets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `seller_wallets`;
CREATE TABLE `seller_wallets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `pending_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_withdrawn` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seller_wallets_shop_id_unique` (`shop_id`),
  CONSTRAINT `seller_wallets_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `seller_wallets`
INSERT INTO `seller_wallets` (`id`, `shop_id`, `balance`, `pending_balance`, `total_withdrawn`, `created_at`, `updated_at`) VALUES ('1', '1', '13000.50', '0.00', '0.00', '2026-08-09 20:08:05', '2026-08-09 20:24:47');
INSERT INTO `seller_wallets` (`id`, `shop_id`, `balance`, `pending_balance`, `total_withdrawn`, `created_at`, `updated_at`) VALUES ('2', '2', '2000.00', '0.00', '0.00', '2026-08-09 20:10:51', '2026-08-09 20:57:31');

-- --------------------------------------------------------
-- Table structure for `site_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `group` varchar(255) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `site_settings`
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('1', 'active_theme_id', 'sheet', 'appearance', '2026-08-06 12:53:38', '2026-08-14 18:19:24');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('2', 'themes_data', '[{\"id\":\"grishmo\",\"seasonLabel\":\"GRISHMO\",\"name\":\"Grishmo (Summer)\",\"nameBn\":\"\\u0997\\u09cd\\u09b0\\u09c0\\u09b7\\u09cd\\u09ae\",\"emoji\":\"\\u2600\\ufe0f\",\"effectType\":\"Stars\",\"effectEmoji\":\"\\u2b50\",\"effectColor\":\"text-yellow-500\",\"intensity\":45,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-orange-400 to-amber-500\",\"startDate\":\"04-14\",\"endDate\":\"06-14\"},{\"id\":\"borsha\",\"seasonLabel\":\"BORSHA\",\"name\":\"Borsha (Monsoon)\",\"nameBn\":\"\\u09ac\\u09b0\\u09cd\\u09b7\\u09be\",\"emoji\":\"\\ud83c\\udf27\\ufe0f\",\"effectType\":\"Rain\",\"effectEmoji\":\"\\ud83c\\udf27\",\"effectColor\":\"text-blue-400\",\"intensity\":100,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-blue-500 to-cyan-500\",\"startDate\":\"06-15\",\"endDate\":\"08-15\"},{\"id\":\"sharat\",\"seasonLabel\":\"SHARAT\",\"name\":\"Sharat (Autumn)\",\"nameBn\":\"\\u09b6\\u09b0\\u09ce\",\"emoji\":\"\\ud83c\\udf38\",\"effectType\":\"Petals\",\"effectEmoji\":\"\\ud83c\\udf38\",\"effectColor\":\"text-rose-400\",\"intensity\":50,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-rose-400 to-pink-500\",\"startDate\":\"08-16\",\"endDate\":\"10-15\"},{\"id\":\"hemanta\",\"seasonLabel\":\"HEMANTA\",\"name\":\"Hemanta (Late Autumn)\",\"nameBn\":\"\\u09b9\\u09c7\\u09ae\\u09a8\\u09cd\\u09a4\",\"emoji\":\"\\ud83c\\udf41\",\"effectType\":\"Leaves\",\"effectEmoji\":\"\\ud83c\\udf42\",\"effectColor\":\"text-orange-400\",\"intensity\":45,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-orange-500 to-red-500\",\"startDate\":\"10-16\",\"endDate\":\"12-14\"},{\"id\":\"sheet\",\"seasonLabel\":\"SHEET\",\"name\":\"Sheet (Winter)\",\"nameBn\":\"\\u09b6\\u09c0\\u09a4\",\"emoji\":\"\\u2744\\ufe0f\",\"effectType\":\"Snow\",\"effectEmoji\":\"\\u2744\",\"effectColor\":\"text-sky-400\",\"intensity\":16,\"scheduled\":true,\"active\":true,\"visibleOnSite\":true,\"gradient\":\"from-sky-400 to-blue-500\",\"startDate\":\"12-15\",\"endDate\":\"02-13\"},{\"id\":\"bosonto\",\"seasonLabel\":\"BOSONTO\",\"name\":\"Bosonto (Spring)\",\"nameBn\":\"\\u09ac\\u09b8\\u09a8\\u09cd\\u09a4\",\"emoji\":\"\\ud83c\\udf37\",\"effectType\":\"Petals\",\"effectEmoji\":\"\\ud83c\\udf38\",\"effectColor\":\"text-pink-400\",\"intensity\":9,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-pink-400 to-rose-400\",\"startDate\":\"02-14\",\"endDate\":\"04-13\"},{\"id\":\"rojar_eid\",\"seasonLabel\":\"ROJAR_EID\",\"name\":\"Eid ul-Fitr\",\"nameBn\":\"\\u09b0\\u09cb\\u099c\\u09be\\u09b0 \\u0987\\u09a6\",\"emoji\":\"\\ud83d\\udd4c\",\"effectType\":\"Fireworks\",\"effectEmoji\":\"\\ud83c\\udf86\",\"effectColor\":\"text-emerald-500\",\"intensity\":80,\"scheduled\":false,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-emerald-500 to-teal-500\",\"startDate\":\"03-31\",\"endDate\":\"04-03\"},{\"id\":\"qurbani_eid\",\"seasonLabel\":\"QURBANI_EID\",\"name\":\"Eid ul-Adha (Qurbani)\",\"nameBn\":\"\\u0995\\u09cb\\u09b0\\u09ac\\u09be\\u09a8\\u09bf\\u09b0 \\u0987\\u09a6\",\"emoji\":\"\\ud83d\\udd4b\",\"effectType\":\"MoonStars\",\"effectEmoji\":\"\\ud83c\\udf19\",\"effectColor\":\"text-emerald-500\",\"intensity\":75,\"scheduled\":false,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-green-600 to-emerald-500\",\"startDate\":\"06-05\",\"endDate\":\"06-09\"},{\"id\":\"durga_puja\",\"seasonLabel\":\"DURGA_PUJA\",\"name\":\"Durga Puja\",\"nameBn\":\"\\u09a6\\u09c1\\u09b0\\u09cd\\u0997\\u09be\\u09aa\\u09c2\\u099c\\u09be\",\"emoji\":\"\\ud83e\\ude94\",\"effectType\":\"Lanterns\",\"effectEmoji\":\"\\ud83c\\udfee\",\"effectColor\":\"text-amber-500\",\"intensity\":85,\"scheduled\":false,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-amber-500 to-orange-500\",\"startDate\":\"10-08\",\"endDate\":\"10-13\"},{\"id\":\"christmas\",\"seasonLabel\":\"CHRISTMAS\",\"name\":\"Christmas\",\"nameBn\":\"\\u0995\\u09cd\\u09b0\\u09bf\\u09b8\\u09ae\\u09be\\u09b8\",\"emoji\":\"\\ud83c\\udf84\",\"effectType\":\"Snow\",\"effectEmoji\":\"\\u2744\",\"effectColor\":\"text-red-400\",\"intensity\":70,\"scheduled\":true,\"active\":false,\"visibleOnSite\":false,\"gradient\":\"from-red-500 to-green-600\",\"startDate\":\"12-24\",\"endDate\":\"12-26\"},{\"id\":\"pohela_boishakh\",\"seasonLabel\":\"POHELA_BOISHAKH\",\"name\":\"Pohela Boishakh\",\"nameBn\":\"\\u09aa\\u09b9\\u09c7\\u09b2\\u09be \\u09ac\\u09c8\\u09b6\\u09be\\u0996\",\"emoji\":\"\\ud83c\\udf8a\",\"effectType\":\"Confetti\",\"effectEmoji\":\"\\ud83c\\udf8a\",\"effectColor\":\"text-red-500\",\"intensity\":90,\"scheduled\":true,\"active\":false,\"visibleOnSite\":true,\"gradient\":\"from-red-600 to-orange-500\",\"startDate\":\"04-14\",\"endDate\":\"04-15\"},{\"id\":\"eid_milad\",\"seasonLabel\":\"EID_MILAD\",\"name\":\"Eid Milad-un-Nabi\",\"nameBn\":\"\\u0988\\u09a6\\u09c7 \\u09ae\\u09bf\\u09b2\\u09be\\u09a6\\u09c1\\u09a8\\u09cd\\u09a8\\u09ac\\u09c0\",\"emoji\":\"\\ud83c\\udf19\",\"effectType\":\"Stars\",\"effectEmoji\":\"\\u2b50\",\"effectColor\":\"text-yellow-400\",\"intensity\":60,\"scheduled\":false,\"active\":false,\"visibleOnSite\":false,\"gradient\":\"from-yellow-500 to-amber-600\",\"startDate\":\"09-15\",\"endDate\":\"09-17\"}]', 'appearance', '2026-08-06 12:53:38', '2026-08-14 18:19:49');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('3', 'site_logo', '/storage/logos/3r2Wo2OVv90d1NvjGkkiCmCQH6R3P30PXE1AnX2m.png', 'general', '2026-08-06 15:38:38', '2026-08-09 19:25:25');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('4', 'site_title', 'Guruz BD', 'general', '2026-08-06 15:38:38', '2026-08-06 15:38:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('5', 'support_phone', '01700000000', 'general', '2026-08-06 15:38:38', '2026-08-06 15:38:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('6', 'support_email', 'support@guruzbd.com', 'general', '2026-08-06 15:38:38', '2026-08-06 15:38:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('7', 'fb_pixel_id', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('8', 'fb_capi_token', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('9', 'gtm_id', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('10', 'ga4_id', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-08 20:48:45');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('11', 'tiktok_pixel_id', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('12', 'recaptcha_site_key', 'shishirbarai01982708789@gmail.com', 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('13', 'recaptcha_secret_key', '12345678', 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('14', 'slack_webhook_url', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('15', 'zapier_webhook_url', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:42:51');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('16', 'gemini_api_key', NULL, 'integrations', '2026-08-07 14:42:51', '2026-08-07 14:47:07');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('17', 'guruz_special_enabled', '1', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('18', 'guruz_special_title_en', 'Guruz Eid Special', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('19', 'guruz_special_title_bn', 'গুরুজ ঈদ স্পেশাল', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('20', 'guruz_special_sub_en', 'Hand-picked deals for the season', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('21', 'guruz_special_sub_bn', 'উৎসবের সেরা অফার', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('22', 'guruz_special_emoji', '✨', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('23', 'guruz_special_grad_from', '#7c3aed', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('24', 'guruz_special_grad_to', '#db2777', 'general', '2026-08-08 20:13:58', '2026-08-08 20:13:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('25', 'guruz_special_products', '[1,5]', 'general', '2026-08-08 20:13:58', '2026-08-08 20:21:59');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('26', 'admin_roles_data', '[{\"id\":1,\"name\":\"Super Admin\",\"description\":\"Full access to all system modules\",\"permissions\":[\"dashboard\",\"users\",\"staff\",\"roles\",\"finance\",\"commerce\",\"settings\",\"cms\"]},{\"id\":2,\"name\":\"Store Manager\",\"description\":\"Manages products, orders, and vendors\",\"permissions\":[\"dashboard\",\"commerce\",\"cms\",\"staff\",\"finance\",\"roles\",\"users\",\"settings\"]},{\"id\":3,\"name\":\"Support Executive\",\"description\":\"Handles customer queries and order tracking\",\"permissions\":[\"dashboard\"]}]', 'general', '2026-08-08 20:20:51', '2026-08-14 17:55:56');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('27', 'app_name', 'Guruz E-Commerce', 'system', '2026-08-08 20:39:03', '2026-08-08 20:39:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('28', 'app_env', 'production', 'system', '2026-08-08 20:39:03', '2026-08-08 20:39:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('29', 'app_debug', 'false', 'system', '2026-08-08 20:39:03', '2026-08-08 20:44:23');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('30', 'app_url', 'http://localhost:8000', 'system', '2026-08-08 20:39:03', '2026-08-08 20:39:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('31', 'db_connection', 'mysql', 'system', '2026-08-08 20:39:03', '2026-08-08 20:39:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('32', 'maintenance_mode', 'false', 'system', '2026-08-08 20:39:03', '2026-08-08 20:44:23');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('33', 'timezone', 'Asia/Dhaka', 'system', '2026-08-08 20:43:22', '2026-08-08 20:43:22');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('34', 'force_https', 'false', 'system', '2026-08-08 20:43:22', '2026-08-08 20:44:23');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('35', 'bypass_token', 'secret-access-123', 'system', '2026-08-08 20:43:22', '2026-08-08 20:43:22');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('36', 'maintenance_message', 'We are currently undergoing scheduled maintenance. Please check back soon.', 'system', '2026-08-08 20:43:22', '2026-08-08 20:43:22');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('37', 'enable_automation', 'true', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('38', 'send_email', 'true', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('39', 'send_sms', 'false', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:33');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('40', 'send_push', 'true', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('41', 'send_time', '09:00', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('42', 'include_coupon', 'true', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('43', 'coupon_type', 'percentage', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('44', 'coupon_value', '15', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('45', 'coupon_validity_days', '7', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('46', 'email_subject', '🎉 Happy Birthday from Guruz!', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('47', 'email_body', 'Dear {customer_name},\n\nWishing you a fantastic birthday filled with joy and happiness! As a special gift, here is a {discount_value} discount code valid for your next purchase.\n\nUse Code: {coupon_code}\n\nBest wishes,\nThe Guruz Team', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('48', 'sms_body', 'Happy Birthday {customer_name}! 🎂 Enjoy {discount_value} off at Guruz today with code {coupon_code}.', 'birthday_wishes', '2026-08-08 20:59:26', '2026-08-08 20:59:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('49', 'max_image_upload_size', '5', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('50', 'max_video_upload_size', '20', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('51', 'max_gallery_images', '10', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('52', 'max_products_per_vendor', '500', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('53', 'max_flash_sales_per_vendor', '5', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('54', 'allow_vendor_categories', 'true', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('55', 'category_depth_level', '3', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('56', 'max_variants_per_product', '50', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('57', 'auto_archive_out_of_stock', 'true', 'feature_limits', '2026-08-08 21:06:39', '2026-08-08 21:06:39');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('58', 'max_login_attempts', '10', 'security', '2026-08-08 21:21:37', '2026-08-08 21:21:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('59', 'session_timeout', '120', 'security', '2026-08-08 21:21:37', '2026-08-08 21:21:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('60', 'admin_url_prefix', 'admin', 'security', '2026-08-08 21:21:37', '2026-08-08 21:21:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('61', 'require_strong_password', '1', 'security', '2026-08-08 21:21:37', '2026-08-08 21:21:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('62', 'force_ssl', '1', 'security', '2026-08-08 21:21:37', '2026-08-08 21:21:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('63', 'footer_facebook', 'https://www.facebook.com/shishir9barai', 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('64', 'footer_instagram', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('65', 'footer_youtube', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('66', 'footer_linkedin', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('67', 'footer_tiktok', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('68', 'footer_pinterest', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('69', 'footer_whatsapp', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('70', 'footer_app_store', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('71', 'footer_play_store', NULL, 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('72', 'footer_copyright', '© 2026 GURUZ All rights reserved. Secure payments • Genuine products', 'general', '2026-08-08 21:56:58', '2026-08-08 21:56:58');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('73', 'notice_marquee', '{\"is_active\":true,\"scroll_duration_seconds\":37,\"notices_en\":\"Welcome to Guruz\\nFree Delivery on orders over \\u09f31000\",\"notices_bn\":\"\\u0997\\u09c1\\u09b0\\u09c1\\u099c-\\u098f \\u09b8\\u09cd\\u09ac\\u09be\\u0997\\u09a4\\u09ae\\n\\u09e7\\u09e6\\u09e6\\u09e6 \\u099f\\u09be\\u0995\\u09be\\u09b0 \\u0989\\u09aa\\u09b0\\u09c7 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0\\u09c7 \\u09ab\\u09cd\\u09b0\\u09bf \\u09a1\\u09c7\\u09b2\\u09bf\\u09ad\\u09be\\u09b0\\u09bf\"}', 'appearance', '2026-08-08 22:29:44', '2026-08-09 19:23:00');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('74', 'widget_enabled', '1', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('75', 'widget_color', '#4f46e5', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('76', 'widget_position', 'bottom-right', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('77', 'widget_greeting', 'Hi there! How can we help you today?', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('78', 'widget_whatsapp', '+8801700000000', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('79', 'widget_messenger', 'guruzbd', 'floating_widget', '2026-08-08 22:47:46', '2026-08-08 22:47:46');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('80', 'twilio_active', '1', 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('81', 'twilio_sid', NULL, 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('82', 'twilio_token', 'password', 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('83', 'twilio_from', NULL, 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('84', 'bulksmsbd_active', '0', 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('85', 'bulksmsbd_api_key', NULL, 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('86', 'bulksmsbd_sender_id', 'shishirbarai2050@gmail.com', 'sms', '2026-08-09 18:01:38', '2026-08-09 18:01:38');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('87', 'mail_mailer', 'log', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('88', 'mail_host', '127.0.0.1', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('89', 'mail_port', '2525', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('90', 'mail_username', 'shishirbarai2050@gmail.com', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('91', 'mail_password', 'password', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('92', 'mail_encryption', 'tls', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('93', 'mail_from_address', 'hello@example.com', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('94', 'mail_from_name', 'Guruz E-Commerce', 'smtp', '2026-08-09 18:30:31', '2026-08-09 18:30:31');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('95', 'loyalty_enabled', '0', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('96', 'silver_threshold', '1000', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('97', 'gold_threshold', '5000', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('98', 'default_free_shipping', '500', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('99', 'silver_free_shipping', '300', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('100', 'gold_free_shipping', '0', 'loyalty', '2026-08-09 18:36:44', '2026-08-09 18:36:44');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('101', 'shipping_inside_dhaka', '100', 'shipping', '2026-08-09 18:37:01', '2026-08-09 19:19:26');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('102', 'shipping_outside_dhaka', '120', 'shipping', '2026-08-09 18:37:01', '2026-08-09 18:37:01');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('103', 'free_delivery_above', '0', 'shipping', '2026-08-09 18:37:01', '2026-08-09 18:37:01');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('104', 'feature_badges', '[{\"id\":\"safe_payments\",\"label_en\":\"Safe Payments\",\"label_bn\":\"\\u09a8\\u09bf\\u09b0\\u09be\\u09aa\\u09a6 \\u09aa\\u09c7\\u09ae\\u09c7\\u09a8\\u09cd\\u099f\",\"icon\":\"ShieldCheck\",\"gradient_from\":\"from-blue-600\",\"gradient_to\":\"to-cyan-500\",\"is_active\":true},{\"id\":\"nationwide_delivery\",\"label_en\":\"Nationwide Delivery\",\"label_bn\":\"\\u09b8\\u09be\\u09b0\\u09be\\u09a6\\u09c7\\u09b6\\u09c7 \\u09a1\\u09c7\\u09b2\\u09bf\\u09ad\\u09be\\u09b0\\u09bf\",\"icon\":\"Truck\",\"gradient_from\":\"from-orange-500\",\"gradient_to\":\"to-red-500\",\"is_active\":true},{\"id\":\"guruz_verified\",\"label_en\":\"Guruz Verified\",\"label_bn\":\"\\u0997\\u09c1\\u09b0\\u099c \\u09ad\\u09c7\\u09b0\\u09bf\\u09ab\\u09be\\u0987\\u09a1\",\"icon\":\"BadgeCheck\",\"gradient_from\":\"from-purple-600\",\"gradient_to\":\"to-pink-500\",\"is_active\":true},{\"id\":\"easy_return\",\"label_en\":\"Easy Return Policy\",\"label_bn\":\"\\u09b8\\u09b9\\u099c \\u09b0\\u09bf\\u099f\\u09be\\u09b0\\u09cd\\u09a8\",\"icon\":\"RotateCcw\",\"gradient_from\":\"from-emerald-500\",\"gradient_to\":\"to-green-500\",\"is_active\":true},{\"id\":\"best_price\",\"label_en\":\"Best Price Guaranteed\",\"label_bn\":\"\\u09b8\\u09c7\\u09b0\\u09be \\u09a6\\u09be\\u09ae\\u09c7\\u09b0 \\u0997\\u09cd\\u09af\\u09be\\u09b0\\u09be\\u09a8\\u09cd\\u099f\\u09bf\",\"icon\":\"Tag\",\"gradient_from\":\"from-amber-500\",\"gradient_to\":\"to-orange-500\",\"is_active\":true},{\"id\":\"authentic_products\",\"label_en\":\"100% Authentic Products\",\"label_bn\":\"\\u09e7\\u09e6\\u09e6% \\u0985\\u09b0\\u09bf\\u099c\\u09bf\\u09a8\\u09be\\u09b2 \\u09aa\\u09cd\\u09b0\\u09cb\\u09a1\\u09be\\u0995\\u09cd\\u099f\",\"icon\":\"Sparkles\",\"gradient_from\":\"from-cyan-500\",\"gradient_to\":\"to-blue-500\",\"is_active\":true}]', 'appearance', '2026-08-09 19:24:18', '2026-08-09 19:24:37');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('105', 'marquee_speed', '20', 'general', '2026-08-09 19:25:25', '2026-08-09 19:25:25');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('106', 'default_commission_rate', '20', 'commission', '2026-08-09 19:28:45', '2026-08-09 19:28:45');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('107', 'auto_approve_vendors', '0', 'commission', '2026-08-09 19:28:45', '2026-08-09 19:28:45');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('108', 'shop_comments_init_9', '1', 'general', '2026-08-13 21:34:07', '2026-08-13 21:34:07');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('109', 'live_visitor_widget', '{\"is_active\":true,\"interval_seconds\":5,\"display_duration_seconds\":5,\"messages_raw\":\"\\u0995\\u09b0\\u09bf\\u09ae (\\u09a2\\u09be\\u0995\\u09be) \\u2014 \\u09e7 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09b8\\u09cd\\u09aa\\u09be\\u09b0\\u09cd\\u0995 \\u09b9\\u09be\\u0987 \\u09ad\\u09cb\\u09b2\\u09cd\\u099f\\u09c7\\u099c \\u0995\\u09cd\\u09af\\u09be\\u09ac\\u09b2 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u0986\\u09b0\\u09bf\\u09ab (\\u099a\\u099f\\u09cd\\u099f\\u0997\\u09cd\\u09b0\\u09be\\u09ae) \\u2014 \\u09e8 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u0997\\u09c1\\u09b0\\u09c1\\u099c \\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09df\\u09be\\u09ae \\u098f\\u0995\\u09cd\\u09b8\\u099f\\u09c7\\u09a8\\u09b6\\u09a8 \\u09b8\\u0995\\u09c7\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u09b6\\u09ab\\u09bf\\u0995 (\\u09b8\\u09bf\\u09b2\\u09c7\\u099f) \\u2014 \\u09e9 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09b8\\u09be\\u09b0\\u09cd\\u09ad\\u09bf\\u09b8 \\u0995\\u09cd\\u09b2\\u09c7\\u0987\\u09ae \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u09a4\\u09be\\u09a8\\u099c\\u09bf\\u09a8\\u09be (\\u09b0\\u09be\\u099c\\u09b6\\u09be\\u09b9\\u09c0) \\u2014 \\u09eb \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09e7.\\u09eb \\u0986\\u09b0\\u098f\\u09ae \\u09aa\\u09cd\\u09b0\\u09cb\\u09a1\\u09be\\u0995\\u09cd\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u09b8\\u09c1\\u09ae\\u09a8 (\\u0996\\u09c1\\u09b2\\u09a8\\u09be) \\u2014 \\u09ed \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09e8.\\u09eb \\u0986\\u09b0\\u098f\\u09ae \\u09a4\\u09be\\u09b0 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u0995\\u09be\\u09ae\\u09b0\\u09c1\\u09b2 (\\u0995\\u09c1\\u09ae\\u09bf\\u09b2\\u09cd\\u09b2\\u09be) \\u2014 \\u09e7\\u09e6 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u0995\\u09cd\\u09af\\u09be\\u09ac\\u09b2 \\u09b8\\u0995\\u09c7\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u0986\\u09ab\\u09b0\\u09cb\\u099c\\u09be (\\u09ac\\u09b0\\u09bf\\u09b6\\u09be\\u09b2) \\u2014 \\u09e7\\u09eb \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09aa\\u09be\\u0993\\u09df\\u09be\\u09b0 \\u09aa\\u09cd\\u09b0\\u09cb\\u09a1\\u09be\\u0995\\u09cd\\u099f\\u09b8 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\\n\\u098f\\u0987 \\u09ae\\u09c1\\u09b9\\u09c2\\u09b0\\u09cd\\u09a4\\u09c7 Guruz e-commerce-\\u098f 41,258 \\u099c\\u09a8 \\u09ae\\u09be\\u09a8\\u09c1\\u09b7 \\u09aa\\u09a3\\u09cd\\u09af \\u09a6\\u09c7\\u0996\\u099b\\u09c7\\u09a8\\u0964\",\"messages_bn\":[\"\\u0995\\u09b0\\u09bf\\u09ae (\\u09a2\\u09be\\u0995\\u09be) \\u2014 \\u09e7 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09b8\\u09cd\\u09aa\\u09be\\u09b0\\u09cd\\u0995 \\u09b9\\u09be\\u0987 \\u09ad\\u09cb\\u09b2\\u09cd\\u099f\\u09c7\\u099c \\u0995\\u09cd\\u09af\\u09be\\u09ac\\u09b2 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u0986\\u09b0\\u09bf\\u09ab (\\u099a\\u099f\\u09cd\\u099f\\u0997\\u09cd\\u09b0\\u09be\\u09ae) \\u2014 \\u09e8 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u0997\\u09c1\\u09b0\\u09c1\\u099c \\u09aa\\u09cd\\u09b0\\u09bf\\u09ae\\u09bf\\u09df\\u09be\\u09ae \\u098f\\u0995\\u09cd\\u09b8\\u099f\\u09c7\\u09a8\\u09b6\\u09a8 \\u09b8\\u0995\\u09c7\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u09b6\\u09ab\\u09bf\\u0995 (\\u09b8\\u09bf\\u09b2\\u09c7\\u099f) \\u2014 \\u09e9 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09b8\\u09be\\u09b0\\u09cd\\u09ad\\u09bf\\u09b8 \\u0995\\u09cd\\u09b2\\u09c7\\u0987\\u09ae \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u09a4\\u09be\\u09a8\\u099c\\u09bf\\u09a8\\u09be (\\u09b0\\u09be\\u099c\\u09b6\\u09be\\u09b9\\u09c0) \\u2014 \\u09eb \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09e7.\\u09eb \\u0986\\u09b0\\u098f\\u09ae \\u09aa\\u09cd\\u09b0\\u09cb\\u09a1\\u09be\\u0995\\u09cd\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u09b8\\u09c1\\u09ae\\u09a8 (\\u0996\\u09c1\\u09b2\\u09a8\\u09be) \\u2014 \\u09ed \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09e8.\\u09eb \\u0986\\u09b0\\u098f\\u09ae \\u09a4\\u09be\\u09b0 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u0995\\u09be\\u09ae\\u09b0\\u09c1\\u09b2 (\\u0995\\u09c1\\u09ae\\u09bf\\u09b2\\u09cd\\u09b2\\u09be) \\u2014 \\u09e7\\u09e6 \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u0995\\u09cd\\u09af\\u09be\\u09ac\\u09b2 \\u09b8\\u0995\\u09c7\\u099f \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u0986\\u09ab\\u09b0\\u09cb\\u099c\\u09be (\\u09ac\\u09b0\\u09bf\\u09b6\\u09be\\u09b2) \\u2014 \\u09e7\\u09eb \\u09ae\\u09bf\\u09a8\\u09bf\\u099f \\u0986\\u0997\\u09c7 \\u09aa\\u09be\\u0993\\u09df\\u09be\\u09b0 \\u09aa\\u09cd\\u09b0\\u09cb\\u09a1\\u09be\\u0995\\u09cd\\u099f\\u09b8 \\u0985\\u09b0\\u09cd\\u09a1\\u09be\\u09b0 \\u0995\\u09b0\\u09c7\\u099b\\u09c7\\u09a8\",\"\\u098f\\u0987 \\u09ae\\u09c1\\u09b9\\u09c2\\u09b0\\u09cd\\u09a4\\u09c7 Guruz e-commerce-\\u098f 41,258 \\u099c\\u09a8 \\u09ae\\u09be\\u09a8\\u09c1\\u09b7 \\u09aa\\u09a3\\u09cd\\u09af \\u09a6\\u09c7\\u0996\\u099b\\u09c7\\u09a8\\u0964\"]}', 'appearance', '2026-08-14 15:03:35', '2026-08-14 15:03:41');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('110', 'site_favicon', '/storage/favicons/qfo7b0fPqqpPH2d7jwskKeJVdo0e0ht6JtOB315S.png', 'general', '2026-08-14 18:21:03', '2026-08-14 18:21:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('111', 'marquee_speed_shops', '20', 'general', '2026-08-14 18:21:03', '2026-08-14 18:21:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('112', 'marquee_speed_categories', '20', 'general', '2026-08-14 18:21:03', '2026-08-14 18:21:03');
INSERT INTO `site_settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES ('113', 'marquee_speed_brands', '20', 'general', '2026-08-14 18:21:03', '2026-08-14 18:21:03');

-- --------------------------------------------------------
-- Table structure for `hero_sliders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `hero_sliders`;
CREATE TABLE `hero_sliders` (
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

-- Dumping data for table `hero_sliders`
INSERT INTO `hero_sliders` (`id`, `title`, `subtitle`, `button_text`, `button_link`, `image`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES ('1', NULL, NULL, NULL, NULL, '/storage/hero-sliders/zYN0D1GbQs4bxHfCSByGsL8jJi6j7ouzymvsT8tI.jpg', '0', '1', '2026-08-06 15:15:15', '2026-08-08 22:32:36');
INSERT INTO `hero_sliders` (`id`, `title`, `subtitle`, `button_text`, `button_link`, `image`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES ('2', NULL, NULL, NULL, NULL, '/storage/hero-sliders/CT7q3i8KuqbXVAavBdjrTx8T7T1amiJVI6fqjfAI.jpg', '1', '1', '2026-08-07 11:57:01', '2026-08-07 11:57:01');

-- --------------------------------------------------------
-- Table structure for `top_banners`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `top_banners`;
CREATE TABLE `top_banners` (
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

-- Dumping data for table `top_banners`
INSERT INTO `top_banners` (`id`, `title`, `link`, `image`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES ('1', NULL, NULL, '/storage/top-banners/CydogSAqzAHRAcRZn44Nh6CdLbi2BIbUT6WlgsVR.png', '1', '1', '2026-08-06 21:25:17', '2026-08-06 21:25:17');

-- --------------------------------------------------------
-- Table structure for `footer_widgets`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `footer_widgets`;
CREATE TABLE `footer_widgets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `footer_widgets`
INSERT INTO `footer_widgets` (`id`, `title`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('4', 'COMPANY', '1', '1', '2026-08-06 11:12:54', '2026-08-08 21:36:44');
INSERT INTO `footer_widgets` (`id`, `title`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('5', 'COMPANY', '2', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_widgets` (`id`, `title`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('6', 'HELP & SUPPORT', '3', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_widgets` (`id`, `title`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('7', 'CONSUMER POLICY', '4', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');

-- --------------------------------------------------------
-- Table structure for `footer_links`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `footer_links`;
CREATE TABLE `footer_links` (
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

-- Dumping data for table `footer_links`
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('10', '4', 'About Us', '/page/about-us', '1', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('11', '4', 'Why GURUZ', '/page/why-guruz', '2', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('12', '4', 'GURUZ Career', '/page/guruz-career', '3', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('13', '4', 'Contact Us', '/page/contact-us', '4', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('14', '5', 'Hotline', '/page/hotline', '1', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('15', '5', 'Career', '/page/career', '2', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('16', '5', 'Write Us', '/page/write-us', '3', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('17', '6', 'Products Consultancy', '/page/products-consultancy', '1', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('18', '6', 'Help Center', '/page/help-center', '2', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('19', '6', 'Order Tracking', '/page/order-tracking', '3', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('20', '6', 'FAQ', '/page/faq', '4', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('21', '6', 'Warranty Claim Service', '/page/warranty-claim-service', '5', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('22', '7', 'Company Policy', '/page/company-policy', '1', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('23', '7', 'Terms of Service', '/page/terms-of-service', '2', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('24', '7', 'Privacy Policy', '/page/privacy-policy', '3', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('25', '7', 'Shipping Policy', '/page/shipping-policy', '4', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('26', '7', 'Returns & Refunds', '/page/returns-and-refunds', '5', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('27', '7', 'Payment Policy', '/page/payment-policy', '6', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('28', '7', 'Security', '/page/security', '7', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');
INSERT INTO `footer_links` (`id`, `footer_widget_id`, `label`, `url`, `position`, `is_active`, `created_at`, `updated_at`) VALUES ('29', '7', 'Others Policy', '/page/others-policy', '8', '1', '2026-08-06 11:12:54', '2026-08-06 11:12:54');

-- --------------------------------------------------------
-- Table structure for `subscribers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscribers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `pages`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
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

-- Dumping data for table `pages`
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('1', 'About Us', 'about-us', NULL, NULL, '<p>Welcome to Guruz BD ytduewtduytweudtwejhjtt8ufghdchjhgjdstfsdjachfgdsch vasugsaj</p>', NULL, NULL, '1', 'publish', NULL, '2026-08-05 16:30:04', '2026-08-08 21:48:06', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('2', 'Privacy Policy', 'privacy-policy', NULL, NULL, '<p>Privacy matters</p>', NULL, NULL, '1', 'publish', NULL, '2026-08-05 16:30:04', '2026-08-06 16:32:01', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('3', 'Terms & Conditions', 'terms-and-conditions', NULL, NULL, '<p>Terms of service</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-05 16:30:04', '2026-08-08 21:47:51', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('4', 'Why GURUZ', 'why-guruz', NULL, NULL, '<p>Content for Why GURUZ</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('5', 'GURUZ Career', 'guruz-career', NULL, NULL, '<p>Content for GURUZ Career</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('6', 'Contact Us', 'contact-us', NULL, NULL, '<p>Content for Contact Us</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('7', 'Hotline', 'hotline', NULL, NULL, '<p>Content for Hotline</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('8', 'Career', 'career', NULL, NULL, '<p>Content for Career</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('9', 'Write Us', 'write-us', NULL, NULL, '<p>Content for Write Us</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('10', 'Products Consultancy', 'products-consultancy', NULL, NULL, '<p>Content for Products Consultancy</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('11', 'Help Center', 'help-center', NULL, NULL, '<p>Content for Help Center</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('12', 'Order Tracking', 'order-tracking', NULL, NULL, '<p>Content for Order Tracking</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('13', 'FAQ', 'faq', NULL, NULL, '<p>Content for FAQ</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('14', 'Warranty Claim Service', 'warranty-claim-service', NULL, NULL, '<p>Content for Warranty Claim Service</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('15', 'Company Policy', 'company-policy', NULL, NULL, '<p>Content for Company Policy</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('16', 'Terms of Service', 'terms-of-service', NULL, NULL, '<p>Content for Terms of Service</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('17', 'Shipping Policy', 'shipping-policy', NULL, NULL, '<p>Content for Shipping Policy</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('18', 'Returns & Refunds', 'returns-and-refunds', NULL, NULL, '<p>Content for Returns & Refunds</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('19', 'Payment Policy', 'payment-policy', NULL, NULL, '<p>Content for Payment Policy</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);
INSERT INTO `pages` (`id`, `title`, `slug`, `category`, `short_description`, `content`, `seo_title`, `meta_description`, `is_published`, `status`, `featured_image`, `created_at`, `updated_at`, `title_bn`, `subtitle_en`, `subtitle_bn`, `content_bn`) VALUES ('20', 'Security', 'security', NULL, NULL, '<p>Content for Security</p>', NULL, NULL, '0', 'publish', NULL, '2026-08-06 16:27:48', '2026-08-06 16:27:48', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
-- Table structure for `staff_permissions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `staff_permissions`;
CREATE TABLE `staff_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `permission` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_permissions_user_id_permission_unique` (`user_id`,`permission`),
  CONSTRAINT `staff_permissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `system_notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `system_notifications`;
CREATE TABLE `system_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `visitor_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `visitor_logs`;
CREATE TABLE `visitor_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `platform` varchar(255) DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `referer` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `visitor_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `visitor_logs`
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/login', '1', '2026-08-05 16:50:08', '2026-08-05 16:50:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('2', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/system/backups', '1', '2026-08-05 17:14:23', '2026-08-05 17:14:23');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('3', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/customers', '1', '2026-08-05 17:30:17', '2026-08-05 17:30:17');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('4', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '1', '2026-08-05 17:45:44', '2026-08-05 17:45:44');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/products/anker-soundcore-r50i', '1', '2026-08-05 18:11:14', '2026-08-05 18:11:14');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/import', '1', '2026-08-05 18:43:38', '2026-08-05 18:43:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('7', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', NULL, '1', '2026-08-05 21:17:31', '2026-08-05 21:17:31');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('8', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', NULL, '1', '2026-08-05 22:22:25', '2026-08-05 22:22:25');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('9', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/admin/files/all', '1', '2026-08-05 23:34:07', '2026-08-05 23:34:07');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '1', '2026-08-06 07:55:53', '2026-08-06 07:55:53');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '1', '2026-08-06 09:51:47', '2026-08-06 09:51:47');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products/anker-soundcore-r50i', 'http://127.0.0.1:8000/', '1', '2026-08-06 10:08:11', '2026-08-06 10:08:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/products/anker-soundcore-r50i', '1', '2026-08-06 10:46:54', '2026-08-06 10:46:54');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/track', 'http://127.0.0.1:8000/', '1', '2026-08-06 11:03:37', '2026-08-06 11:03:37');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('15', '127.0.0.1', 'Symfony', '0', '0', 'desktop', NULL, NULL, 'http://localhost', NULL, NULL, '2026-08-06 11:20:29', '2026-08-06 11:20:29');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('16', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '1', '2026-08-06 11:36:11', '2026-08-06 11:36:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '1', '2026-08-06 11:54:22', '2026-08-06 11:54:22');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', NULL, '1', '2026-08-06 12:10:01', '2026-08-06 12:10:01');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', NULL, '1', '2026-08-06 12:34:08', '2026-08-06 12:34:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '1', '2026-08-06 12:51:57', '2026-08-06 12:51:57');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '1', '2026-08-06 13:14:51', '2026-08-06 13:14:51');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/appearance/hero-slider', '1', '2026-08-06 15:15:18', '2026-08-06 15:15:18');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/vendor', '1', '2026-08-06 15:30:44', '2026-08-06 15:30:44');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/page/about-us', 'http://127.0.0.1:8000/', NULL, '2026-08-06 16:02:08', '2026-08-06 16:02:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '4', '2026-08-06 16:22:38', '2026-08-06 16:22:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-06 16:42:02', '2026-08-06 16:42:02');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/admin/settings', '4', '2026-08-06 17:01:21', '2026-08-06 17:01:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-06 17:29:12', '2026-08-06 17:29:12');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('29', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products', 'http://127.0.0.1:8000/', '4', '2026-08-06 17:50:28', '2026-08-06 17:50:28');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('30', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products/anker-soundcore-r50i', 'http://127.0.0.1:8000/products/anker-soundcore-r50i', '4', '2026-08-06 18:43:13', '2026-08-06 18:43:13');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/page/order-tracking', 'http://127.0.0.1:8000/page/order-tracking', '4', '2026-08-06 19:01:45', '2026-08-06 19:01:45');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/page/order-tracking', 'http://127.0.0.1:8000/page/order-tracking', '4', '2026-08-06 20:03:42', '2026-08-06 20:03:42');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/page/order-tracking', '4', '2026-08-06 20:48:47', '2026-08-06 20:48:47');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/page/order-tracking', '4', '2026-08-06 21:25:25', '2026-08-06 21:25:25');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/admin/marketing/birthday-wish', '4', '2026-08-06 23:07:28', '2026-08-06 23:07:28');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('36', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'Safari', 'iOS', 'mobile', NULL, NULL, 'http://127.0.0.1:8000/products/anker-soundcore-r60i-nc', 'http://127.0.0.1:8000/', '4', '2026-08-06 23:23:32', '2026-08-06 23:23:32');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('37', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '4', '2026-08-06 23:52:35', '2026-08-06 23:52:35');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-07 09:43:52', '2026-08-07 09:43:52');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', NULL, '4', '2026-08-07 10:59:39', '2026-08-07 10:59:39');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', NULL, '4', '2026-08-07 11:23:38', '2026-08-07 11:23:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/profile/me', '4', '2026-08-07 11:44:59', '2026-08-07 11:44:59');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/shops/guruz-official', 'http://127.0.0.1:8000/', '4', '2026-08-07 12:31:47', '2026-08-07 12:31:47');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('43', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/admin/customers', '3', '2026-08-07 12:47:07', '2026-08-07 12:47:07');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('44', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/logout', 'http://127.0.0.1:8000/admin/super-admins', '3', '2026-08-07 13:02:30', '2026-08-07 13:02:30');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/admin/integrations', NULL, '2026-08-07 14:23:33', '2026-08-07 14:23:33');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', NULL, NULL, '2026-08-07 14:41:23', '2026-08-07 14:41:23');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/shops/guruz-official', 'http://127.0.0.1:8000/', NULL, '2026-08-07 14:57:51', '2026-08-07 14:57:51');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/admin/customers', '3', '2026-08-07 15:23:00', '2026-08-07 15:23:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('49', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-07 17:58:27', '2026-08-07 17:58:27');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('50', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/order-confirmation/GRZ-RES6HQXN', 'http://127.0.0.1:8000/admin', '4', '2026-08-07 18:45:20', '2026-08-07 18:45:20');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-07 19:43:24', '2026-08-07 19:43:24');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/order-confirmation/GRZ-RES6HQXN', 'http://127.0.0.1:8000/admin', '4', '2026-08-07 20:15:45', '2026-08-07 20:15:45');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-07 22:48:21', '2026-08-07 22:48:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('54', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'Safari', 'iOS', 'mobile', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin', NULL, '2026-08-07 23:38:00', '2026-08-07 23:38:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products/ugreen-cr113-4-in-1-usb-hub', 'http://127.0.0.1:8000/admin', NULL, '2026-08-07 23:56:41', '2026-08-07 23:56:41');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-08 19:48:27', '2026-08-08 19:48:27');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '4', '2026-08-08 20:14:03', '2026-08-08 20:14:03');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('58', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 20:30:35', '2026-08-08 20:30:35');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 20:48:21', '2026-08-08 20:48:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('60', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 21:03:31', '2026-08-08 21:03:31');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('61', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 21:20:58', '2026-08-08 21:20:58');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('62', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 21:36:01', '2026-08-08 21:36:01');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('63', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 21:54:56', '2026-08-08 21:54:56');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('64', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-08 22:44:12', '2026-08-08 22:44:12');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('65', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-09 13:20:51', '2026-08-09 13:20:51');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('66', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-09 18:00:46', '2026-08-09 18:00:46');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('67', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-09 18:44:20', '2026-08-09 18:44:20');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('68', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-09 19:14:54', '2026-08-09 19:14:54');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('69', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/vendor', '4', '2026-08-09 19:31:40', '2026-08-09 19:31:40');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('70', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-09 19:48:47', '2026-08-09 19:48:47');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('71', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/checkout', '4', '2026-08-09 20:18:38', '2026-08-09 20:18:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('72', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-09 21:13:25', '2026-08-09 21:13:25');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('73', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/email/verify', 'http://127.0.0.1:8000/email/verify', '4', '2026-08-09 21:53:39', '2026-08-09 21:53:39');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('74', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/email/verify', 'http://127.0.0.1:8000/email/verify', '4', '2026-08-09 22:10:26', '2026-08-09 22:10:26');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('75', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/email/verify', 'http://127.0.0.1:8000/email/verify', '4', '2026-08-09 22:26:11', '2026-08-09 22:26:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('76', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-09 22:42:04', '2026-08-09 22:42:04');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('77', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', NULL, '2026-08-09 23:04:32', '2026-08-09 23:04:32');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('78', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', NULL, '2026-08-09 23:23:09', '2026-08-09 23:23:09');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('79', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-09 23:38:13', '2026-08-09 23:38:13');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('80', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', NULL, NULL, '2026-08-09 23:54:21', '2026-08-09 23:54:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('81', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', NULL, NULL, '2026-08-10 00:10:10', '2026-08-10 00:10:10');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('82', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/email/verify', 'http://127.0.0.1:8000/email/verify', NULL, '2026-08-10 00:35:59', '2026-08-10 00:35:59');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('83', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/offers/create', NULL, '2026-08-10 01:29:38', '2026-08-10 01:29:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('84', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/admin/offers/create', NULL, '2026-08-10 07:23:31', '2026-08-10 07:23:31');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('85', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-10 20:28:37', '2026-08-10 20:28:37');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('86', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '4', '2026-08-10 21:08:20', '2026-08-10 21:08:20');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('87', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products/uytuyrtuiy-yAdYw7', NULL, '4', '2026-08-10 21:26:44', '2026-08-10 21:26:44');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('88', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/checkout', NULL, '4', '2026-08-10 22:06:40', '2026-08-10 22:06:40');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('89', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-10 23:10:21', '2026-08-10 23:10:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('90', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', NULL, '13', '2026-08-10 23:41:11', '2026-08-10 23:41:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('91', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', NULL, '13', '2026-08-11 00:09:47', '2026-08-11 00:09:47');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('92', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/orders', '13', '2026-08-11 00:40:54', '2026-08-11 00:40:54');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('93', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/email/verify', 'http://127.0.0.1:8000/email/verify', '13', '2026-08-11 00:56:55', '2026-08-11 00:56:55');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('94', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/report-issue', '13', '2026-08-11 01:57:08', '2026-08-11 01:57:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('95', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/account', '14', '2026-08-11 02:13:50', '2026-08-11 02:13:50');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('96', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-11 07:54:27', '2026-08-11 07:54:27');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('97', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-11 20:09:00', '2026-08-11 20:09:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('98', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller?impersonate=1', NULL, '4', '2026-08-11 20:25:34', '2026-08-11 20:25:34');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('99', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller?impersonate=1', NULL, '4', '2026-08-11 20:41:38', '2026-08-11 20:41:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('100', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller', '4', '2026-08-11 21:06:01', '2026-08-11 21:06:01');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('101', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account/returns', 'http://127.0.0.1:8000/account', '14', '2026-08-11 21:21:11', '2026-08-11 21:21:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('102', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account/favorites', 'http://127.0.0.1:8000/account/returns', '14', '2026-08-11 21:36:21', '2026-08-11 21:36:21');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('103', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/account/addresses', '14', '2026-08-11 22:30:46', '2026-08-11 22:30:46');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('104', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-11 22:56:27', '2026-08-11 22:56:27');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('105', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-12 04:29:38', '2026-08-12 04:29:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('106', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '14', '2026-08-12 04:47:11', '2026-08-12 04:47:11');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('107', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account/addresses', 'http://127.0.0.1:8000/account/favorites', '14', '2026-08-12 05:02:18', '2026-08-12 05:02:18');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('108', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-12 20:12:08', '2026-08-12 20:12:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('109', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-12 20:56:59', '2026-08-12 20:56:59');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('110', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/admin/customers?role=customer&search=', '14', '2026-08-12 21:37:59', '2026-08-12 21:37:59');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('111', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-13 20:54:06', '2026-08-13 20:54:06');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('112', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/admin/customers', '14', '2026-08-13 21:09:44', '2026-08-13 21:09:44');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('113', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/settings', '14', '2026-08-13 23:27:01', '2026-08-13 23:27:01');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('114', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-14 07:09:15', '2026-08-14 07:09:15');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('115', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/bargain-offers', '4', '2026-08-14 07:25:22', '2026-08-14 07:25:22');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('116', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/settings', '4', '2026-08-14 07:54:54', '2026-08-14 07:54:54');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('117', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-14 11:41:00', '2026-08-14 11:41:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('118', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller?impersonate=1', 'http://127.0.0.1:8000/admin/category-requests', '4', '2026-08-14 12:13:04', '2026-08-14 12:13:04');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('119', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/account', 'http://127.0.0.1:8000/admin/customers', '14', '2026-08-14 14:11:46', '2026-08-14 14:11:46');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('120', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/kyc', '14', '2026-08-14 14:28:43', '2026-08-14 14:28:43');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('121', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller', 'http://127.0.0.1:8000/seller/products', '14', '2026-08-14 14:49:03', '2026-08-14 14:49:03');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('122', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-14 15:04:06', '2026-08-14 15:04:06');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('123', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-14 15:26:06', '2026-08-14 15:26:06');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('124', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', 'Chrome', 'AndroidOS', 'mobile', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-14 15:52:49', '2026-08-14 15:52:49');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('125', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-14 16:26:05', '2026-08-14 16:26:05');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('126', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '14', '2026-08-14 16:42:30', '2026-08-14 16:42:30');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('127', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/seller?impersonate=5', 'http://127.0.0.1:8000/admin/shops', '4', '2026-08-14 16:59:58', '2026-08-14 16:59:58');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('128', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-14 17:38:06', '2026-08-14 17:38:06');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('129', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '2', '2026-08-14 18:03:00', '2026-08-14 18:03:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('130', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, '2', '2026-08-14 18:19:57', '2026-08-14 18:19:57');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('131', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/page/about-us', NULL, '2026-08-14 20:55:24', '2026-08-14 20:55:24');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('132', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products/guruz-premium-extension-socket-5m-6a7ed2a1811f8', NULL, NULL, '2026-08-14 21:28:19', '2026-08-14 21:28:19');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('133', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/admin', 'http://127.0.0.1:8000/auth', '4', '2026-08-14 23:57:13', '2026-08-14 23:57:13');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('134', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/forgot-password', NULL, NULL, '2026-08-15 00:16:50', '2026-08-15 00:16:50');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('135', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-15 20:06:22', '2026-08-15 20:06:22');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('136', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-16 01:09:00', '2026-08-16 01:09:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('137', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-17 19:28:38', '2026-08-17 19:28:38');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('138', '127.0.0.1', 'Go-http-client/1.1', '0', '0', 'mobile', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-18 07:37:00', '2026-08-18 07:37:00');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('139', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-21 22:25:04', '2026-08-21 22:25:04');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('140', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', NULL, '2026-08-21 22:41:08', '2026-08-21 22:41:08');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('141', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/checkout', 'http://127.0.0.1:8000/checkout', NULL, '2026-08-21 23:03:02', '2026-08-21 23:03:02');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('142', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/pages/warranty', 'http://127.0.0.1:8000/', NULL, '2026-08-21 23:41:40', '2026-08-21 23:41:40');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('143', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', NULL, NULL, '2026-08-22 21:08:16', '2026-08-22 21:08:16');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('144', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://localhost:5173/', '4', '2026-08-22 22:28:50', '2026-08-22 22:28:50');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('145', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', '4', '2026-08-22 22:48:15', '2026-08-22 22:48:15');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('146', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/products/tp-link-archer-c80', NULL, '2026-08-23 20:37:13', '2026-08-23 20:37:13');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('147', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', NULL, '2026-08-23 20:55:39', '2026-08-23 20:55:39');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('148', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000/products?search=guruz%20authorized', 'http://127.0.0.1:8000/', NULL, '2026-08-23 21:12:40', '2026-08-23 21:12:40');
INSERT INTO `visitor_logs` (`id`, `ip_address`, `user_agent`, `browser`, `platform`, `device`, `country`, `city`, `url`, `referer`, `user_id`, `created_at`, `updated_at`) VALUES ('149', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'Chrome', 'Windows', 'desktop', NULL, NULL, 'http://127.0.0.1:8000', 'http://127.0.0.1:8000/', NULL, '2026-08-23 21:31:03', '2026-08-23 21:31:03');

-- --------------------------------------------------------
-- Table structure for `units`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `units`;
CREATE TABLE `units` (
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

-- Dumping data for table `units`
INSERT INTO `units` (`id`, `shop_id`, `name`, `short_name`, `is_active`, `created_at`, `updated_at`) VALUES ('3', NULL, 'hfhf', 'fhfhfh', '1', '2026-08-13 23:32:21', '2026-08-13 23:32:21');

-- --------------------------------------------------------
-- Table structure for `product_attributes`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE `product_attributes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `shop_id` bigint(20) unsigned DEFAULT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'text',
  `values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`values`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_attributes_product_id_foreign` (`product_id`),
  KEY `product_attributes_shop_id_foreign` (`shop_id`),
  CONSTRAINT `product_attributes_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_attributes_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `product_attributes`
INSERT INTO `product_attributes` (`id`, `shop_id`, `product_id`, `name`, `type`, `values`, `is_active`, `created_at`, `updated_at`) VALUES ('3', NULL, NULL, 'fbfdbhf', 'text', '[\"fbgdfbf\"]', '1', '2026-08-08 19:53:24', '2026-08-08 19:53:24');
INSERT INTO `product_attributes` (`id`, `shop_id`, `product_id`, `name`, `type`, `values`, `is_active`, `created_at`, `updated_at`) VALUES ('4', NULL, NULL, 'Color', 'text', '[\"#000000\",\"#ef4444\",\"#f97316\",\"#eab308\",\"#22c55e\",\"#06b6d4\",\"#3b82f6\",\"#a855f7\",\"#ec4899\",\"#78350f\",\"#ffffff\",\"#64748b\",\"#efecec\",\"#1100ff\",\"hhh\"]', '1', '2026-08-14 08:00:34', '2026-08-14 18:09:38');
INSERT INTO `product_attributes` (`id`, `shop_id`, `product_id`, `name`, `type`, `values`, `is_active`, `created_at`, `updated_at`) VALUES ('5', NULL, NULL, 'Size', 'text', '[\"XS\",\"S\",\"M\",\"L\",\"XL\",\"XXL\",\"3XL\",\"Free\"]', '1', '2026-08-14 08:00:34', '2026-08-14 08:00:34');
INSERT INTO `product_attributes` (`id`, `shop_id`, `product_id`, `name`, `type`, `values`, `is_active`, `created_at`, `updated_at`) VALUES ('6', NULL, NULL, 'Material', 'text', '[\"Cotton\",\"Polyester\",\"Silk\",\"Denim\",\"Velvet\",\"Leather\",\"Wool\"]', '1', '2026-08-14 08:00:34', '2026-08-14 08:00:34');

-- --------------------------------------------------------
-- Table structure for `purchases`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `purchases`
INSERT INTO `purchases` (`id`, `shop_id`, `supplier_name`, `po_number`, `total_amount`, `status`, `purchase_date`, `created_at`, `updated_at`) VALUES ('1', '6', 'Beximco Electric & Cables Ltd', 'PO-20260801', '85000.00', 'Received', '2026-08-01', '2026-08-14 07:54:59', '2026-08-14 07:54:59');
INSERT INTO `purchases` (`id`, `shop_id`, `supplier_name`, `po_number`, `total_amount`, `status`, `purchase_date`, `created_at`, `updated_at`) VALUES ('2', '6', 'Spark Power Wholesale Co.', 'PO-20260805', '42000.00', 'Pending', '2026-08-05', '2026-08-14 07:54:59', '2026-08-14 07:54:59');
INSERT INTO `purchases` (`id`, `shop_id`, `supplier_name`, `po_number`, `total_amount`, `status`, `purchase_date`, `created_at`, `updated_at`) VALUES ('3', '6', 'Guruz Hardware Importers', 'PO-20260810', '125000.00', 'Received', '2026-08-10', '2026-08-14 07:54:59', '2026-08-14 07:54:59');

-- --------------------------------------------------------
-- Table structure for `warehouses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE `warehouses` (
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `warehouses`
INSERT INTO `warehouses` (`id`, `shop_id`, `name`, `address`, `contact_number`, `is_active`, `created_at`, `updated_at`) VALUES ('1', '9', 'Dhaka Central Warehouse & Hub', 'Plot 45, Sector 7, Uttara Commercial Area, Dhaka - 1230', '+880 1711-889900', '1', '2026-08-14 00:27:28', '2026-08-14 00:27:28');
INSERT INTO `warehouses` (`id`, `shop_id`, `name`, `address`, `contact_number`, `is_active`, `created_at`, `updated_at`) VALUES ('2', '9', 'Chittagong Port Regional Depot', 'Agrabad Commercial Area, Station Road, Chittagong', '+880 1899-776655', '1', '2026-08-14 00:27:28', '2026-08-14 00:27:28');

SET FOREIGN_KEY_CHECKS = 1;
