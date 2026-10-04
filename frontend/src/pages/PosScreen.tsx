import { usePosStore } from '../store/posStore';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PosScreen() {
  const { products, cart, total, addToCart, removeFromCart, updateQuantity, loadProducts, clearCart } = usePosStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      }));

      const response = await window.api.createInvoice({
        items,
        paymentMethod,
        totalAmount: total,
        clientName: clientName || 'Cliente Mostrador',
        clientAddress: clientAddress || ''
      });

      if (response.success) {
        // alert('Factura creada exitosamente');
        loadProducts(); // Reload stock
        navigate('/invoice', { state: { invoiceNumber: response.data?.invoiceNumber, clientName: clientName || 'Cliente Mostrador', clientAddress: clientAddress || '' } }); // Navigate with state
      } else {
        alert('Error al procesar el cobro: ' + response.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuote = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const items = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      }));
      
      const result = await window.api.createQuote({
        items,
        totalAmount: total,
        clientName: clientName || 'Cliente Mostrador',
        clientAddress: clientAddress || ''
      });

      if (result.success) {
        clearCart();
        setClientName('');
        setClientAddress('');
        navigate('/quotes');
      } else {
        alert('Error al guardar cotización: ' + result.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Product Catalog Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
            <p className="text-gray-500 text-sm">Caja Activa</p>
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
            {filteredProducts.map((product) => {
              const isOutOfStock = product.manageStock && product.stockQuantity <= 0;
              return (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`bg-white p-4 rounded-xl shadow-sm border ${!isOutOfStock ? 'border-gray-100 hover:border-primary hover:shadow-md' : 'border-red-200 opacity-50'} transition-all text-left flex flex-col justify-between h-32 active:scale-[0.98]`}
                >
                  <div>
                    <span className="text-xs font-semibold text-gray-400 mb-1 block">{product.sku}</span>
                    <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                    {product.manageStock ? (
                      <span className={`text-xs px-2 py-1 rounded-md ${product.stockQuantity <= product.minStockAlert ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                        Stock: {product.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                        {product.type === 'SERVICE' ? 'Servicio' : 'Ilimitado'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
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
                      disabled={item.manageStock && item.quantity >= item.stockQuantity}
                      className="p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
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
          <div className="mb-6 space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Nombre del Cliente (Opcional)" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Dirección del Cliente (Opcional)" 
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>
          </div>

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
              onClick={() => setPaymentMethod('CASH')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'CASH' ? 'bg-primary/10 text-primary border-primary border' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Banknote size={20} />
              Efectivo
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'TRANSFER' ? 'bg-primary/10 text-primary border-primary border' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <CreditCard size={20} />
              Transferencia
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleQuote}
              className="w-1/3 py-3 bg-white text-primary border border-primary hover:bg-primary/5 rounded-xl font-bold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              Cotizar
            </button>
            <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-2/3 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Procesando...' : 'Cobrar Orden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
