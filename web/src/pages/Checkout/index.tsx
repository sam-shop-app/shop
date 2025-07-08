import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Radio,
  RadioGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Divider,
} from "@heroui/react";
import { Container } from "@/components";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";

// 模拟地址数据
const addresses = [
  {
    id: "1",
    name: "张三",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    address: "科技园中科大厦 10 楼",
    isDefault: true,
  },
  {
    id: "2",
    name: "李四",
    phone: "13900139000",
    province: "广东省",
    city: "深圳市",
    district: "福田区",
    address: "车公庙新洲路 123 号",
    isDefault: false,
  },
];

// 支付方式
const paymentMethods = [
  { id: "alipay", name: "支付宝支付", icon: "/images/payment/alipay.png" },
  { id: "wechat", name: "微信支付", icon: "/images/payment/wechat.png" },
  { id: "unionpay", name: "银联支付", icon: "/images/payment/unionpay.png" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalAmount, clearCart } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 从购物车页面传递过来的已选商品 ID
  const selectedItemIds = location.state?.items || [];
  const checkoutItems = items.filter((item) =>
    selectedItemIds.includes(item.id),
  );

  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [remark, setRemark] = useState("");

  // 计算订单总金额
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 0; // 运费
  const total = subtotal + shipping;

  // 提交订单
  const handleSubmitOrder = () => {
    // 这里应该调用创建订单的 API
    const order = {
      items: checkoutItems,
      address: addresses.find((addr) => addr.id === selectedAddress),
      paymentMethod,
      remark,
      total,
    };
    console.log("提交订单:", order);

    // 清空购物车中已结算的商品
    checkoutItems.forEach((item) => {
      const index = items.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        items.splice(index, 1);
      }
    });

    // 显示支付确认弹窗
    onOpen();
  };

  // 处理支付确认
  const handlePaymentConfirm = () => {
    onClose();
    // 这里应该跳转到支付页面或调用支付接口
    navigate("/orders");
  };

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧结算信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 收货地址 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">收货地址</h2>
            </CardHeader>
            <CardBody>
              <RadioGroup
                value={selectedAddress}
                onValueChange={setSelectedAddress}
              >
                {addresses.map((addr) => (
                  <Radio key={addr.id} value={addr.id}>
                    <div className="ml-2">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{addr.name}</span>
                        <span>{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="text-xs text-primary">默认地址</span>
                        )}
                      </div>
                      <div className="text-foreground/60">
                        {addr.province}
                        {addr.city}
                        {addr.district}
                        {addr.address}
                      </div>
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
              <Button
                color="primary"
                variant="flat"
                className="mt-4"
                onClick={() => navigate("/address")}
              >
                管理收货地址
              </Button>
            </CardBody>
          </Card>

          {/* 商品清单 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">商品清单</h2>
            </CardHeader>
            <CardBody>
              <Table removeWrapper aria-label="订单商品列表">
                <TableHeader>
                  <TableColumn>商品信息</TableColumn>
                  <TableColumn>单价</TableColumn>
                  <TableColumn>数量</TableColumn>
                  <TableColumn>小计</TableColumn>
                </TableHeader>
                <TableBody>
                  {checkoutItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <User
                          avatarProps={{
                            src: item.image,
                            size: "lg",
                            className: "rounded-lg",
                          }}
                          name={item.name}
                        />
                      </TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>x{item.quantity}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-danger">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          {/* 支付方式 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">支付方式</h2>
            </CardHeader>
            <CardBody>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                {paymentMethods.map((method) => (
                  <Radio key={method.id} value={method.id}>
                    <div className="flex items-center gap-2 ml-2">
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="w-6 h-6"
                      />
                      <span>{method.name}</span>
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </CardBody>
          </Card>

          {/* 订单备注 */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">订单备注</h2>
            </CardHeader>
            <CardBody>
              <Input
                placeholder="请输入订单备注信息（选填）"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </CardBody>
          </Card>
        </div>

        {/* 右侧订单金额 */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <h2 className="text-lg font-semibold">订单金额</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>商品总额</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>运费</span>
                  <span>
                    {shipping === 0 ? "免运费" : formatPrice(shipping)}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between items-end">
                  <span>应付金额</span>
                  <span className="text-2xl font-bold text-danger">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  color="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmitOrder}
                >
                  提交订单
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* 支付确认弹窗 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>订单支付</ModalHeader>
          <ModalBody>
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-danger mb-4">
                {formatPrice(total)}
              </div>
              <p>请确认是否继续支付？</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={handlePaymentConfirm}>
              确认支付
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CheckoutPage;
