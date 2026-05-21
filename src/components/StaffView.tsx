import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { StaffMember, StaffRole, StaffStatus } from '../types';
import { 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Phone, 
  Coins, 
  UserCheck, 
  UserX, 
  Sparkles,
  Award,
  Hash,
  Crown
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff, addStaff, toggleStaffStatus, deleteStaff } = useRestaurant();
  
  // Hiring Form Toggle
  const [showHireForm, setShowHireForm] = useState(false);
  
  // Hiring States
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<StaffRole>('Mesero');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('');
  const [memberPin, setMemberPin] = useState('');

  const handleSubmitHire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName) return;

    // Default gender-neutral stylish avatars from Unsplash based on role if empty
    let placeholderAvatar = memberAvatar;
    if (!placeholderAvatar) {
      if (memberRole === 'Chef') {
        placeholderAvatar = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200';
      } else if (memberRole === 'Mesero') {
        placeholderAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
      } else if (memberRole === 'Cajero') {
        placeholderAvatar = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200';
      } else {
        placeholderAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
      }
    }

    const finalPin = memberPin || Math.floor(1000 + Math.random() * 9000).toString();

    addStaff({
      name: memberName,
      role: memberRole,
      phone: memberPhone || 'Sin teléfono',
      avatar: placeholderAvatar,
      status: 'Activo',
      pinCode: finalPin
    });

    // Reset Form
    setMemberName('');
    setMemberRole('Mesero');
    setMemberPhone('');
    setMemberAvatar('');
    setMemberPin('');
    setShowHireForm(false);
  };

  // Ranking tip leaderboards
  const tipLeaderboard = [...staff]
    .filter(s => s.role === 'Mesero' && s.tipsEarned > 0)
    .sort((a, b) => b.tipsEarned - a.tipsEarned);

  return (
    <div className="space-y-8 animate-fade-in" id="staff_view_container">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Roster de Personal y Caja</h1>
          <p className="text-sm text-neutral-500">Contrata personal, cambia turnos, vigila estados de actividad y controla propinas de meseros</p>
        </div>

        <button
          onClick={() => setShowHireForm(!showHireForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors self-stretch sm:self-auto text-center justify-center"
        >
          <Plus className="w-4 h-4" />
          Dar de Alta Empleado
        </button>
      </div>

      {/* Staff Hiring Form */}
      {showHireForm && (
        <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-neutral-900 border-b pb-2">Registro de Contrato Laboral</h2>
          <form onSubmit={handleSubmitHire} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Roberto Martínez Salcedo"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Puesto / Rol del Turno</label>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as StaffRole)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white"
                required
              >
                <option value="Mesero">Mesero (Atención a Comensales)</option>
                <option value="Chef">Chef (Preparador Alimentos)</option>
                <option value="Cajero">Cajero POS (Administración Caja)</option>
                <option value="Administrador">Administrador General</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">Teléfono de Contacto</label>
              <input
                type="tel"
                placeholder="Ej. +52 55 1234 5678"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">URL de Foto de Perfil (Opcional)</label>
              <input
                type="text"
                placeholder="Enlace imagen Unsplash..."
                value={memberAvatar}
                onChange={(e) => setMemberAvatar(e.target.value)}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 block">PIN de Acceso (4 dígitos)</label>
              <input
                type="text"
                pattern="\d{4}"
                maxLength={4}
                placeholder="Generar automático si se deja en blanco"
                value={memberPin}
                onChange={(e) => setMemberPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-xs rounded-lg border border-neutral-200 px-3 py-2 bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-neutral-50">
              <button
                type="button"
                onClick={() => setShowHireForm(false)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-250 text-neutral-550 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Confirmar Alta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid Employee Directory & Leaderboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Directory (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Directorio de Colaboradores</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className={`bg-white border rounded-2xl p-4 flex gap-4 items-center justify-between transition-all ${
                  member.status === 'Activo' ? 'border-neutral-150' : 'border-neutral-200 bg-neutral-50/50 opacity-75'
                }`}
                id={`staff_card_${member.id}`}
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full overflow-hidden shrink-0 border border-neutral-150 relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`w-3 h-3 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                      member.status === 'Activo' ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-neutral-900 truncate" title={member.name}>{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider ${
                        member.role === 'Chef' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        member.role === 'Mesero' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        member.role === 'Cajero' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium flex items-center font-mono shrink-0">
                        <Phone className="w-2.5 h-2.5 mr-0.5" />
                        {member.phone}
                      </span>
                    </div>

                    {member.role === 'Mesero' && (
                      <span className="text-[10px] text-violet-600 font-semibold block mt-1.5 font-mono">
                        Tip acumulado: ${member.tipsEarned.toFixed(2)}
                      </span>
                    )}

                    <div className="mt-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200">
                        PIN Acceso: {member.pinCode || '1234'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions toggling status */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => toggleStaffStatus(member.id)}
                    className="p-1.5 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer transition-colors"
                    title={member.status === 'Activo' ? 'Desconectar empleado de turno' : 'Conectar empleado en turno'}
                  >
                    {member.status === 'Activo' ? (
                      <UserX className="w-4 h-4 text-neutral-400 hover:text-rose-500" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteStaff(member.id)}
                    className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                    title="Dar de baja definitiva"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip Leadboard / Stats (Col span 1) */}
        <div className="space-y-6 bg-neutral-50 p-6 rounded-2xl border border-neutral-150">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1">
              <Award className="w-5 h-5 text-indigo-600 animate-pulse-once" />
              Rendimiento de Propinas
            </h2>
            <p className="text-xs text-neutral-550">Ranking del piso por servicios completados acumulados</p>
          </div>

          <div className="space-y-4">
            {tipLeaderboard.map((member, index) => (
              <div key={member.id} className="bg-white p-3 rounded-xl border border-neutral-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="relative font-bold text-xs text-neutral-500 font-mono w-6 text-center">
                    {index === 0 ? (
                      <Crown className="w-4 h-4 text-amber-500 mx-auto" />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden border">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block truncate max-w-[120px]">{member.name}</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">{member.role}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-xs text-neutral-900 block font-mono">
                    ${member.tipsEarned.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[8.5px] text-neutral-400 block mt-0.5">Tip Bruto</span>
                </div>
              </div>
            ))}

            {tipLeaderboard.length === 0 && (
              <div className="text-center py-10 text-neutral-400 text-xs italic bg-white border rounded-xl">
                Ningún mesero ha recaudado propinas voluntarias de clientes en este turno aún.
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-100 space-y-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-neutral-450 block mb-1">MÉTRICAS ROSTER</span>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Plantilla:</span>
              <span className="font-bold text-neutral-800">{staff.length} colaboradores</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Plantilla Activa:</span>
              <span className="font-bold text-emerald-600">{staff.filter(s => s.status === 'Activo').length} colaboradores</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
