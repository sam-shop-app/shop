"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File as FileIcon, X, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

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
}

export default function ImportProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error,
      });
      setError(null); 
    }
  }, [error, toast]);
  
  const selectedProductsCount = useMemo(() => products.filter(p => p.selected).length, [products]);
  const allSelected = useMemo(() => products.length > 0 && selectedProductsCount === products.length, [products, selectedProductsCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.har')) {
      setFile(selectedFile);
    } else {
      setError("请选择一个有效的 .har 文件。");
    }
  };

  const handleParseHarFile = async () => {
    if (!file) {
      setError("请先选择一个HAR文件。");
      return;
    }
    
    setLoading(true);
    
    try {
      const fileContent = await file.text();
      const response = await fetch("http://localhost:13100/products/parse", {
        method: "POST",
        mode: "cors",
        body: fileContent,
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`解析HAR文件出错: ${response.statusText}`);
      }
      
      const parsedProducts = await response.json();
      
      if (Array.isArray(parsedProducts)) {
        setProducts(parsedProducts.map(p => ({ ...p, selected: true })));
        toast({
          title: "解析成功",
          description: `已成功从文件中解析出 ${parsedProducts.length} 个商品。`,
        });
      } else {
        throw new Error("从API返回了无效的数据格式");
      }
    } catch (err) {
      setError(`解析HAR文件失败: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (spuId: string, storeId: string) => {
    setProducts(prev => 
      prev.map(p => 
        p.spuId === spuId && p.storeId === storeId
          ? { ...p, selected: !p.selected }
          : p
      )
    );
  };
  
  const toggleSelectAll = () => {
    const newSelectAllState = !allSelected;
    setProducts(prev => prev.map(p => ({ ...p, selected: newSelectAllState })));
  };
  
  const handleUploadProducts = async () => {
    const selectedProducts = products.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      setError("请至少选择一个商品以上传。");
      return;
    }
    
    setUploading(true);
    
    try {
      const productsToUpload = selectedProducts.map(({ selected, ...product }) => product);
      const response = await fetch("http://localhost:3000/products/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productsToUpload),
      });
      
      if (!response.ok) {
        throw new Error(`上传商品出错: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "上传成功",
          description: `已成功导入 ${selectedProducts.length} 个商品。`,
        });
        router.push("/products");
      } else {
        throw new Error(result.error || "上传商品失败");
      }
    } catch (err) {
      setError(`上传商品失败: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">导入新商品</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          上传 HAR 文件以批量解析和导入商品。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-md lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm">1</span>
              上传 HAR 文件
            </CardTitle>
            <CardDescription>在下方选择或拖放你的 .har 文件。</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  setFile(droppedFile);
                }
              }}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                拖拽文件或 <span className="font-semibold text-primary">浏览文件</span>
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".har"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleParseHarFile}
              disabled={!file || loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "正在解析..." : "解析并预览"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2">
          {products.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-sm">2</span>
                  预览并确认
                </CardTitle>
                <div className="flex justify-between items-center pt-2">
                    <CardDescription>
                      发现 {products.length} 个商品。请选择你想要导入的项。
                    </CardDescription>
                    <div className="flex items-center gap-2">
                        <Checkbox 
                            id="select-all" 
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium">全选</label>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-t border-b overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800/30">
                      <TableRow>
                        <TableHead className="w-12 text-center"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} /></TableHead>
                        <TableHead className="w-20">图片</TableHead>
                        <TableHead>SPU/店铺 ID</TableHead>
                        <TableHead>标题</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>库存</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={`${product.spuId}-${product.storeId}`} className={product.selected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                          <TableCell className="text-center">
                            <Checkbox 
                              checked={product.selected}
                              onCheckedChange={() => toggleProductSelection(product.spuId, product.storeId)}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                                {product.image ? (
                                    <img src={product.image} alt={product.title || ""} className="object-cover w-full h-full" width={48} height={48} />
                                ) : (
                                    <FileIcon className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">{product.spuId}</div>
                            <div className="font-mono text-xs text-gray-500">{product.storeId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm line-clamp-1">{product.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{product.subTitle}</div>
                          </TableCell>
                          <TableCell className="font-medium">¥{product.priceInfo?.[0]?.price || "0"}</TableCell>
                          <TableCell>{product.stockInfo?.stockQuantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4 pt-6">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">汇总</span>
                    <span className="text-gray-500 dark:text-gray-400">
                        已选择 <span className="font-bold text-primary">{selectedProductsCount}</span> / {products.length} 个商品
                    </span>
                 </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.push("/products")}>取消</Button>
                    <Button 
                      onClick={handleUploadProducts}
                      disabled={uploading || selectedProductsCount === 0}
                      className="min-w-[160px]"
                    >
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      {uploading ? "正在导入..." : `导入 ${selectedProductsCount} 个商品`}
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