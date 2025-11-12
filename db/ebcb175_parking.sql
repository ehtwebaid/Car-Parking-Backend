-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 12, 2025 at 08:03 AM
-- Server version: 10.6.24-MariaDB
-- PHP Version: 7.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebcb175_parking`
--

-- --------------------------------------------------------

--
-- Table structure for table `billings`
--

CREATE TABLE `billings` (
  `id` int(11) NOT NULL,
  `vehicle_number` varchar(255) NOT NULL,
  `car_type` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `per_hour_fees` float NOT NULL,
  `monthly_price` float NOT NULL,
  `duration` float NOT NULL,
  `ev_charing_fees` float DEFAULT NULL,
  `ev_charing_duration` float DEFAULT NULL,
  `net_ev_chagin_fees` float DEFAULT NULL,
  `net_parking_fees` float NOT NULL,
  `net_fees` float NOT NULL,
  `access_hours` varchar(255) DEFAULT NULL,
  `status` enum('A','I','D') NOT NULL DEFAULT 'A',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billings`
--

INSERT INTO `billings` (`id`, `vehicle_number`, `car_type`, `booking_id`, `per_hour_fees`, `monthly_price`, `duration`, `ev_charing_fees`, `ev_charing_duration`, `net_ev_chagin_fees`, `net_parking_fees`, `net_fees`, `access_hours`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Wb-64', 2, 1, 10, 100, 743, 10, 2, 20, 100, 120, 'Monday - Sunday 24h', 'A', '2025-10-21 11:38:53', '2025-10-21 11:38:53'),
(2, 'Wb-64', 1, 2, 10, 100, 31, 10, 2, 20, 310, 330, NULL, 'A', '2025-10-21 11:38:53', '2025-10-21 11:38:53');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
  `parking_slot_id` int(11) NOT NULL,
  `booking_start` datetime NOT NULL,
  `booking_end` datetime NOT NULL,
  `status` enum('A','I','D') NOT NULL COMMENT 'A=Active,I=>Inactive,D=>Delete',
  `booking_type` enum('hourly','monthly') NOT NULL DEFAULT 'hourly',
  `is_payout` tinyint(4) NOT NULL DEFAULT 0,
  `stripe_trans_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `code`, `customer_id`, `parking_slot_id`, `booking_start`, `booking_end`, `status`, `booking_type`, `is_payout`, `stripe_trans_id`, `created_at`, `updated_at`) VALUES
(1, 'BK401517', 3, 1, '2025-10-21 18:30:00', '2025-11-21 18:29:00', 'A', 'monthly', 0, 'ch_3SKdxGGgwiL8meci1P1nNdt8', '2025-10-21 11:38:53', '2025-10-21 11:38:53'),
(2, 'BK735760', 3, 2, '2025-10-22 07:30:00', '2025-10-23 14:30:00', 'A', 'hourly', 0, 'ch_3SKdykGgwiL8meci18ywIKl1', '2025-10-21 11:38:53', '2025-10-21 11:38:53');

-- --------------------------------------------------------

--
-- Table structure for table `car_types`
--

CREATE TABLE `car_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `car_types`
--

INSERT INTO `car_types` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Sedan', '2025-09-07 14:40:32', '2025-09-07 14:40:32'),
(2, 'SUV', '2025-09-07 14:40:32', '2025-09-07 14:40:32'),
(3, 'Hatchback', '2025-09-07 14:40:32', '2025-09-07 14:40:32'),
(4, 'Compact SUV', '2025-09-07 14:40:32', '2025-09-07 14:40:32');

-- --------------------------------------------------------

--
-- Table structure for table `company_settings`
--

CREATE TABLE `company_settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_no` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_settings`
--

INSERT INTO `company_settings` (`id`, `company_name`, `email`, `phone_no`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Parking APP', 'support@nexgenstore.com', '+1 (800) 123-4557', '123 Market Street, Toronto, ON, Canada\r\n\r\n', '2025-09-03 21:54:24', '2025-09-03 21:54:24');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `status` enum('A','I','D') NOT NULL DEFAULT 'A',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `sender_id`, `receiver_id`, `message`, `status`, `is_read`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'Has requested a parking slot for 22 October 2025 12 AM - 21 November 2025 11 PM', 'A', 0, '2025-10-21 11:38:53', '2025-10-21 11:38:53'),
(2, 3, 1, 'Has requested a parking slot for 22 October 2025 01 PM - 23 October 2025 08 PM', 'A', 0, '2025-10-21 11:38:53', '2025-10-21 11:38:53');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `otp_type` enum('E','M','F') NOT NULL COMMENT 'E=>Email Verification,M=>Phone Verification,\r\nF=Forget Password',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `user_id`, `otp`, `otp_type`, `created_at`, `updated_at`) VALUES
(1, 1, '603557', 'E', '2025-08-10 05:45:59', '2025-08-10 05:45:59'),
(2, 3, '497716', 'E', '2025-08-10 13:15:29', '2025-08-10 13:15:29'),
(3, 4, '568358', 'E', '2025-08-14 08:04:10', '2025-08-14 08:04:10'),
(4, 4, '972648', 'E', '2025-08-14 08:06:37', '2025-08-14 08:06:37'),
(5, 5, '660281', 'E', '2025-08-14 08:11:01', '2025-08-14 08:11:01'),
(6, 5, '297726', 'E', '2025-08-14 08:11:39', '2025-08-14 08:11:39'),
(7, 5, '533515', 'E', '2025-08-14 08:13:03', '2025-08-14 08:13:03'),
(8, 5, '745792', 'E', '2025-08-14 08:31:17', '2025-08-14 08:31:17'),
(9, 5, '585817', 'E', '2025-08-14 08:35:29', '2025-08-14 08:35:29'),
(10, 5, '429267', 'E', '2025-08-14 09:04:48', '2025-08-14 09:04:48'),
(11, 5, '679776', 'E', '2025-08-14 09:08:37', '2025-08-14 09:08:37'),
(12, 5, '581936', 'E', '2025-08-14 09:12:19', '2025-08-14 09:12:19'),
(13, 5, '639860', 'E', '2025-08-14 09:15:21', '2025-08-14 09:15:21'),
(14, 6, '759170', 'E', '2025-08-14 10:39:14', '2025-08-14 10:39:14'),
(15, 7, '466332', 'E', '2025-10-21 12:03:10', '2025-10-21 12:03:10');

-- --------------------------------------------------------

--
-- Stand-in structure for view `parking_lists`
-- (See below for the actual view)
--
CREATE TABLE `parking_lists` (
`parking_space_id` int(11)
,`title` varchar(255)
,`slug` varchar(255)
,`parking_type_id` int(11)
,`state_id` int(11)
,`start_time` time
,`end_time` time
,`photo` mediumtext
,`address` text
,`city` varchar(255)
,`zip` varchar(255)
,`lat` varchar(255)
,`lang` varchar(255)
,`twenty_four_service` tinyint(1)
,`is_ev_charing` tinyint(1)
,`per_hour_price` float
,`per_month_price` float
,`ev_charging_price` float
,`is_cc_tv` tinyint(1)
,`status` enum('A','I','D')
,`created_at` datetime
,`state_code` char(2)
);

-- --------------------------------------------------------

--
-- Table structure for table `parking_slots`
--

CREATE TABLE `parking_slots` (
  `id` int(11) NOT NULL,
  `parking_space_id` int(11) NOT NULL,
  `slot_code` varchar(255) DEFAULT NULL,
  `available_days` varchar(255) NOT NULL DEFAULT '0,1,2,3,4,5,6',
  `start_time` time NOT NULL DEFAULT '00:00:00',
  `end_time` time NOT NULL DEFAULT '23:59:00',
  `status` enum('A','I','D') NOT NULL DEFAULT 'A' COMMENT 'A=>Active,I=>Inactive,D=>Delete',
  `twenty_four_service` tinyint(1) NOT NULL DEFAULT 0,
  `is_ev_charing` tinyint(1) NOT NULL DEFAULT 0,
  `is_cc_tv` tinyint(1) NOT NULL DEFAULT 0,
  `per_hour_price` float NOT NULL DEFAULT 0,
  `per_month_price` float NOT NULL DEFAULT 0,
  `ev_charging_price` float NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parking_slots`
--

INSERT INTO `parking_slots` (`id`, `parking_space_id`, `slot_code`, `available_days`, `start_time`, `end_time`, `status`, `twenty_four_service`, `is_ev_charing`, `is_cc_tv`, `per_hour_price`, `per_month_price`, `ev_charging_price`, `created_at`, `updated_at`) VALUES
(1, 1, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 100, 10, '2025-08-13 15:57:52', '2025-08-13 15:57:52'),
(2, 1, 'SA2', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 100, 10, '2025-08-13 15:57:52', '2025-08-13 15:57:52'),
(3, 1, 'CA3', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 100, 10, '2025-08-13 15:57:52', '2025-08-13 15:57:52'),
(4, 2, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 300, 15, '2025-08-13 16:00:58', '2025-08-13 16:00:58'),
(5, 2, 'SA2', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 300, 15, '2025-08-13 16:00:58', '2025-08-13 16:00:58'),
(6, 2, 'SA3', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 300, 15, '2025-08-13 16:00:58', '2025-08-13 16:00:58'),
(7, 2, 'SA4', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 300, 15, '2025-08-13 16:00:58', '2025-08-13 16:00:58'),
(8, 3, 'SA1', '0,1,2,3,4', '10:00:00', '23:59:59', 'A', 0, 1, 1, 10, 200, 10, '2025-08-13 16:02:54', '2025-08-13 16:02:54'),
(9, 3, 'CA2', '0,1,2,3,4', '10:00:00', '23:59:59', 'A', 0, 1, 1, 10, 200, 10, '2025-08-13 16:02:54', '2025-08-13 16:02:54'),
(10, 3, 'CA3', '0,1,2,3,4', '10:00:00', '23:59:59', 'A', 0, 1, 1, 10, 200, 10, '2025-08-13 16:02:54', '2025-08-13 16:02:54'),
(11, 4, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 30, 300, 25, '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(12, 4, 'SA2', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 30, 300, 25, '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(13, 4, 'SA3', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 30, 300, 25, '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(14, 4, 'CA4', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 30, 300, 25, '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(15, 4, 'CA5', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 30, 300, 25, '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(16, 5, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 500, 3, '2025-08-13 20:01:07', '2025-08-13 20:01:07'),
(17, 11, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(18, 11, 'SA2', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(19, 11, 'SA3', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(20, 11, 'SA4', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(21, 11, 'SA5', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(22, 11, 'SA6', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(23, 11, 'SA7', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(24, 11, 'SA8', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(25, 11, 'SA9', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(26, 11, 'SA10', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(27, 11, 'CA11', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(28, 11, 'CA12', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(29, 11, 'CA13', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(30, 11, 'CA14', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(31, 11, 'CA15', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 50, 15, '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(32, 12, 'SA1', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(33, 12, 'SA2', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(34, 12, 'SA3', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(35, 12, 'SA4', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(36, 12, 'SA5', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(37, 12, 'SA6', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(38, 12, 'SA7', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(39, 12, 'SA8', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(40, 12, 'SA9', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(41, 12, 'SA10', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(42, 12, 'CA11', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(43, 12, 'CA12', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(44, 12, 'CA13', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(45, 12, 'CA14', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(46, 12, 'CA15', '0,1,2,3,4', '00:00:00', '23:59:59', 'A', 1, 1, 1, 20, 100, 20, '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(47, 13, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 500, 10, '2025-08-19 17:13:58', '2025-08-19 17:13:58'),
(48, 13, 'SA2', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 500, 10, '2025-08-19 17:13:58', '2025-08-19 17:13:58'),
(49, 13, 'SA3', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 10, 500, 10, '2025-08-19 17:13:58', '2025-08-19 17:13:58'),
(50, 14, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 8, 250, 5, '2025-08-19 20:15:43', '2025-08-19 20:15:43'),
(51, 15, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 8, 250, 5, '2025-08-19 20:15:45', '2025-08-19 20:15:45'),
(52, 16, 'SA1', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 8, 250, 5, '2025-08-19 20:15:51', '2025-08-19 20:15:51'),
(53, 1, 'CA4', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 100, 10, '2025-08-22 15:45:00', '2025-08-22 15:45:00'),
(54, 1, 'CA5', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'A', 1, 1, 1, 15, 100, 10, '2025-08-22 15:46:17', '2025-08-22 15:46:17'),
(55, 1, 'CA6', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'I', 1, 1, 1, 15, 100, 10, '2025-08-22 15:46:17', '2025-08-22 15:46:17'),
(56, 1, 'SA7', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'I', 1, 1, 1, 15, 100, 10, '2025-08-22 15:47:21', '2025-08-22 15:47:21'),
(57, 1, 'SA8', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'I', 1, 1, 1, 15, 100, 10, '2025-08-25 17:08:08', '2025-08-25 17:08:08'),
(58, 1, 'CA9', '0,1,2,3,4,5,6', '00:00:00', '23:59:59', 'I', 1, 1, 1, 15, 100, 10, '2025-08-25 17:08:08', '2025-08-25 17:08:08');

-- --------------------------------------------------------

--
-- Table structure for table `parking_spaces`
--

CREATE TABLE `parking_spaces` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `owner_id` int(11) NOT NULL,
  `parking_type_id` int(11) NOT NULL,
  `state_id` int(11) NOT NULL,
  `photos` text DEFAULT NULL,
  `status` enum('A','I','D') NOT NULL DEFAULT 'A' COMMENT 'A=>Active,I=>Inactive,D=>Deleted',
  `address` text DEFAULT NULL,
  `ev_charing_slot` int(11) DEFAULT NULL,
  `min_booking_duration` int(11) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `lang` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parking_spaces`
--

INSERT INTO `parking_spaces` (`id`, `title`, `slug`, `owner_id`, `parking_type_id`, `state_id`, `photos`, `status`, `address`, `ev_charing_slot`, `min_booking_duration`, `city`, `zip`, `lat`, `lang`, `created_at`, `updated_at`) VALUES
(1, 'Parking on New Bedford Road, LU3', 'parking-on-new-bedford-road-lu3-1', 1, 1, 1, 'uploads/parking_photo/1755874405641-287079516.webp,uploads/parking_photo/1755874405642-772790110.jpg,uploads/parking_photo/1755874405642-869513669.jpg,uploads/parking_photo/1755874405642-610952440.jpg,uploads/parking_photo/1755879672616-5016886.jpg,uploads/parking_photo/1755879672616-839311529.jpg,uploads/parking_photo/1755879672617-238710989.jpg', 'A', 'Alabama Shores, AL 35661, USA', 2, 60, 'Alabama Shores', '35661', '34.7964764', '-87.5525263', '2025-08-13 15:57:51', '2025-08-13 15:57:51'),
(2, 'Parking on Barford Rise, LU2', 'parking-on-barford-rise-lu2-2', 1, 1, 1, 'uploads/parking_photo/1755100856687-831354655.webp,uploads/parking_photo/1755100856694-318176191.webp,uploads/parking_photo/1755100856695-552676682.jpg,uploads/parking_photo/1755100856697-953319807.png', 'A', '224 Belcher Hill Rd, Gardendale, AL 35071, USA', 4, 60, 'Gardendale', '35071', '33.6784026', '-86.8255852', '2025-08-13 16:00:58', '2025-08-13 16:00:58'),
(3, 'Ibis London Luton Airport Car Park', 'ibis-london-luton-airport-car-park-3', 1, 1, 1, 'uploads/parking_photo/1755100972875-820887169.jpg,uploads/parking_photo/1755100974467-872959611.jpg,uploads/parking_photo/1755100974469-795028660.jpg,uploads/parking_photo/1755100974473-698159176.jpg,uploads/parking_photo/1755100974475-647162183.jpg', 'A', '224 Cambrian Ridge Trail, Pelham, AL 35124, USA', 1, 60, 'Pelham', '35124', '33.2970567', '-86.8010599', '2025-08-13 16:02:54', '2025-08-13 16:02:54'),
(4, 'Power Court Car Park - Short Stayk', 'power-court-car-park-short-stayk-4', 1, 2, 1, 'uploads/parking_photo/1755101092510-670275538.webp', 'A', '224 Treymoor Lake Cir, Alabaster, AL 35007, USA', 3, 60, 'Alabaster', '35007', '33.2455921', '-86.7935909', '2025-08-13 16:04:54', '2025-08-13 16:04:54'),
(5, 'test', 'test-5', 1, 1, 6, 'uploads/parking_photo/1755115267956-656707757.jpg', 'A', '123 S Figueroa St, Los Angeles, CA 90012, USA', 1, 60, 'Los Angeles', '90012', '34.0572792', '-118.252723', '2025-08-13 20:01:07', '2025-08-13 20:01:07'),
(6, 'suv', 'suv-6', 1, 1, 6, 'uploads/parking_photo/1755157750912-582937650.jpg', 'A', 'New York, NY, USA', 5, 60, 'New York', '1234567', '40.7127753', '-74.0059728', '2025-08-14 07:49:10', '2025-08-14 07:49:10'),
(7, 'suv', 'suv-7', 1, 1, 6, 'uploads/parking_photo/1755157766572-333199139.jpg', 'A', 'New York, NY, USA', 5, 60, 'New York', '1234567', '40.7127753', '-74.0059728', '2025-08-14 07:49:26', '2025-08-14 07:49:26'),
(8, 'suv', 'suv-8', 1, 1, 6, 'uploads/parking_photo/1755157784021-450778444.jpg', 'A', 'New York, NY, USA', 5, 60, 'New York', '1234567', '40.7127753', '-74.0059728', '2025-08-14 07:49:44', '2025-08-14 07:49:44'),
(9, 'suv', 'suv-9', 1, 1, 6, 'uploads/parking_photo/1755157862993-672351629.jpg', 'A', 'New York, NY, USA', 5, 60, 'New York', '07008', '40.7127753', '-74.0059728', '2025-08-14 07:51:03', '2025-08-14 07:51:03'),
(10, 'suv', 'suv-10', 1, 1, 6, 'uploads/parking_photo/1755157894829-871025334.jpg', 'A', 'New York, NY, USA', 5, 60, 'New York', '07008', '40.7127753', '-74.0059728', '2025-08-14 07:51:34', '2025-08-14 07:51:34'),
(11, 'Suv', 'suv-11', 1, 1, 6, 'uploads/parking_photo/1755158415704-982053174.jpg', 'A', 'New York, NY, USA', 10, 60, 'New York', '07008', '40.7127753', '-74.0059728', '2025-08-14 08:00:15', '2025-08-14 08:00:15'),
(12, 'Sedan', 'sedan-12', 5, 1, 51, 'uploads/parking_photo/1755167675327-298235656.jpg', 'A', 'New Orleans, LA, USA', 10, 60, 'New Orleans', '07086', '29.9508941', '-90.07583559999999', '2025-08-14 10:34:35', '2025-08-14 10:34:35'),
(13, 'test-2', 'test-2-13', 1, 1, 2, 'uploads/parking_photo/1755623638106-526428817.jpg,uploads/parking_photo/1755623638107-362688043.jpg', 'A', 'Alaska, WI 54216, USA', 3, 60, 'Alaska', '54216', '44.54056', '-87.50111', '2025-08-19 17:13:58', '2025-08-19 17:13:58'),
(14, 'Test5', 'test5-14', 1, 1, 6, 'uploads/parking_photo/1755634543630-101477816.jpg', 'A', '123 Main St, Los Angeles, CA 90012, USA', 1, 60, 'Los Angeles', '90012', '34.0519712', '-118.2438846', '2025-08-19 20:15:43', '2025-08-19 20:15:43'),
(15, 'Test5', 'test5-15', 1, 1, 6, 'uploads/parking_photo/1755634545408-199224395.jpg', 'A', '123 Main St, Los Angeles, CA 90012, USA', 1, 60, 'Los Angeles', '90012', '34.0519712', '-118.2438846', '2025-08-19 20:15:45', '2025-08-19 20:15:45'),
(16, 'Test5', 'test5-16', 1, 1, 6, 'uploads/parking_photo/1755634551746-400046272.jpg', 'A', '123 Main St, Los Angeles, CA 90012, USA', 1, 60, 'Los Angeles', '90012', '34.0519712', '-118.2438846', '2025-08-19 20:15:51', '2025-08-19 20:15:51');

-- --------------------------------------------------------

--
-- Table structure for table `parking_types`
--

CREATE TABLE `parking_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parking_types`
--

INSERT INTO `parking_types` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Covered Lot', '2025-08-08 09:49:01', '2025-08-08 09:49:01'),
(2, 'Open Lot', '2025-08-08 09:49:01', '2025-08-08 09:49:01');

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` int(11) NOT NULL,
  `code` char(2) NOT NULL DEFAULT '',
  `name` varchar(128) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'AL', 'Alabama', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(2, 'AK', 'Alaska', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(3, 'AS', 'American Samoa', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(4, 'AZ', 'Arizona', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(5, 'AR', 'Arkansas', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(6, 'CA', 'California', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(7, 'CO', 'Colorado', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(8, 'CT', 'Connecticut', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(9, 'DE', 'Delaware', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(10, 'DC', 'District of Columbia', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(11, 'FM', 'Federated States of Micronesia', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(12, 'FL', 'Florida', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(13, 'GA', 'Georgia', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(14, 'GU', 'Guam', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(15, 'HI', 'Hawaii', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(16, 'ID', 'Idaho', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(17, 'IL', 'Illinois', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(18, 'IN', 'Indiana', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(19, 'IA', 'Iowa', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(20, 'KS', 'Kansas', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(21, 'KY', 'Kentucky', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(22, 'LA', 'Louisiana', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(23, 'ME', 'Maine', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(24, 'MH', 'Marshall Islands', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(25, 'MD', 'Maryland', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(26, 'MA', 'Massachusetts', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(27, 'MI', 'Michigan', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(28, 'MN', 'Minnesota', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(29, 'MS', 'Mississippi', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(30, 'MO', 'Missouri', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(31, 'MT', 'Montana', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(32, 'NE', 'Nebraska', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(33, 'NV', 'Nevada', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(34, 'NH', 'New Hampshire', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(35, 'NJ', 'New Jersey', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(36, 'NM', 'New Mexico', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(37, 'NY', 'New York', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(38, 'NC', 'North Carolina', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(39, 'ND', 'North Dakota', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(40, 'MP', 'Northern Mariana Islands', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(41, 'OH', 'Ohio', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(42, 'OK', 'Oklahoma', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(43, 'OR', 'Oregon', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(44, 'PW', 'Palau', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(45, 'PA', 'Pennsylvania', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(46, 'PR', 'Puerto Rico', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(47, 'RI', 'Rhode Island', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(48, 'SC', 'South Carolina', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(49, 'SD', 'South Dakota', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(50, 'TN', 'Tennessee', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(51, 'TX', 'Texas', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(52, 'UT', 'Utah', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(53, 'VT', 'Vermont', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(54, 'VI', 'Virgin Islands', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(55, 'VA', 'Virginia', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(56, 'WA', 'Washington', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(57, 'WV', 'West Virginia', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(58, 'WI', 'Wisconsin', '2025-08-05 16:12:40', '2025-08-05 16:12:40'),
(59, 'WY', 'Wyoming', '2025-08-05 16:12:40', '2025-08-05 16:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_no` varchar(255) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `role` enum('A','O','U') NOT NULL COMMENT 'A=>Admin,O=>Owner,U=>User',
  `social_id` varchar(255) DEFAULT NULL,
  `stripe_account_id` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('A','I','D') NOT NULL DEFAULT 'A' COMMENT 'A=>Active,I=>Inactive,D=>Delete',
  `email_verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone_no`, `profile_photo`, `role`, `social_id`, `stripe_account_id`, `address`, `status`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(1, 'David', 'david@yopmail.com', '$2b$10$ww1zJLu5bPyDWfKMxlvR/OYpdNhXQBkVrLlEtFQbmEj58pWUb5YdG', '9733459251', 'uploads/profile_photo/1756135428861-583188444.jpg', 'O', NULL, NULL, 'test', 'A', '2025-08-10 05:47:09', '2025-08-04 11:35:10', '2025-08-04 11:35:10'),
(3, 'Karunadri', 'karunadri@yopmail.com', '$2b$10$0pD1m/apbsx5J6FUDO1Z6uqRFoUr6k7MNKwT56tMY5tbf3UZQsASa', '9775060874', NULL, 'U', NULL, NULL, NULL, 'A', '2025-08-10 13:15:28', '2025-08-10 13:15:28', '2025-08-10 13:15:28'),
(4, 'Sumon Acharya', 'depixi5254@bizmud.com', '$2b$10$PM148/ODnakFh79c94skneq8WxL/LwNMBFotGHXDjPUubxqV5Y/0W', '1234567890', NULL, 'U', NULL, NULL, NULL, 'A', '2025-08-14 08:04:10', '2025-08-14 08:04:10', '2025-08-14 08:04:10'),
(5, 'Huxup Peitono', 'huxuppeitono-5839@yopmail.com', '$2b$10$kofSTVO2S5zPuic6ua6hp.3/DZUqfHyIKUN6vmPqVJ0.XRx2a9qYK', '1324567890', NULL, 'O', NULL, NULL, NULL, 'A', '2025-08-14 08:04:10', '2025-08-14 08:11:01', '2025-08-14 08:11:01'),
(6, 'Sauddeb Reffeumu', 'sauddebreffeumu-5414@yopmail.com', '$2b$10$JeO4/B6pIQmtAtH9o9XyRe1s6fpMyyW0q4nfKGHcQFAUMbZyZMzxC', '1423456780', NULL, 'O', NULL, NULL, NULL, 'A', NULL, '2025-08-14 10:39:14', '2025-08-14 10:39:14'),
(7, 'Prasun', 'ehtwebaid@gmail.com', '$2b$10$XUt1nPAxKJyQSNGFssnChezgoi94hIaUZPq5U.NFJXlW0cNbhKiEu', '1234567898', NULL, 'U', NULL, NULL, NULL, 'A', NULL, '2025-10-29 18:25:42', '2025-10-29 18:25:42');

-- --------------------------------------------------------

--
-- Structure for view `parking_lists`
--
DROP TABLE IF EXISTS `parking_lists`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ebcb175_parking`@`localhost` SQL SECURITY DEFINER VIEW `parking_lists`  AS SELECT `PSPACE`.`id` AS `parking_space_id`, `PSPACE`.`title` AS `title`, `PSPACE`.`slug` AS `slug`, `PSPACE`.`parking_type_id` AS `parking_type_id`, `PSPACE`.`state_id` AS `state_id`, `PSLOT`.`start_time` AS `start_time`, `PSLOT`.`end_time` AS `end_time`, substring_index(`PSPACE`.`photos`,',',1) AS `photo`, `PSPACE`.`address` AS `address`, `PSPACE`.`city` AS `city`, `PSPACE`.`zip` AS `zip`, `PSPACE`.`lat` AS `lat`, `PSPACE`.`lang` AS `lang`, `PSLOT`.`twenty_four_service` AS `twenty_four_service`, `PSLOT`.`is_ev_charing` AS `is_ev_charing`, `PSLOT`.`per_hour_price` AS `per_hour_price`, `PSLOT`.`per_month_price` AS `per_month_price`, `PSLOT`.`ev_charging_price` AS `ev_charging_price`, `PSLOT`.`is_cc_tv` AS `is_cc_tv`, `PSPACE`.`status` AS `status`, `PSPACE`.`created_at` AS `created_at`, `ST`.`code` AS `state_code` FROM ((`parking_spaces` `PSPACE` join `parking_slots` `PSLOT` on(`PSPACE`.`id` = `PSLOT`.`parking_space_id`)) left join `states` `ST` on(`ST`.`id` = `PSPACE`.`state_id`)) WHERE `PSLOT`.`status` = 'A' AND `PSPACE`.`status` = 'A' ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billings`
--
ALTER TABLE `billings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `parking_slot_id` (`parking_slot_id`),
  ADD KEY `booking_start` (`booking_start`),
  ADD KEY `booking_end` (`booking_end`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `car_types`
--
ALTER TABLE `car_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `otp_type` (`otp_type`),
  ADD KEY `otp` (`otp`);

--
-- Indexes for table `parking_slots`
--
ALTER TABLE `parking_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parking_id` (`parking_space_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `parking_spaces`
--
ALTER TABLE `parking_spaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parking_type_id` (`parking_type_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `status` (`status`),
  ADD KEY `state_id` (`state_id`);

--
-- Indexes for table `parking_types`
--
ALTER TABLE `parking_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billings`
--
ALTER TABLE `billings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `car_types`
--
ALTER TABLE `car_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `company_settings`
--
ALTER TABLE `company_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `parking_slots`
--
ALTER TABLE `parking_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `parking_spaces`
--
ALTER TABLE `parking_spaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `parking_types`
--
ALTER TABLE `parking_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `states`
--
ALTER TABLE `states`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
