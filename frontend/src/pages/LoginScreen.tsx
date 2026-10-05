import { useState } from 'react';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await window.api.login({ username, password });
      if (result.success) {
        login(result.data);
        navigate('/');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-primary/10 p-8 flex flex-col items-center justify-center text-primary">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Store size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">Papelería Creativa RD</h1>
          <p className="text-sm font-medium mt-1">Detalles que inspiran</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-3 mt-6 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/30"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
