import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Link,
  Spinner,
} from "@heroui/react";
import { useCart } from "../stores/useCart";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/format";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalAmount, itemCount } =
    useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setIsUpdating(itemId);
    try {
      // Simulating API call to check stock availability
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateQuantity(itemId, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
        <Image
          src="/images/empty-cart.svg"
          alt="Empty Cart"
          className="w-64 h-64"
        />
        <h2 className="text-2xl font-bold text-center">Your cart is empty</h2>
        <p className="text-default-500 text-center">
          Looks like you haven't added anything to your cart yet
        </p>
        <Button
          as={Link}
          href="/"
          color="primary"
          variant="flat"
          className="mt-4"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        Shopping Cart ({itemCount()} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="w-full">
              <CardBody className="flex gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-default-500">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedColor &&
                          ` • Color: ${item.selectedColor}`}
                      </p>
                      <p className="font-bold mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => removeItem(item.id)}
                      className="p-0"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      isDisabled={item.quantity <= 1 || isUpdating === item.id}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      isDisabled={
                        item.quantity >= item.stock || isUpdating === item.id
                      }
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                    {isUpdating === item.id && (
                      <Spinner size="sm" className="ml-2" />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-xl font-bold">Order Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  {/* <span>{formatPrice(totalAmount())}</span> */}
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  {/* <span>{formatPrice(totalAmount())}</span> */}
                </div>
              </div>
            </CardBody>
            <CardFooter>
              <Button
                color="primary"
                className="w-full"
                size="lg"
                onPress={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
