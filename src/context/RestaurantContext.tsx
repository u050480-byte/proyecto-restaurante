import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffMember, RestaurantTable, MenuItem, Order, Sale, OrderStatus, OrderItemStatus, PaymentMethod, TableStatus, MenuCategory, StaffRole, Customer } from '../types';
import { initialStaff, initialTables, initialMenu, initialOrders, initialSales, initialCustomers } from '../mockData';

interface RestaurantContextType {
  staff: StaffMember[];
  tables: RestaurantTable[];
  menu: MenuItem[];
  orders: Order[];
  sales: Sale[];
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: StaffMember | { id: 'admin'; name: string; role: 'Administrador'; avatar?: string } | null;
  login: (id: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;
  selectedBillingOrderId: string | null;
  setSelectedBillingOrderId: (id: string | null) => void;
  
  // Staff actions
  addStaff: (member: Omit<StaffMember, 'id' | 'tipsEarned'>) => void;
  toggleStaffStatus: (id: string) => void;
  deleteStaff: (id: string) => void;
  
  // Table actions
  addTable: (seats: number) => void;
  occupyTable: (tableId: string, guestName: string, waiterId: string) => void;
  releaseTable: (tableId: string) => void;
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  
  // Menu actions
  addMenuDish: (dish: Omit<MenuItem, 'id'>) => void;
  updateMenuDish: (dish: MenuItem) => void;
  deleteMenuDish: (id: string) => void;
  toggleDishAvailability: (id: string) => void;
  
  // Order actions
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  addItemsToOrder: (orderId: string, newItems: Omit<Order['items'][0], 'id' | 'status'>[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItemStatus) => void;
  cancelOrder: (orderId: string) => void;
  
  // Billing actions
  checkoutOrder: (
    orderId: string, 
    subtotal: number, 
    tip: number, 
    paymentMethod: PaymentMethod,
    tipAllocation?: {
      waiter1Id: string;
      waiter1Amount: number;
      waiter2Id?: string;
      waiter2Amount?: number;
    },
    customerId?: string,
    pointsRedeemed?: number
  ) => void;

  // Customers actions
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'points' | 'visitCount' | 'totalSpent' | 'purchaseHistory'>) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load from localStorage first or fallback to mockData
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('rest_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem('rest_tables');
    return saved ? JSON.parse(saved) : initialTables;
  });

  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('rest_menu');
    return saved ? JSON.parse(saved) : initialMenu;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rest_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('rest_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('rest_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [activeView, setActiveView] = useState<string>('dashboard');

  const [currentUser, setCurrentUser] = useState<StaffMember | { id: 'admin'; name: string; role: 'Administrador'; avatar?: string } | null>(() => {
    const saved = localStorage.getItem('rest_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedBillingOrderId, setSelectedBillingOrderId] = useState<string | null>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('rest_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('rest_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rest_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('rest_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('rest_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rest_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('rest_customers', JSON.stringify(customers));
  }, [customers]);

  const login = (id: string, pin: string): { success: boolean; error?: string } => {
    if (id === 'admin') {
      if (pin === '0000') {
        const adminUser = { 
          id: 'admin' as const, 
          name: 'Administrador General', 
          role: 'Administrador' as const, 
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' 
        };
        setCurrentUser(adminUser);
        setActiveView('dashboard');
        return { success: true };
      }
      return { success: false, error: 'PIN de Administrador incorrecto (Por defecto: 0000)' };
    }

    const member = staff.find(s => s.id === id);
    if (!member) {
      return { success: false, error: 'Usuario no encontrado en la plantilla' };
    }

    if (member.status === 'Inactivo') {
      return { success: false, error: 'Este empleado está inactivo del turno actual' };
    }

    if (member.pinCode === pin) {
      setCurrentUser(member);
      if (member.role === 'Mesero') {
        setActiveView('mesas');
      } else if (member.role === 'Chef') {
        setActiveView('cocina');
      } else if (member.role === 'Cajero') {
        setActiveView('cobros');
      } else {
        setActiveView('dashboard');
      }
      return { success: true };
    }

    return { success: false, error: 'PIN incorrecto' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // --- STAFF ACTIONS ---
  const addStaff = (member: Omit<StaffMember, 'id' | 'tipsEarned'>) => {
    const newMember: StaffMember = {
      ...member,
      id: `st${Date.now()}`,
      tipsEarned: 0
    };
    setStaff(prev => [...prev, newMember]);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'Activo' ? 'Inactivo' : 'Activo' } : m));
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(m => m.id !== id));
  };

  // --- TABLE ACTIONS ---
  const addTable = (seats: number) => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    const newTable: RestaurantTable = {
      id: `t${Date.now()}`,
      number: nextNum,
      seats,
      status: 'disponible',
      activeOrderId: null,
      guestName: null
    };
    setTables(prev => [...prev, newTable]);
  };

  const occupyTable = (tableId: string, guestName: string, waiterId: string) => {
    const waiter = staff.find(s => s.id === waiterId);
    const waiterName = waiter ? waiter.name : 'Mesero General';
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const orderId = `ord${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      tableId,
      tableNumber: table.number,
      waiterId,
      waiterName,
      guestName: guestName || `Cliente Mesa ${table.number}`,
      items: [],
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'ocupada',
      activeOrderId: orderId,
      guestName: guestName || `Mesa ${table.number}`
    } : t));
  };

  const releaseTable = (tableId: string) => {
    setTables(prev => prev.map(t => t.id === tableId ? {
      ...t,
      status: 'disponible',
      activeOrderId: null,
      guestName: null
    } : t));
  };

  const updateTableStatus = (tableId: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  // --- MENU ACTIONS ---
  const addMenuDish = (dish: Omit<MenuItem, 'id'>) => {
    const newDish: MenuItem = {
      ...dish,
      id: `m${Date.now()}`
    };
    setMenu(prev => [...prev, newDish]);
  };

  const updateMenuDish = (dish: MenuItem) => {
    setMenu(prev => prev.map(d => d.id === dish.id ? dish : d));
  };

  const deleteMenuDish = (id: string) => {
    setMenu(prev => prev.filter(d => d.id !== id));
  };

  const toggleDishAvailability = (id: string) => {
    setMenu(prev => prev.map(d => d.id === id ? { ...d, isAvailable: !d.isAvailable } : d));
  };

  // --- ORDER ACTIONS ---
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): string => {
    const orderId = `ord${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id === orderData.tableId ? {
      ...t,
      status: 'ocupada',
      activeOrderId: orderId,
      guestName: orderData.guestName
    } : t));
    return orderId;
  };

  const addItemsToOrder = (orderId: string, newItems: Omit<Order['items'][0], 'id' | 'status'>[]) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      const formattedItems = newItems.map((item, idx) => ({
        ...item,
        id: `${item.menuItemId}-${Date.now()}-${idx}`,
        status: 'pendiente' as OrderItemStatus
      }));

      // Set order status back to pending/en_preparacion when new items are added
      return {
        ...o,
        items: [...o.items, ...formattedItems],
        status: o.status === 'pagado' ? 'pagado' : 'pendiente'
      };
    }));

    // Update table status if appropriate
    const orderObj = orders.find(o => o.id === orderId);
    if (orderObj) {
      setTables(prev => prev.map(t => t.id === orderObj.tableId && t.status === 'disponible' ? { ...t, status: 'ocupada' } : t));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      let updatedItems = [...o.items];
      if (status === 'en_preparacion') {
        updatedItems = o.items.map(item => ({ ...item, status: 'preparando' as OrderItemStatus }));
      } else if (status === 'listo_para_servir') {
        updatedItems = o.items.map(item => ({ ...item, status: 'listo' as OrderItemStatus }));
      } else if (status === 'entregado') {
        updatedItems = o.items.map(item => ({ ...item, status: 'servido' as OrderItemStatus }));
      }
      
      return {
        ...o,
        status,
        items: updatedItems
      };
    }));
    
    // Auto-update table status based on order status
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    let tableStatus: TableStatus = 'ocupada';
    if (status === 'en_preparacion') {
      tableStatus = 'esperando_comida';
    } else if (status === 'listo_para_servir') {
      tableStatus = 'servida';
    } else if (status === 'entregado') {
      tableStatus = 'servida';
    } else if (status === 'pagado') {
      tableStatus = 'disponible';
    }
    
    setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: tableStatus } : t));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItemStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      
      const updatedItems = o.items.map(item => 
        item.id === itemId ? { ...item, status } : item
      );

      // Check order overall status based on items
      let overallStatus: OrderStatus = o.status;
      
      const allReady = updatedItems.every(i => i.status === 'listo' || i.status === 'servido');
      const somePreparing = updatedItems.some(i => i.status === 'preparando');
      const allServed = updatedItems.every(i => i.status === 'servido');

      if (allServed) {
        overallStatus = 'entregado';
      } else if (allReady) {
        overallStatus = 'listo_para_servir';
      } else if (somePreparing) {
        overallStatus = 'en_preparacion';
      }

      return {
        ...o,
        items: updatedItems,
        status: overallStatus
      };
    }));

    // Update table status if appropriate
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    let tableStatus: TableStatus = 'esperando_comida';
    if (status === 'listo') {
      // Find table and check if indeed we have ready elements
      tableStatus = 'servida';
    } else if (status === 'servido') {
      tableStatus = 'servida';
    }
    
    setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: tableStatus } : t));
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setTables(prev => prev.map(t => t.id === order.tableId ? {
      ...t,
      status: 'disponible',
      activeOrderId: null,
      guestName: null
    } : t));
  };

  // --- CUSTOMER ACTIONS ---
  const addCustomer = (custData: Omit<Customer, 'id' | 'points' | 'visitCount' | 'totalSpent' | 'purchaseHistory'>) => {
    const newCustomer: Customer = {
      ...custData,
      id: `c${Date.now()}`,
      points: 0,
      visitCount: 0,
      totalSpent: 0,
      purchaseHistory: []
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  // --- BILLING / COBROS ACTIONS ---
  const checkoutOrder = (
    orderId: string, 
    subtotal: number, 
    tip: number, 
    paymentMethod: PaymentMethod,
    tipAllocation?: {
      waiter1Id: string;
      waiter1Amount: number;
      waiter2Id?: string;
      waiter2Amount?: number;
    },
    customerId?: string,
    pointsRedeemed: number = 0
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Apply point values as absolute cash discount: 1 point = $1.00 mxn
    const discount = pointsRedeemed; 
    const finalSubtotal = Math.max(0, subtotal - discount);
    const total = finalSubtotal + tip;
    
    const saleId = `sal${Date.now()}`;
    const newSale: Sale = {
      id: saleId,
      orderId,
      tableNumber: order.tableNumber,
      guestName: order.guestName,
      waiterName: order.waiterName,
      itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: finalSubtotal,
      tip,
      total,
      paymentMethod,
      dateTime: new Date().toISOString()
    };

    // Add to sales list
    setSales(prev => [newSale, ...prev]);

    // Update order status to paid
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pagado' } : o));

    // Handle customer loyalty registration, point subtraction, spend stats and earned rewards
    if (customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id !== customerId) return c;
        // Earn 10% on paid subtotal
        const earnedPoints = Math.round(finalSubtotal * 0.1);
        const nextPoints = Math.max(0, c.points - discount + earnedPoints);
        return {
          ...c,
          points: nextPoints,
          visitCount: c.visitCount + 1,
          totalSpent: c.totalSpent + total,
          purchaseHistory: [
            ...c.purchaseHistory,
            {
              dateTime: new Date().toISOString(),
              subtotal: finalSubtotal,
              total,
              saleId,
              orderId
            }
          ]
        };
      }));
    }

    // Release table
    setTables(prev => prev.map(t => t.id === order.tableId ? {
      ...t,
      status: 'disponible',
      activeOrderId: null,
      guestName: null
    } : t));

    // Assign tips to waiter(s)
    if (tip > 0) {
      if (tipAllocation) {
        setStaff(prev => prev.map(s => {
          let updatedTips = s.tipsEarned;
          if (s.id === tipAllocation.waiter1Id) {
            updatedTips += tipAllocation.waiter1Amount;
          }
          if (tipAllocation.waiter2Id && s.id === tipAllocation.waiter2Id) {
            updatedTips += tipAllocation.waiter2Amount || 0;
          }
          return updatedTips !== s.tipsEarned ? { ...s, tipsEarned: updatedTips } : s;
        }));
      } else if (order.waiterId) {
        setStaff(prev => prev.map(s => s.id === order.waiterId ? {
          ...s,
          tipsEarned: s.tipsEarned + tip
        } : s));
      }
    }
  };

  return (
    <RestaurantContext.Provider value={{
      staff,
      tables,
      menu,
      orders,
      sales,
      activeView,
      setActiveView,
      currentUser,
      login,
      logout,
      selectedBillingOrderId,
      setSelectedBillingOrderId,
      addStaff,
      toggleStaffStatus,
      deleteStaff,
      addTable,
      occupyTable,
      releaseTable,
      updateTableStatus,
      addMenuDish,
      updateMenuDish,
      deleteMenuDish,
      toggleDishAvailability,
      createOrder,
      addItemsToOrder,
      updateOrderStatus,
      updateOrderItemStatus,
      cancelOrder,
      checkoutOrder,
      customers,
      addCustomer
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
