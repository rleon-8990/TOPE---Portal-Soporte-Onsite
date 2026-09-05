import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Radio,
  Send,
  ShieldAlert,
  Bell,
  CheckCircle2,
  MapPin,
  Store as StoreIcon
} from 'lucide-react';
import { RegionalAlert, Store, Region } from '../types';
import { playNotificationChime } from '../utils/helpers';

interface RegionalAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  regionalAlerts: RegionalAlert[];
  onBroadcastAlert: (alert: RegionalAlert) => void;
  onResolveAlert: (alertId: string) => void;
}

export const RegionalAlertsModal: React.FC<RegionalAlertsModalProps> = ({
  isOpen,
  onClose,
  stores,
  regionalAlerts,
  onBroadcastAlert,
  onResolveAlert,
}) => {
  const [scope, setScope] = useState<'regional' | 'sucursal'>('regional');
  const [targetRegion, setTargetRegion] = useState<Region>('Zona Norte');
  const [targetStoreId, setTargetStoreId] = useState<string>(stores[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'advertencia' | 'critica' | 'emergencia_operativa'>('critica');

  if (!isOpen) return null;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === targetStoreId);

    const newAlert: RegionalAlert = {
      id: `alert-${Date.now()}`,
      scope,
      region: scope === 'regional' ? targetRegion : st?.region,
      storeId: scope === 'sucursal' ? targetStoreId : undefined,
      storeName: scope === 'sucursal' ? st?.name : undefined,
      title,
      description,
      severity,
      active: true,
      createdAt: 'Hace un momento',
      affectedEquipmentsCount: scope === 'regional' ? 14 : 2,
    };

    playNotificationChime();
    onBroadcastAlert(newAlert);
    setTitle('');
    setDescription('');
    alert(`📢 Alerta transmitida exitosamente a todos los dispositivos técnicos de la ${scope === 'regional' ? targetRegion : st?.name}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-[#e5eeff]">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shadow-md shadow-[#ba1a1a]/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">Centro de Alertas Críticas</h2>
              <p className="text-xs text-[#757682]">Gestión de contingencias a nivel regional o individual por tienda</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#757682] p-1 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Broadcast Creator Form */}
        <form onSubmit={handleSendBroadcast} className="bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff] space-y-3.5">
          <h3 className="text-xs font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#ba1a1a] animate-pulse" />
            Emitir Nueva Alerta en Tiempo Real (Push)
          </h3>

          {/* Scope Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScope('regional')}
              className={`p-2.5 rounded-lg text-xs font-bold transition-colors border ${
                scope === 'regional'
                  ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                  : 'bg-white text-[#444651] border-[#e5eeff]'
              }`}
            >
              Alerta Regional (Toda una zona)
            </button>
            <button
              type="button"
              onClick={() => setScope('sucursal')}
              className={`p-2.5 rounded-lg text-xs font-bold transition-colors border ${
                scope === 'sucursal'
                  ? 'bg-[#00236f] text-white border-[#00236f] shadow-xs'
                  : 'bg-white text-[#444651] border-[#e5eeff]'
              }`}
            >
              Alerta Individual (Una Tienda)
            </button>
          </div>

          {/* Target Selector */}
          {scope === 'regional' ? (
            <div>
              <label className="text-[11px] font-bold text-[#757682] uppercase block mb-1">
                Seleccionar Región de Impacto
              </label>
              <select
                value={targetRegion}
                onChange={e => setTargetRegion(e.target.value as Region)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              >
                <option value="Lima y Callao">Lima y Callao (35 Tiendas)</option>
                <option value="Zona Norte">Zona Norte (20 Tiendas)</option>
                <option value="Zona Sur">Zona Sur (18 Tiendas)</option>
                <option value="Zona Centro">Zona Centro (10 Tiendas)</option>
                <option value="Zona Oriente">Zona Oriente (7 Tiendas)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-bold text-[#757682] uppercase block mb-1">
                Seleccionar Tienda Específica (90)
              </label>
              <select
                value={targetStoreId}
                onChange={e => setTargetStoreId(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name} ({s.region})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#757682] uppercase block mb-1">
                Título del Evento Crítico
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Onda de calor / Falla de suministro eléctrico..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#757682] uppercase block mb-1">
                Nivel de Gravedad
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as unknown as 'advertencia' | 'critica' | 'emergencia_operativa')}
                className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-bold"
              >
                <option value="advertencia">Advertencia Técnica</option>
                <option value="critica">Alerta Crítica</option>
                <option value="emergencia_operativa">Emergencia Operativa (Parada)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#757682] uppercase block mb-1">
              Instrucción para Técnicos y Jefes de Sucursal
            </label>
            <textarea
              rows={2}
              required
              placeholder="Indique medidas de mitigación inmediatas a ejecutar..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#ba1a1a] text-white rounded-lg text-xs font-bold hover:bg-[#93000a] flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Transmitir Alerta Push Masiva</span>
          </button>
        </form>

        {/* List of Active Regional Alerts */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#757682] mb-2.5">
            Alertas Activas en el Sistema ({regionalAlerts.filter(a => a.active).length})
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            {regionalAlerts.map(al => (
              <div
                key={al.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                  al.active ? 'bg-[#ffdad6]/35 border-[#ba1a1a]/30' : 'bg-[#f8f9ff] border-[#e5eeff] opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#ba1a1a] text-white">
                      {al.severity.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-[#0b1c30] truncate">{al.title}</span>
                    <span className="text-[10px] text-[#757682]">{al.createdAt}</span>
                  </div>

                  <p className="text-xs text-[#444651] mb-1.5">{al.description}</p>

                  <div className="flex items-center gap-2 text-[10px] text-[#757682]">
                    <span className="font-semibold text-[#00236f]">
                      {al.scope === 'regional' ? `Región: ${al.region}` : `Tienda: ${al.storeName}`}
                    </span>
                    <span>•</span>
                    <span>{al.affectedEquipmentsCount} equipos involucrados</span>
                  </div>
                </div>

                {al.active && (
                  <button
                    onClick={() => onResolveAlert(al.id)}
                    className="px-3 py-1 bg-[#10b981] text-white rounded-lg text-xs font-bold hover:bg-[#059669] shrink-0"
                  >
                    Resolver
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#eff4ff] text-[#00236f] rounded-lg text-xs font-bold hover:bg-[#dce9ff]"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
