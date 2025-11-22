import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, CheckCircle, Printer, Plus, Trash2, Calendar, User as UserIcon, MapPin, ChevronLeft, ArrowRight } from 'lucide-react';

const OperationForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams(); 
  const queryClient = useQueryClient();

  const type = searchParams.get('type') || 'RECEIPT';
  const isEditMode = !!id;

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    sourceLocation: '',
    destinationLocation: '',
    scheduleDate: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState([{ product: '', quantity: 1 }]);
  const [status, setStatus] = useState('DRAFT');
  const [reference, setReference] = useState('New');

  // --- DATA FETCHING ---
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: () => api.get('/locations').then(res => res.data) });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/products').then(res => res.data) });
  
  // FIX: Fetch Single Operation using correct ID endpoint
  const { data: existingOp } = useQuery({
    queryKey: ['operation', id],
    queryFn: () => api.get(`/operations/${id}`).then(res => res.data),
    enabled: isEditMode,
  });

  // FIX: Update State ONLY when data arrives
  useEffect(() => {
    if (existingOp) {
      setFormData({
        // Handle both populated objects ( {_id, name} ) and raw IDs
        sourceLocation: existingOp.sourceLocation?._id || existingOp.sourceLocation,
        destinationLocation: existingOp.destinationLocation?._id || existingOp.destinationLocation,
        scheduleDate: existingOp.scheduleDate ? existingOp.scheduleDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      if (existingOp.items?.length > 0) {
          setItems(existingOp.items.map(i => ({ 
              product: i.product?._id || i.product, 
              quantity: i.quantity 
          })));
      }
      
      setStatus(existingOp.status);
      setReference(existingOp.reference);
    }
  }, [existingOp]);

  // Filter Locations
  const warehouses = locations?.filter(l => l.type === 'WAREHOUSE') || [];
  const partners = locations?.filter(l => l.type === (type === 'RECEIPT' ? 'VENDOR' : 'CUSTOMER')) || [];

  // --- MUTATIONS ---
  const mutation = useMutation({
    mutationFn: (payload) => isEditMode 
      ? api.put(`/operations/${id}`, payload) 
      : api.post('/operations', payload),
    onSuccess: (data) => {
      toast.success(isEditMode ? 'Operation Updated' : 'Draft Created');
      if (!isEditMode) {
        // Redirect to Edit Mode
        navigate(`/operations/${data.data._id}?type=${type}`);
      } else {
        // If editing, just update local status
        if(data.data.status) setStatus(data.data.status);
      }
      queryClient.invalidateQueries(['operation', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to save")
  });

  const validateMutation = useMutation({
    mutationFn: () => api.put(`/operations/${id}/validate`),
    onSuccess: () => {
      toast.success('Validated! Stock Updated.');
      setStatus('DONE');
      queryClient.invalidateQueries(['dashboard-stats']);
      queryClient.invalidateQueries(['operation', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Validation Failed")
  });

  // --- HANDLER: SAVE (Sets to READY) ---
  const handleSave = (e) => {
    e.preventDefault();

    if (type === 'RECEIPT' && !formData.sourceLocation) return toast.error("Please select a Vendor");
    if (type === 'RECEIPT' && !formData.destinationLocation) return toast.error("Please select a Warehouse");
    
    if (items.some(i => !i.product)) return toast.error("Please select products");

    // Find Partner Name
    const sourceObj = locations?.find(l => l._id === formData.sourceLocation);
    const destObj = locations?.find(l => l._id === formData.destinationLocation);
    const contactName = type === 'RECEIPT' ? sourceObj?.name : destObj?.name;

    const payload = {
      type,
      contact: contactName,
      ...formData,
      status: 'READY', // <--- Force status to READY on save
      items
    };

    mutation.mutate(payload);
  };

  const handleAddItem = () => setItems([...items, { product: '', quantity: 1 }]);
  const handleRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const isDone = status === 'DONE';
  const isReady = status === 'READY';
  const pipeline = ['DRAFT', 'READY', 'DONE'];

  // Styles
  const inputClass = "input w-full bg-white border border-slate-300 focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 rounded-xl text-slate-900 font-bold shadow-sm";
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm text-slate-500 hover:bg-slate-200">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {isEditMode ? reference : `New ${type === 'RECEIPT' ? 'Receipt' : 'Delivery'}`}
              </h1>
              <span className={`badge font-bold border-none ${isDone ? 'bg-emerald-100 text-emerald-700' : isReady ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {status}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {type === 'RECEIPT' ? 'Vendor Bill · Incoming' : 'Customer Note · Outgoing'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          
          {(isReady && isEditMode) && (
            <button 
              onClick={() => validateMutation.mutate()} 
              disabled={validateMutation.isLoading}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-600/20 rounded-xl"
            >
              <CheckCircle size={18} /> Validate
            </button>
          )}

          {(!isDone) && (
             <button 
                onClick={handleSave} 
                disabled={mutation.isLoading}
                className={`btn ${isReady ? 'btn-ghost border-slate-300 bg-white text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-white'} shadow-lg rounded-xl`}
             >
               <Save size={18} /> {mutation.isLoading ? 'Saving...' : isReady ? 'Save Changes' : 'Save & Ready'}
             </button>
          )}

          {isDone && (
            <button onClick={() => window.print()} className="btn btn-ghost border-slate-200 rounded-xl text-slate-600">
              <Printer size={18} /> Print
            </button>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <div className="w-full bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-4 shadow-sm overflow-x-auto">
        <ul className="steps w-full">
          {pipeline.map((step, index) => {
             const isActive = pipeline.indexOf(status) >= index;
             return (
                <li 
                  key={step} 
                  className={`step ${isActive ? 'step-neutral text-slate-900 font-black' : 'text-slate-400'}`}
                  data-content={isActive ? '✓' : '●'}
                >
                  {step}
                </li>
             );
          })}
        </ul>
      </div>

      {/* Form Body */}
      <div className="card bg-white/80 backdrop-blur-xl shadow-xl border border-white/60 rounded-3xl overflow-visible">
        <div className="card-body p-8">
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Col: LOCATIONS */}
            <div className="space-y-4">
              
              {/* Source Location */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-slate-500">
                   {type === 'RECEIPT' ? 'Receive From (Vendor)' : 'Ship From (Warehouse)'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select 
                    className={`${inputClass} pl-10`}
                    value={formData.sourceLocation}
                    onChange={e => setFormData({...formData, sourceLocation: e.target.value})}
                    disabled={isDone}
                  >
                    <option value="" disabled>Select Source...</option>
                    {(type === 'RECEIPT' ? partners : warehouses).map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination Location */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-slate-500">
                   {type === 'RECEIPT' ? 'Destination (Warehouse)' : 'Deliver To (Customer)'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select 
                    className={`${inputClass} pl-10`}
                    value={formData.destinationLocation}
                    onChange={e => setFormData({...formData, destinationLocation: e.target.value})}
                    disabled={isDone}
                  >
                    <option value="" disabled>Select Destination...</option>
                    {(type === 'RECEIPT' ? warehouses : partners).map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col: DETAILS */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-slate-500">Schedule Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    className={`${inputClass} pl-10`}
                    value={formData.scheduleDate}
                    onChange={e => setFormData({...formData, scheduleDate: e.target.value})}
                    disabled={isDone}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label text-xs font-bold uppercase text-slate-500">Responsible</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input 
                    type="text" 
                    value={user?.name || "Admin"} 
                    className={`${inputClass} pl-10 bg-slate-100 text-slate-500 border-transparent`}
                    disabled 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="divider opacity-50"></div>

          <h3 className="font-black text-xl text-slate-800 mb-4">Products</h3>
          
          <div className="overflow-hidden bg-white/50 rounded-2xl border border-slate-200/60">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 border-b border-slate-200">
                  <th className="w-[50%] text-xs uppercase font-bold tracking-wider py-4 pl-6">Product</th>
                  <th className="w-[30%] text-xs uppercase font-bold tracking-wider py-4">Quantity</th>
                  <th className="w-[10%]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="group border-b border-slate-100 last:border-none even:bg-slate-50/80 hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 pl-6">
                      <select 
                        className="select select-bordered w-full bg-white border-slate-300 text-slate-900 font-bold focus:border-slate-800 rounded-xl h-12"
                        value={item.product}
                        onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                        disabled={isDone}
                      >
                        <option value="" disabled>Select Product...</option>
                        {products?.map(p => (
                          <option key={p._id} value={p._id}>[{p.sku}] {p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        min="1"
                        placeholder="0"
                        className="input input-bordered w-full bg-white border-slate-300 text-slate-900 font-bold focus:border-slate-800 rounded-xl h-12"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                        disabled={isDone}
                      />
                    </td>
                    <td className="p-4 text-right pr-6">
                      {!isDone && items.length > 1 && (
                        <button 
                          onClick={() => handleRemoveItem(idx)} 
                          className="btn btn-ghost btn-square btn-sm text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!isDone && (
            <button 
              onClick={handleAddItem} 
              className="btn btn-ghost gap-2 text-blue-600 hover:bg-blue-50 mt-4 rounded-xl font-bold w-full border-2 border-dashed border-blue-100 hover:border-blue-200"
            >
              <Plus size={18} /> Add Product Line
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default OperationForm;