// src/category-extractor.ts
import type { Har, Category as ProductCategory } from '../types';

interface Category {
    groupingId: string;
    title: string;
    level: number;
    image?: string;
    children?: Category[];
}

// 递归函数，用于将层级结构的分类数据扁平化
function flattenCategories(categories: Category[], parentId: string | null, sortOrderOffset = 0): ProductCategory[] {
  let results: ProductCategory[] = [];
  categories.forEach((category, index) => {
    results.push({
      id: category.groupingId,
      parent_id: parentId,
      name: category.title,
      level: category.level,
      image_url: category.image || null,
      sort_order: sortOrderOffset + index,
    } as ProductCategory);
    if (category.children && category.children.length > 0) {
      results = results.concat(flattenCategories(category.children, category.groupingId));
    }
  });
  return results;
}

/**
 * 从HAR文件内容中提取并构建完整的分类体系。
 * @param harContent - HAR文件的字符串内容
 * @returns {ProductCategory[]} - 扁平化后的分类对象数组
 */
export function extractCategoriesFromHar(): string {
    let harContent = '';
    const reader = process.stdin.setEncoding('utf8');
    reader.on('data', (chunk) => {
        console.log(chunk);
        harContent += chunk;
    });
    reader.on('end', () => {
        try {
            const har: Har = JSON.parse(harContent);
            const entries = har.log.entries;
            const allCategories: ProductCategory[] = [];
            const processedIds = new Set<string>();
        
            // 1. 提取一级分类
            const homeEntry = entries.find(entry => entry.request.url.includes('/home/portal/v3/get'));
            if (homeEntry?.response?.content?.text) {
              const homeData = JSON.parse(homeEntry.response.content.text);
              const kingkongModule = homeData.data?.moduleList?.find((m: any) => m.moduleType === 'kingkong');
              if (kingkongModule?.moduleContent) {
                const kingkongData = JSON.parse(kingkongModule.moduleContent);
                kingkongData.data.forEach((cat: any, index: number) => {
                  const jumpLink = new URLSearchParams(cat.jumpLink.split('?')[1]);
                  const catId = jumpLink.get('firstCategoryId');
                  if (catId && !processedIds.has(catId)) {
                    allCategories.push({
                      id: catId,
                      parent_id: null,
                      name: cat.title,
                      level: 1,
                      image_url: cat.picUrl || null,
                      sort_order: index,
                    } as ProductCategory);
                    processedIds.add(catId);
                  }
                });
              }
            }
            
            // 2. 提取二、三级分类
            const childrenEntries = entries.filter(entry => entry.request.url.includes('/goods-portal/grouping/queryChildren'));
            for (const entry of childrenEntries) {
                const requestBody = JSON.parse(entry.request!.postData!.text);
                const parentId = requestBody.groupingId;
                const responseBody = JSON.parse(entry.response.content.text);
                const children: Category[] = responseBody.data || [];
        
                const flattened = flattenCategories(children, parentId);
                for (const cat of flattened) {
                    if (!processedIds.has(cat.id)) {
                        allCategories.push(cat);
                        processedIds.add(cat.id);
                    }
                }
            }
        
            const insertStatements = allCategories.map(cat => 
                `INSERT INTO product_categories (id, parent_id, name, level, image_url, sort_order) VALUES ('${cat.id}', ${cat.parent_id ? `'${cat.parent_id}'` : 'NULL'}, '${cat.name.replace(/'/g, "''")}', ${cat.level}, ${cat.image_url ? `'${cat.image_url}'` : 'NULL'}, ${cat.sort_order}) ON DUPLICATE KEY UPDATE name=VALUES(name), level=VALUES(level), image_url=VALUES(image_url), sort_order=VALUES(sort_order);`
            ).join('\n');
            console.log(insertStatements);
            return insertStatements;
        
          } catch (error) {
            throw new Error(`解析HAR或提取分类时出错: ${(error as Error).message}`);
          }
    });
  
}

/**
 * 从标准输入中读取HAR文件内容，并提取分类数据。
 */
extractCategoriesFromHar();

