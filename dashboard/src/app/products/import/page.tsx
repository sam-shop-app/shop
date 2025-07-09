"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardFooter, CardHeader, Table, TableHeader, TableColumn, TableBody as HeroTableBody, TableRow, TableCell, Image } from "@heroui/react";
import { toast } from "sonner";
import { UploadCloud, File as FileIcon, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

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
}


export default function ImportProductPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const selectedProductsCount = useMemo(() => products.filter(p => p.selected).length, [products]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.har')) {
      setFile(selectedFile);
    } else {
      toast.error("请选择一个有效的 .har 文件。");
    }
  };

  const handleParseHarFile = async () => {
    if (!file) {
      toast.error("请先选择一个HAR文件。");
      return;
    }
    
    setLoading(true);
    
    try {
      const fileContent = await file.text();
      const parsedProducts = await api("/products/parse", {
        method: "POST",
        body: fileContent,
        headers: { "Content-Type": "application/json" },
      });
      
      if (Array.isArray(parsedProducts)) {
        setProducts(parsedProducts.map(p => ({ ...p, selected: true })));
        toast.success("解析成功", {
          description: `已成功从文件中解析出 ${parsedProducts.length} 个商品。`,
        });
      } else {
        throw new Error("从API返回了无效的数据格式");
      }
    } catch (err) {
      toast.error("解析HAR文件失败", {
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = (isSelected: boolean) => {
    setProducts(prev => prev.map(p => ({ ...p, selected: isSelected })));
  };
  
  const handleUploadProducts = async () => {
    const selectedProducts = products.filter(p => p.selected);
    
    if (selectedProducts.length === 0) {
      toast.error("请至少选择一个商品以上传。");
      return;
    }
    
    setUploading(true);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const productsToUpload = selectedProducts.map(({ selected, ...product }) => product);
      const result = await api("/products/upsert", {
        method: "POST",
        body: productsToUpload,
      });
      
      if (result.success) {
        toast.success("上传成功", {
          description: `已成功导入 ${selectedProducts.length} 个商品。`,
        });
        router.push("/products");
      } else {
        throw new Error(result.error || "上传商品失败");
      }
    } catch (err) {
      toast.error("上传商品失败", {
        description: (err as Error).message,
      });
    } finally {
      setUploading(false);
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
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
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
              <p className="mt-2 text-sm text-gray-600">
                拖拽文件或 <span className="font-semibold text-primary">浏览文件</span>
              </p>
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
              isDisabled={!file || loading}
              isLoading={loading}
              fullWidth
              endContent={!loading && <ArrowRight className="h-4 w-4" />}
            >
              {loading ? "正在解析..." : "解析并预览"}
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
                </div>
              </CardHeader>
              <CardBody className="p-0">
                  <Table 
                    aria-label="商品预览表"
                    selectionMode="multiple"
                    selectedKeys={products.filter(p => p.selected).map(p => `${p.spuId}-${p.storeId}`)}
                    onSelectionChange={(keys) => {
                        if (keys === 'all') {
                            toggleSelectAll(true);
                        } else {
                            const selectedKeys = new Set(Array.from(keys).map(String));
                            setProducts(prev => prev.map(p => ({
                                ...p,
                                selected: selectedKeys.has(`${p.spuId}-${p.storeId}`)
                            })));
                        }
                    }}
                  >
                    <TableHeader>
                      <TableColumn>图片</TableColumn>
                      <TableColumn>SPU/店铺 ID</TableColumn>
                      <TableColumn>标题</TableColumn>
                      <TableColumn>价格</TableColumn>
                      <TableColumn>库存</TableColumn>
                    </TableHeader>
                    <HeroTableBody>
                      {products.map((product) => (
                        <TableRow key={`${product.spuId}-${product.storeId}`}>
                          <TableCell className="p-2">
                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                {product.image ? (
                                    <Image src={product.image} alt={product.title || ""} className="object-cover w-full h-full" width={48} height={48} />
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
                            <div className="text-xs text-gray-500 line-clamp-1">{product.subTitle}</div>
                          </TableCell>
                          <TableCell className="font-medium">¥{product.priceInfo?.[0]?.price || "0"}</TableCell>
                          <TableCell>{product.stockInfo?.stockQuantity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </HeroTableBody>
                  </Table>
              </CardBody>
              <CardFooter className="flex-col items-stretch gap-4 pt-6">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">汇总</span>
                    <span className="text-gray-500">
                        已选择 <span className="font-bold text-primary">{selectedProductsCount}</span> / {products.length} 个商品
                    </span>
                 </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="bordered" onPress={() => router.push("/products")}>取消</Button>
                    <Button 
                      color="primary"
                      onPress={handleUploadProducts}
                      isDisabled={uploading || selectedProductsCount === 0}
                      isLoading={uploading}
                      startContent={!uploading && <CheckCircle2 className="h-4 w-4" />}
                    >
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