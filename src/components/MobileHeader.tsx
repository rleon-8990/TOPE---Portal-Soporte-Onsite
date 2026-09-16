import React, { useState } from 'react';
import { Bell, QrCode, SlidersHorizontal, AlertTriangle, TableProperties, Zap, ShieldCheck, LogOut } from 'lucide-react';
import { AppUser } from '../types';
import { TottusLogo } from './TottusLogo';

interface MobileHeaderProps {
  currentView: string;
  currentUser: AppUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenQRScanner: () => void;
  onOpenAlertsManager: () => void;
  onOpenM365Sync: () => void;
  onOpenStoreSync?: () => void;
  onOpenPrivilegesMatrix?: () => void;
  onLogout?: () => void;
  isAutoSyncActive?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentView,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenQRScanner,
  onOpenAlertsManager,
  onOpenM365Sync,
  onOpenStoreSync,
  onOpenPrivilegesMatrix,
  onLogout,
  isAutoSyncActive = true,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isGeneralAdmin =
    currentUser.role === 'Administrador General' ||
    currentUser.role === 'Administrador' ||
    currentUser.username === 'admin' ||
    currentUser.email.toLowerCase().includes('admin');

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'inventario': return 'Inventario';
      case 'mantenimiento': return 'Mantenimiento';
      case 'monitoreo': return 'Asistencia Onsite';
      case 'informes': return 'Informes Técnicos';
      case 'tiendas': return 'Tiendas';
      case 'helpdesk': return 'Helpdesk';
      case 'usuarios': return 'Directorio';
      default: return 'Portal Soporte Onsite';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#e2ecd5] z-40 px-4 flex md:hidden items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <TottusLogo size="sm" showText={false} />
        <div>
          <h1 className="font-bold text-[#172a16] text-base leading-tight">{getTitle()}</h1>
          <span className="text-[10px] text-[#526650] font-medium block">Tottus · Soporte Onsite</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onOpenStoreSync && (
          <button
            onClick={onOpenStoreSync}
            className="relative p-2 rounded-full text-[#2d660e] bg-[#f4f8ec] hover:bg-[#eaf2dc] transition-transform active:scale-95"
            title="Auto-Sincronización Permanente"
          >
            <Zap className="w-4 h-4 text-[#539e18]" />
            {isAutoSyncActive && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#539e18] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>
        )}

        {isGeneralAdmin && (
          <button
            onClick={onOpenM365Sync}
            className="p-2 rounded-full text-[#2d660e] bg-[#f4f8ec] hover:bg-[#eaf2dc] transition-transform active:scale-95"
            title="SharePoint & Dataverse"
          >
            <TableProperties className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenQRScanner}
          className="p-2 rounded-full text-[#2d660e] bg-[#f4f8ec] hover:bg-[#eaf2dc] transition-transform active:scale-95"
          title="Escanear QR Equipo"
        >
          <QrCode className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAlertsManager}
          className="p-2 rounded-full text-[#ba1a1a] bg-[#ffdad6]/50 hover:bg-[#ffdad6] transition-transform active:scale-95"
          title="Alertas Críticas"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-[#526650] bg-[#f7faf2] hover:bg-[#f0f6e6] transition-transform active:scale-95"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        <div className="relative ml-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative rounded-full focus:outline-none ring-2 ring-[#539e18]/40"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#539e18] rounded-full border-2 border-white" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-xl border border-[#d8e8be] p-3.5 z-50 animate-fadeIn space-y-2.5 text-left">
              <div className="border-b border-[#e2ecd5] pb-2">
                <div className="font-bold text-xs text-[#172a16] truncate">{currentUser.name}</div>
                <div className="text-[11px] text-[#2d660e] font-semibold">{currentUser.role}</div>
                <div className="text-[10px] text-[#526650] truncate font-mono">{currentUser.email}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#2d660e] font-medium bg-[#f4f8ec] px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#539e18] animate-pulse" />
                  Outlook Corporativo
                </div>
              </div>

              {onOpenPrivilegesMatrix && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenPrivilegesMatrix();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#172a16] hover:bg-[#f4f8ec] hover:text-[#2d660e] flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#539e18]" />
                  <span>Matriz de Privilegios</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
