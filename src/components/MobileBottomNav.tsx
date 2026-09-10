import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  FileText,
  MoreHorizontal,
  Store,
  Headphones,
  Users,
  UserCheck,
  AlertTriangle,
  X,
  ShieldCheck,
  LogOut,
  Send,
  Smartphone
} from 'lucide-react';
import { AppUser } from '../types';
import { hasPageAccess } from '../utils/rbac';

interface MobileBottomNavProps {
  currentView: string;
  currentUser: AppUser;
  onSelectView: (view: string) => void;
  onOpenAlertsManager: () => void;
  onOpenPrivilegesMatrix?: () => void;
  onLogout?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  currentUser,
  onSelectView,
  onOpenAlertsManager,
  onOpenPrivilegesMatrix,
  onLogout,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const rawMainNav = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Boxes },
    { id: 'mantenimiento', label: 'Mant.', icon: Wrench },
    { id: 'monitoreo', label: 'Asistencia', icon: UserCheck },
    { id: 'informes', label: 'Informes', icon: FileText },
  ];

  // Filter main navigation based on user privileges
  const mainNav = rawMainNav.filter(item => hasPageAccess(currentUser.role, item.id)).slice(0, 4);

  return (
    <>
      {/* Bottom Floating Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e5eeff] z-40 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        {mainNav.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setShowMoreMenu(false);
                onSelectView(item.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#00236f]' : 'text-[#757682] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-1 bg-[#00236f] rounded-full mt-0.5"></span>
              )}
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            ['tiendas', 'helpdesk', 'usuarios', 'monitoreo', 'informes'].includes(currentView) || showMoreMenu
              ? 'text-[#00236f]'
              : 'text-[#757682]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 font-medium">Más</span>
        </button>
      </nav>

      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex flex-col justify-end animate-fadeIn">
          <div
            className="absolute inset-0"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-5 shadow-2xl space-y-3 z-10 animate-slideUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-sm text-[#00236f]">Módulos & Seguridad</h3>
                <span className="text-[11px] text-[#007a33] font-medium">
                  {currentUser.name} ({currentUser.role})
                </span>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-[#757682] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {hasPageAccess(currentUser.role, 'custodia') && (
                <button
                  onClick={() => {
                    onSelectView('custodia');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'custodia' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#00236f]" />
                  <span className="font-semibold text-xs">Custodia PDAs & CCTV</span>
                  <span className="text-[10px] text-[#757682]">Monitoreo & Fotocheck</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'monitoreo') && (
                <button
                  onClick={() => {
                    onSelectView('monitoreo');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'monitoreo' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-xs">Asistencia & Personal</span>
                  <span className="text-[10px] text-[#757682]">Monitoreo en tiendas & log</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'tiendas') && (
                <button
                  onClick={() => {
                    onSelectView('tiendas');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'tiendas' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#00236f]" />
                  <span className="font-semibold text-xs">90 Tiendas</span>
                  <span className="text-[10px] text-[#757682]">Gestión por 5 regiones</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'helpdesk') && (
                <button
                  onClick={() => {
                    onSelectView('helpdesk');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'helpdesk' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <Headphones className="w-5 h-5 text-[#fd761a]" />
                  <span className="font-semibold text-xs">Helpdesk & Repuestos</span>
                  <span className="text-[10px] text-[#757682]">Tickets, repuestos & SAP</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'informes') && (
                <button
                  onClick={() => {
                    onSelectView('informes');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'informes' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-xs">Informes Técnicos</span>
                  <span className="text-[10px] text-[#757682]">PDFs de servicio</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'usuarios') && (
                <button
                  onClick={() => {
                    onSelectView('usuarios');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'usuarios' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <Users className="w-5 h-5 text-[#4059aa]" />
                  <span className="font-semibold text-xs">Directorio</span>
                  <span className="text-[10px] text-[#757682]">Técnicos & Supervisores</span>
                </button>
              )}

              {hasPageAccess(currentUser.role, 'despachador') && (
                <button
                  onClick={() => {
                    onSelectView('despachador');
                    setShowMoreMenu(false);
                  }}
                  className={`p-3.5 rounded-xl text-left border flex flex-col gap-1 transition-colors ${
                    currentView === 'despachador' ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f]' : 'bg-[#f8f9ff] border-[#e5eeff] text-[#444651]'
                  }`}
                >
                  <Send className="w-5 h-5 text-[#0052cc]" />
                  <span className="font-semibold text-xs">Despacho Correos</span>
                  <span className="text-[10px] text-[#757682]">Avisos masivos & Outlook</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenAlertsManager();
                  setShowMoreMenu(false);
                }}
                className="p-3.5 rounded-xl text-left border bg-[#ffdad6]/40 border-[#ba1a1a]/30 text-[#ba1a1a] flex flex-col gap-1"
              >
                <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                <span className="font-semibold text-xs">Alertas Críticas</span>
                <span className="text-[10px] text-[#ba1a1a]/80">Nivel regional/sucursal</span>
              </button>

              {onOpenPrivilegesMatrix && (
                <button
                  onClick={() => {
                    onOpenPrivilegesMatrix();
                    setShowMoreMenu(false);
                  }}
                  className="p-3.5 rounded-xl text-left border bg-emerald-50 border-emerald-200 text-emerald-800 flex flex-col gap-1"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-xs">Privilegios RBAC</span>
                  <span className="text-[10px] text-emerald-700/80">Matriz de roles</span>
                </button>
              )}
            </div>

            {/* Logout button in mobile drawer */}
            {onLogout && (
              <div className="pt-2 border-t border-[#e5eeff]">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-50 text-red-700 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión Corporativa Outlook</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

