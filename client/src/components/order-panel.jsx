import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Utensils, ShoppingBag, Minus, Plus, X } from "lucide-react";
export default function OrderPanel({ currentOrder, orderType, tableNumber, subtotal, tax, total, onOrderTypeChange, onTableNumberChange, onUpdateQuantity, onRemoveItem, onClearOrder, onProcessPayment, }) {
    return (<div className="w-full bg-white shadow-xl border-l border-coffee-100 h-full flex flex-col max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-coffee-100">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-coffee-800">Pesanan Saat Ini</h2>
          <Button onClick={onClearOrder} variant="outline" size="sm" className="text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 px-2 py-1">
            <Trash2 size={14}/>
          </Button>
        </div>

        {/* Order Type */}
        <div className="flex space-x-1 sm:space-x-2 mb-3 sm:mb-4">
          <Button size="sm" variant={orderType === 'dine-in' ? "default" : "outline"} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${orderType === 'dine-in'
            ? 'bg-coffee-500 hover:bg-coffee-600 text-white'
            : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200 border-coffee-200'}`} onClick={() => onOrderTypeChange('dine-in')}>
            <Utensils size={14} className="mr-1"/>
            Dine In
          </Button>
          <Button size="sm" variant={orderType === 'takeaway' ? "default" : "outline"} className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${orderType === 'takeaway'
            ? 'bg-coffee-500 hover:bg-coffee-600 text-white'
            : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200 border-coffee-200'}`} onClick={() => onOrderTypeChange('takeaway')}>
            <ShoppingBag size={14} className="mr-1"/>
            Takeaway
          </Button>
        </div>

        {/* Table Number for Dine In */}
        {orderType === 'dine-in' && (<div className="mb-3 sm:mb-4">
            <Label htmlFor="tableNumber" className="text-coffee-700 text-xs sm:text-sm font-medium">
              Nomor Meja
            </Label>
            <Input id="tableNumber" type="number" value={tableNumber} onChange={(e) => onTableNumberChange(Number(e.target.value))} className="mt-1 border-coffee-200 focus:ring-coffee-400 text-sm" min="1" placeholder="No. meja"/>
          </div>)}
      </div>

      {/* Order Items */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-2 sm:space-y-3">
          {currentOrder.length === 0 ? (<p className="text-coffee-500 text-center py-6 text-sm">Belum ada pesanan</p>) : (currentOrder.map((item) => (<div key={item.id} className="flex justify-between items-center bg-coffee-50 p-2 sm:p-3 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-coffee-800 text-sm">{item.name}</h4>
                  <p className="text-coffee-600 text-xs">
                    Rp {item.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button size="sm" variant="outline" className="w-7 h-7 p-0 border-coffee-200 text-coffee-700 hover:bg-coffee-200" onClick={() => onUpdateQuantity(item.id, -1)}>
                    <Minus size={12}/>
                  </Button>
                  <span className="w-6 sm:w-8 text-center font-medium text-coffee-800 text-xs sm:text-sm">
                    {item.quantity}
                  </span>
                  <Button size="sm" variant="outline" className="w-7 h-7 p-0 border-coffee-200 text-coffee-700 hover:bg-coffee-200" onClick={() => onUpdateQuantity(item.id, 1)}>
                    <Plus size={12}/>
                  </Button>
                  <Button size="sm" variant="outline" className="w-7 h-7 p-0 ml-1 sm:ml-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300" onClick={() => onRemoveItem(item.id)}>
                    <X size={12}/>
                  </Button>
                </div>
              </div>)))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-coffee-100 p-4 sm:p-6">
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex justify-between text-coffee-700 text-sm">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-coffee-700 text-sm">
            <span>Pajak (10%):</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-bold text-coffee-800 border-t border-coffee-100 pt-2">
            <span>Total:</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <Button onClick={onProcessPayment} disabled={currentOrder.length === 0} className={`w-full py-2.5 sm:py-3 mb-2 text-sm sm:text-base ${currentOrder.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-coffee-500 hover:bg-coffee-600'} text-white`}>
          <ShoppingBag size={14} className="mr-1 sm:mr-2"/>
          Proses Pembayaran
        </Button>

        <Button variant="outline" className="w-full border-coffee-200 text-coffee-700 hover:bg-coffee-50 text-sm sm:text-base" disabled={currentOrder.length === 0}>
          <Utensils size={14} className="mr-1 sm:mr-2"/>
          Tahan Pesanan
        </Button>
      </div>
    </div>);
}
