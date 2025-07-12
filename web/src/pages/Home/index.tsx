import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Input,
  Chip,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { Container } from "@/components";
import {
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";
import request from "@/utils/request";

interface Product {
  spu_id: string;
  title: string;
  sub_title?: string;
  image_url: string;
  price: string;
  stock_quantity: number;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  image_url?: string;
  children?: Category[];
}

const sortOptions = [
  { key: "spu_id", label: "默认排序" },
  { key: "price_asc", label: "价格从低到高" },
  { key: "price_desc", label: "价格从高到低" },
  { key: "title", label: "按名称排序" },
];

const HomePage = () => {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // 状态管理
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // 从URL参数获取当前状态
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "spu_id";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // 更新URL参数
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await request.get("/categories/tree");
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // 获取商品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params: Record<string, string> = {
          page: String(currentPage),
          pageSize: "12",
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.categoryId = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        // 处理排序
        if (sortBy === "price_asc") {
          params.sortBy = "price";
          params.sortOrder = "asc";
        } else if (sortBy === "price_desc") {
          params.sortBy = "price";
          params.sortOrder = "desc";
        } else {
          params.sortBy = sortBy;
          params.sortOrder = "asc";
        }

        const queryString = new URLSearchParams(params).toString();
        const res = await request.get(`/products?${queryString}`);

        setProducts(res.data.data || []);
        setTotalPages(Math.ceil((res.data.total || 0) / 12));
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, sortBy, minPrice, maxPrice]);

  // 渲染分类选择器
  const renderCategoryTabs = () => {
    const flatCategories: Category[] = [];

    const flatten = (cats: Category[]) => {
      cats.forEach((cat) => {
        flatCategories.push(cat);
        if (cat.children) {
          flatten(cat.children);
        }
      });
    };

    flatten(categories);

    return (
      <Tabs
        selectedKey={selectedCategory || "all"}
        onSelectionChange={(key) =>
          updateParams({
            category: key === "all" ? null : String(key),
            page: 1,
          })
        }
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        <Tab key="all" title="全部分类" />
        {categories.map((category) => (
          <Tab key={category.id} title={category.name} />
        ))}
      </Tabs>
    );
  };

  // 渲染二三级分类筛选
  const renderSubCategories = () => {
    if (!selectedCategory) return null;

    const selectedCat = categories.find((cat) => {
      const findInTree = (c: Category): Category | null => {
        if (c.id === selectedCategory) return c;
        if (c.children) {
          for (const child of c.children) {
            const found = findInTree(child);
            if (found) return found;
          }
        }
        return null;
      };
      return findInTree(cat);
    });

    if (!selectedCat?.children?.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {selectedCat.children.map((subCat) => (
          <Chip
            key={subCat.id}
            variant={selectedCategory === subCat.id ? "solid" : "bordered"}
            color="primary"
            className="cursor-pointer"
            onClick={() => updateParams({ category: subCat.id, page: 1 })}
          >
            {subCat.name}
          </Chip>
        ))}
      </div>
    );
  };

  return (
    <Container className="py-6">
      <div className="space-y-6">
        {/* 搜索和筛选区域 */}
        <div className="flex flex-col gap-4">
          {/* 搜索栏 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="搜索商品..."
              value={searchQuery}
              onChange={(e) =>
                updateParams({ search: e.target.value, page: 1 })
              }
              startContent={
                <MagnifyingGlassIcon className="h-5 w-5 text-default-400" />
              }
              className="flex-1"
            />

            {/* 排序选择 */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  startContent={
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  }
                >
                  {sortOptions.find((opt) => opt.key === sortBy)?.label}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[sortBy]}
                onAction={(key) => updateParams({ sort: String(key), page: 1 })}
              >
                {sortOptions.map((option) => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* 价格筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60">价格范围:</span>
            <Input
              type="number"
              placeholder="最低价"
              value={minPrice}
              onChange={(e) =>
                updateParams({ minPrice: e.target.value, page: 1 })
              }
              className="w-32"
              size="sm"
            />
            <span className="text-foreground/60">-</span>
            <Input
              type="number"
              placeholder="最高价"
              value={maxPrice}
              onChange={(e) =>
                updateParams({ maxPrice: e.target.value, page: 1 })
              }
              className="w-32"
              size="sm"
            />
          </div>
        </div>

        {/* 分类选择 */}
        <div className="space-y-4">
          {renderCategoryTabs()}
          {renderSubCategories()}
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="space-y-5 p-4" radius="lg">
                <div className="h-48 rounded-lg bg-default-300 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-3 w-3/5 rounded-lg bg-default-200 animate-pulse"></div>
                  <div className="h-3 w-4/5 rounded-lg bg-default-200 animate-pulse"></div>
                  <div className="h-3 w-2/5 rounded-lg bg-default-300 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">暂无商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.spu_id}
                className="border-none group"
                isPressable
              >
                <CardBody className="p-0 overflow-hidden">
                  <Link to={`/products/${product.spu_id}`}>
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                      radius="lg"
                      fallbackSrc="/images/placeholder.jpg"
                    />
                  </Link>
                </CardBody>
                <CardFooter className="flex-col items-start px-3 py-3">
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 h-10">
                      {product.title}
                    </h3>
                    {product.sub_title && (
                      <p className="text-xs text-foreground/60 mt-1 line-clamp-1">
                        {product.sub_title}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-danger">
                          {formatPrice(parseFloat(product.price))}
                        </span>
                        <span className="text-xs text-foreground/50">
                          库存: {product.stock_quantity}
                        </span>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        variant="ghost"
                        isDisabled={
                          !product.is_available || product.stock_quantity === 0
                        }
                        onPress={() => {
                          addItem({
                            id: product.spu_id,
                            name: product.title,
                            price: parseFloat(product.price),
                            image: product.image_url,
                            stock: product.stock_quantity,
                          });
                        }}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={(page) => updateParams({ page })}
            />
          </div>
        )}
      </div>
    </Container>
  );
};

export default HomePage;
