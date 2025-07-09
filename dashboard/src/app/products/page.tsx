"use client";

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Button, 
  Input, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Pagination,
  Image,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { toast } from 'sonner';
import { PlusCircle, Search, FileUp, PackageOpen, Filter } from 'lucide-react';
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
  <>
    <TableCell>
      <div className="w-16 h-16 bg-gray-200 rounded-md animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
    </TableCell>
  </>
);

function ProductsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const page = Number(searchParams.get('page')) || 1;
  const searchTerm = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'spu_id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  const isAvailable = searchParams.get('isAvailable');
  const isImport = searchParams.get('isImport');
  const pageSize = 10;

  const createQueryString = useCallback(
    (params: Record<string, string | number | null | boolean>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '' || value === false) {
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
            sortBy,
            sortOrder,
            isAvailable: isAvailable ? isAvailable === 'true' : undefined,
            isImport: isImport ? isImport === 'true' : undefined,
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
  }, [page, searchTerm, sortBy, sortOrder, isAvailable, isImport]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newSearchTerm = formData.get('search') as string;
    router.push(`${pathname}?${createQueryString({ search: newSearchTerm, page: 1 })}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage })}`);
  };

  const handleSortChange = (descriptor: { column: React.Key; direction: 'ascending' | 'descending' }) => {
    const newSortBy = descriptor.column as string;
    const newSortOrder = descriptor.direction === 'ascending' ? 'asc' : 'desc';
    router.push(`${pathname}?${createQueryString({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 })}`);
  };

  const handleFilterChange = (key: string, value: boolean) => {
    router.push(`${pathname}?${createQueryString({ [key]: value, page: 1 })}`);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">商品列表</h1>
          <p className="text-gray-500 mt-1">
            共发现 {total} 件商品。
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button as={Link} href="/products/import" color="primary" startContent={<FileUp className="h-4 w-4" />}>
                导入商品
            </Button>
        </div>
      </div>
      
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 w-full sm:w-auto">
            <Input
              isClearable
              aria-label="Search"
              name="search"
              placeholder="按商品标题搜索..."
              defaultValue={searchTerm}
              startContent={<Search className="h-4 w-4 text-gray-500 pointer-events-none" />}
              onClear={() => router.push(`${pathname}?${createQueryString({ search: null, page: 1 })}`)}
            />
        </form>
        <div className="flex items-center gap-2">
            <Dropdown>
                <DropdownTrigger>
                    <Button variant="bordered" endContent={<Filter className="h-4 w-4" />}>
                        筛选
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="筛选选项" closeOnSelect={false}>
                    <DropdownItem key="isAvailable" textValue="isAvailable">
                        <Checkbox isSelected={isAvailable === 'true'} onValueChange={(checked) => handleFilterChange('isAvailable', checked)}>
                            在售
                        </Checkbox>
                    </DropdownItem>
                    <DropdownItem key="isImport" textValue="isImport">
                        <Checkbox isSelected={isImport === 'true'} onValueChange={(checked) => handleFilterChange('isImport', checked)}>
                            已导入
                        </Checkbox>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
      </div>

      <Table 
        aria-label="商品列表"
        sortDescriptor={{
            column: sortBy,
            direction: sortOrder === 'asc' ? 'ascending' : 'descending'
        }}
        onSortChange={handleSortChange}
      >
        <TableHeader>
          <TableColumn key="image_url">图片</TableColumn>
          <TableColumn key="spu_id" allowsSorting>SPU / 店铺 ID</TableColumn>
          <TableColumn key="title">标题</TableColumn>
          <TableColumn key="price" allowsSorting>价格</TableColumn>
          <TableColumn key="stock_quantity" allowsSorting>库存</TableColumn>
          <TableColumn key="status">状态</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          loadingContent={<Spinner label="加载中..." />}
          emptyContent={
            !isLoading && (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <PackageOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">未找到商品</h3>
                <p className="text-sm text-gray-500">
                    似乎还没有任何商品，或者没有找到符合条件的商品。
                </p>
                <Button as={Link} href="/products/import" color="primary" variant="flat" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    导入第一个商品
                </Button>
              </div>
            )
          }
          items={products}
        >
          {(item) => (
            <TableRow key={item.spu_id}>
              <TableCell>
                <Image
                  as="img"
                  src={item.image_url}
                  alt={item.title || ''}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md bg-gray-100"
                  fallbackSrc={<PackageOpen className="w-8 h-8 text-gray-400" />}
                />
              </TableCell>
              <TableCell>
                <div className="font-mono text-xs">{item.spu_id}</div>
                <div className="font-mono text-xs text-gray-500">{item.store_id}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium line-clamp-2">{item.title}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{item.sub_title}</div>
              </TableCell>
              <TableCell>¥{item.price || '0.00'}</TableCell>
              <TableCell>{item.stock_quantity ?? 0}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={item.is_available ? "success" : "danger"}
                >
                  {item.is_available ? '在售' : '下架'}
                </Chip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
         <div className="flex items-center justify-center py-4">
            <Pagination
              showControls
              total={totalPages}
              page={page}
              onChange={handlePageChange}
            />
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <Spinner label="加载商品中..." />
        </div>
      </div>
    }>
      <ProductsList />
    </Suspense>
  )
} 