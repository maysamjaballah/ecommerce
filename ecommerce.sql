-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 05 avr. 2026 à 20:44
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecommerce`
--

-- --------------------------------------------------------

--
-- Structure de la table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Électronique', 'Téléphones, ordinateurs, gadgets', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(2, 'Vêtements', 'Mode homme, femme, enfant', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(3, 'Alimentation', 'Produits alimentaires et boissons', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(4, 'Maison & Jardin', 'Mobilier, décoration, jardinage', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(5, 'Sports', 'Équipements et vêtements de sport', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(6, 'Beauté & Santé', 'Cosmétiques, pharmacie, bien-être', '2026-03-10 17:32:50', '2026-03-10 17:32:50'),
(7, 'Chaussures', NULL, '2026-03-29 16:03:09', '2026-03-29 16:03:09');

-- --------------------------------------------------------

--
-- Structure de la table `enterprises`
--

CREATE TABLE `enterprises` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enterprises`
--

INSERT INTO `enterprises` (`id`, `user_id`, `category_id`, `name`, `description`, `image`, `created_at`, `updated_at`) VALUES
(2, 11, 6, 'ADC • Autour Du Cou', 'Making jewelry and love', '1773878457160-6637951.jpg', '2026-03-19 01:00:57', '2026-03-19 01:00:57'),
(3, 13, 2, 'Highlighter tn', NULL, '1774789996674-713324561.png', '2026-03-29 14:13:16', '2026-03-29 14:13:16'),
(8, 14, 7, 'Catchy_99', NULL, '1775042469467-468248529.png', '2026-04-01 12:21:09', '2026-04-01 12:21:09');

-- --------------------------------------------------------

--
-- Structure de la table `enterprise_categories`
--

CREATE TABLE `enterprise_categories` (
  `enterprise_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `enterprise_categories`
--

INSERT INTO `enterprise_categories` (`enterprise_id`, `category_id`) VALUES
(2, 6),
(3, 2),
(3, 5),
(8, 5),
(8, 7);

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `address` varchar(500) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total`, `status`, `address`, `phone`, `notes`, `created_at`, `updated_at`) VALUES
(3, 12, 95.00, 'processing', 'kljl,jl', '+216 27018080', 'kjj', '2026-03-19 01:15:05', '2026-03-19 01:15:05'),
(4, 12, 170.00, 'processing', 'nnnnnn', '+216 55 888 88', NULL, '2026-03-24 23:15:13', '2026-03-24 23:15:13');

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(3, 3, 10, 1, 60.00, '2026-03-19 01:15:05'),
(4, 3, 4, 1, 35.00, '2026-03-19 01:15:05'),
(5, 4, 10, 1, 60.00, '2026-03-24 23:15:13'),
(6, 4, 7, 1, 20.00, '2026-03-24 23:15:13'),
(7, 4, 2, 1, 90.00, '2026-03-24 23:15:13');

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `enterprise_id` int(10) UNSIGNED NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `enterprise_id`, `category_id`, `name`, `description`, `image`, `price`, `stock`, `created_at`, `updated_at`) VALUES
(2, 2, 6, 'Braclets', NULL, '1773878562862-46027380.png', 90.00, 9, '2026-03-19 01:02:42', '2026-04-01 12:09:36'),
(4, 2, 6, 'Braclet', NULL, '1773878659904-876176214.png', 35.00, 9, '2026-03-19 01:04:19', '2026-04-01 12:09:36'),
(5, 2, 6, 'Collier', NULL, '1773878699945-254678790.png', 40.00, 10, '2026-03-19 01:04:59', '2026-04-01 12:09:36'),
(6, 2, 6, 'Manchette', NULL, '1773878729806-239995552.png', 35.00, 10, '2026-03-19 01:05:29', '2026-04-01 12:09:36'),
(7, 2, 6, 'Boucles d\'oreilles', NULL, '1773878803423-565104714.png', 20.00, 9, '2026-03-19 01:06:43', '2026-04-01 12:09:36'),
(8, 2, 6, 'Braclet', NULL, '1773878829824-946589038.png', 35.00, 10, '2026-03-19 01:07:09', '2026-04-01 12:09:36'),
(9, 2, 6, 'Boucles d\'oreilles', NULL, '1773878859428-538524141.png', 20.00, 10, '2026-03-19 01:07:39', '2026-04-01 12:09:36'),
(10, 2, 6, 'Braclets', NULL, '1773878898943-393731966.png', 60.00, 8, '2026-03-19 01:08:18', '2026-04-01 12:09:36'),
(11, 2, 6, 'Collier', NULL, '1773879479322-349309171.png', 39.81, 0, '2026-03-19 01:17:59', '2026-04-01 12:09:36'),
(12, 3, 2, 'Set majorette', NULL, '1774790096234-564260370.png', 80.00, 15, '2026-03-29 14:14:56', '2026-04-01 12:09:36'),
(13, 3, 2, 'Set', NULL, '1774790137921-586042367.png', 94.83, 15, '2026-03-29 14:15:37', '2026-04-01 12:09:36'),
(14, 3, 2, 'Set Djean', NULL, '1774790369099-740570871.png', 130.00, 15, '2026-03-29 14:19:29', '2026-04-01 12:09:36'),
(15, 3, 2, 'Pull', NULL, '1774790408670-645642705.png', 35.00, 20, '2026-03-29 14:20:08', '2026-04-01 12:09:36'),
(16, 3, 2, 'Veste', 'modèle Fairy Grunge', '1774790527470-34917362.png', 95.00, 15, '2026-03-29 14:22:07', '2026-04-01 12:09:36'),
(17, 3, 2, 'Manteau Court', NULL, '1774790698511-849616343.png', 70.00, 15, '2026-03-29 14:24:58', '2026-04-01 12:09:36'),
(18, 3, 2, 'Pull', NULL, '1774790750310-948741453.png', 35.00, 20, '2026-03-29 14:25:50', '2026-04-01 12:09:36'),
(19, 3, 5, 'Tenue sport', NULL, '1775040492348-840857905.png', 84.98, 15, '2026-04-01 11:48:12', '2026-04-01 12:13:09'),
(20, 3, 5, 'Tenue', NULL, '1775040524308-711227996.png', 85.00, 15, '2026-04-01 11:48:44', '2026-04-01 12:14:12'),
(21, 3, 5, 'Tenue', NULL, '1775040547380-828258003.png', 85.00, 15, '2026-04-01 11:49:07', '2026-04-01 12:14:12'),
(22, 8, 7, 'Puma', 'LaMelo Ball LaFrance Alpine', '1775158930100-300478923.png', 150.00, 20, '2026-04-02 20:42:10', '2026-04-02 20:42:10'),
(23, 8, 7, 'Puma', 'Suede', '1775159030402-918402106.png', 199.00, 20, '2026-04-02 20:43:50', '2026-04-02 20:43:50'),
(24, 8, 7, 'Nike ', 'Air Force 1', '1775159159187-851925789.png', 210.00, 30, '2026-04-02 20:45:59', '2026-04-02 20:45:59'),
(25, 8, 7, 'Adidas ', 'Handball Spezial', '1775164900171-75845909.png', 250.00, 30, '2026-04-02 22:21:40', '2026-04-02 22:21:40'),
(29, 8, 7, 'konjll', NULL, '1775165777912-580731101.png', 112.00, 22, '2026-04-02 22:36:17', '2026-04-02 22:36:17');

-- --------------------------------------------------------

--
-- Structure de la table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `color_name` varchar(50) NOT NULL,
  `color_hex` varchar(7) NOT NULL DEFAULT '#000000',
  `image` varchar(255) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `color_name`, `color_hex`, `image`, `stock`) VALUES
(25, 25, 'Rouge', '#EF4444', NULL, 20),
(26, 25, 'Noir', '#000000', NULL, 20),
(27, 25, 'Gris', '#6B7280', NULL, 20),
(28, 25, 'Vert', '#22C55E', NULL, 20),
(29, 25, 'Rose', '#EC4899', NULL, 20),
(30, 25, 'Marron', '#92400E', NULL, 20),
(38, 29, 'Rouge', '#EF4444', NULL, 0);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('client','seller','admin') NOT NULL DEFAULT 'client',
  `email_verified_at` datetime DEFAULT NULL,
  `verify_token` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `email_verified_at`, `verify_token`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@ecommerce.com', '$2a$12$iMBHsjQBCmB4kZd1.mcxwuyF8iDKr8BVYxhL3/7MUFOzSyl10WPuy', 'admin', '2026-03-10 17:32:50', NULL, NULL, '2026-03-10 17:32:50', '2026-03-19 00:41:38'),
(11, 'seller', 'seller@exemple.com', '$2a$12$iAzvtG8muqBTYEbOSHZfg.wpLVl2opKsmKyww/fNk80Gqz9IZk.8C', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-19 00:12:15', '2026-03-29 14:04:44'),
(12, 'client', 'client@exemple.com', '$2a$12$p/NdGpx2.zCQSEa82tC43OXNjd2LGYKoE2QFbQSLS95JTewo2Lhue', 'client', '2026-03-19 00:12:15', NULL, NULL, '2026-03-19 00:12:15', '2026-03-27 15:14:33'),
(13, 'Seller 1', 'seller1@example.com', '$2a$12$V3Dddsxed5/ahjNLp.Lx9O68638f3jXTHkCs26EfBHgHEmD2CBGi.', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(14, 'Seller 2', 'seller2@example.com', '$2a$12$Kjqpw3OjHEjW0heA.x8wa.nKcWQeulQF2J9CUqUTMaBOgnyAgzcQW', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(15, 'Seller 3', 'seller3@example.com', '$2a$12$zEw9OcLmL7zlsFGfM8lFc.FIKdgYU6wfzgsqsFtUbzrGBukgkB022', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(16, 'Seller 4', 'seller4@example.com', '$2a$12$npzFNvIvtl1wEv6f8Pydru4wXPaH1pI2oV89YhPiPG.PNXPi86h52', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(17, 'Seller 5', 'seller5@example.com', '$2a$12$qwgpMSSoTJMNAWopuXeCROzPtRSHiAI5wFZHtm5bE.Cpr9RoDsELi', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(18, 'Seller 6', 'seller6@example.com', '$2a$12$fnEPfWwPm1KV.wDx2fMgAO1Vk4UiydkyYu/hr4Y0TbO3DZKpU.nXG', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(19, 'Seller 7', 'seller7@example.com', '$2a$12$qWU7wVd4hmmSpmFoRoLVgertoje4qh6scxDC9vJOfzNhGozZDNZMe', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(20, 'Seller 8', 'seller8@example.com', '$2a$12$Pqt2XIGqluYnrgBxGLM3D.fGAsyKckDhORhYN04ofLa5MkGFA2UGW', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(21, 'Seller 9', 'seller9@example.com', '$2a$12$NA/uMbvYSTahRj8o42coCum3J0MzDTvkfRbPX.SfX28D4LX9ghley', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44'),
(22, 'Seller 10', 'seller10@example.com', '$2a$12$KHkn1Kr8Lo20K3jeykpWP.6M.TFNEbGxL6FnRD6nV8mT14.8wLgV6', 'seller', '2026-03-29 14:04:44', NULL, NULL, '2026-03-27 14:46:10', '2026-03-29 14:04:44');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `enterprises`
--
ALTER TABLE `enterprises`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `enterprise_categories`
--
ALTER TABLE `enterprise_categories`
  ADD PRIMARY KEY (`enterprise_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_ibfk_1` (`enterprise_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Index pour la table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `enterprises`
--
ALTER TABLE `enterprises`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `enterprises`
--
ALTER TABLE `enterprises`
  ADD CONSTRAINT `enterprises_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enterprises_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Contraintes pour la table `enterprise_categories`
--
ALTER TABLE `enterprise_categories`
  ADD CONSTRAINT `enterprise_categories_ibfk_1` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enterprise_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`enterprise_id`) REFERENCES `enterprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
