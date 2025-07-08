import { Button, Image, Link } from "@heroui/react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 图标 */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <Image
            src="/images/404.svg"
            alt="404 Not Found"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 错误信息 */}
        <h1 className="text-4xl font-bold mb-4">页面不见了</h1>
        <p className="text-default-500 mb-8">
          您访问的页面可能已被删除、名称已更改或暂时不可用。
        </p>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <Button
            color="primary"
            size="lg"
            className="w-full"
            onPress={() => navigate(-1)}
          >
            返回上一页
          </Button>

          <div className="flex gap-4">
            <Button
              as={Link}
              href="/"
              variant="flat"
              color="primary"
              className="flex-1"
            >
              返回首页
            </Button>
            <Button
              as={Link}
              href="/products"
              variant="flat"
              color="primary"
              className="flex-1"
            >
              浏览商品
            </Button>
          </div>
        </div>

        {/* 快捷导航 */}
        <div className="mt-12">
          <p className="text-default-500 mb-4">您可能想要访问：</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              as={Link}
              href="/cart"
              variant="light"
              size="sm"
            >
              购物车
            </Button>
            <Button
              as={Link}
              href="/orders"
              variant="light"
              size="sm"
            >
              我的订单
            </Button>
            <Button
              as={Link}
              href="/favorites"
              variant="light"
              size="sm"
            >
              收藏夹
            </Button>
            <Button
              as={Link}
              href="/profile"
              variant="light"
              size="sm"
            >
              个人中心
            </Button>
          </div>
        </div>

        {/* 帮助支持 */}
        <div className="mt-12 text-default-500">
          <p>需要帮助？</p>
          <div className="flex justify-center gap-4 mt-2">
            <Button
              as={Link}
              href="/help"
              variant="light"
              size="sm"
            >
              帮助中心
            </Button>
            <Button
              as={Link}
              href="/contact"
              variant="light"
              size="sm"
            >
              联系客服
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
