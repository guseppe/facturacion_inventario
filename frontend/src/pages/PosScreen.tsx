import { usePosStore } from '../store/posStore';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PosScreen() {
  const { products, cart, total, addToCart, removeFromCart, updateQuantity } = usePosStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Product Catalog Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
            <p className="text-gray-500 text-sm">Papelería Creativa RD</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por SKU o Nombre..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary hover:shadow-md transition-all text-left flex flex-col justify-between h-32 active:scale-[0.98]"
              >
                <div>
                  <span className="text-xs font-semibold text-gray-400 mb-1 block">{product.sku}</span>
                  <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    Stock: {product.stock_quantity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <ShoppingCart className="text-primary" size={24} />
          <h2 className="text-lg font-bold text-gray-800">Orden Actual</h2>
          <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} ítems
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-20" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                  <div className="text-primary font-semibold text-sm mt-1">{formatCurrency(item.price)}</div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                      className="p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-4 text-center font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:bg-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Total & Actions */}
        <div className="p-5 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-800">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold text-gray-800">Total a Pagar</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button 
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Banknote size={20} />
              Efectivo
            </button>
            <button 
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard size={20} />
              Transferencia
            </button>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => navigate('/invoice')}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Cobrar Orden
          </button>
        </div>
      </div>
    </div>
  );
}
