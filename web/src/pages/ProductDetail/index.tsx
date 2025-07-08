import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Image,
  Button,
  Tabs,
  Tab,
  Divider,
  // Rating,
  User,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  ScrollShadow,
} from "@heroui/react";
import { Container } from "@/components";
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useCart } from "@/hooks/useCart";
import { formatPrice, formatDateTime } from "@/utils/format";

// 模拟商品数据
const product = {
  id: "1",
  name: "新鲜云南红富士苹果",
  price: 29.9,
  originalPrice: 39.9,
  description:
    "云南高原红富士苹果，色泽鲜艳，口感甜脆，富含多种维生素和矿物质。",
  images: [
    "/images/products/apple-1.jpg",
    "/images/products/apple-2.jpg",
    "/images/products/apple-3.jpg",
    "/images/products/apple-4.jpg",
  ],
  stock: 999,
  sales: 2380,
  category: "fruits",
  specifications: {
    产地: "云南省昆明市",
    规格: "5斤装",
    保质期: "7天",
    储存方法: "常温、冷藏均可",
    等级: "一级果",
  },
  details: [
    {
      title: "商品介绍",
      content:
        "云南红富士苹果以其独特的高原气候条件培育而成，果实色泽艳丽，皮薄肉厚，口感脆甜。每一个苹果都经过严格挑选，确保品质上乘。富含维生素C、膳食纤维等营养物质，是馈赠亲友、日常食用的理想选择。",
    },
    {
      title: "产品特点",
      content:
        "1. 高原种植，自然生长\n2. 果形周正，色泽红艳\n3. 果肉细腻，口感甜脆\n4. 营养丰富，健康美味",
    },
  ],
  reviews: [
    {
      id: 1,
      user: {
        name: "张三",
        avatar: "/images/avatars/user1.jpg",
      },
      rating: 5,
      content: "水果很新鲜，包装也很好，物流速度快，价格实惠，会继续购买的！",
      images: [
        "/images/reviews/review1-1.jpg",
        "/images/reviews/review1-2.jpg",
      ],
      date: "2023-12-20 14:30:00",
    },
    {
      id: 2,
      user: {
        name: "李四",
        avatar: "/images/avatars/user2.jpg",
      },
      rating: 4,
      content: "苹果很甜，但是有几个有些碰伤，其他都还不错。",
      images: ["/images/reviews/review2-1.jpg"],
      date: "2023-12-19 16:45:00",
    },
  ],
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addItem } = useCart();

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(value, product.stock));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      quantity,
    });
  };

  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品图片区 */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardBody className="p-0">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover cursor-zoom-in"
                onClick={onOpen}
              />
            </CardBody>
          </Card>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <Card
                key={index}
                isPressable
                className={`overflow-hidden ${
                  selectedImage === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <CardBody className="p-0">
                  <Image
                    src={image}
                    alt={`${product.name}-${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* 商品信息区 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mt-2 text-foreground/60">{product.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-danger">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-foreground/50 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
            <div className="text-sm text-foreground/60">
              销量 {product.sales} | 库存 {product.stock}
            </div>
          </div>

          <Divider />

          {/* 规格信息 */}
          <div className="space-y-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-foreground/60 w-20">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>

          <Divider />

          {/* 购买数量 */}
          <div className="flex items-center gap-4">
            <span className="text-foreground/60">购买数量</span>
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                className="w-20 text-center"
              />
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              size="lg"
              variant="flat"
              color="primary"
              startContent={<ShoppingCartIcon className="h-5 w-5" />}
              className="flex-1"
              onClick={handleAddToCart}
            >
              加入购物车
            </Button>
            <Button size="lg" color="primary" className="flex-1">
              立即购买
            </Button>
            <Button
              isIconOnly
              variant="flat"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              {isFavorite ? (
                <HeartIconSolid className="h-6 w-6 text-danger" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </Button>
            <Button isIconOnly variant="flat">
              <ShareIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* 商品详情标签页 */}
      <div className="mt-12">
        <Tabs aria-label="商品详情标签页" color="primary">
          <Tab key="details" title="商品详情">
            <Card>
              <CardBody className="space-y-8">
                {product.details.map((detail, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold mb-4">
                      {detail.title}
                    </h3>
                    <p className="whitespace-pre-line text-foreground/80">
                      {detail.content}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="reviews" title="商品评价">
            <Card>
              <CardBody>
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <User
                          name={review.user.name}
                          avatarProps={{
                            src: review.user.avatar,
                          }}
                        />
                        <span className="text-sm text-foreground/60">
                          {formatDateTime(review.date)}
                        </span>
                      </div>
                      {/* <Rating value={review.rating} readOnly /> */}
                      <p className="text-foreground/80">{review.content}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {review.images.map((image, index) => (
                            <Image
                              key={index}
                              src={image}
                              alt={`评价图片-${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <Divider />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* 图片预览模态框 */}
      <Modal
        size="5xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {product.name}
          </ModalHeader>
          <ModalBody>
            <ScrollShadow size={400}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full object-contain"
              />
            </ScrollShadow>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage;
