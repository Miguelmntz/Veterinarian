-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 02-05-2026 a las 14:32:21
-- Versión del servidor: 11.8.6-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u233628092_veterinaria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `appointments`
--

CREATE TABLE `appointments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `pet_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_time` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'scheduled',
  `type` varchar(255) NOT NULL DEFAULT 'consultation',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `appointments`
--

INSERT INTO `appointments` (`id`, `owner_id`, `pet_id`, `title`, `start_time`, `notes`, `status`, `type`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'Revisión', '2026-05-02 10:30:00', NULL, 'scheduled', 'consultation', '2026-04-30 09:50:30', '2026-04-30 09:50:30'),
(2, 1, 3, 'Castración', '2026-05-04 11:00:00', NULL, 'scheduled', 'surgery', '2026-04-30 09:56:02', '2026-04-30 09:56:02'),
(3, 3, 2, 'Certificado PPP', '2026-04-30 16:00:00', 'Solicitado desde portal web. Pendiente de confirmación del veterinario. Preferencia: Por la tarde', 'scheduled', 'consultation', '2026-04-30 10:25:35', '2026-04-30 11:53:34'),
(4, 5, 5, 'Revisión', '2026-05-10 12:00:00', 'Solicitado desde portal web. Pendiente de confirmación del veterinario. Preferencia: Me es indiferente la hora.', 'scheduled', 'consultation', '2026-05-01 09:51:09', '2026-05-01 16:14:44'),
(5, 3, 2, 'Dolor', '2026-05-14 12:00:00', 'Solicitado desde portal web. Pendiente de confirmación del veterinario. Preferencia: Me es indiferente la hora.', 'scheduled', 'consultation', '2026-05-02 11:44:12', '2026-05-02 12:06:13'),
(6, 3, 2, 'dolor', '2026-05-14 16:00:00', 'Solicitado desde portal web. Pendiente de confirmación del veterinario. Preferencia: Por la tarde.', 'cancelled', 'consultation', '2026-05-02 11:47:28', '2026-05-02 12:09:05'),
(7, 3, 2, 'fractura', '2026-05-13 16:00:00', 'Solicitado desde portal web. Pendiente de confirmación del veterinario. Preferencia: Por la tarde.', 'scheduled', 'consultation', '2026-05-02 11:54:47', '2026-05-02 11:55:56'),
(8, 3, 2, 'Vacuna', '2026-05-08 13:45:00', NULL, 'scheduled', 'vaccination', '2026-05-02 12:08:05', '2026-05-02 12:08:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medical_records`
--

CREATE TABLE `medical_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pet_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `symptom_title` varchar(255) NOT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `attachment_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medical_records`
--

INSERT INTO `medical_records` (`id`, `pet_id`, `product_id`, `symptom_title`, `diagnosis`, `treatment`, `attachment_path`, `attachment_type`, `created_at`, `updated_at`) VALUES
(2, 2, 4, 'Bulto', 'Drenaje glándula salival', 'Reposo', 'medical_attachments/eVegZWfyGUYuD9CL3DPXs9byAAISgmeT4c1d1kF9.webp', 'image/png', '2026-04-29 11:14:51', '2026-04-29 11:14:51'),
(3, 1, 2, 'Perro delgado', 'el perro llega a la clínica bastante delgado', 'complemento alimentario', 'medical_attachments/g97OunmVZo6Bi19XRZeemGYPbF2Gz3gWFzHACMXA.webp', 'image/webp', '2026-04-29 11:21:59', '2026-04-29 11:21:59'),
(4, 2, 9, 'Consulta de la cita: Certificado PPP', 'Obtiene el certificado correspondiente', NULL, 'medical_attachments/BJrjbeQdt39Qbz3yxdNPAQUKVeiJ8P3Iswy84xr9.webp', 'image/webp', '2026-04-30 10:35:30', '2026-04-30 10:35:30'),
(5, 2, 4, 'Consulta de la cita: dolor', 'consulta realizada', 'Reposo 24h', 'medical_attachments/ppGdVqN425mnexbn5kAVBHqnYD5rAEBjQlJjJZKg.webp', 'image/jpeg', '2026-05-02 11:59:29', '2026-05-02 11:59:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_03_085745_create_owners_table', 1),
(5, '2026_03_03_085904_create_pets_table', 1),
(6, '2026_03_03_114022_create_personal_access_tokens_table', 1),
(7, '2026_03_24_100200_create_appointments_table', 1),
(8, '2026_03_24_170000_create_medical_records_table', 1),
(9, '2026_03_24_171500_create_products_table', 1),
(10, '2026_03_24_172500_add_product_id_to_medical_records_table', 1),
(11, '2026_04_09_084208_remove_end_time_from_appointments_table', 1),
(12, '2026_04_09_084209_add_photo_path_to_pets_table', 1),
(13, '2026_04_09_094605_add_role_to_users_table', 1),
(14, '2026_04_14_091543_update_status_enum_in_appointments_table', 1),
(15, '2026_04_23_095037_add_google_fields_to_users_table', 1),
(16, '2026_04_27_000000_update_user_roles_to_spanish', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `owners`
--

CREATE TABLE `owners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `owners`
--

INSERT INTO `owners` (`id`, `name`, `email`, `telefono`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 'Sara', 'cliente@gmail.com', '600123456', 'Calle Demo 123', '2026-04-27 14:22:21', '2026-04-29 10:21:04'),
(2, 'Miguel', 'prueba2@gmail.com', '678220482', 'Calle Pasaje 2', '2026-04-27 14:24:06', '2026-04-27 14:24:06'),
(3, 'Miguel martin', 'maartinn2002@gmail.com', '674382918', 'calle falsa 2', '2026-04-29 10:15:52', '2026-04-29 10:15:52'),
(4, 'Martin Martin Luque', 'rafayamiguel@gmail.con', '637578517', 'Calle Paseo de San Luis nº3', '2026-04-30 08:06:42', '2026-04-30 08:08:40'),
(5, 'Juan Antonio Rodríguez-Belza García', 'jurobega2@gmail.com', '645518286', 'C/Sierro 5 4A', '2026-05-01 09:49:37', '2026-05-02 12:02:24'),
(6, 'Manuel', 'manuel@gmail.com', '123456789', 'falsa', '2026-05-02 11:50:23', '2026-05-02 11:50:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(2, 'App\\Models\\User', 1, 'auth_token', 'd04181f910ad2f351d8d8d75c9d4c200ed8a5b9894f7cd50e4379de54fa25940', '[\"*\"]', NULL, NULL, '2026-04-27 19:25:42', '2026-04-27 19:25:42'),
(5, 'App\\Models\\User', 4, 'auth_token', '5e0cacae94c461c0be331768813588258f566a0e13889e42eb9ce374671ad282', '[\"*\"]', NULL, NULL, '2026-04-29 09:13:00', '2026-04-29 09:13:00'),
(17, 'App\\Models\\User', 5, 'auth_token', '1d2eb8c2bf6ae24e346b9cf089f4f3265309698eee3258f38410b8b88b527c35', '[\"*\"]', '2026-04-30 10:43:10', NULL, '2026-04-30 10:36:25', '2026-04-30 10:43:10'),
(33, 'App\\Models\\User', 2, 'auth_token', 'f83eab3ee0d0b7c1ecf6efbd20f2305ea36fb50ca18e9ac7b70292246b9d53fc', '[\"*\"]', NULL, NULL, '2026-05-02 12:12:05', '2026-05-02 12:12:05');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pets`
--

CREATE TABLE `pets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `species` varchar(255) NOT NULL,
  `raza` varchar(255) NOT NULL,
  `peso` double NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `fech_nac` date NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `pets`
--

INSERT INTO `pets` (`id`, `name`, `species`, `raza`, `peso`, `photo_path`, `fech_nac`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Toby', 'Perro', 'Mezcla', 20, 'pets/SjaXSnkS9BVGYPoXHtD9ikk3k7vj48Orj0XjCMce.jpg', '2025-05-25', 2, '2026-04-27 14:24:06', '2026-04-30 11:50:03'),
(2, 'Kira', 'Perro', 'Cruce', 13, 'pets/MG76Q8F7qcwRCxANeZzQy7Dfai1EMuALI8V4fSdD.webp', '2016-05-14', 3, '2026-04-29 10:15:53', '2026-05-02 12:02:11'),
(3, 'Garfield', 'Gato', 'Egipcio', 14, 'pets/W9eDQe4UX53YUr2ZfR2oHcaY16ZfF0W8BuHe8EaM.webp', '2023-07-08', 1, '2026-04-29 10:19:39', '2026-05-02 11:52:27'),
(4, 'Zeus', 'Perro', 'Español Bretón', 22, NULL, '2018-07-12', 4, '2026-04-30 08:06:42', '2026-04-30 08:08:36'),
(5, 'Curro', 'Exótico', 'Caballo', 120, NULL, '2002-07-12', 5, '2026-05-01 09:49:37', '2026-05-01 09:57:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `min_stock_alert` int(11) NOT NULL DEFAULT 5,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock_quantity`, `min_stock_alert`, `created_at`, `updated_at`) VALUES
(1, 'Wepharm WeHemo', 'WeHemo es un suplemento rico en vitaminas, minerales y aminoácidos. Contribuye a la formación, el mantenimiento y la protección de las células sanguíneas. También apoya el crecimiento y desarrollo de tu mascota.', 28.75, 99, 5, '2026-04-27 14:27:21', '2026-04-27 14:53:14'),
(2, 'Protexin Pro-Kolin Advanced', 'Pro-Kolin Advanced es un complemento alimenticio para animales. Es una pasta sabrosa con prebióticos y propiedades absorbentes y suavizantes. Puede administrarse para ayudar al funcionamiento del sistema digestivo.', 26.50, 29, 5, '2026-04-27 14:27:55', '2026-04-29 11:21:59'),
(3, 'Organimal Pulgas y Garrapatas - Perro', 'Organimal Pulgas y Garrapatas contiene ingredientes naturales y se puede usar contra pulgas, garrapatas y piojos en tu perro. No contiene aditivos químicos ni sustancias tóxicas, por lo que es seguro de usar.', 13.15, 54, 5, '2026-04-27 14:28:37', '2026-04-27 14:28:37'),
(4, 'Frontline Tri-Act', 'Frontline Tri-Act para perros protege contra pulgas y garrapatas y también tiene un efecto repelente contra mosquitos, moscas de la arena y moscas de los establos. Las pipetas son fáciles de aplicar en la piel, asegurando que tu perro esté protegido de manera rápida y efectiva.', 30.25, 84, 5, '2026-04-27 14:29:06', '2026-05-02 11:59:29'),
(5, 'Vacuna LEISHMANIA LetiFend', NULL, 85.00, 45, 5, '2026-04-27 14:29:53', '2026-04-27 14:29:53'),
(6, 'Vacuna polivalente', NULL, 30.00, 43, 5, '2026-04-27 14:30:06', '2026-04-27 14:30:06'),
(7, 'Microchip+alta en RAIA+rabia+pasaporte', NULL, 70.00, 25, 5, '2026-04-27 14:30:23', '2026-04-27 14:30:23'),
(8, 'Vacuna rabia', NULL, 28.00, 49, 5, '2026-04-27 14:30:39', '2026-04-27 14:30:39'),
(9, 'Certificado Veterinario para PPP', 'perros potencialmente peligrosos', 25.00, 14, 5, '2026-04-27 14:31:08', '2026-04-30 10:35:30'),
(10, 'Certificado de salud CEXGAN', 'para viajes a terceros países', 120.00, 40, 5, '2026-04-27 14:31:25', '2026-04-27 14:31:25'),
(11, 'Anestesia General', 'Dormir a la mascota de forma completa', 100.00, 3, 5, '2026-04-30 11:13:40', '2026-04-30 11:14:16'),
(12, 'Antibiótico', 'Antibiotico ejemplo', 35.00, 7, 7, '2026-05-02 12:04:45', '2026-05-02 12:04:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'recepcionista',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `google_id`, `avatar`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Martín (Veterinario)', 'admin@veterinario.com', NULL, NULL, NULL, '$2y$12$R0qtxtGgBUdV6.97JCxT7OraKjhwKIwzYnZ3xG1FS6Z36UTrh8afO', 'veterinario', NULL, '2026-04-27 14:22:20', '2026-04-27 14:22:20'),
(2, 'Ana (Recepción)', 'recepcion@veterinario.com', NULL, NULL, NULL, '$2y$12$CiUPa9iofi/DlarQh7Wd6.aeGHrvXcYzq39mfnAMnh7DhVh5HqwQe', 'recepcionista', NULL, '2026-04-27 14:22:21', '2026-04-27 14:22:21'),
(3, 'Sara (Dueña de prueba)', 'cliente@gmail.com', NULL, NULL, NULL, '$2y$12$fhXgvCYjOW.C3bldCvLMvuFSN.BS4HwK10N.J0ZCxWimZHw.0Al2O', 'client', NULL, '2026-04-27 14:22:21', '2026-04-27 14:22:21'),
(4, 'Miguel', 'prueba2@gmail.com', NULL, NULL, NULL, '$2y$12$gc9yarumtx9vd.uICWRs/.wvaxgUXPArIphWtBlajkcPzDZvYjVUu', 'client', NULL, '2026-04-27 14:24:06', '2026-04-27 14:24:06'),
(5, 'Miguel martin', 'maartinn2002@gmail.com', '107205261097943550493', 'https://lh3.googleusercontent.com/a/ACg8ocKEJdb7ABfpKc-TFNAsyLgTAzSdYFmkYy5pjETJ18ZDNMkrGx8=s96-c', NULL, NULL, 'client', NULL, '2026-04-29 10:15:07', '2026-04-29 10:15:07'),
(6, 'Miguel MM', 'rafayamiguel@gmail.com', '109552976764548894773', 'https://lh3.googleusercontent.com/a/ACg8ocJsjq8kJvt5Ap2sJ7TDrJtXO0IuT9eDUz8tFAcmqmgVM-GvrA=s96-c', NULL, NULL, 'client', NULL, '2026-04-29 10:16:11', '2026-04-29 10:16:11'),
(7, 'Juan Pérez', 'juanperez@gmail.com', NULL, NULL, NULL, '$2y$12$cyRM0hpuVsk0Go8fB6jgp.aGsQ52HoPmLSEMrm6YsjfgfCIC58UzG', 'asistente', NULL, '2026-04-29 10:21:42', '2026-04-29 10:21:42'),
(8, 'Juan Antonio Rodríguez-Belza García', 'jurobega2@gmail.com', '114169859195313527826', 'https://lh3.googleusercontent.com/a/ACg8ocKNJ3jnPnysgrdKJb8kBPReESJMJyvkRIPsnYQkRXbfuYSgBQ=s96-c', NULL, NULL, 'client', NULL, '2026-05-01 09:47:44', '2026-05-01 09:47:44'),
(10, 'Manuel', 'manuel@gmail.com', NULL, NULL, NULL, '$2y$12$Wc6YvNlvWoLIQtKb6lSLnuE.oJa8U6rgwCCo7aMZIynu3kItDJpg.', 'client', NULL, '2026-05-02 11:50:23', '2026-05-02 11:50:23'),
(11, 'Pedro', 'pedro@gmail.com', NULL, NULL, NULL, '$2y$12$kWkvI7F3c6qEsgDp.T8ZM.OuPEmYU/IU3thHoW1xD0056L.kNul56', 'asistente', NULL, '2026-05-02 11:58:19', '2026-05-02 11:58:19');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointments_owner_id_foreign` (`owner_id`),
  ADD KEY `appointments_pet_id_foreign` (`pet_id`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_records_pet_id_foreign` (`pet_id`),
  ADD KEY `medical_records_product_id_foreign` (`product_id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `owners`
--
ALTER TABLE `owners`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indices de la tabla `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pets_owner_id_foreign` (`owner_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_google_id_unique` (`google_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `owners`
--
ALTER TABLE `owners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `pets`
--
ALTER TABLE `pets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_pet_id_foreign` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `medical_records_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `pets_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
