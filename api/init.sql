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

-- 山姆商品分类体系表
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` VARCHAR(50) NOT NULL COMMENT '分类ID (groupingId)',
  `parent_id` VARCHAR(50) DEFAULT NULL COMMENT '父分类ID，一级分类的此字段为NULL',
  `name` VARCHAR(255) NOT NULL COMMENT '分类名称 (title)',
  `level` INT NOT NULL COMMENT '分类层级',
  `image_url` VARCHAR(512) DEFAULT NULL,
  `sort_order` INT DEFAULT 0 COMMENT '排序值，根据在数组中的位置生成',
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类信息表';

-- 商品分类数据 (插入或更新)
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156048', NULL, '乳品烘焙', 1, 'https://img.samsclub.cn/pc/sams/upload/20220905/1662364273891.png', 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('34112', NULL, '休闲零食', 1, 'https://img.samsclub.cn/pc/sams/upload/20220905/1662364234033.png', 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156049', NULL, '酒水饮料', 1, 'https://img.samsclub.cn/pc/sams/upload/20220905/1662364264627.png', 2) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156050', NULL, '冷藏冻品', 1, 'https://img.samsclub.cn/pc/sams/upload/20220905/1662364283186.png', 3) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156051', NULL, '时令生鲜', 1, 'https://img.samsclub.cn/pc/sams/upload/20220905/1662364292150.png', 4) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('202000', '156050', '为您推荐', 2, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('275049', '156050', '新品上市', 2, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('157072', '156050', '冰淇淋', 2, NULL, 2) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156056', '156050', '快手菜', 2, NULL, 3) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('336016', '156050', '速食肉制品', 2, NULL, 4) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('333021', '156050', '香肠/火腿', 2, NULL, 5) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('181217', '156050', '熟食/餐吧', 2, NULL, 6) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156055', '156050', '佐餐速食', 2, NULL, 7) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('158056', '156050', '火锅丸滑', 2, NULL, 8) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('181400', '156050', '冷冻面点', 2, NULL, 9) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('158069', '156050', '冷冻果蔬', 2, NULL, 10) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('155052', '156050', '冷冻肉禽', 2, NULL, 11) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('158057', '156050', '冷冻水产', 2, NULL, 12) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('276048', '275049', '新品上市', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('158066', '157072', '冰淇淋', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('180355', '156056', '快手菜', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('333022', '336016', '烤物', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('335020', '336016', '炸物', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('334016', '336016', '汉堡/三明治', 3, NULL, 2) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('335019', '333021', '香肠', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('334015', '333021', '火腿', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('264006', '181217', '预制调理菜', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('180173', '181217', '爆款熟食', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('181257', '181217', '轻食沙拉', 3, NULL, 2) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156066', '156055', '佐餐小菜', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('157079', '158056', '火锅丸滑', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('208028', '181400', '饺子/馄饨', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('183415', '181400', '面点/小吃', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('157082', '158069', '速冻果蔬', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('155062', '155052', '牛/羊肉', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156064', '155052', '禽类', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('158067', '158057', '鱼类', 3, NULL, 0) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('157081', '158057', '虾', 3, NULL, 1) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('156065', '158057', '蟹/贝/海参', 3, NULL, 2) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('155061', '158057', '其他海鲜', 3, NULL, 3) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);
