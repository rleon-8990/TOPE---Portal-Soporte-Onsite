import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Printer,
  ShieldCheck,
  Scan,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  History,
  Building2,
  RefreshCw,
  Zap,
  Battery,
  User,
  Barcode,
  Layers,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  DeviceCustodyItem,
  Store,
  StoreColaborador,
  AppUser,
  Equipment,
  DeviceBorrower,
  DeviceLoanHistoryItem
} from '../types';
import { FALABELLA_AI_MONITORING_URL, playScannerBeep } from '../data/deviceCustodyData';
import { DeviceScannerTerminal } from './DeviceScannerTerminal';
import { DeviceIncidentModal } from './DeviceIncidentModal';

interface DeviceCustodyViewProps {
  devices: DeviceCustodyItem[];
  stores: Store[];
  colaboradores: StoreColaborador[];
  currentUser: AppUser;
  equipments: Equipment[];
  onAddDevice: (device: DeviceCustodyItem) => void;
  onUpdateDevice: (device: DeviceCustodyItem) => void;
  onDeleteDevice?: (deviceId: string) => void;
  onRegisterLoan: (device: DeviceCustodyItem, borrower: StoreColaborador, notes?: string) => void;
  onRegisterReturn: (device: DeviceCustodyItem, condition: 'conforme' | 'con_falla', notes?: string) => void;
  onReportIncident: (device: DeviceCustodyItem, incident: {
    fallaType: string;
    description: string;
    falabellaTicketCode: string;
    createHelpdeskTicket: boolean;
  }) => void;
  onNavigateToHelpdesk?: () => void;
  onNavigateToInventory?: () => void;
}

export const DeviceCustodyView: React.FC<DeviceCustodyViewProps> = ({
  devices,
  stores,
  colaboradores,
  currentUser,
  equipments,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
  onRegisterLoan,
  onRegisterReturn,
  onReportIncident,
  onNavigateToHelpdesk,
  onNavigateToInventory,
}) => {
  // Active selected store for custody monitoring (default to store 103 Megaplaza or first store)
  const [selectedStoreCode, setSelectedStoreCode] = useState<string | number>(103);

  // Active view tab: 'tablero' | 'terminal' | 'bitacora' | 'fallas'
  const [activeTab, setActiveTab] = useState<'tablero' | 'terminal' | 'bitacora' | 'fallas'>('tablero');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<'todos' | 'PDA' | 'Impresora Portátil'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'en_uso' | 'en_custodia' | 'con_falla'>('todos');

  // Incident Modal State
  const [incidentDevice, setIncidentDevice] = useState<DeviceCustodyItem | null>(null);

  // New Equipment in Custody Modal
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);

  // Selected store details
  const currentStore = useMemo(() => {
    return stores.find(s => String(s.codTienda) === String(selectedStoreCode)) || stores[0];
  }, [stores, selectedStoreCode]);

  // Devices of the selected store
  const storeDevices = useMemo(() => {
    return devices.filter(d => String(d.storeCode) === String(selectedStoreCode));
  }, [devices, selectedStoreCode]);

  // Metrics calculations for the selected store
  const metrics = useMemo(() => {
    const total = storeDevices.length;
    const enUso = storeDevices.filter(d => d.status === 'en_uso');
    const enCustodia = storeDevices.filter(d => d.status === 'en_custodia');
    const conFalla = storeDevices.filter(d => d.status === 'con_falla' || d.status === 'en_reparacion');
    const overdue = storeDevices.filter(d => d.isOverdue || (d.hoursInUse && d.hoursInUse >= 8));

    const totalPdas = storeDevices.filter(d => d.deviceType === 'PDA').length;
    const totalPrinters = storeDevices.filter(d => d.deviceType === 'Impresora Portátil').length;

    const utilizationRate = total > 0 ? Math.round((enUso.length / total) * 100) : 0;

    return {
      total,
      enUsoCount: enUso.length,
      enCustodiaCount: enCustodia.length,
      conFallaCount: conFalla.length,
      overdueCount: overdue.length,
      totalPdas,
      totalPrinters,
      utilizationRate
    };
  }, [storeDevices]);

  // Filtered devices list for the display
  const filteredDevices = useMemo(() => {
    return storeDevices.filter(d => {
      const matchType = deviceTypeFilter === 'todos' || d.deviceType === deviceTypeFilter;
      const matchStatus = statusFilter === 'todos' || d.status === statusFilter;
      const matchQuery = !searchQuery.trim() ||
        d.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.currentBorrower && (
          d.currentBorrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.currentBorrower.fotocheck.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.currentBorrower.area.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      return matchType && matchStatus && matchQuery;
    });
  }, [storeDevices, deviceTypeFilter, statusFilter, searchQuery]);

  // Consolidated movement audit log for this store
  const auditLogs = useMemo(() => {
    const logs: Array<DeviceLoanHistoryItem & { equipmentCode: string; deviceType: string; serialNumber: string }> = [];
    storeDevices.forEach(dev => {
      if (dev.loanHistory && dev.loanHistory.length > 0) {
        dev.loanHistory.forEach(item => {
          logs.push({
            ...item,
            equipmentCode: dev.equipmentCode,
            deviceType: dev.deviceType,
            serialNumber: dev.serialNumber
          });
        });
      }
    });
    // Sort descending by timestamp
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [storeDevices]);

  // Export audit log to CSV
  const handleExportCsv = () => {
    if (auditLogs.length === 0) {
      alert('No hay registros de movimientos en la bitácora para exportar.');
      return;
    }

    const headers = ['Fecha', 'Hora', 'Acción', 'Equipo', 'Tipo', 'Serie', 'Fotocheck', 'Colaborador', 'Área', 'Oficial CCTV', 'Condición', 'Observaciones', 'Ticket Falabella'];
    const rows = auditLogs.map(l => [
      l.dateFormatted,
      l.timeFormatted,
      l.action === 'entrega' ? 'ENTREGA (SALIDA)' : l.action === 'devolucion' ? 'DEVOLUCIÓN (RETORNO)' : 'REPORTE FALLA',
      l.equipmentCode,
      l.deviceType,
      l.serialNumber,
      l.fotocheck,
      `"${l.borrowerName}"`,
      `"${l.area}"`,
      `"${l.cctvOfficer}"`,
      l.conditionOnReturn || 'conforme',
      `"${l.notes || l.incidentDetail || ''}"`,
      l.falabellaTicketCode || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bitacora_Custodia_CCTV_T${selectedStoreCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Store Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00236f] to-[#007a33] text-white flex items-center justify-center shadow-md shadow-[#00236f]/15 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#00236f] tracking-tight">
                Custodia & Monitoreo de PDAs e Impresoras
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#00236f] border border-[#dce9ff]">
                CCTV / Prevención
              </span>
            </div>
            <p className="text-xs text-[#757682] mt-0.5">
              Control de préstamos por fotocheck en tiempo real, monitoreo de equipos en uso vs. casillero e integración con Inventario y Falabella.
            </p>
          </div>
        </div>

        {/* Store Selector Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f8f9ff] px-3.5 py-2 rounded-xl border border-[#dce9ff]">
            <Building2 className="w-4 h-4 text-[#00236f]" />
            <div className="text-left">
              <span className="text-[10px] text-[#757682] block leading-none font-semibold">
                Sede / Tienda en Custodia:
              </span>
              <select
                value={selectedStoreCode}
                onChange={(e) => setSelectedStoreCode(e.target.value)}
                className="bg-transparent font-bold text-xs text-[#00236f] focus:outline-hidden cursor-pointer mt-0.5"
              >
                {stores.map(st => (
                  <option key={st.id} value={st.codTienda}>
                    T-{st.codTienda} · {st.name} ({st.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 bg-[#f0f4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar bitácora oficial de prevención en Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#007a33]" />
            <span className="hidden sm:inline">Exportar Bitácora</span>
          </button>
        </div>
      </div>

      {/* MANDATORY CORPORATE FALABELLA AI-MONITORING INTEGRATION BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#007a33]/15 via-[#007a33]/5 to-white border-2 border-[#007a33] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#007a33] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-[#004f21]">
                Portal Falabella AI-Monitoring · Soporte & Incidencias
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007a33] text-white">
                Enlace Oficial
              </span>
            </div>
            <p className="text-xs text-[#2c3e50] mt-1 max-w-3xl leading-relaxed">
              <strong>Para incidencias de hardware móvil</strong> (PDAs Zebra TC21/TC26 e Impresoras ZQ520/ZQ320), el usuario debe activar este link para registrar un ticket oficial. Por ese medio se reportará y atenderá con los proveedores externos (DMS Perú, Zebra, NCR) o soporte técnico local.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href={FALABELLA_AI_MONITORING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#007a33] hover:bg-[#005c26] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Ingresar a Falabella AI-Monitoring</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Metric Cards KPI Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Equipos */}
        <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] mb-1.5">
            <span className="text-xs font-semibold">Total en Tienda</span>
            <Layers className="w-4 h-4 text-[#00236f]" />
          </div>
          <div className="text-2xl font-bold text-[#00236f]">{metrics.total}</div>
          <div className="text-[11px] text-[#757682] mt-1 flex items-center gap-1.5">
            <span>{metrics.totalPdas} PDAs</span>
            <span>·</span>
            <span>{metrics.totalPrinters} Impresoras</span>
          </div>
        </div>

        {/* En Uso Activo */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-700 mb-1.5">
            <span className="text-xs font-bold">En Uso Activo (Piso)</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{metrics.enUsoCount}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-semibold">
            {metrics.utilizationRate}% de activos en operación
          </div>
        </div>

        {/* Disponibles / No Usados en Casillero */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-800 mb-1.5">
            <span className="text-xs font-bold">Disponibles (Casillero)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{metrics.enCustodiaCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            No usados · Listos en CCTV
          </div>
        </div>

        {/* Alerta Turno Excedido (>8h) */}
        <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
          metrics.overdueCount > 0
            ? 'bg-amber-50/80 border-amber-300 text-amber-950 animate-pulse'
            : 'bg-white border-[#e5eeff] text-[#757682]'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold">Turno Excedido (&gt;8h)</span>
            <Clock className={`w-4 h-4 ${metrics.overdueCount > 0 ? 'text-amber-600' : 'text-[#757682]'}`} />
          </div>
          <div className={`text-2xl font-bold ${metrics.overdueCount > 0 ? 'text-amber-900' : 'text-[#0b1c30]'}`}>
            {metrics.overdueCount}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {metrics.overdueCount > 0 ? '⚠️ Alerta: Requiere devolución' : 'Turnos normales'}
          </div>
        </div>

        {/* En Falla / Servicio Técnico */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          metrics.conFallaCount > 0
            ? 'bg-red-50/80 border-red-300 text-red-950'
            : 'bg-white border-[#e5eeff] text-[#757682]'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold">Con Falla / Retenidos</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.conFallaCount > 0 ? 'text-red-600' : 'text-[#757682]'}`} />
          </div>
          <div className={`text-2xl font-bold ${metrics.conFallaCount > 0 ? 'text-red-700' : 'text-[#0b1c30]'}`}>
            {metrics.conFallaCount}
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {metrics.conFallaCount > 0 ? 'Ticket Falabella activo' : 'Cero averías'}
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeff] pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tablero')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'tablero'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#525e75] hover:bg-[#eff4ff]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tablero en Vivo (En Uso vs. Casillero)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#525e75] hover:bg-[#eff4ff]'
            }`}
          >
            <Scan className="w-4 h-4 text-amber-300" />
            <span>Terminal de Escaneo Rápido</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bitacora')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'bitacora'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#525e75] hover:bg-[#eff4ff]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Bitácora de Movimientos ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fallas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'fallas'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Equipos en Falla ({metrics.conFallaCount})</span>
          </button>
        </div>

        {/* Auxiliary links to Inventory & Helpdesk */}
        <div className="flex items-center gap-2 text-xs">
          {onNavigateToInventory && (
            <button
              type="button"
              onClick={onNavigateToInventory}
              className="text-[#00236f] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ver Inventario General</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {onNavigateToHelpdesk && (
            <button
              type="button"
              onClick={onNavigateToHelpdesk}
              className="text-[#00236f] hover:underline font-semibold flex items-center gap-1 ml-2"
            >
              <span>Ver Mesa Helpdesk</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: TABLERO EN VIVO (EQUIPOS EN USO VS NO USADOS) */}
      {activeTab === 'tablero' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por colaborador, serie, código o área..."
                className="w-full pl-9 pr-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs focus:outline-hidden focus:border-[#00236f]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Type Filter */}
              <div className="flex items-center bg-[#f8f9ff] p-1 rounded-xl border border-[#dce9ff] text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceTypeFilter('todos')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    deviceTypeFilter === 'todos' ? 'bg-white text-[#00236f] shadow-xs font-bold' : 'text-[#757682]'
                  }`}
                >
                  Todos ({storeDevices.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceTypeFilter('PDA')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    deviceTypeFilter === 'PDA' ? 'bg-white text-[#00236f] shadow-xs font-bold' : 'text-[#757682]'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>PDAs ({metrics.totalPdas})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceTypeFilter('Impresora Portátil')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    deviceTypeFilter === 'Impresora Portátil' ? 'bg-white text-[#00236f] shadow-xs font-bold' : 'text-[#757682]'
                  }`}
                >
                  <Printer className="w-3 h-3" />
                  <span>Impresoras ({metrics.totalPrinters})</span>
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#00236f] focus:outline-hidden cursor-pointer"
              >
                <option value="todos">Todos los Estados</option>
                <option value="en_uso">Solo En Uso ({metrics.enUsoCount})</option>
                <option value="en_custodia">Solo En Casillero ({metrics.enCustodiaCount})</option>
                <option value="con_falla">Con Falla ({metrics.conFallaCount})</option>
              </select>
            </div>
          </div>

          {/* Cards Grid: Grouped in two clear sections (En Uso vs Disponibles) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: EQUIPOS EN USO (EN PISO DE VENTA) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#dce9ff]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                  <h3 className="font-bold text-sm text-[#00236f]">
                    Equipos en Uso Activo ({filteredDevices.filter(d => d.status === 'en_uso').length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#757682]">En piso de venta con fotocheck</span>
              </div>

              <div className="space-y-3">
                {filteredDevices.filter(d => d.status === 'en_uso').map(device => {
                  const isOverdue = device.isOverdue || (device.hoursInUse && device.hoursInUse >= 8);
                  return (
                    <div
                      key={device.id}
                      className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${
                        isOverdue ? 'border-amber-400 ring-2 ring-amber-200' : 'border-[#dce9ff]'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            device.deviceType === 'PDA' ? 'bg-[#00236f]' : 'bg-[#fd761a]'
                          }`}>
                            {device.deviceType === 'PDA' ? <Smartphone className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                                {device.equipmentCode}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                                {device.deviceType}
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                                  &gt;8h Turno Excedido
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#444651]">
                              {device.brand} {device.model}
                            </div>
                            <div className="text-[10px] text-[#757682] font-mono">
                              Serie: {device.serialNumber} · Barcode: {device.barcode}
                            </div>
                          </div>
                        </div>

                        {device.batteryLevel !== undefined && (
                          <div className="text-right">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              device.batteryLevel > 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              🔋 {device.batteryLevel}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Active Borrower Info */}
                      {device.currentBorrower && (
                        <div className="mt-3.5 pt-3 border-t border-[#f0f4ff] bg-[#f8f9ff] p-3 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={device.currentBorrower.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={device.currentBorrower.name}
                              className="w-9 h-9 rounded-lg object-cover border border-[#c4dcff] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-[#0b1c30] truncate">
                                {device.currentBorrower.name}
                              </div>
                              <div className="text-[10px] text-[#00236f] font-semibold">
                                {device.currentBorrower.area}
                              </div>
                              <div className="text-[10px] text-[#757682] font-mono">
                                Fotocheck: {device.currentBorrower.fotocheck}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-[#757682] block">Retiro:</span>
                            <span className="font-bold text-xs text-[#00236f] block">
                              {device.currentBorrower.borrowedTimeFormatted}
                            </span>
                            {device.hoursInUse && (
                              <span className="text-[10px] font-semibold text-blue-700">
                                ({device.hoursInUse.toFixed(1)}h en uso)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#757682]">
                          Locker: <strong>{device.locationInStore || 'CCTV'}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRegisterReturn(device, 'conforme', 'Devuelto conforme')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Recibir Devolución</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIncidentDevice(device)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Reportar con daño o avería (Portal Falabella)"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Falla</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredDevices.filter(d => d.status === 'en_uso').length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#dce9ff] text-[#757682]">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-[#00236f] block">
                      No hay equipos en uso con los filtros seleccionados
                    </span>
                    <span className="text-[11px] text-[#757682]">
                      Todos los equipos se encuentran custodiados en casillero CCTV.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: EQUIPOS EN CASILLERO CCTV (NO USADOS / DISPONIBLES) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#dce9ff]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-sm text-[#00236f]">
                    Equipos en Casillero CCTV ({filteredDevices.filter(d => d.status === 'en_custodia').length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#757682]">No usados · Listos para asignación</span>
              </div>

              <div className="space-y-3">
                {filteredDevices.filter(d => d.status === 'en_custodia').map(device => (
                  <div
                    key={device.id}
                    className="bg-white rounded-2xl border border-[#dce9ff] p-4 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
                          device.deviceType === 'PDA' ? 'bg-[#00236f]' : 'bg-[#fd761a]'
                        }`}>
                          {device.deviceType === 'PDA' ? <Smartphone className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[#0b1c30]">
                              {device.equipmentCode}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                              {device.deviceType}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Disponible
                            </span>
                          </div>
                          <div className="text-[11px] text-[#444651]">
                            {device.brand} {device.model}
                          </div>
                          <div className="text-[10px] text-[#757682] font-mono">
                            Serie: {device.serialNumber} · Barcode: {device.barcode}
                          </div>
                        </div>
                      </div>

                      {device.batteryLevel !== undefined && (
                        <div className="text-right">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            🔋 {device.batteryLevel}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#f0f4ff] flex items-center justify-between gap-2">
                      <div className="text-[11px] text-[#525e75]">
                        Ubicación: <strong>{device.locationInStore || 'Locker CCTV'}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('terminal');
                          }}
                          className="px-3 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <Scan className="w-3.5 h-3.5 text-amber-300" />
                          <span>Pistolear / Asignar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIncidentDevice(device)}
                          className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reportar daño antes de entregar"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredDevices.filter(d => d.status === 'en_custodia').length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#dce9ff] text-[#757682]">
                    <Layers className="w-8 h-8 text-[#a3b8d7] mx-auto mb-1.5" />
                    <span className="text-xs font-bold text-[#00236f] block">
                      No hay equipos disponibles en casillero actualmente
                    </span>
                    <span className="text-[11px] text-[#757682]">
                      Todos los equipos asignados a esta tienda están en piso de venta o en servicio técnico.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TERMINAL DE ESCANEO RÁPIDO (CCTV) */}
      {activeTab === 'terminal' && (
        <div className="animate-fadeIn">
          <DeviceScannerTerminal
            currentStoreCode={selectedStoreCode}
            currentStoreName={currentStore.name}
            devices={devices}
            colaboradores={colaboradores}
            currentUser={currentUser}
            onRegisterLoan={onRegisterLoan}
            onRegisterReturn={onRegisterReturn}
            onOpenIncidentModal={(dev) => setIncidentDevice(dev)}
          />
        </div>
      )}

      {/* TAB 3: BITÁCORA DE MOVIMIENTOS (AUDITORÍA CCTV) */}
      {activeTab === 'bitacora' && (
        <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm p-4 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5eeff]">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#00236f]">
                Bitácora de Salidas y Retornos de Custodia
              </h3>
              <p className="text-xs text-[#757682]">
                Historial cronológico inmutable de asignaciones y devoluciones en T-{selectedStoreCode} {currentStore.name}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-[#f0f4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#007a33]" />
              <span>Exportar Reporte Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Fecha & Hora</th>
                  <th className="py-2.5 px-3">Movimiento</th>
                  <th className="py-2.5 px-3">Equipo & Tipo</th>
                  <th className="py-2.5 px-3">Fotocheck</th>
                  <th className="py-2.5 px-3">Colaborador / Área</th>
                  <th className="py-2.5 px-3">Oficial CCTV</th>
                  <th className="py-2.5 px-3 text-center">Condición</th>
                  <th className="py-2.5 px-3">Detalle / Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ff]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-xs text-[#0b1c30]">{log.dateFormatted}</div>
                      <div className="text-[11px] text-[#757682]">{log.timeFormatted}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.action === 'entrega' ? 'bg-blue-100 text-blue-900' :
                        log.action === 'devolucion' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-red-100 text-red-900'
                      }`}>
                        {log.action === 'entrega' ? 'SALIDA (PRÉSTAMO)' :
                         log.action === 'devolucion' ? 'RETORNO (CUSTODIA)' :
                         'REPORTE FALLA'}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-xs text-[#00236f]">{log.equipmentCode}</div>
                      <div className="text-[10px] text-[#757682] font-mono">Serie: {log.serialNumber}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-xs text-[#00236f]">
                      {log.fotocheck}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-xs text-[#0b1c30]">{log.borrowerName}</div>
                      <div className="text-[11px] text-[#525e75]">{log.area}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-xs text-[#444651]">
                      {log.cctvOfficer}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.conditionOnReturn === 'danado' || log.conditionOnReturn === 'con_falla'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {log.conditionOnReturn === 'danado' ? 'DAÑADO' :
                         log.conditionOnReturn === 'con_falla' ? 'CON FALLA' : 'CONFORME'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-[#525e75] max-w-xs truncate">
                      {log.notes || log.incidentDetail || '-'}
                      {log.falabellaTicketCode && (
                        <span className="block text-[10px] font-bold text-red-600 font-mono">
                          Ticket: {log.falabellaTicketCode}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#757682]">
                      No hay movimientos registrados todavía para esta tienda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EQUIPOS EN FALLA & TICKETS FALABELLA */}
      {activeTab === 'fallas' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Banner */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-red-950">
                  Control de Equipos Averiados & Atención con Proveedores
                </h3>
                <p className="text-xs text-red-800">
                  Equipos retenidos en T-{selectedStoreCode} pendientes de recojo o reparación técnica por DMS / Zebra.
                </p>
              </div>
            </div>

            <a
              href={FALABELLA_AI_MONITORING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#007a33] hover:bg-[#005c26] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <span>Abrir Falabella AI-Monitoring</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Broken Devices List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeDevices.filter(d => d.status === 'con_falla' || d.status === 'en_reparacion').map(device => (
              <div key={device.id} className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      {device.deviceType === 'PDA' ? <Smartphone className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
                        <span>{device.equipmentCode}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">
                          {device.deviceType}
                        </span>
                      </div>
                      <div className="text-xs text-[#444651]">
                        {device.brand} {device.model} · Serie: <strong className="font-mono">{device.serialNumber}</strong>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white">
                    Retenido en CCTV
                  </span>
                </div>

                {device.lastIncident && (
                  <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200 text-xs space-y-1.5">
                    <div className="font-bold text-red-950">
                      Falla: {device.lastIncident.fallaType}
                    </div>
                    <div className="text-red-900 text-[11px] leading-relaxed">
                      {device.lastIncident.description}
                    </div>
                    <div className="text-[10px] text-red-700 pt-1 flex flex-wrap items-center gap-3">
                      <span>Reportado: <strong>{device.lastIncident.reportedAt}</strong></span>
                      {device.lastIncident.falabellaTicketCode && (
                        <span>Ticket Falabella: <strong className="font-mono">{device.lastIncident.falabellaTicketCode}</strong></span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f0f4ff]">
                  <a
                    href={FALABELLA_AI_MONITORING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#007a33] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Gestionar en Portal Falabella</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      // Mark as repaired / back in custody
                      onUpdateDevice({
                        ...device,
                        status: 'en_custodia',
                        lastIncident: undefined,
                        notes: 'Equipo reparado por proveedor y retornado a casillero CCTV.',
                        updatedAt: new Date().toISOString()
                      });
                      playScannerBeep('success');
                      alert(`El equipo ${device.equipmentCode} ha sido reintegrado a casillero CCTV como DISPONIBLE.`);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Dar de Alta / Reincorporar
                  </button>
                </div>
              </div>
            ))}

            {storeDevices.filter(d => d.status === 'con_falla' || d.status === 'en_reparacion').length === 0 && (
              <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-[#dce9ff] text-[#757682]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#00236f]">¡Excelente! Cero Equipos Averiados</h4>
                <p className="text-xs text-[#757682] mt-1">
                  Todas las PDAs e impresoras móviles de T-{selectedStoreCode} se encuentran 100% operativas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {incidentDevice && (
        <DeviceIncidentModal
          device={incidentDevice}
          currentUser={currentUser}
          onClose={() => setIncidentDevice(null)}
          onSubmitIncident={(incident) => {
            onReportIncident(incidentDevice, incident);
            setIncidentDevice(null);
          }}
        />
      )}
    </div>
  );
};
