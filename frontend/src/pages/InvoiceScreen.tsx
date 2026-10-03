import { usePosStore } from '../store/posStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function InvoiceScreen() {
  const { cart, total, clearCart } = usePosStore();
  const navigate = useNavigate();
  const location = useLocation();
  const clientName = location.state?.clientName || 'Cliente Mostrador';
  const clientAddress = location.state?.clientAddress || '';
  const invoiceNumber = location.state?.invoiceNumber || '';

  const [settings, setSettings] = useState({
    name: 'PAPELERÍA_CREATIVARD',
    receiptFooterText: 'Detalles que inspiran',
    currency: 'DOP',
    address: 'Av. Ejemplo, Santiago',
    bankName: 'BANCO POPULAR',
    bankAccount: 'Cuenta 813299211',
    ownerName: 'RAIDY D DURAN',
    ownerId: '096-0000000-0'
  });

  useEffect(() => {
    async function fetchSettings() {
      const res = await window.api.getStoreSettings();
      if (res.success && res.data) {
        setSettings({
          name: res.data.name || 'PAPELERÍA_CREATIVARD',
          receiptFooterText: res.data.receiptFooterText || 'Detalles que inspiran',
          currency: res.data.currency || 'DOP',
          address: res.data.address || 'Av. Ejemplo, Santiago',
          bankName: res.data.bankName || 'BANCO POPULAR',
          bankAccount: res.data.bankAccount || 'Cuenta 813299211',
          ownerName: res.data.ownerName || 'RAIDY D DURAN',
          ownerId: res.data.ownerId || '096-0000000-0'
        });
      }
    }
    fetchSettings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: settings.currency }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    clearCart();
    navigate('/');
  };

  const dateStr = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 flex flex-col items-center">
      {/* Controls - Hidden on print */}
      <div className="w-full max-w-4xl flex justify-between mb-4 print:hidden">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow text-gray-700 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} /> Nueva Venta
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg shadow-lg hover:bg-primary-dark transition-colors"
        >
          <Printer size={20} /> Imprimir Factura
        </button>
      </div>

      {/* Invoice A4 Container */}
      <div className="bg-white w-full max-w-[800px] aspect-[1/1.414] shadow-2xl relative overflow-hidden print:shadow-none print:w-full print:max-w-none print:aspect-auto">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 p-12 flex flex-col h-full">
          {/* Header Row */}
          <div className="flex justify-between items-start mb-12">
            {/* Left Header */}
            <div className="flex flex-col gap-6 w-1/2">
              <div className="bg-pink-100/80 px-8 py-3 rounded-full inline-block border-2 border-pink-200/50 shadow-sm w-fit transform -rotate-2">
                <h1 className="text-4xl font-black text-gray-800 tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>FACTURA</h1>
              </div>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-medium" style={{ fontFamily: 'cursive', color: '#333' }}>Nombre:</span>
                  <div className="bg-pink-50 px-4 py-1 rounded-full flex-1">
                    <span className="font-bold text-gray-700 uppercase">{clientName}</span>
                  </div>
                </div>
                {clientAddress && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-medium" style={{ fontFamily: 'cursive', color: '#333' }}>Dirección:</span>
                    <div className="bg-pink-50 px-4 py-1 rounded-full flex-1">
                      <span className="font-bold text-gray-700 uppercase">{clientAddress}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Header */}
            <div className="w-1/2 flex flex-col items-end">
              <div className="text-center mb-4">
                {/* Store Name & Info */}
                <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-1 uppercase">
                  {settings.name}
                </h2>
                <p className="text-xl text-gray-700" style={{ fontFamily: 'cursive' }}>{settings.receiptFooterText}</p>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mt-1">{settings.address}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="bg-pink-50 px-6 py-2 rounded-full border border-pink-100 shadow-sm">
                  <span className="font-bold text-gray-700 text-lg">{dateStr}</span>
                </div>
                {invoiceNumber && (
                  <div className="text-sm font-bold text-gray-500 tracking-wider">
                    N° {invoiceNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 mt-4">
            <div className="border-[3px] border-[#d4a373] rounded-[2rem] overflow-hidden bg-white">
              <table className="w-full text-center">
                <thead className="bg-pink-100/60">
                  <tr>
                    <th className="py-4 px-6 text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Descripción</th>
                    <th className="py-4 px-6 text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Cantidad</th>
                    <th className="py-4 px-6 text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Precio</th>
                    <th className="py-4 px-6 text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length > 0 ? (
                    cart.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-pink-50/30' : 'bg-white'}>
                        <td className="py-4 px-6 font-bold text-gray-700 text-left uppercase">{item.name}</td>
                        <td className="py-4 px-6 font-bold text-gray-700">{item.quantity}</td>
                        <td className="py-4 px-6 font-bold text-gray-700">{formatCurrency(item.price)}</td>
                        <td className="py-4 px-6 font-bold text-gray-700">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white">
                      <td className="py-4 px-6 font-bold text-gray-700 text-left uppercase">EJEMPLO ARTÍCULO</td>
                      <td className="py-4 px-6 font-bold text-gray-700">1</td>
                      <td className="py-4 px-6 font-bold text-gray-700">RD$2,000.00</td>
                      <td className="py-4 px-6 font-bold text-gray-700">RD$2,000.00</td>
                    </tr>
                  )}
                  {/* Empty filler rows to match design */}
                  {[...Array(Math.max(0, 5 - (cart.length || 1)))].map((_, i) => (
                    <tr key={`empty-${i}`} className={i % 2 === 0 ? 'bg-pink-50/30' : 'bg-white'}>
                      <td className="py-6 px-6"></td>
                      <td className="py-6 px-6"></td>
                      <td className="py-6 px-6"></td>
                      <td className="py-6 px-6"></td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="border-t-[3px] border-[#d4a373] bg-pink-100/40">
                    <td colSpan={3} className="py-4 px-6 text-right text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Gran Total</td>
                    <td className="py-4 px-6 font-black text-gray-900 text-xl">{cart.length > 0 ? formatCurrency(total) : 'RD$2,000.00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex justify-between items-end mt-12 pt-8">
            {/* Payment Info */}
            <div className="w-1/2">
              <div className="bg-pink-100/80 px-6 py-2 rounded-full inline-flex items-center gap-2 mb-4">
                <span className="text-2xl font-normal text-gray-800" style={{ fontFamily: 'cursive' }}>Forma de pago</span>
                <span className="text-pink-400 text-xl">♡</span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-900 rounded flex items-center justify-center shadow-sm">
                  {/* Mock Bank Logo */}
                  <div className="w-10 h-10 border-4 border-white rounded-full border-t-transparent border-l-transparent transform rotate-45"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#1e3a8a] text-xl uppercase">{settings.bankName || 'BANCO'}</h4>
                  <p className="text-gray-800 font-medium text-lg">{settings.bankAccount || 'Cuenta no especificada'}</p>
                </div>
              </div>
              
              <div className="border-t-2 border-pink-200 pt-2 w-3/4">
                <h4 className="font-bold text-pink-600 text-lg uppercase tracking-wide">{settings.ownerName || 'TITULAR DE CUENTA'}</h4>
                <p className="text-gray-800 font-medium text-lg">{settings.ownerId || 'Identificación'}</p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="w-1/2 flex flex-col items-end text-center relative">
              <div className="absolute right-32 top-0 text-pink-300 transform -rotate-12 scale-150">♡</div>
              <div className="border-b border-gray-800 pb-1 w-64 relative z-10">
                <span className="text-5xl text-[#1e3a8a] transform -rotate-6 inline-block" style={{ fontFamily: 'cursive' }}>{settings.ownerName.split(' ')[0] || 'Firma'}</span>
              </div>
              <span className="text-gray-500 uppercase tracking-widest text-sm mt-2 w-64">Firma Autorizada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
