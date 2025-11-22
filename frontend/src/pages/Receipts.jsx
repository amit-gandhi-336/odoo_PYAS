import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Filter, Loader2, Package, Calendar, ArrowRight, MapPin } from 'lucide-react';

const Receipts = () => {
  const [search, setSearch] = useState('');
  
  const { data: receipts, isLoading } = useQuery({
    queryKey: ['receipts', search],
    queryFn: async () => {
      const res = await api.get(`/operations?type=RECEIPT&search=${search}`);
      return res.data;
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'READY': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'DONE': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  // --- HELPER: Format Location Hierarchically (WH/Stock1) ---
  const formatDestination = (loc) => {
    if (!loc) return '-';
    
    // Case 1: It has a parent location populated (e.g. Shelf inside Warehouse)
    if (loc.parentLocation) {
        const parentCode = loc.parentLocation.shortCode || loc.parentLocation.name;
        const myCode = loc.shortCode || loc.name;
        return `${parentCode}/${myCode}`;
    }
    
    // Case 2: It is a top-level warehouse (e.g. Main Warehouse)
    // Just show its shortCode
    return loc.shortCode || loc.name;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Receipts</h1>
          <p className="text-slate-500 font-medium mt-1">Incoming shipments</p>
        </div>
        
        <Link 
          to="/operations/create?type=RECEIPT" 
          className="btn bg-slate-900 hover:bg-slate-800 text-white border-none rounded-xl shadow-lg shadow-slate-900/20 px-6"
        >
          <Plus size={20} /> New Receipt
        </Link>
      </div>

      {/* Filters */}
      <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search reference or contact..." 
            className="input w-full pl-10 bg-transparent border-transparent focus:bg-white/50 focus:border-white rounded-xl transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost text-slate-500 hover:bg-white/50 rounded-xl">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="card bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Reference</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">From</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">To</th>
                {/* Removed Contact Column as requested */}
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="h-40 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Loading...</td></tr>
              ) : receipts?.length === 0 ? (
                <tr><td colSpan="6" className="h-40 text-center"><Package size={32} className="text-slate-300 mx-auto mb-2" />No receipts found</td></tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt._id} className="hover:bg-white/40 transition-colors group border-b border-slate-100 last:border-none">
                    
                    {/* Reference */}
                    <td className="pl-6 py-4 font-bold text-slate-800 font-mono text-sm">
                      {receipt.reference}
                    </td>

                    {/* From (Combined Contact/Source) */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-medium text-sm">
                          {/* Logic: If contact exists (Vendor Name), show it. Else show Source Location Name */}
                          {receipt.contact || receipt.sourceLocation?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>

                    {/* To (Formatted WH/Loc) */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-slate-600 font-medium text-sm font-mono bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {formatDestination(receipt.destinationLocation)}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {receipt.scheduleDate ? new Date(receipt.scheduleDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <div className={`badge ${getStatusColor(receipt.status)} border font-bold text-xs py-3 px-3`}>
                        {receipt.status}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="pr-6 py-4 text-right">
                      <Link 
                        to={`/operations/${receipt._id}?type=RECEIPT`} 
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

export default Receipts;