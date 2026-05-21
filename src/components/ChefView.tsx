import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderItem, OrderItemStatus } from '../types';
import { 
  Flame, 
  Clock, 
  CheckCircle, 
  Soup, 
  Sparkles,
  RefreshCw,
  UtensilsCrossed,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const ChefView: React.FC = () => {
  const { orders, updateOrderItemStatus } = useRestaurant();
  const [viewMode, setViewMode] = useState<'comandas' | 'unificado'>('comandas');

  // Filter out completed/paid orders. We only cook orders that are in "pendiente", "en_preparacion", or "listo_para_servir" status.
  const kitchenOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion' || o.status === 'listo_para_servir');

  // Helper: total dishes currently needed in aggregated list
  const getAggregatedItems = () => {
    const counts: { [key: string]: { name: string; qty: number; pendingQty: number; prepQty: number; readyQty: number } } = {};
    
    kitchenOrders.forEach(o => {
      o.items.forEach(item => {
        if (!counts[item.menuItemId]) {
          counts[item.menuItemId] = { name: item.name, qty: 0, pendingQty: 0, prepQty: 0, readyQty: 0 };
        }
        counts[item.menuItemId].qty += item.quantity;
        if (item.status === 'pendiente') counts[item.menuItemId].pendingQty += item.quantity;
        else if (item.status === 'preparando') counts[item.menuItemId].prepQty += item.quantity;
        else if (item.status === 'listo' || item.status === 'servido') counts[item.menuItemId].readyQty += item.quantity;
      });
    });

    return Object.values(counts).filter(item => (item.pendingQty + item.prepQty) > 0);
  };

  const handleStatusChange = (orderId: string, itemId: string, currentStatus: OrderItemStatus) => {
    let nextStatus: OrderItemStatus = 'pendiente';
    if (currentStatus === 'pendiente') {
      nextStatus = 'preparando';
    } else if (currentStatus === 'preparando') {
      nextStatus = 'listo';
    } else if (currentStatus === 'listo') {
      nextStatus = 'servido';
    } else if (currentStatus === 'servido') {
      nextStatus = 'pendiente';
    }
    updateOrderItemStatus(orderId, itemId, nextStatus);
  };

  const getElapsedTimeText = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Hace unos segundos';
    return `Hace ${mins} minutos`;
  };

  const getElapsedPriorityBgsAndText = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 10) return { bg: 'border-blue-100 bg-linear-to-b from-blue-50/20 to-transparent', text: 'text-blue-600', priority: 'Normal' };
    if (mins < 20) return { bg: 'border-amber-100 bg-linear-to-b from-amber-50/20 to-transparent', text: 'text-amber-600', priority: 'Esperando' };
    return { bg: 'border-red-100 bg-linear-to-b from-red-50/40 to-transparent animate-pulse-once', text: 'text-red-600 font-bold', priority: '¡CRÍTICO!' };
  };

  const aggregatedSummary = getAggregatedItems();

  return (
    <div className="space-y-8 animate-fade-in" id="chef_view_container">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Estación de Cocina (Chef Board)</h1>
          <p className="text-sm text-neutral-500">KDS Board interactivo • Monitorea tiempos de rezago y cambia estados de platillos</p>
        </div>

        {/* View toggling tabs */}
        <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-xl self-stretch sm:self-auto max-w-sm">
          <button
            onClick={() => setViewMode('comandas')}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold leading-none cursor-pointer transition-all ${
              viewMode === 'comandas' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Por Comanda ({kitchenOrders.length})
          </button>
          <button
            onClick={() => setViewMode('unificado')}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold leading-none cursor-pointer transition-all ${
              viewMode === 'unificado' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Soup className="w-3.5 h-3.5" />
            Consolidado ({aggregatedSummary.reduce((sum, item) => sum + item.pendingQty + item.prepQty, 0)} uds)
          </button>
        </div>
      </div>

      {/* VIEW: AGGREGATED CONSOLIDATED COOKING LIST */}
      {viewMode === 'unificado' && (
        <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-[15px] font-bold text-neutral-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              Consolidado de Producción en Caliente
            </h2>
            <p className="text-xs text-neutral-500">Combina y resume las porciones de todos los pedidos activos para eficientizar la parrilla</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {aggregatedSummary.map((item, idx) => {
              return (
                <div key={idx} className="bg-neutral-50 border border-neutral-150 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{item.name}</h3>
                    <div className="flex gap-4 items-center mt-3 text-xs font-mono">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">TOTAL PEDIDOS</span>
                        <span className="text-lg font-black text-neutral-800">{item.qty}</span>
                      </div>
                      <div className="w-px h-6 bg-neutral-200" />
                      <div>
                        <span className="text-amber-500 block text-[10px] uppercase font-bold">Por cocinar</span>
                        <span className="text-lg font-black text-amber-600">{item.pendingQty}</span>
                      </div>
                      <div className="w-px h-6 bg-neutral-200" />
                      <div>
                        <span className="text-blue-500 block text-[10px] uppercase font-bold">Preparando</span>
                        <span className="text-lg font-black text-blue-600">{item.prepQty}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status meter block bar */}
                  <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 flex gap-1 h-3">
                    {Array.from({ length: item.pendingQty }).map((_, i) => (
                      <div key={`p-${i}`} className="h-full flex-1 bg-amber-400 rounded-xs" title="Pendiente" />
                    ))}
                    {Array.from({ length: item.prepQty }).map((_, i) => (
                      <div key={`c-${i}`} className="h-full flex-1 bg-blue-500 rounded-xs animate-pulse" title="Preparando" />
                    ))}
                    {Array.from({ length: item.readyQty }).map((_, i) => (
                      <div key={`r-${i}`} className="h-full flex-1 bg-emerald-500 rounded-xs" title="Listo" />
                    ))}
                  </div>
                </div>
              );
            })}

            {aggregatedSummary.length === 0 && (
              <div className="col-span-full text-center py-12 text-neutral-400 italic text-xs">
                La cocina está completamente al día. No hay platillos pendientes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: BY TICKET CARDS FLOOR */}
      {viewMode === 'comandas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            const timeCtx = getElapsedPriorityBgsAndText(order.createdAt);
            const totalItemsCount = order.items.length;
            const finalizedCount = order.items.filter(i => i.status === 'listo' || i.status === 'servido').length;

            return (
              <div
                key={order.id}
                className={`border rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between transition-all bg-white hover:shadow-md ${timeCtx.bg}`}
              >
                {/* Visual order ticket header */}
                <div className="p-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                  <div className="flex gap-2 items-center">
                    <div className="bg-neutral-900 text-white rounded-lg px-2.5 py-1 text-xs font-bold leading-tight font-mono">
                      Mesa {order.tableNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-[13px] text-neutral-800 leading-none">{order.guestName}</h3>
                      <span className="text-[10px] text-neutral-400 font-mono block mt-1">Autor: {order.waiterName}</span>
                    </div>
                  </div>
                  
                  {/* Performance priority tags */}
                  <div className="text-right">
                    <span className={`inline-block text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded-sm bg-neutral-100 border text-neutral-600 ${
                      timeCtx.priority === '¡CRÍTICO!' ? 'text-red-700 bg-red-150 border-red-200 animate-pulse' : 'text-neutral-500 border-neutral-200'
                    }`}>
                      {timeCtx.priority}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-semibold block mt-1 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Body items scroll zone inside Chef screen */}
                <div className="p-4 flex-1 space-y-2.5 max-h-[300px] overflow-y-auto">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleStatusChange(order.id, item.id, item.status)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer select-none transition-all ${
                        item.status === 'pendiente' ? 'bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100/55' :
                        item.status === 'preparando' ? 'bg-blue-50/50 border-blue-200 text-blue-900 hover:bg-blue-100/55' :
                        item.status === 'listo' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/55' :
                        'bg-neutral-50 border-neutral-150 text-neutral-400'
                      }`}
                      title="Haz clic para avanzar de estado de producción"
                    >
                      <div className="space-y-1 pr-4">
                        <span className="font-bold inline-block text-[13px] leading-tight">
                          {item.quantity}x {item.name}
                        </span>
                        
                        {item.notes && (
                          <div className="text-[10px] text-red-650 bg-red-50/60 inline-block px-1.5 py-0.5 rounded-xs border border-red-100/50 font-bold">
                            Nota: {item.notes}
                          </div>
                        )}
                      </div>

                      {/* Interactive click transition button info */}
                      <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wide flex items-center gap-1 uppercase ${
                        item.status === 'pendiente' ? 'bg-amber-150 text-amber-800' :
                        item.status === 'preparando' ? 'bg-blue-150 text-blue-800 animate-pulse' :
                        item.status === 'listo' ? 'bg-emerald-150 text-emerald-800 border border-emerald-200' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>
                        {item.status === 'pendiente' && 'Hacer'}
                        {item.status === 'preparando' && 'Prep...'}
                        {item.status === 'listo' && '¡Listo!'}
                        {item.status === 'servido' && 'Entregado'}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}

                  {order.items.length === 0 && (
                    <div className="text-center py-10 text-neutral-400 text-xs italic">
                      Comanda vacía, esperando que el mesero la ingrese.
                    </div>
                  )}
                </div>

                {/* Footer status summary bar */}
                <div className="p-3 border-t border-neutral-100 bg-neutral-50/30 flex justify-between items-center text-xs text-neutral-500">
                  <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                    Progreso: {finalizedCount}/{totalItemsCount}
                  </span>
                  <span className="font-mono text-[10px]">
                    {getElapsedTimeText(order.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {kitchenOrders.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white border border-dashed rounded-2xl text-neutral-400">
              No hay comandas activas pendientes para preparar en cocina ahora mismo. ¡Excelente trabajo personal!
            </div>
          )}
        </div>
      )}

    </div>
  );
};
