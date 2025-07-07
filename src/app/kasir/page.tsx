"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import DashboardLayout from "@/components/DashboardLayout"; 
import { Plus, Trash2, Search } from "lucide-react";
import ReceiptModal from "@/components/kasir/ReceiptModal";
import { Transaction, CartItem } from "@/components/kasir/ReceiptToPrint";

// Definisikan tipe Product
interface Product {
  id: number;
  name: string;
  price: number;
  stock: { [key:string]: number | undefined };
}

// Data awal jika localStorage kosong
const initialProducts: Product[] = [
    { id: 1, name: 'Kaos Polos Hitam', price: 75000, stock: { 'S': 10, 'M': 15, 'L': 20, 'XL': 8 } },
    { id: 2, name: 'Kaos Polos Putih', price: 75000, stock: { 'S': 12, 'M': 18, 'L': 15, 'XL': 10 } },
    { id: 3, name: 'Kemeja Flanel Kotak', price: 150000, stock: { 'M': 7, 'L': 10, 'XL': 5 } },
    { id: 4, name: 'Celana Jeans Biru', price: 250000, stock: { '28': 5, '30': 8, '32': 6 } },
    { id: 5, name: 'Hoodie Abu-abu', price: 200000, stock: { 'L': 10, 'XL': 12 } }
];

export default function KasirPage() {
  // State untuk data utama
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // State untuk form & UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(-1);

  // State untuk mengontrol modal
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  
  // Ref untuk elemen UI
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Inisialisasi data dari localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
    } else {
        localStorage.setItem('products', JSON.stringify(initialProducts));
        setProducts(initialProducts);
    }
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    setRecentTransactions(storedTransactions.slice(-5).reverse());
  }, []);

  // Filter produk untuk pencarian
  useEffect(() => {
    if (searchTerm && !selectedProduct) {
      const results = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredProducts(results);
      setIsDropdownVisible(results.length > 0);
    } else {
      setIsDropdownVisible(false);
    }
    setActiveIndex(-1);
  }, [searchTerm, products, selectedProduct]);

  // Menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menghitung total keranjang
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotal(newTotal);
  }, [cart]);

  // Handler untuk memilih produk
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setIsDropdownVisible(false);
    setSelectedSize('');
    setQuantity(1);
  };

  // Handler untuk keyboard navigation
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectProduct(filteredProducts[activeIndex]);
    }
  };

  // Handler untuk menambah ke keranjang
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize || quantity <= 0) {
      alert("Harap pilih produk, ukuran, dan jumlah yang valid.");
      return;
    }

    const stockAvailable = selectedProduct.stock[selectedSize] || 0;
    const itemInCart = cart.find(item => item.id === selectedProduct.id && item.size === selectedSize);
    const qtyInCart = itemInCart?.qty || 0;

    if (quantity + qtyInCart > stockAvailable) {
      alert(`Stok tidak mencukupi! Tersedia: ${stockAvailable}.`);
      return;
    }

    if (itemInCart) {
        setCart(cart.map(item => item.id === selectedProduct.id && item.size === selectedSize ? { ...item, qty: item.qty + quantity } : item));
    } else {
        const newCartItem: CartItem = { ...selectedProduct, size: selectedSize, qty: quantity };
        setCart([...cart, newCartItem]);
    }
    
    setSearchTerm('');
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity(1);
  };
  
  // Handler untuk menghapus dari keranjang
  const handleRemoveFromCart = (productId: number, size: string) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
  };
  
  // Handler untuk memproses transaksi
  const handleProcessTransaction = () => {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    const updatedProducts = [...products];
    cart.forEach(cartItem => {
        const productIndex = updatedProducts.findIndex(p => p.id === cartItem.id);
        if (productIndex > -1) {
            const stock = updatedProducts[productIndex].stock;
            stock[cartItem.size] = (stock[cartItem.size] || 0) - cartItem.qty;
        }
    });
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    const transaction: Transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cart,
        total: total
    };
    
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransactions = [...storedTransactions, transaction];
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
    setRecentTransactions(newTransactions.slice(-5).reverse());
    
    // TUGASNYA SEKARANG HANYA MENAMPILKAN MODAL
    setReceiptData(transaction);
    setShowReceipt(true); 
    setCart([]);
  };

  const availableSizes = selectedProduct ? Object.keys(selectedProduct.stock).filter(size => (selectedProduct.stock[size] || 0) > 0) : [];

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Kolom Kiri: Input & Keranjang */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Input Barang</h2>
            <div className="grid md:grid-cols-3 gap-4 items-start">
              <div className="relative md:col-span-3" ref={searchContainerRef}>
                <Search className="absolute top-3.5 left-3 text-slate-400" size={20} />
                <input type="text" placeholder="Ketik untuk mencari produk..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedProduct(null); }} onKeyDown={handleSearchKeyDown} className="w-full border border-slate-300 p-3 pl-10 rounded-lg"/>
                {isDropdownVisible && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((p, index) => (
                      <div key={p.id} onClick={() => handleSelectProduct(p)} className={`p-3 cursor-pointer ${index === activeIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>{p.name}</div>
                    ))}
                  </div>
                )}
              </div>
              <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} disabled={!selectedProduct} className="w-full border border-slate-300 p-3 rounded-lg disabled:bg-slate-100">
                <option value="">-- Pilih Ukuran --</option>
                {availableSizes.map(size => <option key={size} value={size}>{size} (Stok: {selectedProduct?.stock[size]})</option>)}
              </select>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-full border border-slate-300 p-3 rounded-lg"/>
              <button onClick={handleAddToCart} className="md:col-span-1 w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-semibold shadow-md hover:bg-blue-700">
                <Plus size={20} /><span>Tambah</span>
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Keranjang</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.length > 0 ? cart.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-bold">{item.name} ({item.size})</p>
                    <p className="text-sm text-slate-600">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">Rp {(item.qty * item.price).toLocaleString('id-ID')}</p>
                    <button onClick={() => handleRemoveFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </div>
                </div>
              )) : <p className="text-slate-500 text-center py-4">Keranjang masih kosong.</p>}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Total & Transaksi Terbaru */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Total Belanja</h2>
              <div className="text-right mb-6">
                  <p className="text-slate-600">Subtotal</p>
                  <p className="text-4xl font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</p>
              </div>
              <button onClick={handleProcessTransaction} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-lg font-bold text-xl shadow-lg hover:bg-green-600">
                  <span>PROSES & BAYAR</span>
              </button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">5 Transaksi Terakhir</h2>
            <div className="space-y-4">
              {recentTransactions.map(trx => (
                  <div key={trx.id} className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-500">ID: {trx.id}</p>
                          <p className="font-bold text-green-600">Rp {trx.total.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(trx.date).toLocaleString('id-ID')}</p>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Panggil Komponen Modal di sini */}
      <ReceiptModal 
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        transactionData={receiptData}
      />
    </DashboardLayout>
  );
}