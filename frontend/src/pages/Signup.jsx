import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, User, Mail, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    loginId: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const res = await api.post('/auth/register', submitData);
      login(res.data);
      toast.success("Account created!");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden font-sans py-10">
      
      {/* --- COLORFUL DEPTH --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px] animate-pulse mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse delay-1000 mix-blend-multiply"></div>

      <div className="card w-full max-w-lg bg-white/80 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 z-10 m-4 rounded-3xl relative">
        
        {/* Top Colored Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-blue-500 to-emerald-400"></div>

        <div className="card-body p-8 md:p-10">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Join StockMaster today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Name */}
            <div className="form-control space-y-1">
              <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <input type="text" name="name" placeholder="John Doe" className=" pl-4 input w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal" onChange={handleChange} required />
            </div>

            {/* Email */}
            <div className="form-control space-y-1">
              <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
              <div className="relative group">
                
                <input type="email" name="email" placeholder="john@example.com" className="input w-full pl-4 bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal" onChange={handleChange} required />
              </div>
            </div>

            {/* Login ID */}
            <div className="form-control space-y-1">
              <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">
                Login ID <span className="text-slate-400 lowercase font-normal ml-1">(6-12 chars)</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input type="text" name="loginId" placeholder="johndoe123" className="input w-full pl-4 bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal" onChange={handleChange} required />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control space-y-1">
                <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input type="password" name="password" placeholder="••••••••" className="input w-full pl-4 bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal" onChange={handleChange} required />
                </div>
              </div>
              <div className="form-control space-y-1">
                <label className="label pl-0 text-xs font-bold uppercase tracking-wider text-slate-500">Confirm</label>
                <input type="password" name="confirmPassword" placeholder="••••••••" className=" pl-4 input w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-slate-800 font-bold text-sm h-11 shadow-sm transition-all placeholder:font-normal" onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none rounded-xl mt-4 h-11 shadow-lg shadow-blue-600/20 transition-transform active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign Up"}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-slate-500 font-medium">
            Already a member? <Link to="/login" className="text-emerald-600 font-bold hover:underline decoration-2 decoration-blue-200 underline-offset-2">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;