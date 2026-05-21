import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, OrderStatus, OrderItem, MenuItem } from '../types';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Utensils, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Tag, 
  Send,
  User,
  Coffee,
  ListCollapse,
  Check,
  Soup
} from 'lucide-react';

export const OrderView: React.FC = () => {
  const { 
    orders, 
    tables, 
    menu, 
    staff, 
    createOrder, 
    addItemsToOrder, 
    updateOrderStatus, 
    cancelOrder,
    setActiveView,
    setSelectedBillingOrderId
  } = useRestaurant();

  // Selected Order for modification / detail view
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // New Order Creation Form toggles
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [selectedWaiterId, setSelectedWaiterId] = useState('');
  const [clientName, setClientName] = useState('');

  // Cart/Basket for adding new items
  const [basket, setBasket] = useState<{ menuItem: MenuItem; quantity: number; notes: string }[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'entradas' | 'fuertes' | 'bebidas' | 'postres'>('entradas');
  const [sendingFeedback, setSendingFeedback] = useState<'sending' | 'sent' | null>(null);

  // Filter helper: Only available tables for new orders
  const availableTables = tables.filter(t => t.status === 'disponible');
  const activeWaiters = staff.filter(s => s.role === 'Mesero' && s.status === 'Activo');



  const handleStartOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !selectedWaiterId) return;

    const tableObj = tables.find(t => t.id === selectedTableId);
    const waiterObj = staff.find(s => s.id === selectedWaiterId);
    if (!tableObj || !waiterObj) return;

    const newOrdId = createOrder({
      tableId: selectedTableId,
      tableNumber: tableObj.number,
      waiterId: selectedWaiterId,
      waiterName: waiterObj.name,
      guestName: clientName || `Mesa ${tableObj.number}`,
      items: [],
      notes: ''
    });

    // Reset setup states and select the newly created order
    setActiveOrderId(newOrdId);
    setBasket([]);
    setShowNewOrderModal(false);
    setSelectedTableId('');
    setSelectedWaiterId('');
    setClientName('');
  };

  const handleAddToBasket = (dish: MenuItem) => {
    setBasket(prev => {
      const idx = prev.findIndex(item => item.menuItem.id === dish.id);
      if (idx > -1) {
        // Increment
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      } else {
        return [...prev, { menuItem: dish, quantity: 1, notes: '' }];
      }
    });
  };

  const updateBasketQty = (dishId: string, delta: number) => {
    setBasket(prev => {
      return prev.map(item => {
        if (item.menuItem.id === dishId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const updateBasketNotes = (dishId: string, notes: string) => {
    setBasket(prev => prev.map(item => 
      item.menuItem.id === dishId ? { ...item, notes } : item
    ));
  };

  const handleSendToKitchen = () => {
    if (!activeOrderId || basket.length === 0) return;

    // Convert basket items to OrderItem
    const itemsToSend = basket.map(b => ({
      menuItemId: b.menuItem.id,
      name: b.menuItem.name,
      price: b.menuItem.price,
      quantity: b.quantity,
      notes: b.notes
    }));

    const savedOrderId = activeOrderId;

    // Phase 1: Interactive dispatch sequence
    setSendingFeedback('sending');

    setTimeout(() => {
      // Actually send to kitchen database & update status so that it instantly materializes on the Chef/Cook's dashboard
      addItemsToOrder(savedOrderId, itemsToSend);
      updateOrderStatus(savedOrderId, 'pendiente'); // mark order as overall pending/preparing in the kitchen

      // Phase 2: Success transmission confirm
      setSendingFeedback('sent');

      setTimeout(() => {
        // Clear active ordering state
        setBasket([]);
        setActiveOrderId(null);
        setSendingFeedback(null);

        // Pre-select this order ID inside billing view & transition view
        setSelectedBillingOrderId(savedOrderId);
        setActiveView('cobros');
      }, 1600);

    }, 1100);
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold font-mono"><Clock className="w-3 h-3 animate-spin" /> Espera</span>;
      case 'en_preparacion':
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold font-mono"><Utensils className="w-3 h-3 animate-bounce" /> Cocinando</span>;
      case 'listo_para_servir':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold font-mono"><CheckCircle className="w-3 h-3" /> ¡Cocinado!</span>;
      case 'entregado':
        return <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200 px-2.5 py-1 rounded-full text-xs font-bold font-mono"><Check className="w-3 h-3" /> Entregado</span>;
      case 'pagado':
        return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold font-mono"><CheckCircle className="w-3 h-3" /> Liquidado</span>;
    }
  };

  const selectedOrderObj = orders.find(o => o.id === activeOrderId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in relative" id="orders_view_container">
      
      {/* Real-time Order transmission feedback overlay */}
      {sendingFeedback && (
        <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-xs z-50 flex flex-col items-center justify-center rounded-2xl p-6 text-center space-y-4 animate-fade-in text-white">
          <div className="p-5 bg-neutral-800 rounded-full border border-neutral-700 shadow-xl relative">
            {sendingFeedback === 'sending' ? (
              <div className="relative">
                <Soup className="w-12 h-12 text-amber-500 animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
            ) : (
              <CheckCircle className="w-12 h-12 text-emerald-400 scale-110 transition-transform duration-300" />
            )}
          </div>
          
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-black tracking-tight">
              {sendingFeedback === 'sending' ? 'Enviando Comanda al Chef...' : '¡Comanda en Producción!'}
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              {sendingFeedback === 'sending' 
                ? 'El pedido de comensal está siendo impreso y transmitido a la KDS de Cocina...' 
                : '✓ Recibido con éxito en la cocina. El Chef ya está preparando los alimentos.'}
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-[10px] font-bold font-mono tracking-wider text-neutral-400 border border-neutral-700 animate-pulse">
              {sendingFeedback === 'sending' 
                ? 'Conectando con Servidor Cocina...' 
                : 'Redirigiendo a Caja de cobros...'}
            </span>
          </div>
        </div>
      )}
      
      {/* LEFT COLUMN: LIST OF ACTIVE ORDERS */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Comandas en Turno</h2>
            <p className="text-xs text-neutral-500">Haz clic en una orden para agregar alimentos</p>
          </div>
          <button
            onClick={() => setShowNewOrderModal(!showNewOrderModal)}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl cursor-pointer"
            title="Abrir nueva comanda"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Create new ticket directly inline overlay */}
        {showNewOrderModal && (
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <h3 className="font-bold text-xs text-neutral-800">Nueva Comanda de Alimentos</h3>
            <form onSubmit={handleStartOrder} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Asignar Mesa libre</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 px-2.5 py-2 bg-white"
                  required
                >
                  <option value="">Selecciona una mesa disponible...</option>
                  {availableTables.map(t => (
                    <option key={t.id} value={t.id}>Mesa {t.number} ({t.seats} asis.)</option>
                  ))}
                </select>
                {availableTables.length === 0 && (
                  <span className="text-[10px] text-red-500">Todas las mesas del restaurante están ocupadas</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Mesero de Piso</label>
                <select
                  value={selectedWaiterId}
                  onChange={(e) => setSelectedWaiterId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 px-2.5 py-2 bg-white"
                  required
                >
                  <option value="">Selecciona mesero asignador...</option>
                  {activeWaiters.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400">Nombre del Comensal</label>
                <input
                  type="text"
                  placeholder="Ej. Sra. Ruiz (Opcional)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 px-2.5 py-2 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={availableTables.length === 0 || activeWaiters.length === 0}
                  className="w-full bg-neutral-900 disabled:bg-neutral-200 disabled:cursor-not-allowed hover:bg-black text-white text-[11px] font-bold py-2 rounded-lg cursor-pointer"
                >
                  Confirmar Mesa
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="w-full bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-500 text-[11px] font-bold py-2 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of current tickets */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {orders.filter(o => o.status !== 'pagado').map((order) => {
            const tableObj = tables.find(t => t.id === order.tableId);
            const isSelected = activeOrderId === order.id;
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div
                key={order.id}
                onClick={() => {
                  setActiveOrderId(order.id);
                  setBasket([]);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative ${
                  isSelected 
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                    : 'border-neutral-150 bg-white text-neutral-800 hover:bg-neutral-50/70 shadow-2xs'
                }`}
                id={`order_trigger_${order.tableId}`}
              >
                {/* Hidden button helper targetable for automated table triggering */}
                <button id={`order_trigger_${order.id}`} className="hidden" />

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-[13px] ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      Mesa {order.tableNumber} • <span className="font-semibold">{order.guestName}</span>
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-neutral-450' : 'text-neutral-500'}`}>
                      Por: <span className="font-bold">{order.waiterName}</span>
                    </p>
                  </div>
                  <div>
                    {getOrderStatusBadge(order.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-neutral-200/50">
                  <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {itemsCount} platillos
                  </span>
                  <span className={`text-sm font-black font-mono ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {orders.filter(o => o.status !== 'pagado').length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed rounded-2xl text-neutral-400 text-xs">
              No hay comandas activas en este turno. Presiona (+) para crear una.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT TWIN COLUMNS: CURRENT ACTIVE BASKET & MENU INSERTION */}
      <div className="lg:col-span-2 space-y-6">
        {selectedOrderObj ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between min-h-[550px]">
            <div>
              {/* Header about selected order details */}
              <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-neutral-900 text-white rounded-lg font-bold font-mono text-center min-w-[32px] text-sm">
                    M{selectedOrderObj.tableNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      Gestionando Comanda de {selectedOrderObj.guestName}
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Atiende: <span className="font-bold">{selectedOrderObj.waiterName}</span> • Mesa {selectedOrderObj.tableNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de cancelar esta comanda y liberar la mesa?')) {
                        cancelOrder(selectedOrderObj.id);
                        setActiveOrderId(null);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-md cursor-pointer text-xs flex items-center gap-1"
                    title="Anular comanda por completo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Anular
                  </button>
                  <button
                    onClick={() => {
                      // Mark waiter served them
                      updateOrderStatus(selectedOrderObj.id, 'entregado');
                    }}
                    className="p-1.5 hover:bg-indigo-50 text-neutral-400 hover:text-indigo-600 rounded-md cursor-pointer text-xs flex items-center gap-1"
                    title="Marcar mesa como completamente servida"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Servida
                  </button>
                </div>
              </div>

              {/* Grid: Existing elements in Ticket + Adding Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                
                {/* Visual Section: Current Items already submitted to kitchen inside ticket */}
                <div className="border border-neutral-100 rounded-xl p-4 space-y-3 bg-neutral-50/50">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest block">Acompañamiento Actual</span>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {selectedOrderObj.items.map((item) => (
                      <div key={item.id} className="bg-white p-2.5 rounded-lg border border-neutral-150 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-neutral-800 truncate max-w-[150px]">{item.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {item.quantity} ud • ${item.price} • {item.notes && `"${item.notes}"`}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                            item.status === 'pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            item.status === 'preparando' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            item.status === 'listo' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250 animate-pulse' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {selectedOrderObj.items.length === 0 && (
                      <div className="text-center py-10 text-neutral-400 text-xs italic">
                        La comanda actualmente no contiene alimentos. Agrégalos a la derecha.
                      </div>
                    )}
                  </div>

                  <div className="bg-neutral-100 p-2.5 rounded-lg text-right font-mono text-xs">
                    Subtotal comanda: <span className="font-bold text-neutral-900">${selectedOrderObj.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Interactive basket: Add new ones prior to submitting */}
                <div className="border border-neutral-100 rounded-xl p-4 space-y-3 bg-white">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest block text-indigo-700">Por Enviar a Prep</span>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {basket.map((item) => (
                      <div key={item.menuItem.id} className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-250/50 text-xs space-y-2">
                        <div className="flex justify-between items-center gap-1">
                          <span className="font-bold text-neutral-900 truncate max-w-[120px]">{item.menuItem.name}</span>
                          <span className="font-mono text-neutral-600">${item.menuItem.price * item.quantity}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          {/* Quantity control */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateBasketQty(item.menuItem.id, -1)}
                              className="w-5 h-5 bg-white border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center font-bold text-xs"
                              type="button"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-bold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateBasketQty(item.menuItem.id, 1)}
                              className="w-5 h-5 bg-white border border-neutral-300 rounded hover:bg-neutral-100 flex items-center justify-center font-bold text-xs"
                              type="button"
                            >
                              +
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Notas (sin picante, etc...)"
                            value={item.notes}
                            onChange={(e) => updateBasketNotes(item.menuItem.id, e.target.value)}
                            className="bg-white border border-neutral-200 text-[10px] rounded px-1.5 py-0.5 max-w-[130px] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}

                    {basket.length === 0 && (
                      <div className="text-center py-10 text-neutral-400 text-xs italic">
                        Haz clic en los platillos abajo para agregarlos a esta sección temporal de envío.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSendToKitchen}
                    disabled={basket.length === 0}
                    className="w-full bg-indigo-600 disabled:bg-neutral-200 disabled:cursor-not-allowed hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Enviar {basket.length} platillos a Cocina
                  </button>
                </div>

              </div>

              {/* MENU VISUAL ACCORDION TO CHOOSE PIECES */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest block">Seleccionar del Menú</span>
                
                {/* Category filters */}
                <div className="flex gap-1.5 overflow-x-auto text-[10px] font-bold">
                  {(['entradas', 'fuertes', 'bebidas', 'postres'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setActiveCategoryFilter(c)}
                      className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                        activeCategoryFilter === c ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {c === 'entradas' ? '🥐 Entradas' : c === 'fuertes' ? '🥩 Fuertes' : c === 'bebidas' ? '🍹 Bebidas' : '🍰 Postres'}
                    </button>
                  ))}
                </div>

                {/* Miniature dishes scroll container */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[220px] p-0.5">
                  {menu.filter(m => m.category === activeCategoryFilter).map(dish => (
                    <div
                      key={dish.id}
                      onClick={() => {
                        if (dish.isAvailable) handleAddToBasket(dish);
                      }}
                      className={`p-2 bg-neutral-50 hover:bg-indigo-50/50 border rounded-xl flex flex-col justify-between text-left h-24 transition-all relative ${
                        dish.isAvailable ? 'border-neutral-200 cursor-pointer hover:border-indigo-200' : 'border-neutral-100 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-neutral-800 truncate" title={dish.name}>{dish.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">${dish.price}</p>
                      </div>

                      <span className="text-[9px] text-neutral-400 text-right mt-1 font-semibold truncate block">
                        {dish.isAvailable ? '+ Añadir' : 'Agotada'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
            <div className="bg-white border rounded-2xl p-12 text-center text-neutral-400 min-h-[400px] flex flex-col justify-center items-center gap-3">
              <span className="p-4 bg-neutral-50 text-neutral-400 rounded-full">
                <Send className="w-10 h-10" />
              </span>
              <p className="text-sm font-semibold text-neutral-700">Comienza a tomar comandas</p>
              <p className="text-xs text-neutral-400 max-w-sm">
                Selecciona una comanda de mesa activa en la lista lateral, o abre una nueva asignando una mesa disponible para empezar a pedir del menú.
              </p>
            </div>
          )}
        </div>

    </div>
  );
};
