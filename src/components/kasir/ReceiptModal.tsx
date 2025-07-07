import { useRef } from 'react';
import { Printer } from 'lucide-react';
import ReceiptToPrint, { Transaction } from './ReceiptToPrint';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: Transaction | null;
}

export default function ReceiptModal({ isOpen, onClose, transactionData }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const nodeToPrint = receiptRef.current;
    if (!nodeToPrint) {
      alert('Elemen struk tidak ditemukan.');
      return;
    }

    // 1. Buka jendela baru yang kosong
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir.');
      return;
    }

    // 2. Ambil semua tag <link> dan <style> dari halaman utama.
    // Ini cara yang lebih aman dan dijamin membawa semua style (termasuk Tailwind & Google Fonts).
    const styleTags = document.querySelectorAll('link[rel="stylesheet"], style');
    let stylesHtml = '';
    styleTags.forEach(tag => {
      stylesHtml += tag.outerHTML;
    });

    // 3. Ambil HTML dari komponen struk yang ingin dicetak.
    const printContent = nodeToPrint.innerHTML;

    // 4. Tulis struktur HTML lengkap ke jendela baru.
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Struk</title>
          ${stylesHtml}
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 3mm;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    // 5. Gunakan `onload` untuk memastikan semua style sudah dimuat sebelum mencetak.
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-100 p-6 rounded-xl shadow-2xl w-full max-w-xs">
        <h3 className="text-lg font-bold text-center mb-4">Transaksi Berhasil!</h3>
        <div className="bg-white max-h-80 overflow-y-auto rounded-lg border">
          <ReceiptToPrint ref={receiptRef} transaction={transactionData} />
        </div>
        <div className="mt-4 text-center text-xs text-slate-600">
          <p>Pilih "Save as PDF" atau printer Anda.</p>
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={onClose} className="w-full bg-slate-300 font-semibold p-2 rounded-lg">Tutup</button>
          <button 
            onClick={handlePrint} 
            disabled={!transactionData}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded-lg font-semibold disabled:bg-slate-400"
          >
            <Printer size={18}/>Cetak
          </button>
        </div>
      </div>
    </div>
  );
}