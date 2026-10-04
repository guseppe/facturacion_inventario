import { FileText, Search, Plus, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const result = await window.api.getQuotes();
      if (result.success) {
        setQuotes(result.data);
      }
    } catch (error) {
      console.error("Error loading quotes:", error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await window.api.updateQuoteStatus(id, newStatus);
    if (res.success) {
      loadQuotes();
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          quote.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos los estados' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="text-primary" /> Cotizaciones
            </h1>
            <p className="text-gray-500 mt-1">Gestión de presupuestos y cotizaciones</p>
          </div>
          <button onClick={() => navigate('/')} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Nueva Cotización
          </button>
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
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 text-sm rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option>Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="APPROVED">Aprobada</option>
                <option value="REJECTED">Rechazada</option>
              </select>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-4 px-6 font-medium">N° Cotización</th>
                <th className="py-4 px-6 font-medium">Cliente</th>
                <th className="py-4 px-6 font-medium">Fecha</th>
                <th className="py-4 px-6 font-medium">Total</th>
                <th className="py-4 px-6 font-medium text-center">Estado</th>
                <th className="py-4 px-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-800">{quote.quoteNumber}</td>
                  <td className="py-4 px-6 font-medium text-gray-600">{quote.clientName}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{new Date(quote.date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(quote.totalAmount)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${quote.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {quote.status === 'APPROVED' ? 'Aprobada' : quote.status === 'PENDING' ? 'Pendiente' : 'Rechazada'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {quote.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleUpdateStatus(quote.id, 'APPROVED')} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Aprobar">
                            Aprobar
                          </button>
                          <button onClick={() => handleUpdateStatus(quote.id, 'REJECTED')} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Rechazar">
                            Rechazar
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => navigate('/invoice', { 
                          state: { 
                            invoiceNumber: quote.quoteNumber, 
                            clientName: quote.clientName, 
                            clientAddress: quote.clientAddress,
                            items: quote.items,
                            total: quote.totalAmount
                          } 
                        })}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                        title="Ver/Imprimir"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No se encontraron cotizaciones.
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
