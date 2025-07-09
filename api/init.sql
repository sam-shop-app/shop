-- 如果已存在名为 `products` 的表，则先删除，方便脚本重复执行
DROP TABLE IF EXISTS `products`;

-- 创建 `products` 表，并为每个字段添加注释
CREATE TABLE `products` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '自增ID，主键',
  `spu_id` VARCHAR(50) NOT NULL COMMENT '商品SPU ID，来自山姆API',
  `store_id` VARCHAR(50) NOT NULL COMMENT '店铺ID，同一商品可能在不同店铺有不同状态',
  `title` VARCHAR(255) DEFAULT NULL COMMENT '商品主标题',
  `sub_title` TEXT DEFAULT NULL COMMENT '商品副标题或描述',
  `image_url` VARCHAR(512) DEFAULT NULL COMMENT '商品主图的链接',
  `price` VARCHAR(20) DEFAULT NULL COMMENT '商品价格，以字符串形式存储API原始值 (例如 ''4280'')',
  `stock_quantity` INT DEFAULT NULL COMMENT '商品的库存数量',
  `is_available` BOOLEAN DEFAULT NULL COMMENT '布尔值，表示商品当前是否可售',
  `is_import` BOOLEAN DEFAULT NULL COMMENT '布尔值，表示是否为进口商品',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '行数据更新时间戳，在更新时会自动刷新',

  -- 设置 `id` 字段为主键
  PRIMARY KEY (`id`),

  -- 为 `spu_id` 和 `store_id` 的组合创建唯一键，确保没有重复的商品-店铺记录。
  -- 这是实现 "INSERT ... ON DUPLICATE KEY UPDATE" 功能的基础。
  UNIQUE KEY `uniq_spu_store` (`spu_id`,`store_id`)

)
-- 设置表的存储引擎和字符集，并添加表级别的注释
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='山姆商品信息表，用于存储从HAR文件解析的数据';

-- 如果已存在名为 `users` 的表，则先删除，方便脚本重复执行
DROP TABLE IF EXISTS `users`;

-- 创建 `users` 表，并为每个字段添加注释
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '自增ID，主键',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名，用于登录，长度限制50个字符',
  `email` VARCHAR(100) NOT NULL COMMENT '用户邮箱，用于登录和接收通知，长度限制100个字符',
  `password` VARCHAR(255) NOT NULL COMMENT '用户密码',
  `full_name` VARCHAR(100) DEFAULT NULL COMMENT '用户真实姓名',
  `avatar_url` VARCHAR(512) DEFAULT NULL COMMENT '用户头像图片的链接',
  `phone_number` VARCHAR(20) DEFAULT NULL COMMENT '用户手机号码',
  `role` VARCHAR(20) NOT NULL DEFAULT 'client' COMMENT '用户角色 (client: 客户端用户, admin: 后台用户)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '用户状态 (1: 活跃, 0: 禁用, 2: 待验证)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '行数据创建时间戳',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '行数据更新时间戳，在更新时会自动刷新',

  -- 设置 `id` 字段为主键
  PRIMARY KEY (`id`),

  -- 为 `username` 和 `email` 分别创建唯一索引，确保其唯一性，加速查询
  UNIQUE KEY `uniq_username` (`username`),
  UNIQUE KEY `uniq_email` (`email`)

)
-- 设置表的存储引擎和字符集，并添加表级别的注释
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COMMENT='用户信息表，存储用户的基本信息';
