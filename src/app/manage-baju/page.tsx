"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { PlusCircle, Trash2, Package, Tag, Boxes, Pencil, X } from "lucide-react";

// Struktur data produk
interface Product {
  id: number;
  name: string;
  price: number;
  stock: {
    S?: number; M?: number; L?: number;
    XL?: number; XXL?: number; XXXL?: number;
  };
}

// Komponen Modal untuk Edit Produk
const EditProductModal = ({ product, onSave, onClose }: { product: Product; onSave: (updatedProduct: Product) => void; onClose: () => void; }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [stockS, setStockS] = useState(String(product.stock.S || ''));
  const [stockM, setStockM] = useState(String(product.stock.M || ''));
  const [stockL, setStockL] = useState(String(product.stock.L || ''));
  const [stockXL, setStockXL] = useState(String(product.stock.XL || ''));
  const [stockXXL, setStockXXL] = useState(String(product.stock.XXL || ''));
  const [stockXXXL, setStockXXXL] = useState(String(product.stock.XXXL || ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct: Product = {
      ...product,
      name,
      price: Number(price),
      stock: {
        S: Number(stockS || 0), M: Number(stockM || 0), L: Number(stockL || 0),
        XL: Number(stockXL || 0), XXL: Number(stockXXL || 0), XXXL: Number(stockXXXL || 0),
      },
    };
    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-40 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
            <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Produk</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Nama Produk</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Harga</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Stok per Ukuran</label>
            <div className="mt-1 grid grid-cols-3 md:grid-cols-6 gap-4">
              <input type="number" placeholder="S" value={stockS} onChange={(e) => setStockS(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
              <input type="number" placeholder="M" value={stockM} onChange={(e) => setStockM(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
              <input type="number" placeholder="L" value={stockL} onChange={(e) => setStockL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
              <input type="number" placeholder="XL" value={stockXL} onChange={(e) => setStockXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
              <input type="number" placeholder="XXL" value={stockXXL} onChange={(e) => setStockXXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
              <input type="number" placeholder="XXXL" value={stockXXXL} onChange={(e) => setStockXXXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function ManageBajuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // State untuk form tambah
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stockS, setStockS] = useState("");
  const [stockM, setStockM] = useState("");
  const [stockL, setStockL] = useState("");
  const [stockXL, setStockXL] = useState("");
  const [stockXXL, setStockXXL] = useState("");
  const [stockXXXL, setStockXXXL] = useState("");

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      const storedProducts = JSON.parse(localStorage.getItem("products") || "[]");
      setProducts(storedProducts);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      setProducts([]);
    }
  }, []);

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("products", JSON.stringify(newProducts));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now(), name, price: Number(price),
      stock: {
        S: Number(stockS || 0), M: Number(stockM || 0), L: Number(stockL || 0),
        XL: Number(stockXL || 0), XXL: Number(stockXXL || 0), XXXL: Number(stockXXXL || 0),
      },
    };
    updateProducts([...products, newProduct]);
    setName(""); setPrice(""); setStockS(""); setStockM(""); setStockL("");
    setStockXL(""); setStockXXL(""); setStockXXXL("");
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      updateProducts(updatedProducts);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    updateProducts(updatedProducts);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <DashboardLayout>
      {/* Form Tambah Produk */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Produk Baru</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Package className="absolute top-3 left-3 text-slate-400" size={20} />
                <input type="text" placeholder="Nama Produk (cth: Kaos Polos)" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 p-3 pl-10 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="relative">
                <Tag className="absolute top-3 left-3 text-slate-400" size={20} />
                <input type="number" placeholder="Harga (cth: 75000)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-slate-300 p-3 pl-10 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 mb-2 block flex items-center gap-2"> <Boxes size={20}/> Stok per Ukuran (opsional)</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <input type="number" placeholder="S" value={stockS} onChange={(e) => setStockS(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="M" value={stockM} onChange={(e) => setStockM(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="L" value={stockL} onChange={(e) => setStockL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="XL" value={stockXL} onChange={(e) => setStockXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="XXL" value={stockXXL} onChange={(e) => setStockXXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="XXXL" value={stockXXXL} onChange={(e) => setStockXXXL(e.target.value)} className="w-full border text-center border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <PlusCircle size={20} /><span>Tambah Produk</span>
            </button>
        </form>
      </div>

      {/* Daftar Produk */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Daftar Produk</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b-2 border-slate-200">
                    <tr>
                        <th className="p-3 text-sm font-semibold text-slate-600">Nama Produk</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Harga</th>
                        <th className="p-3 text-sm font-semibold text-slate-600">Stok</th>
                        <th className="p-3 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? products.map((product) => (
                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="p-3 text-slate-800 font-semibold">{product.name}</td>
                            <td className="p-3 text-slate-700">Rp {product.price.toLocaleString("id-ID")}</td>
                            <td className="p-3 text-slate-700 text-sm">
                                {Object.entries(product.stock)
                                    .filter(([, count]) => count && count > 0)
                                    .map(([size, count]) => `${size}: ${count}`)
                                    .join(', ') || <span className="text-red-500 font-semibold">Habis</span>}
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => handleEditClick(product)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><Pencil size={18} /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors ml-2"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500">Belum ada produk.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isEditModalOpen && editingProduct && (
        <EditProductModal 
            product={editingProduct}
            onSave={handleUpdateProduct}
            onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
