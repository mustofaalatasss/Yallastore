"use client";

import { Save, Store, CreditCard, Truck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif text-white mb-2">Store Settings</h1>
        <p className="text-silver text-sm">Manage your store details, payments, and shipping preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans uppercase tracking-widest transition-all bg-primary/10 text-primary border border-primary/20 text-left">
            <Store size={18} />
            Store Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans uppercase tracking-widest transition-all text-silver hover:bg-white/5 hover:text-white text-left">
            <CreditCard size={18} />
            Payment (QRIS)
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-sans uppercase tracking-widest transition-all text-silver hover:bg-white/5 hover:text-white text-left">
            <Truck size={18} />
            Shipping
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-8 space-y-6">
            <h2 className="text-xl font-serif text-white border-b border-white/5 pb-4">General Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-silver">Store Name</label>
                <input 
                  type="text" 
                  defaultValue="Yalla Anime Streetwear" 
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-silver">Support Email</label>
                  <input 
                    type="email" 
                    defaultValue="support@yalla.com" 
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans uppercase tracking-widest text-silver">Phone Number</label>
                  <input 
                    type="text" 
                    defaultValue="+62 812 3456 7890" 
                    className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-widest text-silver">Store Description (SEO)</label>
                <textarea 
                  rows={4}
                  defaultValue="Luxury dark theme anime streetwear featuring Naruto, One Piece, Jujutsu Kaisen, and Demon Slayer." 
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="bg-primary hover:bg-white text-black px-8 py-3 rounded-lg font-sans uppercase tracking-widest text-sm font-bold transition-colors shadow-[0_0_20px_rgba(230,0,0,0.2)] flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

