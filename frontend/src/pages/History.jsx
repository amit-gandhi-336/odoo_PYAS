import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Search, Filter, Loader2, ArrowUpRight, ArrowDownLeft, Calendar, ArrowRightLeft, History as HistoryIcon } from 'lucide-react';

const History = () => {
  const [search, setSearch] = useState('');

  const { data: history, isLoading } = useQuery({
    queryKey: ['history', search],
    queryFn: async () => {
      const res = await api.get(`/operations?status=DONE&search=${search}`);
      return res.data;
    },
  });

  const flattenedHistory = history?.flatMap(op => 
    op.items.map(item => ({
      _id: op._id + item.product?._id,
      reference: op.reference,
      date: op.updatedAt || op.createdAt,
      contact: op.contact,
      from: op.sourceLocation?.name || 'Unknown',
      to: op.destinationLocation?.name || 'Unknown',
      product: item.product?.name,
      quantity: item.quantity,
      type: op.type, // RECEIPT, DELIVERY
      // Logic to detect Internal Transfer: Both source and dest are tracked locations
      isInternal: ['WAREHOUSE', 'INTERNAL'].includes(op.sourceLocation?.type) && 
                  ['WAREHOUSE', 'INTERNAL'].includes(op.destinationLocation?.type)
    }))
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Move History</h1>
          <p className="text-slate-500 font-medium mt-1">Audit trail of all stock movements</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search reference..." 
            className="input w-full pl-10 bg-transparent border-transparent focus:bg-white/50 focus:border-white rounded-xl transition-all placeholder:text-slate-400 font-medium"
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
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">From</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">To</th>
                <th className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="h-40 text-center"><Loader2 className="animate-spin inline text-slate-400" /></td></tr>
              ) : flattenedHistory.length === 0 ? (
                <tr><td colSpan="6" className="h-40 text-center text-slate-400 font-medium">No movements recorded</td></tr>
              ) : (
                flattenedHistory.map((row) => {
                  // Determine Type and Icon
                  let colorClass, bgClass, icon, sign;
                  
                  if (row.isInternal) {
                      colorClass = 'text-blue-600';
                      bgClass = 'bg-blue-50';
                      icon = <ArrowRightLeft size={14} />;
                      sign = ''; // No sign for transfers
                  } else if (row.type === 'RECEIPT') {
                      colorClass = 'text-emerald-600';
                      bgClass = 'bg-emerald-50';
                      icon = <ArrowDownLeft size={14} />;
                      sign = '+';
                  } else {
                      colorClass = 'text-rose-600';
                      bgClass = 'bg-rose-50';
                      icon = <ArrowUpRight size={14} />;
                      sign = '-';
                  }
                  
                  return (
                    <tr key={row._id} className="hover:bg-white/40 transition-colors border-b border-slate-100 last:border-none group">
                      
                      <td className="pl-6 py-4 font-bold text-slate-700 font-mono text-sm">
                        {row.reference}
                      </td>

                      <td className="py-4 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(row.date).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 font-bold text-slate-800">
                        {row.product}
                      </td>

                      <td className="py-4 text-slate-500 text-sm">{row.from}</td>
                      <td className="py-4 text-slate-500 text-sm">{row.to}</td>

                      <td className="pr-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm ${colorClass} ${bgClass}`}>
                          {icon}
                          {sign}{row.quantity}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default History;