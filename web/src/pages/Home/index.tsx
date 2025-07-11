import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Spinner,
} from "@heroui/react";
import { Container } from "@/components";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";
import request from "@/utils/request";
import type { Product } from "sam-api/types";

interface Category {
  id: string;
  name: string;
  image_url: string;
  products: Product[];
}

const HomePage = () => {
  const { addItem } = useCart();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await request.get("/home/data");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch home page data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </Container>
    );
  }

  return (
    <div className="space-y-12">
      {data.map((category) => (
        <section key={category.id}>
          <Container>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{category.name}</h2>
              <Button
                as={Link}
                to={`/products?category=${category.id}`}
                variant="light"
                color="primary"
                endContent={<span>→</span>}
              >
                查看更多
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {category.products.map((product) => (
                <Card
                  key={product.id}
                  className="border-none group"
                  isPressable
                >
                  <CardBody className="p-0 overflow-hidden">
                    <Link to={`/products/${product.id}`}>
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                        radius="lg"
                      />
                    </Link>
                  </CardBody>
                  <CardFooter className="flex-col items-start px-3 py-2">
                    <p className="text-xs text-foreground/60 h-8 overflow-hidden">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between w-full mt-2">
                      <span className="text-lg font-bold text-danger">
                        {formatPrice(product.price)}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        color="primary"
                        variant="ghost"
                        onPress={() => {
                          const { image_url, ...rest } = product;
                          addItem({ ...rest, image: image_url });
                        }}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      ))}
    </div>
  );
};

export default HomePage;
