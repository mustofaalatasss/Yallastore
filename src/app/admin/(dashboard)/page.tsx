"use client";

import Link from "next/link";
import { DollarSign, ShoppingBag, Users, TrendingUp, Package } from "lucide-react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="dark:text-white text-gray-900 text-center py-20">Loading dashboard...</div>;
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif dark:text-white text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="dark:text-silver text-gray-600 text-sm">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`Rp ${(data.totalRevenue || 0).toLocaleString('id-ID')}`} icon={DollarSign} trend="Active" href="/admin/revenue" />
        <StatCard title="Total Orders" value={data.totalOrders || 0} icon={ShoppingBag} trend="Active" href="/admin/orders" />
        <StatCard title="Total Products" value={data.totalProducts || 0} icon={Package} trend="Active" href="/admin/products" />
        <StatCard title="Total Stock" value={data.totalStock || 0} icon={TrendingUp} trend="Active" href="/admin/products" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl p-6 shadow-xl">
           <h2 className="text-xl font-serif dark:text-white text-gray-900 mb-6 flex items-center gap-3">
             <span className="w-1.5 h-6 bg-primary rounded-full inline-block shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
             Revenue Trend (Last 30 Days)
           </h2>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.revenueByDate?.length === 1 ? [{date: 'Previous', revenue: 0}, ...data.revenueByDate, {date: 'Next', revenue: 0}] : data.revenueByDate || []}>
                 <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#e60000" stopOpacity={0.6}/>
                     <stop offset="95%" stopColor="#e60000" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                 <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis 
                   stroke="#888" 
                   fontSize={12} 
                   tickLine={false} 
                   axisLine={false} 
                   tickCount={6}
                   domain={[0, (dataMax: number) => Math.max(dataMax, 1500000)]}
                   tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                 />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                   itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                   formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue']}
                   labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                 />
                 <Area type="monotone" dataKey="revenue" stroke="#e60000" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#e60000', strokeWidth: 2, stroke: '#fff' }} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Order Status & Categories */}
        <div className="flex flex-col gap-6">
           <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl p-6 shadow-xl flex-1">
             <h2 className="text-lg font-serif dark:text-white text-gray-900 mb-4">Products by Category</h2>
             <div className="h-[120px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.categoryStats || []}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                   <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                   <Bar dataKey="productCount" radius={[4, 4, 0, 0]}>
                     {(data.categoryStats || []).map((entry: any, index: number) => {
                       const colors: Record<string, string> = {
                         'Jujutsu Kaisen': '#a855f7', // Purple
                         'One Piece': '#22c55e', // Green
                         'Naruto': '#f97316', // Orange
                         'Demon Slayer': '#ef4444', // Red
                         'Dragon Ball': '#eab308', // Yellow
                         'Bleach': '#3b82f6', // Blue
                       };
                       return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#e60000'} />;
                     })}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>
           
           <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl p-6 shadow-xl flex-1">
             <h2 className="text-lg font-serif dark:text-white text-gray-900 mb-4">Order Status</h2>
             <div className="h-[120px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(data.ordersByStatus || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.entries(data.ordersByStatus || {}).map(([name], index) => {
                        const colors: Record<string, string> = {
                          'Completed': '#22c55e',
                          'Processing': '#3b82f6',
                          'Pending': '#eab308',
                          'Cancelled': '#ef4444'
                        };
                        return <Cell key={`cell-${index}`} fill={colors[name] || '#888'} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>


      {/* Recent Orders Table */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
          <h2 className="text-xl font-serif dark:text-white text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary rounded-full inline-block shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
            Recent Orders
          </h2>
          <button onClick={() => router.push('/admin/orders')} className="text-sm text-primary hover:dark:text-white text-gray-900 font-sans uppercase tracking-widest transition-all hover:translate-x-1">View All &rarr;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-silver text-gray-600 font-sans">
            <thead className="dark:bg-[#111] bg-gray-100/80 text-xs uppercase tracking-[0.2em] dark:text-white text-gray-900/40">
              <tr>
                <th className="px-6 py-5 font-medium">Order ID</th>
                <th className="px-6 py-5 font-medium">Customer</th>
                <th className="px-6 py-5 font-medium">Product</th>
                <th className="px-6 py-5 font-medium">Date</th>
                <th className="px-6 py-5 font-medium">Amount</th>
                <th className="px-6 py-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center dark:text-silver text-gray-600/40 font-sans tracking-widest uppercase text-sm">
                    No recent orders yet.
                  </td>
                </tr>
              ) : (
                data.recentOrders?.map((order: any) => (
                  <tr key={order.id} onClick={() => router.push('/admin/orders')} className="hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer">
                    <td className="px-6 py-5 font-medium dark:text-white text-gray-900 group-hover:text-primary transition-colors">{order.orderNumber}</td>
                    <td className="px-6 py-5">{order.customerName}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center dark:text-white text-gray-900/40 group-hover:text-primary/70 transition-colors">
                          <Package size={14} />
                        </div>
                        <span className="truncate max-w-[200px]">
                          {order.items?.length > 0 ? order.items[0].productName + (order.items.length > 1 ? ` (+${order.items.length - 1})` : '') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 dark:text-white text-gray-900/60">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-5 dark:text-white text-gray-900 font-medium">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border ${
                        order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                        order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, negative, href }: any) {
  const CardContent = (
    <div className="bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-2xl border dark:border-white/5 border-black/5 relative overflow-hidden group hover:border-primary/30 hover:shadow-[0_0_20px_rgba(230,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="absolute -right-6 -top-6 dark:text-white text-gray-900/5 group-hover:text-primary/5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs dark:text-silver text-gray-600 font-sans uppercase tracking-[0.2em]">{title}</p>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#222] to-[#111] border dark:border-white/10 border-black/10 flex items-center justify-center text-primary group-hover:shadow-[0_0_15px_rgba(230,0,0,0.3)] transition-all duration-300">
            <Icon size={20} />
          </div>
        </div>
        <h3 className="text-4xl font-serif dark:text-white text-gray-900 mb-2 drop-shadow-md">{value}</h3>
        <p className={`text-xs font-sans tracking-wide flex items-center gap-1.5 ${negative ? 'text-red-500' : 'text-green-500'}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-sm"></span>
          {trend}
        </p>
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{CardContent}</Link> : CardContent;
}

