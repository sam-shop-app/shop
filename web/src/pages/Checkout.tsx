import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../stores/useCart";
import { formatPrice } from "../utils/format";

interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "alipay", name: "支付宝", icon: "/icons/alipay.svg" },
  { id: "wechat", name: "微信支付", icon: "/icons/wechat.svg" },
  { id: "unionpay", name: "银联支付", icon: "/icons/unionpay.svg" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, totalAmount, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("alipay");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    address: "",
  });

  // 检查登录状态和购物车
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    // 加载用户地址列表
    fetchAddresses();
  }, [isAuthenticated, items.length, navigate]);

  const fetchAddresses = async () => {
    try {
      // TODO: 替换为实际的API调用
      const response = await fetch("/api/addresses");
      const data = await response.json();
      setAddresses(data);
      // 如果有默认地址，则选中
      const defaultAddress = data.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleAddNewAddress = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: 替换为实际的API调用
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();
      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowNewAddress(false);
    } catch (error) {
      console.error("Failed to add address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedAddressId) {
      alert("请选择收货地址");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 替换为实际的API调用
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: totalAmount(),
        }),
      });

      const data = await response.json();

      // 清空购物车
      clearCart();

      // 跳转到支付页面
      navigate(`/payment/${data.orderId}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("创建订单失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">结算</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 收货地址 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">收货地址</h2>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => setShowNewAddress(!showNewAddress)}
                >
                  {showNewAddress ? "取消" : "添加新地址"}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {showNewAddress ? (
                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  <Input
                    label="收货人"
                    placeholder="请输入收货人姓名"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="手机号码"
                    placeholder="请输入手机号码"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="省份"
                      placeholder="请选择省份"
                      value={newAddress.province}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          province: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      label="城市"
                      placeholder="请选择城市"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="区县"
                      placeholder="请选择区县"
                      value={newAddress.district}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          district: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Textarea
                    label="详细地址"
                    placeholder="请输入详细地址"
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    保存地址
                  </Button>
                </form>
              ) : (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={setSelectedAddressId}
                  className="space-y-3"
                >
                  {addresses.map((address) => (
                    <Radio key={address.id} value={address.id}>
                      <div className="ml-2">
                        <div className="font-semibold">
                          {address.name} {address.phone}
                        </div>
                        <div className="text-default-500">
                          {address.province}
                          {address.city}
                          {address.district}
                          {address.address}
                        </div>
                      </div>
                    </Radio>
                  ))}
                </RadioGroup>
              )}
            </CardBody>
          </Card>

          {/* 订单商品 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">订单商品</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-default-500">
                        {item.selectedSize && `尺码: ${item.selectedSize}`}
                        {item.selectedColor && ` • 颜色: ${item.selectedColor}`}
                      </p>
                      <div className="flex justify-between mt-2">
                        <span>{formatPrice(item.price)}</span>
                        <span>x {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">支付方式</h2>
            </CardHeader>
            <CardBody>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                {PAYMENT_METHODS.map((method) => (
                  <Radio key={method.id} value={method.id}>
                    <div className="flex items-center ml-2">
                      <Image
                        src={method.icon}
                        alt={method.name}
                        className="w-6 h-6 mr-2"
                      />
                      {method.name}
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </CardBody>
          </Card>
        </div>

        {/* 订单摘要 */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-xl font-bold">订单摘要</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>商品总价</span>
                  {/* <span>{formatPrice(totalAmount())}</span> */}
                </div>
                <div className="flex justify-between">
                  <span>运费</span>
                  <span>免运费</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>应付总额</span>
                  {/* <span>{formatPrice(totalAmount())}</span> */}
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                onPress={handleSubmitOrder}
              >
                提交订单
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
