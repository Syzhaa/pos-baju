import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import ReceiptToPrint, { Transaction } from './ReceiptToPrint';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: Transaction | null;
}

export default function ReceiptModal({ isOpen, onClose, transactionData }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  // ==================================================================
  // ✅ PERUBAHAN PALING PENTING ADA DI SINI
  // Jangan render apapun jika modal tidak terbuka ATAU jika data transaksi belum ada.
  // ==================================================================
  if (!isOpen || !transactionData) {
    return null;
  }

  // Karena ada pemeriksaan di atas, kita bisa yakin `transactionData` tidak null di bawah ini.
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-100 p-6 rounded-xl shadow-2xl w-full max-w-xs">
        <h3 className="text-lg font-bold text-center mb-4">Transaksi Berhasil!</h3>
        <div className="bg-white max-h-80 overflow-y-auto rounded-lg border">
          {/* `ref` dipasang ke komponen yang dijamin menerima data yang valid */}
          <ReceiptToPrint ref={receiptRef} transaction={transactionData} />
        </div>
        <div className="mt-4 text-center text-xs text-slate-600">
          <p>Pilih "Save as PDF" atau printer Anda.</p>
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={onClose} className="w-full bg-slate-300 font-semibold p-2 rounded-lg">Tutup</button>
          <button 
            onClick={handlePrint} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded-lg font-semibold"
          >
            <Printer size={18}/>Cetak
          </button>
        </div>
      </div>
    </div>
  );
}