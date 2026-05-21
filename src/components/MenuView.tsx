import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, MenuCategory } from '../types';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  Coffee, 
  Flame, 
  Apple, 
  IceCream,
  DollarSign
} from 'lucide-react';

export const MenuView: React.FC = () => {
  const { menu, addMenuDish, updateMenuDish, deleteMenuDish, toggleDishAvailability } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'todos'>('todos');
  
  // Create / Edit Dish state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  
  // Form State
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState<number>(120);
  const [dishCategory, setDishCategory] = useState<MenuCategory>('fuertes');
  const [dishImage, setDishImage] = useState('');
  const [dishIsAvailable, setDishIsAvailable] = useState(true);

  const resetForm = () => {
    setDishName('');
    setDishDescription('');
    setDishPrice(120);
    setDishCategory('fuertes');
    setDishImage('');
    setDishIsAvailable(true);
    setEditingDishId(null);
    setIsEditing(false);
  };

  const handleEditClick = (dish: MenuItem) => {
    setEditingDishId(dish.id);
    setDishName(dish.name);
    setDishDescription(dish.description);
    setDishPrice(dish.price);
    setDishCategory(dish.category);
    setDishImage(dish.image);
    setDishIsAvailable(dish.isAvailable);
    setIsEditing(true);
    
    // Smooth scroll to top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || dishPrice <= 0) return;

    // Use placeholder Unsplash image if empty
    const finalImage = dishImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300';

    if (editingDishId) {
      // Update
      updateMenuDish({
        id: editingDishId,
        name: dishName,
        description: dishDescription,
        price: dishPrice,
        category: dishCategory,
        image: finalImage,
        isAvailable: dishIsAvailable
      });
    } else {
      // Add
      addMenuDish({
        name: dishName,
        description: dishDescription,
        price: dishPrice,
        category: dishCategory,
        image: finalImage,
        isAvailable: dishIsAvailable
      });
    }
    resetForm();
  };

  // Filter menu
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryDetails = (category: MenuCategory) => {
    switch (category) {
      case 'entradas':
        return { label: 'Entradas', icon: <Apple className="w-4 h-4 text-amber-500" /> };
      case 'fuertes':
        return { label: 'Platos Fuertes', icon: <Flame className="w-4 h-4 text-rose-500" /> };
      case 'bebidas':
        return { label: 'Bebidas Recurrentes', icon: <Coffee className="w-4 h-4 text-blue-500" /> };
      case 'postres':
        return { label: 'Postres Finos', icon: <IceCream className="w-4 h-4 text-pink-500" /> };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="menu_view_container">
      {/* View Header */}
      <div className="border-b border-neutral-100 pb-5">
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Catálogo de Platillos y Menú</h1>
        <p className="text-sm text-neutral-500">Diseña bocados, edita precios, agrega platillos del chef y gestiona inventario cocina</p>
      </div>

      {/* Editor Panel Toggle / Form */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
          <h2 className="text-base font-bold text-neutral-900">
            {editingDishId ? 'Editar Detalle de Platillo' : 'Registrar Nuevo Platillo en Menú'}
          </h2>
          {isEditing && (
            <button onClick={resetForm} className="text-xs font-semibold text-neutral-400 hover:text-neutral-600">
              Descartar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">Nombre del Platillo</label>
            <input
              type="text"
              placeholder="Ej. Tonalá Ribeye Asado"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">Precio de Venta ($ MXN)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                placeholder="150"
                value={dishPrice}
                onChange={(e) => setDishPrice(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-neutral-200 pl-7 pr-3 py-2 bg-white font-mono focus:outline-none focus:border-neutral-900"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">Categoría de Alimento</label>
            <select
              value={dishCategory}
              onChange={(e) => setDishCategory(e.target.value as MenuCategory)}
              className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
              required
            >
              <option value="entradas">Entradas / Aperitivos</option>
              <option value="fuertes">Platos Fuertes</option>
              <option value="bebidas">Bebidas / Coctelería</option>
              <option value="postres">Postres / Pastelería</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">Estado de Preparación</label>
            <select
              value={dishIsAvailable ? 'true' : 'false'}
              onChange={(e) => setDishIsAvailable(e.target.value === 'true')}
              className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="true">Disponible (En carta)</option>
              <option value="false">Agotado (Inactivo temporal)</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">Descripción Detallada (Ingredientes / Alérgenos)</label>
            <input
              type="text"
              placeholder="Ej. Ribeye premium asado con chimichurri casero de ajo silvestre y mantequilla de hierbas finas."
              value={dishDescription}
              onChange={(e) => setDishDescription(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-500 block">URL de Imagen Decorativa (Opcional)</label>
            <input
              type="text"
              placeholder="Pegar link de Unsplash..."
              value={dishImage}
              onChange={(e) => setDishImage(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-200 px-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-neutral-50">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Limpiar Campos
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              {editingDishId ? 'Actualizar Platillo' : 'Guardar en Menú'}
            </button>
          </div>
        </form>
      </div>

      {/* Control & Search filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto border-b md:border-b-0 pb-2 md:pb-0" id="menu_category_tabs">
          {(['todos', 'entradas', 'fuertes', 'bebidas', 'postres'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {cat === 'todos' ? 'Todos' : cat === 'entradas' ? 'Entradas' : cat === 'fuertes' ? 'Fuertes' : cat === 'bebidas' ? 'Bebidas' : 'Postres'}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar platillo por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg border border-neutral-200 pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Grid of Dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map((item) => {
          const cat = getCategoryDetails(item.category);
          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-xs relative flex flex-col justify-between transition-all ${
                item.isAvailable ? 'border-neutral-100' : 'border-neutral-200 opacity-75'
              }`}
              id={`dish_card_${item.id}`}
            >
              {/* Image banner */}
              <div className="h-44 relative bg-neutral-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md text-[10px] font-bold text-neutral-800 shadow-xs flex items-center gap-1 border border-neutral-150">
                  {cat.icon}
                  {cat.label}
                </span>

                {/* Badge for unavailable items */}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                    <span className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <XCircle className="w-3.5 h-3.5" />
                      Agotado Clinica
                    </span>
                  </div>
                )}
              </div>

              {/* Dish Content info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-black">{item.name}</h3>
                    <span className="text-sm font-bold font-mono text-neutral-950 block text-right">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed min-h-[48px]">
                    {item.description}
                  </p>
                </div>

                {/* Actions bottom bar */}
                <div className="flex justify-between items-center pt-3 border-t border-neutral-50 mt-4 text-xs font-semibold">
                  <button
                    onClick={() => toggleDishAvailability(item.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer transition-colors ${
                      item.isAvailable
                        ? 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                        Agotar
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Disparar
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-md cursor-pointer"
                      title="Editar Platillo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMenuDish(item.id)}
                      className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-md cursor-pointer animate-pulse-once"
                      title="Eliminar de Carta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMenu.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-dashed border-neutral-200 rounded-2xl text-neutral-400">
            No se encontraron platillos con los criterios definidos.
          </div>
        )}
      </div>
    </div>
  );
};
