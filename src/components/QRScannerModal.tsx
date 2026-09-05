import React, { useState } from 'react';
import { QrCode, X, Search, Check, Camera, Sparkles } from 'lucide-react';
import { Equipment } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  onSelectEquipment: (equipment: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  equipments,
  onSelectEquipment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [simulatingScan, setSimulatingScan] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = (eq: Equipment) => {
    setSimulatingScan(true);
    setTimeout(() => {
      setSimulatingScan(false);
      onSelectEquipment(eq);
      onClose();
    }, 600);
  };

  const filteredEquipments = equipments.filter(eq =>
    eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] border border-[#e5eeff]">
        {/* Header */}
        <div className="p-4 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#fd761a]" />
            <div>
              <h3 className="font-bold text-sm">Escáner de Equipo & QR</h3>
              <p className="text-[11px] text-white/75">Identificación instantánea por placa técnica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Simulation Viewport */}
        <div className="relative bg-[#0b1c30] p-6 text-center text-white flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 border-2 border-[#10b981] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner bg-black/40">
            {/* Animated Laser Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#10b981] shadow-[0_0_12px_#10b981] animate-bounce" />
            
            {/* Corner Reticles */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />

            <div className="text-center p-2">
              <Camera className="w-8 h-8 mx-auto text-white/60 mb-1 animate-pulse" />
              <span className="text-[11px] font-mono text-white/80">
                {simulatingScan ? 'Decodificando...' : 'Apunte al código QR / Barras'}
              </span>
            </div>
          </div>

          <p className="text-xs text-white/80 mt-3 max-w-xs">
            El lector CMMS sincroniza la ficha técnica, órdenes activas y reportes al instante.
          </p>
        </div>

        {/* Quick Simulated Equipment Trigger */}
        <div className="p-4 border-b border-[#e5eeff] bg-[#f8f9ff]">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por código (ej. HVAC-001, BMB-042)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-[#c5c5d3] focus:border-[#00236f] focus:outline-none"
            />
          </div>
          <span className="text-[11px] text-[#757682] block">
            Haga clic en un equipo para simular escaneo de etiqueta física:
          </span>
        </div>

        {/* List of Equipments */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 divide-y divide-[#f0f4ff]">
          {filteredEquipments.slice(0, 10).map(eq => (
            <button
              key={eq.id}
              onClick={() => handleSimulateScan(eq)}
              className="w-full p-2.5 rounded-xl hover:bg-[#eff4ff] text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                    {eq.code}
                  </span>
                  <span className="text-xs font-semibold text-[#0b1c30] truncate">{eq.name}</span>
                </div>
                <div className="text-[10px] text-[#757682] mt-0.5">
                  {eq.storeName} • {eq.brand} ({eq.categoryName})
                </div>
              </div>
              <span className="text-xs text-[#00236f] font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                <Sparkles className="w-3.5 h-3.5 text-[#fd761a]" />
                Escanear
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 bg-[#f8f9ff] border-t border-[#e5eeff] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00236f] text-white text-xs font-medium rounded-lg hover:bg-[#1e3a8a]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
