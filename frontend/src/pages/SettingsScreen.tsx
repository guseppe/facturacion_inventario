import { Settings, Save, Store, Image, Palette, MapPin, Phone } from 'lucide-react';

export default function SettingsScreen() {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="text-primary" /> Configuración
            </h1>
            <p className="text-gray-500 mt-1">Ajustes generales del negocio</p>
          </div>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
            <Save size={20} />
            Guardar Cambios
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Branding */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-32 h-32 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg overflow-hidden">
                <Store size={48} className="text-primary opacity-50" />
                {/* Mock Logo Space */}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Logo del Negocio</h3>
              <p className="text-xs text-gray-500 mb-4">Recomendado: PNG 512x512px</p>
              <button className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Image size={16} /> Subir Logo
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette size={16} /> Color Principal
                </h4>
                <div className="flex gap-2 justify-center">
                  <div className="w-8 h-8 rounded-full bg-pink-500 ring-2 ring-offset-2 ring-pink-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información de la Empresa</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                    <input type="text" defaultValue="Papelería Creativa RD" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RNC / Cédula</label>
                    <input type="text" defaultValue="096-0031356-4" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> Dirección</label>
                  <input type="text" defaultValue="Santiago" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={14} /> Teléfono</label>
                    <input type="text" defaultValue="(809) 555-0123" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none">
                      <option value="DOP">DOP (RD$)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información de Pago (Facturas)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <input type="text" defaultValue="BANCO POPULAR" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                    <input type="text" defaultValue="813299211" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                    <input type="text" defaultValue="RAIDY D DURAN MARTINEZ" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pie de Página (Factura)</label>
                  <textarea rows={2} defaultValue="Gracias por su compra. ¡Vuelva pronto!" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
