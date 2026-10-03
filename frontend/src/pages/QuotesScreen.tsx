import { FileText, Search, Plus, Eye, Download, Send } from 'lucide-react';

export default function QuotesScreen() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(amount);
  };

  const mockQuotes = [
    { id: 'COT-001', client: 'Empresa XYZ', date: '25/09/2026', total: 4500, status: 'Pendiente' },
    { id: 'COT-002', client: 'Juan Pérez', date: '26/09/2026', total: 1200, status: 'Aprobada' },
    { id: 'COT-003', client: 'María Gómez', date: '28/09/2026', total: 8500, status: 'Borrador' },
  ];

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
          <button onClick={() => alert('Módulo de Cotizaciones estará disponible en la Fase 4.')} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
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
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-2">
              <select className="border border-gray-200 text-sm rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Todos los estados</option>
                <option>Pendiente</option>
                <option>Aprobada</option>
                <option>Borrador</option>
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
              {mockQuotes.map((quote) => (
                <tr key={quote.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-800">{quote.id}</td>
                  <td className="py-4 px-6 font-medium text-gray-600">{quote.client}</td>
                  <td className="py-4 px-6 text-gray-500 text-sm">{quote.date}</td>
                  <td className="py-4 px-6 font-medium text-primary">{formatCurrency(quote.total)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                      ${quote.status === 'Aprobada' ? 'bg-green-100 text-green-700' : 
                        quote.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => alert('Módulo de Cotizaciones estará disponible en la Fase 4.')} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => alert('Módulo de Cotizaciones estará disponible en la Fase 4.')} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Descargar PDF">
                        <Download size={16} />
                      </button>
                      <button onClick={() => alert('Módulo de Cotizaciones estará disponible en la Fase 4.')} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Enviar por Email">
                        <Send size={16} />
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
