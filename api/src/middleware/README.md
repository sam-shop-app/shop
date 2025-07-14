# 中间件模块 (Middleware Module)

## 概述

中间件模块提供了 API 服务的横切关注点功能，目前主要包含 JWT 认证中间件，负责保护需要授权访问的接口。

## 认证中间件 (auth.ts)

### 功能描述

JWT (JSON Web Token) 认证中间件，用于验证和解析客户端请求中的认证令牌。

### 工作流程

1. **Token 提取**: 从请求头 `Authorization: Bearer <token>` 中提取 JWT
2. **Token 验证**: 验证 token 的签名和有效性
3. **时间校验**: 检查 token 的时间戳，防止重放攻击
4. **用户信息注入**: 将解析的用户信息注入到请求上下文

### 配置选项

**环境变量**:
- `AUTH_ENABLED` - 是否启用认证 (默认: true)
- `JWT_SECRET` - JWT 签名密钥

### Token 结构

```typescript
interface JWTPayload {
  userId: number;      // 用户ID
  username: string;    // 用户名
  role: string;        // 用户角色 (client/admin)
  iat: number;         // 签发时间 (Issued At)
  nbf: number;         // 生效时间 (Not Before) 
  exp: number;         // 过期时间 (Expiration)
}
```

### 使用方式

```typescript
import { authMiddleware } from './middleware/auth.js';

// 保护单个路由
app.get('/protected', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({ message: `Hello ${user.username}` });
});

// 保护路由组
const protectedRoutes = app.route('/api/v1');
protectedRoutes.use(authMiddleware);
```

### 错误响应

**未提供 Token**:
```json
{
  "error": "No authorization header"
}
```
状态码: 401

**Token 格式错误**:
```json
{
  "error": "Invalid authorization format"
}
```
状态码: 401

**Token 验证失败**:
```json
{
  "error": "Invalid token"
}
```
状态码: 401

**Token 时间戳过旧**:
```json
{
  "error": "Token timestamp too old"
}
```
状态码: 401

### 安全特性

1. **时间戳验证**: 拒绝超过10秒的旧请求，防止重放攻击
2. **算法限制**: 只接受 HS512 算法签名
3. **严格模式**: 不允许无签名的 token

## 扩展中间件建议

### 1. 速率限制中间件

```typescript
export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  // 实现速率限制逻辑
  await next();
};
```

### 2. 日志中间件

```typescript
export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} - ${duration}ms`);
};
```

### 3. 错误处理中间件

```typescript
export const errorHandlerMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
```

### 4. CORS 中间件增强

```typescript
export const corsMiddleware = cors({
  origin: (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    return allowedOrigins.includes(origin);
  },
  credentials: true,
  maxAge: 86400,
});
```

## 最佳实践

### 1. 中间件顺序

```typescript
// 推荐的中间件顺序
app.use(corsMiddleware);        // 1. CORS
app.use(loggerMiddleware);      // 2. 日志
app.use(errorHandlerMiddleware); // 3. 错误处理
app.use(rateLimitMiddleware);   // 4. 速率限制
// 路由定义
app.use('/protected/*', authMiddleware); // 5. 认证（特定路由）
```

### 2. 条件中间件

```typescript
// 根据环境启用不同中间件
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimitMiddleware);
  app.use(compressionMiddleware);
}
```

### 3. 中间件链

```typescript
// 组合多个中间件
const adminMiddleware = compose(
  authMiddleware,
  roleMiddleware('admin'),
  auditLogMiddleware
);

app.use('/admin/*', adminMiddleware);
```

## 性能考虑

1. **Token 缓存**: 考虑缓存已验证的 token 减少 CPU 开销
2. **异步操作**: 确保中间件中的异步操作正确处理
3. **提前退出**: 验证失败立即返回，避免执行后续中间件

## 安全建议

1. **密钥管理**: 
   - 使用强密钥（至少 256 位）
   - 定期轮换密钥
   - 使用密钥管理服务

2. **Token 安全**:
   - 设置合理的过期时间
   - 实现 token 刷新机制
   - 考虑使用 refresh token

3. **传输安全**:
   - 生产环境强制 HTTPS
   - 使用 Secure 标志的 cookie

## 待实现功能

- [ ] Refresh Token 机制
- [ ] 权限控制中间件（基于角色和资源）
- [ ] API 版本控制中间件
- [ ] 请求体验证中间件
- [ ] 压缩中间件
- [ ] 缓存中间件
- [ ] 国际化中间件
- [ ] 审计日志中间件