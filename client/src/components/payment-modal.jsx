import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreditCard, X } from "lucide-react";
export default function PaymentModal({ orderData, onClose, onPaymentComplete }) {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [changeAmount, setChangeAmount] = useState(0);
    const { toast } = useToast();
    const calculateChange = (amount) => {
        const paid = parseFloat(amount) || 0;
        const change = paid - orderData.total;
        setChangeAmount(change);
        return change;
    };
    useEffect(() => {
        calculateChange(paymentAmount);
    }, [paymentAmount, orderData.total]);
    const createTransactionMutation = useMutation({
        mutationFn: async (transactionData) => {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        onSuccess: (transaction) => {
            const paidAmount = parseFloat(paymentAmount);
            const changeAmount = paidAmount - orderData.total;
            onPaymentComplete({
                paidAmount,
                changeAmount,
                transactionId: transaction.id,
            });
            toast({
                title: "Pembayaran Berhasil",
                description: `Transaksi ${transaction.transactionNumber} telah selesai`,
            });
        },
        onError: (error) => {
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
            console.error("Payment error:", error);
            toast({
                title: "Error",
                description: "Gagal memproses pembayaran",
                variant: "destructive",
            });
        },
    });
    const handlePayment = () => {
        const paidAmount = parseFloat(paymentAmount);
        if (!paidAmount || paidAmount < orderData.total) {
            toast({
                title: "Error",
                description: "Jumlah pembayaran kurang",
                variant: "destructive",
            });
            return;
        }
        const transactionData = {
            orderType: orderData.orderType,
            tableNumber: orderData.tableNumber,
            subtotal: orderData.subtotal.toString(),
            tax: orderData.tax.toString(),
            total: orderData.total.toString(),
            paidAmount: paidAmount.toString(),
            changeAmount: changeAmount.toString(),
            paymentStatus: 'completed',
            items: orderData.items.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price.toString(),
                totalPrice: (item.price * item.quantity).toString(),
            })),
        };
        createTransactionMutation.mutate(transactionData);
    };
    const setExactPayment = () => {
        setPaymentAmount(orderData.total.toString());
    };
    const setQuickPayment = (amount) => {
        setPaymentAmount(amount.toString());
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="text-white" size={24}/>
            </div>
            <h2 className="text-2xl font-bold text-coffee-800">Pembayaran</h2>
            <p className="text-coffee-600 mt-2">
              Total: <span className="font-bold text-coffee-800">
                Rp {orderData.total.toLocaleString('id-ID')}
              </span>
            </p>
          </div>
          <Button onClick={onClose} variant="outline" size="sm" className="w-8 h-8 p-0">
            <X size={16}/>
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="paymentAmount" className="text-coffee-700 text-sm font-medium">
              Jumlah Bayar
            </Label>
            <Input id="paymentAmount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1 text-lg border-coffee-200 focus:ring-coffee-400" placeholder="0" autoFocus/>
          </div>
          
          <div>
            <Label className="text-coffee-700 text-sm font-medium">
              Kembalian
            </Label>
            <Input type="text" value={changeAmount >= 0 ? `Rp ${changeAmount.toLocaleString('id-ID')}` : 'Kurang bayar'} className={`mt-1 ${changeAmount >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`} readOnly/>
          </div>
        </div>

        {/* Quick Payment Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button onClick={setExactPayment} variant="outline" className="border-coffee-200 text-coffee-700 hover:bg-coffee-50">
            Pas
          </Button>
          <Button onClick={() => setQuickPayment(50000)} variant="outline" className="border-coffee-200 text-coffee-700 hover:bg-coffee-50">
            50k
          </Button>
          <Button onClick={() => setQuickPayment(100000)} variant="outline" className="border-coffee-200 text-coffee-700 hover:bg-coffee-50">
            100k
          </Button>
          <Button onClick={() => setQuickPayment(200000)} variant="outline" className="border-coffee-200 text-coffee-700 hover:bg-coffee-50">
            200k
          </Button>
        </div>

        <div className="flex space-x-3">
          <Button onClick={onClose} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            Batal
          </Button>
          <Button onClick={handlePayment} disabled={changeAmount < 0 || createTransactionMutation.isPending} className={`flex-1 ${changeAmount >= 0 && !createTransactionMutation.isPending
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-400 cursor-not-allowed'} text-white`}>
            {createTransactionMutation.isPending ? 'Processing...' : 'Bayar & Cetak'}
          </Button>
        </div>
      </div>
    </div>);
}
