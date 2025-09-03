import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Edit, Trash2, Coffee, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Category, MenuItemWithCategory, InsertCategory, InsertMenuItem } from "@shared/schema";

export default function MenuManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEditMenuItem, setShowEditMenuItem] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemWithCategory | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if ((user as any)?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Hanya admin yang dapat mengakses manajemen menu",
        variant: "destructive",
      });
      return;
    }
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      window.location.reload();
    }
  };

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest('/api/categories'),
  });

  // Fetch menu items
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ['/api/menu-items'],
    queryFn: () => apiRequest('/api/menu-items'),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: InsertCategory) => {
      console.log("Sending category data to API:", categoryData);
      return apiRequest("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // pastikan tipe konten benar
        },
        body: JSON.stringify(categoryData), // konversi object → JSON string
      });
    },
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowAddCategory(false);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      console.error("Create category error:", error);

      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      toast({
        title: "Error",
        description: error.message || "Gagal menambah kategori",
        variant: "destructive",
      });
    },
  });


  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCategory }) => {
      return apiRequest(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // stringify supaya aman
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowEditCategory(false);
      setEditingCategory(null);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui kategori",
        variant: "destructive",
      });
    },
  });


  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive",
      });
    },
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (menuItemData: InsertMenuItem) => {
      return apiRequest("/api/menu-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuItemData), // stringify agar aman
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      setShowAddMenuItem(false);
      toast({
        title: "Berhasil",
        description: "Menu berhasil ditambahkan",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Gagal menambah menu",
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertMenuItem }) => {
      return apiRequest(`/api/menu-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // ubah menjadi string JSON
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      setShowEditMenuItem(false);
      setEditingMenuItem(null);
      toast({
        title: "Berhasil",
        description: "Menu berhasil diperbarui",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui menu",
        variant: "destructive",
      });
    },
  });


  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/menu-items/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Berhasil",
        description: "Menu berhasil dihapus",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal menghapus menu",
        variant: "destructive",
      });
    },
  });

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategory(true);
  };

  const handleEditMenuItem = (menuItem: MenuItemWithCategory) => {
    setEditingMenuItem(menuItem);
    setShowEditMenuItem(true);
  };

  if (!user || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-coffee-800 mb-4">Access Denied</h1>
          <p className="text-coffee-600 mb-4">Hanya admin yang dapat mengakses halaman ini.</p>
          <Link href="/">
            <Button className="bg-coffee-500 hover:bg-coffee-600">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-coffee-400">
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coffee-500 rounded-xl flex items-center justify-center">
              <Coffee className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-coffee-800">Manajemen Menu</h1>
              <p className="text-coffee-600 text-xs sm:text-sm">Kelola kategori dan menu cafe</p>
            </div>
          </div>

          <div className="flex space-x-1 sm:space-x-2">
            <Link href="/">
              <Button
                variant="outline"
                className="border-coffee-200 text-coffee-700 hover:bg-coffee-50 text-xs sm:text-sm"
              >
                <ArrowLeft size={14} className="mr-1" />
                Kembali
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <LogOut size={14} className="mr-1" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-coffee-800">Kategori Menu</CardTitle>
                <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                  <DialogTrigger asChild>
                    <Button className="bg-coffee-500 hover:bg-coffee-600">
                      <Plus size={16} className="mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Kategori Baru</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                      category={null}
                      onSubmit={(data) => createCategoryMutation.mutate(data)}
                      isLoading={createCategoryMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="text-center py-4">
                  <span className="text-coffee-600">Loading kategori...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {categories?.map((category) => (
                    <div key={category.id} className="flex justify-between items-center p-3 bg-coffee-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-coffee-800">{category.name}</h3>
                        <p className="text-coffee-600 text-sm">{category.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-coffee-200 text-coffee-700"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-500">
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus kategori "{category.name}"?
                                Semua menu dalam kategori ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategoryMutation.mutate(category.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )) || []}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Menu Items Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-coffee-800">Menu Items</CardTitle>
                <Dialog open={showAddMenuItem} onOpenChange={setShowAddMenuItem}>
                  <DialogTrigger asChild>
                    <Button className="bg-coffee-500 hover:bg-coffee-600">
                      <Plus size={16} className="mr-2" />
                      Tambah Menu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tambah Menu Baru</DialogTitle>
                    </DialogHeader>
                    <MenuItemForm
                      menuItem={null}
                      categories={categories || []}
                      onSubmit={(data) => createMenuItemMutation.mutate(data)}
                      isLoading={createMenuItemMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {menuItemsLoading ? (
                <div className="text-center py-4">
                  <span className="text-coffee-600">Loading menu...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {menuItems?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-coffee-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-coffee-800">{item.name}</h3>
                        <p className="text-coffee-600 text-sm">{item.category.name}</p>
                        <p className="text-coffee-700 font-medium">Rp {parseFloat(item.price).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-coffee-200 text-coffee-700"
                          onClick={() => handleEditMenuItem(item)}
                        >
                          <Edit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-500">
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus menu "{item.name}"?
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMenuItemMutation.mutate(item.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )) || []}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-coffee-800">Daftar Lengkap Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-coffee-700">Nama Menu</TableHead>
                    <TableHead className="text-coffee-700">Kategori</TableHead>
                    <TableHead className="text-coffee-700">Harga</TableHead>
                    <TableHead className="text-coffee-700">Status</TableHead>
                    <TableHead className="text-coffee-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-coffee-800">{item.name}</TableCell>
                      <TableCell className="text-coffee-600">{item.category.name}</TableCell>
                      <TableCell className="text-coffee-600">Rp {parseFloat(item.price).toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {item.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-coffee-200 text-coffee-700"
                            onClick={() => handleEditMenuItem(item)}
                          >
                            <Edit size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="border-red-200 text-red-500">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Menu</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus menu "{item.name}"?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMenuItemMutation.mutate(item.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSubmit={(data) => updateCategoryMutation.mutate({ id: editingCategory!.id, data })}
            isLoading={updateCategoryMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditMenuItem} onOpenChange={setShowEditMenuItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <MenuItemForm
            menuItem={editingMenuItem}
            categories={categories || []}
            onSubmit={(data) => updateMenuItemMutation.mutate({ id: editingMenuItem!.id, data })}
            isLoading={updateMenuItemMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Category Form Component
interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: InsertCategory) => void;
  isLoading: boolean;
}

function CategoryForm({ category, onSubmit, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'Utensils',
    isActive: category?.isActive ?? 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.name.trim()) {
      alert('Nama kategori harus diisi');
      return;
    }

    // Pastikan data dalam format yang benar
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      icon: formData.icon,
      isActive: formData.isActive,
    };

    console.log('Submitting category data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="categoryName">Nama Kategori *</Label>
        <Input
          id="categoryName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Minuman Kopi"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="categoryDescription">Deskripsi</Label>
        <Textarea
          id="categoryDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Deskripsi kategori (opsional)"
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="categoryIcon">Icon</Label>
        <Select
          value={formData.icon}
          onValueChange={(value) => setFormData({ ...formData, icon: value })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih icon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Coffee">Coffee</SelectItem>
            <SelectItem value="GlassWater">GlassWater</SelectItem>
            <SelectItem value="Utensils">Utensils</SelectItem>
            <SelectItem value="IceCream">IceCream</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="categoryStatus">Status</Label>
        <Select
          value={formData.isActive.toString()}
          onValueChange={(value) => setFormData({ ...formData, isActive: parseInt(value) })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Aktif</SelectItem>
            <SelectItem value="0">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading || !formData.name.trim()} className="w-full bg-coffee-500 hover:bg-coffee-600">
        {isLoading ? 'Menyimpan...' : (category ? 'Perbarui Kategori' : 'Simpan Kategori')}
      </Button>
    </form>
  );
}

// Menu Item Form Component
interface MenuItemFormProps {
  menuItem?: MenuItemWithCategory | null;
  categories: Category[];
  onSubmit: (data: InsertMenuItem) => void;
  isLoading: boolean;
}

function MenuItemForm({ menuItem, categories, onSubmit, isLoading }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    categoryId: menuItem?.categoryId || '',
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    price: menuItem?.price || '',
    imageUrl: menuItem?.imageUrl || '',
    isAvailable: menuItem?.isAvailable ?? 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!formData.categoryId) {
      alert('Kategori harus dipilih');
      return;
    }

    if (!formData.name.trim()) {
      alert('Nama menu harus diisi');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Harga harus diisi dengan nilai yang valid');
      return;
    }

    // Pastikan data dalam format yang benar
    const submitData = {
      categoryId: formData.categoryId,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: formData.price,
      imageUrl: formData.imageUrl.trim() || null,
      isAvailable: formData.isAvailable,
    };

    console.log('Submitting menu item data:', submitData);
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="menuCategory">Kategori *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="menuName">Nama Menu *</Label>
        <Input
          id="menuName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Cappuccino"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="menuDescription">Deskripsi</Label>
        <Textarea
          id="menuDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Deskripsi menu (opsional)"
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="menuPrice">Harga *</Label>
        <Input
          id="menuPrice"
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="25000"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="menuImage">URL Gambar (opsional)</Label>
        <Input
          id="menuImage"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="menuStatus">Status</Label>
        <Select
          value={formData.isAvailable.toString()}
          onValueChange={(value) => setFormData({ ...formData, isAvailable: parseInt(value) })}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Tersedia</SelectItem>
            <SelectItem value="0">Tidak Tersedia</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={isLoading || !formData.name.trim() || !formData.categoryId || !formData.price}
        className="w-full bg-coffee-500 hover:bg-coffee-600"
      >
        {isLoading ? 'Menyimpan...' : (menuItem ? 'Perbarui Menu' : 'Simpan Menu')}
      </Button>
    </form>
  );
}