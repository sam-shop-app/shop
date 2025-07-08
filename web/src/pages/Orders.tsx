import {
  Badge,
  Button,
  Card,
  CardBody,
  Divider,
  Image,
  Input,
  Link,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { OrderListItem, OrderStatus, OrderStatusColorMap, OrderStatusMap } from "../types/order";
import { formatDateTime, formatPrice } from "../utils/format";

const PAGE_SIZE = 10;

interface OrderFilter {
  status: OrderStatus | "all";
  dateRange: "all" | "7days" | "30days" | "90days";
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  search: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>({
    status: "all",
    dateRange: "all",
    sortBy: "date",
    sortOrder: "desc",
    search: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }

    fetchOrders();
  }, [isAuthenticated, currentPage, filter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: PAGE_SIZE.toString(),
        status: filter.status === "all" ? "" : filter.status,
        dateRange: filter.dateRange,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        search: filter.search,
      });

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      setOrders(data.items);
      setTotalOrders(data.total);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setFilter({ ...filter, status: status as OrderStatus | "all" });
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: string) => {
    setFilter({ ...filter, dateRange: range as OrderFilter["dateRange"] });
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    const [sortBy, sortOrder] = sort.split("-");
    setFilter({ ...filter, sortBy: sortBy as "date" | "amount", sortOrder: sortOrder as "asc" | "desc" });
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setFilter({ ...filter, search: value });
    setCurrentPage(1);
  };

  const getTotalPages = () => Math.ceil(totalOrders / PAGE_SIZE);

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的订单</h1>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              label="订单状态"
              value={filter.status}
              onChange={(value) => handleStatusChange(value)}
            >
              <SelectItem value="all">全部订单</SelectItem>
              {(Object.keys(OrderStatusMap) as OrderStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {OrderStatusMap[status]}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="时间范围"
              value={filter.dateRange}
              onChange={(value) => handleDateRangeChange(value)}
            >
              <SelectItem value="all">全部时间</SelectItem>
              <SelectItem value="7days">最近7天</SelectItem>
              <SelectItem value="30days">最近30天</SelectItem>
              <SelectItem value="90days">最近90天</SelectItem>
            </Select>

            <Select
              label="排序方式"
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onChange={(value) => handleSortChange(value)}
            >
              <SelectItem value="date-desc">下单时间从新到旧</SelectItem>
              <SelectItem value="date-asc">下单时间从旧到新</SelectItem>
              <SelectItem value="amount-desc">订单金额从高到低</SelectItem>
              <SelectItem value="amount-asc">订单金额从低到高</SelectItem>
            </Select>

            <Input
              type="search"
              label="搜索订单"
              placeholder="输入订单号或商品名称"
              value={filter.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="lg:col-span-2"
            />
          </div>
        </CardBody>
      </Card>

      {/* 订单列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <CardBody>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <Image
                      src={order.firstItemImage}
                      alt="首件商品图片"
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-default-500">订单号：{order.orderNumber}</span>
                        <Badge color={OrderStatusColorMap[order.status] as any}>
                          {OrderStatusMap[order.status]}
                        </Badge>
                      </div>
                      <p>{order.itemCount} 件商品</p>
                      <p className="text-sm text-default-500">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatPrice(order.total)}
                    </p>
                    {order.status === "pending" && (
                      <Button
                        as={Link}
                        href={`/payment/${order.id}`}
                        color="primary"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        立即支付
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* 分页 */}
          <div className="flex justify-center mt-6">
            <Pagination
              total={getTotalPages()}
              page={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-xl text-default-500 mb-4">
              {filter.search
                ? "未找到匹配的订单"
                : filter.status !== "all"
                ? "当前状态下没有订单"
                : "您还没有任何订单"}
            </p>
            <Button
              as={Link}
              href="/"
              color="primary"
              variant="flat"
            >
              去购物
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
