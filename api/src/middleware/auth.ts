import { type Context, type Next } from "hono";
import { verify } from "hono/jwt";

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
    const payload = await verify(token, JWT_SECRET, "HS512");
    
    // 检查iat声明，拒绝超过10秒的旧请求
    const now = Math.floor(Date.now() / 1000);
    if (!payload.iat || Math.abs(now - payload.iat) > 10) {
      return c.json({ error: "请求时间戳无效或已过期" }, 403);
    }
    
    await next();
  } catch (err) {
    return c.json({ error: "无效的令牌" }, 403);
  }
}; 