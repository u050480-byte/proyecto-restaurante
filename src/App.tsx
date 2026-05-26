import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { DashboardView } from './components/DashboardView';
import { TablesView } from './components/TablesView';
import { OrderView } from './components/OrderView';
import { ChefView } from './components/ChefView';
import { MenuView } from './components/MenuView';
import { BillingView } from './components/BillingView';
import { StaffView } from './components/StaffView';
import { CustomersView } from './components/CustomersView';
import { LoginView } from './components/LoginView';

import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Flame, 
  Utensils, 
  DollarSign, 
  Contact, 
  ChefHat, 
  Grid,
  LogOut
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, tables, orders, staff, currentUser, logout } = useRestaurant();

  // If no user is authenticaed, display the tactile login portal
  if (!currentUser) {
    return <LoginView />;
  }

  // Metrics indicators for top indicator bar
  const activeTablesCount = tables.filter(t => t.status !== 'disponible').length;
  const cookingTicketCount = orders.filter(o => o.status === 'en_preparacion').length;
  const activeChefsCount = staff.filter(s => s.role === 'Chef' && s.status === 'Activo').length;

  const userRole = currentUser.role;

  const allowedViewsByRole: Record<string, string[]> = {
    'Administrador': ['dashboard', 'mesas', 'comandas', 'cocina', 'menu', 'cobros', 'personal', 'clientes'],
    'Mesero': ['mesas', 'comandas', 'cocina', 'cobros'],
    'Chef': ['cocina'],
    'Cajero': ['cobros']
  };

  const allowed = allowedViewsByRole[userRole] || ['mesas'];

  const allNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, desc: 'Métricas y Ventas' },
    { id: 'mesas', label: 'Mesas y Estado', icon: <Grid className="w-4 h-4" />, desc: 'Salón y Asientos' },
    { id: 'comandas', label: 'Comandas', icon: <ShoppingBag className="w-4 h-4" />, desc: 'Pedidos Mesa' },
    { id: 'cocina', label: 'Cocina (Chef)', icon: <Flame className="w-4 h-4" />, desc: 'KDS Cocineros' },
    { id: 'menu', label: 'Platillos (Menú)', icon: <Utensils className="w-4 h-4" />, desc: 'Carta y Precios' },
    { id: 'cobros', label: 'Cobros POS', icon: <DollarSign className="w-4 h-4" />, desc: 'Caja y Facturas' },
    { id: 'personal', label: 'Roster Personal', icon: <Contact className="w-4 h-4" />, desc: 'Meseros y Turnos' },
    { id: 'clientes', label: 'Club de Clientes', icon: <Users className="w-4 h-4" />, desc: 'Puntos y Registro' },
  ];

  const navigationItems = allNavigationItems.filter(item => allowed.includes(item.id));

  const renderActiveView = () => {
    // Role route guard block
    if (!allowed.includes(activeView)) {
      const fallback = allowed[0];
      if (fallback === 'cocina') return <ChefView />;
      if (fallback === 'cobros') return <BillingView />;
      return <TablesView />;
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'mesas':
        return <TablesView />;
      case 'comandas':
        return <OrderView />;
      case 'cocina':
        return <ChefView />;
      case 'menu':
        return <MenuView />;
      case 'cobros':
        return <BillingView />;
      case 'personal':
        return <StaffView />;
      case 'clientes':
        return <CustomersView />;
      default:
        return allowed.includes('dashboard') ? <DashboardView /> : <TablesView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col md:flex-row text-neutral-800 font-sans" id="applet_canvas">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-neutral-150 shrink-0 flex flex-col justify-between" id="app_sidebar">
        <div>
          {/* Brand block header */}
          <div className="p-6 border-b border-neutral-100 flex items-center gap-2.5">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-neutral-900 leading-none">GastroGest ERP</h1>
              <span className="text-[10px] text-neutral-450 font-semibold block mt-1">Sabor y Eficiencia ❖</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold leading-normal transition-all flex items-center gap-3 cursor-pointer group ${
                    isSelected 
                      ? 'bg-neutral-900 text-white shadow-xs' 
                      : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'
                  }`}
                  id={`nav_link_${item.id}`}
                >
                  <span className={`p-1.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-50 border border-neutral-150 group-hover:bg-neutral-200 text-neutral-450 group-hover:text-neutral-600'
                  }`}>
                    {item.icon}
                  </span>
                  <div>
                    <span className="block">{item.label}</span>
                    <span className={`text-[9px] font-medium block mt-0.5 ${isSelected ? 'text-neutral-400' : 'text-neutral-400 group-hover:text-neutral-500'}`}>
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer info & logout */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neutral-250 border border-neutral-200 overflow-hidden shrink-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-indigo-650 text-white font-extrabold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-black text-neutral-800 truncate leading-none" title={currentUser.name}>
                {currentUser.name}
              </span>
              <span className="inline-block px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider font-mono text-indigo-750 bg-indigo-50 border border-indigo-150 mt-1">
                {currentUser.role}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full py-1.5 hover:bg-rose-50 text-neutral-450 hover:text-rose-600 border border-transparent hover:border-rose-200 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-neutral-100/60"
            title="Cerrar la sesión de usuario"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0" id="main_workspace">
        
        {/* UPPER REALTIME GENERAL ALERTS HEADER */}
        <header className="bg-white border-b border-neutral-150 h-16 px-6 shrink-0 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest hidden sm:inline">CENTRAL DE OPERACIONES</span>
            <span className="text-xs font-black text-neutral-800 sm:hidden">❖ GastroGest</span>
          </div>

          {/* KPI Mini capsules */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-150 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {activeTablesCount} mesas ocupadas
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1 border border-blue-150 font-mono text-[10px] hidden sm:flex">
              <Flame className="w-3 h-3 text-blue-500" />
              {cookingTicketCount} en cocina
            </span>
            <span className="bg-neutral-50 text-neutral-600 px-2 py-1 rounded-md flex items-center gap-1 border border-neutral-200 font-mono text-[10px] hidden md:flex">
              <Users className="w-3 h-3 text-neutral-400" />
              {activeChefsCount} chefs activos
            </span>
          </div>
        </header>

        {/* CORE WORKSPACE PANEL CONTENT */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto w-full max-w-7xl mx-auto">
          {renderActiveView()}
        </div>
      </main>

    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainLayout />
    </RestaurantProvider>
  );
}
