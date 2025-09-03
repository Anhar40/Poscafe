import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, ShoppingCart, BarChart3, Users, LogOut, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-coffee-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-coffee-400">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-coffee-500 rounded-xl flex items-center justify-center">
              <Coffee className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-coffee-800">CafePos</h1>
              <p className="text-coffee-600 text-sm">
                Selamat datang, {(user as any)?.firstName || (user as any)?.username || 'User'}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-coffee-800 mb-2">Dashboard Utama</h2>
          <p className="text-coffee-600">Pilih menu untuk memulai</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POS System */}
          <Link href="/pos">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-coffee-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-coffee-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ShoppingCart className="text-white" size={32} />
                </div>
                <CardTitle className="text-coffee-800">Sistem POS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-coffee-600 text-center">
                  Proses pesanan dan pembayaran pelanggan
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Dashboard Analytics - Only for admin */}
          {(user as any)?.role === 'admin' && (
            <Link href="/dashboard">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-coffee-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="text-white" size={32} />
                  </div>
                  <CardTitle className="text-coffee-800">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-coffee-600 text-center">
                    Laporan penjualan dan analisis bisnis
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Menu Management - Only for admin */}
          {(user as any)?.role === 'admin' && (
            <Link href="/menu-management">
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-coffee-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Settings className="text-white" size={32} />
                  </div>
                  <CardTitle className="text-coffee-800">Manajemen Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-coffee-600 text-center">
                    Kelola kategori dan menu cafe
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* User Management - Only for admin */}
          {(user as any)?.role === 'admin' && (
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-coffee-300 opacity-75">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-white" size={32} />
                </div>
                <CardTitle className="text-coffee-800">Manajemen User</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-coffee-600 text-center">
                  Kelola pengguna dan hak akses (Segera hadir)
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-coffee-800">Informasi Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-coffee-600 text-sm">Nama</p>
                  <p className="font-medium text-coffee-800">
                    {(user as any)?.firstName && (user as any)?.lastName 
                      ? `${(user as any).firstName} ${(user as any).lastName}` 
                      : (user as any)?.username || 'User'}
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 text-sm">Role</p>
                  <p className="font-medium text-coffee-800 capitalize">
                    {(user as any)?.role || 'kasir'}
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 text-sm">Email</p>
                  <p className="font-medium text-coffee-800">
                    {(user as any)?.email || 'Tidak tersedia'}
                  </p>
                </div>
                <div>
                  <p className="text-coffee-600 text-sm">Status</p>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
