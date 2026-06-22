"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Email atau password salah.");
        setIsLoading(false);
        return;
      }

      // Gunakan hard redirect dengan cache-buster agar tidak terkena cache Vercel Edge
      window.location.href = `/admin?t=${Date.now()}`;
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E60000] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E60000] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link 
          href="/"
          className="inline-flex items-center dark:text-white text-gray-900/60 hover:dark:text-white text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Toko
        </Link>

        <div className="bg-[#1A1A1A] border dark:border-white/10 border-black/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black dark:text-white text-gray-900 uppercase tracking-wider mb-2">
              Yalla<span className="text-[#E60000]">Store</span>
            </h1>
            <p className="dark:text-white text-gray-900/60">Login ke Admin Dashboard</p>
          </div>

          {error && (
            <div className="bg-[#E60000]/10 border border-[#E60000]/30 text-[#E60000] px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#222222] border dark:border-white/10 border-black/10 rounded-xl px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-[#E60000] transition-colors"
                placeholder="admin@yallastore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-900/80 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#222222] border dark:border-white/10 border-black/10 rounded-xl px-4 py-3 dark:text-white text-gray-900 focus:outline-none focus:border-[#E60000] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E60000] hover:bg-[#CC0000] dark:text-white text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
