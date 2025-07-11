import { Hono } from "hono";
import { getConnection } from "../utils/connection";
import type { RowDataPacket } from "mysql2";

interface ProductInHome extends RowDataPacket {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  updated_at: string;
}

interface CategoryWithProducts extends RowDataPacket {
  id: string;
  name: string;
  image_url: string;
  products: ProductInHome[];
}

const app = new Hono();

app.get("/data", async (c) => {
  const connection = await getConnection();
  try {
    // 1. 获取所有一级分类
    const [categories] = await connection.execute<CategoryWithProducts[]>(
      "SELECT id, name, image_url FROM product_categories WHERE level = 1 ORDER BY sort_order"
    );

    if (categories.length === 0) {
      return c.json({ success: true, data: [] });
    }

    // 2. 为每个一级分类获取最多6个商品
    const categoryPromises = categories.map(async (category) => {
      const [products] = await connection.execute<ProductInHome[]>(
        `
        WITH RECURSIVE CategoryTree AS (
          SELECT id FROM product_categories WHERE id = ?
          UNION ALL
          SELECT pc.id FROM product_categories pc JOIN CategoryTree ct ON pc.parent_id = ct.id
        )
        SELECT
          p.id,
          p.title AS name,
          p.sub_title AS description,
          CAST(p.price AS SIGNED) AS price,
          p.image_url,
          p.stock_quantity AS stock,
          p.updated_at
        FROM products p
        JOIN product_to_category_map pcm ON p.spu_id = pcm.product_spu_id COLLATE utf8mb4_unicode_ci
        WHERE pcm.category_id IN (SELECT id COLLATE utf8mb4_unicode_ci FROM CategoryTree)
        ORDER BY p.updated_at DESC
        LIMIT 6
        `,
        [category.id]
      );
      category.products = products;
      return category;
    });

    const data = await Promise.all(categoryPromises);

    return c.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return c.json(
      { success: false, message: "Failed to fetch homepage data" },
      500
    );
  }
});

export default app;