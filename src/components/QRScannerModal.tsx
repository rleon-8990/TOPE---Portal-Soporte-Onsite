import React, { useState, useEffect, useRef } from 'react';
import { QrCode, X, Search, Check, Camera, Sparkles, Video, VideoOff, Upload, ShieldCheck, Tag } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start real camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Acceso a cámara no soportado en este navegador. Utilice búsqueda o simulación.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Permiso de cámara denegado o no disponible. Puede simular o buscar el equipo.');
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (eq: Equipment) => {
    setSimulatingScan(true);
    stopCamera();
    setTimeout(() => {
      setSimulatingScan(false);
      onSelectEquipment(eq);
      onClose();
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSimulatingScan(true);
    // Simulate optical QR decoding from uploaded image
    setTimeout(() => {
      setSimulatingScan(false);
      const targetEq = equipments[Math.floor(Math.random() * equipments.length)] || equipments[0];
      if (targetEq) {
        onSelectEquipment(targetEq);
        onClose();
      }
    }, 800);
  };

  const filteredEquipments = equipments.filter(eq =>
    eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (eq.codigoActivo && eq.codigoActivo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (eq.hostName && eq.hostName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] border border-[#e5eeff]">
        {/* Header */}
        <div className="p-4 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#fd761a]" />
            <div>
              <h3 className="font-bold text-sm">Escáner de Equipo & QR Activo</h3>
              <p className="text-[11px] text-white/75">Identificación por placa técnica y código de activo</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-white/80 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport (Camera or Laser Viewfinder) */}
        <div className="relative bg-[#0b1c30] p-4 text-center text-white flex flex-col items-center justify-center min-h-[220px]">
          {isCameraActive ? (
            <div className="relative w-full h-56 rounded-xl overflow-hidden border-2 border-[#10b981] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Overlay Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-44 border-2 border-[#10b981] rounded-xl relative shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                  <div className="absolute left-0 right-0 h-0.5 bg-[#10b981] animate-bounce shadow-[0_0_10px_#10b981]" />
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
                EN VIVO
              </div>
            </div>
          ) : (
            <div className="relative w-48 h-48 border-2 border-[#10b981] rounded-2xl flex items-center justify-center overflow-hidden shadow-inner bg-black/50">
              {/* Animated Laser Scanning Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#10b981] shadow-[0_0_12px_#10b981] animate-bounce" />
              
              {/* Corner Reticles */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />

              <div className="text-center p-2">
                <Camera className="w-8 h-8 mx-auto text-white/60 mb-1 animate-pulse" />
                <span className="text-[11px] font-mono text-white/80 block">
                  {simulatingScan ? 'Decodificando QR...' : 'Visor QR / Placa Activo'}
                </span>
                <span className="text-[9px] text-white/50">Apunte al activo o use búsqueda</span>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="mt-2 p-1.5 bg-amber-950/60 border border-amber-500/40 rounded text-[10px] text-amber-200">
              {cameraError}
            </div>
          )}

          {/* Camera controls toolbar */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isCameraActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#10b981] hover:bg-emerald-600 text-black font-bold'
              }`}
            >
              {isCameraActive ? (
                <>
                  <VideoOff className="w-3.5 h-3.5" />
                  <span>Detener Cámara</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>Activar Cámara Real</span>
                </>
              )}
            </button>

            <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto QR</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Quick Search Trigger by Code, Serial, Asset Code, Host */}
        <div className="p-3.5 border-b border-[#e5eeff] bg-[#f8f9ff] space-y-1.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por Cód. Activo (ACT-), Serie, HostName o Tienda..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-[#c5c5d3] focus:border-[#00236f] focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#757682]">
            <span>Toque un equipo para vincular lectura instantánea:</span>
            <span className="font-mono font-bold text-[#00236f]">{filteredEquipments.length} coincidencias</span>
          </div>
        </div>

        {/* List of Equipments */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64 divide-y divide-[#f0f4ff]">
          {filteredEquipments.slice(0, 12).map(eq => (
            <button
              key={eq.id}
              onClick={() => handleSimulateScan(eq)}
              className="w-full p-2.5 rounded-xl hover:bg-[#eff4ff] text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                    {eq.code}
                  </span>
                  {eq.codigoActivo && (
                    <span className="font-mono text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {eq.codigoActivo}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[#0b1c30] truncate max-w-[180px]">{eq.name}</span>
                </div>
                <div className="text-[10px] text-[#757682] mt-1 flex items-center gap-2">
                  <span>{eq.storeName}</span>
                  <span>•</span>
                  <span>SN: <strong className="font-mono">{eq.serialNumber}</strong></span>
                  {eq.switchName && (
                    <>
                      <span>•</span>
                      <span className="text-[#00236f]">SW: {eq.switchName}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs text-[#00236f] font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 ml-2">
                <Sparkles className="w-3.5 h-3.5 text-[#fd761a]" />
                Abrir Ficha
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 bg-[#f8f9ff] border-t border-[#e5eeff] flex justify-between items-center text-xs">
          <span className="text-[#757682] text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Validación Portal OnSite Corporativa
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#00236f] text-white text-xs font-medium rounded-lg hover:bg-[#1e3a8a]"
          >
            Cerrar Escáner
          </button>
        </div>
      </div>
    </div>
  );
};
