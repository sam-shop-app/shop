"use client";

import { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { addToast, Button, Card, CardBody, CardFooter, CardHeader, Table, TableHeader, TableColumn, TableBody as HeroTableBody, TableRow, TableCell, Image, Chip, Tooltip, Checkbox } from "@heroui/react";
import { UploadCloud, File as FileIcon, X, ArrowRight, CheckCircle2, Tag } from "lucide-react";
import { api } from "@/lib/api";
import { type Product as ProductType } from "sam-api/types";

// Interfaces...
interface PriceInfo {
  priceType: number;
  price: string;
}

interface StockInfo {
  stockQuantity: number;
}

interface Product {
  spuId: string;
  storeId: string;
  title?: string;
  subTitle?: string;
  image?: string;
  priceInfo?: PriceInfo[];
  stockInfo?: StockInfo;
  isAvailable?: boolean;
  isImport?: boolean;
  selected?: boolean;
  categoryIdList?: string[];
}

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  level: number;
  image_url?: string;
  sort_order: number;
  children?: Category[];
}

// 虚拟滚动列表项组件
const VirtualProductItem = ({ 
  product, 
  isSelected, 
  onSelectionChange, 
  getCategoryInfo 
}: {
  product: ProductType & { selected: boolean };
  isSelected: boolean;
  onSelectionChange: (isSelected: boolean) => void;
  getCategoryInfo: (categoryIds?: string[]) => { name: string; level: number; fullPath: string; levelText: string }[];
}) => {
  const categoryInfo = getCategoryInfo(product.categoryIdList);
  
  return (
    <div className="flex items-center gap-3 p-3 border-b border-divider hover:bg-content2/50 transition-colors">
      <Checkbox
        isSelected={isSelected}
        onValueChange={onSelectionChange}
        size="sm"
      />
      
      {/* 图片 */}
      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
        {product.image ? (
          <Image src={product.image} alt={product.title || ""} className="object-cover w-full h-full" width={48} height={48} />
        ) : (
          <FileIcon className="w-6 h-6 text-gray-400" />
        )}
      </div>
      
      {/* SPU/店铺 ID */}
      <div className="w-24 flex-shrink-0">
        <div className="font-mono text-xs">{product.spuId}</div>
        <div className="font-mono text-xs text-gray-500">{product.storeId}</div>
      </div>
      
      {/* 标题 */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm line-clamp-1">{product.title}</div>
        <div className="text-xs text-gray-500 line-clamp-1">{product.subTitle}</div>
      </div>
      
      {/* 价格 */}
      <div className="w-20 text-right font-medium flex-shrink-0">
        ¥{product.priceInfo?.[0]?.price || "0"}
      </div>
      
      {/* 库存 */}
      <div className="w-16 text-right flex-shrink-0">
        {product.stockInfo?.stockQuantity || 0}
      </div>
      
      {/* 分类 */}
      <div className="w-48 flex-shrink-0">
        <div className="flex flex-wrap gap-1">
          {categoryInfo.length > 0 ? (
            categoryInfo.map((info, index) => (
              <Tooltip
                key={index}
                content={
                  <div className="px-2 py-3 max-w-sm">
                    <div className="text-tiny font-bold mb-2">{info.levelText}</div>
                    <div className="text-tiny space-y-1.5">
                      <div className="flex items-start gap-2 p-1 rounded bg-content2/50">
                        <Tag className={`w-2.5 h-2.5 mt-0.5 ${
                          info.level === 1 ? 'text-danger' : 
                          info.level === 2 ? 'text-warning' : 'text-success'
                        }`} />
                        <div>
                          <div className="font-medium">{info.name}</div>
                          <div className="text-xs text-default-500">{info.fullPath}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                delay={300}
                closeDelay={100}
                placement="top"
                className="max-w-md"
              >
                <Chip
                  size="sm"
                  variant="flat"
                  color={info.level === 1 ? "danger" : info.level === 2 ? "warning" : "success"}
                  startContent={<Tag className="w-3 h-3" />}
                  className="mb-1 mr-1 cursor-help"
                >
                  <span className="flex items-center gap-1">
                    <span className="text-xs opacity-70">{info.levelText.charAt(0)}</span>
                    <span>{info.name.length > 8 ? `${info.name.slice(0, 8)}...` : info.name}</span>
                  </span>
                </Chip>
              </Tooltip>
            ))
          ) : (
            <span className="text-xs text-gray-400">无分类</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 虚拟滚动容器组件
const VirtualProductList = ({ 
  products, 
  onSelectionChange, 
  getCategoryInfo 
}: {
  products: (ProductType & { selected: boolean })[];
  onSelectionChange: (productKey: string, isSelected: boolean) => void;
  getCategoryInfo: (categoryIds?: string[]) => { name: string; level: number; fullPath: string; levelText: string }[];
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const itemHeight = 72; // 每项高度
  const overscan = 5; // 预渲染项数
  
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    products.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = products.slice(startIndex, endIndex + 1);
  const totalHeight = products.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div className="flex flex-col h-full">
      {/* 表头 */}
      <div className="flex items-center gap-3 p-3 bg-content1 border-b border-divider font-medium text-sm sticky top-0 z-10">
        <div className="w-6"></div> {/* Checkbox 占位 */}
        <div className="w-12 flex-shrink-0">图片</div>
        <div className="w-24 flex-shrink-0">SPU/店铺 ID</div>
        <div className="flex-1 min-w-0">标题</div>
        <div className="w-20 text-right flex-shrink-0">价格</div>
        <div className="w-16 text-right flex-shrink-0">库存</div>
        <div className="w-48 flex-shrink-0">分类</div>
      </div>

      {/* 虚拟滚动容器 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((product, index) => {
              const actualIndex = startIndex + index;
              const productKey = `${product.spuId}-${product.storeId}`;
              
              return (
                <VirtualProductItem
                  key={productKey}
                  product={product}
                  isSelected={product.selected}
                  onSelectionChange={(isSelected) => onSelectionChange(productKey, isSelected)}
                  getCategoryInfo={getCategoryInfo}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function ImportProductPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<(ProductType & { selected: boolean })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<string, Category>>(new Map());
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectedProducts = useMemo(() => products.filter(p => p.selected), [products]);
  const selectedProductsCount = useMemo(() => selectedProducts.length, [selectedProducts]);

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api('categories/tree');
        if (result.success && result.data) {
          const flatCategories: Category[] = [];
          const map = new Map<string, Category>();
          
          // 递归函数来扁平化分类树
          const flattenCategories = (cats: Category[]) => {
            cats.forEach(cat => {
              flatCategories.push(cat);
              map.set(cat.id, cat);
              if (cat.children && cat.children.length > 0) {
                flattenCategories(cat.children);
              }
            });
          };
          
          flattenCategories(result.data);
          setCategories(flatCategories);
          setCategoriesMap(map);
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
        addToast({
          title: '警告',
          description: '无法获取分类数据，将不显示分类信息',
          color: "warning",
        });
      }
    };
    
    fetchCategories();
  }, []);

  // 根据分类ID获取分类名称和层级信息
  const getCategoryInfo = (categoryIds?: string[]): { name: string; level: number; fullPath: string; levelText: string }[] => {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    return categoryIds
      .map(id => {
        const category = categoriesMap.get(id);
        if (!category) return null;
        
        // 构建完整路径
        const buildPath = (cat: Category): string => {
          if (!cat.parent_id) return cat.name;
          const parent = categoriesMap.get(cat.parent_id);
          return parent ? `${buildPath(parent)} > ${cat.name}` : cat.name;
        };
        
        // 获取层级文本
        const getLevelText = (level: number): string => {
          switch (level) {
            case 1: return '一级分类';
            case 2: return '二级分类';
            case 3: return '三级分类';
            default: return `${level}级分类`;
          }
        };
        
        return {
          name: category.name,
          level: category.level,
          fullPath: buildPath(category),
          levelText: getLevelText(category.level)
        };
      })
      .filter(Boolean) as { name: string; level: number; fullPath: string; levelText: string }[];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.har')) {
      setFile(selectedFile);
      addToast({
        title: '文件已选择',
        description: selectedFile.name,
        color: "success",
      });
    } else {
      addToast({
        title: '错误',
        description: "请选择一个有效的 .har 文件。",
        color: "danger",
      });
    }
  };

  const handleParseHarFile = async () => {
    if (!file) {
      addToast({
        title: '错误',
        description: "请先选择一个HAR文件。",
        color: "danger",
      });
      return;
    }

    setIsParsing(true);
    try {
      const harContent = await file.text();
      const parsedProducts: ProductType[] = await api('products/parse', {
        method: 'POST',
        body: harContent,
      });

      if (Array.isArray(parsedProducts)) {
        setProducts(parsedProducts.map(p => ({ ...p, selected: true })));
        addToast({
          title: '成功',
          description: `已成功从文件中解析出 ${parsedProducts.length} 个商品。`,
          color: "success",
        });
      } else {
        throw new Error("从API返回了无效的数据格式");
      }
    } catch (err) {
      addToast({
        title: '错误',
        description: (err as Error).message,
        color: "danger",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setProducts(prev => prev.map(p => ({ ...p, selected: isSelected })));
  };

  const handleProductSelectionChange = (productKey: string, isSelected: boolean) => {
    setProducts(prev => prev.map(p => 
      `${p.spuId}-${p.storeId}` === productKey 
        ? { ...p, selected: isSelected }
        : p
    ));
  };
  
  const handleUpload = async () => {
    setIsUploading(true);
    try {
      if (selectedProducts.length === 0) {
        addToast({
          title: '错误',
          description: "请至少选择一个商品以上传。",
          color: "danger",
        });
        return;
      }

      const result: { success: boolean } = await api('products/upsert', {
        method: 'POST',
        body: JSON.stringify(selectedProducts.map(({ selected, ...p }) => p)),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.success) {
        addToast({
          title: '成功',
          description: `已成功导入 ${selectedProducts.length} 个商品。`,
          color: "success",
        });
        router.push("/products");
      }
    } catch (err) {
      addToast({
        title: '错误',
        description: (err as Error).message,
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当离开整个拖拽区域时才设置为false
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.har')) {
      setFile(droppedFile);
      addToast({
        title: '文件已拖入',
        description: droppedFile.name,
        color: "success",
      });
    } else {
      addToast({
        title: '错误',
        description: "请拖入一个有效的 .har 文件。",
        color: "danger",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">导入新商品</h1>
        <p className="text-gray-500 mt-1">
          上传 HAR 文件以批量解析和导入商品。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-md lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm">1</span>
              上传 HAR 文件
            </h3>
            <p className="text-sm text-gray-500">在下方选择或拖放你的 .har 文件。</p>
          </CardHeader>
          <CardBody>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg' 
                  : file 
                    ? 'border-success bg-success/5' 
                    : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {isDragOver ? (
                <>
                  <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse"></div>
                  <div className="relative z-10">
                    <UploadCloud className="mx-auto h-16 w-16 text-primary animate-bounce" />
                    <p className="mt-4 text-lg font-semibold text-primary">
                      松开以上传文件
                    </p>
                    <p className="text-sm text-primary/80">
                      HAR 文件将被解析并预览
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className={`mx-auto h-12 w-12 ${file ? 'text-success' : 'text-gray-400'}`} />
                  <p className="mt-2 text-sm text-gray-600">
                    拖拽文件或 <span className="font-semibold text-primary">浏览文件</span>
                  </p>
                  {file ? (
                    <p className="text-xs text-success mt-1">✓ 文件已选择</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">支持 .har 格式文件</p>
                  )}
                </>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".har"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button isIconOnly variant="light" onPress={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardBody>
          <CardFooter>
            <Button
              color="primary"
              onPress={handleParseHarFile}
              isDisabled={!file || isParsing}
              isLoading={isParsing}
              fullWidth
              endContent={!isParsing && <ArrowRight className="h-4 w-4" />}
            >
              {isParsing ? "正在解析..." : "解析并预览"}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2">
          {products.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm">2</span>
                    预览并确认
                </h3>
                <div className="flex justify-between items-center pt-2">
                    <p className="text-sm text-gray-500">
                      发现 {products.length} 个商品。请选择你想要导入的项。
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        isSelected={selectedProductsCount === products.length}
                        isIndeterminate={selectedProductsCount > 0 && selectedProductsCount < products.length}
                        onValueChange={toggleSelectAll}
                        size="sm"
                      >
                        全选
                      </Checkbox>
                    </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="h-[500px]"> {/* 固定高度容器 */}
                  <VirtualProductList
                    products={products}
                    onSelectionChange={handleProductSelectionChange}
                    getCategoryInfo={getCategoryInfo}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex-col items-stretch gap-4 pt-6">
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex gap-4 text-gray-500">
                      <span>总商品: {products.length}</span>
                      <span>有分类: {products.filter(p => p.categoryIdList && p.categoryIdList.length > 0).length}</span>
                      <span>无分类: {products.filter(p => !p.categoryIdList || p.categoryIdList.length === 0).length}</span>
                    </div>
                    <span className="text-gray-500">
                        已选择 <span className="font-bold text-primary">{selectedProductsCount}</span> / {products.length} 个商品
                    </span>
                 </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="bordered" onPress={() => router.push("/products")}>取消</Button>
                    <Button 
                      color="primary"
                      onPress={handleUpload}
                      isDisabled={isUploading || selectedProductsCount === 0}
                      isLoading={isUploading}
                      startContent={!isUploading && <CheckCircle2 className="h-4 w-4" />}
                    >
                      {isUploading ? "正在导入..." : `导入 ${selectedProductsCount} 个商品`}
                    </Button>
                 </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ImportProductPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">导入新商品</h1>
          <p className="text-gray-500 mt-1">正在加载...</p>
        </div>
      </div>
    }>
      <ImportProductPageContent />
    </Suspense>
  );
} 