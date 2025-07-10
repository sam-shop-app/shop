"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User as UserAvatar,
  Chip,
  Tooltip,
  Pagination,
  Button,
  addToast,
  Spinner
} from "@heroui/react";
import { Edit, Trash2, Eye, Plus, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { User } from "sam-api/types";

type UserData = {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
};

const columns = [
  { name: "用户", uid: "user" },
  { name: "角色", uid: "role" },
  { name: "状态", uid: "status" },
  { name: "操作", uid: "actions" },
];

const statusColorMap: { [key: number]: "success" | "danger" | "warning" } = {
  1: "success",
  0: "danger",
  2: "warning",
};

export default function UsersPage() {
  const [data, setData] = useState<UserData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        addToast({ title: "错误", description: "未找到认证令牌，请重新登录。", color: "danger" });
        return;
      }

      const response: UserData = await api(
        `/users?page=${currentPage}&pageSize=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(response);
    } catch (err: any) {
      addToast({ title: "获取用户失败", description: err.data?.error || "加载用户数据时出错。", color: "danger" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  const renderCell = useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "user":
        return (
          <UserAvatar
            avatarProps={{ radius: "lg", src: user.avatar_url }}
            description={user.email}
            name={user.username}
          >
            {user.email}
          </UserAvatar>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{user.role}</p>
            <p className="text-bold text-sm capitalize text-default-400">团队</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
            {user.status === 1 ? '活跃' : (user.status === 0 ? '禁用' : '待验证')}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="详情">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Eye />
              </span>
            </Tooltip>
            <Tooltip content="编辑用户">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Edit />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="删除用户">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <Trash2 />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  
  const pages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex gap-3">
            <Button color="primary" endContent={<Plus />}>
                新增用户
            </Button>
            <Button isIconOnly variant="flat" onPress={() => fetchUsers(page)}>
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
            </Button>
        </div>
      </div>
      <Table 
        aria-label="用户数据表格"
        bottomContent={
            pages > 1 ? (
                <div className="flex w-full justify-center">
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={pages}
                        onChange={(p) => setPage(p)}
                    />
                </div>
            ) : null
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody 
            items={data?.data ?? []}
            isLoading={isLoading}
            loadingContent={<Spinner label="加载中..." />}
            emptyContent={"暂无用户数据"}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
