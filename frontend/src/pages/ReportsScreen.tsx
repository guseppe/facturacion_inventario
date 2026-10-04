import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { DollarSign, TrendingUp, AlertTriangle, Activity, PackageX } from 'lucide-react';

export default function ReportsScreen() {
  const isAdmin = useAuthStore(state => state.isAdmin());
  
  const [metrics, setMetrics] = useState({ todaySales: 0, todayTransactions: 0, monthSales: 0 });
  const [pl, setPl] = useState({ totalSales: 0, totalCogs: 0, grossProfit: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      const mRes = await window.api.getDashboardMetrics();
      if (mRes.success) setMetrics(mRes.data);

      if (isAdmin) {
        const plRes = await window.api.getProfitAndLoss(dateRange);
        if (plRes.success) setPl(plRes.data);
      }

      const aRes = await window.api.getLowStockAlerts();
      if (aRes.success) setAlerts(aRes.data);

    } catch (error) {
      console.error('Error loading reports', error);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <Activity className="mr-3 text-primary" size={32} />
        Dashboard y Reportes
      </h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
          <div className="bg-green-100 p-4 rounded-xl text-green-600 mr-5">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ventas de Hoy</p>
            <h3 className="text-2xl font-bold text-gray-800">${metrics.todaySales.toFixed(2)}</h3>
            <p className="text-xs text-gray-400 mt-1">{metrics.todayTransactions} transacciones</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600 mr-5">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ventas del Mes</p>
            <h3 className="text-2xl font-bold text-gray-800">${metrics.monthSales.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
          <div className="bg-orange-100 p-4 rounded-xl text-orange-600 mr-5">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertas de Stock</p>
            <h3 className="text-2xl font-bold text-gray-800">{alerts.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Productos por agotarse</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* P&L Section (Admin Only) */}
        {isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                Ganancias y Pérdidas (P&L)
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                  <input 
                    type="date" 
                    value={dateRange.startDate}
                    onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                  <input 
                    type="date" 
                    value={dateRange.endDate}
                    onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Ingresos por Ventas</span>
                  <span className="font-bold text-gray-800">${pl.totalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-600 font-medium">Costo de Bienes (COGS)</span>
                  <span className="font-bold text-red-700">-${pl.totalCogs.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl mt-4">
                  <span className="text-primary-dark font-bold text-lg">Ganancia Bruta</span>
                  <span className="font-bold text-2xl text-primary-dark">${pl.grossProfit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 flex items-center text-orange-600">
              <PackageX className="mr-2" size={24} />
              Productos con Bajo Stock
            </h2>
          </div>
          <div className="p-0 overflow-auto flex-1">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay alertas de stock bajo.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500">Producto</th>
                    <th className="px-6 py-3 font-medium text-gray-500">SKU</th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Stock Actual</th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Mínimo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alerts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                      <td className="px-6 py-4 text-gray-500">{p.sku}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-orange-600">{p.stockQuantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">{p.minStockAlert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
