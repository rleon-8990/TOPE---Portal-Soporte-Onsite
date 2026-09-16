import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  FileText,
  Store as StoreIcon,
  Headphones,
  Users,
  UserCheck,
  AlertTriangle,
  LogOut,
  Bell,
  SlidersHorizontal,
  TableProperties,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Smartphone,
  ClipboardCheck,
  Repeat
} from 'lucide-react';
import { AppUser } from '../types';
import { hasPageAccess, getRoleConfig, getAllowedModulesForRole, canUserManagePrivileges } from '../utils/rbac';
import { TottusLogo } from './TottusLogo';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: AppUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAlertsManager: () => void;
  onOpenM365Sync: () => void;
  onOpenPrivilegesMatrix?: () => void;
  onLogout?: () => void;
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
  onOpenPrivilegesMatrix,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const allNavItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Boxes },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: Wrench },
    { id: 'visitas', label: 'Visitas Preventivas', icon: ClipboardCheck },
    { id: 'custodia', label: 'Custodia PDAs & CCTV', icon: Smartphone },
    { id: 'monitoreo', label: 'Asistencia & Personal', icon: UserCheck },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'tiendas', label: 'Tiendas', icon: StoreIcon },
    { id: 'helpdesk', label: 'Helpdesk & Repuestos', icon: Headphones },
    { id: 'trazabilidad', label: 'Repuestos & Pool BKP', icon: Repeat },
    { id: 'despachador', label: 'Despacho Correos', icon: Send },
    { id: 'usuarios', label: 'Directorio', icon: Users },
  ];

  // Filter modules according to the current user's role privileges
  const allowedNavItems = allNavItems.filter(item => 
    hasPageAccess(currentUser, item.id)
  );

  const roleConfig = getRoleConfig(currentUser.role);
  const totalAllowed = getAllowedModulesForRole(currentUser.role).length;
  const isGeneralAdmin =
    currentUser.role === 'Administrador General' ||
    currentUser.role === 'Administrador' ||
    currentUser.username === 'admin' ||
    currentUser.email.toLowerCase().includes('admin') ||
    canUserManagePrivileges(currentUser);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-[#e2ecd5] shadow-[4px_0_16px_rgba(95,175,22,0.06)] z-40 hidden md:flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Logo Header */}
      <div className={`p-3.5 border-b border-[#e2ecd5] flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'}`}>
        <div
          className="flex items-center gap-2 cursor-pointer min-w-0"
          onClick={onToggleCollapse}
          title="Hipermercados Tottus S.A. - Soporte Onsite"
        >
          <TottusLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
        </div>

        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-[#526650] hover:bg-[#f0f6e6] hover:text-[#539e18] transition-colors"
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
              className="p-1.5 rounded-lg text-[#526650] hover:bg-[#f0f6e6] hover:text-[#539e18] transition-colors"
              title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className={`my-3 rounded-xl bg-[#f4f8ec] border border-[#d8e8be] flex flex-col transition-all ${
        isCollapsed ? 'mx-2 p-2 items-center' : 'mx-3 p-3 gap-2.5'
      }`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0" title={`${currentUser.name} (${currentUser.role})`}>
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#539e18]/30"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#539e18] rounded-full border-2 border-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-[#172a16] truncate">{currentUser.name}</div>
              <div className="text-[11px] text-[#2d660e] font-bold truncate flex items-center gap-1">
                <span>{currentUser.role}</span>
              </div>
              <div className="text-[10px] text-[#526650] truncate font-mono">{currentUser.email}</div>
            </div>
          )}
        </div>

        {/* Outlook Corporate Status & Privileges Badge */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-[#d8e8be]/80 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 text-[#2d660e] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#539e18] animate-pulse" />
              Outlook Conectado
            </span>
            {onOpenPrivilegesMatrix && (
              <button
                onClick={onOpenPrivilegesMatrix}
                className="text-[#2d660e] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                title="Ver matriz de permisos por rol"
              >
                <span>{totalAllowed}/8 módulos</span>
                <ShieldCheck className="w-3 h-3 text-[#539e18]" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <div className="px-3 pb-1 text-[10px] font-bold text-[#526650] uppercase tracking-wider flex items-center justify-between">
            <span>Módulos del Sistema</span>
            <span className="text-[9px] bg-[#eaf2dc] text-[#2d660e] px-1.5 py-0.2 rounded font-semibold">
              {allowedNavItems.length}
            </span>
          </div>
        )}
        {allowedNavItems.map(item => {
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
                  ? 'bg-[#539e18] text-white shadow-sm font-semibold'
                  : 'text-[#324531] hover:bg-[#f0f6e6] hover:text-[#2d660e]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#647c61]'}`} />
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

        {isGeneralAdmin && (
          <>
            {!isCollapsed && (
              <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-[#526650] uppercase tracking-wider">
                Integración & Seguridad
              </div>
            )}

            {/* Microsoft SharePoint / Dataverse Connector Button */}
            <button
              onClick={onOpenM365Sync}
              title={isCollapsed ? "SharePoint / Dataverse (Tablas M365)" : undefined}
              className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors text-[#2d660e] bg-[#f4f8ec] hover:bg-[#eaf2dc] border border-[#d8e8be] ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              <TableProperties className="w-4 h-4 shrink-0 text-[#539e18]" />
              {!isCollapsed && (
                <div className="text-left flex-1 min-w-0">
                  <div className="truncate font-bold text-[#204a0a]">SharePoint / Dataverse</div>
                  <div className="text-[10px] font-normal text-[#526650]">
                    Tablas Microsoft 365
                  </div>
                </div>
              )}
            </button>

            {/* Privileges Matrix Button */}
            {onOpenPrivilegesMatrix && (
              <button
                onClick={onOpenPrivilegesMatrix}
                title={isCollapsed ? "Matriz de Privilegios RBAC" : undefined}
                className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors text-[#324531] hover:text-[#2d660e] hover:bg-[#f0f6e6] border border-transparent hover:border-[#d8e8be] ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#539e18]" />
                {!isCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <div className="truncate font-semibold">Matriz de Privilegios</div>
                    <div className="text-[10px] font-normal text-[#526650]">
                      Roles & Permisos
                    </div>
                  </div>
                )}
              </button>
            )}
          </>
        )}

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
      <div className={`mb-3 bg-[#f7faf2] border border-[#e2ecd5] rounded-lg ${
        isCollapsed ? 'mx-2 p-2 text-center' : 'p-3 mx-3'
      }`}>
        <div className={`flex items-center mb-1.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="text-[10px] font-bold uppercase text-[#526650]">Disponibilidad Tiendas</span>}
          <span className="text-[11px] font-bold text-[#539e18]">98.4%</span>
        </div>
        <div className="w-full h-1.5 bg-[#e2ecd5] rounded-full overflow-hidden">
          <div className="h-full bg-[#539e18] rounded-full" style={{ width: '98.4%' }}></div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-2.5 border-t border-[#e2ecd5]">
        <button
          onClick={() => {
            if (onLogout) {
              onLogout();
            } else {
              window.location.reload();
            }
          }}
          title={isCollapsed ? "Cerrar Sesión Corporativa Outlook" : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-semibold text-[#757682] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
          {!isCollapsed && <span>Cerrar Sesión Outlook</span>}
        </button>
      </div>
    </aside>
  );
};
