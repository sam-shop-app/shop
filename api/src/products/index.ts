import { Hono } from "hono";
import { getConnection } from "../utils/connection";
import type { Har, Product } from "@/types";
import { authMiddleware } from "../middleware/auth";

/**
 * 从HAR文件内容中提取商品数据，并将请求中frontCategoryIds的第一个ID挂载到每个商品上。
 * @param harContent HAR文件的字符串内容
 * @returns Product对象数组，其中categoryIdList已被替换为上下文分类ID
 */
function parseHarForProducts(harContent: string): Product[] {
  const products: Product[] = [];
  const processedSpus = new Set<string>();

  try {
    const har: Har = JSON.parse(harContent);
    const productListEntries = har.log.entries.filter(
      (entry) =>
        entry.request.url.includes("/goods-portal/grouping/list") &&
        entry.response.content?.text &&
        entry.request.postData?.text, // 确保请求体存在
    );

    for (const entry of productListEntries) {
      const requestBody = JSON.parse(entry.request.postData!.text!);
      const frontCategoryIds: string[] = requestBody.frontCategoryIds || [];

      // *** 关键优化点：只取frontCategoryIds的第一个ID作为关联 ***
      const contextCategoryId = frontCategoryIds[0];

      // 如果没有上下文分类ID，则跳过此条目
      if (!contextCategoryId) {
        continue;
      }

      const responseBody = JSON.parse(entry.response.content.text!);
      const productList: Product[] = responseBody.data?.dataList || [];

      for (const product of productList) {
        const { spuId, storeId } = product;
        const uniqueKey = `${spuId}-${storeId}`;

        if (spuId && !processedSpus.has(uniqueKey)) {
          processedSpus.add(uniqueKey);

          // 将请求上下文中的分类ID挂载到商品对象上
          product.categoryIdList = [contextCategoryId];

          products.push(product);
        }
      }
    }
  } catch (error) {
    throw new Error(`解析HAR文件时出错: ${(error as Error).message}`);
  }
  return products;
}

async function upsertProducts(products: Product[]): Promise<void> {
  if (products.length === 0) {
    console.log("没有要同步到数据库的商品。");
    return;
  }

  const connection = await getConnection();

  // 准备商品数据
  const productValues = products.map((p) => {
    const salePriceInfo = p.priceInfo?.find((pi) => pi.priceType === 1);
    return [
      p.spuId,
      p.storeId,
      p.title,
      p.subTitle,
      p.image,
      salePriceInfo?.price || "0",
      p.stockInfo?.stockQuantity,
      p.isAvailable,
      p.isImport,
    ];
  });

  // 准备分类映射数据
  const mappingValues = products.flatMap((p) =>
    p.categoryIdList ? p.categoryIdList.map((catId) => [p.spuId, catId]) : [],
  );

  console.log(`准备将 ${productValues.length} 条商品记录插入或更新...`);
  if (mappingValues.length > 0) {
    console.log(
      `准备将 ${mappingValues.length} 条商品-分类映射关系插入或更新...`,
    );
  } else {
    console.log("未发现商品-分类映射关系。");
  }

  try {
    await connection.beginTransaction();

    // 1. 插入或更新商品表
    if (productValues.length > 0) {
      const productSql = `
                INSERT INTO products (spu_id, store_id, title, sub_title, image_url, price, stock_quantity, is_available, is_import)
                VALUES ?
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title), sub_title = VALUES(sub_title), image_url = VALUES(image_url),
                    price = VALUES(price), stock_quantity = VALUES(stock_quantity), is_available = VALUES(is_available),
                    is_import = VALUES(is_import);
            `;
      await connection.query(productSql, [productValues]);
    }

    // 2. 插入或更新分类映射表
    if (mappingValues.length > 0) {
      const mappingSql = `
                INSERT INTO product_to_category_map (product_spu_id, category_id)
                VALUES ?
                ON DUPLICATE KEY UPDATE product_spu_id=VALUES(product_spu_id);
            `;
      await connection.query(mappingSql, [mappingValues]);
    }

    await connection.commit();
    console.log("数据库事务已成功提交！");
  } catch (error) {
    await connection.rollback();
    console.error("数据库操作失败，事务已回滚:", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getProducts(options: {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isImport?: boolean;
  isAvailable?: boolean;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}) {
  const {
    search,
    sortBy = "spu_id",
    sortOrder = "asc",
    isImport,
    isAvailable,
    categoryId,
    minPrice,
    maxPrice,
    page = 1,
    pageSize = 10,
  } = options;
  const connection = await getConnection();
  try {
    let sql = "SELECT p.* FROM products p";
    const whereClauses = [];
    const values: (string | number | boolean)[] = [];

    if (categoryId) {
      sql +=
        " JOIN product_to_category_map ptcm ON p.spu_id = ptcm.product_spu_id";
      whereClauses.push("ptcm.category_id = ?");
      values.push(categoryId);
    }

    if (search) {
      whereClauses.push("p.title LIKE ?");
      values.push(`%${search}%`);
    }

    if (isImport !== undefined) {
      whereClauses.push("p.is_import = ?");
      values.push(isImport);
    }

    if (isAvailable !== undefined) {
      whereClauses.push("p.is_available = ?");
      values.push(isAvailable);
    }

    if (minPrice !== undefined) {
      whereClauses.push("CAST(p.price as DECIMAL(10,2)) >= ?");
      values.push(minPrice);
    }

    if (maxPrice !== undefined) {
      whereClauses.push("CAST(p.price as DECIMAL(10,2)) <= ?");
      values.push(maxPrice);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const validSortBy = ["spu_id", "price", "stock_quantity", "title"];
    if (validSortBy.includes(sortBy)) {
      sql += ` ORDER BY p.${sortBy} ${sortOrder === "desc" ? "DESC" : "ASC"}`;
    }

    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, offset);

    console.log("=== getProducts SQL Debug ===");
    console.log("Final SQL:", sql);
    console.log("Values:", values);
    console.log("CategoryId:", categoryId);
    console.log("=============================");

    const [products] = await connection.query(sql, values);

    let countSql = "SELECT COUNT(DISTINCT p.spu_id) as total FROM products p";
    if (categoryId) {
      countSql +=
        " JOIN product_to_category_map ptcm ON p.spu_id = ptcm.product_spu_id";
    }
    if (whereClauses.length > 0) {
      countSql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    console.log("=== Count SQL Debug ===");
    console.log("Count SQL:", countSql);
    console.log("Count Values:", values.slice(0, whereClauses.length));
    console.log("=======================");

    const [totalResult] = (await connection.query(
      countSql,
      values.slice(0, whereClauses.length),
    )) as any[];

    return {
      data: products,
      total: totalResult[0].total,
      page,
      pageSize,
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// --- Hono 路由 ---

const products = new Hono();

products.use("/upsert", authMiddleware);
products.use("/parse", authMiddleware);

products.post("/upsert", async (c) => {
  try {
    const products = await c.req.json();
    await upsertProducts(products);
    return c.json({ success: true, message: "商品更新或插入成功" });
  } catch (error) {
    console.error("更新或插入商品时出错:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

products.post("/parse", async (c) => {
  try {
    const harContent = await c.req.text();
    const products = parseHarForProducts(harContent);
    return c.json(products);
  } catch (error) {
    console.error("解析HAR文件时出错:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

products.get("/", async (c) => {
  try {
    const {
      search,
      sortBy,
      sortOrder,
      isImport,
      isAvailable,
      categoryId,
      minPrice,
      maxPrice,
      page,
      pageSize,
    } = c.req.query();
    const result = await getProducts({
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      isImport: isImport ? isImport === "true" : undefined,
      isAvailable: isAvailable ? isAvailable === "true" : undefined,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return c.json(result);
  } catch (error) {
    console.error("获取商品时出错:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default products;

export { parseHarForProducts, upsertProducts, getProducts };
