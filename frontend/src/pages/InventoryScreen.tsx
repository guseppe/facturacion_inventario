import { usePosStore } from '../store/posStore';
import { Package, Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InventoryScreen() {
  const { products, loadProducts } = usePosStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', cost: '', stockQuantity: '', location: '' });

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

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', price: '', cost: '', stockQuantity: '', location: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, 
      sku: product.sku, 
      price: product.price.toString(), 
      cost: product.cost.toString(), 
      stockQuantity: product.stockQuantity.toString(),
      location: product.location || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price || '0'),
      cost: parseFloat(formData.cost || '0'),
      stockQuantity: parseInt(formData.stockQuantity || '0', 10),
      location: formData.location || null,
      minStockAlert: 5,
      isActive: true
    };

    const res = editingId 
      ? await window.api.updateProduct(editingId, productData)
      : await window.api.createProduct(productData);

    if (res.success) {
      loadProducts();
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', price: '', cost: '', stockQuantity: '', location: '' });
    } else {
      alert(`Error ${editingId ? 'editando' : 'creando'} producto: ` + res.error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      const res = await window.api.deleteProduct(id);
      if (res.success) {
        loadProducts();
      } else {
        alert('Error eliminando producto: ' + res.error);
      }
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50 relative">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Package className="text-primary" /> Inventario
            </h1>
            <p className="text-gray-500 mt-1">Gestión de productos y existencias</p>
          </div>
          <button onClick={handleOpenCreate} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500">
              Mostrando {filteredProducts.length} productos
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-4 px-6 font-medium">SKU</th>
                <th className="py-4 px-6 font-medium">Nombre del Producto</th>
                <th className="py-4 px-6 font-medium">Ubicación</th>
                <th className="py-4 px-6 font-medium">Precio</th>
                <th className="py-4 px-6 font-medium text-center">Stock</th>
                <th className="py-4 px-6 font-medium text-center">Estado</th>
                <th className="py-4 px-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-500">{product.sku}</td>
                  <td className="py-4 px-6 font-medium text-gray-800">{product.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{product.location || '-'}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(product.price)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stockQuantity > product.minStockAlert ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-xs font-medium">Activo</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(product)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* Modal Agregar/Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                  <input required type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                  <input required type="number" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (Opcional)</label>
                  <input type="text" placeholder="Ej. Estante A3" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-medium shadow-md shadow-primary/20 transition-colors">{editingId ? 'Actualizar Producto' : 'Guardar Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
