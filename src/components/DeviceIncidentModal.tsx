import React, { useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  X,
  CheckCircle2,
  Wrench,
  Copy,
  Check,
  Building2,
  Smartphone,
  Printer
} from 'lucide-react';
import { DeviceCustodyItem, AppUser } from '../types';
import { FALABELLA_AI_MONITORING_URL } from '../data/deviceCustodyData';

interface DeviceIncidentModalProps {
  device: DeviceCustodyItem;
  currentUser: AppUser;
  onClose: () => void;
  onSubmitIncident: (data: {
    fallaType: string;
    description: string;
    falabellaTicketCode: string;
    createHelpdeskTicket: boolean;
  }) => void;
}

export const DeviceIncidentModal: React.FC<DeviceIncidentModalProps> = ({
  device,
  currentUser,
  onClose,
  onSubmitIncident,
}) => {
  const [fallaType, setFallaType] = useState('Pantalla rota / touch defectuoso');
  const [description, setDescription] = useState('');
  const [falabellaTicketCode, setFalabellaTicketCode] = useState('');
  const [createHelpdeskTicket, setCreateHelpdeskTicket] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fallaOptions = [
    'Pantalla rota / touch defectuoso por caída',
    'Gatillo de escaneo inoperativo o trabado',
    'No enciende / batería dañada o no retiene carga',
    'Cabezal térmico no imprime / líneas blancas (Impresora)',
    'Problema de rodillo / atasco de papel continuo (Impresora)',
    'Error de conexión Wi-Fi / pérdida constante de señal',
    'Lente óptico de lectura rayado / no lee códigos',
    'Conector USB de carga dañado / pin doblado',
    'Carcasa quebrada / daño físico severo',
    'Aplicación Tottus / Falabella colgada en bucle',
    'Otro defecto de hardware'
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(FALABELLA_AI_MONITORING_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor detalle el motivo de la falla o daño del equipo.');
      return;
    }

    onSubmitIncident({
      fallaType,
      description,
      falabellaTicketCode: falabellaTicketCode.trim(),
      createHelpdeskTicket
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-red-200 my-8">
        {/* Header with warning colors */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 to-red-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Reportar Falla / Incidencia Técnica
              </h3>
              <p className="text-[11px] text-red-100">
                Custodia CCTV · {device.storeName} (T-{device.storeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-[#0b1c30]">
          {/* Device Summary Card */}
          <div className="bg-red-50/70 p-3 rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                {device.deviceType === 'PDA' ? <Smartphone className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                  <span>{device.equipmentCode}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-200 text-red-900 font-mono">
                    {device.deviceType}
                  </span>
                </div>
                <div className="text-[11px] text-red-800">
                  {device.brand} {device.model} · Serie: <strong className="font-mono">{device.serialNumber}</strong>
                </div>
              </div>
            </div>
            {device.currentBorrower && (
              <div className="text-right text-[10px] text-red-900">
                <span className="text-red-600 block">Último usuario:</span>
                <span className="font-bold">{device.currentBorrower.name}</span>
              </div>
            )}
          </div>

          {/* CRITICAL MANDATORY INSTRUCTION: Falabella AI-Monitoring Portal */}
          <div className="p-4 rounded-xl bg-[#007a33]/10 border-2 border-[#007a33] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#007a33] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                  F
                </div>
                <span className="font-bold text-xs text-[#004f21]">
                  Portal Oficial Falabella AI-Monitoring
                </span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-[#007a33] px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                Requerido
              </span>
            </div>

            <p className="text-[11px] text-[#2c3e50] leading-relaxed">
              Para incidencias con proveedores (DMS, Zebra, NCR) o soporte local, debe activar y registrar el ticket en el portal corporativo:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <a
                href={FALABELLA_AI_MONITORING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3.5 py-2.5 bg-[#007a33] hover:bg-[#005c26] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Abrir Falabella AI-Monitoring</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 bg-white border border-[#007a33] text-[#007a33] hover:bg-emerald-50 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                title="Copiar enlace"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>

            <div className="text-[10px] text-[#555] font-mono break-all bg-white/80 p-1.5 rounded border border-emerald-200">
              {FALABELLA_AI_MONITORING_URL}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#444651] mb-1">
                Tipo o Causa de Falla:
              </label>
              <select
                value={fallaType}
                onChange={(e) => setFallaType(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#00236f]"
              >
                {fallaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#444651] mb-1">
                Detalle de la Falla / Circunstancias: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describa qué ocurrió, en qué área de la tienda, si fue caída, derrame de líquido o falla espontánea..."
                className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs focus:outline-hidden focus:border-[#00236f]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#444651] mb-1 flex items-center justify-between">
                <span>N° Ticket Falabella AI-Monitoring (Opcional):</span>
                <span className="text-[10px] text-[#757682] font-normal">Obtenido en el portal</span>
              </label>
              <input
                type="text"
                value={falabellaTicketCode}
                onChange={(e) => setFalabellaTicketCode(e.target.value)}
                placeholder="Ej. FAL-TKT-884129 o Ticket DMS 98638"
                className="w-full px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-mono uppercase focus:outline-hidden focus:border-[#00236f]"
              />
            </div>

            {/* Checkbox to link with Helpdesk */}
            <label className="flex items-start gap-2.5 p-2.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] cursor-pointer">
              <input
                type="checkbox"
                checked={createHelpdeskTicket}
                onChange={(e) => setCreateHelpdeskTicket(e.target.checked)}
                className="mt-0.5 rounded text-[#00236f] focus:ring-0"
              />
              <div className="text-[11px] leading-tight text-[#00236f]">
                <strong className="block">Sincronizar y generar Ticket en Mesa de Ayuda Helpdesk CMMS</strong>
                <span className="text-[#525e75] text-[10px]">
                  Crea automáticamente el registro en la planilla de Helpdesk & Repuestos asignado al proveedor DMS/Zebra y tienda T-{device.storeCode}.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#f0f4ff] text-[#444651] font-bold text-xs rounded-xl hover:bg-[#dce9ff] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar Falla & Retener Equipo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
