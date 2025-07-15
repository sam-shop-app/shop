# 山姆闪购超市 - 管理后台

山姆闪购超市的管理后台系统。

## 概述

这是管理员后台，商店管理员可以在此管理商品、用户、分类，并查看业务分析数据。使用 Next.js 15 和 TypeScript 构建，提供现代高效的管理界面。

## 功能特性

- **数据统计概览**：实时展示商品、用户、订单和收入指标
- **商品管理**：查看、搜索、筛选和管理商品库存
- **批量导入**：从外部源批量导入商品
- **用户管理**：管理客户账户和权限
- **分类管理**：组织商品分类和层级结构
- **身份认证**：安全的管理员登录系统
- **中文界面**：完整的中文支持（仪表盘）

## 技术栈

- **框架**：Next.js 15 + App Router
- **语言**：TypeScript
- **样式**：Tailwind CSS + HeroUI 组件库
- **状态管理**：React hooks
- **表单**：React Hook Form + Zod 验证
- **开发工具**：Turbopack 快速构建
- **图标**：Lucide React
- **HTTP 客户端**：ofetch
- **UI 虚拟化**：@tanstack/react-virtual

## 架构设计

### 核心架构特点

1. **客户端优先架构**：应用采用 SPA 模式，所有组件都是客户端组件
2. **类型安全开发**：全面使用 TypeScript，配合 Zod 实现运行时验证
3. **现代化 UI 栈**：HeroUI + Tailwind CSS 提供一致的设计系统
4. **简化状态管理**：依赖本地状态和 URL 状态，无复杂全局状态
5. **表单验证**：React Hook Form + Zod 提供类型安全的表单处理
6. **性能优化**：虚拟滚动、图片优化、代码分割
7. **Monorepo 集成**：使用 workspace 包共享类型定义

### Next.js 15 App Router 实现

**路由结构**：
- 使用 `/src/app` 目录结构定义路由
- 所有页面组件标记为 `"use client"`
- 布局组件处理认证状态检查
- 根据认证状态渲染不同的导航结构

**Turbopack 集成**：
- 开发环境使用 `--turbopack` 获得更快的构建速度
- 零配置即可获得最佳性能

### 数据获取模式

**客户端数据获取**：
```typescript
// 使用 ofetch 进行 API 调用
const api = ofetch.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  mode: 'cors',
});
```

- 所有数据获取在 `useEffect` 中进行
- 实现加载状态和错误处理
- 使用 URL 参数管理列表状态（搜索、分页、筛选）

### 状态管理策略

1. **本地组件状态**：
   - 使用 `useState` 管理组件内部状态
   - 无全局状态管理库，保持简单性

2. **URL 状态管理**：
   - 使用 Next.js 导航 hooks（`useSearchParams`、`useRouter`）
   - 搜索、分页、筛选器状态保存在 URL 中
   - 支持浏览器前进/后退导航

### 表单处理架构

**类型安全的表单验证**：
```typescript
// Zod schema 定义
const schema = z.object({
  username: z.string().min(1, "用户名是必填项"),
  password: z.string().min(6, "密码至少6个字符"),
});

// React Hook Form 集成
const form = useForm({
  resolver: zodResolver(schema),
});
```

- 自动类型推断
- 客户端实时验证
- 统一的错误处理

### 认证实现

**JWT 令牌认证**：
- 令牌存储在 `localStorage`
- 布局组件检查认证状态
- 简单的登录/登出流程
- 认证页面使用独立布局

### API 集成模式

**集中式 API 客户端**：
- 环境变量配置 API 地址
- CORS 模式支持跨域请求
- 统一的错误提示（Toast）
- 类型导入自 workspace 包

### UI 组件架构

**HeroUI 组件系统**：
- 统一的设计语言
- 预构建的业务组件
- 响应式设计支持
- 暗色模式支持

**关键组件**：
- `Table`：支持排序、分页的数据表格
- `Card`：统计卡片展示
- `Form`：表单输入组件
- `Modal`：对话框组件

### 性能优化

1. **虚拟滚动**：
   - 使用 `@tanstack/react-virtual` 处理大数据列表
   - 只渲染可见区域的项目

2. **图片优化**：
   - Next.js `Image` 组件自动优化
   - 懒加载和格式转换

3. **代码分割**：
   - App Router 自动代码分割
   - Suspense 边界实现加载状态

### TypeScript 配置

**严格模式配置**：
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- 路径别名简化导入
- 严格类型检查
- Next.js 插件集成

### 样式系统

**Tailwind CSS v4 + PostCSS**：
- 原子化 CSS 类
- 自定义 HeroUI 插件
- 响应式工具类
- 最小化自定义 CSS

## 环境要求

- Node.js（v18 或更高版本）
- pnpm 包管理器

## 快速开始

1. 安装依赖：
   ```bash
   pnpm install
   ```

2. 启动开发服务器：
   ```bash
   pnpm dev
   ```

   应用将在 `http://localhost:3000` 上运行

3. 构建生产版本：
   ```bash
   pnpm build
   ```

4. 启动生产服务器：
   ```bash
   pnpm start
   ```

## 项目结构

```
dashboard/
├── src/
│   ├── app/            # Next.js app router 页面
│   ├── components/     # 可复用的 UI 组件
│   ├── lib/            # 工具函数和配置
│   └── types/          # TypeScript 类型定义
├── public/             # 静态资源
└── next.config.ts      # Next.js 配置
```

## 主要页面

- **仪表盘** (`/`)：带统计卡片的概览页面
- **商品管理** (`/products`)：商品管理表格
- **导入** (`/import`)：批量商品导入界面
- **用户管理** (`/users`)：用户管理
- **分类管理** (`/categories`)：分类管理
- **登录** (`/login`)：管理员身份认证
- **注册** (`/register`)：新管理员注册

## 环境变量

在根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 可用脚本

- `pnpm dev` - 使用 Turbopack 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行 ESLint
- `pnpm lint:fix` - 修复代码检查问题

## API 集成

管理后台连接到后端 API 服务（默认运行在 3000 端口）。启动管理后台前请确保 API 服务正在运行。

## 身份认证

管理员用户需要注册并登录才能访问后台。认证系统使用：
- 邮箱和密码登录
- 会话管理维持登录状态
- 需要身份验证的受保护路由

## 数据管理

### 商品管理
- 在可排序的表格中查看所有商品
- 按商品名称搜索
- 按分类筛选
- 按各种字段排序（名称、价格、库存等）

### 导入功能
- 支持批量商品导入
- 导入前验证数据
- 显示导入进度和结果

### 统计数据
- 实时商品数量
- 注册用户总数
- 订单统计
- 收入跟踪

## UI 组件

管理后台使用 HeroUI 组件以保持设计一致性：
- 带排序和分页的表格
- 带验证的表单
- 模态对话框
- 加载状态
- 消息提示

## 开发规范

1. 遵循 Next.js App Router 约定
2. 所有新代码使用 TypeScript
3. 保持现有的组件结构
4. 测试响应式设计
5. 确保中文语言的一致性
6. 提交前运行代码检查