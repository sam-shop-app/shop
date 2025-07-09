"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "../globals.css";
import { Package, Search, Bell } from "lucide-react";
import { Providers } from "./providers";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from "@heroui/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// export const metadata: Metadata = {
//   title: "商品管理后台",
//   description: "一个用于管理商品的后台",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <html lang="zh-CN">
        <body className={`${inter.variable} antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar isBordered>
              <NavbarBrand>
                <Link href="/" className="flex items-center font-bold">
                  <Package className="h-6 w-6 mr-2" />
                  <p className="font-bold text-inherit">商品管理后台</p>
                </Link>
              </NavbarBrand>

              <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem isActive={pathname === "/"}>
                  <Link href="/">
                    首页
                  </Link>
                </NavbarItem>
                <NavbarItem isActive={pathname.startsWith("/products")}>
                  <Link href="/products">
                    商品
                  </Link>
                </NavbarItem>
                 <NavbarItem isActive={pathname.startsWith("/users")}>
                  <Link href="/users">
                    用户
                  </Link>
                </NavbarItem>
              </NavbarContent>

              <NavbarContent as="div" justify="end">
                <Input
                  classNames={{
                    base: "max-w-full sm:max-w-[10rem] h-10",
                    mainWrapper: "h-full",
                    input: "text-small",
                    inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                  }}
                  placeholder="输入关键词搜索..."
                  size="sm"
                  startContent={<Search size={18} />}
                  type="search"
                />
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="secondary"
                      size="sm"
                    />
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownItem key="settings">我的设置</DropdownItem>
                    <DropdownItem key="logout" color="danger" onClick={handleLogout}>
                      退出登录
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarContent>
            </Navbar>
            
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
