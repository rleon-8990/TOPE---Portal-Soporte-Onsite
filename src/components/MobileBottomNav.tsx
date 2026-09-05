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
  AlertTriangle,
  X
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenAlertsManager: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenAlertsManager,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNav = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Boxes },
    { id: 'mantenimiento', label: 'Mant.', icon: Wrench },
    { id: 'informes', label: 'Informes', icon: FileText },
  ];

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
            ['tiendas', 'helpdesk', 'usuarios'].includes(currentView) || showMoreMenu
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
          <div className="relative bg-white rounded-t-2xl p-5 shadow-2xl space-y-3 z-10 animate-slideUp">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
              <h3 className="font-bold text-sm text-[#00236f]">Módulos Adicionales</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-[#757682] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                <span className="font-semibold text-xs">Helpdesk</span>
                <span className="text-[10px] text-[#757682]">12 tickets en curso</span>
              </button>

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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
