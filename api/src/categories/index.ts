import { Hono } from "hono";
import { getConnection } from "../utils/connection";
import type { Category, CategoryWithChildren } from "../types";

// 创建 Hono 子应用实例
const app = new Hono();


/**
 * 获取所有分类
 */
export async function getAllCategories() {
  const connection = await getConnection();
  try {
    const [categories] = await connection.query<Category[]>(`
      SELECT id, parent_id, name, level, image_url, sort_order 
      FROM product_categories
      ORDER BY level, sort_order ASC
    `);
    return { success: true, data: categories };
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return { success: false, error: String(error) };
  } finally {
    connection.release();
  }
}

/**
 * 根据层级获取分类
 */
export async function getCategoriesByLevel(level: number) {
  const connection = await getConnection();
  try {
    const [categories] = await connection.query<Category[]>(
      `SELECT id, parent_id, name, level, image_url, sort_order 
       FROM product_categories 
       WHERE level = ? 
       ORDER BY sort_order ASC`,
      [level]
    );
    return { success: true, data: categories };
  } catch (error) {
    console.error(`获取第${level}级分类失败:`, error);
    return { success: false, error: String(error) };
  } finally {
    connection.release();
  }
}

/**
 * 根据父分类ID获取子分类
 */
export async function getSubcategories(parentId: string) {
  const connection = await getConnection();
  try {
    const [categories] = await connection.query<Category[]>(
      `SELECT id, parent_id, name, level, image_url, sort_order 
       FROM product_categories 
       WHERE parent_id = ? 
       ORDER BY sort_order ASC`,
      [parentId]
    );
    return { success: true, data: categories };
  } catch (error) {
    console.error(`获取父分类ID为${parentId}的子分类失败:`, error);
    return { success: false, error: String(error) };
  } finally {
    connection.release();
  }
}

/**
 * 获取分类树结构（组织为层次结构）
 */
export async function getCategoryTree() {
  const connection = await getConnection();
  try {
    // 先获取所有分类
    const [allCategories] = await connection.query<Category[]>(`
      SELECT id, parent_id, name, level, image_url, sort_order 
      FROM product_categories
      ORDER BY level, sort_order ASC
    `);
    
    // 构建分类树
    const categoryMap = new Map<string, CategoryWithChildren>();
    const tree: CategoryWithChildren[] = [];
    
    // 先将所有分类添加到 Map 中，以便后续查找
    allCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });
    
    // 构建树结构
    allCategories.forEach((category) => {
      const node = categoryMap.get(category.id);
      
      if (category.parent_id === null) {
        // 顶级分类
        tree.push(node!);
      } else {
        // 子分类，添加到父分类的 children 数组
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(node!);
        }
      }
    });
    
    return { success: true, data: tree };
  } catch (error) {
    console.error("获取分类树失败:", error);
    return { success: false, error: String(error) };
  } finally {
    connection.release();
  }
}

// GET /categories - 获取所有分类
app.get("/", async (c) => {
  const result = await getAllCategories();
  if (result.success) {
    return c.json(result);
  } else {
    return c.json(result, 500);
  }
});

// GET /categories/tree - 获取分类树
app.get("/tree", async (c) => {
  const result = await getCategoryTree();
  if (result.success) {
    return c.json(result);
  } else {
    return c.json(result, 500);
  }
});

// GET /categories/level/:level - 根据层级获取分类
app.get("/level/:level", async (c) => {
  const level = parseInt(c.req.param("level"));
  if (isNaN(level) || level < 1 || level > 3) {
    return c.json({ success: false, error: "无效的层级参数，应为1-3的整数" }, 400);
  }
  
  const result = await getCategoriesByLevel(level);
  if (result.success) {
    return c.json(result);
  } else {
    return c.json(result, 500);
  }
});

// GET /categories/:parentId/children - 获取子分类
app.get("/:parentId/children", async (c) => {
  const parentId = c.req.param("parentId");
  if (!parentId) {
    return c.json({ success: false, error: "缺少父分类ID参数" }, 400);
  }
  
  const result = await getSubcategories(parentId);
  if (result.success) {
    return c.json(result);
  } else {
    return c.json(result, 500);
  }
});

export default app; 