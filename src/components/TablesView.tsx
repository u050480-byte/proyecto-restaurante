import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { TableStatus, RestaurantTable } from '../types';
import { 
  Plus, 
  Users, 
  User, 
  Utensils, 
  CheckCircle, 
  DollarSign, 
  Hand,
  Clock, 
  AlertTriangle,
  HelpCircle,
  Hash
} from 'lucide-react';

export const TablesView: React.FC = () => {
  const { tables, staff, orders, addTable, occupyTable, releaseTable, updateTableStatus, setActiveView } = useRestaurant();
  const [showAddForm, setShowAddForm] = useState(false);
  const [seatsCount, setSeatsCount] = useState<number>(4);
  
  // Seating form state
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [guestName, setGuestName] = useState('');
  const [assignedWaiterId, setAssignedWaiterId] = useState('');

  const activeWaiters = staff.filter(s => s.role === 'Mesero' && s.status === 'Activo');



  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seatsCount < 1 || seatsCount > 20) return;
    addTable(seatsCount);
    setShowAddForm(false);
  };

  const handleSeatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !assignedWaiterId) return;
    
    occupyTable(selectedTable.id, guestName, assignedWaiterId);
    
    // Reset seating form
    setSelectedTable(null);
    setGuestName('');
    setAssignedWaiterId('');
  };

  // Helper to extract table status colors and labels
  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case 'disponible':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Disponible',
          icon: <CheckCircle className="w-4 h-4 text-emerald-600" />
        };
      case 'ocupada':
        return {
          bg: 'bg-amber-50/70 border-amber-200 text-amber-900 hover:border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Ordenando',
          icon: <Clock className="w-4 h-4 text-amber-600" />
        };
      case 'esperando_comida':
        return {
          bg: 'bg-blue-50/80 border-blue-200 text-blue-900 hover:border-blue-300',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Prep Cocina',
          icon: <Utensils className="w-4 h-4 text-blue-600" />
        };
      case 'servida':
        return {
          bg: 'bg-teal-50/70 border-teal-200 text-teal-900 hover:border-teal-300',
          badge: 'bg-teal-100 text-teal-850 border-teal-200',
          label: 'Mesa Servida',
          icon: <CheckCircle className="w-4 h-4 text-teal-600" />
        };
      case 'por_cobrar':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-300',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          label: 'Pide Cuenta',
          icon: <Hand className="w-4 h-4 text-rose-600" />
        };
      default:
        return {
          bg: 'bg-neutral-50 border-neutral-200 text-neutral-850',
          badge: 'bg-neutral-100 text-neutral-850 border-neutral-200',
          label: 'Desconocido',
          icon: <HelpCircle className="w-4 h-4" />
        };
    }
  };

  // Find info about order on table
  const getTableActiveOrderDetails = (orderId: string | null) => {
    if (!orderId) return null;
    return orders.find(o => o.id === orderId);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="tables_view_container">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Mesas y Comensales</h1>
          <p className="text-sm text-neutral-500">Administra la distribución del salón, abre comandas y atiende clientes</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSelectedTable(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors self-stretch sm:self-auto text-center justify-center"
        >
          <Plus className="w-4 h-4" />
          Añadir Mesa
        </button>
      </div>

      {/* Forms Drawer overlay */}
      {(showAddForm || selectedTable) && (
        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 shadow-inner transition-all space-y-4">
          {showAddForm && (
            <form onSubmit={handleAddTableSubmit} className="max-w-md space-y-3">
              <h3 className="font-bold text-sm text-neutral-800">Agregar nueva mesa comercial</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 block">Capacidad de Sillas</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="4"
                    value={seatsCount}
                    onChange={(e) => setSeatsCount(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white font-mono focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="w-full bg-neutral-950 hover:bg-neutral-850 text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Guardar Mesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-500 text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}

          {selectedTable && (
            <form onSubmit={handleSeatingSubmit} className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <h3 className="font-bold text-sm text-neutral-900">
                  Asignar Comensal • Mesa {selectedTable.number} ({selectedTable.seats} asientos)
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 block">Nombre del Cliente / Grupo</label>
                  <input
                    type="text"
                    placeholder="Ej. Familia Martínez, Sr. Castro"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-500 block">Mesero Responsable</label>
                  <select
                    value={assignedWaiterId}
                    onChange={(e) => setAssignedWaiterId(e.target.value)}
                    className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
                    required
                  >
                    <option value="">Seleccionar Mesero Activo...</option>
                    {activeWaiters.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.status})
                      </option>
                    ))}
                  </select>
                  {activeWaiters.length === 0 && (
                    <span className="text-[10px] text-rose-500">Debes activar al menos un mesero en la pestaña "Personal"</span>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={activeWaiters.length === 0}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Abrir Comanda
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTable(null)}
                    className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-500 text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grid Floor Plan Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => {
          const cfg = getStatusConfig(table.status);
          const activeOrder = getTableActiveOrderDetails(table.activeOrderId);

          return (
            <div
              key={table.id}
              className={`border p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[220px] shadow-xs relative overflow-hidden group ${cfg.bg}`}
              id={`table_card_${table.number}`}
            >
              {/* Card visual elements */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <div className="bg-white/90 border border-neutral-150 p-2 rounded-xl text-neutral-800 font-bold font-mono text-center flex flex-col justify-center min-w-[36px]">
                    <span className="text-[9px] text-neutral-400 leading-none">MESA</span>
                    <span className="text-lg leading-tight mt-0.5">{table.number}</span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badge}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1 mt-1 font-mono">
                      <Users className="w-2.5 h-2.5" />
                      Capacidad: {table.seats} p
                    </span>
                  </div>
                </div>

                {/* Right side release action shortcut */}
                {table.status !== 'disponible' && table.status !== 'por_cobrar' && (
                  <button
                    onClick={() => releaseTable(table.id)}
                    className="text-[10px] text-neutral-400 hover:text-red-500 font-semibold transition-colors bg-white/40 px-2 py-1 rounded-sm cursor-pointer"
                    title="Cerrar mesa y comanda sin facturar"
                  >
                    Liberar
                  </button>
                )}
              </div>

              {/* Main inner details */}
              <div className="my-4 space-y-1.5 pb-2">
                {table.status !== 'disponible' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-800 truncate" title={table.guestName || ''}>
                        {table.guestName || 'Sin Registrar'}
                      </span>
                    </div>
                    {activeOrder && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-neutral-500 font-semibold">
                          Mesero: <span className="font-bold text-neutral-700">{activeOrder.waiterName}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1.5">
                          <span>Platillos: <span className="font-fold text-neutral-700 font-mono">{activeOrder.items.reduce((sum, i) => sum + i.quantity, 0)} uds</span></span>
                          <span className="text-neutral-300">•</span>
                          <span className="font-mono text-neutral-900 font-bold">${activeOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)}</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-neutral-400 font-semibold italic flex items-center gap-1 py-1">
                    Ideal para parejas / comensales rústicos
                  </div>
                )}
              </div>

              {/* Contextual actions at the bottom */}
              <div className="pt-3 border-t border-dashed border-neutral-200/50 flex flex-col gap-2">
                {table.status === 'disponible' && (
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setShowAddForm(false);
                    }}
                    className="w-full text-center py-2 bg-white/90 border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 text-neutral-800 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 shadow-xs"
                  >
                    Asignar y Abrir
                  </button>
                )}

                {table.status !== 'disponible' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Open the Order/Comanda tab for this specific order
                        setActiveView('comandas');
                        // Set standard table parameters
                        setTimeout(() => {
                          const triggerBtn = document.getElementById(`order_trigger_${table.id}`);
                          if (triggerBtn) triggerBtn.click();
                        }, 50);
                      }}
                      className="w-full text-center py-2 bg-neutral-900 hover:bg-neutral-850 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Utensils className="w-3 h-3" />
                      Comanda
                    </button>

                    {(table.status === 'servida' || table.status === 'por_cobrar' || table.status === 'esperando_comida') && (
                      <button
                        onClick={() => {
                          setActiveView('cobros');
                          setTimeout(() => {
                            const billingSelector = document.getElementById(`billing_order_select_${activeOrder?.id}`);
                            if (billingSelector) billingSelector.click();
                          }, 50);
                        }}
                        className="w-full text-center py-2 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-0.5 shadow-xs"
                      >
                        <DollarSign className="w-3 h-3" />
                        Cobrar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
