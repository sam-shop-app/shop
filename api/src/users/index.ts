import { Hono, type Next } from "hono";
import type { Context } from "hono";
import { sign } from "hono/jwt";
import db, { getConnection } from "../utils/connection";
import type { User, UserCredentials, UserRegistration } from "shared/src/types";
import { authMiddleware } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// --- Business Logic Functions ---

export async function registerUser(userData: UserRegistration): Promise<{ id: number }> {
  const { username, email, password } = userData;
  if (!username || !email || !password) {
    throw new Error("用户名、邮箱和密码是必填项");
  }

  const connection = await getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, "admin"],
    ) as any;
    return { id: result.insertId };
  } finally {
    connection.release();
  }
}

export async function loginUser(credentials: UserCredentials): Promise<string> {
  const { username, password } = credentials;
  if (!username || !password) {
    throw new Error("用户名和密码是必填项");
  }

  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username],
    ) as [User[], any];

    if (rows.length === 0) {
      throw new Error("无效的用户名或密码");
    }

    const user = rows[0];
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      throw new Error("无效的用户名或密码");
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // 签发时间
      nbf: Math.floor(Date.now() / 1000), // 生效时间
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 过期时间 (1 小时)
    };
    const token = await sign(payload, JWT_SECRET, "HS512");
    return token;
  } finally {
    connection.release();
  }
}

export async function getUsers(options: {
  page?: number;
  pageSize?: number;
}) {
  const { page = 1, pageSize = 10 } = options;
  const connection = await getConnection();
  try {
    let sql = "SELECT id, username, email, role, created_at FROM users";
    const values = [];

    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, offset);

    const [users] = await connection.query(sql, values);
    const [totalResult] = await connection.query("SELECT COUNT(*) as total FROM users") as any[];

    return {
      data: users,
      total: totalResult[0].total,
      page,
      pageSize,
    };
  } finally {
    connection.release();
  }
}

// --- Hono Routes ---

const users = new Hono();

users.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    await registerUser(body);
    return c.json({ message: "用户注册成功" }, 201);
  } catch (error: any) {
    if (error.message.includes("ER_DUP_ENTRY")) {
      return c.json({ error: "用户名或邮箱已存在" }, 409);
    }
    return c.json({ error: "数据库错误", details: error.message }, 500);
  }
});

users.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const token = await loginUser(body);
    return c.json({ token });
  } catch (error: any) {
    if (error.message === "无效的用户名或密码") {
      return c.json({ error: error.message }, 401);
    }
    return c.json({ error: "数据库错误", details: error.message }, 500);
  }
});

users.get("/", authMiddleware, async (c) => {
  try {
    const { page, pageSize } = c.req.query();
    const result = await getUsers({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: "数据库错误", details: error.message }, 500);
  }
});

export default users; 