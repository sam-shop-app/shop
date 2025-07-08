import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">仪表盘</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">商品管理</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground pt-2">
              管理商品列表，导入和更新商品信息。
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/products" className="w-full">
              <Button className="w-full">进入</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="opacity-60">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">订单管理</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground pt-2">
              此模块正在开发中，即将推出。
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">即将推出</Button>
          </CardFooter>
        </Card>
        
        <Card className="opacity-60">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">用户管理</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground pt-2">
              此模块正在开发中，即将推出。
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">即将推出</Button>
          </CardFooter>
        </Card>
        </div>
      
      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>© 2024 商品管理后台. 保留所有权利。</p>
      </footer>
    </div>
  );
}
