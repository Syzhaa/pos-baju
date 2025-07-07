import { forwardRef } from 'react';

// Definisikan tipe data di sini
export interface CartItem {
  id: number; name: string; size: string; qty: number; price: number;
}
export interface Transaction {
  id: number; date: string; items: CartItem[]; total: number;
}
interface ReceiptProps {
  transaction: Transaction | null;
}

const ReceiptToPrint = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  return (
    <div ref={ref}>
      {transaction && (
        <div className="p-4 bg-white text-black font-mono text-sm">
          <h2 className="text-center text-xl font-bold mb-2">BUKTI PEMBAYARAN</h2>
          <p className="text-center text-sm mb-4">Toko Anda</p>
          <div className="text-xs">
            <p>No: {transaction.id}</p>
            <p>Tanggal: {new Date(transaction.date).toLocaleString('id-ID')}</p>
          </div>
          <hr className="my-2 border-dashed border-black" />
          {transaction.items.map(item => (
            <div key={`${item.id}-${item.size}`} className="text-xs my-1">
              <p className="font-bold">{item.name} ({item.size})</p>
              <div className="flex justify-between">
                <span>{item.qty} x {item.price.toLocaleString('id-ID')}</span>
                <span>{(item.qty * item.price).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
          <hr className="my-2 border-dashed border-black" />
          <div className="flex justify-between font-bold text-base mt-2">
            <span>TOTAL</span>
            <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
          </div>
          <p className="text-center text-xs mt-6">-- Terima Kasih --</p>
        </div>
      )}
    </div>
  );
});

ReceiptToPrint.displayName = "ReceiptToPrint";
export default ReceiptToPrint;