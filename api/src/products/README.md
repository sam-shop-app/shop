# 商品模块 (Products Module)

## 概述

商品模块负责电商系统中商品的增删改查、库存管理、分类关联等核心功能。支持复杂的查询条件和 HAR 文件导入功能。

## 数据模型

### products 表结构

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INT | 商品ID | 主键，自增 |
| name | VARCHAR(255) | 商品名称 | 非空 |
| name_subtitle | TEXT | 副标题 | 可选 |
| description | TEXT | 商品描述 | 可选 |
| price | DECIMAL(10,2) | 商品价格 | 非空 |
| discount_price | DECIMAL(10,2) | 折扣价 | 可选 |
| stock | INT | 库存数量 | 默认0 |
| sales | INT | 销量 | 默认0 |
| image_url | VARCHAR(500) | 主图URL | 可选 |
| additional_images | JSON | 附加图片 | 可选 |
| sku | VARCHAR(100) | SKU编码 | 唯一，可选 |
| unit | VARCHAR(50) | 计量单位 | 可选 |
| brand | VARCHAR(100) | 品牌 | 可选 |
| source | VARCHAR(100) | 来源 | 可选 |
| status | TINYINT | 商品状态 | 1:上架, 0:下架 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

### product_to_category_map 表结构

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| product_id | INT | 商品ID | 外键 |
| category_id | INT | 分类ID | 外键 |

## API 接口

### 1. 获取商品列表

**端点**: `GET /products/`

**查询参数**:
- `search` - 搜索关键词（匹配名称、副标题、描述）
- `sortBy` - 排序字段: price_asc, price_desc, sales, newest
- `minPrice` - 最低价格
- `maxPrice` - 最高价格
- `category1Id` - 一级分类ID
- `category2Id` - 二级分类ID
- `category3Id` - 三级分类ID
- `page` - 页码 (默认: 1)
- `pageSize` - 每页数量 (默认: 20)

**响应**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "商品名称",
      "name_subtitle": "副标题",
      "price": "99.99",
      "discount_price": "79.99",
      "stock": 100,
      "sales": 50,
      "image_url": "https://example.com/image.jpg",
      "additional_images": ["url1", "url2"],
      "categories": [
        {
          "id": 1,
          "name": "分类名称",
          "level": 1
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 2. 获取商品详情

**端点**: `GET /products/:id`

**响应**:
```json
{
  "id": 1,
  "name": "商品名称",
  "name_subtitle": "副标题",
  "description": "详细描述",
  "price": "99.99",
  "discount_price": "79.99",
  "stock": 100,
  "sales": 50,
  "image_url": "https://example.com/image.jpg",
  "additional_images": ["url1", "url2"],
  "sku": "SKU123",
  "unit": "个",
  "brand": "品牌名",
  "categories": [
    {
      "id": 1,
      "name": "一级分类",
      "level": 1
    },
    {
      "id": 2,
      "name": "二级分类",
      "level": 2
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. 创建商品

**端点**: `POST /products/`

**需要认证**: 是

**请求体**:
```json
{
  "name": "商品名称",
  "name_subtitle": "副标题",
  "description": "描述",
  "price": 99.99,
  "discount_price": 79.99,
  "stock": 100,
  "image_url": "https://example.com/image.jpg",
  "additional_images": ["url1", "url2"],
  "sku": "SKU123",
  "unit": "个",
  "brand": "品牌",
  "categoryIds": [1, 2, 3]
}
```

### 4. 更新商品

**端点**: `PUT /products/:id`

**需要认证**: 是

**请求体**: 同创建商品

### 5. 删除商品

**端点**: `DELETE /products/:id`

**需要认证**: 是

### 6. HAR 文件导入

**端点**: `POST /products/import-har`

**需要认证**: 是

**功能**: 从浏览器导出的 HAR 文件中解析并导入商品数据

**请求**: multipart/form-data
- `file` - HAR 文件

## 特殊功能

### 1. 多级分类查询

商品查询支持按任意级别分类筛选。当指定某个分类时，会自动包含其所有子分类下的商品。

### 2. 智能排序

- `price_asc`: 价格从低到高
- `price_desc`: 价格从高到低
- `sales`: 按销量排序
- `newest`: 按创建时间排序

### 3. 价格区间筛选

使用优惠价（如果存在）或原价进行筛选，自动处理价格比较逻辑。

### 4. 全文搜索

搜索功能覆盖：
- 商品名称
- 副标题
- 商品描述

## 使用示例

### 获取商品列表（带筛选）

```bash
curl -X GET "http://localhost:13100/products/?search=手机&minPrice=1000&maxPrice=5000&sortBy=price_asc&page=1&pageSize=10"
```

### 创建新商品

```bash
curl -X POST http://localhost:13100/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 7999,
    "stock": 50,
    "categoryIds": [1, 5, 15]
  }'
```

### 导入 HAR 文件

```bash
curl -X POST http://localhost:13100/products/import-har \
  -H "Authorization: Bearer <token>" \
  -F "file=@products.har"
```

## 业务规则

1. **库存管理**: 商品库存不能为负数
2. **价格验证**: 折扣价不能高于原价
3. **分类关联**: 商品可以关联多个分类
4. **状态管理**: 下架商品不会出现在前台列表中

## 性能优化

1. **索引优化**: 
   - name, price, created_at 字段建立索引
   - product_to_category_map 建立联合索引

2. **查询优化**:
   - 使用递归 CTE 查询分类树
   - 分页查询避免全表扫描

3. **缓存策略**:
   - 热门商品缓存
   - 分类树结构缓存

## 待实现功能

- [ ] 商品规格（SKU）管理
- [ ] 商品评价系统
- [ ] 商品推荐算法
- [ ] 库存预警功能
- [ ] 批量导入/导出
- [ ] 商品审核流程
- [ ] 价格历史记录
- [ ] 商品标签系统