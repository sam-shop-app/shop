import mysql from "mysql2/promise";

/**
 * MySQL 数据库连接模块
 * 此模块提供了到 MySQL 数据库的连接池
 */

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || "sam-app-mysql",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "hotdogc1017",
  database: process.env.DB_NAME || "sam_app_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接成功返回 true，否则返回 false
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("成功连接到 MySQL 数据库");
    connection.release();
    return true;
  } catch (error) {
    console.error("连接 MySQL 数据库时出错:", error);
    return false;
  }
}

/**
 * 执行带参数的 SQL 查询
 * @param {string} sql - 要执行的 SQL 查询语句
 * @param {any[]} params - 查询参数
 * @returns {Promise<T>} 查询结果
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error("数据库查询错误:", error);
    throw error;
  }
}

/**
 * 从连接池获取一个数据库连接
 * @returns {Promise<mysql.PoolConnection>} 数据库连接
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  return pool.getConnection();
}

// 导出包含所有函数的默认对象
export default {
  pool,
  testConnection,
  query,
  getConnection,
};
