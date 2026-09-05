import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  FileText,
  Store as StoreIcon,
  Headphones,
  Users,
  AlertTriangle,
  LogOut,
  Bell,
  SlidersHorizontal,
  TableProperties
} from 'lucide-react';
import { AppUser } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: AppUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAlertsManager: () => void;
  onOpenM365Sync: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenAlertsManager,
  onOpenM365Sync,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Boxes },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'tiendas', label: 'Tiendas (90)', icon: StoreIcon },
    { id: 'helpdesk', label: 'Helpdesk', icon: Headphones },
    { id: 'usuarios', label: 'Directorio', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#e5eeff] shadow-[4px_0_16px_rgba(30,58,138,0.04)] z-40 hidden md:flex flex-col">
      {/* Brand Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#e5eeff]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#007a33] flex items-center justify-center text-white shadow-sm font-bold text-base shrink-0">
            T
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[#00236f] text-sm tracking-tight leading-snug block truncate" title="Portal Soporte Onsite">Portal Soporte Onsite</span>
            <span className="text-[9px] text-[#757682] uppercase tracking-wider font-semibold block truncate" title="Hipermercados Tottus S.A. - Sistemas de la Información">Tottus · Sistemas</span>
          </div>
        </div>
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-[#444651] hover:bg-[#eff4ff] hover:text-[#00236f] transition-colors"
          title="Notificaciones push"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-[#00236f]/20"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs text-[#0b1c30] truncate">{currentUser.name}</div>
          <div className="text-[11px] text-[#4059aa] font-medium truncate">{currentUser.role}</div>
          <div className="text-[10px] text-[#757682] truncate">{currentUser.assignedRegion}</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold text-[#757682] uppercase tracking-wider">
          Módulos Principales
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1e3a8a] text-white shadow-sm font-semibold'
                  : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#00236f]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#757682]'}`} />
              <span>{item.label}</span>
              {item.id === 'helpdesk' && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}>
                  12
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-[#757682] uppercase tracking-wider">
          Integración & Base de Datos
        </div>

        {/* Microsoft SharePoint / Dataverse Connector Button */}
        <button
          onClick={onOpenM365Sync}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff]"
        >
          <TableProperties className="w-4 h-4 shrink-0 text-[#00236f]" />
          <div className="text-left flex-1 min-w-0">
            <div className="truncate font-bold">SharePoint / Dataverse</div>
            <div className="text-[10px] font-normal text-[#757682]">
              Tablas Microsoft 365
            </div>
          </div>
        </button>

        <button
          onClick={onOpenAlertsManager}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
          <span>Alertas Críticas</span>
          <span className="ml-auto bg-[#ba1a1a] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            Live
          </span>
        </button>
      </nav>

      {/* Regional Status Mini Indicator */}
      <div className="p-3 mx-3 mb-3 bg-[#f8f9ff] border border-[#e5eeff] rounded-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase text-[#757682]">Disponibilidad Red 90 T</span>
          <span className="text-[11px] font-bold text-[#10b981]">98.4%</span>
        </div>
        <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
          <div className="h-full bg-[#10b981] rounded-full" style={{ width: '98.4%' }}></div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#e5eeff]">
        <button
          onClick={() => {
            alert('Modo demostración activo. Sesión de Administrador.');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#757682] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
