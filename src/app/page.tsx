"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, DollarSign, Package, Shirt, ShoppingBag, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: number;
  date: string;
  total: number;
  items: {
    name: string;
    qty: number;
  }[];
}

interface Product {
  id: number;
}

const COLORS = ['#4338ca', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { name: 'Penjualan Hari Ini', value: 'Memuat...', icon: DollarSign, color: 'bg-green-500' },
        { name: 'Total Produk', value: 'Memuat...', icon: Package, color: 'bg-blue-500' },
        { name: 'Baju Terjual Hari Ini', value: 'Memuat...', icon: Shirt, color: 'bg-indigo-500' },
        { name: 'Produk Terlaris', value: 'Memuat...', icon: ShoppingBag, color: 'bg-yellow-500' },
    ]);
    const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);
    const [salesChartData, setSalesChartData] = useState<any[]>([]);
    const [topProductsData, setTopProductsData] = useState<any[]>([]);

    useEffect(() => {
        const storedProducts: Product[] = JSON.parse(localStorage.getItem("products") || "[]");
        const storedTransactions: Transaction[] = JSON.parse(localStorage.getItem("transactions") || "[]");

        // --- Kalkulasi Statistik ---
        const today = new Date().toDateString();
        const todayTransactions = storedTransactions.filter(t => new Date(t.date).toDateString() === today);
        
        const salesToday = todayTransactions.reduce((acc, curr) => acc + curr.total, 0);
        const totalProducts = storedProducts.length;
        const itemsSoldToday = todayTransactions.reduce((acc, curr) => acc + curr.items.reduce((iAcc, i) => iAcc + i.qty, 0), 0);
        
        const productSales: { [key: string]: number } = {};
        storedTransactions.forEach(trx => {
            trx.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.qty;
            });
        });
        const bestSelling = Object.keys(productSales).length > 0 ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b) : 'N/A';

        setStats([
            { name: 'Penjualan Hari Ini', value: `Rp ${salesToday.toLocaleString('id-ID')}`, icon: DollarSign, color: 'bg-green-500' },
            { name: 'Total Jenis Produk', value: `${totalProducts} Jenis`, icon: Package, color: 'bg-blue-500' },
            { name: 'Baju Terjual Hari Ini', value: `${itemsSoldToday} Pcs`, icon: Shirt, color: 'bg-indigo-500' },
            { name: 'Produk Terlaris', value: bestSelling, icon: ShoppingBag, color: 'bg-yellow-500' },
        ]);

        // --- Data untuk Chart Penjualan 7 Hari Terakhir ---
        const salesByDay: { [key: string]: number } = {};
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('id-ID', { weekday: 'short' });
            salesByDay[key] = 0;
        }
        storedTransactions.forEach(trx => {
            const trxDate = new Date(trx.date);
            const key = trxDate.toLocaleDateString('id-ID', { weekday: 'short' });
            if (key in salesByDay) {
                salesByDay[key] = (salesByDay[key] || 0) + trx.total;
            }
        });
        setSalesChartData(Object.keys(salesByDay).map(date => ({ name: date, Penjualan: salesByDay[date] })));

        // --- Data untuk Pie Chart Produk Terlaris ---
        const topProducts = Object.entries(productSales)
            .sort(([,a],[,b]) => b-a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
        setTopProductsData(topProducts);

        // --- Aktivitas Terbaru ---
        setRecentActivity(storedTransactions.slice(-5).reverse());
    }, []);

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard Toko Baju</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform hover:scale-105">
                        <div className={`p-3 rounded-full text-white ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{stat.name}</p>
                            <p className="text-xl font-bold text-slate-800 truncate">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart size={22}/> Tren Penjualan 7 Hari Terakhir</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `Rp${Number(value) / 1000}k`} />
                                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                                <Line type="monotone" dataKey="Penjualan" stroke="#4338ca" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChartIcon size={22}/> Top 5 Produk Terlaris</h2>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={topProductsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {topProductsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} Pcs`, name]} />
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={22}/> Aktivitas Penjualan Terakhir</h2>
                {recentActivity.length > 0 ? (
                    <ul className="space-y-3">
                        {recentActivity.map((trx) => (
                            <li key={trx.id} className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-2">
                                <div>
                                    <p className="text-sm text-slate-800">Transaksi <span className="font-mono bg-slate-100 px-2 py-1 rounded">#{trx.id}</span></p>
                                    <p className="text-xs text-slate-500">{new Date(trx.date).toLocaleString('id-ID')}</p>
                                </div>
                                <span className="font-semibold text-green-600">Rp {trx.total.toLocaleString('id-ID')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-600">Belum ada aktivitas penjualan.</p>
                )}
            </div>
        </DashboardLayout>
    );
}
