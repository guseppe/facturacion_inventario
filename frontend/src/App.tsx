import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PosScreen from './pages/PosScreen';
import InventoryScreen from './pages/InventoryScreen';
import SettingsScreen from './pages/SettingsScreen';
import LoginScreen from './pages/LoginScreen';
import QuotesScreen from './pages/QuotesScreen';
import InvoiceScreen from './pages/InvoiceScreen';
import HistoryScreen from './pages/HistoryScreen';
import { Store, LayoutDashboard, Package, Settings, FileText, Receipt, LogOut, Activity } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isPrintView = location.pathname.includes('/invoice') || location.pathname === '/login';

  if (isPrintView) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm z-10">
        <div className="bg-primary/10 p-3 rounded-xl mb-8 text-primary">
          <Store size={28} />
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 w-full px-3">
          <Link to="/" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Punto de Venta">
            <LayoutDashboard size={24} />
          </Link>
          <Link to="/inventory" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/inventory' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Inventario">
            <Package size={24} />
          </Link>
          <Link to="/reports" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/reports' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Reportes">
            <Activity size={24} />
          </Link>
          <Link to="/quotes" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/quotes' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Cotizaciones">
            <FileText size={24} />
          </Link>
          <Link to="/history" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/history' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Historial de Ventas">
            <Receipt size={24} />
          </Link>
          <Link to="/settings" className={`p-3 rounded-xl flex justify-center transition-colors ${location.pathname === '/settings' ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary hover:bg-primary/5'}`} title="Configuración">
            <Settings size={24} />
          </Link>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-100 w-full px-3">
          <Link 
            to="/login"
            onClick={() => {
              useAuthStore.getState().logout();
              window.api.logout();
            }}
            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex justify-center w-full" 
            title="Cerrar Sesión"
          >
            <LogOut size={24} />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {children}
      </main>
    </div>
  );
}

import { useEffect } from 'react';
import ReportsScreen from './pages/ReportsScreen';
import { useAuthStore } from './store/authStore';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await window.api.getStoreSettings();
        if (res.success && res.data && res.data.primaryColor) {
          document.documentElement.style.setProperty('--color-primary', res.data.primaryColor);
          document.documentElement.style.setProperty('--color-primary-dark', `color-mix(in srgb, ${res.data.primaryColor} 80%, black)`);
        }
      } catch (e) {
        console.error("Error loading theme", e);
      }
    }
    loadTheme();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<ProtectedRoute><PosScreen /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryScreen /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsScreen /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
          <Route path="/quotes" element={<ProtectedRoute><QuotesScreen /></ProtectedRoute>} />
          <Route path="/invoice" element={<ProtectedRoute><InvoiceScreen /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
