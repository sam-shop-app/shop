import { type Context, type Next } from "hono";
import { verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const AUTH_ENABLED =
  !process.env.AUTH_ENABLED || process.env.AUTH_ENABLED === "true";

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

    // 检查 token 是否过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return c.json({ error: "令牌已过期" }, 401);
    }

    // 将 payload 存储到 context 中
    c.set("jwtPayload", payload);

    await next();
  } catch (err) {
    return c.json({ error: "无效的令牌" }, 403);
  }
};
