import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  Barcode,
  Camera,
  QrCode,
  User,
  Smartphone,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Search,
  Building2,
  Volume2
} from 'lucide-react';
import { DeviceCustodyItem, StoreColaborador, AppUser } from '../types';
import { playScannerBeep } from '../data/deviceCustodyData';

interface DeviceScannerTerminalProps {
  currentStoreCode: string | number;
  currentStoreName: string;
  devices: DeviceCustodyItem[];
  colaboradores: StoreColaborador[];
  currentUser: AppUser;
  onRegisterLoan: (device: DeviceCustodyItem, borrower: StoreColaborador, notes?: string) => void;
  onRegisterReturn: (device: DeviceCustodyItem, condition: 'conforme' | 'con_falla', notes?: string) => void;
  onOpenIncidentModal: (device: DeviceCustodyItem) => void;
}

export const DeviceScannerTerminal: React.FC<DeviceScannerTerminalProps> = ({
  currentStoreCode,
  currentStoreName,
  devices,
  colaboradores,
  currentUser,
  onRegisterLoan,
  onRegisterReturn,
  onOpenIncidentModal,
}) => {
  // Input fields for scanner gun / keyboard wedge
  const [fotocheckInput, setFotocheckInput] = useState('');
  const [deviceInput, setDeviceInput] = useState('');

  // Matched objects
  const [selectedColaborador, setSelectedColaborador] = useState<StoreColaborador | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceCustodyItem | null>(null);

  // Status message & feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    subText?: string;
  } | null>(null);

  // Camera scanner simulation
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraScanTarget, setCameraScanTarget] = useState<'fotocheck' | 'device'>('fotocheck');

  // Input refs for autofocus
  const fotocheckInputRef = useRef<HTMLInputElement>(null);
  const deviceInputRef = useRef<HTMLInputElement>(null);

  // Keep focus on fotocheck input initially
  useEffect(() => {
    if (!selectedColaborador) {
      fotocheckInputRef.current?.focus();
    } else if (!selectedDevice) {
      deviceInputRef.current?.focus();
    }
  }, [selectedColaborador, selectedDevice]);

  // Handle Fotocheck scan / search
  const handleFotocheckScan = (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    // Search by fotocheck ID, DNI, or name
    const found = colaboradores.find(c => 
      c.fotocheck.toUpperCase() === cleanQuery ||
      c.dni === cleanQuery ||
      c.name.toUpperCase().includes(cleanQuery) ||
      cleanQuery.includes(c.fotocheck.toUpperCase())
    );

    if (found) {
      playScannerBeep('success');
      setSelectedColaborador(found);
      setFotocheckInput(found.fotocheck);
      setFeedbackMessage({
        type: 'success',
        text: `Fotocheck Identificado: ${found.name}`,
        subText: `${found.cargo} · ${found.area}`
      });
      // Move focus to device input
      setTimeout(() => deviceInputRef.current?.focus(), 100);
    } else {
      playScannerBeep('error');
      setFeedbackMessage({
        type: 'error',
        text: `Fotocheck no encontrado: "${query}"`,
        subText: 'Verifique que el código o DNI esté registrado en el Directorio de Tienda.'
      });
    }
  };

  // Handle Device scan / search
  const handleDeviceScan = (query: string) => {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    // Search in current store devices by barcode, serial number, or equipmentCode
    const storeDevices = devices.filter(d => String(d.storeCode) === String(currentStoreCode));
    const found = storeDevices.find(d => 
      d.barcode.toUpperCase() === cleanQuery ||
      d.serialNumber.toUpperCase() === cleanQuery ||
      d.equipmentCode.toUpperCase() === cleanQuery ||
      d.equipmentCode.toUpperCase().replace('-', '') === cleanQuery.replace('-', '')
    ) || devices.find(d => 
      d.barcode.toUpperCase() === cleanQuery ||
      d.serialNumber.toUpperCase() === cleanQuery ||
      d.equipmentCode.toUpperCase() === cleanQuery
    );

    if (found) {
      playScannerBeep('success');
      setSelectedDevice(found);
      setDeviceInput(found.barcode);

      if (found.status === 'en_custodia') {
        setFeedbackMessage({
          type: 'info',
          text: `Equipo en Casillero CCTV: ${found.equipmentCode} (${found.brand} ${found.model})`,
          subText: 'Listo para asignar y registrar salida a piso de venta.'
        });
      } else if (found.status === 'en_uso') {
        setFeedbackMessage({
          type: 'info',
          text: `Equipo actualmente EN USO: ${found.equipmentCode}`,
          subText: `Asignado a: ${found.currentBorrower?.name || 'Colaborador'} (${found.currentBorrower?.borrowedTimeFormatted || 'Hoy'}). Listo para registrar devolución.`
        });
        // If no borrower was selected, autoselect the current borrower
        if (!selectedColaborador && found.currentBorrower) {
          const matchedBorrower = colaboradores.find(c => c.fotocheck === found.currentBorrower?.fotocheck);
          if (matchedBorrower) setSelectedColaborador(matchedBorrower);
        }
      } else if (found.status === 'con_falla') {
        playScannerBeep('error');
        setFeedbackMessage({
          type: 'error',
          text: `¡ATENCIÓN! Equipo RETENIDO POR FALLA: ${found.equipmentCode}`,
          subText: `Falla: ${found.lastIncident?.fallaType || 'En revisión'} · Ticket Falabella: ${found.lastIncident?.falabellaTicketCode || 'No registrado'}`
        });
      }
    } else {
      playScannerBeep('error');
      setFeedbackMessage({
        type: 'error',
        text: `Equipo no reconocido: "${query}"`,
        subText: `No se encontró en la planilla de custodia de T-${currentStoreCode}.`
      });
    }
  };

  // Quick Action: Confirm Loan (Entrega)
  const handleConfirmLoan = () => {
    if (!selectedColaborador || !selectedDevice) {
      playScannerBeep('error');
      alert('Debe escanear tanto el fotocheck del colaborador como el equipo.');
      return;
    }

    if (selectedDevice.status === 'con_falla') {
      playScannerBeep('error');
      alert('Este equipo se encuentra RETENIDO POR FALLA técnica. No puede ser entregado hasta que sea reparado.');
      return;
    }

    playScannerBeep('success');
    onRegisterLoan(selectedDevice, selectedColaborador);

    setFeedbackMessage({
      type: 'success',
      text: `¡Entrega Registrada Exitosamente!`,
      subText: `${selectedDevice.equipmentCode} entregado a ${selectedColaborador.name} (${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })})`
    });

    // Reset fields for next scan
    handleReset();
  };

  // Quick Action: Confirm Return (Devolución Conforme)
  const handleConfirmReturn = () => {
    if (!selectedDevice) {
      alert('Debe escanear el equipo que está siendo devuelto.');
      return;
    }

    playScannerBeep('success');
    onRegisterReturn(selectedDevice, 'conforme', 'Devuelto conforme a casillero CCTV');

    setFeedbackMessage({
      type: 'success',
      text: `¡Devolución Conforme Registrada!`,
      subText: `${selectedDevice.equipmentCode} ha retornado a custodia CCTV. Disponible en casillero.`
    });

    handleReset();
  };

  // Reset scanner state
  const handleReset = () => {
    setSelectedColaborador(null);
    setSelectedDevice(null);
    setFotocheckInput('');
    setDeviceInput('');
    setTimeout(() => fotocheckInputRef.current?.focus(), 150);
  };

  // Camera mock scan triggers
  const handleSimulateCameraScan = (code: string, target: 'fotocheck' | 'device') => {
    setIsCameraActive(false);
    if (target === 'fotocheck') {
      handleFotocheckScan(code);
    } else {
      handleDeviceScan(code);
    }
  };

  const storeDevices = devices.filter(d => String(d.storeCode) === String(currentStoreCode));

  return (
    <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm p-4 sm:p-6 space-y-6">
      {/* Terminal Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5eeff]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white flex items-center justify-center shadow-md shadow-[#00236f]/10">
            <Scan className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg text-[#00236f]">
                Terminal de Escaneo Rápido (Puesto CCTV)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                Lector Activo
              </span>
            </div>
            <p className="text-xs text-[#757682]">
              Pistoleo directo de Fotocheck + PDA o Impresora Portátil · <strong>{currentStoreName} (T-{currentStoreCode})</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-[#f0f4ff] hover:bg-[#dce9ff] text-[#00236f] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Limpiar campos para nuevo escaneo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuevo Escaneo</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 animate-fadeIn ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
          feedbackMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' :
          'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> :
           feedbackMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" /> :
           <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
          <div className="flex-1">
            <strong className="block text-xs font-bold">{feedbackMessage.text}</strong>
            {feedbackMessage.subText && (
              <span className="text-[11px] opacity-90">{feedbackMessage.subText}</span>
            )}
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-[10px] font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Two-Step Scanner Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* STEP 1: FOTOCHECK SCANNER */}
        <div className={`p-5 rounded-2xl border-2 transition-all ${
          selectedColaborador ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#00236f]/30 bg-[#f8f9ff]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-[#00236f] uppercase tracking-wider">
                Escanear Fotocheck Colaborador
              </h3>
            </div>
            {selectedColaborador && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Identificado
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Input Barcode Scanner */}
            <div className="relative">
              <Barcode className="w-5 h-5 text-[#00236f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={fotocheckInputRef}
                type="text"
                value={fotocheckInput}
                onChange={(e) => setFotocheckInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFotocheckScan(fotocheckInput);
                  }
                }}
                placeholder="Pistolear Fotocheck (FC-10294 o DNI) + Enter..."
                className="w-full pl-11 pr-24 py-3 bg-white border border-[#c4dcff] rounded-xl text-xs font-mono font-bold text-[#00236f] shadow-inner focus:outline-hidden focus:ring-2 focus:ring-[#00236f]"
              />
              <button
                type="button"
                onClick={() => handleFotocheckScan(fotocheckInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>

            {/* Quick Demo Chips for Fotochecks */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#757682] font-semibold block">
                Colaboradores frecuentes de T-{currentStoreCode} (Click rápido para probar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {colaboradores
                  .filter(c => String(c.storeCode) === String(currentStoreCode))
                  .slice(0, 4)
                  .map(colab => (
                    <button
                      key={colab.fotocheck}
                      type="button"
                      onClick={() => handleFotocheckScan(colab.fotocheck)}
                      className="px-2 py-1 bg-white hover:bg-[#eff4ff] border border-[#dce9ff] text-[#00236f] rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <User className="w-2.5 h-2.5" />
                      <span>{colab.name.split(' ')[0]} ({colab.fotocheck})</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Selected Colaborador Badge Card */}
            {selectedColaborador ? (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-xs flex items-center gap-3 animate-fadeIn">
                <img
                  src={selectedColaborador.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedColaborador.name}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#0b1c30] truncate">
                      {selectedColaborador.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                      {selectedColaborador.fotocheck}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#444651] font-medium">
                    {selectedColaborador.cargo}
                  </div>
                  <div className="text-[10px] text-[#757682] flex items-center gap-2 mt-0.5">
                    <span>Área: <strong className="text-[#00236f]">{selectedColaborador.area}</strong></span>
                    {selectedColaborador.dni && <span>· DNI: {selectedColaborador.dni}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 p-4 rounded-xl border border-dashed border-[#c4dcff] text-center text-[#757682]">
                <User className="w-8 h-8 text-[#a3b8d7] mx-auto mb-1" />
                <span className="text-[11px] font-medium block">
                  Pase el fotocheck por el lector óptico
                </span>
                <span className="text-[10px] text-[#999]">
                  Se cargará automáticamente la foto y datos del colaborador
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: EQUIPMENT SCANNER */}
        <div className={`p-5 rounded-2xl border-2 transition-all ${
          selectedDevice ? 'border-blue-500 bg-blue-50/20' : 'border-[#00236f]/30 bg-[#f8f9ff]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#00236f] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-bold text-xs sm:text-sm text-[#00236f] uppercase tracking-wider">
                Escanear Equipo (PDA / Impresora)
              </h3>
            </div>
            {selectedDevice && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                selectedDevice.status === 'en_custodia' ? 'bg-emerald-100 text-emerald-800' :
                selectedDevice.status === 'en_uso' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedDevice.status === 'en_custodia' ? 'En Casillero' :
                 selectedDevice.status === 'en_uso' ? 'En Uso' : 'Con Falla'}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Input Equipment Barcode */}
            <div className="relative">
              <QrCode className="w-5 h-5 text-[#00236f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={deviceInputRef}
                type="text"
                value={deviceInput}
                onChange={(e) => setDeviceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDeviceScan(deviceInput);
                  }
                }}
                placeholder="Pistolear código de barras o serie del equipo..."
                className="w-full pl-11 pr-24 py-3 bg-white border border-[#c4dcff] rounded-xl text-xs font-mono font-bold text-[#00236f] shadow-inner focus:outline-hidden focus:ring-2 focus:ring-[#00236f]"
              />
              <button
                type="button"
                onClick={() => handleDeviceScan(deviceInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Buscar
              </button>
            </div>

            {/* Quick Demo Chips for Devices */}
            <div className="space-y-1">
              <span className="text-[10px] text-[#757682] font-semibold block">
                Equipos de T-{currentStoreCode} (Click para pistolear demo):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {storeDevices.slice(0, 4).map(dev => (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => handleDeviceScan(dev.barcode)}
                    className={`px-2 py-1 border rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      dev.status === 'en_custodia' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      dev.status === 'en_uso' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    {dev.deviceType === 'PDA' ? <Smartphone className="w-2.5 h-2.5" /> : <Printer className="w-2.5 h-2.5" />}
                    <span>{dev.equipmentCode} ({dev.barcode})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Device Badge Card */}
            {selectedDevice ? (
              <div className="bg-white p-3.5 rounded-xl border border-blue-300 shadow-xs flex items-center gap-3 animate-fadeIn">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  selectedDevice.deviceType === 'PDA' ? 'bg-[#00236f]' : 'bg-[#fd761a]'
                }`}>
                  {selectedDevice.deviceType === 'PDA' ? <Smartphone className="w-6 h-6" /> : <Printer className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0b1c30]">
                      {selectedDevice.equipmentCode}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-bold">
                      {selectedDevice.deviceType}
                    </span>
                    {selectedDevice.batteryLevel !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        selectedDevice.batteryLevel > 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        🔋 {selectedDevice.batteryLevel}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#444651]">
                    {selectedDevice.brand} {selectedDevice.model}
                  </div>
                  <div className="text-[10px] text-[#757682] font-mono">
                    Serie: {selectedDevice.serialNumber} · Código Barras: {selectedDevice.barcode}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 p-4 rounded-xl border border-dashed border-[#c4dcff] text-center text-[#757682]">
                <QrCode className="w-8 h-8 text-[#a3b8d7] mx-auto mb-1" />
                <span className="text-[11px] font-medium block">
                  Pase el código de barras o QR de la PDA o Impresora
                </span>
                <span className="text-[10px] text-[#999]">
                  Se verificará su estado actual y ubicación de casillero
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC ACTION BAR: Changes based on equipment status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#00236f]/5 border border-[#00236f]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#00236f]">
          <div className="font-bold text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Control de Asignación por Prevención / CCTV</span>
          </div>
          <p className="text-[11px] text-[#525e75]">
            Oficial en turno: <strong>{currentUser.name}</strong> · Registro inmutable en bitácora de tienda
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
          {/* If device is EN CUSTODIA (in locker), show ENTREGA button */}
          {selectedDevice && selectedDevice.status === 'en_custodia' && (
            <button
              type="button"
              onClick={handleConfirmLoan}
              disabled={!selectedColaborador}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                selectedColaborador
                  ? 'bg-[#007a33] hover:bg-[#005c26] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>REGISTRAR ENTREGA (PRÉSTAMO A PISO)</span>
            </button>
          )}

          {/* If device is EN USO, show DEVOLUCIÓN buttons */}
          {selectedDevice && selectedDevice.status === 'en_uso' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>RECIBIR DEVOLUCIÓN (CONFORME)</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenIncidentModal(selectedDevice)}
                className="px-3.5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reportar daño o falla técnica con enlace a Falabella AI-Monitoring"
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Devolver con Falla / Avería</span>
              </button>
            </div>
          )}

          {/* If device is CON FALLA */}
          {selectedDevice && selectedDevice.status === 'con_falla' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenIncidentModal(selectedDevice)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Ver / Actualizar Falla (Falabella AI-Monitoring)</span>
              </button>
            </div>
          )}

          {/* If nothing is selected yet */}
          {!selectedDevice && (
            <div className="text-[11px] text-[#757682] font-semibold italic">
              Escanee el fotocheck y el equipo para habilitar las opciones de entrega o devolución.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
