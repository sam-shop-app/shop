import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import db from "./utils/connection";
import { upsertProducts, parseHarForProducts, getProducts } from "./products";

// 创建 Hono 应用实例
const app = new Hono();

// 添加 CORS 支持
app.use(
  "*",
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// 基础健康检查端点
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

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

app.post("/products/upsert", async (c) => {
  try {
    const products = await c.req.json();
    await upsertProducts(products);
    return c.json({ success: true, message: "Products upserted successfully" });
  } catch (error) {
    console.error("Error upserting products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/products/parse", async (c) => {
  try {
    const harContent = await c.req.text();
    const products = parseHarForProducts(harContent);
    return c.json(products);
  } catch (error) {
    console.error("Error parsing HAR file:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/products", async (c) => {
  try {
    const {
      search,
      sortBy,
      sortOrder,
      isImport,
      isAvailable,
      page,
      pageSize,
    } = c.req.query();
    const result = await getProducts({
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      isImport: isImport ? isImport === "true" : undefined,
      isAvailable: isAvailable ? isAvailable === "true" : undefined,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return c.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    // const connected = await db.testConnection();
    // if (!connected) {
    //   console.error("无法连接到 MySQL 数据库，程序退出...");
    //   process.exit(1);
    // }
    // console.log("成功连接到 MySQL 数据库");

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
