"use client";

import { Plus, Search, MoreVertical, Edit, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";

const getCategoryColor = (categoryName: string) => {
  if (!categoryName) return 'bg-white/5 dark:text-white text-gray-900/80 dark:border-white/10 border-black/10';
  const name = categoryName.toLowerCase();
  if (name.includes('jjk') || name.includes('jujutsu')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
  if (name.includes('naruto')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
  if (name.includes('one piece')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
  if (name.includes('dragon ball')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
  if (name.includes('demon slayer') || name.includes('kimetsu')) return 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
  if (name.includes('attack on titan') || name.includes('aot')) return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  if (name.includes('bleach')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
  if (name.includes('hunter')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  return 'bg-white/5 dark:text-white text-gray-900/80 dark:border-white/10 border-black/10';
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = category === "All Categories" || p.categoryId?.toString() === category;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    // newest (assuming higher id = newer)
    return b.id - a.id;
  });

  if (loading) return <div className="dark:text-white text-gray-900 py-20 text-center">Loading products...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif dark:text-white text-gray-900 mb-2">Products Management</h1>
          <p className="dark:text-silver text-gray-600 text-sm">Manage your store products, inventory, and pricing.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="group relative bg-primary text-black px-8 py-3.5 rounded-xl font-sans uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(230,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[sweep_1.5s_infinite]"></div>
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />
          <span className="relative z-10">Add New Product</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="dark:bg-[#050505] bg-white/60 backdrop-blur-xl border dark:border-white/5 border-black/5 rounded-2xl p-5 flex flex-col md:flex-row gap-5 justify-between items-center shadow-lg">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-silver text-gray-600 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] hover:bg-white/[0.05] border dark:border-white/5 border-black/5 focus:border-primary/50 rounded-xl pl-12 pr-4 py-3 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:dark:text-silver text-gray-600/60"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/[0.03] hover:bg-white/[0.05] border dark:border-white/5 border-black/5 focus:border-primary/50 rounded-xl px-4 py-3 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full md:w-auto appearance-none cursor-pointer"
          >
            <option value="All Categories" className="dark:bg-[#111] bg-gray-100">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id} className="dark:bg-[#111] bg-gray-100">{c.name}</option>
            ))}
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/[0.03] hover:bg-white/[0.05] border dark:border-white/5 border-black/5 focus:border-primary/50 rounded-xl px-4 py-3 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full md:w-auto appearance-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-[#111] bg-gray-100">Sort by: Newest</option>
            <option value="price_asc" className="dark:bg-[#111] bg-gray-100">Sort by: Price (Low to High)</option>
            <option value="price_desc" className="dark:bg-[#111] bg-gray-100">Sort by: Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {/* Products Table */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-silver text-gray-600 font-sans">
            <thead className="dark:bg-[#111] bg-gray-100/80 text-xs uppercase tracking-[0.2em] dark:text-white text-gray-900/40">
              <tr>
                <th className="px-6 py-5 font-medium">Product</th>
                <th className="px-6 py-5 font-medium">Category</th>
                <th className="px-6 py-5 font-medium">Price</th>
                <th className="px-6 py-5 font-medium">Stock</th>
                <th className="px-6 py-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.04] transition-all duration-300 group">
                  <td className="px-6 py-4 flex items-center gap-5">
                    <div className="w-14 h-14 dark:bg-[#111] bg-gray-100 rounded-xl border dark:border-white/10 border-black/10 relative flex-shrink-0 group-hover:border-primary/30 transition-colors overflow-hidden shadow-md">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white text-gray-900 text-base group-hover:text-primary transition-colors cursor-pointer">{product.name}</p>
                      <p className="text-xs dark:text-silver text-gray-600/50 tracking-widest uppercase mt-1">ID: PRD-{String(product.id).padStart(4, '0')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-medium border shadow-sm ${getCategoryColor(product.category?.name)}`}>
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium dark:text-white text-gray-900">Rp {product.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium px-3 py-1.5 rounded-full text-xs tracking-widest uppercase border ${
                      product.stock < 10 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${product.id}`} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary border dark:border-white/5 border-black/5 hover:border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-[0_0_15px_rgba(230,0,0,0.2)]">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 border dark:border-white/5 border-black/5 hover:border-red-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center dark:text-silver text-gray-600/40 font-sans tracking-widest uppercase text-sm">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

