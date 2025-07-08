import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Link,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { OrderListItem } from "../types/order";
import { UserProfile, UserTab, UserLevelMap, UserLevelColors } from "../types/user";
import { formatDateTime, formatPrice } from "../utils/format";

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<UserTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    gender: "",
    birthdate: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    fetchUserProfile();
    fetchRecentOrders();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      setProfile(data);
      setEditForm({
        name: data.name,
        phone: data.phone || "",
        gender: data.gender || "",
        birthdate: data.birthdate || "",
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch("/api/orders/recent");
      const data = await response.json();
      setRecentOrders(data);
    } catch (error) {
      console.error("Failed to fetch recent orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("更新个人信息失败，请重试");
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-default-500">加载个人信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      {/* 用户信息概览 */}
      <Card className="mb-8">
        <CardBody className="flex flex-col md:flex-row items-center gap-6 p-8">
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24"
          />
          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <Badge color={UserLevelColors[profile.level] as any}>
                {UserLevelMap[profile.level]}
              </Badge>
            </div>
            <p className="text-default-500 mb-4">
              会员since {formatDateTime(profile.memberSince)}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-bold">{profile.stats.orderCount}</p>
                <p className="text-default-500">订单数</p>
              </div>
              <div>
                <p className="font-bold">{formatPrice(profile.stats.spentAmount)}</p>
                <p className="text-default-500">消费金额</p>
              </div>
              <div>
                <p className="font-bold">{profile.points}</p>
                <p className="text-default-500">积分</p>
              </div>
              <div>
                <p className="font-bold">{profile.stats.favoriteCount}</p>
                <p className="text-default-500">收藏商品</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 选项卡导航 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserTab)}>
        <Tab value="profile">个人资料</Tab>
        <Tab value="orders">我的订单</Tab>
        <Tab value="favorites">我的收藏</Tab>
        <Tab value="addresses">收货地址</Tab>
        <Tab value="settings">账号设置</Tab>
      </Tabs>

      <div className="mt-6">
        {/* 个人资料 */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-xl font-bold">个人资料</h2>
              <Button
                color="primary"
                variant="flat"
                onPress={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "取消" : "编辑"}
              </Button>
            </CardHeader>
            <CardBody className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="姓名"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <Input
                    label="手机号"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                  <Select
                    label="性别"
                    value={editForm.gender}
                    onChange={(value) =>
                      setEditForm({ ...editForm, gender: value })
                    }
                  >
                    <SelectItem value="">请选择</SelectItem>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </Select>
                  <Input
                    type="date"
                    label="生日"
                    value={editForm.birthdate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, birthdate: e.target.value })
                    }
                  />
                  <Button
                    color="primary"
                    className="w-full"
                    onPress={handleSaveProfile}
                  >
                    保存修改
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-default-500">姓名</p>
                      <p>{profile.name}</p>
                    </div>
                    <div>
                      <p className="text-default-500">邮箱</p>
                      <p>{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-default-500">手机号</p>
                      <p>{profile.phone || "未设置"}</p>
                    </div>
                    <div>
                      <p className="text-default-500">性别</p>
                      <p>
                        {profile.gender === "male"
                          ? "男"
                          : profile.gender === "female"
                          ? "女"
                          : profile.gender === "other"
                          ? "其他"
                          : "未设置"}
                      </p>
                    </div>
                    <div>
                      <p className="text-default-500">生日</p>
                      <p>{profile.birthdate || "未设置"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* 最近订单 */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/orders/${order.id}`)}>
                <CardBody>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <img
                        src={order.firstItemImage}
                        alt="商品图片"
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <p className="text-default-500">订单号：{order.orderNumber}</p>
                        <p className="mt-2">{order.itemCount} 件商品</p>
                        <p className="text-sm text-default-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge color="primary">{order.status}</Badge>
                      <p className="mt-2 font-bold">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
            <div className="text-center">
              <Button
                as={Link}
                href="/orders"
                variant="flat"
                color="primary"
              >
                查看全部订单
              </Button>
            </div>
          </div>
        )}

        {/* 站位提示 */}
        {(activeTab === "favorites" ||
          activeTab === "addresses" ||
          activeTab === "settings") && (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-xl text-default-500">
                {activeTab === "favorites" && "收藏功能正在开发中..."}
                {activeTab === "addresses" && "地址管理功能正在开发中..."}
                {activeTab === "settings" && "账号设置功能正在开发中..."}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
