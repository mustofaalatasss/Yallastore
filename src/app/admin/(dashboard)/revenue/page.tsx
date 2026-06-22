"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Package, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/revenue?days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [days]);

  if (loading && !data) {
    return <div className="dark:text-white text-gray-900 text-center py-20 animate-pulse">Loading revenue analytics...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif dark:text-white text-gray-900 mb-2">Revenue Analytics</h1>
          <p className="dark:text-silver text-gray-600 text-sm">Detailed breakdown of your store's financial performance.</p>
        </div>
        
        <div className="flex gap-2 dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 p-1 rounded-xl w-max">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                days === d 
                  ? "bg-primary text-black shadow-[0_0_10px_rgba(230,0,0,0.5)]" 
                  : "dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 hover:bg-white/5"
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-2xl border dark:border-white/5 border-black/5 relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs dark:text-silver text-gray-600 font-sans uppercase tracking-[0.2em]">Total Revenue</p>
            <div className="w-10 h-10 rounded-xl bg-[#222] border dark:border-white/10 border-black/10 flex items-center justify-center text-primary">
              <DollarSign size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-serif dark:text-white text-gray-900 mb-2">Rp {(data?.totalRevenue || 0).toLocaleString('id-ID')}</h3>
          <p className="text-xs dark:text-silver text-gray-600">Over the last {days} days</p>
        </div>
        
        <div className="bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-2xl border dark:border-white/5 border-black/5 relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs dark:text-silver text-gray-600 font-sans uppercase tracking-[0.2em]">Total Orders</p>
            <div className="w-10 h-10 rounded-xl bg-[#222] border dark:border-white/10 border-black/10 flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-serif dark:text-white text-gray-900 mb-2">
            {data?.revenueByDate?.reduce((acc: number, curr: any) => acc + curr.ordersCount, 0) || 0}
          </h3>
          <p className="text-xs dark:text-silver text-gray-600">Completed orders</p>
        </div>

        <div className="bg-gradient-to-br from-[#111] to-[#050505] p-6 rounded-2xl border dark:border-white/5 border-black/5 relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs dark:text-silver text-gray-600 font-sans uppercase tracking-[0.2em]">Avg. Order Value</p>
            <div className="w-10 h-10 rounded-xl bg-[#222] border dark:border-white/10 border-black/10 flex items-center justify-center text-primary">
              <Calendar size={20} />
            </div>
          </div>
          <h3 className="text-4xl font-serif dark:text-white text-gray-900 mb-2">
            Rp {data?.totalRevenue && data?.revenueByDate 
                ? (data.totalRevenue / data.revenueByDate.reduce((acc: number, curr: any) => acc + curr.ordersCount, 0)).toLocaleString('id-ID', { maximumFractionDigits: 0 }) 
                : 0}
          </h3>
          <p className="text-xs dark:text-silver text-gray-600">Average per order</p>
        </div>
      </div>

      {/* Revenue Area Chart */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl p-6 shadow-xl relative">
        {loading && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
        <h2 className="text-xl font-serif dark:text-white text-gray-900 mb-6 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
          Revenue Timeline
        </h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueByDate?.length === 1 ? [{date: 'Previous', revenue: 0, ordersCount: 0}, ...data.revenueByDate, {date: 'Next', revenue: 0, ordersCount: 0}] : data?.revenueByDate || []}>
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
                formatter={(value: any, name: any) => {
                  if (name === 'revenue') return [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Revenue'];
                  return [value, 'Orders'];
                }}
                labelStyle={{ color: '#aaa', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#e60000" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, fill: '#e60000', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50/50 backdrop-blur-sm border dark:border-white/5 border-black/5 rounded-2xl overflow-hidden shadow-xl relative">
        {loading && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 rounded-2xl"></div>}
        <div className="p-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
          <h2 className="text-xl font-serif dark:text-white text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary rounded-full inline-block shadow-[0_0_8px_rgba(230,0,0,0.8)]"></span>
            Top Earning Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-silver text-gray-600 font-sans">
            <thead className="dark:bg-[#111] bg-gray-100/80 text-xs uppercase tracking-[0.2em] dark:text-white text-gray-900/40">
              <tr>
                <th className="px-6 py-5 font-medium">Rank</th>
                <th className="px-6 py-5 font-medium">Product Name</th>
                <th className="px-6 py-5 font-medium text-right">Units Sold</th>
                <th className="px-6 py-5 font-medium text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.topProducts?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center dark:text-silver text-gray-600/40">No sales data for this period.</td>
                </tr>
              ) : (
                data?.topProducts?.map((product: any, index: number) => (
                  <tr key={product.productId} className="hover:bg-white/[0.04] transition-all">
                    <td className="px-6 py-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-gray-400/20 text-gray-300' : 
                        index === 2 ? 'bg-orange-600/20 text-orange-500' : 
                        'bg-white/5 dark:text-silver text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white text-gray-900">{product.productName}</td>
                    <td className="px-6 py-4 text-right dark:text-silver text-gray-600">{product.totalSold}</td>
                    <td className="px-6 py-4 text-right font-medium text-primary">Rp {product.revenueGenerated.toLocaleString('id-ID')}</td>
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
