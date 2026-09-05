import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Wrench,
  Clock,
  Sparkles,
  Volume2
} from 'lucide-react';
import { PushNotification } from '../types';
import { playNotificationChime } from '../utils/helpers';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSimulateNewPush: () => void;
  onNavigateModule: (moduleName: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSimulateNewPush,
  onNavigateModule,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: PushNotification['type'], severity: PushNotification['severity']) => {
    if (severity === 'critica') {
      return <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />;
    }
    switch (type) {
      case 'falla_critica':
        return <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />;
      case 'mantenimiento':
        return <Wrench className="w-5 h-5 text-[#10b981]" />;
      case 'informe':
        return <FileText className="w-5 h-5 text-[#4059aa]" />;
      case 'calibracion':
        return <Clock className="w-5 h-5 text-[#fd761a]" />;
      default:
        return <Bell className="w-5 h-5 text-[#00236f]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden border border-[#e5eeff]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#0b1c30] text-base">Notificaciones Push</h2>
              <p className="text-xs text-[#757682]">
                {unreadCount} sin leer • Alertas en tiempo real por módulo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#757682] hover:bg-[#e5eeff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Simulation Controls */}
        <div className="p-3 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between gap-2">
          <button
            onClick={() => {
              playNotificationChime();
              onSimulateNewPush();
            }}
            className="text-xs font-semibold bg-[#00236f] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#1e3a8a] transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fd761a]" />
            <span>Simular Alerta Push en Vivo</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-[#00236f] font-medium hover:underline flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar todas leídas</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-[#f0f4ff]">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#757682]">
              <Bell className="w-10 h-10 mx-auto text-[#c5c5d3] mb-2" />
              <p className="text-sm font-medium">No hay notificaciones pendientes</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkAsRead(notif.id);
                  if (notif.linkModule) {
                    onNavigateModule(notif.linkModule);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read
                    ? 'bg-white hover:bg-[#f8f9ff]'
                    : notif.severity === 'critica'
                    ? 'bg-[#ffdad6]/35 border border-[#ba1a1a]/30'
                    : 'bg-[#eff4ff]/60 border border-[#dce9ff]'
                }`}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-white shadow-xs shrink-0">
                  {getIcon(notif.type, notif.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className={`text-xs font-bold truncate ${
                      notif.severity === 'critica' ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'
                    }`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#757682] shrink-0 font-medium">
                      {notif.timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-[#444651] line-clamp-2 mb-1.5 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-[#757682]">
                    {notif.storeName && (
                      <span className="bg-white/80 px-2 py-0.5 rounded border border-[#e5eeff] font-medium text-[#00236f]">
                        {notif.storeName}
                      </span>
                    )}
                    {notif.region && (
                      <span className="text-[#757682]">{notif.region}</span>
                    )}
                  </div>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#00236f] shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8f9ff] border-t border-[#e5eeff] flex justify-between items-center text-xs text-[#757682]">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#10b981]" />
            Sonido push activo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00236f] text-white rounded-lg font-medium text-xs hover:bg-[#1e3a8a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
