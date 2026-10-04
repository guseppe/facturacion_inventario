import { usePosStore } from '../store/posStore';
import { Package, Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InventoryScreen() {
  const { products, loadProducts } = usePosStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { 
    name: '', sku: '', price: '', cost: '', stockQuantity: '', 
    location: '', type: 'STANDARD', manageStock: true, recipes: [] as any[] 
  };
  const [formData, setFormData] = useState(initialForm);

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
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, 
      sku: product.sku, 
      price: product.price.toString(), 
      cost: product.cost.toString(), 
      stockQuantity: product.stockQuantity?.toString() || '0',
      location: product.location || '',
      type: product.type || 'STANDARD',
      manageStock: product.manageStock ?? true,
      recipes: product.recipes || []
    });
    setIsModalOpen(true);
  };

  const handleRecipeAdd = () => {
    setFormData(prev => ({
      ...prev,
      recipes: [...prev.recipes, { componentProductId: '', quantity: 1 }]
    }));
  };

  const handleRecipeChange = (index: number, field: string, value: any) => {
    const newRecipes = [...formData.recipes];
    newRecipes[index] = { ...newRecipes[index], [field]: value };
    setFormData({ ...formData, recipes: newRecipes });
  };

  const handleRecipeRemove = (index: number) => {
    const newRecipes = formData.recipes.filter((_, i) => i !== index);
    setFormData({ ...formData, recipes: newRecipes });
  };

  // Dynamic cost calculation for COMPOSITE
  const dynamicCost = formData.type === 'COMPOSITE' 
    ? formData.recipes.reduce((sum, r) => {
        const comp = products.find(p => p.id === r.componentProductId);
        return sum + ((comp?.cost || 0) * (parseFloat(r.quantity) || 0));
      }, 0)
    : parseFloat(formData.cost || '0');

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      sku: formData.sku,
      type: formData.type,
      manageStock: formData.type === 'SERVICE' ? false : formData.manageStock,
      price: parseFloat(formData.price || '0'),
      cost: formData.type === 'COMPOSITE' ? dynamicCost : parseFloat(formData.cost || '0'),
      stockQuantity: parseFloat(formData.stockQuantity || '0'),
      location: formData.location || null,
      minStockAlert: 5,
      isActive: true,
      recipes: formData.type === 'COMPOSITE' ? formData.recipes.map(r => ({
        ...r,
        quantity: parseFloat(r.quantity)
      })) : []
    };

    const res = editingId 
      ? await window.api.updateProduct(editingId, productData)
      : await window.api.createProduct(productData);

    if (res.success) {
      loadProducts();
      setIsModalOpen(false);
      setFormData(initialForm);
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
                <th className="py-4 px-6 font-medium">Nombre</th>
                <th className="py-4 px-6 font-medium">Tipo</th>
                <th className="py-4 px-6 font-medium">Precio</th>
                <th className="py-4 px-6 font-medium">Costo</th>
                <th className="py-4 px-6 font-medium text-center">Stock</th>
                <th className="py-4 px-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-500">{product.sku}</td>
                  <td className="py-4 px-6 font-medium text-gray-800">{product.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{product.type}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(product.price)}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{formatCurrency(product.cost)}</td>
                  <td className="py-4 px-6 text-center">
                    {product.type === 'SERVICE' ? (
                      <span className="text-gray-400 text-sm">N/A</span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stockQuantity > product.minStockAlert ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stockQuantity}
                      </span>
                    )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-2xl p-6 w-[700px] shadow-2xl relative my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white">
                    <option value="STANDARD">Estándar (Producto Regular)</option>
                    <option value="MATERIAL">Insumo (Materia Prima)</option>
                    <option value="SERVICE">Servicio (Sin Stock)</option>
                    <option value="COMPOSITE">Compuesto (Con Receta/BOM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
              </div>

              {formData.type === 'COMPOSITE' && (
                <div className="border border-indigo-100 bg-indigo-50/30 p-4 rounded-xl mt-4">
                  <h3 className="font-semibold text-indigo-900 mb-3 text-sm uppercase tracking-wider">Receta de Producción (BOM)</h3>
                  
                  {formData.recipes.map((recipe, idx) => (
                    <div key={idx} className="flex gap-2 mb-2 items-center">
                      <select required value={recipe.componentProductId} onChange={e => handleRecipeChange(idx, 'componentProductId', e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                        <option value="">Selecciona un insumo...</option>
                        {products.filter(p => p.type !== 'COMPOSITE').map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Costo: {formatCurrency(p.cost)}</option>
                        ))}
                      </select>
                      <input required type="number" step="0.01" min="0.01" placeholder="Cant." value={recipe.quantity} onChange={e => handleRecipeChange(idx, 'quantity', e.target.value)} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                      <button type="button" onClick={() => handleRecipeRemove(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  
                  <button type="button" onClick={handleRecipeAdd} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-2">
                    <Plus size={16} /> Agregar Componente
                  </button>

                  <div className="mt-4 pt-3 border-t border-indigo-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Costo Sugerido:</span>
                    <span className="text-lg font-bold text-indigo-700">{formatCurrency(dynamicCost)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario</label>
                  {formData.type === 'COMPOSITE' ? (
                    <input disabled type="text" value={formatCurrency(dynamicCost)} className="w-full px-4 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" />
                  ) : (
                    <input required type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  )}
                </div>
              </div>

              {formData.type !== 'SERVICE' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                    <input required type="number" step="0.01" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (Opcional)</label>
                    <input type="text" placeholder="Ej. Estante A3" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
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
