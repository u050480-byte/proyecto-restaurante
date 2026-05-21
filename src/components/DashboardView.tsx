import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  Receipt,
  CreditCard,
  Percent
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { sales, tables, orders, staff, menu } = useRestaurant();

  // --- STATS CALCULATIONS ---
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const subtotalSales = sales.reduce((sum, s) => sum + s.subtotal, 0);
  const totalTips = sales.reduce((sum, s) => sum + s.tip, 0);
  
  const occupiedTablesCount = tables.filter(t => t.status !== 'disponible').length;
  const totalTablesCount = tables.length;
  const occupancyRate = totalTablesCount > 0 ? Math.round((occupiedTablesCount / totalTablesCount) * 100) : 0;
  
  const activeOrders = orders.filter(o => o.status !== 'pagado');
  const pendingOrdersCount = activeOrders.filter(o => o.status === 'pendiente').length;
  const preparingOrdersCount = activeOrders.filter(o => o.status === 'en_preparacion').length;
  const readyOrdersCount = activeOrders.filter(o => o.status === 'listo_para_servir').length;

  // Most popular dishes calculation based on mock sales & current orders
  const dishQuantities: { [key: string]: { name: string, count: number, category: string, price: number } } = {};
  
  // Aggregate from active orders
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!dishQuantities[item.menuItemId]) {
        const menuItem = menu.find(m => m.id === item.menuItemId);
        dishQuantities[item.menuItemId] = { 
          name: item.name, 
          count: 0, 
          category: menuItem?.category || 'otros',
          price: item.price
        };
      }
      dishQuantities[item.menuItemId].count += item.quantity;
    });
  });

  // Aggregate from mock completed sales (approx 2 items per sale for simulation)
  sales.forEach((sale, index) => {
    // Generate some deterministic dish association based on sale index to make popular dishes realistic
    const mockDishIds = ['m4', 'm1', 'm9', 'm11', 'm6', 'm2'];
    const selectedDishId = mockDishIds[index % mockDishIds.length];
    const menuItem = menu.find(m => m.id === selectedDishId);
    if (menuItem) {
      if (!dishQuantities[selectedDishId]) {
        dishQuantities[selectedDishId] = { 
          name: menuItem.name, 
          count: 0, 
          category: menuItem.category,
          price: menuItem.price 
        };
      }
      dishQuantities[selectedDishId].count += (index % 2) + 2; // add 2 or 3
    }
  });

  const popularDishes = Object.values(dishQuantities)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxPopularCount = popularDishes.length > 0 ? Math.max(...popularDishes.map(d => d.count)) : 1;

  // Staff analysis
  const activeStaffCount = staff.filter(s => s.status === 'Activo').length;

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard_view_container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-linear-to-r from-neutral-900 to-neutral-800 rounded-2xl text-white shadow-xs">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
          <p className="text-neutral-400 mt-1">GastroGest • Monitor general del restaurante en tiempo real</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-mono backdrop-blur-sm self-start md:self-center">
          Turno Activo • {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between" id="kpi_sales">
          <div className="space-y-1">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Ingresos Totales</span>
            <h3 className="text-2xl font-bold font-mono text-neutral-900">${totalSalesRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <TrendingUp className="w-3 animate-pulse" />
              <span>+12.4% vs promedio</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Occupancy Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between" id="kpi_occupancy">
          <div className="space-y-1">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Ocupación Mesas</span>
            <h3 className="text-2xl font-bold text-neutral-900">{occupancyRate}%</h3>
            <p className="text-xs font-mono text-neutral-500 mt-1">
              {occupiedTablesCount} de {totalTablesCount} mesas activas
            </p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between" id="kpi_orders">
          <div className="space-y-1">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Comandas en Curso</span>
            <h3 className="text-2xl font-bold text-neutral-900 font-mono">{activeOrders.length}</h3>
            <div className="flex gap-2 text-xs font-medium mt-1">
              <span className="text-amber-600 font-mono">{pendingOrdersCount}p</span>
              <span className="text-blue-600 font-mono">{preparingOrdersCount}c</span>
              <span className="text-emerald-600 font-mono">{readyOrdersCount}l</span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between" id="kpi_tips">
          <div className="space-y-1">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Propinas Mesas</span>
            <h3 className="text-2xl font-bold font-mono text-neutral-900">${totalTips.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Dividido equitativamente o por mesero
            </p>
          </div>
          <div className="p-4 bg-violet-50 text-violet-600 rounded-xl">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live status summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Estado de la Cocina y Mesas</h2>
              <p className="text-xs text-neutral-500">Comportamiento actual de los pedidos y el comedor</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sincronizado
            </span>
          </div>

          {/* Quick interactive breakdown progress bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-neutral-100 p-4 rounded-xl space-y-3">
              <span className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-neutral-400" />
                Flujo de Producción
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Esperando Cocina</span>
                    <span className="font-semibold">{pendingOrdersCount} pedidos</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${activeOrders.length ? (pendingOrdersCount / activeOrders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>En Preparación (Chef)</span>
                    <span className="font-semibold">{preparingOrdersCount} pedidos</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full transition-all duration-500" 
                      style={{ width: `${activeOrders.length ? (preparingOrdersCount / activeOrders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>Listos para Entrega</span>
                    <span className="font-semibold">{readyOrdersCount} pedidos</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${activeOrders.length ? (readyOrdersCount / activeOrders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-neutral-100 p-4 rounded-xl space-y-3">
              <span className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-neutral-400" />
                Disponibilidad de Comensales
              </span>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-neutral-50 p-2.5 rounded-lg">
                  <span className="text-neutral-400 block mb-0.5">Disponibles</span>
                  <span className="text-lg font-bold text-neutral-800 font-mono">
                    {tables.filter(t => t.status === 'disponible').length}
                  </span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg">
                  <span className="text-amber-600 block mb-0.5">Ordenando</span>
                  <span className="text-lg font-bold text-amber-800 font-mono">
                    {tables.filter(t => t.status === 'ocupada').length}
                  </span>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <span className="text-blue-600 block mb-0.5">Comiendo</span>
                  <span className="text-lg font-bold text-blue-800 font-mono">
                    {tables.filter(t => t.status === 'esperando_comida' || t.status === 'servida').length}
                  </span>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-lg">
                  <span className="text-rose-600 block mb-0.5">Por Cobrar</span>
                  <span className="text-lg font-bold text-rose-800 font-mono">
                    {tables.filter(t => t.status === 'por_cobrar').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple custom SVG chart for hourly sales flow trend simulation */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              Flujo de Ventas del Turno (Hoy)
            </h3>
            <div className="h-44 flex items-end justify-between gap-6 border-b border-l border-neutral-100 p-2 relative">
              {/* Back gridlines */}
              <div className="absolute left-0 right-0 top-1/4 border-t border-neutral-50 border-dashed" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-neutral-50 border-dashed" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-neutral-50 border-dashed" />

              <div className="flex flex-col items-center gap-1 w-full z-10">
                <div className="text-[10px] font-mono text-neutral-500 font-semibold">$380</div>
                <div className="w-full bg-neutral-200 hover:bg-neutral-300 rounded-t-xs h-10 transition-all cursor-help" title="Mañana" />
                <span className="text-[9px] text-neutral-400 font-mono">9 - 12h</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full z-10">
                <div className="text-[10px] font-mono text-neutral-500 font-semibold">$1,630</div>
                <div className="w-full bg-neutral-400 hover:bg-neutral-500 rounded-t-xs h-24 transition-all cursor-help" title="Almuerzo" />
                <span className="text-[9px] text-neutral-400 font-mono">12 - 15h</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full z-10">
                <div className="text-[10px] font-mono text-neutral-500 font-semibold">$1,215</div>
                <div className="w-full bg-neutral-300 hover:bg-neutral-400 rounded-t-xs h-16 transition-all cursor-help" title="Tarde" />
                <span className="text-[9px] text-neutral-400 font-mono">15 - 18h</span>
              </div>
              <div className="flex flex-col items-center gap-1 w-full z-10 animate-pulse">
                <div className="text-[10px] font-mono text-neutral-900 font-bold">$2,845</div>
                <div className="w-full bg-neutral-800 hover:bg-neutral-950 rounded-t-xs h-36 transition-all cursor-help" title="Cena" />
                <span className="text-[9px] text-neutral-950 font-bold font-mono">18 - 22h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular items & Categories breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Platillos Populares</h2>
            <p className="text-xs text-neutral-500">Basado en comanda y volumen histórico</p>
          </div>

          <div className="space-y-4">
            {popularDishes.map((dish, idx) => {
              const pct = Math.round((dish.count / maxPopularCount) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-800 truncate max-w-[200px]" title={dish.name}>
                      {idx + 1}. {dish.name}
                    </span>
                    <span className="text-neutral-500">{dish.count} uds • <span className="font-mono text-neutral-800">${dish.price}</span></span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        dish.category === 'entradas' ? 'bg-amber-400' :
                        dish.category === 'fuertes' ? 'bg-indigo-500' :
                        dish.category === 'bebidas' ? 'bg-teal-400' :
                        'bg-pink-400'
                      }`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}

            {popularDishes.length === 0 && (
              <div className="text-center py-6 text-neutral-400 text-xs">
                No hay transacciones registradas aún.
              </div>
            )}
          </div>

          {/* Categoría color keys */}
          <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" /> Entradas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs" /> Fuertes</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-400 rounded-xs" /> Bebidas</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-pink-400 rounded-xs" /> Postres</span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest block">Metas del Día</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Meta ventas:</span>
              <span className="font-semibold font-mono text-neutral-800">$10,000.00</span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-neutral-800 h-full" style={{ width: `${Math.min(100, (totalSalesRevenue / 10000) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-neutral-500 text-right block">
              {Math.round((totalSalesRevenue / 10000) * 100)}% completado
            </span>
          </div>
        </div>
      </div>

      {/* Recent Ledger Ledger Transactions */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Historial de Cobros Recientes</h2>
            <p className="text-xs text-neutral-500">Transacciones completadas debidamente registradas hoy</p>
          </div>
          <span className="text-xs font-mono text-neutral-500 bg-neutral-50 px-2 py-1 rounded border border-neutral-100 self-start sm:self-center">
            {sales.length} transacciones registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Mesa / Cliente</th>
                <th className="py-3 px-4">Mesero</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Propina</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-500">{sale.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-neutral-900">Mesa {sale.tableNumber}</span>
                    <span className="block text-[10px] text-neutral-400">{sale.guestName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">{sale.waiterName}</td>
                  <td className="py-3.5 px-4 font-mono">${sale.subtotal.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono text-violet-600 font-semibold">${sale.tip.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">${sale.total.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sale.paymentMethod === 'Efectivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      sale.paymentMethod === 'Tarjeta' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {sale.paymentMethod === 'Efectivo' && <DollarSign className="w-2.5 h-2.5" />}
                      {sale.paymentMethod === 'Tarjeta' && <CreditCard className="w-2.5 h-2.5" />}
                      {sale.paymentMethod === 'Transferencia' && <Receipt className="w-2.5 h-2.5" />}
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400 font-mono">
                    {new Date(sale.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(sale.dateTime).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-400 italic">
                    Sin ventas registradas en este turno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
