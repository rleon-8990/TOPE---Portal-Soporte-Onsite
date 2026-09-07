import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  ShieldCheck,
  Zap,
  ChevronDown,
  TableProperties,
  Radio,
  X
} from 'lucide-react';
import { AutoSyncConfig, MicrosoftDataService } from '../services/microsoftDataService';

interface AutoSyncStatusWidgetProps {
  onTriggerSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
  onOpenSyncModal: () => void;
  autoSyncConfig: AutoSyncConfig;
  onUpdateConfig: (newCfg: Partial<AutoSyncConfig>) => void;
}

export const AutoSyncStatusWidget: React.FC<AutoSyncStatusWidgetProps> = ({
  onTriggerSync,
  isSyncing,
  lastSyncTime,
  onOpenSyncModal,
  autoSyncConfig,
  onUpdateConfig
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [relativeTime, setRelativeTime] = useState<string>('Nunca');

  // Compute human-readable relative time
  useEffect(() => {
    const updateRelative = () => {
      if (!lastSyncTime) {
        setRelativeTime('Al iniciar sesión');
        return;
      }
      try {
        const diffMs = Date.now() - new Date(lastSyncTime).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) {
          setRelativeTime('Justo ahora');
        } else if (mins === 1) {
          setRelativeTime('Hace 1 min');
        } else if (mins < 60) {
          setRelativeTime(`Hace ${mins} min`);
        } else {
          const hours = Math.floor(mins / 60);
          setRelativeTime(`Hace ${hours} h`);
        }
      } catch (e) {
        setRelativeTime('Reciente');
      }
    };

    updateRelative();
    const interval = setInterval(updateRelative, 30000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const intervals = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '60 min', value: 60 }
  ];

  return (
    <div className="relative inline-block text-left">
      {/* Main Pill Badge */}
      <div className="flex items-center gap-1.5 bg-white border border-[#dce9ff] shadow-xs rounded-full p-1 pl-2.5">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-xs font-semibold text-[#00236f] hover:text-[#00174c] transition-colors focus:outline-none"
          title="Configuración de Auto-Sincronización Permanente"
        >
          {autoSyncConfig.enabled ? (
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"></span>
          )}

          <div className="flex flex-col items-start leading-none text-left">
            <span className="text-[11px] font-bold text-[#00236f] flex items-center gap-1">
              {autoSyncConfig.enabled ? 'Auto-Sync Activo' : 'Auto-Sync Pausado'}
              <ChevronDown className="w-3 h-3 text-[#757682]" />
            </span>
            <span className="text-[9px] text-[#757682] font-normal mt-0.5">
              {isSyncing ? 'Sincronizando...' : `${relativeTime} (${autoSyncConfig.intervalMinutes}m)`}
            </span>
          </div>
        </button>

        {/* Quick Sync Button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className={`p-1.5 rounded-full text-[#00236f] hover:bg-[#eff4ff] active:scale-95 transition-all ${
            isSyncing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          title="Ejecutar sincronización ahora"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00236f]' : 'text-[#555770]'}`} />
        </button>
      </div>

      {/* Settings Popover Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#dce9ff] z-50 p-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eeff]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#00236f]">Sincronización Permanente</h4>
                  <p className="text-[10px] text-[#757682]">SharePoint Online & Directorio</p>
                </div>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 rounded-full text-[#757682] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              {/* Toggle Enabled */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8faff] border border-[#e5eeff]">
                <div>
                  <div className="font-semibold text-[#00236f]">Auto-Sincronizar en Segundo Plano</div>
                  <div className="text-[10px] text-[#757682]">No requiere recargar manualmente</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoSyncConfig.enabled}
                    onChange={(e) => onUpdateConfig({ enabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Interval selector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#444651] mb-1.5">
                  Frecuencia de Auto-Sincronización:
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {intervals.map(inv => (
                    <button
                      key={inv.value}
                      onClick={() => onUpdateConfig({ intervalMinutes: inv.value })}
                      className={`py-1 text-[11px] font-bold rounded-lg border transition-all ${
                        autoSyncConfig.intervalMinutes === inv.value
                          ? 'bg-[#00236f] text-white border-[#00236f]'
                          : 'bg-white text-[#444651] border-[#e5eeff] hover:bg-[#eff4ff]'
                      }`}
                    >
                      {inv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Startup Sync toggle */}
              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncConfig.syncOnStartup}
                  onChange={(e) => onUpdateConfig({ syncOnStartup: e.target.checked })}
                  className="mt-0.5 rounded text-[#00236f] focus:ring-0"
                />
                <div>
                  <div className="font-medium text-[#1e293b]">Sincronizar siempre al abrir el sistema</div>
                  <div className="text-[10px] text-[#757682]">Valida datos frescos de SharePoint al iniciar</div>
                </div>
              </label>

              {/* Sync Users Agenda */}
              <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSyncConfig.syncUsersAgenda}
                  onChange={(e) => onUpdateConfig({ syncUsersAgenda: e.target.checked })}
                  className="mt-0.5 rounded text-[#00236f] focus:ring-0"
                />
                <div>
                  <div className="font-medium text-[#1e293b]">Auto-incorporar personal a la Agenda</div>
                  <div className="text-[10px] text-[#757682]">Gerentes e IT Operators sincronizados</div>
                </div>
              </label>

              {/* Status info box */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Persistencia Permanente Activa:</span> Los datos están resguardados en el almacenamiento del navegador y se mantienen incluso tras reiniciar o cerrar sesión.
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-2 border-t border-[#e5eeff] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenSyncModal();
                }}
                className="text-[11px] font-semibold text-[#00236f] hover:underline flex items-center gap-1"
              >
                <TableProperties className="w-3.5 h-3.5" />
                Configurar SharePoint
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onTriggerSync();
                }}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-[#00236f] hover:bg-[#001b55] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sincronizar Ahora
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
