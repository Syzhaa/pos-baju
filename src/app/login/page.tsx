"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shirt, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        router.push("/");
      }
    }
  }, [isClient, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Ambil kredensial yang tersimpan dari localStorage
    const storedUser = JSON.parse(localStorage.getItem('userCredentials') || '{}');
    const validUsername = storedUser.username || 'admin';
    const validPassword = storedUser.password || 'admin123';

    // Bandingkan input dengan data yang tersimpan
    if (username === validUsername && password === validPassword) {
      localStorage.setItem("isLoggedIn", "true");
      router.push("/");
    } else {
      setError("Username atau Password salah!");
    }
  };

  if (!isClient) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-slate-800 text-white w-20 h-20 rounded-full mb-4 shadow-lg">
            <Shirt size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">POS Kasir Baju</h1>
          <p className="text-slate-600 mt-2">
            Silakan login untuk melanjutkan
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-xl space-y-6"
        >
          {/* Input Username */}
          <div className="relative">
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="peer w-full border border-slate-300 p-3 rounded-lg text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <label
              htmlFor="username"
              className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Username
            </label>
          </div>

          {/* Input Password */}
          <div className="relative">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full border border-slate-300 p-3 rounded-lg text-slate-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Password
            </label>
          </div>

          {/* Pesan Error */}
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ease-in-out flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Login</span>
          </button>
        </form>
      </div>
      <footer className="text-center mt-8 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} POS Kasir Baju. Dibuat dengan ❤️.</p>
      </footer>
    </div>
  );
}
