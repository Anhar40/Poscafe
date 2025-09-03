import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Coffee, Utensils, GlassWater, IceCream, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MenuItem, MenuItemWithCategory, Category } from "@shared/schema";
import { useEffect } from "react";

interface MenuGridProps {
  onAddToOrder: (menuItem: MenuItem) => void;
}

export default function MenuGrid({ onAddToOrder }: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch categories
  const { data: categories, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch menu items
  const { data: menuItems, isLoading, error: menuError } = useQuery<MenuItemWithCategory[]>({
    queryKey: ['/api/menu-items'],
  });

  // Handle errors
  useEffect(() => {
    if (categoriesError && isUnauthorizedError(categoriesError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [categoriesError, toast]);

  useEffect(() => {
    if (menuError && isUnauthorizedError(menuError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [menuError, toast]);

  // Filter menu items
  const filteredMenuItems = menuItems?.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.name.toLowerCase().includes(selectedCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('kopi') || name.includes('coffee')) return Coffee;
    if (name.includes('makanan') || name.includes('food')) return Utensils;
    if (name.includes('minuman') || name.includes('drink')) return GlassWater;
    if (name.includes('dessert') || name.includes('ice')) return IceCream;
    return Utensils;
  };

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
      {/* Categories */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-coffee-800 mb-3 sm:mb-4">Kategori Menu</h2>
        <div className="flex space-x-2 sm:space-x-3 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            className={`px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap ${selectedCategory === 'all'
                ? 'bg-coffee-500 hover:bg-coffee-600 text-white'
                : 'border-coffee-200 text-coffee-700 hover:bg-coffee-50'
              }`}
            onClick={() => setSelectedCategory('all')}
          >
            <Utensils size={16} className="mr-1 sm:mr-2" />
            Semua
          </Button>
          {categories?.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.name.toLowerCase() ? "default" : "outline"}
                className={`px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap ${selectedCategory === category.name.toLowerCase()
                    ? 'bg-coffee-500 hover:bg-coffee-600 text-white'
                    : 'border-coffee-200 text-coffee-700 hover:bg-coffee-50'
                  }`}
                onClick={() => setSelectedCategory(category.name.toLowerCase())}
              >
                <IconComponent size={16} className="mr-1 sm:mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Input
            type="text"
            placeholder="Cari menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 sm:pl-12 border-coffee-200 focus:ring-coffee-400"
          />
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-coffee-400" size={16} />
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)] overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="animate-spin text-coffee-500" size={32} />
            <span className="ml-2 text-coffee-600 text-sm sm:text-base">Loading menu...</span>
          </div>
        ) : filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-coffee-100 hover:border-coffee-300"
              onClick={() => onAddToOrder(item)}
            >
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
                    <Coffee className="text-coffee-400" size={32} />
                  </div>
                )}
              </div>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-semibold text-coffee-800 mb-1 text-sm sm:text-base">{item.name}</h3>
                {item.description && (
                  <p className="text-coffee-600 text-xs sm:text-sm mb-2 line-clamp-2">{item.description}</p>
                )}
                <p className="text-base sm:text-lg font-bold text-coffee-700">
                  Rp {parseFloat(item.price).toLocaleString('id-ID')}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <Coffee className="mx-auto text-coffee-300 mb-4" size={48} />
            <p className="text-coffee-500 text-sm sm:text-base">
              {searchTerm ? 'Menu tidak ditemukan' : 'Belum ada menu tersedia'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
