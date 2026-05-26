import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Order, PaymentMethod } from '../types';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  Smile, 
  Calculator,
  User,
  Users,
  Printer,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Percent,
  Coins
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { 
    orders, 
    tables, 
    checkoutOrder, 
    sales, 
    selectedBillingOrderId, 
    setSelectedBillingOrderId,
    currentUser,
    staff,
    customers
  } = useRestaurant();

  // Active Selected Customer and points states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [pointsRedeemed, setPointsRedeemed] = useState<number>(0);

  // Active Selected Order maps to global shared state
  const selectedOrderId = selectedBillingOrderId;
  const setSelectedOrderId = setSelectedBillingOrderId;

  // Tip Calculations
  const [tipPercent, setTipPercent] = useState<number>(10); // default 10%
  const [customTip, setCustomTip] = useState<string>('');
  const [useCustomTip, setUseCustomTip] = useState(false);

  // Split calculation parameters
  const [splitCount, setSplitCount] = useState<number>(1);

  // Cash helper states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta');
  const [cashReceived, setCashReceived] = useState<string>('');

  // Receipt printed simulation toggle
  const [printedReceipt, setPrintedReceipt] = useState<boolean>(false);

  const activeOrders = orders.filter(o => o.status !== 'pagado');
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Math variables
  const orderSubtotal = selectedOrder 
    ? selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);
  const maxRedeemablePoints = selectedCustomerObj ? Math.min(selectedCustomerObj.points, orderSubtotal) : 0;
  
  // Real points used
  const actualPointsUsed = usePoints ? Math.min(pointsRedeemed, maxRedeemablePoints) : 0;
  const finalSubtotal = Math.max(0, orderSubtotal - actualPointsUsed);

  const getTipAmount = () => {
    if (useCustomTip) {
      return Number(customTip) || 0;
    }
    return (finalSubtotal * tipPercent) / 100;
  };

  const tipAmount = getTipAmount();
  const orderTotal = finalSubtotal + tipAmount;

  // Split calculations
  const perPersonTotal = splitCount > 1 ? orderTotal / splitCount : orderTotal;

  // Cash change calculations
  const cashChange = (Number(cashReceived) || 0) - orderTotal;

  // Invoice Ticket PDF generator helper
  const handleDownloadPDFTicket = () => {
    if (!selectedOrder) return;
    
    const separator = "========================================\n";
    const line = "----------------------------------------\n";
    let receiptContent = "";
    receiptContent += "         ❖ GASTROGEST SOFTWARE ❖        \n";
    receiptContent += "          Sabor y Tradicion S.A.        \n";
    receiptContent += "       CDMX, MEXICO - POST CODE: 03020  \n";
    receiptContent += separator;
    receiptContent += `TICKET FACTURA FISCAL: ${selectedOrder.id}\n`;
    receiptContent += `Fecha: ${new Date().toLocaleDateString('es-MX')}  Hora: ${new Date().toLocaleTimeString('es-MX')}\n`;
    receiptContent += `Mesa: ${selectedOrder.tableNumber}   Mesero: ${selectedOrder.waiterName}\n`;
    if (selectedCustomerId && selectedCustomerObj) {
      receiptContent += `Cliente Frecuente: ${selectedCustomerObj.name}\n`;
      receiptContent += `ID Socio Club: ${selectedCustomerObj.id}\n`;
    } else {
      receiptContent += `Cliente: ${selectedOrder.guestName}\n`;
    }
    receiptContent += separator;
    receiptContent += "CANT   PRODUCTO                 IMPORTE \n";
    receiptContent += line;
    selectedOrder.items.forEach(item => {
      const qtyStr = `${item.quantity}x`.padEnd(6);
      const nameStr = item.name.substring(0, 22).padEnd(24);
      const priceStr = `$${(item.price * item.quantity).toFixed(2)}`.padStart(8);
      receiptContent += `${qtyStr}${nameStr}${priceStr}\n`;
    });
    receiptContent += separator;
    receiptContent += `SUBTOTAL PLATILLOS:        $${orderSubtotal.toFixed(2)}\n`;
    if (usePoints && pointsRedeemed > 0) {
      receiptContent += `DESCUENTO MONEDERO CLUB:  -$${pointsRedeemed.toFixed(2)}\n`;
      receiptContent += `SUBTOTAL CON DESCUENTO:    $${finalSubtotal.toFixed(2)}\n`;
    }
    receiptContent += `PROPINA VOLUNTARIA:        $${tipAmount.toFixed(2)}\n`;
    receiptContent += line;
    receiptContent += `TOTAL COMPLETADO POS:      $${orderTotal.toFixed(2)}\n`;
    receiptContent += separator;
    receiptContent += "     MUCHAS GRACIAS POR SU PREFERENCIA  \n";
    receiptContent += "      GastroGest ERP Software System    \n";
    
    // Download TXT represented invoice standard 58mm POS thermal print
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ventas_Ticket_Mesa_${selectedOrder.tableNumber}_${selectedOrder.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessPayment = () => {
    if (!selectedOrder) return;

    let tipAllocation = undefined;
    if (tipAmount > 0) {
      tipAllocation = {
        waiter1Id: selectedOrder.waiterId,
        waiter1Amount: tipAmount
      };
    }

    checkoutOrder(selectedOrder.id, orderSubtotal, tipAmount, paymentMethod, tipAllocation, selectedCustomerId || undefined, actualPointsUsed);
    setPrintedReceipt(true);
    
    // Clear state
    setCashReceived('');
    setSplitCount(1);
  };

  const handleNextBilling = () => {
    setSelectedOrderId(null);
    setPrintedReceipt(false);
    setUseCustomTip(false);
    setCustomTip('');
    setTipPercent(10);
    setSelectedCustomerId('');
    setUsePoints(false);
    setPointsRedeemed(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="billing_view_container">
      
      {/* LEFT COLUMN: ACTIVE UNPAID TABLES SECTION */}
      <div className="lg:col-span-1 space-y-6">
        <div className="border-b border-neutral-100 pb-3">
          <h2 className="text-lg font-bold text-neutral-900">Caja y Cuentas Activas</h2>
          <p className="text-xs text-neutral-500">Selecciona una mesa con comanda abierta para procesar el cobro</p>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {activeOrders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setPrintedReceipt(false);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative ${
                  isSelected 
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                    : 'border-neutral-150 bg-white text-neutral-800 hover:bg-neutral-50/70 shadow-2xs'
                }`}
                id={`billing_order_select_${order.id}`}
              >
                {/* Hidden ID helper targetable for automated trigger */}
                <button id={`billing_order_select_${order.id}`} className="hidden" />

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-[13px] ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      Mesa {order.tableNumber} • {order.guestName}
                    </h3>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-neutral-450' : 'text-neutral-500'}`}>
                      Atendió: <span className="font-bold">{order.waiterName}</span>
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                      order.status === 'listo_para_servir' || order.status === 'entregado'
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                    }`}>
                      {order.status === 'listo_para_servir' ? 'Listo!' : order.status === 'entregado' ? 'Servida' : 'Ordenando'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-neutral-200/50">
                  <span className={`text-[10px] font-mono uppercase ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {itemsCount} platillos
                  </span>
                  <span className={`text-sm font-black font-monoPin ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}

          {activeOrders.length === 0 && (
            <div className="text-center py-12 bg-white border border-dashed rounded-2xl text-neutral-400 text-xs">
              No hay cuentas activas por cobrar ahora. ¡Comedor despejado!
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE & RIGHT: BILLING WORKSTATION */}
      <div className="lg:col-span-2 space-y-6">
        {selectedOrder ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white border border-neutral-100 rounded-2xl p-6 shadow-xs">
            
            {/* Split A: Billing settings, Tip, splits (Col span 7) */}
            <div className="md:col-span-7 space-y-6">
              <div className="border-b border-neutral-150 pb-3">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest block mb-0.5">ESTACIÓN REGISTRADORA</span>
                <h3 className="font-bold text-sm text-neutral-900">
                  Mesa {selectedOrder.tableNumber} • Cuenta por: {selectedOrder.guestName}
                </h3>
              </div>

              {/* CUSTOMER LOYALTY ASSOCIATION FOR REWARDS */}
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/70 space-y-3">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-750 block leading-none">Club GastroGest & Frecuentes</span>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Asociar Socio Club</label>
                    <select
                      value={selectedCustomerId}
                      disabled={printedReceipt}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setUsePoints(false);
                        setPointsRedeemed(0);
                      }}
                      className="bg-white border border-neutral-200 text-xs text-neutral-800 rounded px-2.5 py-1.5 w-full focus:outline-none"
                    >
                      <option value="">-- Comensal General (Sin registrar) --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.points} pts disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedCustomerObj && (
                  <div className="bg-white p-3 rounded-lg border border-indigo-100/70 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-neutral-850">
                        {selectedCustomerObj.name} • <span className="font-mono text-[10px] text-neutral-450">{selectedCustomerObj.id}</span>
                      </span>
                      <span className="font-mono text-indigo-700 font-bold bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-full text-[10px]">
                        {selectedCustomerObj.points} pts ($ {selectedCustomerObj.points}.00)
                      </span>
                    </div>

                    {selectedCustomerObj.points > 0 ? (
                      <div className="space-y-2 pt-1 border-t border-indigo-50">
                        <label className="flex items-center gap-2 font-semibold text-neutral-700 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={usePoints}
                            disabled={printedReceipt}
                            onChange={(e) => {
                              setUsePoints(e.target.checked);
                              if (e.target.checked) setPointsRedeemed(selectedCustomerObj.points);
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          Redimir puntos acumulados en esta comanda
                        </label>
                        
                        {usePoints && (
                          <div className="flex items-center gap-2 pl-5">
                            <span className="text-[10px] text-neutral-400">Monto pesos a descontar:</span>
                            <input
                              type="number"
                              min="0"
                              max={maxRedeemablePoints}
                              disabled={printedReceipt}
                              value={pointsRedeemed}
                              onChange={(e) => setPointsRedeemed(Math.min(maxRedeemablePoints, Math.max(0, Number(e.target.value))))}
                              className="w-24 bg-neutral-50 px-2 py-1 text-xs font-mono font-bold text-neutral-800 rounded border focus:outline-none"
                            />
                            <span className="text-[10px] text-neutral-450 italic">(Máx útil en este ticket: {maxRedeemablePoints} pts)</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-indigo-500 font-semibold italic">Este comensal no posee saldo de recompensa disponible. Recibirá un reintegro del 10% de su subtotal con el pago exitoso.</p>
                    )}
                  </div>
                )}
              </div>

              {!printedReceipt ? (
                <>
                  {/* TIP SELECTION ZONE */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-neutral-400" />
                      Porcentaje de Propina (Waiter Tips)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([0, 10, 15, 20] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setTipPercent(p);
                            setUseCustomTip(false);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            !useCustomTip && tipPercent === p
                              ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                          }`}
                        >
                          {p === 0 ? 'Sin Propina' : `${p}%`}
                        </button>
                      ))}
                    </div>

                    {/* Alternatively, custom tip */}
                    <div className="pt-1.5 flex gap-2">
                      <button
                        onClick={() => setUseCustomTip(!useCustomTip)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                          useCustomTip ? 'bg-neutral-100 border border-neutral-300 text-neutral-800' : 'bg-neutral-50 text-neutral-450 border border-neutral-100'
                        }`}
                      >
                        Monto Customizado
                      </button>
                      {useCustomTip && (
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 font-mono text-xs text-neutral-400 font-bold">$</span>
                          <input
                            type="number"
                            placeholder="Ej. 100"
                            value={customTip}
                            onChange={(e) => setCustomTip(e.target.value)}
                            className="bg-white border border-neutral-200 pl-6 pr-3 py-1.5 w-full rounded-lg text-xs font-mono focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* TIP RECIPIENT LOUDSPEAKER (No modifications permitted as they stay assigned to serving waiter) */}
                    {tipAmount > 0 && (
                      <div className="mt-3.5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                            Propina Asignada (${tipAmount.toFixed(2)})
                          </label>
                          <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold font-mono tracking-wide">MESERO ASIGNADO</span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-normal">
                          El 100% de la propina (${tipAmount.toFixed(2)}) se destina de forma directa al mesero responsable que abrió la comanda: <span className="font-bold text-neutral-800">{selectedOrder.waiterName}</span>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* BILL SPLITTING SECTION */}
                  <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                    <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      Dividor de Cuentas (Split Bill)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={splitCount}
                        onChange={(e) => setSplitCount(Math.max(1, Number(e.target.value)))}
                        className="bg-white border border-neutral-200 rounded-lg px-3 py-2 w-20 text-center font-semibold font-mono text-xs focus:outline-none"
                      />
                      <span className="text-[11px] text-neutral-500 leading-normal">
                        Para salidas de amigos o eventos. Divide el total equitativamente entre las personas especificadas.
                      </span>
                    </div>

                    {splitCount > 1 && (
                      <div className="pt-2 text-xs border-t border-dashed border-neutral-200 flex justify-between font-bold text-indigo-700">
                        <span>Cada uno paga ({splitCount} partes):</span>
                        <span className="font-mono text-sm">${perPersonTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* PAYMENT METHOD SELECTION */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-700 block">Forma de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Tarjeta', 'Efectivo', 'Transferencia'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === method
                              ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          {method === 'Tarjeta' && <CreditCard className="w-4 h-4" />}
                          {method === 'Efectivo' && <DollarSign className="w-4 h-4" />}
                          {method === 'Transferencia' && <Receipt className="w-4 h-4" />}
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CASH CHANGE HELPER PANEL */}
                  {paymentMethod === 'Efectivo' && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-150 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                          Asistente del Cajero (Arqueo)
                        </label>
                        <span className="text-[10px] text-emerald-600 bg-white/60 px-2 py-0.5 rounded-sm font-semibold">Caja Abierta</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Paga con billete:</span>
                          <input
                            type="number"
                            placeholder="Ej. $500"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="bg-white border border-emerald-250 rounded-lg px-2.5 py-1.5 w-full font-mono font-bold text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Cambio a regresar:</span>
                          <div className="font-mono text-base font-black text-emerald-900 pt-1">
                            ${cashChange >= 0 ? cashChange.toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBMIT SUBMIT BUTTON */}
                  <button
                    onClick={handleProcessPayment}
                    className="w-full text-center py-3 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    Procesar Liquidación Cuenta (Total: ${orderTotal.toFixed(2)})
                  </button>
                </>
              ) : (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">¡Cuenta Pagada Exitosamente!</h3>
                    <p className="text-xs text-neutral-500 mt-1">La mesa ha sido liberada y los ingresos acumulados al panel</p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-xl text-xs font-mono text-neutral-600 border space-y-2 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-150 font-sans">
                       <span className="font-bold text-neutral-800">Distribución de Propina:</span>
                       <span className="font-black text-indigo-750 font-mono">${tipAmount.toFixed(2)}</span>
                    </div>
                    {tipAmount <= 0 ? (
                      <span className="text-neutral-450 block text-center py-1 font-sans">Sin propina asignada en esta cuenta.</span>
                    ) : (
                      <div className="flex justify-between items-center text-[11px] pt-1 font-sans">
                        <span>Para Mesero de Mesa ({selectedOrder.waiterName}):</span>
                        <span className="font-bold text-neutral-950 font-mono">${tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleNextBilling}
                    className="w-full mx-auto py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Ir al Siguiente Cobro Comensal
                  </button>
                </div>
              )}
            </div>

            {/* Split B: Beautiful simulated physical receipts (Col span 5) */}
            <div className="md:col-span-5 border border-dashed border-neutral-350 p-4 rounded-xl bg-neutral-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase font-black text-neutral-400">VISTA PREVIA TICKET</p>
                  <span className="p-1 text-neutral-400 hover:text-neutral-600 cursor-help" title="Diseño listo para terminal de calor 58mm">
                    <Printer className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Simulated physical layout */}
                <div className="bg-white border rounded-lg p-5 shadow-inner text-xs font-mono space-y-4 max-h-[350px] overflow-y-auto min-w-[200px]" id="simulated_ticket_box">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] block font-bold text-neutral-400">❖ GASTROGEST ❖</span>
                    <p className="font-black text-sm text-neutral-900 font-sans tracking-tight">Sabor y Tradición</p>
                    <p className="text-[9px] text-neutral-400">CDMX, MEXICO • C.P 03020</p>
                    <p className="text-[9.5px] text-neutral-500">Mesa: {selectedOrder.tableNumber} • Turno: {selectedOrder.id}</p>
                  </div>

                  <div className="border-t border-b border-dashed border-neutral-300 py-3 space-y-1.5 text-[9.5px]">
                    <div className="flex justify-between">
                      <span>Cliente:</span>
                      <span className="font-bold truncate max-w-[120px]">{selectedOrder.guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atendió:</span>
                      <span className="font-bold truncate max-w-[120px]">{selectedOrder.waiterName}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Impreso:</span>
                      <span>{new Date().toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>

                  {/* List of items ordered */}
                  <div className="space-y-2 py-1 text-[9px]">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-1">
                        <span className="truncate max-w-[140px]">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-bold shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations ledger */}
                  <div className="border-t border-dashed border-neutral-300 pt-3 space-y-1.5 text-[9.5px]">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal Alimentos:</span>
                      <span>${orderSubtotal.toFixed(2)}</span>
                    </div>
                    {actualPointsUsed > 0 && (
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Descuento Monedero Club:</span>
                        <span>-${actualPointsUsed.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-500">
                      <span>Propina voluntaria ({useCustomTip ? 'custom' : `${tipPercent}%`}):</span>
                      <span>${tipAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-neutral-900 border-t border-dashed border-neutral-300 pt-1 text-[11px]">
                      <span>TOTAL TICKET:</span>
                      <span>${orderTotal.toFixed(2)}</span>
                    </div>

                    {splitCount > 1 && (
                      <div className="text-[9px] text-indigo-700 font-bold border-t border-dotted border-indigo-200 pt-1 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Split x{splitCount} Personas:</span>
                          <span>${perPersonTotal.toFixed(2)} c/u</span>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Efectivo' && cashReceived && (
                      <div className="text-[9px] text-neutral-500 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Efectivo Recibido:</span>
                          <span>${Number(cashReceived).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Su cambio:</span>
                          <span>${cashChange >= 0 ? cashChange.toFixed(2) : '0.00'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-2 text-[9px] text-neutral-400 border-t border-dashed border-neutral-200">
                    <p className="font-bold">¡MUCHAS GRACIAS POR SU VISITA!</p>
                    <p className="mt-0.5 italic">GastroGest ERP Software System</p>
                  </div>
                </div>
              </div>

              {/* Action standard receipt printable trigger */}
              <div className="px-1 text-center py-1">
                <button
                  onClick={handleDownloadPDFTicket}
                  className="w-full text-center py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Descargar Ticket PDF (Fiscal)
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-neutral-400 font-semibold italic flex items-center justify-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-yellow-500" />
                  El ticket de mesa se actualiza en vivo al pulsar propinas arriba
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border rounded-2xl p-12 text-center text-neutral-400 min-h-[400px] flex flex-col justify-center items-center gap-3">
            <span className="p-4 bg-neutral-50 text-neutral-400 rounded-full">
              <DollarSign className="w-10 h-10" />
            </span>
            <p className="text-sm font-semibold text-neutral-700">Terminal Punto de Venta (POS)</p>
            <p className="text-xs text-neutral-400 max-w-sm">
              Selecciona una mesa con consumos acumulados en la barra lateral para procesar el pago de la cuenta de alimentos, calcular propinas y simular recibo.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
