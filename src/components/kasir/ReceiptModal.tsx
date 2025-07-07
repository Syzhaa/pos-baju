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
    const node = receiptRef.current;
    if (!node) {
      alert('Komponen struk tidak ditemukan.');
      return;
    }

    // 1. Ambil semua link stylesheet dari halaman utama.
    // Ini penting agar style Tailwind CSS ikut tercetak.
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          // Salin semua aturan CSS ke dalam tag <style>
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          // Beberapa stylesheet eksternal mungkin tidak bisa diakses, abaikan saja.
          console.log('Tidak bisa mengakses stylesheet:', styleSheet.href);
          return '';
        }
      })
      .join('\n');

    // 2. Ambil HTML dari komponen struk.
    const printContent = node.innerHTML;

    // 3. Buka jendela browser baru yang kosong.
    // Ini jauh lebih stabil di mobile daripada membuat iframe.
    const printWindow = window.open('', '', 'height=600,width=800');

    if (printWindow) {
      // 4. Tulis semua konten (HTML + CSS) ke jendela baru.
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Struk</title>
            <style>
              /* Aturan CSS khusus untuk cetak */
              @page {
                /* Ukuran kertas printer thermal 80mm. Ganti ke 58mm jika perlu. */
                size: 80mm auto; 
                margin: 0;
              }
              body {
                padding: 3mm;
                font-family: monospace;
                -webkit-print-color-adjust: exact; /* Memastikan warna tercetak di Chrome */
                print-color-adjust: exact; /* Standar */
              }
              /* Salin semua style dari halaman utama */
              ${styles}
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus(); // Fokus ke jendela baru

      // 5. Panggil fungsi print dan tutup jendela setelah selesai.
      // setTimeout memastikan konten sudah 100% dimuat sebelum dialog cetak muncul.
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250); // Jeda 250ms sudah sangat aman.
    } else {
      alert('Gagal membuka jendela cetak. Pastikan pop-up tidak diblokir oleh browser Anda.');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-100 p-6 rounded-xl shadow-2xl w-full max-w-xs">
        <h3 className="text-lg font-bold text-center mb-4">Transaksi Berhasil!</h3>
        {/* Pratinjau di layar tidak berubah */}
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