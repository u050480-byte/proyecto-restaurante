import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Lock, KeyRound, ArrowRight, ShieldCheck, User, Users, Flame, Utensils, Award } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { staff, login } = useRestaurant();
  const [selectedUserId, setSelectedUserId] = useState<string>('admin');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active or staff list
  const activeStaff = staff.filter(s => s.status === 'Activo');

  const handleNumberClick = (num: string) => {
    setErrorMsg(null);
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    const result = login(selectedUserId, pin);
    if (!result.success) {
      setErrorMsg(result.error || 'PIN incorrecto');
      setPin('');
    }
  };

  const selectedUserObj = selectedUserId === 'admin' 
    ? { name: 'Administrador General', role: 'Administrador', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
    : staff.find(s => s.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" id="login_container_view">
      {/* Background radial soft light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left pane: Profile selector / brand card (Col span 7) */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Header Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg ring-1 ring-indigo-500/30 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-black text-slate-100 tracking-tight leading-none">GastroGest <span className="text-xs text-indigo-400 font-mono">ERP</span></h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mt-1">Control Inteligente de Mesas & Comandas</p>
              </div>
            </div>
            
            <h2 className="text-white font-extrabold text-sm mb-3">Selecciona tu Perfil de Acceso:</h2>
            
            {/* Staff list cards scrollable */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Special Admin Card */}
              <button
                type="button"
                onClick={() => {
                  setSelectedUserId('admin');
                  setPin('');
                  setErrorMsg(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedUserId === 'admin'
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                id="select_user_admin"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-200">Administrador General</h3>
                    <span className="text-[9px] uppercase tracking-widest font-mono font-black text-indigo-400 block mt-0.5">Control Total ERP</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] bg-slate-950 font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">PIN: 0000</span>
                </div>
              </button>

              {/* Waiters & Other Staff Cards */}
              {staff.map((member) => {
                const isSelected = selectedUserId === member.id;
                const isInactive = member.status === 'Inactivo';
                return (
                  <button
                    key={member.id}
                    type="button"
                    disabled={isInactive}
                    onClick={() => {
                      if (!isInactive) {
                        setSelectedUserId(member.id);
                        setPin('');
                        setErrorMsg(null);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isInactive 
                        ? 'opacity-40 cursor-not-allowed bg-slate-950 border-transparent text-slate-600'
                        : isSelected
                          ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    id={`select_user_${member.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden shrink-0 relative bg-slate-800">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full border border-slate-900 absolute bottom-0 right-0 ${
                          !isInactive ? 'bg-emerald-500' : 'bg-slate-700'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-xs truncate ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>{member.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-block px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider font-mono ${
                            member.role === 'Mesero' ? 'bg-violet-950 text-violet-300 border border-violet-800' :
                            member.role === 'Chef' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            member.role === 'Cajero' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {member.role === 'Mesero' ? 'MESERO (Solo Pedidos y Cobro)' : member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isInactive ? (
                        <span className="text-[8px] uppercase tracking-wider text-rose-500 font-extrabold font-mono">Inactivo</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          PIN: {member.pinCode || '1234'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 text-slate-500 text-[10px] text-center sm:text-left leading-normal font-mono">
            ⚠️ <span>El Administrador puede crear o activar meseros en el </span>
            <strong className="text-slate-350">Roster de Personal</strong> 
            <span> y asignarles un PIN de 4 dígitos.</span>
          </div>

        </div>

        {/* Right pane: Touch digit keypad (Col span 5) */}
        <div className="md:col-span-5 p-6 sm:p-8 bg-slate-900/60 flex flex-col justify-between items-center gap-6">
          
          {/* Active Profile Info */}
          <div className="text-center w-full">
            <span className="text-[9px] uppercase tracking-widest font-black text-indigo-400 block mb-2 font-mono">VALIDANDO PIN</span>
            <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-750 mx-auto mb-2 relative shadow-inner bg-slate-800 flex items-center justify-center">
              {selectedUserObj?.avatar ? (
                <img 
                  src={selectedUserObj.avatar} 
                  alt={selectedUserObj.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <h2 className="text-slate-100 font-extrabold text-xs tracking-tight">{selectedUserObj?.name}</h2>
            <span className="text-[10px] text-slate-450 block mt-0.5 font-bold uppercase tracking-wider font-mono">{selectedUserObj?.role}</span>
          </div>

          {/* PIN circles dots block */}
          <div className="w-full max-w-[220px]">
            <div className="flex justify-between items-center bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800/80 shadow-inner">
              <KeyRound className="w-4 h-4 text-slate-500 shrink-0 mr-1.5" />
              
              <div className="flex gap-2.5 justify-center flex-1">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <span 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                        filled 
                          ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-lg shadow-indigo-500/20' 
                          : 'border-slate-700 bg-slate-900'
                      }`} 
                    />
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <span className="text-[10px] text-center text-rose-500 font-bold block mt-2 font-mono leading-none">
                ❌ {errorMsg}
              </span>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="w-full max-w-[240px] space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumberClick(digit)}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 hover:text-white text-sm font-black font-mono flex items-center justify-center transition-colors cursor-pointer border border-slate-800 shadow-sm"
                >
                  {digit}
                </button>
              ))}
              
              {/* Backspace */}
              <button
                type="button"
                onClick={handleDelete}
                className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-rose-400 active:bg-slate-900 text-[10px] font-bold font-mono flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
                title="Borrar dígito"
              >
                DEL
              </button>

              {/* Zero */}
              <button
                type="button"
                onClick={() => handleNumberClick('0')}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-100 text-sm font-black font-mono flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
              >
                0
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 active:bg-slate-900 text-[10px] font-bold font-mono flex items-center justify-center transition-colors cursor-pointer border border-slate-800"
                title="Limpiar"
              >
                CLR
              </button>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={pin.length < 4}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold font-sans tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                pin.length === 4 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-[0.98]' 
                  : 'bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed'
              }`}
              id="login_submit_btn"
            >
              Ingresar Sistema
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      <div className="mt-4 text-[10px] text-slate-600 font-mono text-center">
        GastroGest ERP Software de Terminales Tactiles ❖ Licencia Corporativa Registrada ❖ v1.02
      </div>
    </div>
  );
};
