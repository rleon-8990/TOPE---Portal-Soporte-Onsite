import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Navigation,
  Check,
  X,
  Phone,
  MessageCircle,
  Calendar,
  Layers,
  ArrowUpDown,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Fingerprint,
  ScanFace,
  Smartphone,
  Radio,
  Zap,
  Sparkles
} from 'lucide-react';
import {
  AttendanceLog,
  ActivePersonnelPresence,
  AttendanceEventType,
  AttendanceMotive,
  PersonnelStatus,
  Store,
  AppUser,
  GeoVictoriaConfig,
  GeoVictoriaPunchRecord
} from '../types';
import { GeoVictoriaIntegrationPanel } from './GeoVictoriaIntegrationPanel';
import { GeofencingAutomationPanel } from './GeofencingAutomationPanel';
import {
  getGeoVictoriaConfig,
  saveGeoVictoriaConfig,
  getGeoVictoriaPunches,
  saveGeoVictoriaPunches,
  convertPunchToAttendanceLog
} from '../services/geoVictoriaService';

interface PersonnelMonitoringViewProps {
  logs: AttendanceLog[];
  presences: ActivePersonnelPresence[];
  stores: Store[];
  users: AppUser[];
  currentUser: AppUser;
  onAddLog: (newLog: Partial<AttendanceLog>, updatePresence?: boolean) => void;
  onUpdateLog?: (updatedLog: AttendanceLog) => void;
  onDeleteLog?: (id: string) => void;
  onQuickCheckIn?: (userId: string, storeId: string, motive: AttendanceMotive, detail?: string) => void;
  onQuickCheckOut?: (userId: string, notes?: string) => void;
  onQuickTransfer?: (userId: string, targetStoreId: string, motiveDetail?: string) => void;
}

export const PersonnelMonitoringView: React.FC<PersonnelMonitoringViewProps> = ({
  logs,
  presences,
  stores,
  users,
  currentUser,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onQuickCheckIn,
  onQuickCheckOut,
  onQuickTransfer,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'radar' | 'personal' | 'geovictoria' | 'geofence' | 'log'>('radar');

  // Filters for Radar
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('todas');
  const [onlyStoresWithPersonnel, setOnlyStoresWithPersonnel] = useState<boolean>(true);

  // Filters for Log
  const [searchLogQuery, setSearchLogQuery] = useState<string>('');
  const [selectedLogStore, setSelectedLogStore] = useState<string>('todas');
  const [selectedLogUser, setSelectedLogUser] = useState<string>('todos');
  const [selectedLogEvent, setSelectedLogEvent] = useState<string>('todos');
  const [selectedLogDate, setSelectedLogDate] = useState<string>('todos');
  const [selectedLogSource, setSelectedLogSource] = useState<string>('todos');

  // GeoVictoria & Geofencing State
  const [geoVictoriaConfig, setGeoVictoriaConfig] = useState<GeoVictoriaConfig>(() => getGeoVictoriaConfig());
  const [geoVictoriaPunches, setGeoVictoriaPunches] = useState<GeoVictoriaPunchRecord[]>(() => getGeoVictoriaPunches());

  // Sorting for Log
  const [sortField, setSortField] = useState<keyof AttendanceLog>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // Newest first

  // Pagination for Log
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modals
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [eventModalType, setEventModalType] = useState<AttendanceEventType>('ingreso');
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<ActivePersonnelPresence | null>(null);

  // Form State for Event Registration Modal
  const [formUserId, setFormUserId] = useState<string>(currentUser?.id || users[0]?.id || '');
  const [formStoreId, setFormStoreId] = useState<string>(stores[0]?.id || '');
  const [formTargetStoreId, setFormTargetStoreId] = useState<string>(stores[1]?.id || '');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [formMotive, setFormMotive] = useState<AttendanceMotive>('mantenimiento_preventivo');
  const [formMotiveDetail, setFormMotiveDetail] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formTicketOrWo, setFormTicketOrWo] = useState<string>('');
  const [formVerifiedLocation, setFormVerifiedLocation] = useState<boolean>(true);

  // Feedback Notification banner
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // GeoVictoria Integration Handlers
  const handleUpdateGeoVictoriaConfig = (newConfig: GeoVictoriaConfig) => {
    setGeoVictoriaConfig(newConfig);
    saveGeoVictoriaConfig(newConfig);
    showNotification('Configuración de conexión GeoVictoria guardada exitosamente.');
  };

  const handleReceiveGeoVictoriaPunch = (punch: GeoVictoriaPunchRecord) => {
    // Find matching technician
    const matchedUser = users.find(
      u => (u.dni && u.dni === punch.rutDni) || u.id === punch.colaboradorId || u.name.toLowerCase() === punch.colaboradorNombre.toLowerCase()
    );
    // Find matching store
    const matchedStore = stores.find(
      s => String(s.codTienda) === String(punch.codTienda) || s.id === `store-${punch.codTienda}` || s.name.toLowerCase().includes(punch.nombreTienda.toLowerCase())
    );

    const logItem = convertPunchToAttendanceLog(punch, matchedUser, matchedStore);
    onAddLog(logItem, true);

    setGeoVictoriaPunches(prev => {
      const updated = [punch, ...prev];
      saveGeoVictoriaPunches(updated);
      return updated;
    });

    showNotification(
      `Sincronización GeoVictoria: Marcación de ${punch.tipo.toUpperCase()} procesada para ${punch.colaboradorNombre} en ${punch.nombreTienda}`
    );
  };

  const handleBulkSyncGeoVictoria = (newPunches: GeoVictoriaPunchRecord[]) => {
    newPunches.forEach(punch => {
      const matchedUser = users.find(
        u => (u.dni && u.dni === punch.rutDni) || u.id === punch.colaboradorId || u.name.toLowerCase() === punch.colaboradorNombre.toLowerCase()
      );
      const matchedStore = stores.find(
        s => String(s.codTienda) === String(punch.codTienda) || s.id === `store-${punch.codTienda}`
      );
      const logItem = convertPunchToAttendanceLog(punch, matchedUser, matchedStore);
      onAddLog(logItem, false);
    });

    setGeoVictoriaPunches(prev => {
      const updated = [...newPunches, ...prev];
      saveGeoVictoriaPunches(updated);
      return updated;
    });

    showNotification(`Se sincronizaron ${newPunches.length} marcaciones biométricas de GeoVictoria al Radar.`);
  };

  // Geofence Automatic Check-In Handler
  const handleGeofenceAutoCheckIn = (
    store: Store,
    distanceMeters: number,
    coords: { lat: number; lng: number }
  ) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateFormatted = now.toISOString().split('T')[0];

    const autoLog: AttendanceLog = {
      id: `att-gps-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userCargo: currentUser.cargo || currentUser.role,
      userPhone: currentUser.phone,
      userAvatar: currentUser.avatarUrl,
      eventType: 'ingreso',
      storeId: store.id,
      storeCode: store.codTienda,
      storeName: store.name,
      storeRegion: store.region,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      motive: 'soporte_onsite',
      motiveDetail: `Check-in automático por sensor de geocerca GPS móvil (Distancia: ${distanceMeters}m)`,
      notes: `Detección satelital de proximidad a tienda T-${store.codTienda} ${store.name}`,
      verifiedLocation: true,
      registeredBy: 'Sensor GPS Móvil',
      source: 'gps_geocerca',
      sourceDetail: `Geocerca Satelital Tottus (Precisión ±${distanceMeters}m)`,
      coordinates: { ...coords, accuracy: distanceMeters }
    };

    onAddLog(autoLog, true);
    showNotification(`¡Auto Check-In Onsite! Registrado automáticamente en T-${store.codTienda} ${store.name}`);
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const activeInStore = presences.filter(p => p.status === 'en_tienda');
    const inTransfer = presences.filter(p => p.status === 'en_traslado');
    const completedShift = presences.filter(p => p.status === 'jornada_finalizada');

    // Unique stores with active personnel
    const uniqueStoreIds = new Set(
      activeInStore.map(p => p.currentStoreId).filter(Boolean)
    );

    const todayDate = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(l => l.dateFormatted === todayDate || l.timestamp.startsWith(todayDate));

    return {
      activeInStoreCount: activeInStore.length,
      inTransferCount: inTransfer.length,
      completedShiftCount: completedShift.length,
      storesCoveredCount: uniqueStoreIds.size,
      todayLogsCount: todayLogs.length || logs.length
    };
  }, [presences, logs]);

  // Stores mapped with their active personnel
  const storePresenceMap = useMemo(() => {
    const map = new Map<string, ActivePersonnelPresence[]>();
    presences.forEach(p => {
      if (p.status === 'en_tienda' && p.currentStoreId) {
        const list = map.get(p.currentStoreId) || [];
        list.push(p);
        map.set(p.currentStoreId, list);
      }
    });
    return map;
  }, [presences]);

  // Filtered Stores for Radar View
  const filteredRadarStores = useMemo(() => {
    return stores.filter(st => {
      const hasPersonnel = (storePresenceMap.get(st.id) || []).length > 0;
      if (onlyStoresWithPersonnel && !hasPersonnel) return false;
      if (selectedRegionFilter !== 'todas' && st.region !== selectedRegionFilter) return false;
      return true;
    }).sort((a, b) => {
      const countA = (storePresenceMap.get(a.id) || []).length;
      const countB = (storePresenceMap.get(b.id) || []).length;
      if (countA !== countB) return countB - countA; // Stores with personnel first
      return String(a.codTienda).localeCompare(String(b.codTienda), 'es', { numeric: true });
    });
  }, [stores, storePresenceMap, onlyStoresWithPersonnel, selectedRegionFilter]);

  // Personnel in Transfer
  const personnelInTransfer = useMemo(() => {
    return presences.filter(p => p.status === 'en_traslado');
  }, [presences]);

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      // Query filter
      if (searchLogQuery.trim() !== '') {
        const q = searchLogQuery.toLowerCase();
        const matchesName = item.userName.toLowerCase().includes(q);
        const matchesStore = item.storeName.toLowerCase().includes(q) || String(item.storeCode).toLowerCase().includes(q);
        const matchesTarget = (item.targetStoreName || '').toLowerCase().includes(q);
        const matchesDetail = (item.motiveDetail || '').toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesStore && !matchesTarget && !matchesDetail && !matchesNotes) {
          return false;
        }
      }

      // Store filter
      if (selectedLogStore !== 'todas') {
        if (item.storeId !== selectedLogStore && item.targetStoreId !== selectedLogStore && String(item.storeCode) !== selectedLogStore) {
          return false;
        }
      }

      // User filter
      if (selectedLogUser !== 'todos') {
        if (item.userId !== selectedLogUser && item.userName !== selectedLogUser) {
          return false;
        }
      }

      // Event Type filter
      if (selectedLogEvent !== 'todos') {
        if (item.eventType !== selectedLogEvent) return false;
      }

      // Date filter
      if (selectedLogDate === 'hoy') {
        const today = new Date().toISOString().split('T')[0];
        if (item.dateFormatted !== today && !item.timestamp.startsWith(today)) return false;
      }

      // Source filter
      if (selectedLogSource !== 'todos') {
        if (selectedLogSource === 'geovictoria') {
          if (!item.source?.startsWith('geovictoria')) return false;
        } else if (selectedLogSource === 'geocerca') {
          if (item.source !== 'gps_geocerca') return false;
        } else if (selectedLogSource === 'manual') {
          if (item.source && item.source !== 'manual') return false;
        }
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (sortField === 'timestamp') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
        return sortAsc ? valA - valB : valB - valA;
      }

      const cmp = String(valA).localeCompare(String(valB), 'es', { numeric: true, sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
  }, [logs, searchLogQuery, selectedLogStore, selectedLogUser, selectedLogEvent, selectedLogDate, selectedLogSource, sortField, sortAsc]);

  // Pagination for Logs
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof AttendanceLog) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open Modal Helpers
  const handleOpenRegisterModal = (type: AttendanceEventType, preselectedUser?: string, preselectedStore?: string) => {
    setEventModalType(type);
    if (preselectedUser) setFormUserId(preselectedUser);
    if (preselectedStore) setFormStoreId(preselectedStore);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    setFormNotes('');
    setFormMotiveDetail('');
    setFormTicketOrWo('');
    setShowEventModal(true);
  };

  // Submit Register Event Form
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = users.find(u => u.id === formUserId);
    const selectedStore = stores.find(s => s.id === formStoreId);
    const targetStore = stores.find(s => s.id === formTargetStoreId);

    if (!selectedUser || !selectedStore) {
      alert('Por favor selecciona un colaborador y una tienda válida.');
      return;
    }

    const newLogId = `att-log-${Date.now()}`;
    const isoTimestamp = `${formDate}T${new Date().toTimeString().split(' ')[0]}`;

    const newLog: AttendanceLog = {
      id: newLogId,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userRole: selectedUser.role,
      userCargo: selectedUser.cargo || selectedUser.role,
      userPhone: selectedUser.phone,
      userAvatar: selectedUser.avatarUrl,
      eventType: eventModalType,
      storeId: selectedStore.id,
      storeCode: selectedStore.codTienda,
      storeName: selectedStore.name,
      storeRegion: selectedStore.region,
      timestamp: isoTimestamp,
      timeFormatted: formTime,
      dateFormatted: formDate,
      motive: formMotive,
      motiveDetail: formMotiveDetail || (
        eventModalType === 'ingreso' ? 'Ingreso a tienda para soporte' :
        eventModalType === 'salida' ? 'Salida registrada de tienda' :
        `Traslado hacia ${targetStore?.name || 'otra tienda'}`
      ),
      ticketId: formTicketOrWo,
      notes: formNotes,
      verifiedLocation: formVerifiedLocation,
      registeredBy: currentUser?.name || 'Sistema'
    };

    if (eventModalType === 'traslado' && targetStore) {
      newLog.targetStoreId = targetStore.id;
      newLog.targetStoreCode = targetStore.codTienda;
      newLog.targetStoreName = targetStore.name;
      newLog.targetStoreRegion = targetStore.region;
    }

    onAddLog(newLog, true);
    setShowEventModal(false);
    showNotification(
      eventModalType === 'ingreso'
        ? `Ingreso registrado: ${selectedUser.name} en T-${selectedStore.codTienda} ${selectedStore.name}`
        : eventModalType === 'salida'
        ? `Salida registrada: ${selectedUser.name} de T-${selectedStore.codTienda} ${selectedStore.name}`
        : `Traslado registrado: ${selectedUser.name} hacia T-${targetStore?.codTienda} ${targetStore?.name}`
    );
  };

  // Quick Action Handlers
  const handleQuickConfirmArrival = (presence: ActivePersonnelPresence) => {
    if (!presence.toStoreId) return;
    const destStore = stores.find(s => s.id === presence.toStoreId);
    if (!destStore) return;

    if (confirm(`¿Confirmar la llegada de ${presence.userName} a ${destStore.name} (T-${destStore.codTienda})?`)) {
      if (onQuickCheckIn) {
        onQuickCheckIn(presence.userId, destStore.id, 'soporte_onsite', 'Llegada tras traslado');
      } else {
        const iso = new Date().toISOString();
        const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateNow = iso.split('T')[0];
        onAddLog({
          id: `att-log-${Date.now()}`,
          userId: presence.userId,
          userName: presence.userName,
          userRole: presence.userRole,
          userCargo: presence.userCargo,
          userPhone: presence.userPhone,
          userAvatar: presence.userAvatar,
          eventType: 'ingreso',
          storeId: destStore.id,
          storeCode: destStore.codTienda,
          storeName: destStore.name,
          storeRegion: destStore.region,
          timestamp: iso,
          timeFormatted: timeNow,
          dateFormatted: dateNow,
          motive: 'soporte_onsite',
          motiveDetail: `Llegada confirmada tras traslado desde ${presence.fromStoreName || 'tienda anterior'}`,
          verifiedLocation: true,
          registeredBy: currentUser.name
        }, true);
      }
      showNotification(`Llegada confirmada: ${presence.userName} ahora labora en ${destStore.name}`);
    }
  };

  const handleQuickCheckOutFromCard = (presence: ActivePersonnelPresence) => {
    if (!presence.currentStoreId) return;
    const store = stores.find(s => s.id === presence.currentStoreId);
    if (confirm(`¿Registrar la salida de ${presence.userName} de ${store?.name || 'la tienda'}?`)) {
      if (onQuickCheckOut) {
        onQuickCheckOut(presence.userId, 'Salida registrada desde tarjeta de presencia');
      } else {
        const iso = new Date().toISOString();
        const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateNow = iso.split('T')[0];
        onAddLog({
          id: `att-log-${Date.now()}`,
          userId: presence.userId,
          userName: presence.userName,
          userRole: presence.userRole,
          userCargo: presence.userCargo,
          userPhone: presence.userPhone,
          userAvatar: presence.userAvatar,
          eventType: 'salida',
          storeId: presence.currentStoreId,
          storeCode: presence.currentStoreCode || '',
          storeName: presence.currentStoreName || '',
          storeRegion: presence.currentStoreRegion || 'Lima y Callao',
          timestamp: iso,
          timeFormatted: timeNow,
          dateFormatted: dateNow,
          motive: 'soporte_onsite',
          motiveDetail: 'Salida de tienda y fin de actividades presenciales',
          verifiedLocation: true,
          registeredBy: currentUser.name
        }, true);
      }
      showNotification(`Salida registrada para ${presence.userName}`);
    }
  };

  // Delete Log
  const handleDeleteLogItem = (logItem: AttendanceLog) => {
    if (confirm(`¿Estás seguro de eliminar el registro de ${logItem.eventType.toUpperCase()} de ${logItem.userName}?`)) {
      if (onDeleteLog) {
        onDeleteLog(logItem.id);
        showNotification('Registro eliminado del historial.');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID_Registro',
      'Fecha',
      'Hora',
      'Tipo_Evento',
      'Colaborador',
      'Cargo',
      'Celular',
      'Cod_Tienda',
      'Tienda_Origen',
      'Region',
      'Cod_Tienda_Destino',
      'Tienda_Destino',
      'Motivo',
      'Detalle_Actividad',
      'Ticket_OT',
      'Permanencia',
      'Ubicacion_Verificada',
      'Registrado_Por'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.dateFormatted}"`,
      `"${l.timeFormatted}"`,
      `"${l.eventType.toUpperCase()}"`,
      `"${l.userName.replace(/"/g, '""')}"`,
      `"${(l.userCargo || l.userRole || '').replace(/"/g, '""')}"`,
      `"${l.userPhone || ''}"`,
      `"${l.storeCode}"`,
      `"${l.storeName.replace(/"/g, '""')}"`,
      `"${l.storeRegion}"`,
      `"${l.targetStoreCode || ''}"`,
      `"${(l.targetStoreName || '').replace(/"/g, '""')}"`,
      `"${l.motive}"`,
      `"${(l.motiveDetail || '').replace(/"/g, '""')}"`,
      `"${l.ticketId || l.workOrderId || ''}"`,
      `"${l.durationFormatted || ''}"`,
      `"${l.verifiedLocation ? 'SI' : 'NO'}"`,
      `"${l.registeredBy || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log_Asistencia_Movilidad_Personal_Tottus_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Archivo CSV exportado exitosamente.');
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Toast Notification */}
      {feedbackNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00236f] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#eff4ff] text-[#00236f]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#0b1c30] tracking-tight">
                Control de Asistencia & Monitoreo Onsite
              </h1>
              <p className="text-xs text-[#757682]">
                Seguimiento en tiempo real de técnicos en tiendas, control de entradas, salidas y traslados inter-tiendas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportCSV}
            className="bg-white text-[#00236f] px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#dce9ff] hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
            title="Exportar log histórico de movimientos a formato CSV"
          >
            <Download className="w-4 h-4 text-[#00236f]" />
            <span>Exportar Log CSV</span>
          </button>

          <button
            onClick={() => handleOpenRegisterModal('ingreso')}
            className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento / Asistencia</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Laborando en Tiendas</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{metrics.activeInStoreCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Técnicos activos onsite ahora</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs bg-gradient-to-br from-white to-amber-50/40">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>En Traslado Inter-Tiendas</span>
            <Navigation className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{metrics.inTransferCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">En trayecto entre sucursales</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs bg-gradient-to-br from-white to-indigo-50/40">
          <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center justify-between">
            <span>Tiendas con Cobertura</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 mt-1">
            {metrics.storesCoveredCount} <span className="text-xs text-[#757682] font-normal">/ {stores.length}</span>
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">Sucursales con personal presente</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="text-[11px] font-bold text-[#757682] uppercase tracking-wider flex items-center justify-between">
            <span>Eventos de Movilidad Hoy</span>
            <History className="w-4 h-4 text-[#00236f]" />
          </div>
          <div className="text-2xl font-black text-[#0b1c30] mt-1">{metrics.todayLogsCount}</div>
          <div className="text-[11px] text-[#757682] mt-0.5">Entradas, salidas y traslados</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#dce9ff] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'radar'
              ? 'bg-[#00236f] text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-[#eff4ff] border border-[#dce9ff]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>¿En qué Tiendas se encuentran Laborando?</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
            {metrics.activeInStoreCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-[#00236f] text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-[#eff4ff] border border-[#dce9ff]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Estado del Personal Onsite</span>
          <span className="bg-[#eff4ff] text-[#00236f] px-1.5 py-0.2 rounded-full text-[10px]">
            {presences.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('geovictoria')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'geovictoria'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
          <span>Conexión GeoVictoria (Biometría)</span>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
            {geoVictoriaPunches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('geofence')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'geofence'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-300'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Servicio Móvil & Geocercas GPS</span>
          <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
            Auto Check-in
          </span>
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'log'
              ? 'bg-[#00236f] text-white shadow-xs'
              : 'bg-white text-[#444651] hover:bg-[#eff4ff] border border-[#dce9ff]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Log Histórico de Movimientos & Asistencia</span>
          <span className="bg-[#eff4ff] text-[#00236f] px-1.5 py-0.2 rounded-full text-[10px]">
            {logs.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: RADAR DE PRESENCIA EN TIENDAS                      */}
      {/* ========================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          {/* Active Transfers Banner (if any) */}
          {personnelInTransfer.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Personal en Traslado Inter-Tiendas en este momento ({personnelInTransfer.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {personnelInTransfer.map(item => (
                  <div
                    key={item.userId}
                    className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={item.userName}
                        className="w-9 h-9 rounded-full object-cover border border-amber-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-[#0b1c30] truncate">{item.userName}</div>
                        <div className="text-[10px] text-[#757682]">{item.userCargo || item.userRole}</div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#00236f] mt-1">
                          <span className="bg-[#eff4ff] px-1.5 py-0.5 rounded text-[10px]">
                            {item.fromStoreName || `T-${item.fromStoreCode}`}
                          </span>
                          <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {item.toStoreName || `T-${item.toStoreCode}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#444651] bg-[#f8f9ff] p-2 rounded border border-[#e5eeff] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-[#757682]">Salida:</span>
                        <span className="font-bold text-[#0b1c30]">{item.departureTime || 'En trayecto'}</span>
                      </div>
                      {item.motiveDetail && (
                        <div className="text-[10px] text-[#757682] truncate" title={item.motiveDetail}>
                          {item.motiveDetail}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleQuickConfirmArrival(item)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmar Llegada a {item.toStoreName || 'Destino'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar for Radar */}
          <div className="bg-white p-3 rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#00236f]">Filtrar por Región:</span>
              <select
                value={selectedRegionFilter}
                onChange={e => setSelectedRegionFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
              >
                <option value="todas">Todas las Regiones</option>
                <option value="Lima y Callao">Lima y Callao</option>
                <option value="Zona Norte">Zona Norte</option>
                <option value="Zona Sur">Zona Sur</option>
                <option value="Zona Centro">Zona Centro</option>
                <option value="Zona Oriente">Zona Oriente</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-[#444651] cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={onlyStoresWithPersonnel}
                  onChange={e => setOnlyStoresWithPersonnel(e.target.checked)}
                  className="rounded text-[#00236f] focus:ring-[#00236f] w-3.5 h-3.5"
                />
                <span className="font-semibold">Mostrar solo tiendas con personal activo</span>
              </label>
            </div>

            <div className="text-xs text-[#757682]">
              Mostrando <strong>{filteredRadarStores.length}</strong> tiendas
            </div>
          </div>

          {/* Stores Grid with Live Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredRadarStores.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-[#dce9ff] text-[#757682]">
                <Building2 className="w-8 h-8 text-[#a3b3d1] mx-auto mb-2" />
                <p className="font-semibold text-[#0b1c30]">No se encontraron tiendas con los criterios seleccionados.</p>
                <p className="text-xs mt-1">Prueba desactivando "Mostrar solo tiendas con personal activo" o seleccionando otra región.</p>
              </div>
            ) : (
              filteredRadarStores.map(store => {
                const activeWorkers = storePresenceMap.get(store.id) || [];
                const hasWorkers = activeWorkers.length > 0;

                return (
                  <div
                    key={store.id}
                    className={`bg-white rounded-xl border transition-all shadow-xs flex flex-col justify-between ${
                      hasWorkers ? 'border-emerald-200 ring-1 ring-emerald-400/30' : 'border-[#dce9ff]'
                    }`}
                  >
                    {/* Store Card Header */}
                    <div className="p-3.5 border-b border-[#f0f4ff]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                              T-{store.codTienda}
                            </span>
                            <span className="text-[10px] text-[#757682] uppercase tracking-wider font-semibold">
                              {store.formato || 'Hipermercado'}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[#0b1c30] mt-1">{store.name}</h3>
                          <div className="flex items-center gap-1 text-[11px] text-[#757682] mt-0.5">
                            <MapPin className="w-3 h-3 text-[#00236f]" />
                            <span>{store.distrito || store.city} ({store.region})</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {hasWorkers ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              {activeWorkers.length} {activeWorkers.length === 1 ? 'Activo' : 'Activos'}
                            </span>
                          ) : (
                            <span className="bg-[#f0f4ff] text-[#757682] text-[10px] font-medium px-2 py-0.5 rounded-full">
                              Sin personal onsite
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personnel List in Store */}
                    <div className="p-3.5 flex-1 space-y-2.5">
                      {hasWorkers ? (
                        activeWorkers.map(worker => (
                          <div
                            key={worker.userId}
                            className="bg-[#f8f9ff] p-2.5 rounded-lg border border-[#dce9ff] flex items-start justify-between gap-2"
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <img
                                src={worker.userAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                                alt={worker.userName}
                                className="w-8 h-8 rounded-full object-cover border border-[#00236f]/20 shrink-0 mt-0.5"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-[#0b1c30] truncate">{worker.userName}</div>
                                <div className="text-[10px] text-[#757682] truncate">{worker.userCargo || worker.userRole}</div>
                                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Desde las {worker.checkInTime || '08:30 AM'}</span>
                                </div>
                                {worker.motiveDetail && (
                                  <div className="text-[10px] text-[#444651] mt-0.5 bg-white px-1.5 py-0.5 rounded border border-[#e5eeff] truncate">
                                    {worker.motiveDetail}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions per active worker */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <button
                                onClick={() => handleQuickCheckOutFromCard(worker)}
                                className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold transition-colors"
                                title="Marcar salida de este técnico"
                              >
                                Salida
                              </button>
                              <button
                                onClick={() => handleOpenRegisterModal('traslado', worker.userId, store.id)}
                                className="px-2 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] border border-[#dce9ff] rounded text-[10px] font-bold transition-colors flex items-center gap-0.5"
                                title="Mover este técnico a otra tienda"
                              >
                                <span>Mover</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-[#757682] text-xs">
                          No hay personal registrado en esta tienda en este momento.
                        </div>
                      )}
                    </div>

                    {/* Store Card Footer: Quick Register */}
                    <div className="p-2.5 bg-[#f8f9ff] border-t border-[#f0f4ff] rounded-b-xl flex items-center justify-between">
                      <span className="text-[11px] text-[#757682]">
                        CECO: {store.centroCostoSap || store.cecoSap || 'P009100101'}
                      </span>
                      <button
                        onClick={() => handleOpenRegisterModal('ingreso', undefined, store.id)}
                        className="text-[11px] text-[#00236f] hover:underline font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Marcar Ingreso Aquí</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ESTADO DEL PERSONAL ONSITE                         */}
      {/* ========================================================= */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-[#0b1c30]">Estado Actual del Personal Técnico</h2>
              <p className="text-xs text-[#757682]">Seguimiento del estado de presencia, tienda actual y disponibilidad.</p>
            </div>
            <button
              onClick={() => handleOpenRegisterModal('ingreso')}
              className="bg-[#00236f] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Evento de Personal</span>
            </button>
          </div>

          <div className="divide-y divide-[#f0f4ff]">
            {presences.map(item => {
              const isInStore = item.status === 'en_tienda';
              const isInTransfer = item.status === 'en_traslado';
              const isFinished = item.status === 'jornada_finalizada';

              return (
                <div
                  key={item.userId}
                  className="p-4 hover:bg-[#f8f9ff] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={item.userAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                      alt={item.userName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#00236f]/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#0b1c30]">{item.userName}</span>
                        {isInStore && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Laborando en Tienda
                          </span>
                        )}
                        {isInTransfer && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
                            En Traslado
                          </span>
                        )}
                        {isFinished && (
                          <span className="bg-[#f0f4ff] text-[#757682] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Jornada Finalizada
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#757682] mt-0.5">
                        {item.userCargo || item.userRole} • Tel: {item.userPhone}
                      </div>

                      {/* Store / Location details */}
                      <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                        {isInStore && item.currentStoreName && (
                          <div className="bg-[#eff4ff] text-[#00236f] px-2.5 py-1 rounded-md font-bold flex items-center gap-1 border border-[#dce9ff]">
                            <MapPin className="w-3.5 h-3.5 text-[#00236f]" />
                            <span>Presente en T-{item.currentStoreCode} {item.currentStoreName}</span>
                            <span className="text-[11px] font-normal text-[#757682] ml-1">
                              (Ingreso: {item.checkInTime || '08:30 AM'})
                            </span>
                          </div>
                        )}

                        {isInTransfer && (
                          <div className="bg-amber-50 text-amber-950 px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 border border-amber-200">
                            <Navigation className="w-3.5 h-3.5 text-amber-600" />
                            <span>{item.fromStoreName || `T-${item.fromStoreCode}`}</span>
                            <ArrowRight className="w-3 h-3 text-amber-700" />
                            <span>{item.toStoreName || `T-${item.toStoreCode}`}</span>
                            <span className="text-[11px] font-normal text-[#757682] ml-1">
                              (Salida: {item.departureTime || 'En camino'})
                            </span>
                          </div>
                        )}

                        {isFinished && (
                          <div className="text-xs text-[#757682]">
                            Último movimiento registrado: {item.lastEventTime || 'Hoy'}
                          </div>
                        )}
                      </div>

                      {item.motiveDetail && (
                        <div className="text-[11px] text-[#444651] mt-1 italic">
                          "{item.motiveDetail}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this technician */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {isInStore && (
                      <>
                        <button
                          onClick={() => handleOpenRegisterModal('traslado', item.userId, item.currentStoreId)}
                          className="px-3 py-1.5 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          title="Mover a otra tienda"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Mover a otra Tienda</span>
                        </button>

                        <button
                          onClick={() => handleQuickCheckOutFromCard(item)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Registrar Salida</span>
                        </button>
                      </>
                    )}

                    {isInTransfer && (
                      <button
                        onClick={() => handleQuickConfirmArrival(item)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirmar Llegada a {item.toStoreName || 'Destino'}</span>
                      </button>
                    )}

                    {isFinished && (
                      <button
                        onClick={() => handleOpenRegisterModal('ingreso', item.userId)}
                        className="px-3 py-1.5 bg-[#00236f] text-white hover:bg-[#1e3a8a] rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Registrar Nuevo Ingreso</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: INTEGRACIÓN GEOVICTORIA (BIOMETRÍA Y PUNCHES)      */}
      {/* ========================================================= */}
      {activeTab === 'geovictoria' && (
        <div className="space-y-4">
          <GeoVictoriaIntegrationPanel
            config={geoVictoriaConfig}
            punches={geoVictoriaPunches}
            users={users}
            stores={stores}
            onUpdateConfig={handleUpdateGeoVictoriaConfig}
            onReceivePunch={handleReceiveGeoVictoriaPunch}
            onBulkSyncPunches={handleBulkSyncGeoVictoria}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SERVICIO MÓVIL & GEOCERCAS GPS (AUTO CHECK-IN)     */}
      {/* ========================================================= */}
      {activeTab === 'geofence' && (
        <div className="space-y-4">
          <GeofencingAutomationPanel
            stores={stores}
            currentUser={currentUser}
            onAutoCheckIn={handleGeofenceAutoCheckIn}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: LOG HISTÓRICO DE MOVIMIENTOS & ASISTENCIA          */}
      {/* ========================================================= */}
      {activeTab === 'log' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {/* Search Box */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, tienda, motivo, ticket..."
                  value={searchLogQuery}
                  onChange={e => {
                    setSearchLogQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
                />
              </div>

              {/* Store Filter */}
              <div>
                <select
                  value={selectedLogStore}
                  onChange={e => {
                    setSelectedLogStore(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todas">Todas las Tiendas</option>
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>
                      T-{st.codTienda} {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <select
                  value={selectedLogEvent}
                  onChange={e => {
                    setSelectedLogEvent(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todos los Eventos</option>
                  <option value="ingreso">Ingreso a Tienda</option>
                  <option value="salida">Salida de Tienda</option>
                  <option value="traslado">Traslado Inter-Tiendas</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <select
                  value={selectedLogDate}
                  onChange={e => {
                    setSelectedLogDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todas las Fechas</option>
                  <option value="hoy">Solo Hoy</option>
                </select>
              </div>

              {/* Source / Integration Filter */}
              <div>
                <select
                  value={selectedLogSource}
                  onChange={e => {
                    setSelectedLogSource(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todos los Orígenes</option>
                  <option value="geovictoria">Bio: GeoVictoria</option>
                  <option value="geocerca">GPS: Geocerca Móvil</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabular Log View */}
          <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                    <th
                      onClick={() => handleSort('timestamp')}
                      className="py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors"
                      title="Ordenar por Fecha y Hora"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>FECHA & HORA</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('userName')}
                      className="py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors"
                      title="Ordenar por Colaborador"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>COLABORADOR</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>

                    <th className="py-3 px-3.5">EVENTO</th>

                    <th
                      onClick={() => handleSort('storeName')}
                      className="py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors"
                      title="Ordenar por Tienda"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>TIENDA / RUTA</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>

                    <th className="py-3 px-3.5">MOTIVO & DETALLE</th>

                    <th className="py-3 px-3.5 text-center">PERMANENCIA</th>

                    <th className="py-3 px-3.5 text-center">UBICACIÓN</th>

                    <th className="py-3 px-3.5 text-center">ORIGEN / MÉTODO</th>

                    <th className="py-3 px-3.5 text-center">ACCIONES</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0f4ff]">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#757682]">
                        <History className="w-8 h-8 text-[#a3b3d1] mx-auto mb-2" />
                        <p className="font-semibold text-[#0b1c30]">No se encontraron registros de log con estos filtros.</p>
                        <p className="text-xs mt-1">Intenta limpiar los filtros o registrar un nuevo movimiento.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map(item => {
                      const isIngreso = item.eventType === 'ingreso';
                      const isSalida = item.eventType === 'salida';
                      const isTraslado = item.eventType === 'traslado';

                      return (
                        <tr key={item.id} className="hover:bg-[#f8f9ff] transition-colors">
                          {/* Fecha & Hora */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="font-bold text-[#0b1c30]">{item.timeFormatted}</div>
                            <div className="text-[10px] text-[#757682] font-mono">{item.dateFormatted}</div>
                          </td>

                          {/* Colaborador */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.userAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                                alt={item.userName}
                                className="w-7 h-7 rounded-full object-cover border border-[#00236f]/20 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-[#0b1c30]">{item.userName}</div>
                                <div className="text-[10px] text-[#757682]">{item.userCargo || item.userRole}</div>
                              </div>
                            </div>
                          </td>

                          {/* Evento */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {isIngreso && (
                              <span className="bg-emerald-100 text-emerald-800 font-black text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                Ingreso
                              </span>
                            )}
                            {isSalida && (
                              <span className="bg-red-100 text-red-800 font-black text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <X className="w-3 h-3 text-red-700" />
                                Salida
                              </span>
                            )}
                            {isTraslado && (
                              <span className="bg-amber-100 text-amber-900 font-black text-[11px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-amber-700" />
                                Traslado
                              </span>
                            )}
                          </td>

                          {/* Tienda / Ruta */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {isTraslado ? (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="font-bold text-[#00236f]">T-{item.storeCode} {item.storeName}</span>
                                <ArrowRight className="w-3 h-3 text-amber-600" />
                                <span className="font-bold text-amber-900">
                                   {item.targetStoreName ? `T-${item.targetStoreCode} ${item.targetStoreName}` : 'Destino'}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-[#00236f]">T-{item.storeCode} {item.storeName}</span>
                                <div className="text-[10px] text-[#757682]">{item.storeRegion}</div>
                              </div>
                            )}
                          </td>

                          {/* Motivo & Detalle */}
                          <td className="py-3 px-3.5 max-w-xs">
                            <div className="font-medium text-[#0b1c30] truncate" title={item.motiveDetail}>
                              {item.motiveDetail || item.motive}
                            </div>
                            {item.ticketId && (
                              <span className="font-mono text-[10px] bg-[#eff4ff] text-[#00236f] px-1.5 py-0.5 rounded font-bold border border-[#dce9ff]">
                                {item.ticketId}
                              </span>
                            )}
                          </td>

                          {/* Permanencia */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {item.durationFormatted ? (
                              <span className="font-mono font-bold text-xs bg-[#f8f9ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                                {item.durationFormatted}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#757682]">—</span>
                            )}
                          </td>

                          {/* Ubicación Validada */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {item.verifiedLocation ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" />
                                Validado
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#757682]">Manual</span>
                            )}
                          </td>

                          {/* Origen / Método */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {item.source === 'geovictoria_facial' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                <ScanFace className="w-3 h-3 text-emerald-600" />
                                Facial GeoVictoria
                              </span>
                            )}
                            {item.source === 'geovictoria_huella' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                                <Fingerprint className="w-3 h-3 text-teal-600" />
                                Huella GeoVictoria
                              </span>
                            )}
                            {item.source === 'geovictoria_app' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-300">
                                <Smartphone className="w-3 h-3 text-cyan-600" />
                                App GeoVictoria
                              </span>
                            )}
                            {item.source === 'gps_geocerca' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                                <Navigation className="w-3 h-3 text-blue-600" />
                                GPS Geocerca Móvil
                              </span>
                            )}
                            {(!item.source || item.source === 'manual') && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Manual CMMS
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingLog(item)}
                                className="p-1 rounded text-[#00236f] hover:bg-[#eff4ff] border border-[#dce9ff] transition-colors"
                                title="Editar registro del log"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLogItem(item)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 border border-red-100 transition-colors"
                                title="Eliminar registro del log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex items-center justify-between text-xs text-[#757682]">
              <div>
                Mostrando <strong>{paginatedLogs.length}</strong> de <strong>{filteredLogs.length}</strong> registros de asistencia
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#00236f]" />
                </button>
                <span>
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#00236f]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REGISTRAR MOVIMIENTO / ASISTENCIA                  */}
      {/* ========================================================= */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] w-full max-w-lg overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  Registrar Movimiento / Asistencia de Personal
                </h3>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Action Selector */}
            <div className="grid grid-cols-3 bg-[#f0f4ff] p-1.5 border-b border-[#dce9ff]">
              <button
                type="button"
                onClick={() => setEventModalType('ingreso')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  eventModalType === 'ingreso'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#444651] hover:bg-white/60'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ingreso a Tienda</span>
              </button>

              <button
                type="button"
                onClick={() => setEventModalType('salida')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  eventModalType === 'salida'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-[#444651] hover:bg-white/60'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Salida de Tienda</span>
              </button>

              <button
                type="button"
                onClick={() => setEventModalType('traslado')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  eventModalType === 'traslado'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[#444651] hover:bg-white/60'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Traslado Inter-Tiendas</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEvent} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Colaborador */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Colaborador Técnico *
                </label>
                <select
                  value={formUserId}
                  onChange={e => setFormUserId(e.target.value)}
                  required
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.cargo || u.role} ({u.assignedRegion})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tienda Origen / Actual */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  {eventModalType === 'traslado' ? 'Tienda Origen *' : 'Tienda de Registro *'}
                </label>
                <select
                  value={formStoreId}
                  onChange={e => setFormStoreId(e.target.value)}
                  required
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>
                      T-{s.codTienda} {s.name} ({s.distrito || s.city}, {s.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tienda Destino (solo en traslado) */}
              {eventModalType === 'traslado' && (
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tienda Destino del Traslado *</span>
                  </label>
                  <select
                    value={formTargetStoreId}
                    onChange={e => setFormTargetStoreId(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-amber-50 rounded-lg text-xs text-[#0b1c30] border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  >
                    {stores
                      .filter(s => s.id !== formStoreId)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          T-{s.codTienda} {s.name} ({s.distrito || s.city}, {s.region})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">Hora</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    placeholder="08:30 AM"
                    required
                    className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Motivo de la Actividad
                </label>
                <select
                  value={formMotive}
                  onChange={e => setFormMotive(e.target.value as AttendanceMotive)}
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="mantenimiento_preventivo">Mantenimiento Preventivo Programado</option>
                  <option value="atencion_averia">Atención de Avería / Ticket de Emergencia</option>
                  <option value="inventario_equipos">Inventario & Verificación de Activos</option>
                  <option value="soporte_onsite">Soporte Onsite & Revisión de Cajas/Switches</option>
                  <option value="inspeccion">Inspección / Auditoría de Tienda</option>
                  <option value="otro">Otro Motivo Operativo</option>
                </select>
              </div>

              {/* Detalle o N° Ticket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    Detalle de la Tarea / Actividad
                  </label>
                  <input
                    type="text"
                    value={formMotiveDetail}
                    onChange={e => setFormMotiveDetail(e.target.value)}
                    placeholder="Ej. Revisión Cajas POS 01-10"
                    className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                    N° Ticket o N° OT (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formTicketOrWo}
                    onChange={e => setFormTicketOrWo(e.target.value)}
                    placeholder="Ej. OCR-150126 o WO-1031"
                    className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Observaciones / Notas Adicionales
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Detalles sobre herramientas, coordinación con gerencia o estado de relevo..."
                  className="w-full p-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              {/* Validación GPS Checkbox */}
              <label className="flex items-center gap-2 p-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formVerifiedLocation}
                  onChange={e => setFormVerifiedLocation(e.target.checked)}
                  className="rounded text-[#00236f] focus:ring-[#00236f] w-4 h-4"
                />
                <div>
                  <span className="font-bold text-[#0b1c30] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Validar Presencia Onsite en Tienda (Georreferencia)
                  </span>
                  <span className="text-[10px] text-[#757682] block">
                    Confirma que el colaborador se encuentra físicamente dentro del radio de la sucursal.
                  </span>
                </div>
              </label>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#757682] hover:bg-[#f0f4ff]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#00236f] text-white hover:bg-[#1e3a8a] transition-all shadow-md shadow-[#00236f]/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar y Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDITAR REGISTRO DE LOG                             */}
      {/* ========================================================= */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] w-full max-w-md overflow-hidden animate-slideUp">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-300" />
                <h3 className="font-bold text-sm">Modificar Registro del Log</h3>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[#757682]">Colaborador:</span>
                <span className="font-bold text-[#0b1c30] ml-1">{editingLog.userName}</span>
              </div>
              <div>
                <span className="text-[#757682]">Tienda:</span>
                <span className="font-bold text-[#00236f] ml-1">T-{editingLog.storeCode} {editingLog.storeName}</span>
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Hora Registrada</label>
                <input
                  type="text"
                  value={editingLog.timeFormatted}
                  onChange={e => setEditingLog({ ...editingLog, timeFormatted: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#f8f9ff] rounded border border-[#dce9ff]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Detalle de Actividad</label>
                <input
                  type="text"
                  value={editingLog.motiveDetail || ''}
                  onChange={e => setEditingLog({ ...editingLog, motiveDetail: e.target.value })}
                  className="w-full h-8 px-2.5 bg-[#f8f9ff] rounded border border-[#dce9ff]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">Observaciones</label>
                <textarea
                  rows={3}
                  value={editingLog.notes || ''}
                  onChange={e => setEditingLog({ ...editingLog, notes: e.target.value })}
                  className="w-full p-2 bg-[#f8f9ff] rounded border border-[#dce9ff]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-3 py-1.5 text-xs text-[#757682] hover:bg-[#f0f4ff] rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateLog) {
                      onUpdateLog(editingLog);
                      showNotification('Registro actualizado correctamente.');
                    }
                    setEditingLog(null);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-[#00236f] text-white rounded hover:bg-[#1e3a8a]"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
