export type StaffRole = 'Mesero' | 'Chef' | 'Cajero' | 'Administrador';
export type StaffStatus = 'Activo' | 'Inactivo';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  avatar: string;
  tipsEarned: number;
  pinCode?: string; // Waiter secret PIN access (e.g. 4 digits)
}

export type TableStatus = 'disponible' | 'ocupada' | 'esperando_comida' | 'servida' | 'por_cobrar';

export interface RestaurantTable {
  id: string; // e.g. "1", "2", "3"
  number: number;
  seats: number;
  status: TableStatus;
  activeOrderId: string | null;
  guestName: string | null;
}

export type MenuCategory = 'entradas' | 'fuertes' | 'bebidas' | 'postres';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
  image: string;
}

export type OrderItemStatus = 'pendiente' | 'preparando' | 'listo' | 'servido';

export interface OrderItem {
  id: string; // MenuItem ID + unique notes/idx maybe
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: OrderItemStatus;
}

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo_para_servir' | 'entregado' | 'pagado';

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  guestName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface Sale {
  id: string;
  orderId: string;
  tableNumber: number;
  guestName: string;
  waiterName: string;
  itemsCount: number;
  subtotal: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  dateTime: string;
}
