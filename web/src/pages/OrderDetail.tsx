import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Image,
  Link,
  Chip,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Order, OrderStatus, OrderStatusColorMap, OrderStatusMap } from "../types/order";
import { formatPrice, formatDateTime } from "../utils/format";
import { useAuth } from "../hooks/useAuth";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/orders/${id}` } });
      return;
    }

    fetchOrderDetails();
  }, [id, isAuthenticated, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        throw new Error("订单不存在或无权访问");
      }
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "加载订单详情失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm("确定要取消订单吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("取消订单失败");
      }

      // 重新获取订单信息
      fetchOrderDetails();
    } catch (error) {
      alert(error instanceof Error ? error.message : "操作失败，请重试");
    }
  };

  const handlePayOrder = () => {
    navigate(`/payment/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-default-500">加载订单信息...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-center mb-4">订单加载失败</h2>
        <p className="text-default-500 text-center mb-8">{error}</p>
        <Button
          as={Link}
          href="/orders"
          color="primary"
          variant="flat"
        >
          返回订单列表
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <Badge color={OrderStatusColorMap[order.status] as any}>
          {OrderStatusMap[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 订单信息 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl">基本信息</h2>
                <span className="text-default-500">订单号：{order.orderNumber}</span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-default-500">下单时间</p>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-default-500">支付方式</p>
                    <p>{order.payment.method === 'alipay' ? '支付宝' :
                        order.payment.method === 'wechat' ? '微信支付' : '银联支付'}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 收货信息 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl">收货信息</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">{order.address.name}</span>
                  <span className="ml-4">{order.address.phone}</span>
                </p>
                <p className="text-default-500">
                  {order.address.province}
                  {order.address.city}
                  {order.address.district}
                  {order.address.address}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl">商品信息</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-default-500">
                            {item.selectedSize && `尺码: ${item.selectedSize}`}
                            {item.selectedColor && ` • 颜色: ${item.selectedColor}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(item.price)}</p>
                          <p className="text-default-500">x {item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 订单状态时间线 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl">订单状态</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      {index !== order.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-default-200"></div>
                      )}
                    </div>
                    <div className="flex-grow pb-4">
                      <p className="font-semibold">{event.description}</p>
                      <p className="text-default-500 text-sm">
                        {formatDateTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 订单金额 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-xl">订单金额</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>商品总额</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>运费</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>实付金额</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardBody>
            {order.status === "pending" && (
              <CardBody>
                <div className="space-y-2">
                  <Button
                    color="primary"
                    className="w-full"
                    onPress={handlePayOrder}
                  >
                    立即支付
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full"
                    onPress={handleCancelOrder}
                  >
                    取消订单
                  </Button>
                </div>
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
