import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import db from "./utils/connection";
import products from "./products";
import users, { registerUser } from "./users";
import categories from "./categories";
import home from "./home";
import cart from "./cart";
import { getConnection } from "./utils/connection";

// 创建 Hono 应用实例
const app = new Hono();

// 添加 CORS 支持
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3200",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// 基础健康检查端点
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/stats", async (c) => {
  const connection = await getConnection();
  try {
    const productsCount: any = await db.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const usersCount: any = await db.query(
      "SELECT COUNT(*) as count FROM users",
    );
    const categoriesCount: any = await db.query(
      "SELECT COUNT(*) as count FROM product_categories",
    );

    return c.json({
      products: productsCount[0].count,
      users: usersCount[0].count,
      categories: categoriesCount[0].count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.route("/users", users);
app.route("/products", products);
app.route("/categories", categories);
app.route("/home", home);
app.route("/cart", cart);

// 测试数据库连接端点
app.get("/db-test", async (c) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      return c.json({
        status: "ok",
        message: "数据库连接成功",
      });
    } else {
      return c.json({ status: "error", message: "数据库连接失败" }, 500);
    }
  } catch (error) {
    console.error("测试数据库连接时出错:", error);
    return c.json(
      {
        status: "error",
        message: "数据库连接错误",
        error: String(error),
      },
      500,
    );
  }
});

// 启动服务器
async function startServer() {
  try {
    // 启动服务器
    serve(
      {
        fetch: app.fetch,
        port: 3100,
      },
      (info) => {
        console.log(`服务器运行在 http://localhost:${info.port}`);
      },
    );
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
}

// 启动服务器
startServer();
