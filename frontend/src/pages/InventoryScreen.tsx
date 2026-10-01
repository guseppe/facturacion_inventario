import { usePosStore } from '../store/posStore';
import { Package, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function InventoryScreen() {
  const { products } = usePosStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Package className="text-primary" /> Inventario
            </h1>
            <p className="text-gray-500 mt-1">Gestión de productos y existencias</p>
          </div>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Nuevo Producto
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="text-sm text-gray-500">
              Mostrando {products.length} productos
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-4 px-6 font-medium">SKU</th>
                <th className="py-4 px-6 font-medium">Nombre del Producto</th>
                <th className="py-4 px-6 font-medium">Precio</th>
                <th className="py-4 px-6 font-medium text-center">Stock</th>
                <th className="py-4 px-6 font-medium text-center">Estado</th>
                <th className="py-4 px-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-500">{product.sku}</td>
                  <td className="py-4 px-6 font-medium text-gray-800">{product.name}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(product.price)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-xs font-medium">Activo</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
