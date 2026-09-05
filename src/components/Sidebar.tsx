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
  TableProperties,
  ChevronLeft,
  ChevronRight
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenAlertsManager,
  onOpenM365Sync,
  isCollapsed = false,
  onToggleCollapse,
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
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-[#e5eeff] shadow-[4px_0_16px_rgba(30,58,138,0.04)] z-40 hidden md:flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`p-4 border-b border-[#e5eeff] flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl bg-[#007a33] flex items-center justify-center text-white shadow-sm font-bold text-base shrink-0 cursor-pointer"
            onClick={onToggleCollapse}
            title="Portal Soporte Onsite - Hipermercados Tottus S.A."
          >
            T
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-[#00236f] text-sm tracking-tight leading-snug block truncate" title="Portal Soporte Onsite">
                Portal Soporte Onsite
              </span>
              <span className="text-[9px] text-[#757682] uppercase tracking-wider font-semibold block truncate" title="Hipermercados Tottus S.A. - Sistemas de la Información">
                Tottus · Sistemas
              </span>
            </div>
          )}
        </div>

        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
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

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#757682] hover:bg-[#eff4ff] hover:text-[#00236f] transition-colors"
              title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className={`my-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center transition-all ${
        isCollapsed ? 'mx-2 p-2 justify-center' : 'mx-3 p-3.5 gap-3'
      }`}>
        <div className="relative shrink-0" title={`${currentUser.name} (${currentUser.role})`}>
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00236f]/20"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-white" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-[#0b1c30] truncate">{currentUser.name}</div>
            <div className="text-[11px] text-[#4059aa] font-medium truncate">{currentUser.role}</div>
            <div className="text-[10px] text-[#757682] truncate">{currentUser.assignedRegion}</div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold text-[#757682] uppercase tracking-wider">
            Módulos Principales
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all ${
                isCollapsed
                  ? 'justify-center p-3 relative'
                  : 'gap-3 px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-[#1e3a8a] text-white shadow-sm font-semibold'
                  : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#00236f]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#757682]'}`} />
              {!isCollapsed && <span>{item.label}</span>}
              {item.id === 'helpdesk' && (
                <span className={`text-[10px] rounded-full font-bold ${
                  isCollapsed
                    ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-[#ba1a1a] text-white text-[9px]'
                    : isActive
                    ? 'ml-auto px-1.5 py-0.5 bg-white/20 text-white'
                    : 'ml-auto px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a]'
                }`}>
                  {isCollapsed ? '!' : '12'}
                </span>
              )}
            </button>
          );
        })}

        {!isCollapsed && (
          <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-[#757682] uppercase tracking-wider">
            Integración & Base de Datos
          </div>
        )}

        {/* Microsoft SharePoint / Dataverse Connector Button */}
        <button
          onClick={onOpenM365Sync}
          title={isCollapsed ? "SharePoint / Dataverse (Tablas M365)" : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff] ${
            isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
          }`}
        >
          <TableProperties className="w-4 h-4 shrink-0 text-[#00236f]" />
          {!isCollapsed && (
            <div className="text-left flex-1 min-w-0">
              <div className="truncate font-bold">SharePoint / Dataverse</div>
              <div className="text-[10px] font-normal text-[#757682]">
                Tablas Microsoft 365
              </div>
            </div>
          )}
        </button>

        <button
          onClick={onOpenAlertsManager}
          title={isCollapsed ? "Alertas Críticas" : undefined}
          className={`w-full flex items-center rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors ${
            isCollapsed ? 'justify-center p-3 relative' : 'gap-3 px-3.5 py-2.5'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
          {!isCollapsed && (
            <>
              <span>Alertas Críticas</span>
              <span className="ml-auto bg-[#ba1a1a] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                Live
              </span>
            </>
          )}
        </button>
      </nav>

      {/* Regional Status Mini Indicator */}
      <div className={`mb-3 bg-[#f8f9ff] border border-[#e5eeff] rounded-lg ${
        isCollapsed ? 'mx-2 p-2 text-center' : 'p-3 mx-3'
      }`}>
        <div className={`flex items-center mb-1.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="text-[10px] font-bold uppercase text-[#757682]">Disponibilidad 90 T</span>}
          <span className="text-[11px] font-bold text-[#10b981]">98.4%</span>
        </div>
        <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
          <div className="h-full bg-[#10b981] rounded-full" style={{ width: '98.4%' }}></div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-2.5 border-t border-[#e5eeff]">
        <button
          onClick={() => {
            alert('Modo demostración activo. Sesión de Administrador.');
          }}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-medium text-[#757682] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
