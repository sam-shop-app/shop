"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab
} from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  level: number;
  image_url: string | null;
  sort_order: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api("/categories/tree");
      console.log("API response:", response);
      if (response.success) {
        const data = response.data as Category[];
        console.log("Processed tree data:", data);
        setCategories(data);
        // Auto-select first category if available
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0]);
        }
      } else {
        toast.error("获取分类失败");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("加载分类失败", { description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select a category
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  // Get all subcategories (level 2 and 3) for the selected category
  const getSubcategories = (category: Category | null): Category[] => {
    if (!category || !category.children) return [];
    
    // Flatten the hierarchy to get all subcategories
    const result: Category[] = [];
    
    // Add all level 2 categories
    category.children.forEach(level2 => {
      result.push(level2);
      
      // Add all level 3 categories under this level 2
      if (level2.children) {
        level2.children.forEach(level3 => {
          result.push(level3);
        });
      }
    });
    
    return result;
  };

  // Get level 2 categories only
  const getLevel2Categories = (category: Category | null): Category[] => {
    if (!category || !category.children) return [];
    return category.children;
  };

  // Get all level 3 categories under the selected level 1 category
  const getAllLevel3Categories = (category: Category | null): Category[] => {
    if (!category || !category.children) return [];
    
    const result: Category[] = [];
    
    category.children.forEach(level2 => {
      if (level2.children) {
        level2.children.forEach(level3 => {
          result.push(level3);
        });
      }
    });
    
    return result;
  };

  // Get parent category name for a level 3 category
  const getParentName = (parentId: string | null): string => {
    if (!parentId || !selectedCategory) return "-";
    
    const parent = selectedCategory.children?.find(cat => cat.id === parentId);
    return parent ? parent.name : "-";
  };

  // Get displayed subcategories based on active tab
  const getDisplayedSubcategories = (): Category[] => {
    if (!selectedCategory) return [];
    
    switch (activeTab) {
      case "level2":
        return getLevel2Categories(selectedCategory);
      case "level3":
        return getAllLevel3Categories(selectedCategory);
      case "all":
      default:
        return getSubcategories(selectedCategory);
    }
  };

  const subcategories = getDisplayedSubcategories();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品分类</h1>
        <Button isIconOnly variant="light" onPress={fetchCategories} isDisabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </div>

      {/* Level 1 Categories as Cards */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" label="加载中..." />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-medium mb-4">一级分类</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {categories.map((category) => (
              <Card 
                key={category.id}
                isPressable
                onPress={() => handleSelectCategory(category)}
                className={`border-2 ${selectedCategory?.id === category.id ? 'border-primary' : 'border-transparent'}`}
              >
                <CardBody className="p-0 overflow-hidden">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-40 object-cover"
                      radius="none"
                    />
                  ) : (
                    <div className="w-full h-40 bg-default-100 flex items-center justify-center text-default-400">
                      无图片
                    </div>
                  )}
                </CardBody>
                <CardFooter className="flex justify-between items-center">
                  <div className="font-medium">{category.name}</div>
                  <Chip size="sm" color="secondary">{category.children?.length || 0} 个子分类</Chip>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Subcategories Table */}
          {selectedCategory && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">
                  {selectedCategory.name} 的子分类
                </h2>
                <Tabs 
                  selectedKey={activeTab} 
                  onSelectionChange={(key) => setActiveTab(key as string)}
                  size="sm"
                >
                  <Tab key="all" title="全部" />
                  <Tab key="level2" title="二级分类" />
                  <Tab key="level3" title="三级分类" />
                </Tabs>
              </div>

              <Table aria-label="子分类表格" shadow="sm" className="bg-background">
                <TableHeader>
                  <TableColumn>名称</TableColumn>
                  <TableColumn>层级</TableColumn>
                  <TableColumn>{activeTab === "level3" ? "所属二级分类" : ""}</TableColumn>
                  <TableColumn>排序</TableColumn>
                  <TableColumn>ID</TableColumn>
                </TableHeader>
                <TableBody
                  emptyContent="该分类下暂无子分类"
                  items={subcategories}
                >
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.image_url && (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              width={24}
                              height={24}
                              className="rounded-sm"
                            />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip color={item.level === 2 ? "primary" : "secondary"} size="sm">
                          {item.level === 2 ? "二级" : "三级"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {activeTab === "level3" ? getParentName(item.parent_id) : ""}
                      </TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell>{item.id}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
} 