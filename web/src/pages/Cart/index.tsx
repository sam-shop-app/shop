import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Image,
  Button,
  Checkbox,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
} from "@heroui/react";
import { Container } from "@/components";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/format";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, updateQuantity, removeItem, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 计算选中商品的总金额
  const selectedTotal = useMemo(() => {
    return items
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items, selectedItems]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map((item) => item.id) : []);
  };

  // 选择单个商品
  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, itemId] : prev.filter((id) => id !== itemId),
    );
  };

  // 更新商品数量
  const handleQuantityChange = (itemId: string, value: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, Math.min(value, item.stock));
      updateQuantity(itemId, newQuantity);
    }
  };

  // 删除商品
  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  // 结算
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (selectedItems.length === 0) {
      alert("请选择要结算的商品");
      return;
    }
    navigate("/checkout", { state: { items: selectedItems } });
  };

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <Card>
          <CardBody className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <Image
                src="/images/empty-cart.png"
                alt="空购物车"
                className="w-48 h-48 object-contain"
              />
              <p className="text-xl text-foreground/60">购物车是空的</p>
              <Button
                as={Link}
                to="/"
                color="primary"
                variant="flat"
                size="lg"
              >
                去购物
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Card>
        <CardBody>
          <Table aria-label="购物车商品列表">
            <TableHeader>
              <TableColumn>
                <Checkbox
                  isSelected={selectedItems.length === items.length}
                  isIndeterminate={
                    selectedItems.length > 0 &&
                    selectedItems.length < items.length
                  }
                  onValueChange={handleSelectAll}
                >
                  商品信息
                </Checkbox>
              </TableColumn>
              <TableColumn>单价</TableColumn>
              <TableColumn>数量</TableColumn>
              <TableColumn>小计</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Checkbox
                        isSelected={selectedItems.includes(item.id)}
                        onValueChange={(checked) =>
                          handleSelectItem(item.id, checked)
                        }
                      />
                      <User
                        avatarProps={{
                          src: item.image,
                          size: "lg",
                          className: "rounded-lg",
                        }}
                        name={item.name}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {formatPrice(item.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, Number(e.target.value))
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-danger">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 底部结算栏 */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <div className="flex items-center gap-4">
              <Checkbox
                isSelected={selectedItems.length === items.length}
                isIndeterminate={
                  selectedItems.length > 0 &&
                  selectedItems.length < items.length
                }
                onValueChange={handleSelectAll}
              >
                全选
              </Checkbox>
              <Button
                color="danger"
                variant="light"
                onClick={() => {
                  if (window.confirm("确定要清空购物车吗？")) {
                    clearCart();
                    setSelectedItems([]);
                  }
                }}
              >
                清空购物车
              </Button>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span>已选商品</span>
                  <span className="font-semibold text-danger">
                    {selectedItems.length}
                  </span>
                  <span>件</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>合计：</span>
                  <span className="text-xl font-bold text-danger">
                    {formatPrice(selectedTotal)}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                size="lg"
                onClick={handleCheckout}
                isDisabled={selectedItems.length === 0}
              >
                结算
                {selectedItems.length > 0 && `(${selectedItems.length})`}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
};

export default CartPage;
