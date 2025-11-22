import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Save, MapPin, Box, Warehouse, Loader2, Trash2 } from 'lucide-react';

const Settings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('warehouse');

  // --- FETCH DATA ---
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const res = await api.get('/locations');
      return res.data;
    },
  });

  const warehouses = locations?.filter(l => l.type === 'WAREHOUSE') || [];
  const internalLocs = locations?.filter(l => l.type === 'INTERNAL') || [];

  // --- FORM STATE ---
  const [whForm, setWhForm] = useState({ name: '', shortCode: '', address: '' });
  const [locForm, setLocForm] = useState({ name: '', shortCode: '', parentLocation: '' });

  // --- MUTATION ---
  const createMutation = useMutation({
    mutationFn: (newLoc) => api.post('/locations', newLoc),
    onSuccess: () => {
      toast.success('Location Created');
      setWhForm({ name: '', shortCode: '', address: '' });
      setLocForm({ name: '', shortCode: '', parentLocation: '' });
      queryClient.invalidateQueries(['locations']);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create")
  });

  const handleWhSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...whForm, type: 'WAREHOUSE' });
  };

  const handleLocSubmit = (e) => {
    e.preventDefault();
    if (!locForm.parentLocation) return toast.error("Select a Parent Warehouse");
    createMutation.mutate({ ...locForm, type: 'INTERNAL' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Configure warehouses & storage locations</p>
      </div>

      {/* --- TABS --- */}
      <div className="tabs tabs-boxed bg-white/60 backdrop-blur-xl p-1 rounded-xl border border-white/60 w-fit">
        <a 
          className={`tab px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'warehouse' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
          onClick={() => setActiveTab('warehouse')}
        >
          Warehouses
        </a>
        <a 
          className={`tab px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'location' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
          onClick={() => setActiveTab('location')}
        >
          Sub-Locations
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* --- LEFT: CREATE FORM --- */}
        <div className="md:col-span-1">
          <div className="card bg-white/80 backdrop-blur-xl shadow-xl border border-white/60 rounded-3xl overflow-hidden sticky top-24">
            <div className="card-body p-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4">
                {activeTab === 'warehouse' ? <Warehouse className="text-blue-600" /> : <Box className="text-emerald-600" />}
                Add {activeTab === 'warehouse' ? 'Warehouse' : 'Location'}
              </h2>

              {activeTab === 'warehouse' ? (
                <form onSubmit={handleWhSubmit} className="space-y-4">
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Name</label>
                    <input 
                      type="text" 
                      placeholder="Main Warehouse" 
                      className="text-black input input-bordered w-full bg-white font-semibold"
                      value={whForm.name} 
                      onChange={e => setWhForm({...whForm, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Short Code</label>
                    <input 
                      type="text" 
                      placeholder="WH-MAIN" 
                      className="text-black input input-bordered w-full bg-white font-semibold uppercase"
                      value={whForm.shortCode} 
                      onChange={e => setWhForm({...whForm, shortCode: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Address</label>
                    <input 
                      type="text" 
                      placeholder="123 Street, City" 
                      className="text-black input input-bordered w-full bg-white font-semibold"
                      value={whForm.address} 
                      onChange={e => setWhForm({...whForm, address: e.target.value})}
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={createMutation.isLoading}
                    className="btn bg-slate-900 hover:bg-slate-800 text-white w-full shadow-lg mt-2"
                  >
                    {createMutation.isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Warehouse</>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLocSubmit} className="space-y-4">
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Parent Warehouse</label>
                    <select 
                      className="text-black select select-bordered w-full bg-white font-semibold"
                      value={locForm.parentLocation}
                      onChange={e => setLocForm({...locForm, parentLocation: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Warehouse</option>
                      {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Location Name</label>
                    <input 
                      type="text" 
                      placeholder="Shelf A / Rack 1" 
                      className="text-black input input-bordered w-full bg-white font-semibold"
                      value={locForm.name} 
                      onChange={e => setLocForm({...locForm, name: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-control space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Short Code</label>
                    <input 
                      type="text" 
                      placeholder="LOC-A1" 
                      className="text-black input input-bordered w-full bg-white font-semibold uppercase"
                      value={locForm.shortCode} 
                      onChange={e => setLocForm({...locForm, shortCode: e.target.value})}
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={createMutation.isLoading}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full shadow-lg mt-2"
                  >
                    {createMutation.isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Location</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIST VIEW --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Warehouses List */}
          {activeTab === 'warehouse' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-600 px-2">Active Warehouses</h3>
              {isLoading ? <Loader2 className="animate-spin" /> : warehouses.map(wh => (
                <div key={wh._id} className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Warehouse size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{wh.name}</div>
                      <div className="text-xs text-slate-400 font-mono uppercase">{wh.shortCode} · {wh.address}</div>
                    </div>
                  </div>
                  <div className="badge badge-ghost">{wh.type}</div>
                </div>
              ))}
            </div>
          )}

          {/* Locations List */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-600 px-2">Internal Locations</h3>
              {isLoading ? <Loader2 className="animate-spin" /> : internalLocs.length === 0 ? (
                <div className="text-slate-400 italic px-4">No sub-locations created yet.</div>
              ) : internalLocs.map(loc => (
                <div key={loc._id} className="p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Box size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{loc.name}</div>
                      <div className="text-xs text-slate-400 font-mono uppercase">
                        Inside: <span className="text-slate-600 font-bold">{loc.parentLocation?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="badge badge-ghost">{loc.shortCode}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;