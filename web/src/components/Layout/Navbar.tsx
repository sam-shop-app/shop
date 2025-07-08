import { useState } from "react";
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
} from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const navigation = [
  { name: "首页", href: "/" },
  { name: "全部商品", href: "/products" },
  { name: "特价商品", href: "/products?type=sale" },
  { name: "新品上市", href: "/products?type=new" },
];

const Navbare = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
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
            as={Link}
            to="/cart"
            variant="light"
            isIconOnly
            className="relative"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {totalItems > 0 && (
              <Badge color="danger" className="absolute -top-1 -right-1">
                totalItems
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
          <NavbarItem>
            <Button as={Link} to="/login" color="primary" variant="flat">
              登录
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
  );
};

export default Navbare;
