import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Avatar,
  addToast,
} from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import AuthModal from "@/components/AuthModal";

const navigation = [
  { name: "首页", href: "/" },
  { name: "全部商品", href: "/" },
  { name: "特价商品", href: "/?sort=price_asc" },
  { name: "新品上市", href: "/" },
];

const Navbare = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems, fetchCart } = useCart();
  const navigate = useNavigate();

  // 当用户登录时获取购物车数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="bg-background"
      >
      {/* Logo */}
      <NavbarBrand>
        <Link to="/" className="font-bold text-inherit text-xl">
          山姆闪购
        </Link>
      </NavbarBrand>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigation.map((item) => (
          <NavbarItem key={item.name}>
            <Link
              to={item.href}
              className="text-foreground/80 hover:text-foreground"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* User Actions */}
      <NavbarContent justify="end">
        {/* Cart */}
        <NavbarItem>
          <Button
            variant="light"
            isIconOnly
            className="relative"
            onClick={() => {
              if (isAuthenticated) {
                navigate("/cart");
              } else {
                addToast({
                  title: '请先登录',
                  description: '登录后才能查看购物车',
                  color: 'warning',
                  timeout: 3000,
                });
              }
            }}
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {isAuthenticated && totalItems > 0 && (
              <Badge color="danger" className="absolute -top-1 -right-1">
                {totalItems}
              </Badge>
            )}
          </Button>
        </NavbarItem>

        {/* User Menu */}
        {isAuthenticated ? (
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  src={user?.avatar}
                  name={user?.name}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="用户菜单">
                <DropdownItem key="profile" as={Link} href="/profile">
                  个人中心
                </DropdownItem>
                <DropdownItem key="orders" as={Link} href="/orders">
                  我的订单
                </DropdownItem>
                <DropdownItem key="settings" as={Link} href="/settings">
                  账户设置
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onClick={handleLogout}
                >
                  退出登录
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <NavbarItem className="flex gap-2">
            <Button 
              color="primary" 
              variant="flat"
              size="sm"
              onClick={openLoginModal}
            >
              登录
            </Button>
            <Button 
              color="primary" 
              variant="solid"
              size="sm"
              onClick={openRegisterModal}
            >
              注册
            </Button>
          </NavbarItem>
        )}

        {/* Mobile Menu Toggle */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          className="sm:hidden"
        />
      </NavbarContent>

      {/* Mobile Navigation */}
      <NavbarMenu>
        {navigation.map((item) => (
          <NavbarMenuItem key={item.name}>
            <Link
              to={item.href}
              className="w-full text-foreground/80 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
      </Navbar>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authModalMode}
      />
    </>
  );
};

export default Navbare;
