"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { FileUp, List } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          欢迎使用商品管理后台
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          一个现代化的后台，用于轻松管理您的商品目录。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card className="p-4">
          <CardHeader className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary p-3 rounded-full">
              <List className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">商品列表</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              查看、搜索和管理您的所有商品。
            </p>
            <Button as={Link} href="/products" color="primary" variant="shadow">
              查看商品
            </Button>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="flex items-center gap-4">
            <div className="bg-secondary/10 text-secondary p-3 rounded-full">
              <FileUp className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">导入商品</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              通过上传 HAR 文件快速批量导入商品。
            </p>
            <Button as={Link} href="/products/import" color="secondary" variant="shadow">
              导入文件
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
