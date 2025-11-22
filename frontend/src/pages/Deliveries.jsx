import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Filter, Loader2, Truck, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

const Deliveries = () => {
  const [search, setSearch] = useState('');
  
  // Fetch Deliveries
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', search],
    queryFn: async () => {
      const res = await api.get(`/operations?type=DELIVERY&search=${search}`);
      return res.data;
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'WAITING': return 'bg-orange-50 text-orange-600 border-orange-200'; // Unique to Delivery
      case 'READY': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'DONE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Deliveries</h1>
          <p className="text-slate-500 font-medium mt-1">Manage outgoing customer orders</p>
        </div>
        
        <Link 
          to="/operations/create?type=DELIVERY" 
          className="btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl shadow-lg shadow-slate-900/20 px-6"
        >
          <Plus size={20} /> New Delivery
        </Link>
      </div>

      {/* --- FILTERS --- */}
      <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search reference or customer..." 
            className="input w-full pl-10 bg-transparent border-transparent focus:bg-white/50 focus:border-white rounded-xl transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost text-slate-500 hover:bg-white/50 rounded-xl">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* --- TABLE --- */}
      <div className="card bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Reference</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Destination</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="h-40 text-center text-slate-400">
                    <Loader2 className="animate-spin inline mr-2" /> Loading...
                  </td>
                </tr>
              ) : deliveries?.length === 0 ? (
                <tr>
                   <td colSpan="6" className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Truck size={32} strokeWidth={1.5} />
                      <span className="text-sm font-medium">No deliveries found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del._id} className="hover:bg-white/40 transition-colors group border-b border-slate-100 last:border-none">
                    <td className="pl-6 py-4 font-bold text-slate-800">{del.reference}</td>
                    
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                          {del.contact?.charAt(0)}
                        </div>
                        <span className="text-slate-600 font-medium">{del.contact}</span>
                      </div>
                    </td>

                    <td className="py-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {del.scheduleDate ? new Date(del.scheduleDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td className="py-4 text-slate-500 text-sm">{del.destinationLocation?.name}</td>

                    <td className="py-4">
                      <div className={`badge ${getStatusColor(del.status)} border font-bold text-xs py-3 px-3 gap-1`}>
                        {del.status === 'WAITING' && <AlertCircle size={12} />}
                        {del.status}
                      </div>
                    </td>

                    <td className="pr-6 py-4 text-right">
                      <Link 
                        to={`/operations/${del._id}?type=DELIVERY`} 
                        className="btn btn-sm btn-ghost btn-square text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <ArrowRight size={18} />
                      </Link>
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
};

export default Deliveries;