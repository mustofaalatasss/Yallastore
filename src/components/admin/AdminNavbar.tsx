"use client";

import { Bell, Search, User } from "lucide-react";

export default function AdminNavbar() {
  return (
    <header className="h-20 dark:bg-[#050505] bg-white/60 backdrop-blur-xl border-b dark:border-white/5 border-black/5 flex items-center justify-between px-8 sticky top-0 z-30 ml-64 shadow-sm">
      {/* Search */}
      <div className="relative w-96 hidden md:block group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search products, orders..." 
          className="w-full bg-white/[0.03] hover:bg-white/[0.05] border dark:border-white/5 border-black/5 focus:border-primary/50 rounded-xl pl-12 pr-4 py-2.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:dark:text-silver text-gray-600/60"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-auto">
        <button className="relative dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors group">
          <Bell size={20} className="group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l dark:border-white/10 border-black/10 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-black border dark:border-white/10 border-black/10 flex items-center justify-center dark:text-silver text-gray-600 group-hover:border-primary/50 group-hover:dark:text-white text-gray-900 transition-all shadow-lg group-hover:shadow-primary/20">
            <User size={18} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm dark:text-white text-gray-900 font-sans font-medium group-hover:text-primary transition-colors">Admin User</p>
            <p className="text-xs dark:text-silver text-gray-600">admin@yalla.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}

