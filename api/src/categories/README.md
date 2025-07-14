# 分类模块 (Categories Module)

## 概述

分类模块实现了三级分类体系，支持分类的层级管理、递归查询、树形结构构建等功能。是商品组织和导航的核心模块。

## 数据模型

### product_categories 表结构

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 分类ID | 主键，自增 |
| name | VARCHAR(100) | 分类名称 | 非空 |
| parent_id | INT | 父分类ID | 可选，外键 |
| level | INT | 分类层级 | 1-3级 |
| sort_order | INT | 排序顺序 | 默认0 |
| icon_url | VARCHAR(255) | 图标URL | 可选 |
| description | TEXT | 分类描述 | 可选 |
| is_active | BOOLEAN | 是否启用 | 默认true |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

## API 接口

### 1. 获取所有分类

**端点**: `GET /categories/`

**查询参数**:
- `includeInactive` - 是否包含禁用分类 (默认: false)

**响应**:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "电子产品",
      "parent_id": null,
      "level": 1,
      "sort_order": 1,
      "icon_url": "https://example.com/icon.png",
      "children": [
        {
          "id": 2,
          "name": "手机",
          "parent_id": 1,
          "level": 2,
          "children": [
            {
              "id": 3,
              "name": "智能手机",
              "parent_id": 2,
              "level": 3,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. 按层级获取分类

**端点**: `GET /categories/level/:level`

**参数**:
- `level` - 分类层级 (1, 2, 或 3)

**响应**:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "电子产品",
      "parent_id": null,
      "level": 1,
      "sort_order": 1,
      "product_count": 150
    }
  ]
}
```

### 3. 获取子分类

**端点**: `GET /categories/:parentId/children`

**参数**:
- `parentId` - 父分类ID

**响应**:
```json
{
  "categories": [
    {
      "id": 2,
      "name": "手机",
      "parent_id": 1,
      "level": 2,
      "sort_order": 1,
      "product_count": 50
    }
  ]
}
```

### 4. 获取分类树

**端点**: `GET /categories/tree`

**功能**: 返回完整的分类树结构，包含所有层级关系

**响应**:
```json
{
  "tree": [
    {
      "id": 1,
      "name": "电子产品",
      "level": 1,
      "children": [
        {
          "id": 2,
          "name": "手机",
          "level": 2,
          "children": [
            {
              "id": 3,
              "name": "智能手机",
              "level": 3,
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. 获取分类路径

**端点**: `GET /categories/:id/path`

**功能**: 获取从根分类到指定分类的完整路径

**响应**:
```json
{
  "path": [
    {
      "id": 1,
      "name": "电子产品",
      "level": 1
    },
    {
      "id": 2,
      "name": "手机",
      "level": 2
    },
    {
      "id": 3,
      "name": "智能手机",
      "level": 3
    }
  ]
}
```

## 工具函数

### extractCategories.ts

用于从 HAR 文件中提取分类数据的工具函数：

```typescript
// 主要功能：
// 1. 解析 HAR 文件中的分类数据
// 2. 构建分类层级关系
// 3. 生成 SQL 插入语句
// 4. 处理分类去重和排序
```

## 业务规则

### 1. 层级限制
- 系统支持最多 3 级分类
- 一级分类：大类（如：电子产品、服装、食品）
- 二级分类：中类（如：手机、电脑、平板）
- 三级分类：小类（如：智能手机、功能手机）

### 2. 分类关系
- 每个分类只能有一个父分类
- 删除父分类时需要处理子分类
- 分类可以没有商品

### 3. 排序规则
- 同级分类按 sort_order 升序排列
- sort_order 相同时按创建时间排序

## 使用示例

### 获取一级分类

```bash
curl -X GET http://localhost:13100/categories/level/1
```

### 获取某分类的所有子分类

```bash
curl -X GET http://localhost:13100/categories/1/children
```

### 获取完整分类树

```bash
curl -X GET http://localhost:13100/categories/tree
```

## 数据库查询优化

### 1. 递归查询

使用 MySQL 8.0 的递归 CTE 查询所有子分类：

```sql
WITH RECURSIVE category_tree AS (
  SELECT * FROM product_categories WHERE id = ?
  UNION ALL
  SELECT c.* FROM product_categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree;
```

### 2. 索引优化

- `parent_id` 字段建立索引
- `(level, sort_order)` 建立联合索引
- `is_active` 字段建立索引

## 前端集成建议

### 1. 分类导航
- 使用树形组件展示完整分类
- 支持展开/收起操作
- 高亮当前选中分类

### 2. 分类选择器
- 级联选择器用于商品发布
- 支持搜索快速定位
- 显示分类路径

### 3. 缓存策略
- 分类数据变化不频繁，适合缓存
- 建议缓存时间：1小时
- 提供强制刷新机制

## 待实现功能

- [ ] 分类管理后台（增删改）
- [ ] 分类图标/图片上传
- [ ] 分类别名（用于 SEO）
- [ ] 分类商品数统计优化
- [ ] 分类推荐功能
- [ ] 分类访问统计
- [ ] 批量导入分类
- [ ] 分类合并/拆分功能