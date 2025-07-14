import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Spinner,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);

  // 从URL参数获取当前状态
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "spu_id";
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");
  const [selectedSecondLevelCategory, setSelectedSecondLevelCategory] =
    useState<string>("");

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
  const fetchProducts = useCallback(
    async (pageNum: number, isNewSearch = false) => {
      try {
        if (pageNum === 1 || isNewSearch) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: Record<string, string> = {
          page: String(pageNum),
          pageSize: "12",
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.categoryId = selectedCategory;

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

        const newProducts = res.data.data || [];
        const total = res.data.total || 0;

        if (pageNum === 1 || isNewSearch) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        setHasMore(pageNum * 12 < total);
      } catch (error) {
        console.error("Failed to fetch products", error);
        if (pageNum === 1) {
          setProducts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedCategory, sortBy],
  );

  // 监听参数变化，重新加载商品
  useEffect(() => {
    // 设置loading状态并重置分页状态
    setLoading(true);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    // 延迟执行以减少闪烁
    const timeoutId = setTimeout(() => {
      fetchProducts(1, true);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy]);

  // 更新父级和二级分类状态
  useEffect(() => {
    if (selectedCategory) {
      // 找到当前选中分类的层级结构
      let parentCat: Category | null = null;
      let secondLevelCat: Category | null = null;

      for (const cat of categories) {
        // 检查是否是一级分类
        if (cat.id === selectedCategory) {
          setSelectedParentCategory(selectedCategory);
          setSelectedSecondLevelCategory("");
          return;
        }

        // 检查是否是二级分类
        if (cat.children) {
          const found = cat.children.find(
            (child) => child.id === selectedCategory,
          );
          if (found) {
            parentCat = cat;
            secondLevelCat = found;
            break;
          }

          // 检查是否是三级分类
          for (const child of cat.children) {
            if (child.children) {
              const thirdLevel = child.children.find(
                (grandChild) => grandChild.id === selectedCategory,
              );
              if (thirdLevel) {
                parentCat = cat;
                secondLevelCat = child;
                break;
              }
            }
          }
          if (parentCat) break;
        }
      }

      if (parentCat) {
        setSelectedParentCategory(parentCat.id);
        setSelectedSecondLevelCategory(secondLevelCat?.id || "");
      }
    } else {
      setSelectedParentCategory("");
      setSelectedSecondLevelCategory("");
    }
  }, [selectedCategory, categories]);

  // 无限滚动回调
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchProducts(nextPage);
            return nextPage;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchProducts],
  );

  // 渲染分类选择器
  const renderCategoryTabs = () => {
    const activeKey = selectedParentCategory || "all";

    return (
      <Tabs
        selectedKey={activeKey}
        onSelectionChange={(key) => {
          const newCategory = key === "all" ? "" : String(key);
          setSelectedParentCategory(newCategory);
          setSelectedSecondLevelCategory("");
          updateParams({
            category: newCategory || null,
          });
        }}
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
    if (!selectedParentCategory) return null;

    const selectedCat = categories.find(
      (cat) => cat.id === selectedParentCategory,
    );
    if (!selectedCat?.children?.length) return null;

    return (
      <div className="flex flex-wrap gap-2">
        <Chip
          variant={
            selectedCategory === selectedParentCategory ? "solid" : "light"
          }
          color="primary"
          className="cursor-pointer"
          onClick={() => {
            setSelectedSecondLevelCategory("");
            updateParams({ category: selectedParentCategory });
          }}
        >
          全部{selectedCat.name}
        </Chip>
        {selectedCat.children.map((subCat) => {
          const isSelected =
            selectedCategory === subCat.id ||
            selectedSecondLevelCategory === subCat.id;
          return (
            <Chip
              key={subCat.id}
              variant={isSelected ? "solid" : "light"}
              color="primary"
              className="cursor-pointer"
              onClick={() => {
                setSelectedSecondLevelCategory(subCat.id);
                updateParams({ category: subCat.id });
              }}
            >
              {subCat.name}
            </Chip>
          );
        })}
      </div>
    );
  };

  // 渲染三级分类
  const renderThirdLevelCategories = () => {
    if (!selectedSecondLevelCategory) return null;

    // 找到当前选中的二级分类
    let secondLevelCat: Category | null = null;
    for (const cat of categories) {
      if (cat.children) {
        const found = cat.children.find(
          (child) => child.id === selectedSecondLevelCategory,
        );
        if (found) {
          secondLevelCat = found;
          break;
        }
      }
    }

    if (!secondLevelCat?.children?.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {secondLevelCat.children.map((thirdCat) => (
          <Chip
            key={thirdCat.id}
            variant={selectedCategory === thirdCat.id ? "solid" : "bordered"}
            color="secondary"
            size="sm"
            className="cursor-pointer"
            onClick={() => updateParams({ category: thirdCat.id })}
          >
            {thirdCat.name}
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
              onChange={(e) => updateParams({ search: e.target.value })}
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
                onAction={(key) => updateParams({ sort: String(key) })}
              >
                {sortOptions.map((option) => (
                  <DropdownItem key={option.key}>{option.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* 分类选择 */}
        <div className="space-y-4">
          {renderCategoryTabs()}
          {renderSubCategories()}
          {/* {renderThirdLevelCategories()} */}
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="space-y-5 p-4" radius="lg">
                <div
                  className="w-full aspect-square rounded-lg bg-default-300 animate-pulse"
                  style={{ height: "330px" }}
                ></div>
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
            {products.map((product, index) => {
              // 在最后一个元素上添加ref以实现无限滚动
              const isLast = index === products.length - 1;
              return (
                <Card
                  key={`${product.spu_id}-${index}`}
                  ref={isLast ? lastProductElementRef : null}
                  className="border-none group"
                  isPressable
                >
                  <CardBody className="p-0 overflow-hidden">
                    <Link to={`/products/${product.spu_id}`}>
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={330}
                        height={330}
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
                      <div className="flex items-center justify-between mt-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-danger">
                            {formatPrice(parseFloat(product.price))}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant="light"
                          isDisabled={
                            !product.is_available ||
                            product.stock_quantity === 0
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
                          <span>加入购物车</span>
                          <ShoppingCartIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* 加载更多指示器 */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <Spinner size="lg" />
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <p className="text-foreground/60">已加载全部商品</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default HomePage;
