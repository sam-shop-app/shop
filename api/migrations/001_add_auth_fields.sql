-- 为用户表添加新字段以支持多种登录方式
ALTER TABLE `users` 
  ADD COLUMN `phone_verified` BOOLEAN DEFAULT FALSE COMMENT '手机号是否已验证',
  ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE COMMENT '邮箱是否已验证',
  ADD COLUMN `verification_code` VARCHAR(6) DEFAULT NULL COMMENT '验证码',
  ADD COLUMN `verification_code_expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT '验证码过期时间',
  ADD COLUMN `wechat_openid` VARCHAR(128) DEFAULT NULL COMMENT '微信openid',
  ADD COLUMN `wechat_unionid` VARCHAR(128) DEFAULT NULL COMMENT '微信unionid',
  ADD COLUMN `last_login_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  ADD COLUMN `login_method` VARCHAR(20) DEFAULT 'password' COMMENT '最后登录方式: password, phone, email, wechat',
  ADD INDEX `idx_wechat_openid` (`wechat_openid`),
  ADD INDEX `idx_wechat_unionid` (`wechat_unionid`),
  ADD INDEX `idx_phone_number` (`phone_number`);

-- 修改手机号字段为必填
ALTER TABLE `users` 
  MODIFY COLUMN `phone_number` VARCHAR(20) NOT NULL COMMENT '用户手机号码（必填）';

-- 创建验证码发送记录表
CREATE TABLE IF NOT EXISTS `verification_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `recipient` VARCHAR(100) NOT NULL COMMENT '接收方（手机号或邮箱）',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: phone, email',
  `purpose` VARCHAR(20) NOT NULL COMMENT '用途: login, register, reset_password',
  `code` VARCHAR(6) NOT NULL COMMENT '验证码',
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  `used` BOOLEAN DEFAULT FALSE COMMENT '是否已使用',
  `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT '请求IP地址',
  PRIMARY KEY (`id`),
  INDEX `idx_recipient_type` (`recipient`, `type`),
  INDEX `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证码发送记录表';

-- 创建用户登录日志表
CREATE TABLE IF NOT EXISTS `user_login_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `login_method` VARCHAR(20) NOT NULL COMMENT '登录方式: password, phone, email, wechat',
  `login_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT '登录IP地址',
  `user_agent` TEXT DEFAULT NULL COMMENT '用户代理信息',
  `success` BOOLEAN DEFAULT TRUE COMMENT '是否登录成功',
  `failure_reason` VARCHAR(100) DEFAULT NULL COMMENT '失败原因',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_login_at` (`login_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户登录日志表';