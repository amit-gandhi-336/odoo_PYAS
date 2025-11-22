import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Filter, Loader2, Edit2, AlertTriangle } from 'lucide-react';

const Stock = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // 1. Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res = await api.get(`/products?search=${search}`);
      return res.data;
    },
  });

  // 2. Stock Adjustment Logic (Placeholder for now)
  const handleAdjust = (product) => {
      // In a real app, open a modal to ask for "New Quantity"
      // Then calculate diff and send operation.
      toast('Stock Adjustment feature coming in v2!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time stock levels & valuation</p>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="p-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="input text-black w-full pl-10 bg-transparent border-transparent focus:bg-white/50 focus:border-white rounded-xl transition-all placeholder:text-slate-400 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost text-slate-500 hover:bg-white/50 rounded-xl">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* --- STOCK TABLE --- */}
      <div className="card bg-white/70 backdrop-blur-xl shadow-xl border border-white/60 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="py-4 pl-6 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unit Cost</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">On Hand</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Free to Use</th>
                <th className="py-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="h-40 text-center"><Loader2 className="animate-spin inline text-slate-400" /></td></tr>
              ) : products?.length === 0 ? (
                <tr><td colSpan="6" className="h-40 text-center text-slate-400 font-medium">No products found</td></tr>
              ) : (
                products.map((product) => (
                <tr key={product._id} className="hover:bg-white/40 transition-colors border-b border-slate-100 last:border-none group">
                  
                  {/* Product Name & SKU */}
                  <td className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-400 font-mono font-medium">[{product.sku}]</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide">
                      {product.category}
                    </span>
                  </td>
                  
                  <td className="py-4 text-slate-600 font-bold font-mono">₹{product.price}</td>

                  {/* On Hand (with Low Stock Alert) */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-lg ${product.totalStock < product.minStock ? 'text-rose-600' : 'text-slate-800'}`}>
                        {product.totalStock}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{product.unit}</span>
                      {product.totalStock < product.minStock && (
                        <div className="tooltip" data-tip={`Low Stock (Min: ${product.minStock})`}>
                          <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Free to Use */}
                  <td className="py-4">
                    <span className="font-bold text-slate-600">{product.totalStock}</span>
                  </td>

                  <td className="pr-6 py-4 text-right">
                    <button 
                      className="btn btn-sm btn-ghost btn-square text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      onClick={() => handleAdjust(product)}
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>

                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Stock;