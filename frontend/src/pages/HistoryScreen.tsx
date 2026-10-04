import { Receipt, Search, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HistoryScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const result = await window.api.getInvoices();
      if (result.success) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Receipt className="text-primary" /> Historial de Ventas
            </h1>
            <p className="text-gray-500 mt-1">Órdenes pasadas y reimpresión de recibos</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente o N°..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-4 px-6 font-medium">N° Orden</th>
                <th className="py-4 px-6 font-medium">Cliente</th>
                <th className="py-4 px-6 font-medium">Fecha</th>
                <th className="py-4 px-6 font-medium">Método</th>
                <th className="py-4 px-6 font-medium">Total</th>
                <th className="py-4 px-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-800">{inv.invoiceNumber}</td>
                  <td className="py-4 px-6 font-medium text-gray-600">{inv.clientName}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-500">{inv.paymentMethod}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate('/invoice', { 
                          state: { 
                            invoiceNumber: inv.invoiceNumber, 
                            clientName: inv.clientName, 
                            clientAddress: inv.clientAddress,
                            items: inv.items,
                            total: inv.totalAmount
                          } 
                        })}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                        title="Ver/Reimprimir"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No se encontraron órdenes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
