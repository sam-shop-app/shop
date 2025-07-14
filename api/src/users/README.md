# 用户模块 (Users Module)

## 概述

用户模块提供完整的用户认证和管理功能，包括注册、登录、用户信息管理等。

## 数据模型

### users 表结构

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 用户ID | 主键，自增 |
| username | VARCHAR(50) | 用户名 | 唯一，非空 |
| email | VARCHAR(100) | 邮箱 | 唯一，非空 |
| password | VARCHAR(255) | 密码 | 非空 |
| full_name | VARCHAR(100) | 真实姓名 | 可选 |
| avatar_url | VARCHAR(255) | 头像URL | 可选 |
| phone_number | VARCHAR(20) | 手机号 | 可选 |
| role | ENUM | 用户角色 | 'client', 'admin' |
| status | TINYINT | 账号状态 | 1:活跃, 0:禁用, 2:待验证 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

## API 接口

### 1. 用户注册

**端点**: `POST /users/register`

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone_number": "string" // 可选
}
```

**响应**:
- 成功 (201):
  ```json
  {
    "message": "User created successfully",
    "userId": 123
  }
  ```
- 用户已存在 (409):
  ```json
  {
    "error": "Username or email already exists"
  }
  ```

### 2. 用户登录

**端点**: `POST /users/login`

**请求体**:
```json
{
  "username": "string", // 可以是用户名或手机号
  "password": "string"
}
```

**响应**:
- 成功 (200):
  ```json
  {
    "token": "jwt-token-string",
    "user": {
      "id": 123,
      "username": "string",
      "email": "string",
      "role": "client"
    }
  }
  ```
- 失败 (401):
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

### 3. 获取用户列表

**端点**: `GET /users/`

**需要认证**: 是

**查询参数**:
- `page` - 页码 (默认: 1)
- `pageSize` - 每页数量 (默认: 10)

**响应**:
```json
{
  "users": [
    {
      "id": 123,
      "username": "string",
      "email": "string",
      "full_name": "string",
      "avatar_url": "string",
      "phone_number": "string",
      "role": "client",
      "status": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

## JWT Token 结构

登录成功后返回的 JWT token 包含以下信息：

```json
{
  "userId": 123,
  "username": "string",
  "role": "client",
  "iat": 1234567890,  // 签发时间
  "nbf": 1234567890,  // 生效时间
  "exp": 1234571490   // 过期时间（1小时后）
}
```

## 认证方式

在需要认证的接口中，需要在请求头中包含：

```
Authorization: Bearer <jwt-token>
```

## 使用示例

### 注册新用户

```bash
curl -X POST http://localhost:13100/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phone_number": "13800138000"
  }'
```

### 用户登录

```bash
curl -X POST http://localhost:13100/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 获取用户列表

```bash
curl -X GET http://localhost:13100/users/?page=1&pageSize=20 \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 安全注意事项

1. **密码存储**: 当前密码以明文存储，生产环境必须使用 bcrypt 或其他加密算法
2. **Token 安全**: JWT secret 应该使用环境变量配置，不应硬编码
3. **输入验证**: 应添加更严格的输入验证（邮箱格式、密码强度等）
4. **速率限制**: 建议对登录接口添加速率限制防止暴力破解

## 待实现功能

- [ ] 密码加密存储
- [ ] 邮箱验证功能
- [ ] 手机号验证功能
- [ ] 密码重置功能
- [ ] 用户信息更新接口
- [ ] 用户删除（软删除）接口
- [ ] 刷新 Token 机制
- [ ] OAuth2.0 第三方登录