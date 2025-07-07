"use client";

import { useRef } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Download, Upload } from "lucide-react";

export default function PengaturanPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        try {
            const products = localStorage.getItem('products') || '[]';
            const transactions = localStorage.getItem('transactions') || '[]';

            const backupData = {
                products: JSON.parse(products),
                transactions: JSON.parse(transactions)
            };

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-pos-kasir-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Backup data berhasil diunduh!');

        } catch (error) {
            console.error("Gagal membuat backup:", error);
            alert('Gagal membuat backup data.');
        }
    };

    const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm('Apakah Anda yakin ingin mengimpor data ini? Semua data saat ini akan ditimpa.')) {
            // Reset file input jika pengguna membatalkan
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File tidak dapat dibaca.");
                }
                const data = JSON.parse(text);

                // Validasi sederhana
                if (data && Array.isArray(data.products) && Array.isArray(data.transactions)) {
                    localStorage.setItem('products', JSON.stringify(data.products));
                    localStorage.setItem('transactions', JSON.stringify(data.transactions));
                    alert('Data berhasil diimpor! Halaman akan dimuat ulang untuk menerapkan perubahan.');
                    window.location.reload();
                } else {
                    throw new Error('Format file backup tidak valid.');
                }
            } catch (error: any) {
                console.error("Gagal mengimpor data:", error);
                alert(`Gagal mengimpor data: ${error.message}`);
            } finally {
                // Reset file input setelah selesai
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Pengaturan</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Kartu Backup */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Backup Data</h2>
                    <p className="text-slate-600 mb-4">
                        Simpan semua data produk dan transaksi Anda ke dalam sebuah file JSON.
                        Simpan file ini di tempat yang aman.
                    </p>
                    <button 
                        onClick={handleBackup}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-semibold shadow-md hover:bg-blue-700"
                    >
                        <Download size={20} />
                        <span>Unduh Data Backup</span>
                    </button>
                </div>

                {/* Kartu Import */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Import Data</h2>
                    <p className="text-slate-600 mb-4">
                        Pulihkan data dari file backup. 
                        <span className="font-bold text-red-600"> PERHATIAN:</span> Proses ini akan menimpa semua data yang ada saat ini.
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImportChange}
                        className="hidden"
                        accept="application/json"
                    />
                    <button 
                        onClick={handleImportClick}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-lg font-semibold shadow-md hover:bg-red-700"
                    >
                        <Upload size={20} />
                        <span>Pilih File & Impor Data</span>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
