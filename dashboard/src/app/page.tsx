"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Skeleton } from "@heroui/react";
import { FileUp, List, ShoppingCart, Users } from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  products: number;
  users: number;
}

const StatCard = ({ title, value, icon, isLoading }: { title: string; value: number | string; icon: React.ReactNode, isLoading: boolean }) => (
  <Card className="p-4">
    <CardHeader className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {icon}
    </CardHeader>
    <CardBody>
      {isLoading ? (
        <Skeleton className="w-1/2 h-8 rounded-md" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </CardBody>
  </Card>
);

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api("/stats");
        setStats(data as Stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <main className="p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
        仪表盘
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="总商品数" 
          value={stats?.products ?? 0} 
          icon={<List className="h-5 w-5 text-gray-400" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="总用户数" 
          value={stats?.users ?? 0} 
          icon={<Users className="h-5 w-5 text-gray-400" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="总订单数" 
          value="N/A" 
          icon={<ShoppingCart className="h-5 w-5 text-gray-400" />} 
          isLoading={isLoading}
        />
        <StatCard 
          title="今日收入" 
          value="N/A" 
          icon={<FileUp className="h-5 w-5 text-gray-400" />} 
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">商品管理</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              查看、搜索和管理您的所有商品。
            </p>
            <Button as={Link} href="/products" color="primary">
              管理商品
            </Button>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">用户管理</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              管理所有用户账户和权限。
            </p>
            <Button as={Link} href="/users" color="secondary">
              管理用户
            </Button>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">导入商品</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              通过上传文件快速批量导入商品。
            </p>
            <Button as={Link} href="/products/import" color="default">
              导入文件
            </Button>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
