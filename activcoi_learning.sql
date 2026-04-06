-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 06, 2026 at 09:30 PM
-- Server version: 10.6.24-MariaDB-cll-lve
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `activcoi_learning`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(191) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(191) NOT NULL,
  `owner` varchar(191) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `created_at`, `updated_at`) VALUES
(1, 'Web Development', 'web-development', 'code', '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(2, 'Data Science', 'data-science', 'bar-chart', '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(3, 'Mobile Development', 'mobile-development', 'smartphone', '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(4, 'Design', 'design', 'pen-tool', '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(5, 'Business', 'business', 'briefcase', '2026-04-06 01:46:30', '2026-04-06 01:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `certificate_code` varchar(191) NOT NULL,
  `pdf_url` varchar(191) DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificate_templates`
--

CREATE TABLE `certificate_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `background_image` varchar(191) NOT NULL,
  `layout_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`layout_data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `certificate_templates`
--

INSERT INTO `certificate_templates` (`id`, `course_id`, `background_image`, `layout_data`, `created_at`, `updated_at`) VALUES
(1, 1, 'default_bg.jpg', '{\"student_name\":{\"x\":50,\"y\":50,\"fontSize\":36,\"color\":\"#000000\",\"align\":\"center\",\"fontFamily\":\"sans-serif\",\"fontWeight\":\"bold\"},\"course_title\":{\"x\":50,\"y\":60,\"fontSize\":24,\"color\":\"#4b5563\",\"align\":\"center\",\"fontFamily\":\"sans-serif\",\"fontWeight\":\"normal\"},\"date\":{\"x\":50,\"y\":70,\"fontSize\":16,\"color\":\"#6b7280\",\"align\":\"center\",\"fontFamily\":\"sans-serif\",\"fontWeight\":\"normal\"},\"certificate_code\":{\"x\":50,\"y\":80,\"fontSize\":12,\"color\":\"#9ca3af\",\"align\":\"center\",\"fontFamily\":\"monospace\",\"fontWeight\":\"normal\"}}', '2026-04-06 01:46:30', '2026-04-06 01:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `mentor_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `tagline` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `thumbnail` varchar(191) DEFAULT NULL,
  `cover_image` varchar(191) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_certified` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `mentor_id`, `category_id`, `level`, `title`, `slug`, `tagline`, `description`, `thumbnail`, `cover_image`, `price`, `status`, `is_certified`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 1, 'beginner', 'Mastering Laravel Foundations', 'mastering-laravel-foundations', 'Start your journey to becoming a Laravel expert.', 'This comprehensive guide covers everything from setting up the environment to building a complete application using Laravel and the TALL stack. Suitable for beginners to intermediate learners.', NULL, NULL, 0.00, 'published', 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30', NULL),
(2, 6, 5, 'beginner', 'Jago Whatsapp', 'jago-whatsapp-uheJ7', 'jago-whatsapp', 'Mempelajari Dasar Dasar WhatsApp Bisnis', '/storage/courses/thumbnails/nCBneh7Uo73oaOPzZ14hBm5LZUX59MmkdN7auXwh.jpg', '/storage/courses/covers/PjeUHUcWweNJbziuIiAbI6g1NZdjK10LfGDtYP2N.jpg', 35000.00, 'published', 0, '2026-04-06 02:36:55', '2026-04-06 03:25:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `course_photos`
--

CREATE TABLE `course_photos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `photo` varchar(191) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','completed','dropped') NOT NULL DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `status`, `enrolled_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 7, 2, 'active', '2026-04-06 02:41:57', NULL, '2026-04-06 02:41:57', '2026-04-06 02:41:57');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `type` enum('video','article','text') NOT NULL DEFAULT 'video',
  `video_url` varchar(191) DEFAULT NULL,
  `thumbnail` varchar(191) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_preview` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `section_id`, `title`, `slug`, `type`, `video_url`, `thumbnail`, `content`, `order`, `is_preview`, `created_at`, `updated_at`) VALUES
(1, 1, 'Installing Laravel', NULL, 'text', NULL, NULL, '<p>Welcome to this course! You will learn how to set up your local environment and install Laravel via Composer.</p>', 1, 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(2, 1, 'Routing Basics', NULL, 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL, 2, 0, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(3, 2, 'Pengertian Dasar Whatsapp Marketing - Bagian 1', NULL, 'video', 'https://youtu.be/0TiHgEX3Ie4', '/storage/lessons/thumbnails/MGWtmEFWuydLhq6JiT9bwmIcpNA0NPX3I8Q8SLDc.jpg', 'Bagian 1 Pengertian Dasar Whatsapp Marketing', 1, 1, '2026-04-06 02:37:35', '2026-04-06 03:35:05'),
(4, 2, 'Whatsapp Contact Manajemen - Bagian 2', NULL, 'video', 'https://youtu.be/v-A1mUhO7-8', '/storage/lessons/thumbnails/efFGkS6BuubFwiVFls9mdXqH9ZsPfwplzh5Rx46J.jpg', 'Whatsapp Contact Manajemen - Bagian 2', 2, 0, '2026-04-06 03:27:18', '2026-04-06 04:21:21'),
(5, 2, 'Membuat Grup Whatsapp - Bagian 3', NULL, 'video', 'https://youtu.be/OL7UV2OCWVU', '/storage/lessons/thumbnails/reho2aeiYS1RZvrE5LZWEn3oMTo11hzUFFclSYx4.jpg', 'Membuat Grup Whatsapp - Bagian 3', 3, 0, '2026-04-06 03:27:35', '2026-04-06 03:34:55'),
(6, 2, 'Tentang Whatsapp Business - Bagian 4', NULL, 'video', 'https://youtu.be/ZNbSKKjn8Gc', '/storage/lessons/thumbnails/Ea5CZwOfRb43qztBaPAuHli8mHzzFF8Kpbb8ep5n.jpg', 'Tentang Whatsapp Business - Bagian 4', 4, 0, '2026-04-06 03:35:38', '2026-04-06 04:21:12'),
(7, 2, 'Setting Whatsapp Business - Bagian 5', NULL, 'video', 'https://youtu.be/0oyRIB6hAi8', '/storage/lessons/thumbnails/BjXqwhMssoqK1H2oNGcNQ5yoSMBysQgqNYPGTR3P.jpg', 'Setting Whatsapp Business - Bagian 5', 5, 0, '2026-04-06 03:47:15', '2026-04-06 03:47:34'),
(8, 3, 'Setting Whatsapp Katalog Produk - Bagian 6', NULL, 'video', 'https://youtu.be/-8yPzHmitTQ', '/storage/lessons/thumbnails/mQEldROuKhv0gKTlQgoyOy9nBDD3X7QV0U5AecOZ.jpg', 'Setting Whatsapp Katalog Produk - Bagian 6', 1, 0, '2026-04-06 03:49:14', '2026-04-06 04:21:16'),
(9, 3, 'Whatsapp Story - Bagian 7', NULL, 'video', 'https://youtu.be/TUuompdyfBo', '/storage/lessons/thumbnails/IINJhxwULO78mM2hWzdpHyhEWZl5DVHCAc2Sn74U.jpg', 'Whatsapp Story - Bagian 7', 2, 0, '2026-04-06 03:55:25', '2026-04-06 03:56:10'),
(10, 3, 'Selling Trick - Bagian 8', NULL, 'video', 'https://youtu.be/yTHL2Ye-IcI', '/storage/lessons/thumbnails/2DsrbuK85jsLeWqmfpaKDEi625Upf5m0UlmukwvL.jpg', 'Selling Trick - Bagian 8', 3, 0, '2026-04-06 04:03:17', '2026-04-06 04:04:04'),
(11, 3, 'Whatsapp Business - Bagian 9', NULL, 'video', 'https://youtu.be/S2VZDKM2IwM', '/storage/lessons/thumbnails/zSucDqTXvOq8SJEL4brx5aarhFxcPrKNLIusu2LX.jpg', 'Whatsapp Business - Bagian 9', 4, 0, '2026-04-06 04:04:18', '2026-04-06 04:04:49'),
(12, 3, 'Template Link - Bagian 10', NULL, 'video', 'https://youtu.be/ySONyWeHxAg', '/storage/lessons/thumbnails/Uns4Hj1kstLt2Y7q31TJATf40J4doAda7LcuSZWL.jpg', 'Template Link - Bagian 10', 5, 0, '2026-04-06 04:07:51', '2026-04-06 04:08:05');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_progress`
--

INSERT INTO `lesson_progress` (`id`, `enrollment_id`, `lesson_id`, `is_completed`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 1, '2026-04-06 04:41:57', '2026-04-06 04:12:00', '2026-04-06 04:41:57');

-- --------------------------------------------------------

--
-- Table structure for table `mentor_earnings`
--

CREATE TABLE `mentor_earnings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `mentor_id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `platform_fee` decimal(10,2) NOT NULL,
  `net_earning` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mentor_withdrawals`
--

CREATE TABLE `mentor_withdrawals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `mentor_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  `bank_name` varchar(191) DEFAULT NULL,
  `account_number` varchar(191) DEFAULT NULL,
  `account_name` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_05_090720_create_lms_tables', 1),
(5, '2026_03_17_224325_create_permission_tables', 1),
(6, '2026_03_18_044436_update_lessons_type_enum', 1),
(7, '2026_03_18_044938_add_cover_image_to_courses_table', 1),
(8, '2026_03_18_054324_add_thumbnail_to_lessons_table', 1),
(9, '2026_03_18_063314_add_slug_to_lessons_table', 1),
(10, '2026_03_18_071221_create_settings_table', 1),
(11, '2026_03_18_111636_create_notifications_table', 1),
(12, '2026_03_18_122000_add_soft_deletes_to_courses_table', 1),
(13, '2026_03_18_153000_add_level_to_courses_table', 1),
(14, '2026_04_06_100000_create_organization_tables', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(191) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(1, 'App\\Models\\User', 2),
(1, 'App\\Models\\User', 3),
(2, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(2, 'App\\Models\\User', 4),
(2, 'App\\Models\\User', 6),
(3, 'App\\Models\\User', 1),
(3, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 5),
(3, 'App\\Models\\User', 7),
(3, 'App\\Models\\User', 8),
(3, 'App\\Models\\User', 9);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `data`, `created_at`, `updated_at`) VALUES
(1, 7, 'Enrollment Successful', 'You have been enrolled in \"Jago Whatsapp\" for free via ACTiV.', 'success', 0, '{\"course_id\":2}', '2026-04-06 02:41:57', '2026-04-06 02:41:57'),
(2, 7, 'Lesson Completed', 'You have completed the lesson: Pengertian Dasar Whatsapp Marketing - Bagian 1', 'info', 0, '{\"lesson_id\":3,\"course_id\":\"2\"}', '2026-04-06 04:12:00', '2026-04-06 04:12:00'),
(3, 7, 'Lesson Completed', 'You have completed the lesson: Pengertian Dasar Whatsapp Marketing - Bagian 1', 'info', 0, '{\"lesson_id\":3,\"course_id\":\"2\"}', '2026-04-06 04:26:06', '2026-04-06 04:26:06'),
(4, 7, 'Lesson Completed', 'You have completed the lesson: Pengertian Dasar Whatsapp Marketing - Bagian 1', 'info', 0, '{\"lesson_id\":3,\"course_id\":\"2\"}', '2026-04-06 04:41:57', '2026-04-06 04:41:57');

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `slug`, `description`, `logo`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ACTiV', 'activ', 'PT Alfa Cipta Teknologi Virtual', NULL, 1, '2026-04-06 02:40:46', '2026-04-06 02:40:46');

-- --------------------------------------------------------

--
-- Table structure for table `organization_courses`
--

CREATE TABLE `organization_courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organization_courses`
--

INSERT INTO `organization_courses` (`id`, `organization_id`, `course_id`, `assigned_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '2026-04-06 02:40:57', '2026-04-06 02:40:57', '2026-04-06 02:40:57');

-- --------------------------------------------------------

--
-- Table structure for table `organization_members`
--

CREATE TABLE `organization_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `organization_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organization_members`
--

INSERT INTO `organization_members` (`id`, `organization_id`, `user_id`, `role`, `joined_at`, `created_at`, `updated_at`) VALUES
(1, 1, 7, 'member', '2026-04-06 02:40:52', '2026-04-06 02:40:52', '2026-04-06 02:40:52'),
(2, 1, 8, 'member', '2026-04-06 03:58:26', '2026-04-06 03:58:26', '2026-04-06 03:58:26');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(125) NOT NULL,
  `guard_name` varchar(125) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('multiple_choice','submission') NOT NULL,
  `passing_score` int(11) NOT NULL DEFAULT 70,
  `is_required_for_certificate` tinyint(1) NOT NULL DEFAULT 1,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `course_id`, `section_id`, `title`, `description`, `type`, `passing_score`, `is_required_for_certificate`, `order`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Module 1 Knowledge Check', 'Test your understanding of Laravel basic routing and setup.', 'multiple_choice', 80, 1, 3, '2026-04-06 01:46:30', '2026-04-06 01:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_attempt_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_question_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_option_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `is_passed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_options`
--

CREATE TABLE `quiz_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_question_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_options`
--

INSERT INTO `quiz_options` (`id`, `quiz_question_id`, `option_text`, `is_correct`, `created_at`, `updated_at`) VALUES
(1, 1, 'npm install laravel', 0, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(2, 1, 'composer create-project laravel/laravel', 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(3, 1, 'php artisan new', 0, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(4, 2, 'routes/web.php', 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(5, 2, 'routes/api.php', 0, '2026-04-06 01:46:30', '2026-04-06 01:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `question` text NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`, `order`, `created_at`, `updated_at`) VALUES
(1, 1, 'What is the standard command to install Laravel via Composer?', 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(2, 1, 'Which file contains web routes?', 2, '2026-04-06 01:46:30', '2026-04-06 01:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(125) NOT NULL,
  `guard_name` varchar(125) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(2, 'mentor', 'web', '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(3, 'student', 'web', '2026-04-06 01:46:29', '2026-04-06 01:46:29');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `course_id`, `title`, `order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Introduction to Laravel', 1, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(2, 2, 'Jago WhatsApp Bagian 1-5', 1, '2026-04-06 02:37:13', '2026-04-06 03:47:58'),
(3, 2, 'Jago WhatsApp Bagian 6-10', 2, '2026-04-06 03:48:10', '2026-04-06 03:48:10'),
(4, 2, 'Jago WhatsApp - Bonus', 3, '2026-04-06 04:08:22', '2026-04-06 04:08:33');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('ONSiltgx2JGbHlmJnphAGU4mwbwbQ9G1jgSTL0MX', NULL, '74.125.215.195', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNVBWbExycWtkNmRTNlNTQ3FYc010R2N4c214T2RZdEpvSmtVaFJSaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775474276),
('6RcFRBhbvpAo1wfTFryjtOKGfkj7HlbzXpjPyZqJ', NULL, '74.125.215.195', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDJ5VW1YSUFEVk1VUjNSYmNod3ZHcDdDVExZZVJHN0txeHpQYVN4eiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775474276),
('CKnqUqloAJ4lrygUOW6imNjd2qPYim7lTxihAaSV', NULL, '64.233.173.195', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMjBmNlVYMjExdndteFhCd2NXcGMzbDlHSXQzREFJUVBvbXNQMFJoSiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775474273),
('pg2zZNdHDZmrSIUELtUMFzN592lT5kudvfEM4MG4', 6, '156.230.181.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWVFhQVNYTG5wTUQ3dThLODhzbjhXMkJtME5SUkhBVHRkdUdVWENMTyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6NjtzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo2MDoiaHR0cHM6Ly9sZWFybmluZy5hY3Rpdi5jby5pZC9kYXNoYm9hcmQvbWVudG9yL2NvdXJzZXMvMi9lZGl0IjtzOjU6InJvdXRlIjtzOjE5OiJtZW50b3IuY291cnNlcy5lZGl0Ijt9fQ==', 1775474485),
('EPdBUSD4N2uLegJrMAVgdItDTcDl6Y5XjNpKfg6O', 2, '158.140.180.0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRUhXZDVpZUcxUUlhaTh6WWY1WmljZUZ1UzNLRmxtR2pGTnlJY28xYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQvZGFzaGJvYXJkL2FkbWluL29yZ2FuaXphdGlvbnMvMSI7czo1OiJyb3V0ZSI7czoyNDoiYWRtaW4ub3JnYW5pemF0aW9ucy5zaG93Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6Mjt9', 1775474364),
('G6H8dWbHuVxkRie85F8K8O5jvLfm4pPpL5uExFf4', 7, '156.230.181.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZnpqa0dFcEMyV1ozb2dFanBLOTBudUg2ekFWcDI1ZWlYdklIeFpnbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzI6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQvZGFzaGJvYXJkL2NvdXJzZXMvamFnby13aGF0c2FwcC11aGVKNy9sZWFybiI7czo1OiJyb3V0ZSI7czoxMzoic3R1ZGVudC5sZWFybiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjc7fQ==', 1775475336),
('aIDdAIoZsa0ra1OB1UcxDkOThM1ELbsl5taUSooq', 8, '156.230.181.28', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3.1 Safari/605.1.15', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiV3ZiM3pqbWVETEI2NkRYd1I0RldKYjJRZ3NORGc2OWVwektkTXNBZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjY6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQvZGFzaGJvYXJkL2NhdGFsb2cvamFnby13aGF0c2FwcC11aGVKNyI7czo1OiJyb3V0ZSI7czozMDoic3R1ZGVudC5jb3Vyc2VzLmRhc2hib2FyZC5zaG93Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6ODt9', 1775473115),
('zm05rJxnBmuMgng7SfBjEbeh3DVELGmGyf0OASEV', 9, '182.3.42.6', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoid20zZ09oOVVqYW5ydFJBZjk3aW9Dd2RDcnBmNVR5NjVUZ0RQU3BkdiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQvZGFzaGJvYXJkIjtzOjU6InJvdXRlIjtzOjk6ImRhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjk7fQ==', 1775480450),
('qPJB6kVckoaavzInGNJ17kTUvIPgNthlkf9OUEA7', NULL, '156.230.181.28', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUnY0ZTdQd2pPNTdMaG0xZGtkNjM0MGtzZGJ0MmRlcVEzeEVwVmJ6UCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo1MDoiaHR0cHM6Ly9sZWFybmluZy5hY3Rpdi5jby5pZC9kYXNoYm9hcmQvYWRtaW4vdXNlcnMiO31zOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czozNDoiaHR0cHM6Ly9sZWFybmluZy5hY3Rpdi5jby5pZC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775474378),
('4zul5ehdgW5eKmcE6yFaPWGJfy3muP6qvRmtx6iZ', NULL, '2400:9800:fd:7d41:18a3:c009:1a2c:a99f', 'WhatsApp/2.23.20.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidmZJVHNFSW1ETDg4UDREczEwQURhbk9OUWt1QlVJbXVhUHB2Q3U2diI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1775474595),
('zuz1HieU2RUjnpdVhuydnwpnbYsXuyIg1NPBeYAW', NULL, '2404:c0:5c20::4916:4f14', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoidmNQbXFLNkNmc2d4N3RrbFJLTW5oc3RzWFpoVXVQRDhjdkVGTmYwViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjg6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6MzoidXJsIjthOjE6e3M6ODoiaW50ZW5kZWQiO3M6NDY6Imh0dHBzOi8vbGVhcm5pbmcuYWN0aXYuY28uaWQvZGFzaGJvYXJkL2NhdGFsb2ciO319', 1775475419),
('7scJoGYy2MSRHgGWdVyMMP6f7mIlputcA6q65tfL', 7, '2400:9800:fd:7d41:18a3:c009:1a2c:a99f', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNWRkellZZ3J6aWVoYTZ5Z0Q5TlVnRTVuUVd5WEZhYVFUbnMzeVlITyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6NztzOjk6Il9wcmV2aW91cyI7YToyOntzOjM6InVybCI7czo3NDoiaHR0cHM6Ly9sZWFybmluZy5hY3Rpdi5jby5pZC9kYXNoYm9hcmQvY291cnNlcy9qYWdvLXdoYXRzYXBwLXVoZUo3L2xlYXJuLzQiO3M6NToicm91dGUiO3M6MTM6InN0dWRlbnQubGVhcm4iO319', 1775475905);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text DEFAULT NULL,
  `group` varchar(191) NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `group`, `created_at`, `updated_at`) VALUES
(1, 'primary_color', '#08c965', 'branding', NULL, '2026-04-06 02:58:24'),
(2, 'sidebar_active_color', '#2ecae5', 'branding', NULL, '2026-04-06 02:58:24'),
(3, 'platform_name', 'LMS', 'branding', '2026-04-06 02:58:24', '2026-04-06 02:58:24');

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_url` varchar(191) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `score` int(11) DEFAULT NULL,
  `mentor_feedback` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` varchar(191) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','success','failed','expired') NOT NULL DEFAULT 'pending',
  `payment_type` varchar(191) DEFAULT NULL,
  `payment_gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_gateway_response`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `student_id`, `course_id`, `order_id`, `amount`, `status`, `payment_type`, `payment_gateway_response`, `created_at`, `updated_at`) VALUES
(1, 7, 2, 'TRX-1775468414-MCCGO', 5000.00, 'pending', NULL, NULL, '2026-04-06 02:40:14', '2026-04-06 02:40:14'),
(2, 7, 2, 'ORG-RJBMNLJXXI', 0.00, 'success', 'organization', '{\"org_name\":\"ACTiV\",\"original_price\":35000}', '2026-04-06 02:41:57', '2026-04-06 02:41:57'),
(3, 2, 2, 'TRX-1775474166-LBD82', 35000.00, 'pending', NULL, NULL, '2026-04-06 04:16:06', '2026-04-06 04:16:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `gender` enum('male','female') DEFAULT NULL,
  `role` enum('student','mentor','admin') NOT NULL DEFAULT 'student',
  `avatar` varchar(191) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `email_verified_at`, `password`, `phone`, `gender`, `role`, `avatar`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'nabil@activ.co.id', '2026-04-06 01:46:29', '$2y$12$H0jB/TZ1zL9dK5fgY8Jbge1C7bIqsG/Le0rbfrAWLC2eUJkkYznJG', NULL, NULL, 'admin', NULL, NULL, '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(2, 'LMS Admin (All Roles)', 'lms@activ.co.id', '2026-04-06 01:46:29', '$2y$12$y.IjzBFJl/pQ1fA8strpJu/4DaefQL.bIoyNlZGkDoWiUsw4jW4aa', NULL, NULL, 'admin', NULL, NULL, '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(3, 'Admin Test', 'admin@example.test', '2026-04-06 01:46:29', '$2y$12$8s12SMXrCvChaI8VkflzNemkseZUwMVdlIfFknPSSniDg3u6pzN1a', NULL, NULL, 'admin', NULL, NULL, '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(4, 'Professional Mentor', 'mentor@example.test', '2026-04-06 01:46:29', '$2y$12$Pr/UbF2.kPejRzp36/A6BuA.0G3ip273H5gNrcsuASjYyO9JsrJaW', NULL, NULL, 'mentor', NULL, NULL, '2026-04-06 01:46:29', '2026-04-06 01:46:29'),
(5, 'Active Student', 'student@example.test', '2026-04-06 01:46:30', '$2y$12$6OIhvg/lMi6YJ6auQGJ3OeQeFZaEWGVH4kZ42cbveCk62e5pyse32', NULL, NULL, 'student', NULL, NULL, '2026-04-06 01:46:30', '2026-04-06 01:46:30'),
(6, 'Mohammad Fazrie', 'fazri@activ.co.id', NULL, '$2y$12$Nu/uoaYeK.M6fpZGCC0CJ.tkh387Epc6GmtJdvinlYcc4YNLc5/PO', NULL, NULL, 'mentor', NULL, NULL, '2026-04-06 02:26:47', '2026-04-06 02:27:22'),
(7, 'Evan Badillah Gazal', 'evan@activ.co.id', NULL, '$2y$12$ESe1ePvN9D8VhNAuHT0LE.iDHrkThAMMEMt6ze4vOH82awluvQGdu', NULL, NULL, 'student', NULL, NULL, '2026-04-06 02:39:08', '2026-04-06 02:39:08'),
(8, 'Farah olivia Handayani', 'olivia@activ.co.id', NULL, '$2y$12$9Z9QdIERdGmEjiNxRNp3guMq4pnSuyJyTcNwgC0/RsWByTq/J54pu', NULL, NULL, 'student', NULL, NULL, '2026-04-06 03:56:52', '2026-04-06 03:56:52'),
(9, 'fitra adyasa', 'fitraadyasa@gmail.com', NULL, '$2y$12$4yrKkC.nqwbcd17eIDBbzONGs/oqwE1wNYwS7w1Ry8V5vePaaDS9m', NULL, NULL, 'student', NULL, NULL, '2026-04-06 04:18:15', '2026-04-06 04:18:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_unique` (`slug`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificates_student_id_course_id_unique` (`student_id`,`course_id`),
  ADD UNIQUE KEY `certificates_certificate_code_unique` (`certificate_code`),
  ADD KEY `certificates_course_id_foreign` (`course_id`);

--
-- Indexes for table `certificate_templates`
--
ALTER TABLE `certificate_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `certificate_templates_course_id_foreign` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `courses_slug_unique` (`slug`),
  ADD KEY `courses_mentor_id_foreign` (`mentor_id`),
  ADD KEY `courses_category_id_foreign` (`category_id`);

--
-- Indexes for table `course_photos`
--
ALTER TABLE `course_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_photos_course_id_foreign` (`course_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrollments_student_id_course_id_unique` (`student_id`,`course_id`),
  ADD KEY `enrollments_course_id_foreign` (`course_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lessons_section_id_foreign` (`section_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lesson_progress_enrollment_id_lesson_id_unique` (`enrollment_id`,`lesson_id`),
  ADD KEY `lesson_progress_lesson_id_foreign` (`lesson_id`);

--
-- Indexes for table `mentor_earnings`
--
ALTER TABLE `mentor_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mentor_earnings_mentor_id_foreign` (`mentor_id`),
  ADD KEY `mentor_earnings_transaction_id_foreign` (`transaction_id`);

--
-- Indexes for table `mentor_withdrawals`
--
ALTER TABLE `mentor_withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mentor_withdrawals_mentor_id_foreign` (`mentor_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizations_slug_unique` (`slug`);

--
-- Indexes for table `organization_courses`
--
ALTER TABLE `organization_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_courses_organization_id_course_id_unique` (`organization_id`,`course_id`),
  ADD KEY `organization_courses_course_id_foreign` (`course_id`);

--
-- Indexes for table `organization_members`
--
ALTER TABLE `organization_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_members_organization_id_user_id_unique` (`organization_id`,`user_id`),
  ADD KEY `organization_members_user_id_foreign` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`) USING HASH;

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quizzes_course_id_foreign` (`course_id`),
  ADD KEY `quizzes_section_id_foreign` (`section_id`);

--
-- Indexes for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_answers_quiz_attempt_id_foreign` (`quiz_attempt_id`),
  ADD KEY `quiz_answers_quiz_question_id_foreign` (`quiz_question_id`),
  ADD KEY `quiz_answers_quiz_option_id_foreign` (`quiz_option_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_attempts_enrollment_id_foreign` (`enrollment_id`),
  ADD KEY `quiz_attempts_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `quiz_options`
--
ALTER TABLE `quiz_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_options_quiz_question_id_foreign` (`quiz_question_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_questions_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`) USING HASH;

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_course_id_foreign` (`course_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `site_settings_key_unique` (`key`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submissions_enrollment_id_foreign` (`enrollment_id`),
  ADD KEY `submissions_quiz_id_foreign` (`quiz_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_order_id_unique` (`order_id`),
  ADD KEY `transactions_student_id_foreign` (`student_id`),
  ADD KEY `transactions_course_id_foreign` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_templates`
--
ALTER TABLE `certificate_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `course_photos`
--
ALTER TABLE `course_photos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mentor_earnings`
--
ALTER TABLE `mentor_earnings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mentor_withdrawals`
--
ALTER TABLE `mentor_withdrawals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `organization_courses`
--
ALTER TABLE `organization_courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `organization_members`
--
ALTER TABLE `organization_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_options`
--
ALTER TABLE `quiz_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
