import React from 'react';
import { Bell, QrCode, SlidersHorizontal, AlertTriangle, TableProperties } from 'lucide-react';
import { AppUser } from '../types';

interface MobileHeaderProps {
  currentView: string;
  currentUser: AppUser;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenQRScanner: () => void;
  onOpenAlertsManager: () => void;
  onOpenM365Sync: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentView,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenQRScanner,
  onOpenAlertsManager,
  onOpenM365Sync,
}) => {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'inventario': return 'Inventario';
      case 'mantenimiento': return 'Mantenimiento';
      case 'informes': return 'Informes Técnicos';
      case 'tiendas': return 'Tiendas (90)';
      case 'helpdesk': return 'Helpdesk';
      case 'usuarios': return 'Directorio';
      default: return 'Portal Soporte Onsite';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] z-40 px-4 flex md:hidden items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#007a33] flex items-center justify-center text-white font-bold text-sm shadow-sm">
          T
        </div>
        <div>
          <h1 className="font-bold text-[#00236f] text-base leading-tight">{getTitle()}</h1>
          <span className="text-[10px] text-[#757682] font-medium block">Tottus · Sistemas de la Información</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenM365Sync}
          className="p-2 rounded-full text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] transition-transform active:scale-95"
          title="SharePoint & Dataverse"
        >
          <TableProperties className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenQRScanner}
          className="p-2 rounded-full text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] transition-transform active:scale-95"
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
          className="relative p-2 rounded-full text-[#444651] bg-[#f8f9ff] hover:bg-[#eff4ff] transition-transform active:scale-95"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#00236f]/30 ml-1"
        />
      </div>
    </header>
  );
};
