"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import Image from "next/image";

interface Product {
  id?: number;
  spuId: string;
  storeId: string;
  title?: string;
  subTitle?: string;
  image?: string;
  price?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  isImport?: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const mockProducts = Array.from({ length: 23 }, (_, i) => ({
          id: i + 1,
          spuId: `SPU${i + 1000}`,
          storeId: `STORE${Math.floor(Math.random() * 5) + 1}`,
          title: `商品 ${i + 1}`,
          subTitle: `这是商品 ${i + 1} 的详细描述`,
          image: "https://placehold.co/100x100",
          price: `${Math.floor(Math.random() * 1000) + 100}.00`,
          stockQuantity: Math.floor(Math.random() * 100),
          isAvailable: Math.random() > 0.2,
          isImport: Math.random() > 0.7,
        }));
        
        setProducts(mockProducts);
        setTotalPages(Math.ceil(mockProducts.length / itemsPerPage));
      } catch (err) {
        setError(`加载商品失败: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(search.toLowerCase()) ||
    product.spuId.toLowerCase().includes(search.toLowerCase()) ||
    product.storeId.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImportProducts = () => {
    router.push('/products/import');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">商品管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理和组织你的商品库存
          </p>
        </div>
        <Button 
          onClick={handleImportProducts} 
          className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> 导入商品
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索商品..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="h-3 w-3 mr-1" /> 筛选
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                状态: 全部
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 m-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">正在加载商品...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                      <TableHead className="w-20 font-medium">图片</TableHead>
                      <TableHead className="font-medium">SPU ID</TableHead>
                      <TableHead className="font-medium">店铺 ID</TableHead>
                      <TableHead className="font-medium">标题</TableHead>
                      <TableHead className="font-medium">价格</TableHead>
                      <TableHead className="font-medium">库存</TableHead>
                      <TableHead className="font-medium">状态</TableHead>
                      <TableHead className="font-medium">来源</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product) => (
                        <TableRow 
                          key={product.id || `${product.spuId}-${product.storeId}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                        >
                          <TableCell className="p-2">
                            {product.image ? (
                              <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img 
                                  src={product.image} 
                                  alt={product.title || "商品图片"} 
                                  className="object-cover w-full h-full"
                                  width={48}
                                  height={48}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{product.spuId}</TableCell>
                          <TableCell className="font-mono text-xs">{product.storeId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium line-clamp-1">{product.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{product.subTitle}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">¥{product.price}</TableCell>
                          <TableCell>
                            <span className={`${product.stockQuantity && product.stockQuantity < 10 ? 'text-amber-600' : 'text-gray-600'}`}>
                              {product.stockQuantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${product.isAvailable 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {product.isAvailable ? '可用' : '不可用'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${product.isImport 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                              {product.isImport ? '进口' : '本地'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>未找到符合搜索条件的商品。</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length > 0 && (
                <div className="py-4 px-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      第 {((currentPage - 1) * itemsPerPage) + 1} 到 {Math.min(currentPage * itemsPerPage, filteredProducts.length)} 项，共 {filteredProducts.length} 个商品
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let pageNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={currentPage === pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 