"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { PlusCircle, Search, FileUp, PackageOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
  spu_id: string;
  store_id: string;
  title?: string;
  sub_title?: string;
  image_url?: string;
  price?: string;
  stock_quantity?: number;
  is_available?: boolean;
  is_import?: boolean;
}

const ProductSkeleton = () => (
  <TableRow>
    <TableCell colSpan={6} className="h-24 text-center">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </TableCell>
  </TableRow>
);


export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 10;

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await api('/products', {
          query: {
            page,
            pageSize,
            search: searchTerm || undefined,
          }
        });
        setProducts(data.data);
        setTotal(data.total);
      } catch (error) {
        toast.error('加载商品失败', {
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchTerm, createQueryString]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newSearchTerm = formData.get('search') as string;
    setSearchTerm(newSearchTerm);
    router.push(`${pathname}?${createQueryString({ search: newSearchTerm || null, page: 1 })}`);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">商品列表</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理你的所有商品。
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/products/import">
                    <FileUp className="mr-2 h-4 w-4" />
                    导入商品
                </Link>
            </Button>
        </div>
      </div>
      
      <div className="mb-4 flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              name="search"
              type="search"
              placeholder="按商品标题搜索..."
              defaultValue={searchTerm}
              className="pl-10"
            />
          </div>
        </form>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">图片</TableHead>
              <TableHead>SPU / 店铺 ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead className="w-[100px]">价格</TableHead>
              <TableHead className="w-[100px]">库存</TableHead>
              <TableHead className="w-[120px]">状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.spu_id}>
                  <TableCell>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title || ''} className="object-cover w-full h-full" width={64} height={64} />
                      ) : (
                        <PackageOpen className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs">{product.spu_id}</div>
                    <div className="font-mono text-xs text-gray-500">{product.store_id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium line-clamp-2">{product.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{product.sub_title}</div>
                  </TableCell>
                  <TableCell>¥{product.price || '0.00'}</TableCell>
                  <TableCell>{product.stock_quantity ?? 0}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_available ? '在售' : '下架'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                    <PackageOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold">未找到商品</h3>
                    <p className="text-sm text-gray-500">
                        似乎还没有任何商品，或者没有找到符合条件的商品。
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/products/import">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            导入第一个商品
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
         <div className="flex items-center justify-end space-x-2 py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        href={`${pathname}?${createQueryString({ page: page > 1 ? page - 1 : 1 })}`}
                        aria-disabled={page <= 1}
                        tabIndex={page <= 1 ? -1 : undefined}
                        className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PaginationItem key={p}>
                        <PaginationLink 
                            href={`${pathname}?${createQueryString({ page: p })}`}
                            isActive={page === p}
                        >
                            {p}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext 
                        href={`${pathname}?${createQueryString({ page: page < totalPages ? page + 1 : totalPages })}`}
                        aria-disabled={page >= totalPages}
                        tabIndex={page >= totalPages ? -1 : undefined}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
      )}
    </div>
  );
} 