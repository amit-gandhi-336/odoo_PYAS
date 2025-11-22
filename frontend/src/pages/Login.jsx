import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Package, Lock, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ loginId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Login ID or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden font-sans">
      
      {/* --- COLORFUL DEPTH (Matches Dashboard Cards) --- */}
      {/* Emerald Gradient (Matches Receipts) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse mix-blend-multiply"></div>
      {/* Rose Gradient (Matches Deliveries) */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px] animate-pulse delay-1000 mix-blend-multiply"></div>
      
      {/* --- GLASS CARD --- */}
      <div className="card w-full max-w-[400px] bg-white/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 z-10 m-4 rounded-3xl relative">
        
        {/* Top Colored Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-rose-400"></div>

        <div className="card-body p-9">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Package size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">StockMaster</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Inventory Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Login ID */}
            <div className="form-control space-y-1.5">
              <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Login ID</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  name="loginId"
                  placeholder="admin123"
                  className="input w-full pl-4 bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-300"
                  value={formData.loginId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control space-y-1.5">
              <div className="flex justify-between">
                <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input w-full pl-4 bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal placeholder:text-slate-300"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Colorful Gradient Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none rounded-xl mt-4 h-11 shadow-lg shadow-blue-600/20 transition-transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
            </button>

          </form>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-600 font-bold hover:underline decoration-2 decoration-blue-200 underline-offset-2">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;