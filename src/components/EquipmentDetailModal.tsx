import React, { useState } from 'react';
import {
  X,
  QrCode,
  Wrench,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  Clock,
  Printer,
  Network,
  Server,
  Building,
  Copy,
  Check
} from 'lucide-react';
import { Equipment } from '../types';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onOpenReportForEquipment: (eq: Equipment) => void;
  onOpenTicketForEquipment: (eq: Equipment) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onOpenReportForEquipment,
  onOpenTicketForEquipment,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!equipment) return null;

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isCritical = equipment.status === 'falla_critica';
  const isWarning = equipment.status === 'mantenimiento';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#e5eeff]">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#e5eeff] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-[#eff4ff] overflow-hidden border border-[#dce9ff] shrink-0">
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded">
                  {equipment.code}
                </span>
                {equipment.hostName && (
                  <span className="font-mono text-xs font-bold text-[#00236f] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                    <span>Host: {equipment.hostName}</span>
                    <button
                      onClick={() => handleCopy('host', equipment.hostName!)}
                      className="hover:text-blue-900"
                    >
                      {copiedKey === 'host' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </span>
                )}
                {equipment.storeCodeNumber && (
                  <span className="text-[10px] font-bold bg-[#e8efff] text-[#00236f] px-1.5 py-0.5 rounded">
                    COD {equipment.storeCodeNumber}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : isWarning
                      ? 'bg-[#fff3e0] text-[#fd761a]'
                      : 'bg-[#e8f5e9] text-[#10b981]'
                  }`}
                >
                  {equipment.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0b1c30] mt-1">{equipment.name}</h2>
              <span className="text-xs text-[#757682]">
                {equipment.storeName} • {equipment.locationInStore} {equipment.formato ? `(${equipment.formato})` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#757682] p-1 font-bold hover:text-black rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Technical Specs 4-Box Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
            <span className="text-[#757682] text-[10px] uppercase font-bold block">Marca & Modelo</span>
            <strong className="text-[#0b1c30]">{equipment.brand}</strong>
            <div className="text-[10px] text-[#757682]">{equipment.model}</div>
          </div>
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
            <span className="text-[#757682] text-[10px] uppercase font-bold block">N° Serie</span>
            <div className="flex items-center justify-between">
              <strong className="font-mono text-[#00236f] text-xs truncate">{equipment.serialNumber}</strong>
              <button
                onClick={() => handleCopy('sn', equipment.serialNumber)}
                className="text-[#757682] hover:text-[#00236f] ml-1"
                title="Copiar serie"
              >
                {copiedKey === 'sn' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
            <span className="text-[#757682] text-[10px] uppercase font-bold block">Último Mantenimiento</span>
            <strong className="text-[#0b1c30]">{equipment.lastMaintenance}</strong>
          </div>
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
            <span className="text-[#757682] text-[10px] uppercase font-bold block">Próximo Vencimiento</span>
            <strong className="text-[#fd761a]">{equipment.nextMaintenance}</strong>
          </div>
        </div>

        {/* SECCIÓN DESTACADA: ENLACE A SWITCH Y EQUIPO DE COMUNICACIÓN */}
        <div className="p-3.5 bg-gradient-to-br from-[#eff4ff] to-[#f4f7ff] rounded-xl border border-[#dce9ff] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#00236f] flex items-center gap-1.5 uppercase tracking-wide">
              <Network className="w-4 h-4 text-[#00236f]" />
              <span>Enlace a Equipos de Comunicación (Switch & Red)</span>
            </h4>
            {equipment.linkStatus === 'down' ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                LINK DOWN
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                CONECTADO / LINK UP
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">Switch Conectado</span>
              <strong className="font-mono text-[#00236f] text-[11px] block truncate">
                {equipment.switchName || 'No asignado'}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">Puerto de Switch</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-xs bg-[#00236f] text-white px-2 py-0.5 rounded">
                  {equipment.puertoSwitch || 'N/A'}
                </span>
                {equipment.vlan && (
                  <span className="text-[10px] text-[#757682]">{equipment.vlan}</span>
                )}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">Dirección IP del Equipo</span>
              <div className="flex items-center justify-between mt-0.5">
                <strong className="font-mono text-[#0b1c30] text-xs">
                  {equipment.ipAddress || 'Sin IP asignada'}
                </strong>
                {equipment.ipAddress && (
                  <button
                    onClick={() => handleCopy('ip', equipment.ipAddress!)}
                    className="text-[#757682] hover:text-[#00236f]"
                  >
                    {copiedKey === 'ip' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">MAC Address</span>
              <strong className="font-mono text-[#444651] text-[11px] block truncate">
                {equipment.macAddress || 'No registrada'}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">Gateway & Máscara</span>
              <div className="font-mono text-[11px] text-[#444651]">
                GW: {equipment.gateway || 'N/A'}
              </div>
              <div className="font-mono text-[10px] text-[#757682]">
                Subnet: {equipment.mascara || '255.255.255.0'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-[#dce9ff] shadow-2xs">
              <span className="text-[10px] text-[#757682] uppercase font-semibold block">Velocidad / Dúplex</span>
              <strong className="text-[#0b1c30] text-xs block">
                {equipment.speedDuplex || '100 Mbps / 1 Gbps Auto'}
              </strong>
            </div>
          </div>
        </div>

        {/* SECCIÓN DATOS CORPORATIVOS TOPE / SISTEMAS */}
        {(equipment.centroCostos || equipment.partNumber || equipment.procesador) && (
          <div className="p-3.5 bg-white rounded-xl border border-[#e5eeff] space-y-2">
            <h4 className="font-bold text-xs text-[#0b1c30] flex items-center gap-1.5 uppercase tracking-wide">
              <Building className="w-4 h-4 text-[#00236f]" />
              <span>Información Corporativa TOPE (Falabella / Tottus)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Centro de Costos</span>
                <strong className="font-mono text-[#00236f] text-xs">{equipment.centroCostos || 'N/A'}</strong>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Part Number (PN)</span>
                <strong className="font-mono text-[#0b1c30] text-xs">{equipment.partNumber || 'N/A'}</strong>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Procesador</span>
                <span className="font-medium text-[#0b1c30] text-[11px] block truncate" title={equipment.procesador}>
                  {equipment.procesador || 'N/A'}
                </span>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">RAM & Disco</span>
                <span className="font-medium text-[#0b1c30] text-[11px] block truncate">
                  {equipment.memoriaRam || '4 GB'} / {equipment.discoDuro || '128 GB'}
                </span>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Sistema Operativo</span>
                <span className="font-medium text-[#0b1c30] text-[11px] block truncate">
                  {equipment.sistemaOperativo || 'Windows'}
                </span>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Obsolescencia HW</span>
                <strong className="text-[#ba1a1a] text-xs">{equipment.obsolescenciaHW || 'N/A'}</strong>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Proveedor Hardware</span>
                <span className="font-medium text-[#0b1c30] text-[11px] block truncate" title={equipment.proveedor}>
                  {equipment.proveedor || 'NCR COMMERCE'}
                </span>
              </div>
              <div className="p-2 bg-[#f8f9ff] rounded-lg">
                <span className="text-[10px] text-[#757682] uppercase block">Costo Mensual Servicio</span>
                <strong className="text-emerald-700 text-xs">
                  {equipment.costoServicio ? `S/ ${equipment.costoServicio.toFixed(2)}` : 'S/ 9.86'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* QR Code & Physical Asset Tag Preview */}
        <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white p-1.5 rounded-xl shadow-xs border border-[#dce9ff] flex items-center justify-center">
              <QrCode className="w-11 h-11 text-[#00236f]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#00236f]">Placa Digital QR para Campo</h4>
              <p className="text-[11px] text-[#444651]">
                Imprima esta etiqueta QR que incluye el HostName <strong>{equipment.hostName || equipment.code}</strong> y enlace al switch <strong>{equipment.switchName || 'LAN'}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.print();
            }}
            className="px-3.5 py-2 bg-white text-[#00236f] border border-[#dce9ff] rounded-lg text-xs font-bold hover:bg-[#eff4ff] flex items-center gap-1.5 shrink-0 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Etiqueta</span>
          </button>
        </div>

        {/* Maintenance History */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682] mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00236f]" />
            Historial de Intervenciones Técnicas
          </h4>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 ? (
              equipment.maintenanceHistory.map(h => (
                <div key={h.id} className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] text-xs flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[#0b1c30]">{h.findings || h.actionsTaken}</div>
                    <div className="text-[10px] text-[#757682]">Técnico: {h.technician}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#00236f]">{h.date}</span>
                    <div className="text-[10px] text-[#10b981] font-semibold">{h.result}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-[#757682] bg-gray-50 rounded-lg">
                No hay intervenciones previas registradas para este activo.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#e5eeff]">
          <button
            onClick={() => {
              onClose();
              onOpenTicketForEquipment(equipment);
            }}
            className="flex-1 py-2.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-xs font-bold hover:bg-[#ffb4ab] transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reportar Incidente / Crear Ticket</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenReportForEquipment(equipment);
            }}
            className="flex-1 py-2.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#1e3a8a] transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generar Informe Técnico PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

