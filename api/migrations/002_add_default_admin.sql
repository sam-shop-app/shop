-- 添加默认管理员用户
-- 注意：默认密码是 'admin'，首次登录后请立即修改密码
-- bcrypt 哈希值对应密码 'admin' (10 rounds)

INSERT INTO `users` (
  `username`,
  `email`,
  `password`,
  `phone_number`,
  `full_name`,
  `role`,
  `status`,
  `phone_verified`,
  `email_verified`,
  `created_at`
) VALUES (
  'admin',
  'admin@sam-supermarket.com',
  '$2a$10$YKLm3Ek5z0klU1JiAQ4jROm9l0YLWNKrT6u.Qkw4p5iWvMfXYwCPi', -- 密码: admin
  '13800000000',
  '系统管理员',
  'admin',
  1,
  TRUE,
  TRUE,
  NOW()
) ON DUPLICATE KEY UPDATE
  `updated_at` = NOW();

-- 添加登录日志
INSERT INTO `user_login_logs` (
  `user_id`,
  `login_method`,
  `login_at`,
  `success`
) SELECT 
  id,
  'password',
  NOW(),
  TRUE
FROM `users` 
WHERE `username` = 'admin'
LIMIT 1;