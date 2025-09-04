import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
export default function ReceiptModal({ receiptData, onClose }) {
    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk - ${receiptData.transactionNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              margin: 0;
              padding: 20px;
              width: 300px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .divider {
              border-bottom: 1px dashed #000;
              margin: 10px 0;
            }
            .total {
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>CafePos</h2>
            <p>Jl. Kopi No. 123, Jakarta</p>
            <p>Telp: 021-12345678</p>
          </div>
          
          <div class="row">
            <span>Tanggal:</span>
            <span>${receiptData.timestamp.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span>Kasir:</span>
            <span>${receiptData.cashier}</span>
          </div>
          <div class="row">
            <span>No. Transaksi:</span>
            <span>${receiptData.transactionNumber}</span>
          </div>
          <div class="row">
            <span>Jenis:</span>
            <span>${receiptData.orderType === 'dine-in' ? 'Dine In' : 'Takeaway'}</span>
          </div>
          ${receiptData.tableNumber ? `
          <div class="row">
            <span>Meja:</span>
            <span>${receiptData.tableNumber}</span>
          </div>
          ` : ''}
          
          <div class="divider"></div>
          
          ${receiptData.items.map(item => `
          <div class="row">
            <span>${item.name} x${item.quantity}</span>
            <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
          </div>
          `).join('')}
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Subtotal:</span>
            <span>Rp ${receiptData.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span>Pajak (10%):</span>
            <span>Rp ${receiptData.tax.toLocaleString('id-ID')}</span>
          </div>
          <div class="row total">
            <span>Total:</span>
            <span>Rp ${receiptData.total.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span>Bayar:</span>
            <span>Rp ${receiptData.paidAmount.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span>Kembalian:</span>
            <span>Rp ${receiptData.changeAmount.toLocaleString('id-ID')}</span>
          </div>
          
          <div class="footer">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Selamat menikmati!</p>
          </div>
        </body>
      </html>
    `;
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
    };
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-coffee-800">Struk Pembayaran</h2>
          <Button onClick={onClose} variant="outline" size="sm" className="w-8 h-8 p-0">
            <X size={16}/>
          </Button>
        </div>

        <div className="border-b-2 border-dashed border-coffee-200 pb-4 mb-4 text-center">
          <h3 className="font-bold text-coffee-800">CafePos</h3>
          <p className="text-coffee-600 text-sm">Jl. Kopi No. 123, Jakarta</p>
          <p className="text-coffee-500 text-xs">Telp: 021-12345678</p>
        </div>
        
        <div className="text-left space-y-1 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-coffee-600">Tanggal:</span>
            <span className="text-coffee-800">
              {receiptData.timestamp.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-coffee-600">Kasir:</span>
            <span className="text-coffee-800">{receiptData.cashier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-coffee-600">No. Transaksi:</span>
            <span className="text-coffee-800">{receiptData.transactionNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-coffee-600">Jenis:</span>
            <span className="text-coffee-800">
              {receiptData.orderType === 'dine-in' ? 'Dine In' : 'Takeaway'}
            </span>
          </div>
          {receiptData.tableNumber && (<div className="flex justify-between">
              <span className="text-coffee-600">Meja:</span>
              <span className="text-coffee-800">{receiptData.tableNumber}</span>
            </div>)}
        </div>
        
        <div className="border-b-2 border-dashed border-coffee-200 my-4"></div>
        
        <div className="text-left space-y-1 text-sm mb-4">
          {receiptData.items.map((item, index) => (<div key={index} className="flex justify-between">
              <span className="text-coffee-800">
                {item.name} x{item.quantity}
              </span>
              <span className="text-coffee-800">
                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
              </span>
            </div>))}
        </div>
        
        <div className="border-b-2 border-dashed border-coffee-200 mb-4"></div>
        
        <div className="text-left space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>Rp {receiptData.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%):</span>
            <span>Rp {receiptData.tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-coffee-200 pt-2">
            <span>Total:</span>
            <span>Rp {receiptData.total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Bayar:</span>
            <span>Rp {receiptData.paidAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembalian:</span>
            <span>Rp {receiptData.changeAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div className="border-b-2 border-dashed border-coffee-200 my-4"></div>
        <p className="text-coffee-500 text-xs text-center mb-6">
          Terima kasih atas kunjungan Anda!<br />
          Selamat menikmati!
        </p>
        
        <div className="flex space-x-3">
          <Button onClick={handlePrint} className="flex-1 bg-coffee-500 hover:bg-coffee-600 text-white">
            <Printer size={16} className="mr-2"/>
            Cetak
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            Tutup
          </Button>
        </div>
      </div>
    </div>);
}
