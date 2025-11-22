import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Package, Truck, AlertCircle, Clock, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
    refetchInterval: 5000,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div className="text-center text-error mt-10">Failed to load dashboard data.</div>;

  const { receipts, deliveries, inventory } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">Overview</h1>
          <p className="text-slate-500 mt-2 font-medium">Good Morning, Admin 👋</p>
        </div>
      </div>

      {/* --- KPI STRIP (Glass Panels) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: inventory.totalProducts, color: "text-blue-600", icon: <Package size={20} className="text-blue-500" /> },
          { label: "Low Stock Alerts", value: inventory.lowStock, color: "text-rose-600", icon: <AlertCircle size={20} className="text-rose-500" /> },
          { label: "Pending In", value: receipts.toReceive, color: "text-emerald-600", icon: <TrendingUp size={20} className="text-emerald-500" /> },
          { label: "Pending Out", value: deliveries.toDeliver, color: "text-orange-600", icon: <Truck size={20} className="text-orange-500" /> },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/40 backdrop-blur-lg border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-32 group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
              <div className="p-2 rounded-full bg-white/50 shadow-sm group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* --- MAIN ACTION CARDS (Crystal Effect) --- */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* 1. RECEIPTS CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Incoming Stock
                </h2>
                <p className="text-slate-500 text-sm mt-1">Vendor receipts & processing</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>

            <Link 
              to="/operations/receipts" 
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex justify-between items-center"
            >
              <span>Process {receipts.toReceive} Receipts</span>
              <ArrowRight className="opacity-80 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3">
                 <AlertCircle size={18} className="text-rose-500" />
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-400 uppercase">Late</span>
                   <span className="font-bold text-slate-700">{receipts.late} Orders</span>
                 </div>
               </div>
               <div className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3">
                 <Clock size={18} className="text-slate-400" />
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-400 uppercase">Future</span>
                   <span className="font-bold text-slate-700">{receipts.operations} Orders</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 2. DELIVERIES CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-500"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Outgoing Orders
                </h2>
                <p className="text-slate-500 text-sm mt-1">Customer deliveries & logistics</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-rose-100/50 text-rose-600 flex items-center justify-center">
                <Truck size={24} />
              </div>
            </div>

            <Link 
              to="/operations/deliveries" 
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-orange-600 text-white font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex justify-between items-center"
            >
              <span>Ship {deliveries.toDeliver} Orders</span>
              <ArrowRight className="opacity-80 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-6 grid grid-cols-2 gap-4">
               <div className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3">
                 <AlertCircle size={18} className="text-orange-500" />
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-400 uppercase">Waiting</span>
                   <span className="font-bold text-slate-700">{deliveries.waiting} Stock</span>
                 </div>
               </div>
               <div className="p-3 rounded-xl bg-white/40 border border-white/50 flex items-center gap-3">
                 <Clock size={18} className="text-slate-400" />
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-400 uppercase">Future</span>
                   <span className="font-bold text-slate-700">{deliveries.operations} Orders</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Skeleton ---
const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="h-12 w-48 bg-slate-200/50 rounded-xl animate-pulse"></div>
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/40 rounded-2xl animate-pulse"></div>)}
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="h-80 bg-white/40 rounded-3xl animate-pulse"></div>
      <div className="h-80 bg-white/40 rounded-3xl animate-pulse"></div>
    </div>
  </div>
);

export default Dashboard;