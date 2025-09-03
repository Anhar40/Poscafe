import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, BarChart3, LogOut } from "lucide-react";
import { Link } from "wouter";
import MenuGrid from "@/components/menu-grid";
import OrderPanel from "@/components/order-panel";
import PaymentModal from "@/components/payment-modal";
import ReceiptModal from "@/components/receipt-modal";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MenuItem } from "@shared/schema";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  items: OrderItem[];
  orderType: 'dine-in' | 'takeaway';
  tableNumber?: number;
  subtotal: number;
  tax: number;
  total: number;
}

export default function POS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if unauthorized
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

  const addToOrder = (menuItem: MenuItem) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: menuItem.id,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          quantity: 1
        }];
      }
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCurrentOrder(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromOrder = (id: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== id));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setTableNumber(1);
  };

  const calculateTotals = () => {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const getOrderData = (): OrderData => {
    const { subtotal, tax, total } = calculateTotals();
    return {
      items: currentOrder,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      subtotal,
      tax,
      total
    };
  };

  const processPayment = () => {
    if (currentOrder.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (paymentData: any) => {
    setReceiptData({
      ...getOrderData(),
      ...paymentData,
      transactionNumber: `TRX-${Date.now()}`,
      cashier: (user as any)?.firstName || (user as any)?.username || 'User',
      timestamp: new Date(),
    });
    setShowPaymentModal(false);
    setShowReceiptModal(true);
    clearOrder();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-coffee-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-coffee-400">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coffee-500 rounded-xl flex items-center justify-center">
              <Coffee className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-coffee-800">CafePos</h1>
              <p className="text-coffee-600 text-xs sm:text-sm">
                Kasir: {(user as any)?.firstName || (user as any)?.username}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 text-right">
            <div className="text-xs sm:text-sm">
              <p className="text-coffee-700 font-medium">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-coffee-600">
                {currentTime.toLocaleTimeString('id-ID')}
              </p>
            </div>
            <div className="flex space-x-1 sm:space-x-2">
              <Link href="/">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-coffee-200 text-coffee-700 hover:bg-coffee-50 text-xs sm:text-sm"
                >
                  <ArrowLeft size={14} className="mr-1" />
                  Kembali
                </Button>
              </Link>
              {(user as any)?.role === 'admin' && (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-coffee-200 text-coffee-700 hover:bg-coffee-50 text-xs sm:text-sm"
                  >
                    <BarChart3 size={14} className="mr-1" />
                    Dashboard
                  </Button>
                </Link>
              )}
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
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-72px)]">
        {/* Menu Section */}
        <div className="flex-1 w-full">
          <MenuGrid onAddToOrder={addToOrder} />
        </div>

        {/* Order Panel */}
        <div className="w-full lg:w-96">
          <OrderPanel
            currentOrder={currentOrder}
            orderType={orderType}
            tableNumber={tableNumber}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onOrderTypeChange={setOrderType}
            onTableNumberChange={setTableNumber}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromOrder}
            onClearOrder={clearOrder}
            onProcessPayment={processPayment}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          orderData={getOrderData()}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <ReceiptModal
          receiptData={receiptData}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
