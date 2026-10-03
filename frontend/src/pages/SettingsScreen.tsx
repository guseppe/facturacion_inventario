import { Settings, Save, Store, Image, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    name: '',
    currency: 'DOP',
    receiptFooterText: '',
    primaryColor: '#ec4899',
    address: '',
    bankName: '',
    bankAccount: '',
    ownerName: '',
    ownerId: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const res = await window.api.getStoreSettings();
      if (res.success && res.data) {
        setSettings({
          name: res.data.name || '',
          currency: res.data.currency || 'DOP',
          receiptFooterText: res.data.receiptFooterText || '',
          primaryColor: res.data.primaryColor || '#ec4899',
          address: res.data.address || '',
          bankName: res.data.bankName || '',
          bankAccount: res.data.bankAccount || '',
          ownerName: res.data.ownerName || '',
          ownerId: res.data.ownerId || ''
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    const res = await window.api.updateStoreSettings({
      name: settings.name,
      currency: settings.currency,
      receiptFooterText: settings.receiptFooterText,
      primaryColor: settings.primaryColor,
      address: settings.address,
      bankName: settings.bankName,
      bankAccount: settings.bankAccount,
      ownerName: settings.ownerName,
      ownerId: settings.ownerId
    });
    if (res.success) {
      alert('Configuración guardada exitosamente');
    } else {
      alert('Error guardando: ' + res.error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return <div className="p-8">Cargando configuración...</div>;

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
          <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium shadow-md shadow-primary/20 flex items-center gap-2 transition-colors">
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
                  <div className="w-8 h-8 rounded-full bg-pink-500 ring-2 ring-offset-2 ring-pink-500 cursor-pointer" onClick={() => setSettings(p => ({...p, primaryColor: '#ec4899'}))}></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer" onClick={() => setSettings(p => ({...p, primaryColor: '#a855f7'}))}></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer" onClick={() => setSettings(p => ({...p, primaryColor: '#3b82f6'}))}></div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer" onClick={() => setSettings(p => ({...p, primaryColor: '#10b981'}))}></div>
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
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                    <input type="text" name="name" value={settings.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del Negocio</label>
                    <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select name="currency" value={settings.currency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none">
                      <option value="DOP">DOP (RD$)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Información de Pago y Facturación</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Banco</label>
                    <input type="text" name="bankName" value={settings.bankName} placeholder="Ej. BANCO POPULAR" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Bancaria</label>
                    <input type="text" name="bankAccount" value={settings.bankAccount} placeholder="Ej. Cuenta 813299211" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Titular (Firma)</label>
                    <input type="text" name="ownerName" value={settings.ownerName} placeholder="Ej. RAIDY D DURAN" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cédula o RNC</label>
                    <input type="text" name="ownerId" value={settings.ownerId} placeholder="Ej. 096-0000000-0" onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pie de Página (Eslogan)</label>
                  <textarea rows={2} name="receiptFooterText" value={settings.receiptFooterText} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
