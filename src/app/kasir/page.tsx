"use client";

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import DashboardLayout from '@/components/DashboardLayout'; // Kita tetap pakai layout

export default function KasirPage() {
  // 1. Buat sebuah ref untuk menunjuk ke elemen div
  const componentToPrintRef = useRef<HTMLDivElement>(null);

  // 2. Siapkan hook `useReactToPrint` untuk mencetak konten dari ref di atas
  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
  });

  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Halaman Tes Cetak</h1>
        <p className="mb-4">
          Ini adalah tes paling sederhana untuk `react-to-print`. Konten di bawah ini selalu terlihat dan tidak disembunyikan di dalam modal.
        </p>

        {/* 3. Tombol ini akan memicu fungsi handlePrint */}
        <button onClick={handlePrint} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700">
          Cetak Konten Tes di Bawah
        </button>

        <hr className="my-8" />

        {/* 4. Ini adalah konten yang akan dicetak. */}
        {/* `ref` dipasang langsung ke div ini. */}
        <div ref={componentToPrintRef} className="p-8 border-4 border-dashed border-gray-300">
          <h2 className="text-xl font-bold">Halo Dunia!</h2>
          <p>Jika teks ini berhasil muncul di dialog cetak (print preview), berarti `react-to-print` sudah berfungsi dengan benar.</p>
          <p className="mt-2 font-bold">Masalah kita selama ini ada pada logika menampilkan modal secara kondisional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}