"use client";

import { Search, Filter, MoreVertical, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const tabs = ["All", "Pending", "Processing", "Completed", "Cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, []);

  const filteredOrders = activeTab === "All" 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="dark:text-white text-gray-900 py-20 text-center">Loading orders...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif dark:text-white text-gray-900 mb-2">Orders Management</h1>
          <p className="dark:text-silver text-gray-600 text-sm">Track, process, and manage customer orders.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center p-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-sans uppercase tracking-widest rounded-lg whitespace-nowrap transition-colors",
                activeTab === tab ? "bg-primary text-black font-bold" : "dark:text-silver text-gray-600 hover:bg-white/5 hover:dark:text-white text-gray-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-silver text-gray-600" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              className="w-full dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <button className="dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 dark:text-silver text-gray-600 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Filter size={18} />
            <span className="hidden md:inline text-sm">Filter</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dark:bg-[#0a0a0a] bg-gray-50 border dark:border-white/5 border-black/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm dark:text-silver text-gray-600">
            <thead className="dark:bg-[#111] bg-gray-100 text-xs uppercase tracking-widest dark:text-white text-gray-900/60">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Product / Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium dark:text-white text-gray-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <p className="dark:text-white text-gray-900 font-medium">{order.customerName}</p>
                    <p className="text-xs dark:text-silver text-gray-600/60">{order.customerEmail || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {order.items?.length > 0 ? order.items[0].productName + (order.items.length > 1 ? ` (+${order.items.length - 1})` : '') : '-'}
                  </td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 dark:text-white text-gray-900 font-medium">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border focus:outline-none appearance-none cursor-pointer",
                        order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      )}
                    >
                      <option value="Pending" className="dark:bg-[#111] bg-gray-100 dark:text-silver text-gray-600">Pending</option>
                      <option value="Processing" className="dark:bg-[#111] bg-gray-100 dark:text-silver text-gray-600">Processing</option>
                      <option value="Completed" className="dark:bg-[#111] bg-gray-100 dark:text-silver text-gray-600">Completed</option>
                      <option value="Cancelled" className="dark:bg-[#111] bg-gray-100 dark:text-silver text-gray-600">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedOrder(order)} className="w-8 h-8 rounded bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors" title="View Details">
                        <Eye size={14} />
                      </button>
                      <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/20 hover:dark:text-white text-gray-900 flex items-center justify-center transition-colors" title="More Options">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center dark:text-silver text-gray-600">
            <p>No orders found for this status.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-white/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="dark:bg-[#111] bg-gray-100 border dark:border-white/10 border-black/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 dark:bg-[#111] bg-gray-100/90 backdrop-blur-md p-6 border-b dark:border-white/5 border-black/5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-serif dark:text-white text-gray-900">Order Details</h2>
                <p className="dark:text-silver text-gray-600 text-sm">{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 transition-colors p-2 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest dark:text-silver text-gray-600 font-medium border-b dark:border-white/10 border-black/10 pb-2">Customer Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="dark:text-silver text-gray-600/60">Name</span> <span className="dark:text-white text-gray-900 font-medium">{selectedOrder.customerName}</span></div>
                    <div className="flex justify-between"><span className="dark:text-silver text-gray-600/60">Email</span> <span className="dark:text-white text-gray-900">{selectedOrder.customerEmail || '-'}</span></div>
                    <div className="flex justify-between"><span className="dark:text-silver text-gray-600/60">Phone</span> <span className="dark:text-white text-gray-900">{selectedOrder.customerPhone || '-'}</span></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xs uppercase tracking-widest dark:text-silver text-gray-600 font-medium border-b dark:border-white/10 border-black/10 pb-2">Shipping Address</h3>
                  <p className="text-sm dark:text-white text-gray-900/90 whitespace-pre-line leading-relaxed">
                    {selectedOrder.shippingAddress || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest dark:text-silver text-gray-600 font-medium border-b dark:border-white/10 border-black/10 pb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border dark:border-white/5 border-black/5">
                      <div className="flex flex-col">
                        <span className="dark:text-white text-gray-900 font-medium text-sm">{item.productName}</span>
                        <div className="flex gap-3 text-xs dark:text-silver text-gray-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="dark:text-white text-gray-900 text-sm font-medium">Rp {item.price.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="flex justify-end pt-4 border-t dark:border-white/10 border-black/10">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-silver text-gray-600">Subtotal</span>
                    <span className="dark:text-white text-gray-900">Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-silver text-gray-600">Shipping</span>
                    <span className="dark:text-white text-gray-900">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t dark:border-white/5 border-black/5 mt-2">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 dark:bg-[#111] bg-gray-100 p-4 border-t dark:border-white/5 border-black/5 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-lg text-sm font-medium dark:text-silver text-gray-600 hover:dark:text-white text-gray-900 hover:bg-white/10 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

