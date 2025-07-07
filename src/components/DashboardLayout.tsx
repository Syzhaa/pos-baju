"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  ClipboardList,
  Settings,
  UserCircle
} from "lucide-react";

// Komponen Modal untuk Ubah Profil/Password
const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
        const storedUser = JSON.parse(localStorage.getItem('userCredentials') || '{}');
        setNewUsername(storedUser.username || 'admin');
        // Reset fields on open
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const storedUser = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    const validPassword = storedUser.password || 'admin123';

    if (currentPassword !== validPassword) {
        setError('Password saat ini salah.');
        return;
    }

    if (newPassword && newPassword !== confirmPassword) {
        setError('Konfirmasi password baru tidak cocok.');
        return;
    }
    
    const newCredentials = {
        username: newUsername,
        password: newPassword || validPassword // Keep old password if new one is empty
    };

    localStorage.setItem('userCredentials', JSON.stringify(newCredentials));
    setSuccess('Profil berhasil diperbarui!');
    setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to update username in navbar
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Ubah Profil</h2>
        <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
            {success && <p className="text-green-600 text-sm bg-green-100 p-2 rounded-md">{success}</p>}
            
            <div>
              <label className="text-sm font-medium text-slate-800">Username</label>
              <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Password Saat Ini (Wajib diisi)</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
             <div>
              <label className="text-sm font-medium text-slate-800">Password Baru (Opsional)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
             <div>
              <label className="text-sm font-medium text-slate-800">Konfirmasi Password Baru</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full border border-slate-300 p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-6 py-2 rounded-lg hover:bg-slate-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    setIsClient(true);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    setUsername(storedUser.username || 'Admin');
  }, [router]);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("isLoggedIn");
      router.push("/login");
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
            <p className="text-slate-500 mt-4">Memuat Aplikasi...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manage-baju", label: "Manage Baju", icon: Package },
    { href: "/kasir", label: "Kasir", icon: ShoppingCart },
    { href: "/laporan", label: "Laporan", icon: ClipboardList },
    { href: "/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-800 text-slate-100">
        <div className="p-6 text-center border-b border-slate-700">
            <h1 className="text-2xl font-bold">POS Kasir</h1>
            <p className="text-sm text-slate-400">Toko Baju</p>
        </div>
        <nav className="flex-grow p-4">
            {navItems.map((item) => (
            <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 my-1 rounded-lg transition-all duration-200 ${
                pathname === item.href
                    ? "bg-blue-600 text-white font-semibold shadow-md"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
            >
                <item.icon size={20} />
                <span>{item.label}</span>
            </Link>
            ))}
        </nav>
    </div>
  );

  return (
    <>
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <div className="flex h-screen bg-slate-100">
        <aside className="w-64 bg-slate-800 text-white hidden lg:flex lg:flex-col shadow-lg flex-shrink-0">
          <SidebarContent />
        </aside>

        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-800 text-white z-30 transform transition-transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center flex-shrink-0 z-10">
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-700 lg:hidden">
                  <Menu size={24} />
              </button>
              <div className="lg:hidden text-xl font-bold text-slate-800">
                {navItems.find(item => item.href === pathname)?.label || 'POS Kasir'}
              </div>
              <div className="hidden lg:block"></div>
              <div className="flex items-center gap-4">
                  <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                      <UserCircle size={24} />
                      <span className="font-semibold hidden sm:inline">{username}</span>
                  </button>
                  <button onClick={handleLogout} title="Logout" className="text-slate-600 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-100">
                      <LogOut size={20} />
                  </button>
              </div>
          </header>
          
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
          </main>
        </div>
      </div>
    </>
  );
}

