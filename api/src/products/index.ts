import { getConnection } from "../utils/connection";
import { type Context } from "hono";
import type { Har, Product } from "sam-shared";

export function parseHarForProducts(harContent: string): Product[] {
  const products: Product[] = [];
  const processedSpus = new Set<string>();

  try {
    const har: Har = JSON.parse(harContent);
    const productListEntries = har.log.entries.filter(
      (entry) =>
        entry.request.url.includes("/goods-portal/grouping/list") &&
        entry.response.content?.text,
    );

    for (const entry of productListEntries) {
      const responseBody = JSON.parse(entry.response.content.text!);
      const productList: Product[] = responseBody.data?.dataList || [];

      for (const product of productList) {
        const { spuId, storeId } = product;
        const uniqueKey = `${spuId}-${storeId}`;

        if (spuId && !processedSpus.has(uniqueKey)) {
          processedSpus.add(uniqueKey);

          let price_str = "0";
          const salePriceInfo = product.priceInfo?.find(
            (p) => p.priceType === 1,
          );
          if (salePriceInfo?.price) {
            price_str = salePriceInfo.price;
          }

          products.push({
            spuId: product.spuId,
            storeId: product.storeId,
            title: product.title || "",
            subTitle: product.subTitle || "",
            image: product.image || "",
            priceInfo: [{ priceType: 1, price: price_str }], // 只保留我们关心的价格
            stockInfo: { stockQuantity: product.stockInfo?.stockQuantity || 0 },
            isAvailable: product.isAvailable ?? false,
            isImport: product.isImport ?? false,
          });
        }
      }
    }
  } catch (error) {
    throw new Error(`解析HAR文件时出错: ${(error as Error).message}`);
  }
  return products;
}

export async function upsertProducts(products: Product[]): Promise<void> {
  if (products.length === 0) {
    console.log("没有要更新到数据库的商品。");
    return;
  }

  const connection = await getConnection();
  console.log(`准备将 ${products.length} 条商品数据插入或更新到数据库...`);

  try {
    const sql = `
            INSERT INTO products (spu_id, store_id, title, sub_title, image_url, price, stock_quantity, is_available, is_import)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                sub_title = VALUES(sub_title),
                image_url = VALUES(image_url),
                price = VALUES(price),
                stock_quantity = VALUES(stock_quantity),
                is_available = VALUES(is_available),
                is_import = VALUES(is_import);
        `;

    // 将对象数组转换为用于批量插入的二维数组
    const values = products.map((p) => [
      p.spuId,
      p.storeId,
      p.title,
      p.subTitle,
      p.image,
      p.priceInfo?.[0]?.price || "0",
      p.stockInfo?.stockQuantity,
      p.isAvailable,
      p.isImport,
    ]);

    const [result] = await connection.query(sql, [values]);
    console.log("数据库操作成功:", result);
  } catch (error) {
    console.error("数据库操作失败:", error);
  } finally {
    // 无论成功或失败，都释放连接回连接池
    if (connection) {
      connection.release();
    }
  }
}

export async function getProducts(options: {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isImport?: boolean;
  isAvailable?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const {
    search,
    sortBy = "spu_id",
    sortOrder = "asc",
    isImport,
    isAvailable,
    page = 1,
    pageSize = 10,
  } = options;
  const connection = await getConnection();
  try {
    let sql = "SELECT * FROM products";
    const whereClauses = [];
    const values = [];

    if (search) {
      whereClauses.push("title LIKE ?");
      values.push(`%${search}%`);
    }

    if (isImport !== undefined) {
      whereClauses.push("is_import = ?");
      values.push(isImport);
    }

    if (isAvailable !== undefined) {
      whereClauses.push("is_available = ?");
      values.push(isAvailable);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const validSortBy = ["spu_id", "price", "stock_quantity"];
    if (validSortBy.includes(sortBy)) {
      sql += ` ORDER BY ${sortBy} ${sortOrder === "desc" ? "DESC" : "ASC"}`;
    }

    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, offset);

    const [products] = await connection.query(sql, values);

    // Get total count for pagination
    let countSql = "SELECT COUNT(*) as total FROM products";
    if (whereClauses.length > 0) {
      countSql += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    // Re-use the same values for where clauses, but not for limit/offset
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
