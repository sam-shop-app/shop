-- 用户购物车表
CREATE TABLE IF NOT EXISTS `user_carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为购物车表添加索引
CREATE INDEX `idx_user_carts_user_id` ON `user_carts` (`user_id`);
CREATE INDEX `idx_user_carts_product_id` ON `user_carts` (`product_id`);
CREATE INDEX `idx_user_carts_created_at` ON `user_carts` (`created_at`);