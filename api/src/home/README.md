# 首页模块 (Home Module)

## 概述

首页模块专门为电商首页提供优化的数据接口，通过一个接口返回首页所需的分类和商品数据，减少前端请求次数，提升页面加载性能。

## 功能特点

- 一次请求获取所有首页数据
- 智能加载每个一级分类下的最新商品
- 使用递归查询包含所有子分类商品
- 优化的数据结构，减少传输量

## API 接口

### 获取首页分类及商品数据

**端点**: `GET /home/categories-with-products`

**功能**: 返回所有一级分类，每个分类包含其下所有子分类中最新的6个商品

**查询参数**:
- `productLimit` - 每个分类返回的商品数量 (默认: 6)

**响应结构**:
```json
{
  "categories": [
    {
      "id": 1,
      "name": "电子产品",
      "icon_url": "https://example.com/electronics.png",
      "sort_order": 1,
      "products": [
        {
          "id": 101,
          "name": "iPhone 15 Pro",
          "name_subtitle": "钛金属机身",
          "price": "7999.00",
          "discount_price": "7499.00",
          "image_url": "https://example.com/iphone.jpg",
          "sales": 1200,
          "stock": 50
        },
        // ... 最多6个商品
      ]
    },
    {
      "id": 2,
      "name": "服装服饰",
      "icon_url": "https://example.com/clothing.png", 
      "sort_order": 2,
      "products": [
        // ... 商品列表
      ]
    }
  ]
}
```

## 实现细节

### 1. 递归查询逻辑

使用 MySQL 递归 CTE 查询每个一级分类下的所有子分类：

```sql
WITH RECURSIVE CategoryHierarchy AS (
  -- 基础：选择一级分类
  SELECT id, name, icon_url, sort_order
  FROM product_categories
  WHERE level = 1 AND is_active = 1
  
  UNION ALL
  
  -- 递归：获取所有子分类
  SELECT c.id, ch.name, ch.icon_url, ch.sort_order
  FROM product_categories c
  INNER JOIN CategoryHierarchy ch ON c.parent_id = ch.id
  WHERE c.is_active = 1
)
```

### 2. 商品查询优化

- 每个分类独立查询商品，避免笛卡尔积
- 按创建时间倒序，获取最新商品
- 只返回上架状态的商品
- 限制返回字段，减少数据传输

### 3. 数据聚合

在应用层进行数据聚合，构建最终的响应结构：

```typescript
// 1. 获取所有一级分类
const topCategories = await getTopLevelCategories();

// 2. 为每个分类获取商品
for (const category of topCategories) {
  const products = await getProductsForCategory(category.id, limit);
  category.products = products;
}

// 3. 返回聚合数据
return { categories: topCategories };
```

## 性能优化

### 1. 查询优化
- 使用索引覆盖查询
- 避免 N+1 查询问题
- 合理使用 LIMIT 限制数据量

### 2. 缓存策略
- 首页数据更新不频繁，适合缓存
- 建议缓存时间：5-10分钟
- 可以按分类独立缓存

### 3. 响应优化
- 只返回必要字段
- 商品描述等大字段不返回
- 图片使用 CDN 地址

## 使用场景

### 1. 电商首页
```javascript
// 前端调用示例
const response = await fetch('/api/home/categories-with-products');
const data = await response.json();

// 渲染分类楼层
data.categories.forEach(category => {
  renderCategoryFloor(category);
});
```

### 2. 移动端首页
```javascript
// 移动端可能需要更少的商品
const response = await fetch('/api/home/categories-with-products?productLimit=4');
```

## 前端集成建议

### 1. 加载优化
- 首屏直接展示前2-3个分类
- 其余分类懒加载
- 图片使用懒加载

### 2. 交互设计
- 分类标签支持横向滚动
- 商品卡片统一尺寸
- 查看更多链接到分类页

### 3. 错误处理
- 某个分类无商品时的占位处理
- 网络错误时的重试机制
- 加载状态的骨架屏

## 扩展功能建议

### 1. 个性化推荐
- 基于用户浏览历史调整商品
- 不同时段展示不同商品
- A/B 测试不同的商品组合

### 2. 运营配置
- 支持手动指定展示商品
- 支持分类排序调整
- 支持临时隐藏某些分类

### 3. 数据分析
- 统计各分类点击率
- 分析商品曝光转化
- 优化商品展示策略

## 相关模块

- **商品模块**: 提供商品数据
- **分类模块**: 提供分类结构
- **缓存模块**: 提升响应速度

## 注意事项

1. 商品数据实时性要求不高，可以适当缓存
2. 注意处理分类下无商品的情况
3. 移动端和 PC 端可能需要不同的数据量
4. 考虑 CDN 缓存友好的接口设计