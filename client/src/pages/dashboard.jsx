import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { BarChart3, ArrowLeft, Receipt, Calculator, TrendingUp, Coffee, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
export default function Dashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
    // Redirect if not admin or not authenticated
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
        if (user.role !== 'admin') {
            toast({
                title: "Access Denied",
                description: "Hanya admin yang dapat mengakses dashboard",
                variant: "destructive",
            });
            return;
        }
    }, [user, toast]);
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.reload();
        }
        catch (error) {
            console.error('Logout error:', error);
            window.location.reload();
        }
    };
    // Fetch daily sales data
    const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery({
        queryKey: ['/api/dashboard/daily-sales', selectedDate],
        queryFn: async () => {
            const res = await fetch(`/api/dashboard/daily-sales?date=${selectedDate}`);
            if (!res.ok)
                throw new Error('Failed to fetch sales data');
            return res.json();
        },
        enabled: !!user && user.role === 'admin',
    });
    // Fetch recent transactions
    const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery({
        queryKey: ['/api/transactions'],
        queryFn: async () => {
            const res = await fetch('/api/transactions');
            if (!res.ok)
                throw new Error('Failed to fetch transactions');
            return res.json();
        },
        enabled: !!user && user.role === 'admin',
    });
    // Handle errors
    useEffect(() => {
        if (salesError && isUnauthorizedError(salesError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(() => {
                window.location.href = "/api/login";
            }, 500);
        }
    }, [salesError, toast]);
    useEffect(() => {
        if (transactionsError && isUnauthorizedError(transactionsError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(() => {
                window.location.href = "/api/login";
            }, 500);
        }
    }, [transactionsError, toast]);
    if (!user || user.role !== 'admin') {
        return (<div className="min-h-screen bg-coffee-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-coffee-800 mb-4">Access Denied</h1>
          <p className="text-coffee-600 mb-4">Hanya admin yang dapat mengakses halaman ini.</p>
          <Link href="/">
            <Button className="bg-coffee-500 hover:bg-coffee-600">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-coffee-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-coffee-400">
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coffee-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={20}/>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-coffee-800">Dashboard Admin</h1>
              <p className="text-coffee-600 text-xs sm:text-sm">Laporan Penjualan Harian</p>
            </div>
          </div>

          <div className="flex space-x-1 sm:space-x-2">
            <Link href="/">
              <Button variant="outline" className="border-coffee-200 text-coffee-700 hover:bg-coffee-50 text-xs sm:text-sm">
                <ArrowLeft size={14} className="mr-1"/>
                Kembali
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive" size="sm" className="text-xs sm:text-sm">
              <LogOut size={14} className="mr-1"/>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Total Penjualan</p>
                  <p className="text-2xl font-bold text-coffee-800">
                    {salesLoading ? (<span className="animate-pulse">Loading...</span>) : (`Rp ${(salesData?.totalSales || 0).toLocaleString('id-ID')}`)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24}/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Transaksi</p>
                  <p className="text-2xl font-bold text-coffee-800">
                    {salesLoading ? (<span className="animate-pulse">Loading...</span>) : (salesData?.totalTransactions || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="text-blue-600" size={24}/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Rata-rata</p>
                  <p className="text-2xl font-bold text-coffee-800">
                    {salesLoading ? (<span className="animate-pulse">Loading...</span>) : (`Rp ${Math.round(salesData?.averageTransaction || 0).toLocaleString('id-ID')}`)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calculator className="text-yellow-600" size={24}/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-coffee-600 text-sm font-medium">Item Terlaris</p>
                  <p className="text-xl font-bold text-coffee-800">
                    {salesLoading ? (<span className="animate-pulse">Loading...</span>) : (salesData?.topItem || "Tidak ada")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center">
                  <Coffee className="text-coffee-600" size={24}/>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-coffee-800">Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (<div className="text-center py-4">
                <span className="text-coffee-600">Loading transaksi...</span>
              </div>) : (<div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-coffee-700">No. Transaksi</TableHead>
                      <TableHead className="text-coffee-700">Waktu</TableHead>
                      <TableHead className="text-coffee-700">Items</TableHead>
                      <TableHead className="text-coffee-700">Total</TableHead>
                      <TableHead className="text-coffee-700">Kasir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions && transactions.length > 0 ? (transactions.slice(0, 10).map((transaction) => (<TableRow key={transaction.id}>
                          <TableCell className="font-medium text-coffee-800">
                            {transaction.transactionNumber}
                          </TableCell>
                          <TableCell className="text-coffee-600">
                            {new Date(transaction.createdAt).toLocaleString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                })}
                          </TableCell>
                          <TableCell className="text-coffee-600">
                            {transaction.items.map((item, idx) => (<span key={item.id}>
                                {item.menuItem.name} x{item.quantity}
                                {idx < transaction.items.length - 1 && ', '}
                              </span>))}
                          </TableCell>
                          <TableCell className="font-semibold text-coffee-800">
                            Rp {parseFloat(transaction.total).toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-coffee-600">
                            {transaction.cashier.firstName || transaction.cashier.username}
                          </TableCell>
                        </TableRow>))) : (<TableRow>
                        <TableCell colSpan={5} className="text-center text-coffee-500 py-8">
                          Belum ada transaksi hari ini
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>);
}
