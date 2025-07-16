import { Hono } from "hono";
import { sign } from "hono/jwt";
import db, { getConnection } from "../utils/connection";
import type { User, UserCredentials, UserRegistration } from "@/types";
import { authMiddleware } from "../middleware/auth";
import {
  hashPassword,
  comparePassword,
  generateVerificationCode,
  isValidPhone,
  isValidEmail,
} from "../utils/auth";
import {
  sendEmail,
  sendSMS,
  getVerificationCodeTemplate,
  getSMSTemplate,
} from "../utils/notification";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Register default user
export async function registerDefaultUser() {
  const defaultUser = {
    username: "admin",
    email: "admin@sam-supermarket.com",
    password: "admin",
    phone_number: "13800000000",
    full_name: "系统管理员",
  };

  await registerUser(defaultUser, { isAdmin: true });
}

// --- Business Logic Functions ---

export async function registerUser(
  userData: UserRegistration & { phone_number: string },
  options?: { isAdmin: boolean },
): Promise<{ id: number; token: string }> {
  const { username, email, password, phone_number, full_name, avatar_url } =
    userData;
  const { isAdmin = false } = options || {};

  if (!username || !email || !password || !phone_number) {
    throw new Error("用户名、邮箱、密码和手机号是必填项");
  }

  if (!isValidPhone(phone_number)) {
    throw new Error("手机号格式不正确");
  }

  if (!isValidEmail(email)) {
    throw new Error("邮箱格式不正确");
  }

  const hashedPassword = await hashPassword(password);

  const connection = await getConnection();
  try {
    // 检查用户名是否已存在
    const [usernameCheck] = (await connection.execute(
      "SELECT id FROM users WHERE username = ?",
      [username],
    )) as any[];

    if (usernameCheck.length > 0) {
      throw new Error("用户名已存在");
    }

    // 检查邮箱是否已存在
    const [emailCheck] = (await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    )) as any[];

    if (emailCheck.length > 0) {
      throw new Error("邮箱已存在");
    }

    // 检查手机号是否已存在
    const [phoneCheck] = (await connection.execute(
      "SELECT id FROM users WHERE phone_number = ?",
      [phone_number],
    )) as any[];

    if (phoneCheck.length > 0) {
      throw new Error("手机号已存在");
    }

    // 插入新用户
    const [result] = (await connection.execute(
      `INSERT INTO users (username, email, password, phone_number, full_name, avatar_url, role, phone_verified, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        phone_number,
        full_name || null,
        avatar_url || null,
        isAdmin ? "admin" : "client",
        false,
        false,
      ],
    )) as any;

    // 自动登录
    const userId = result.insertId;
    const payload = {
      id: userId,
      username,
      role: isAdmin ? "admin" : "client",
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24小时
    };
    const token = await sign(payload, JWT_SECRET, "HS512");

    // 更新最后登录时间
    await connection.execute(
      "UPDATE users SET last_login_at = NOW(), login_method = 'password' WHERE id = ?",
      [userId],
    );

    return { id: userId, token };
  } finally {
    connection.release();
  }
}

export async function loginUser(
  credentials: UserCredentials,
): Promise<{ user: Partial<User>; token: string }> {
  const { username, password } = credentials;
  if (!username || !password) {
    throw new Error("账号和密码是必填项");
  }

  const connection = await getConnection();
  try {
    // 自动识别登录类型：用户名、手机号或邮箱
    let query = "SELECT * FROM users WHERE status = 1 AND (username = ?";
    const params = [username];

    // 如果输入看起来像手机号，也尝试匹配手机号字段
    if (isValidPhone(username)) {
      query += " OR phone_number = ?";
      params.push(username);
    }

    // 如果输入看起来像邮箱，也尝试匹配邮箱字段
    if (isValidEmail(username)) {
      query += " OR email = ?";
      params.push(username);
    }

    query += ")";

    const [rows] = (await connection.execute(query, params)) as [User[], any];

    if (rows.length === 0) {
      throw new Error("无效的用户名或密码");
    }

    const user = rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("无效的用户名或密码");
    }

    // 记录登录日志
    await connection.execute(
      "INSERT INTO user_login_logs (user_id, login_method, ip_address) VALUES (?, ?, ?)",
      [user.id, "password", null], // IP地址需要从请求中获取
    );

    // 更新最后登录时间
    await connection.execute(
      "UPDATE users SET last_login_at = NOW(), login_method = 'password' WHERE id = ?",
      [user.id],
    );

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24小时
    };
    const token = await sign(payload, JWT_SECRET, "HS512");

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  } finally {
    connection.release();
  }
}

export async function sendVerificationCode(
  recipient: string,
  type: "phone" | "email",
  purpose: "login" | "register",
): Promise<void> {
  const connection = await getConnection();
  try {
    // 检查发送频率（1分钟内只能发送一次）
    const [recentLogs] = (await connection.execute(
      `SELECT * FROM verification_logs
       WHERE recipient = ? AND type = ? AND sent_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
      [recipient, type],
    )) as any[];

    if (recentLogs.length > 0) {
      throw new Error("验证码发送过于频繁，请稍后再试");
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟后过期

    // 如果是登录，检查用户是否存在
    if (purpose === "login") {
      const field = type === "phone" ? "phone_number" : "email";
      const [users] = (await connection.execute(
        `SELECT id FROM users WHERE ${field} = ? AND status = 1`,
        [recipient],
      )) as any[];

      if (users.length === 0) {
        throw new Error(type === "phone" ? "手机号未注册" : "邮箱未注册");
      }
    }

    // 记录验证码
    await connection.execute(
      "INSERT INTO verification_logs (recipient, type, purpose, code) VALUES (?, ?, ?, ?)",
      [recipient, type, purpose, code],
    );

    // 发送验证码
    if (type === "phone") {
      const message = getSMSTemplate(code, purpose);
      await sendSMS(recipient, message);
    } else {
      const subject = purpose === "login" ? "登录验证码" : "注册验证码";
      const html = getVerificationCodeTemplate(code, purpose);
      await sendEmail(recipient, subject, html);
    }
  } finally {
    connection.release();
  }
}

export async function sendVerificationCodeAuto(
  recipient: string,
  purpose: "login" | "register",
): Promise<void> {
  // 自动识别输入类型
  let type: "phone" | "email";
  if (isValidPhone(recipient)) {
    type = "phone";
  } else if (isValidEmail(recipient)) {
    type = "email";
  } else {
    throw new Error("请输入有效的手机号或邮箱");
  }

  return sendVerificationCode(recipient, type, purpose);
}

export async function loginWithCodeAuto(
  recipient: string,
  code: string,
): Promise<{ user: Partial<User>; token: string }> {
  // 自动识别输入类型
  let type: "phone" | "email";
  if (isValidPhone(recipient)) {
    type = "phone";
  } else if (isValidEmail(recipient)) {
    type = "email";
  } else {
    throw new Error("请输入有效的手机号或邮箱");
  }

  return loginWithCode(recipient, code, type);
}

export async function loginWithCode(
  recipient: string,
  code: string,
  type: "phone" | "email",
): Promise<{ user: Partial<User>; token: string }> {
  const connection = await getConnection();
  try {
    // 验证验证码
    const [logs] = (await connection.execute(
      `SELECT * FROM verification_logs
       WHERE recipient = ? AND type = ? AND code = ? AND purpose = 'login'
       AND sent_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND used = FALSE
       ORDER BY sent_at DESC LIMIT 1`,
      [recipient, type, code],
    )) as any[];

    if (logs.length === 0) {
      throw new Error("验证码无效或已过期");
    }

    // 标记验证码已使用
    await connection.execute(
      "UPDATE verification_logs SET used = TRUE, used_at = NOW() WHERE id = ?",
      [logs[0].id],
    );

    // 查找用户
    const field = type === "phone" ? "phone_number" : "email";
    const [users] = (await connection.execute(
      `SELECT * FROM users WHERE ${field} = ? AND status = 1`,
      [recipient],
    )) as [User[], any];

    if (users.length === 0) {
      throw new Error("用户不存在");
    }

    const user = users[0];

    // 更新验证状态
    if (type === "phone") {
      await connection.execute(
        "UPDATE users SET phone_verified = TRUE, last_login_at = NOW(), login_method = 'phone' WHERE id = ?",
        [user.id],
      );
    } else {
      await connection.execute(
        "UPDATE users SET email_verified = TRUE, last_login_at = NOW(), login_method = 'email' WHERE id = ?",
        [user.id],
      );
    }

    // 记录登录日志
    await connection.execute(
      "INSERT INTO user_login_logs (user_id, login_method) VALUES (?, ?)",
      [user.id, type],
    );

    // 生成JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24小时
    };
    const token = await sign(payload, JWT_SECRET, "HS512");

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  } finally {
    connection.release();
  }
}

export async function getUsers(options: { page?: number; pageSize?: number }) {
  const { page = 1, pageSize = 10 } = options;
  const connection = await getConnection();
  try {
    let sql =
      "SELECT id, username, email, phone_number, full_name, role, created_at, status, avatar_url, phone_verified, email_verified FROM users";
    const values = [];

    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(pageSize, offset);

    const [users] = await connection.query(sql, values);
    const [totalResult] = (await connection.query(
      "SELECT COUNT(*) as total FROM users",
    )) as any[];

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

export async function getUserProfile(userId: number): Promise<Partial<User>> {
  const connection = await getConnection();
  try {
    const [users] = (await connection.execute(
      `SELECT id, username, email, phone_number, full_name, avatar_url, role, status,
              phone_verified, email_verified, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId],
    )) as [User[], any];

    if (users.length === 0) {
      throw new Error("用户不存在");
    }

    return users[0];
  } finally {
    connection.release();
  }
}

// --- Hono Routes ---

const users = new Hono();

// 注册
users.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const result = await registerUser(body);
    return c.json(
      {
        message: "用户注册成功",
        user: { id: result.id },
        token: result.token,
      },
      201,
    );
  } catch (error: any) {
    // 现在registerUser函数会抛出友好的错误消息
    return c.json({ error: error.message || "注册失败" }, 400);
  }
});

// 用户名密码登录
users.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const result = await loginUser(body);
    return c.json(result);
  } catch (error: any) {
    if (error.message === "无效的用户名或密码") {
      return c.json({ error: error.message }, 401);
    }
    return c.json({ error: error.message || "登录失败" }, 400);
  }
});

// 发送验证码
users.post("/send-verification-code", async (c) => {
  try {
    const { recipient, type, purpose } = await c.req.json();

    if (!recipient || !type || !purpose) {
      return c.json({ error: "参数不完整" }, 400);
    }

    if (type !== "phone" && type !== "email") {
      return c.json({ error: "类型无效" }, 400);
    }

    if (purpose !== "login" && purpose !== "register") {
      return c.json({ error: "用途无效" }, 400);
    }

    if (type === "phone" && !isValidPhone(recipient)) {
      return c.json({ error: "手机号格式不正确" }, 400);
    }

    if (type === "email" && !isValidEmail(recipient)) {
      return c.json({ error: "邮箱格式不正确" }, 400);
    }

    await sendVerificationCode(recipient, type, purpose);
    return c.json({ message: "验证码已发送" });
  } catch (error: any) {
    return c.json({ error: error.message || "发送失败" }, 400);
  }
});

// 验证码登录
users.post("/login-with-code", async (c) => {
  try {
    const { recipient, code, type } = await c.req.json();

    if (!recipient || !code || !type) {
      return c.json({ error: "参数不完整" }, 400);
    }

    const result = await loginWithCode(recipient, code, type);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "登录失败" }, 400);
  }
});

// 发送验证码（自动识别手机号/邮箱）
users.post("/send-verification-code-auto", async (c) => {
  try {
    const { recipient, purpose } = await c.req.json();

    if (!recipient || !purpose) {
      return c.json({ error: "参数不完整" }, 400);
    }

    if (purpose !== "login" && purpose !== "register") {
      return c.json({ error: "用途无效" }, 400);
    }

    await sendVerificationCodeAuto(recipient, purpose);
    return c.json({ message: "验证码已发送" });
  } catch (error: any) {
    return c.json({ error: error.message || "发送失败" }, 400);
  }
});

// 验证码登录（自动识别手机号/邮箱）
users.post("/login-with-code-auto", async (c) => {
  try {
    const { recipient, code } = await c.req.json();

    if (!recipient || !code) {
      return c.json({ error: "参数不完整" }, 400);
    }

    const result = await loginWithCodeAuto(recipient, code);
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "登录失败" }, 400);
  }
});

// 获取当前用户信息
users.get("/profile", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    const user = await getUserProfile(payload.id);
    return c.json(user);
  } catch (error: any) {
    return c.json({ error: error.message || "获取用户信息失败" }, 400);
  }
});

// 获取用户列表（需要管理员权限）
users.get("/", authMiddleware, async (c) => {
  try {
    const payload = c.get("jwtPayload");
    if (payload.role !== "admin") {
      return c.json({ error: "无权限访问" }, 403);
    }

    const { page, pageSize } = c.req.query();
    const result = await getUsers({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message || "获取用户列表失败" }, 500);
  }
});

export default users;
