import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Button,
  Chip,
  Pagination,
  Input,
  Checkbox,
  CheckboxGroup,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Container } from "@/components";
import {
  ShoppingCartIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";

// 模拟数据
const categories = [
  { id: "fruits", name: "新鲜水果" },
  { id: "fresh", name: "生鲜食品" },
  { id: "snacks", name: "休闲零食" },
  { id: "drinks", name: "饮料冲调" },
  { id: "food", name: "粮油调味" },
  { id: "daily", name: "日用百货" },
  { id: "clean", name: "个护清洁" },
  { id: "home", name: "家居用品" },
];

const sortOptions = [
  { key: "default", text: "默认排序" },
  { key: "priceAsc", text: "价格从低到高" },
  { key: "priceDesc", text: "价格从高到低" },
  { key: "salesDesc", text: "销量从高到低" },
  { key: "newest", text: "最新上架" },
];

// 模拟商品数据
const generateProducts = (page: number, pageSize: number) => {
  const products = [];
  const startId = (page - 1) * pageSize + 1;
  for (let i = 0; i < pageSize; i++) {
    const id = startId + i;
    products.push({
      id,
      name: `商品 ${id}`,
      description: `这是商品 ${id} 的简短描述，介绍商品的主要特点和优势。`,
      price: Math.floor(Math.random() * 900 + 100) / 10,
      originalPrice: Math.floor(Math.random() * 1500 + 200) / 10,
      image: `/images/products/product-${(id % 8) + 1}.jpg`,
      category: categories[id % categories.length].id,
      stock: Math.floor(Math.random() * 200 + 50),
      sales: Math.floor(Math.random() * 1000),
      isNew: id % 5 === 0,
      discount: id % 3 === 0 ? `${Math.floor(Math.random() * 3 + 7)}折` : null,
    });
  }
  return products;
};

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  // 获取查询参数
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "default";
  const searchQuery = searchParams.get("q") || "";
  const selectedFilters = searchParams.getAll("filter");

  // 价格区间
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // 更新查询参数
  const updateSearchParams = (params: Record<string, any>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  // 模拟加载数据
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // 模拟 API 请求延迟
      await new Promise((resolve) => setTimeout(resolve, 800));
      const data = generateProducts(currentPage, 12);
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [currentPage, currentCategory, currentSort, searchQuery, selectedFilters]);

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-6">
        {/* 搜索和筛选区 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <Input
            type="search"
            placeholder="搜索商品..."
            value={searchQuery}
            onChange={(e) => updateSearchParams({ q: e.target.value, page: 1 })}
            startContent={
              <svg
                className="h-5 w-5 text-default-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            className="w-full sm:max-w-[320px]"
          />

          {/* 排序下拉菜单 */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                startContent={<ArrowsUpDownIcon className="h-5 w-5" />}
              >
                {sortOptions.find((opt) => opt.key === currentSort)?.text}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={[currentSort]}
              onAction={(key) => updateSearchParams({ sort: key, page: 1 })}
            >
              {sortOptions.map((option) => (
                <DropdownItem key={option.key}>{option.text}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* 筛选按钮 */}
          <Button
            variant="flat"
            startContent={<FunnelIcon className="h-5 w-5" />}
          >
            筛选
          </Button>
        </div>

        {/* 分类和价格区间 */}
        <div className="flex flex-wrap gap-4">
          <CheckboxGroup
            orientation="horizontal"
            value={selectedFilters}
            onChange={(values) =>
              updateSearchParams({ filter: values, page: 1 })
            }
          >
            {categories.map((category) => (
              <Checkbox key={category.id} value={category.id}>
                {category.name}
              </Checkbox>
            ))}
          </CheckboxGroup>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="最低价"
              value={minPrice}
              onChange={(e) =>
                updateSearchParams({ minPrice: e.target.value, page: 1 })
              }
              className="w-24"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="最高价"
              value={maxPrice}
              onChange={(e) =>
                updateSearchParams({ maxPrice: e.target.value, page: 1 })
              }
              className="w-24"
            />
          </div>
        </div>

        {/* 商品列表 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="space-y-5 p-4" radius="lg">
                <div className="h-24 rounded-lg bg-default-300"></div>
                <div className="space-y-3">
                  <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
                  <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
                  <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-none" isPressable>
                <CardHeader className="p-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                    radius="lg"
                  />
                  {product.discount && (
                    <Chip
                      color="danger"
                      variant="flat"
                      className="absolute top-2 right-2"
                    >
                      {product.discount}
                    </Chip>
                  )}
                  {product.isNew && (
                    <Chip
                      color="success"
                      variant="flat"
                      className="absolute top-2 left-2"
                    >
                      新品
                    </Chip>
                  )}
                </CardHeader>
                <CardBody className="px-3 py-2">
                  <h3 className="font-semibold text-foreground/90">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-danger">
                      {formatPrice(product.price)}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-foreground/50 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-foreground/60 mt-1">
                    已售 {product.sales} | 库存 {product.stock}
                  </div>
                </CardBody>
                <CardFooter className="px-3 pb-3">
                  <Button
                    fullWidth
                    color="primary"
                    endContent={<ShoppingCartIcon className="h-5 w-5" />}
                    onClick={() =>
                      addItem({
                        id: product.id.toString(),
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        stock: product.stock,
                        quantity: 1,
                      })
                    }
                  >
                    加入购物车
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={(page) => updateSearchParams({ page })}
          />
        </div>
      </div>
    </Container>
  );
};

export default ProductListPage;
