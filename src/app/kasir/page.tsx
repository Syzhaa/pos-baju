"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Trash2, DollarSign, Printer, Search, X } from "lucide-react";
import { useReactToPrint } from 'react-to-print';

interface Product {
  id: number; name: string; price: number;
  stock: { [key: string]: number | undefined };
}
interface CartItem extends Product {
  size: string;
  qty: number;
}
interface Transaction {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
}

const ReceiptToPrint = forwardRef<HTMLDivElement, { transaction: Transaction | null }>(({ transaction }, ref) => {
    if (!transaction) return null;
    return (
        <div ref={ref} className="p-4 bg-white text-black font-mono">
            <h2 className="text-center text-xl font-bold mb-2">BUKTI PEMBAYARAN</h2>
            <p className="text-center text-sm mb-4">POS Kasir Baju</p>
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
            <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-center text-xs mt-4">-- Terima Kasih --</p>
        </div>
    );
});
ReceiptToPrint.displayName = "ReceiptToPrint";


export default function KasirPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setProducts(storedProducts);
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    setRecentTransactions(storedTransactions.slice(-3).reverse());
  }, []);

  useEffect(() => {
    if (searchTerm && !selectedProduct) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const results = products.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
      setFilteredProducts(results);
      setIsDropdownVisible(results.length > 0);
    } else {
      setIsDropdownVisible(false);
    }
    setActiveIndex(-1);
  }, [searchTerm, products, selectedProduct]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    setTotal(newTotal);
  }, [cart]);
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setIsDropdownVisible(false);
    setSelectedSize('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDropdownVisible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prevIndex => (prevIndex + 1) % filteredProducts.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prevIndex => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && filteredProducts[activeIndex]) {
          handleSelectProduct(filteredProducts[activeIndex]);
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize || quantity <= 0) {
      alert("Harap pilih produk, ukuran, dan jumlah yang valid.");
      return;
    }
    const stockAvailable = selectedProduct.stock[selectedSize] || 0;
    if (quantity > stockAvailable) {
      alert(`Stok tidak mencukupi! Tersedia: ${stockAvailable}`);
      return;
    }
    const existingCartItemIndex = cart.findIndex(item => item.id === selectedProduct.id && item.size === selectedSize);
    if (existingCartItemIndex > -1) {
        const updatedCart = [...cart];
        const currentQty = updatedCart[existingCartItemIndex].qty;
        if (currentQty + quantity > stockAvailable) {
            alert(`Stok tidak mencukupi! Sisa stok: ${stockAvailable - currentQty}`);
            return;
        }
        updatedCart[existingCartItemIndex].qty += quantity;
        setCart(updatedCart);
    } else {
        const newCartItem: CartItem = { ...selectedProduct, size: selectedSize, qty: quantity };
        setCart([...cart, newCartItem]);
    }
    setSearchTerm('');
    setSelectedProduct(null);
    setSelectedSize('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId: number, size: string) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
  };
  
  const handleProcessTransaction = () => {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    let updatedProducts = JSON.parse(JSON.stringify(products));
    cart.forEach(cartItem => {
        const productIndex = updatedProducts.findIndex((p: Product) => p.id === cartItem.id);
        if (productIndex > -1) {
            updatedProducts[productIndex].stock[cartItem.size] -= cartItem.qty;
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
    
    setReceiptData(transaction);
    setShowReceipt(true);
    setRecentTransactions(newTransactions.slice(-3).reverse());
    setCart([]);
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const availableSizes = selectedProduct ? Object.keys(selectedProduct.stock).filter(size => (selectedProduct.stock[size] || 0) > 0) : [];

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Input Barang</h2>
            <div className="grid md:grid-cols-3 gap-4 items-start">
              <div className="relative md:col-span-3" ref={searchContainerRef}>
                <Search className="absolute top-3.5 left-3 text-slate-400" size={20} />
                <input type="text" placeholder="Ketik untuk mencari produk..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedProduct(null); }} onKeyDown={handleSearchKeyDown} className="w-full border border-slate-300 p-3 pl-10 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                {isDropdownVisible && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((p, index) => (
                      <div key={p.id} onClick={() => handleSelectProduct(p)} className={`p-3 cursor-pointer ${index === activeIndex ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>{p.name}</div>
                    ))}
                  </div>
                )}
              </div>
              <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} disabled={!selectedProduct} className="w-full border border-slate-300 p-3 rounded-lg disabled:bg-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="">-- Pilih Ukuran --</option>
                {availableSizes.map(size => <option key={size} value={size}>{size} (Stok: {selectedProduct?.stock[size]})</option>)}
              </select>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <button onClick={handleAddToCart} className="md:col-span-1 w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                <Plus size={20} /><span>Tambah</span>
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Keranjang</h2>
            <div className="space-y-3">
              {cart.length > 0 ? cart.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <p className="font-bold text-slate-800">{item.name} ({item.size})</p>
                    <p className="text-sm text-slate-600">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-slate-900">Rp {(item.qty * item.price).toLocaleString('id-ID')}</p>
                    <button onClick={() => handleRemoveFromCart(item.id, item.size)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              )) : <p className="text-slate-500 text-center py-4">Keranjang masih kosong.</p>}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Total Belanja</h2>
                <div className="space-y-4">
                    <div className="text-right mb-4">
                        <p className="text-slate-600">Subtotal</p>
                        <p className="text-4xl font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={handleProcessTransaction} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white p-4 rounded-lg font-bold text-xl shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all">
                        <DollarSign size={24} /><span>PROSES & BAYAR</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Transaksi Terbaru</h2>
        <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map(trx => (
                <div key={trx.id} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">ID: {trx.id}</p>
                        <p className="font-bold text-green-600">Rp {trx.total.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(trx.date).toLocaleString('id-ID')}</p>
                </div>
            )) : <p className="text-slate-500">Belum ada transaksi.</p>}
        </div>
      </div>
      
      {showReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-slate-100 p-6 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="bg-white max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-bold text-center mb-2 p-4 text-slate-900">Transaksi Berhasil!</h3>
                    <ReceiptToPrint ref={receiptRef} transaction={receiptData} />
                </div>
                <div className="mt-4 text-center text-xs text-slate-600">
                    <p>Pilih "Save as PDF" atau printer Anda (Bluetooth/Kabel) pada dialog cetak.</p>
                </div>
                <div className="flex gap-4 mt-2">
                    <button onClick={() => setShowReceipt(false)} className="w-full bg-slate-300 text-slate-800 p-2 rounded-lg hover:bg-slate-400 transition-colors">Tutup</button>
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><Printer size={18}/>Cetak</button>
                </div>
            </div>
        </div>
      )}
    </DashboardLayout>
  );
}
