import { NavLink, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, Package, ArrowRightLeft, History, Settings, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Menu size={18} /> },
    { name: 'Receipts', path: '/operations/receipts', icon: <Package size={18} /> },
    { name: 'Deliveries', path: '/operations/deliveries', icon: <ArrowRightLeft size={18} /> },
    { name: 'Stock', path: '/stock', icon: <Package size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    // UPDATED: Stronger Glass Effect + White Border
    <div className="sticky top-4 z-50 w-[95%] mx-auto rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-lg shadow-slate-200/50 transition-all duration-300">
      <div className="px-4">
        <div className="navbar min-h-[3.5rem] px-0">
          
          {/* Mobile Menu */}
          <div className="navbar-start lg:hidden">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-slate-600">
                <Menu size={24} />
              </div>
              <ul tabIndex={0} className="menu menu-lg dropdown-content mt-3 z-[1] w-52 rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl p-2 shadow-2xl">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink to={item.path} className={({ isActive }) => isActive ? "active text-primary font-bold" : "text-slate-600"}>
                      {item.icon} {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Logo */}
          <div className="navbar-start hidden lg:flex lg:w-auto">
            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-800 hover:opacity-80 transition-opacity px-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Package size={18} />
              </div>
              StockMaster
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 px-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border border-transparent font-medium
                      ${isActive 
                        ? "bg-white shadow-md text-primary border-white/50 ring-1 ring-slate-100" 
                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Profile */}
          <div className="navbar-end gap-2">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm h-10 rounded-full pr-4 pl-1 hover:bg-white/50 border border-transparent hover:border-white/50 transition-all">
                <div className="avatar placeholder">
                  <div className="w-8 rounded-full bg-slate-800 text-white">
                    <span className="text-xs font-bold">{user?.name?.charAt(0) || "U"}</span>
                  </div>
                </div>
                <div className="hidden flex-col items-start text-xs md:flex ml-2">
                  <span className="font-bold text-slate-800">{user?.name || "User"}</span>
                  <span className="text-slate-500">{user?.role || "Staff"}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400 ml-2" />
              </div>
              <ul tabIndex={0} className="menu dropdown-content mt-3 w-48 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-2 shadow-2xl">
                <li className="menu-title px-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-wider">Account</li>
                <li>
                  <button onClick={logout} className="text-error hover:bg-error/10 font-medium rounded-lg">
                    <LogOut size={16} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Navbar;