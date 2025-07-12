import { Button, Image, Link } from "@heroui/react";
import { useNavigate, useRouteError } from "react-router-dom";

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError;

  const getErrorMessage = () => {
    if (error.message) {
      return error.message;
    }
    if (error.statusText) {
      return error.statusText;
    }
    return "发生了一些错误";
  };

  const getErrorTitle = () => {
    switch (error.status) {
      case 401:
        return "访问受限";
      case 403:
        return "禁止访问";
      case 404:
        return "页面不存在";
      case 500:
        return "服务器错误";
      default:
        return "出错了";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 错误图标 */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <Image
            src="/images/error.svg"
            alt="Error"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 错误信息 */}
        <h1 className="text-4xl font-bold mb-4">{getErrorTitle()}</h1>
        <p className="text-default-500 mb-8">{getErrorMessage()}</p>

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
              href="/help"
              variant="flat"
              color="primary"
              className="flex-1"
            >
              获取帮助
            </Button>
          </div>
        </div>

        {/* 常用功能 */}
        <div className="mt-12">
          <p className="text-default-500 mb-4">您可以尝试：</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              as={Link}
              href="/"
              variant="light"
              size="sm"
            >
              浏览商品
            </Button>
            <Button
              as={Link}
              href="/cart"
              variant="light"
              size="sm"
            >
              查看购物车
            </Button>
            <Button
              as={Link}
              href="/orders"
              variant="light"
              size="sm"
            >
              查看订单
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

        {/* 技术支持 */}
        {error.status === 500 && (
          <div className="mt-12 text-sm text-default-400">
            <p>错误代码：{error.status}</p>
            <p>如果问题持续存在，请联系技术支持</p>
          </div>
        )}
      </div>
    </div>
  );
}
