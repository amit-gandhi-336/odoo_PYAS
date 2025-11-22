import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import OperationForm from './pages/OperationForm';
import Stock from './pages/Stock';
import History from './pages/History';

// --- 1. PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// --- 2. APP LAYOUT COMPONENT ---
const Layout = () => {
  return (
    // UPDATED: Added a gradient background
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-base-content selection:bg-primary selection:text-white">
      
      {/* Decorative Background Blobs for depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      <main className="container mx-auto p-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

// --- 3. TEMPORARY PLACEHOLDERS (Until we build these pages) ---
const Operations = () => <div className="hero min-h-[50vh]"><div className="hero-content text-center"><h1 className="text-3xl font-bold">Operations List (Coming Soon)</h1></div></div>;
const Settings = () => <div className="hero min-h-[50vh]"><div className="hero-content text-center"><h1 className="text-3xl font-bold">Settings (Coming Soon)</h1></div></div>;

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* PRIVATE ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Operations Dropdown Routes */}
          <Route path="/operations/receipts" element={<Receipts />} />
          <Route path="/operations/deliveries" element={<Deliveries />} />

          <Route path="/operations/create" element={<OperationForm />} />
          <Route path="/operations/:id" element={<OperationForm />} />
          
          <Route path="/stock" element={<Stock />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Catch all - Redirect to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;