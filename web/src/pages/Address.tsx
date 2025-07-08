import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserAddress } from "../types/user";

interface AddressFormData {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  tag: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  name: "",
  phone: "",
  province: "",
  city: "",
  district: "",
  address: "",
  tag: "",
  isDefault: false,
};

const ADDRESS_TAGS = ["家", "公司", "学校", "其他"];

export default function Address() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/address" } });
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, navigate]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/addresses");
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    onOpen();
  };

  const handleEditClick = (address: UserAddress) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      address: address.address,
      tag: address.tag || "",
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    onOpen();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingId
        ? `/api/addresses/${editingId}`
        : "/api/addresses";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      await fetchAddresses();
      onClose();
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("保存地址失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个地址吗？")) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      await fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("删除地址失败，请重试");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      await fetchAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
      alert("设置默认地址失败，请重试");
    }
  };

  if (isLoading && addresses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-default-500">加载地址列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">收货地址</h1>
        <Button color="primary" onPress={handleAddClick}>
          添加新地址
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{address.name}</span>
                    <span className="text-default-500">{address.phone}</span>
                    {address.tag && (
                      <span className="px-2 py-0.5 text-xs rounded bg-default-100">
                        {address.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-default-500">
                    {address.province}
                    {address.city}
                    {address.district}
                    {address.address}
                  </p>
                </div>
                {address.isDefault && (
                  <span className="text-primary text-sm">默认地址</span>
                )}
              </div>
              <Divider className="my-4" />
              <div className="flex justify-between items-center">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => handleSetDefault(address.id)}
                  isDisabled={address.isDefault}
                >
                  设为默认
                </Button>
                <div className="space-x-2">
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => handleEditClick(address)}
                  >
                    编辑
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    isLoading={isDeleting === address.id}
                    onPress={() => handleDelete(address.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && !isLoading && (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-xl text-default-500 mb-4">
              您还没有添加任何收货地址
            </p>
            <Button color="primary" onPress={handleAddClick}>
              添加新地址
            </Button>
          </CardBody>
        </Card>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {editingId ? "编辑地址" : "添加新地址"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="收货人"
                    placeholder="请输入收货人姓名"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="手机号码"
                    placeholder="请输入手机号码"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="省份"
                    placeholder="请选择省份"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="城市"
                    placeholder="请选择城市"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="区县"
                    placeholder="请选择区县"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    required
                  />
                </div>
                <Textarea
                  label="详细地址"
                  placeholder="请输入详细地址"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
                <Select
                  label="地址标签"
                  placeholder="选择或输入标签"
                  value={formData.tag}
                  onChange={(value) => setFormData({ ...formData, tag: value })}
                >
                  {ADDRESS_TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                  />
                  <label htmlFor="isDefault">设为默认地址</label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button color="primary" type="submit" isLoading={isLoading}>
                保存
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
