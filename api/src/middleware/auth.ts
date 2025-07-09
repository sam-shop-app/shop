import { type Context, type Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

export const authMiddleware = async (c: Context, next: Next) => {
  if (!AUTH_ENABLED) {
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return c.json({ error: "未授权" }, 401);
  }
  try {
    jwt.verify(token, JWT_SECRET);
    await next();
  } catch (err) {
    return c.json({ error: "无效的令牌" }, 403);
  }
}; 