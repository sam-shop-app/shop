import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
  Button,
  Chip,
} from "@heroui/react";
import { Container } from "@/components";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";

// 模拟数据
const banners = [
  {
    id: 1,
    title: "新鲜水果大促",
    description: "精选优质水果，新鲜直达",
    image: "/images/banners/fruits.jpg",
    link: "/products?category=fruits",
  },
  {
    id: 2,
    title: "进口零食特惠",
    description: "世界美味，触手可得",
    image: "/images/banners/snacks.jpg",
    link: "/products?category=snacks",
  },
  {
    id: 3,
    title: "日用品满减",
    description: "生活必需，品质之选",
    image: "/images/banners/daily.jpg",
    link: "/products?category=daily",
  },
];

const categories = [
  { id: 1, name: "新鲜水果", icon: "🍎", link: "/products?category=fruits" },
  { id: 2, name: "生鲜食品", icon: "🥩", link: "/products?category=fresh" },
  { id: 3, name: "休闲零食", icon: "🍪", link: "/products?category=snacks" },
  { id: 4, name: "饮料冲调", icon: "☕", link: "/products?category=drinks" },
  { id: 5, name: "粮油调味", icon: "🍚", link: "/products?category=food" },
  { id: 6, name: "日用百货", icon: "🧴", link: "/products?category=daily" },
  { id: 7, name: "个护清洁", icon: "🧼", link: "/products?category=clean" },
  { id: 8, name: "家居用品", icon: "🏠", link: "/products?category=home" },
];

const featuredProducts = [
  {
    id: 1,
    name: "云南红富士苹果",
    description: "新鲜采摘，甜脆可口",
    price: 29.9,
    originalPrice: 39.9,
    image: "/images/products/apple.jpg",
    discount: "7.5折",
    stock: 100,
  },
  {
    id: 2,
    name: "泰国金枕头榴莲",
    description: "果肉饱满，口感细腻",
    price: 99.9,
    originalPrice: 159.9,
    image: "/images/products/durian.jpg",
    discount: "6.2折",
    stock: 50,
  },
  {
    id: 3,
    name: "越南白心火龙果",
    description: "清甜多汁，营养丰富",
    price: 19.9,
    originalPrice: 29.9,
    image: "/images/products/dragonfruit.jpg",
    discount: "6.6折",
    stock: 80,
  },
  {
    id: 4,
    name: "智利进口车厘子",
    description: "果大核小，品质上乘",
    price: 89.9,
    originalPrice: 129.9,
    image: "/images/products/cherry.jpg",
    discount: "6.9折",
    stock: 30,
  },
];

const newProducts = [
  {
    id: 101,
    name: "新西兰奇异果",
    description: "维C之王，酸甜可口",
    price: 49.9,
    image: "/images/products/kiwi.jpg",
    tag: "新品",
    stock: 200,
  },
  {
    id: 102,
    name: "墨西哥牛油果",
    description: "营养丰富，口感细腻",
    price: 59.9,
    image: "/images/products/avocado.jpg",
    tag: "新品",
    stock: 150,
  },
  {
    id: 103,
    name: "泰国椰青",
    description: "清甜解暑，健康饮品",
    price: 29.9,
    image: "/images/products/coconut.jpg",
    tag: "新品",
    stock: 100,
  },
  {
    id: 104,
    name: "马来西亚猫山王榴莲",
    description: "果肉金黄，香甜浓郁",
    price: 199.9,
    image: "/images/products/mswk.jpg",
    tag: "新品",
    stock: 20,
  },
];

const HomePage = () => {
  const { addItem } = useCart();

  return (
    <div className="space-y-12">
      {/* Banner 轮播 */}
      <section className="">
        <Container>
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={index}>
                  <Link to={banner.link} className="w-full block relative">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      className="w-full aspect-21/9 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/60 to-transparent text-white">
                      <h2 className="text-2xl font-bold">{banner.title}</h2>
                      <p className="mt-2">{banner.description}</p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Container>
      </section>

      {/* 分类导航 */}
      <section>
        <Container>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link key={category.id} to={category.link} className="group">
                <Card
                  isPressable
                  className="border-none bg-background/40 hover:bg-background/80"
                >
                  <CardBody className="p-4 text-center">
                    <span className="text-3xl mb-2 block transition-transform group-hover:scale-110">
                      {category.icon}
                    </span>
                    <span className="text-sm text-foreground/80">
                      {category.name}
                    </span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 特价商品 */}
      <section>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">特价商品</h2>
            <Button
              as={Link}
              to="/products?type=sale"
              variant="light"
              color="primary"
              endContent={<span>→</span>}
            >
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="border-none" isPressable>
                <CardHeader className="p-0">
                  <Link to={`/products/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                      radius="lg"
                    />
                  </Link>
                  <Chip
                    color="danger"
                    variant="flat"
                    className="absolute top-2 right-2"
                  >
                    {product.discount}
                  </Chip>
                </CardHeader>
                <CardBody className="px-3 py-2">
                  <h3 className="font-semibold text-foreground/90">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-danger">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-foreground/50 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
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
        </Container>
      </section>

      {/* 新品上市 */}
      <section>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">新品上市</h2>
            <Button
              as={Link}
              to="/products?type=new"
              variant="light"
              color="primary"
              endContent={<span>→</span>}
            >
              查看更多
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <Card key={product.id} className="border-none" isPressable>
                <CardHeader className="p-0">
                  <Link to={`/products/${product.id}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                      radius="lg"
                    />
                  </Link>
                  <Chip
                    color="success"
                    variant="flat"
                    className="absolute top-2 right-2"
                  >
                    {product.tag}
                  </Chip>
                </CardHeader>
                <CardBody className="px-3 py-2">
                  <h3 className="font-semibold text-foreground/90">
                    {product.name}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {product.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-bold">
                      {formatPrice(product.price)}
                    </span>
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
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
