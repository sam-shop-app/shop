# SAM API - 电商系统后端服务

## 项目概述

SAM API 是一个基于 Hono 框架构建的轻量级电商后端服务，提供商品管理、用户认证、分类管理等核心功能。

## 技术栈

- **框架**: [Hono](https://hono.dev/) - 轻量级 Web 框架
- **语言**: TypeScript
- **数据库**: MySQL 8.0
- **认证**: JWT (JSON Web Token)
- **运行时**: Node.js
- **容器化**: Docker & Docker Compose

## 项目结构

```
api/
├── src/
│   ├── index.ts           # 主入口文件，路由配置
│   ├── types.ts           # TypeScript 类型定义
│   ├── middleware/        # 中间件
│   │   └── auth.ts        # JWT 认证中间件
│   ├── utils/             # 工具函数
│   │   └── connection.ts  # MySQL 连接池管理
│   ├── users/             # 用户模块
│   ├── products/          # 商品模块
│   ├── categories/        # 分类模块
│   └── home/              # 首页数据模块
├── docker-compose.yml     # Docker 编排配置
├── Dockerfile            # API 容器镜像配置
├── init.sql              # 数据库初始化脚本
├── package.json          # 项目依赖配置
├── tsconfig.json         # TypeScript 配置
└── rolldown.config.ts    # 打包配置
```

## 快速开始

### 前置要求

- Docker & Docker Compose
- Node.js 18+ (本地开发)
- pnpm (包管理器)

### 使用 Docker Compose 启动

```bash
# 启动服务（开发模式）
docker compose --profile dev up

# 启动服务（生产模式）
docker compose up
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

## API 端点

### 基础端点

- `GET /` - 健康检查
- `GET /stats` - 系统统计信息
- `GET /db-test` - 数据库连接测试

### 用户模块 (`/users`)

- `POST /users/register` - 用户注册
- `POST /users/login` - 用户登录
- `GET /users/` - 获取用户列表（需认证）

### 商品模块 (`/products`)

- `GET /products/` - 获取商品列表
- `GET /products/:id` - 获取商品详情
- `POST /products/` - 创建商品（需认证）
- `PUT /products/:id` - 更新商品（需认证）
- `DELETE /products/:id` - 删除商品（需认证）

### 分类模块 (`/categories`)

- `GET /categories/` - 获取所有分类
- `GET /categories/level/:level` - 按层级获取分类
- `GET /categories/:parentId/children` - 获取子分类

### 首页模块 (`/home`)

- `GET /home/categories-with-products` - 获取分类及商品数据

## 环境变量

```env
# 数据库配置
DB_HOST=sam-app-mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=sam_app

# 认证配置
AUTH_ENABLED=true
JWT_SECRET=your-secret-key

# 服务器配置
PORT=3100
```

## 数据库架构

### 主要数据表

1. **users** - 用户表
   - 存储用户基本信息、认证凭据
   - 支持多角色（client/admin）

2. **products** - 商品表
   - 商品基本信息、价格、库存等
   - 支持多图片存储

3. **product_categories** - 商品分类表
   - 三级分类体系
   - 支持递归查询

4. **product_to_category_map** - 商品分类映射表
   - 商品与分类的多对多关系

## 认证机制

- 使用 JWT Bearer Token 认证
- Token 有效期：1小时
- 认证头格式：`Authorization: Bearer <token>`

## 开发指南

### 添加新模块

1. 在 `src/` 下创建新目录
2. 创建 `index.ts` 文件定义路由
3. 在主入口文件中注册路由

### 数据库操作

使用连接池进行数据库操作：

```typescript
import { query } from '../utils/connection.js';

const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
```

### 错误处理

统一的错误响应格式：

```json
{
  "error": "错误描述信息"
}
```

## 部署

### Docker 部署

1. 构建镜像：
   ```bash
   docker build -t sam-api .
   ```

2. 使用 Docker Compose：
   ```bash
   docker compose up -d
   ```

### 性能优化

- 使用连接池管理数据库连接
- 实现查询结果缓存
- 使用索引优化数据库查询

## 安全建议

1. **密码加密**: 生产环境必须使用 bcrypt 等加密存储密码
2. **环境变量**: 敏感信息使用环境变量配置
3. **SQL 注入**: 已使用参数化查询防护
4. **CORS**: 生产环境严格限制允许的域名
5. **HTTPS**: 生产环境启用 HTTPS

## 许可证

MIT License