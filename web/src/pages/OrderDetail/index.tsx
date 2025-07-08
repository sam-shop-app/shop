import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Steps,
  Step,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Container } from "@/components";
import { formatPrice, formatDateTime } from "@/utils/format";

// 模拟订单数据
const orderDetail = {
  id: "O202312250001",
  status: "delivered", // pending, paid, shipping, delivered, completed, cancelled
  statusText: "已完成",
  createTime: "2023-12-25 10:30:00",
  payTime: "2023-12-25 10:35:00",
  shippingTime: "2023-12-25 14:20:00",
  deliveryTime: "2023-12-26 15:45:00",
  completeTime: "2023-12-26 16:00:00",
  totalAmount: 299.8,
  items: [
    {
      id: "1",
      name: "新鲜云南红富士苹果",
      price: 29.9,
      quantity: 2,
      image: "/images/products/apple.jpg",
    },
    {
      id: "2",
      name: "泰国金枕头榴莲",
      price: 120,
      quantity: 2,
      image: "/images/products/durian.jpg",
    },
  ],
  address: {
    name: "张三",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    address: "科技园中科大厦 10 楼",
  },
  paymentMethod: "alipay",
  shipping: {
    company: "顺丰速运",
    trackingNumber: "SF1234567890",
    fee: 0,
  },
  remark: "请在工作日送货",
};

// 订单状态步骤配置
const orderSteps = [
  {
    title: "提交订单",
    description: "等待付款",
    time: "createTime",
    status: ["pending"],
  },
  {
    title: "付款成功",
    description: "等待发货",
    time: "payTime",
    status: ["paid", "shipping", "delivered", "completed"],
  },
  {
    title: "商家发货",
    description: "等待收货",
    time: "shippingTime",
    status: ["shipping", "delivered", "completed"],
  },
  {
    title: "已签收",
    description: "交易完成",
    time: "deliveryTime",
    status: ["delivered", "completed"],
  },
];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"cancel" | "confirm">("cancel");

  // 获取当前步骤
  const currentStep = orderSteps.findIndex((step) =>
    step.status.includes(orderDetail.status),
  );

  // 获取订单状态对应的颜色
  const getStatusColor = (status: string) => {
    const statusColorMap: Record<string, any> = {
      pending: "warning",
      paid: "primary",
      shipping: "primary",
      delivered: "success",
      completed: "success",
      cancelled: "danger",
    };
    return statusColorMap[status] || "default";
  };

  // 处理订单操作
  const handleOrderAction = (type: "cancel" | "confirm") => {
    setModalType(type);
    onOpen();
  };

  // 确认操作
  const handleConfirmAction = () => {
    // 这里应该调用相应的 API
    console.log("确认操作:", modalType);
    onClose();
  };

  return (
    <Container className="py-8">
      <div className="space-y-6">
        {/* 订单状态卡片 */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-foreground/60">
                订单编号：{orderDetail.id}
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">订单状态</h2>
                <Chip color={getStatusColor(orderDetail.status)} variant="flat">
                  {orderDetail.statusText}
                </Chip>
              </div>
            </div>
            <div className="space-x-2">
              {orderDetail.status === "pending" && (
                <>
                  <Button
                    color="danger"
                    variant="flat"
                    onClick={() => handleOrderAction("cancel")}
                  >
                    取消订单
                  </Button>
                  <Button
                    color="primary"
                    as={Link}
                    to={`/pay/${orderDetail.id}`}
                  >
                    立即付款
                  </Button>
                </>
              )}
              {orderDetail.status === "shipping" && (
                <Button
                  color="primary"
                  onClick={() => handleOrderAction("confirm")}
                >
                  确认收货
                </Button>
              )}
              {orderDetail.status === "completed" && (
                <Button
                  as={Link}
                  to={`/review/${orderDetail.id}`}
                  color="primary"
                  variant="flat"
                >
                  评价商品
                </Button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <Steps current={currentStep}>
              {orderSteps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={
                    <div className="text-xs">
                      <div>{step.description}</div>
                      {orderDetail[step.time as keyof typeof orderDetail] && (
                        <div className="text-foreground/60">
                          {formatDateTime(
                            orderDetail[
                              step.time as keyof typeof orderDetail
                            ] as string,
                          )}
                        </div>
                      )}
                    </div>
                  }
                />
              ))}
            </Steps>
          </CardBody>
        </Card>

        {/* 收货信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">收货信息</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">{orderDetail.address.name}</span>
                <span>{orderDetail.address.phone}</span>
              </div>
              <div className="text-foreground/60">
                {orderDetail.address.province}
                {orderDetail.address.city}
                {orderDetail.address.district}
                {orderDetail.address.address}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 商品信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">商品信息</h3>
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
                {orderDetail.items.map((item) => (
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
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider className="my-4" />

            <div className="space-y-2 text-right">
              <div className="flex justify-end items-center gap-8">
                <span>商品总额：</span>
                <span>{formatPrice(orderDetail.totalAmount)}</span>
              </div>
              <div className="flex justify-end items-center gap-8">
                <span>运费：</span>
                <span>
                  {orderDetail.shipping.fee === 0
                    ? "免运费"
                    : formatPrice(orderDetail.shipping.fee)}
                </span>
              </div>
              <div className="flex justify-end items-center gap-8 text-xl">
                <span>实付金额：</span>
                <span className="font-bold text-danger">
                  {formatPrice(
                    orderDetail.totalAmount + orderDetail.shipping.fee,
                  )}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 支付和配送信息 */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">其他信息</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-foreground/60 mb-1">支付方式</div>
                  <div>
                    {orderDetail.paymentMethod === "alipay"
                      ? "支付宝"
                      : "微信支付"}
                  </div>
                </div>
                <div>
                  <div className="text-foreground/60 mb-1">配送方式</div>
                  <div>
                    {orderDetail.shipping.company}（
                    {orderDetail.shipping.trackingNumber}）
                  </div>
                </div>
              </div>
              <div>
                <div className="text-foreground/60 mb-1">订单备注</div>
                <div>{orderDetail.remark || "无"}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 操作确认弹窗 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {modalType === "cancel" ? "取消订单" : "确认收货"}
          </ModalHeader>
          <ModalBody>
            <p>
              {modalType === "cancel"
                ? "确定要取消该订单吗？"
                : "确认已收到商品了吗？"}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              再想想
            </Button>
            <Button
              color={modalType === "cancel" ? "danger" : "primary"}
              onPress={handleConfirmAction}
            >
              {modalType === "cancel" ? "确认取消" : "确认收货"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default OrderDetailPage;
