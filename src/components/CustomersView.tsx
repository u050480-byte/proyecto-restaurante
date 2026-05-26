import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Customer } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  Award, 
  ShoppingBag, 
  Calendar, 
  Phone, 
  Mail, 
  DollarSign, 
  TrendingUp, 
  User,
  Ticket
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, sales } = useRestaurant();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create customer Modal Form toggle
  const [showForm, setShowForm] = useState(false);
  
  // Customer Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Selected customer for detailed timeline history drawer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    addCustomer({ name, email: email || 'Sin correo', phone: phone || 'Sin teléfono' });
    
    setName('');
    setEmail('');
    setPhone('');
    setShowForm(false);
  };

  // Filter list base on Search Input
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

  // Top overall metrics
  const totalClubsPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const frequentClientsCount = customers.filter(c => c.visitCount >= 4).length;

  return (
    <div className="space-y-8 animate-fade-in" id="customers_view_pane">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Club GastroGest & Frecuencia</h1>
          <p className="text-sm text-neutral-500">Registra comensales frecuentes, administra monederos de puntos y revisa historiales de compra</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedCustomerId(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors self-stretch sm:self-auto text-center justify-center"
        >
          <Plus className="w-4 h-4" />
          Registrar Nuevo Cliente
        </button>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-neutral-150 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-sans">Clientes Registrados</span>
            <span className="text-xl font-black text-neutral-800 font-mono">{customers.length} personas</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-neutral-150 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-sans">Puntos en Circulación</span>
            <span className="text-xl font-black text-neutral-800 font-mono">{totalClubsPoints} pts</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-neutral-150 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block font-sans">Frecuentes (4+ visitas)</span>
            <span className="text-xl font-black text-neutral-800 font-mono">{frequentClientsCount} comensales</span>
          </div>
        </div>
      </div>

      {/* Register Customer Overlay Modal Form */}
      {showForm && (
        <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-neutral-900 border-b pb-2">Inscripción al Club GastroGest</h2>
          <form onSubmit={handleSubmitCustomer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Nombre del Cliente</label>
              <input
                type="text"
                placeholder="Ej. Sra. Elena Ruiz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej. elena@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Teléfono Móvil</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Ej. +52 55..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white flex-1"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 text-white px-4 py-2 hover:bg-black rounded-lg text-xs font-bold whitespace-nowrap"
                >
                  Confirmar Alta
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main split: list vs detail view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customer list block - Col span 2 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white p-4 border border-neutral-150 rounded-2xl gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre, teléfono, e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 border border-neutral-200"
              />
            </div>
          </div>

          <div className="bg-white border border-neutral-150 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-150 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Comensal</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4 text-center">Visitas</th>
                  <th className="p-4 text-right">Puntos Club</th>
                  <th className="p-4 text-right">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomerId === customer.id;
                  return (
                    <tr 
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`hover:bg-neutral-50/70 cursor-pointer transition-colors ${
                        isSelected ? 'bg-neutral-50 font-bold' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-700 uppercase">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block">{customer.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono font-medium">{customer.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-[11px] text-neutral-600">
                          <p className="flex items-center gap-1.5 font-medium">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            {customer.email}
                          </p>
                          <p className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-neutral-800">
                        {customer.visitCount}
                      </td>
                      <td className="p-4 text-right font-mono">
                        <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          <Award className="w-3 h-3" />
                          {customer.points} pts
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold font-mono text-neutral-900">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-neutral-400 italic">
                      No se encontraron resultados para la búsqueda actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer purcharse history block - Col span 1 */}
        <div className="lg:col-span-1">
          {selectedCustomerObj ? (
            <div className="bg-white border border-neutral-150 rounded-2xl p-5 space-y-6">
              
              {/* Card header */}
              <div className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-[10px] uppercase font-bold text-neutral-400 font-sans">Expediente de Cliente</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomerId(null)}
                    className="text-neutral-400 hover:text-neutral-600 font-bold"
                  >
                    ×
                  </button>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm leading-tight">{selectedCustomerObj.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 border px-2 py-0.5 rounded-full font-bold">
                  <Ticket className="w-3 h-3" />
                  Monedero: {selectedCustomerObj.points} pesos redimibles
                </span>
              </div>

              {/* Purchase history list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Historial de Consumo ({selectedCustomerObj.purchaseHistory.length} tickets)
                </h4>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {selectedCustomerObj.purchaseHistory.map((h, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                        <span>{new Date(h.dateTime).toLocaleDateString('es-MX')} • {new Date(h.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-neutral-200 font-bold">{h.saleId}</span>
                      </div>
                      
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-neutral-600">Ticket pagado:</span>
                        <span className="font-mono text-neutral-900">${h.total.toFixed(2)}</span>
                      </div>

                      <div className="text-[10px] text-neutral-400 font-semibold flex justify-between">
                        <span>Consumo neto: ${h.subtotal.toFixed(2)}</span>
                        <span className="text-emerald-600 font-bold">+ {Math.round(h.subtotal * 0.1)} pts ganados</span>
                      </div>
                    </div>
                  ))}

                  {selectedCustomerObj.purchaseHistory.length === 0 && (
                    <div className="text-center py-10 bg-neutral-50 rounded-xl text-neutral-400 italic text-[11px]">
                      Este cliente no tiene tickets cerrados registrados en el sistema escolar/POS.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-10 text-center text-neutral-400 flex flex-col justify-center items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-neutral-300" />
              <p className="text-xs font-semibold text-neutral-700">Historial de Tickets</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto leading-normal">
                Haz clic en cualquier cliente de la tabla de frecuencia para ver su monedero de premios y su historial completo detallado de ventas.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
