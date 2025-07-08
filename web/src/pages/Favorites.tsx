import {
  Badge,
  Button,
  Card,
  CardBody,
  Image,
  Link,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../stores/useCart";
import { formatPrice } from "../utils/format";

interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  description: string;
  stock: number;
  category: string;
  addedAt: string;
}

interface FavoriteFilter {
  category: string;
  sortBy: "date" | "price";
  sortOrder: "asc" | "desc";
}

const PAGE_SIZE = 12;

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<FavoriteFilter>({
    category: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/favorites" } });
      return;
    }

    fetchFavorites();
    fetchCategories();
  }, [isAuthenticated, currentPage, filter]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: PAGE_SIZE.toString(),
        category: filter.category === "all" ? "" : filter.category,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      });

      const response = await fetch(`/api/favorites?${params}`);
      const data = await response.json();

      setFavorites(data.items);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!confirm("确定要取消收藏这个商品吗？")) {
      return;
    }

    setIsRemoving(id);
    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      // 如果是页面最后一项，且不是第一页，则跳转到上一页
      if (favorites.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchFavorites();
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      alert("移除收藏失败，请重试");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (item: FavoriteItem) => {
    setIsAddingToCart(item.id);
    try {
      // 检查库存
      const response = await fetch(`/api/products/${item.productId}`);
      const product = await response.json();

      if (product.stock <= 0) {
        alert("商品已售罄");
        return;
      }

      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        stock: product.stock,
      });

      alert("已添加到购物车");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("添加到购物车失败，请重试");
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilter({ ...filter, sortBy: sortBy as "date" | "price", sortOrder: sortOrder as "asc" | "desc" });
    setCurrentPage(1);
  };

  const getTotalPages = () => Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的收藏</h1>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="商品分类"
              value={filter.category}
              onChange={(value) => {
                setFilter({ ...filter, category: value });
                setCurrentPage(1);
              }}
            >
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="排序方式"
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onChange={handleSortChange}
            >
              <SelectItem value="date-desc">收藏时间从新到旧</SelectItem>
              <SelectItem value="date-asc">收藏时间从旧到新</SelectItem>
              <SelectItem value="price-desc">价格从高到低</SelectItem>
              <SelectItem value="price-asc">价格从低到高</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* 收藏列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : favorites.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-0">
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/products/${item.productId}`)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-default-500 text-sm line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-default-400 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex gap-2">
                    <Button
                      color="primary"
                      className="flex-1"
                      isLoading={isAddingToCart === item.id}
                      onPress={() => handleAddToCart(item)}
                    >
                      加入购物车
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      isLoading={isRemoving === item.id}
                      onPress={() => handleRemoveFavorite(item.id)}
                    >
                      取消收藏
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          <div className="flex justify-center mt-8">
            <Pagination
              total={getTotalPages()}
              page={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-xl text-default-500 mb-4">
              {filter.category !== "all"
                ? "该分类下暂无收藏商品"
                : "您还没有收藏任何商品"}
            </p>
            <Button
              as={Link}
              href="/"
              color="primary"
              variant="flat"
            >
              去逛逛
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
