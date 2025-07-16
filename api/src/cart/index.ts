import { Hono } from "hono";
import { getConnection } from "../utils/connection";
import { authMiddleware } from "../middleware/auth";

const cart = new Hono();

// 获取用户购物车
cart.get("/", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    console.log(payload);
    if (!payload?.id) {
      return c.json({ error: "未登录" }, 401);
    }
    const userId = payload.id;

    const connection = await getConnection();
    try {
      const [rows] = (await connection.execute(
        `SELECT
          uc.id as cart_id,
          uc.quantity,
          p.id as product_id,
          p.title as name,
          p.price,
          p.image_url as image,
          p.stock_quantity as stock
        FROM user_carts uc
        JOIN products p ON uc.product_id = p.id
        WHERE uc.user_id = ?
        ORDER BY uc.created_at DESC`,
        [userId],
      )) as any[];

      return c.json({ items: rows });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message || "获取购物车失败" }, 500);
  }
});

// 添加商品到购物车
cart.post("/add", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.id;
    const { product_id, quantity = 1 } = await c.req.json();

    if (!product_id || quantity <= 0) {
      return c.json({ error: "商品ID和数量是必填项" }, 400);
    }

    const connection = await getConnection();
    try {
      // 检查商品是否存在和库存
      const [productRows] = (await connection.execute(
        "SELECT stock_quantity FROM products WHERE id = ?",
        [product_id],
      )) as any[];

      if (productRows.length === 0) {
        return c.json({ error: "商品不存在" }, 404);
      }

      const stock = productRows[0].stock_quantity;
      if (stock < quantity) {
        return c.json({ error: "库存不足" }, 400);
      }

      // 检查购物车中是否已有该商品
      const [existingRows] = (await connection.execute(
        "SELECT id, quantity FROM user_carts WHERE user_id = ? AND product_id = ?",
        [userId, product_id],
      )) as any[];

      if (existingRows.length > 0) {
        // 更新数量
        const newQuantity = existingRows[0].quantity + quantity;
        if (newQuantity > stock) {
          return c.json({ error: "库存不足" }, 400);
        }

        await connection.execute(
          "UPDATE user_carts SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [newQuantity, existingRows[0].id],
        );
      } else {
        // 添加新商品
        await connection.execute(
          "INSERT INTO user_carts (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, product_id, quantity],
        );
      }

      return c.json({ message: "添加成功" });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message || "添加失败" }, 500);
  }
});

// 更新购物车商品数量
cart.put("/update", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.id;
    const { product_id, quantity } = await c.req.json();

    if (!product_id || quantity <= 0) {
      return c.json({ error: "商品ID和数量是必填项" }, 400);
    }

    const connection = await getConnection();
    try {
      // 检查商品库存
      const [productRows] = (await connection.execute(
        "SELECT stock_quantity FROM products WHERE id = ?",
        [product_id],
      )) as any[];

      if (productRows.length === 0) {
        return c.json({ error: "商品不存在" }, 404);
      }

      const stock = productRows[0].stock_quantity;
      if (stock < quantity) {
        return c.json({ error: "库存不足" }, 400);
      }

      // 更新购物车数量
      const [result] = (await connection.execute(
        "UPDATE user_carts SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?",
        [quantity, userId, product_id],
      )) as any;

      if (result.affectedRows === 0) {
        return c.json({ error: "购物车中没有该商品" }, 404);
      }

      return c.json({ message: "更新成功" });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message || "更新失败" }, 500);
  }
});

// 删除购物车商品
cart.delete("/remove", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.id;
    const { product_id } = await c.req.json();

    if (!product_id) {
      return c.json({ error: "商品ID是必填项" }, 400);
    }

    const connection = await getConnection();
    try {
      const [result] = (await connection.execute(
        "DELETE FROM user_carts WHERE user_id = ? AND product_id = ?",
        [userId, product_id],
      )) as any;

      if (result.affectedRows === 0) {
        return c.json({ error: "购物车中没有该商品" }, 404);
      }

      return c.json({ message: "删除成功" });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message || "删除失败" }, 500);
  }
});

// 清空购物车
cart.delete("/clear", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const userId = payload.id;

    const connection = await getConnection();
    try {
      await connection.execute("DELETE FROM user_carts WHERE user_id = ?", [
        userId,
      ]);

      return c.json({ message: "清空成功" });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message || "清空失败" }, 500);
  }
});

export default cart;
