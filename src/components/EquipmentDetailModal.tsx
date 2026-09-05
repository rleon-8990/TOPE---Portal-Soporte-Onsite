import React from 'react';
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
  Printer
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
  if (!equipment) return null;

  const isCritical = equipment.status === 'falla_critica';
  const isWarning = equipment.status === 'mantenimiento';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-[#e5eeff]">
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
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded">
                  {equipment.code}
                </span>
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
              <span className="text-xs text-[#757682]">{equipment.storeName} • {equipment.locationInStore}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#757682] p-1 font-bold hover:text-black"
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
            <strong className="font-mono text-[#00236f] text-xs">{equipment.serialNumber}</strong>
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

        {/* QR Code & Physical Asset Tag Preview */}
        <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white p-2 rounded-xl shadow-xs border border-[#dce9ff] flex items-center justify-center">
              <QrCode className="w-12 h-12 text-[#00236f]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#00236f]">Placa Digital QR para Campo</h4>
              <p className="text-[11px] text-[#444651]">
                Imprima esta etiqueta resistente al calor y agua para pegarla en el chasis del equipo.
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
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {equipment.history && equipment.history.length > 0 ? (
              equipment.history.map(h => (
                <div key={h.id} className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] text-xs flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-[#0b1c30]">{h.description}</div>
                    <div className="text-[10px] text-[#757682]">Técnico: {h.technician}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#00236f]">{h.date}</span>
                    <div className="text-[10px] text-[#10b981] font-semibold">{h.type}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#757682]">
                No hay intervenciones previas registradas.
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
