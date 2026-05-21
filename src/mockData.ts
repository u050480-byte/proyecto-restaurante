import { StaffMember, RestaurantTable, MenuItem, Order, Sale } from './types';

export const initialStaff: StaffMember[] = [
  { id: 'st1', name: 'Carlos Mendoza', role: 'Chef', status: 'Activo', phone: '555-0199', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200', tipsEarned: 0, pinCode: '1111' },
  { id: 'st2', name: 'Laura Gómez', role: 'Chef', status: 'Activo', phone: '555-0122', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=200', tipsEarned: 0, pinCode: '2222' },
  { id: 'st3', name: 'Javier Pérez', role: 'Mesero', status: 'Activo', phone: '555-0144', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', tipsEarned: 1420, pinCode: '1234' },
  { id: 'st4', name: 'Sofía Ruíz', role: 'Mesero', status: 'Activo', phone: '555-0177', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', tipsEarned: 1850, pinCode: '4321' },
  { id: 'st5', name: 'Andrés Torres', role: 'Mesero', status: 'Activo', phone: '555-0188', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', tipsEarned: 980, pinCode: '5555' },
  { id: 'st6', name: 'Patricia Ortiz', role: 'Cajero', status: 'Activo', phone: '555-0111', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', tipsEarned: 0, pinCode: '9999' },
];

export const initialTables: RestaurantTable[] = [
  { id: 't1', number: 1, seats: 2, status: 'disponible', activeOrderId: null, guestName: null },
  { id: 't2', number: 2, seats: 2, status: 'ocupada', activeOrderId: 'ord1', guestName: 'Mariana Rosas' },
  { id: 't3', number: 3, seats: 4, status: 'esperando_comida', activeOrderId: 'ord2', guestName: 'Familia González' },
  { id: 't4', number: 4, seats: 4, status: 'disponible', activeOrderId: null, guestName: null },
  { id: 't5', number: 5, seats: 6, status: 'servida', activeOrderId: 'ord3', guestName: 'Grupo López' },
  { id: 't6', number: 6, seats: 8, status: 'disponible', activeOrderId: null, guestName: null },
  { id: 't7', number: 7, seats: 4, status: 'por_cobrar', activeOrderId: 'ord4', guestName: 'Ernesto Sanz' },
  { id: 't8', number: 8, seats: 2, status: 'disponible', activeOrderId: null, guestName: null },
];

export const initialMenu: MenuItem[] = [
  // Entradas
  {
    id: 'm1',
    name: 'Guacamole Artesanal con Totopos',
    description: 'Guacamole preparado al momento con aguacate de Michoacán, cilantro, jalapeño, un toque de limón y totopos norteños crujientes.',
    price: 135,
    category: 'entradas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm2',
    name: 'Tacos de Barbacoa de Arrachera (3 piezas)',
    description: 'Tierna barbacoa de arrachera de res en tortilla de maíz azul, con cebolla asada, cilantro y salsa verde tatemada.',
    price: 185,
    category: 'entradas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm3',
    name: 'Ceviche de Robalo al Cilantro',
    description: 'Fresco filete de robalo marinado en limón, cebolla roja, pepino, chile serrano y abundante cilantro, montado sobre tostadas horneadas.',
    price: 195,
    category: 'entradas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'
  },
  // Fuertes
  {
    id: 'm4',
    name: 'Arroz con Pollo Campestre',
    description: 'Arroz sazonado cocido a fuego lento con pechuga de pollo desmenuzada, pimientos asados, chícharos y plátano macho maduro frito.',
    price: 240,
    category: 'fuertes',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm5',
    name: 'Salmón Glaseado al Mezcal y Chipotle',
    description: 'Salmón fresco sellado a la plancha, bañado con reducción de mezcal y chile chipotle, acompañado de puré de camote rústico.',
    price: 345,
    category: 'fuertes',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm6',
    name: 'Corte Ribeye Premium a las Hierbas (350g)',
    description: 'Ribeye de res Angus Choice a la parrilla, sazonado con mantequilla de hierbas finas y ajo tatemado, acompañado de papas cambray rotas.',
    price: 490,
    category: 'fuertes',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm7',
    name: 'Pechuga Cordon Bleu en Salsa de Queso',
    description: 'Pechuga de pollo empanizada rellena de jamón premium y queso asadero fundido, bañada en una cremosa salsa de tres quesos espumando.',
    price: 260,
    category: 'fuertes',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1624462966581-bc6d768cbce5?auto=format&fit=crop&q=80&w=300'
  },
  // Bebidas
  {
    id: 'm8',
    name: 'Clericot de Vino Tinto de la Casa',
    description: 'Bebida premium con vino tinto nacional, ginger ale y trocitos finos de manzana verde, fresa, melón y naranja.',
    price: 110,
    category: 'bebidas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm9',
    name: 'Margarita de Maracuyá',
    description: 'Tequila reposado, pulpa de maracuyá fresca, licor de naranja Controy, jarabe natural y un escarchado de chamoy y chile piquín.',
    price: 130,
    category: 'bebidas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm10',
    name: 'Agua de Jamaica con Esencia de Romero',
    description: 'Refrescante agua de flor de jamaica orgánica infusionada en frío con romero fresco de nuestro huerto urbano.',
    price: 55,
    category: 'bebidas',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=300'
  },
  // Postres
  {
    id: 'm11',
    name: 'Flan Cremoso de Cajeta y Nuez',
    description: 'Suave flan casero horneado a baño María con cajeta quemada de Celaya y decorado con nueces pecanas tostadas.',
    price: 95,
    category: 'postres',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'm12',
    name: 'Volcán de Chocolate Fondant con Helado de Vainilla',
    description: 'Bizcocho de chocolate caliente con centro líquido fundido de cacao al 70%, coronado con una bola de helado de vainilla de Papantla.',
    price: 125,
    category: 'postres',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=300'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord1',
    tableId: 't2',
    tableNumber: 2,
    waiterId: 'st3',
    waiterName: 'Javier Pérez',
    guestName: 'Mariana Rosas',
    items: [
      { id: 'm1', menuItemId: 'm1', name: 'Guacamole Artesanal con Totopos', price: 135, quantity: 1, status: 'servido' },
      { id: 'm4', menuItemId: 'm4', name: 'Arroz con Pollo Campestre', price: 240, quantity: 1, status: 'preparando' },
      { id: 'm12', menuItemId: 'm12', name: 'Volcán de Chocolate Fondant con Helado de Vainilla', price: 125, quantity: 1, status: 'pendiente' }
    ],
    status: 'en_preparacion',
    createdAt: '2026-05-20T17:01:00Z',
    notes: 'Preparar postre sólo al final.'
  },
  {
    id: 'ord2',
    tableId: 't3',
    tableNumber: 3,
    waiterId: 'st4',
    waiterName: 'Sofía Ruíz',
    guestName: 'Familia González',
    items: [
      { id: 'm1-1', menuItemId: 'm1', name: 'Guacamole Artesanal con Totopos', price: 135, quantity: 1, status: 'pendiente' },
      { id: 'm7-1', menuItemId: 'm7', name: 'Pechuga Cordon Bleu en Salsa de Queso', price: 260, quantity: 2, status: 'pendiente' },
      { id: 'm10-1', menuItemId: 'm10', name: 'Agua de Jamaica con Esencia de Romero', price: 55, quantity: 3, status: 'pendiente' }
    ],
    status: 'pendiente',
    createdAt: '2026-05-20T17:35:00Z'
  },
  {
    id: 'ord3',
    tableId: 't5',
    tableNumber: 5,
    waiterId: 'st5',
    waiterName: 'Andrés Torres',
    guestName: 'Grupo López',
    items: [
      { id: 'm3-1', menuItemId: 'm3', name: 'Ceviche de Robalo al Cilantro', price: 195, quantity: 2, status: 'servido' },
      { id: 'm8-1', menuItemId: 'm8', name: 'Clericot de Vino Tinto de la Casa', price: 110, quantity: 4, status: 'servido' },
      { id: 'm5-1', menuItemId: 'm5', name: 'Salmón Glaseado al Mezcal y Chipotle', price: 345, quantity: 3, status: 'servido' }
    ],
    status: 'entregado',
    createdAt: '2026-05-20T16:15:00Z'
  },
  {
    id: 'ord4',
    tableId: 't7',
    tableNumber: 7,
    waiterId: 'st3',
    waiterName: 'Javier Pérez',
    guestName: 'Ernesto Sanz',
    items: [
      { id: 'm6-1', menuItemId: 'm6', name: 'Corte Ribeye Premium a las Hierbas (350g)', price: 490, quantity: 1, status: 'servido' },
      { id: 'm9-1', menuItemId: 'm9', name: 'Margarita de Maracuyá', price: 130, quantity: 2, status: 'servido' },
      { id: 'm11-1', menuItemId: 'm11', name: 'Flan Cremoso de Cajeta y Nuez', price: 95, quantity: 1, status: 'servido' }
    ],
    status: 'listo_para_servir', // Waiter served them but they've finished, ready to bill
    createdAt: '2026-05-20T15:50:00Z'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sal1',
    orderId: 'ord-past-1',
    tableNumber: 1,
    guestName: 'Roberto Díaz',
    waiterName: 'Laura Gómez',
    itemsCount: 3,
    subtotal: 510,
    tip: 51,
    total: 561,
    paymentMethod: 'Tarjeta',
    dateTime: '2026-05-20T12:30:00Z'
  },
  {
    id: 'sal2',
    orderId: 'ord-past-2',
    tableNumber: 4,
    guestName: 'Karla Jiménez',
    waiterName: 'Sofía Ruíz',
    itemsCount: 5,
    subtotal: 1120,
    tip: 168,
    total: 1288,
    paymentMethod: 'Efectivo',
    dateTime: '2026-05-20T14:15:00Z'
  },
  {
    id: 'sal3',
    orderId: 'ord-past-3',
    tableNumber: 8,
    guestName: 'Sonia Vega',
    waiterName: 'Andrés Torres',
    itemsCount: 2,
    subtotal: 435,
    tip: 45,
    total: 480,
    paymentMethod: 'Transferencia',
    dateTime: '2026-05-20T15:10:00Z'
  },
  {
    id: 'sal4',
    orderId: 'ord-past-4',
    tableNumber: 2,
    guestName: 'Alberto Ortiz',
    waiterName: 'Javier Pérez',
    itemsCount: 4,
    subtotal: 780,
    tip: 80,
    total: 860,
    paymentMethod: 'Tarjeta',
    dateTime: '2026-05-20T16:05:00Z'
  }
];
