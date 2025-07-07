"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FileDown, BarChart, ShoppingBag, ShoppingCart, Landmark } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CartItem {
  id: number; name: string; price: number;
  size: string; qty: number;
}
interface Transaction {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
}

export default function LaporanPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    
    const [filterType, setFilterType] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [stats, setStats] = useState({ totalSales: 0, totalTransactions: 0, bestSelling: 'N/A' });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const storedTransactions: Transaction[] = JSON.parse(localStorage.getItem('transactions') || '[]');
        setAllTransactions(storedTransactions);
        setFilteredTransactions(storedTransactions.slice().reverse());
    }, []);
    
    useEffect(() => {
        if (filteredTransactions.length > 0) {
            const totalSales = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);

            const productSales: { [key: string]: number } = {};
            filteredTransactions.forEach(trx => {
                trx.items.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + item.qty;
                });
            });
            const bestSelling = Object.keys(productSales).length > 0
                ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
                : 'N/A';

            setStats({
                totalSales: totalSales,
                totalTransactions: filteredTransactions.length,
                bestSelling: bestSelling
            });

            const salesByDay: { [key: string]: number } = {};
            filteredTransactions.forEach(trx => {
                const date = new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                salesByDay[date] = (salesByDay[date] || 0) + trx.total;
            });
            const formattedChartData = Object.keys(salesByDay).map(date => ({
                name: date,
                Penjualan: salesByDay[date]
            })).slice(-30);
            setChartData(formattedChartData);
        } else {
             setStats({ totalSales: 0, totalTransactions: 0, bestSelling: 'N/A' });
             setChartData([]);
        }
    }, [filteredTransactions]);

    const applyFilter = () => {
        let newFilteredData = [...allTransactions];

        if (filterType === 'monthly') {
            const [year, month] = selectedMonth.split('-').map(Number);
            newFilteredData = allTransactions.filter(trx => {
                const trxDate = new Date(trx.date);
                return trxDate.getFullYear() === year && trxDate.getMonth() + 1 === month;
            });
        } else if (filterType === 'yearly') {
            newFilteredData = allTransactions.filter(trx => new Date(trx.date).getFullYear() === selectedYear);
        } else if (filterType === 'range') {
            if (!dateRange.start || !dateRange.end) {
                alert("Silakan isi kedua tanggal untuk rentang.");
                return;
            }
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            newFilteredData = allTransactions.filter(trx => {
                const trxDate = new Date(trx.date);
                return trxDate >= startDate && trxDate <= endDate;
            });
        }

        setFilteredTransactions(newFilteredData.slice().reverse());
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert("Tidak ada data transaksi untuk diekspor.");
            return;
        }

        let csvContent = "ID Transaksi,Tanggal,Nama Produk,Ukuran,Jumlah,Harga Satuan,Subtotal\n";
        filteredTransactions.forEach(trx => {
            trx.items.forEach(item => {
                const row = [
                    trx.id,
                    new Date(trx.date).toLocaleString('id-ID'),
                    `"${item.name}"`,
                    item.size,
                    item.qty,
                    item.price,
                    item.qty * item.price
                ].join(',');
                csvContent += row + "\n";
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const renderFilterControls = () => {
        switch (filterType) {
            case 'monthly':
                return (
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-slate-300 p-2 rounded-lg text-slate-800"
                    />
                );
            case 'yearly':
                 return (
                    <input 
                        type="number" 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="border border-slate-300 p-2 rounded-lg text-slate-800"
                        placeholder="Tahun"
                    />
                );
            case 'range':
                return (
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="border border-slate-300 p-2 rounded-lg text-slate-800"
                        />
                        <span>-</span>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="border border-slate-300 p-2 rounded-lg text-slate-800"
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Laporan Penjualan</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700"
                >
                    <FileDown size={18} />
                    <span>Export ke CSV</span>
                </button>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-lg mb-8 flex flex-wrap items-center gap-4">
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-300 p-2 rounded-lg font-semibold text-slate-800"
                >
                    <option value="all">Semua Waktu</option>
                    <option value="monthly">Per Bulan</option>
                    <option value="yearly">Per Tahun</option>
                    <option value="range">Rentang Tanggal</option>
                </select>
                {renderFilterControls()}
                <button 
                    onClick={applyFilter}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700"
                >
                    Terapkan Filter
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><Landmark /></div>
                    <div>
                        <p className="text-sm text-slate-500">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-slate-800">Rp {stats.totalSales.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart /></div>
                    <div>
                        <p className="text-sm text-slate-500">Total Transaksi</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.totalTransactions}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><ShoppingBag /></div>
                    <div>
                        <p className="text-sm text-slate-500">Produk Terlaris</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.bestSelling}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Grafik Penjualan</h2>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RechartsBarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `Rp${Number(value) / 1000}k`} />
                                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                                <Legend />
                                <Bar dataKey="Penjualan" fill="#4338ca" />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-10">Data tidak cukup untuk menampilkan grafik.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Riwayat Transaksi</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-slate-200">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-600">ID Transaksi</th>
                                <th className="p-3 text-sm font-semibold text-slate-600">Tanggal</th>
                                <th className="p-3 text-sm font-semibold text-slate-600">Detail Item</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map(trx => (
                                <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 text-sm text-slate-700 font-mono">{trx.id}</td>
                                    <td className="p-3 text-sm text-slate-700">{new Date(trx.date).toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-sm text-slate-700">
                                        {trx.items.map(item => (
                                            <div key={`${item.id}-${item.size}`}>{item.qty}x {item.name} ({item.size})</div>
                                        ))}
                                    </td>
                                    <td className="p-3 text-sm text-slate-900 font-bold text-right">Rp {trx.total.toLocaleString('id-ID')}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-slate-500">Tidak ada data transaksi untuk filter ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
