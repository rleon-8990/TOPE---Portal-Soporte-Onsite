import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Store as StoreIcon,
  Wrench,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle,
  Clock,
  Filter,
  Camera,
  Layers,
  ArrowUpDown,
  FileCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { TechnicalReport, Equipment, Store, AppUser, WorkOrder } from '../types';
import { generatePdfFromReport } from '../utils/helpers';
import { SignaturePad } from './SignaturePad';

interface TechnicalReportsViewProps {
  reports: TechnicalReport[];
  equipments: Equipment[];
  stores: Store[];
  workOrders?: WorkOrder[];
  currentUser: AppUser;
  onAddNewReport: (report: TechnicalReport) => void;
}

export const TechnicalReportsView: React.FC<TechnicalReportsViewProps> = ({
  reports,
  equipments,
  stores,
  workOrders = [],
  currentUser,
  onAddNewReport,
}) => {
  // Navigation Tabs: 'tiendas' (Bloque por Tienda) vs 'individual' (Informes Individuales)
  const [activeTab, setActiveTab] = useState<'tiendas' | 'individual'>('tiendas');

  // --- STATE FOR INFORMES POR TIENDA (BLOQUE DE EQUIPOS) ---
  const [batchStoreId, setBatchStoreId] = useState<string>(stores[0]?.id || '');
  const [batchWorkType, setBatchWorkType] = useState<string>('todos'); // 'todos' | 'preventivo' | 'correctivo' | 'calibracion' | 'inspeccion'
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>('todos'); // 'todos' | 'Completado' | 'En Progreso' | 'Programado'
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');
  const [batchSortField, setBatchSortField] = useState<'code' | 'name' | 'type' | 'status' | 'date'>('code');
  const [batchSortAsc, setBatchSortAsc] = useState<boolean>(true);
  const [batchCurrentPage, setBatchCurrentPage] = useState<number>(1);
  const batchItemsPerPage = 12;

  // Batch Report Modal & Signatures
  const [showBatchPrintModal, setShowBatchPrintModal] = useState<boolean>(false);
  const [techSignature, setTechSignature] = useState<string>('');
  const [techSignName, setTechSignName] = useState<string>(currentUser.name);
  const [storeSignature, setStoreSignature] = useState<string>('');
  const [storeSignName, setStoreSignName] = useState<string>('');

  // --- STATE FOR INDIVIDUAL REPORTS ---
  const [selectedReport, setSelectedReport] = useState<TechnicalReport | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states for new individual report
  const [formStoreId, setFormStoreId] = useState(stores[0]?.id || '');
  const [formEquipmentId, setFormEquipmentId] = useState(equipments[0]?.id || '');
  const [formOutcome, setFormOutcome] = useState<'Aprobado' | 'Con Observaciones' | 'Reprobado'>('Aprobado');
  const [formFindings, setFormFindings] = useState('Equipo inspeccionado bajo protocolo técnico estándar. Valores de presión, voltaje y aislamiento dentro de los rangos especificados por el fabricante.');
  const [formRecommendations, setFormRecommendations] = useState('Reemplazar filtros en el próximo ciclo de 90 días. Mantener monitoreo preventivo continuo.');

  // Current active store object for batch view
  const currentBatchStore = useMemo(() => {
    return stores.find(s => s.id === batchStoreId) || stores[0] || null;
  }, [stores, batchStoreId]);

  // When store changes, update default store signature manager name
  React.useEffect(() => {
    if (currentBatchStore) {
      setStoreSignName(currentBatchStore.gerenteTienda || currentBatchStore.manager || 'Gerente de Tienda');
    }
  }, [currentBatchStore]);

  // Equipments belonging to the selected store
  const storeEquipments = useMemo(() => {
    if (!currentBatchStore) return [];
    return equipments.filter(e => e.storeId === currentBatchStore.id || e.storeName === currentBatchStore.name);
  }, [equipments, currentBatchStore]);

  // Consolidated items for the store
  const consolidatedStoreItems = useMemo(() => {
    return storeEquipments.map(eq => {
      // Find matching work order(s) for this equipment
      const eqWos = workOrders.filter(
        wo => wo.equipmentId === eq.id || wo.equipmentCode === eq.code || (eq.hostName && wo.equipmentCode === eq.hostName)
      );

      // Find individual report for this equipment if any
      const eqRep = reports.find(
        r => r.equipmentId === eq.id || r.equipmentCode === eq.code
      );

      // Match WO according to selected batchWorkType filter
      let matchedWo = eqWos[0] || null;
      if (batchWorkType !== 'todos') {
        const found = eqWos.find(w => w.type === batchWorkType);
        if (found) {
          matchedWo = found;
        }
      }

      // Determine work type, status, execution date, technician
      const workType = matchedWo ? matchedWo.type : (batchWorkType !== 'todos' ? batchWorkType : 'preventivo');
      const executionStatus = matchedWo ? matchedWo.status : (eqRep ? 'Completado' : 'Programado');
      const executionDate = matchedWo ? matchedWo.date : (eqRep ? eqRep.date : eq.lastMaintenance);
      const technician = matchedWo ? matchedWo.technician : (eqRep ? eqRep.technician : (eq.assignedTechnician || currentUser.name));

      const hasBeforePhoto = !!(matchedWo?.evidenceBefore);
      const hasAfterPhoto = !!(matchedWo?.evidenceAfter);
      const checklistTotal = matchedWo?.checklist?.length || 5;
      const checklistOk = matchedWo?.checklist ? matchedWo.checklist.filter(c => c.status === 'ok').length : 5;

      return {
        equipment: eq,
        workOrder: matchedWo,
        report: eqRep,
        workType,
        executionStatus,
        executionDate,
        technician,
        hasBeforePhoto,
        hasAfterPhoto,
        checklistTotal,
        checklistOk,
        clientSignature: matchedWo?.clientSignature,
        technicianSignature: matchedWo?.technicianSignature,
      };
    });
  }, [storeEquipments, workOrders, reports, batchWorkType, currentUser]);

  // Filtered and sorted consolidated items
  const filteredConsolidatedItems = useMemo(() => {
    return consolidatedStoreItems
      .filter(item => {
        // Work type filter
        if (batchWorkType !== 'todos' && item.workType !== batchWorkType) {
          return false;
        }

        // Status filter
        if (batchStatusFilter !== 'todos' && item.executionStatus !== batchStatusFilter) {
          return false;
        }

        // Search Query
        if (batchSearchQuery.trim()) {
          const q = batchSearchQuery.toLowerCase();
          const eq = item.equipment;
          const matches =
            eq.code.toLowerCase().includes(q) ||
            eq.name.toLowerCase().includes(q) ||
            (eq.hostName || '').toLowerCase().includes(q) ||
            (eq.serialNumber || '').toLowerCase().includes(q) ||
            (eq.locationInStore || '').toLowerCase().includes(q) ||
            item.technician.toLowerCase().includes(q) ||
            (item.workOrder?.code || '').toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = '';
        let valB = '';

        if (batchSortField === 'code') {
          valA = a.equipment.code;
          valB = b.equipment.code;
        } else if (batchSortField === 'name') {
          valA = a.equipment.name;
          valB = b.equipment.name;
        } else if (batchSortField === 'type') {
          valA = a.workType;
          valB = b.workType;
        } else if (batchSortField === 'status') {
          valA = a.executionStatus;
          valB = b.executionStatus;
        } else if (batchSortField === 'date') {
          valA = a.executionDate;
          valB = b.executionDate;
        }

        return batchSortAsc
          ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
          : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
      });
  }, [consolidatedStoreItems, batchWorkType, batchStatusFilter, batchSearchQuery, batchSortField, batchSortAsc]);

  const batchTotalPages = Math.ceil(filteredConsolidatedItems.length / batchItemsPerPage) || 1;
  const paginatedBatchItems = useMemo(() => {
    return filteredConsolidatedItems.slice(
      (batchCurrentPage - 1) * batchItemsPerPage,
      batchCurrentPage * batchItemsPerPage
    );
  }, [filteredConsolidatedItems, batchCurrentPage, batchItemsPerPage]);

  // Batch stats
  const batchStats = useMemo(() => {
    const total = storeEquipments.length;
    const inBlock = filteredConsolidatedItems.length;
    const completed = filteredConsolidatedItems.filter(i => i.executionStatus === 'Completado').length;
    const inProgress = filteredConsolidatedItems.filter(i => i.executionStatus === 'En Progreso').length;
    const scheduled = filteredConsolidatedItems.filter(i => i.executionStatus === 'Programado').length;
    const coverageRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, inBlock, completed, inProgress, scheduled, coverageRate };
  }, [storeEquipments, filteredConsolidatedItems]);

  const handleSortBatch = (field: 'code' | 'name' | 'type' | 'status' | 'date') => {
    if (batchSortField === field) {
      setBatchSortAsc(!batchSortAsc);
    } else {
      setBatchSortField(field);
      setBatchSortAsc(true);
    }
  };

  // Export Store Batch Matrix to CSV
  const handleExportBatchCSV = () => {
    if (!currentBatchStore) return;
    const headers = 'Item,Codigo_Equipo,HostName,Nombre_Equipo,Categoria,Marca,Modelo,Serie,Ubicacion_Tienda,Tipo_Trabajo,N_OT,Estado_Ejecucion,Estado_Operativo,Tecnico_Ejecutor,Fecha_Ejecucion,Checklist_OK,Fotos_Evidencia\n';
    const rows = filteredConsolidatedItems
      .map((item, idx) => {
        const eq = item.equipment;
        const wo = item.workOrder;
        const fotos = [item.hasBeforePhoto ? 'Antes' : '', item.hasAfterPhoto ? 'Despues' : ''].filter(Boolean).join(' + ') || 'Sin fotos';
        return `"${idx + 1}","${eq.code}","${eq.hostName || ''}","${eq.name}","${eq.categoryName}","${eq.brand}","${eq.model}","${eq.serialNumber}","${eq.locationInStore}","${item.workType.toUpperCase()}","${wo?.code || 'N/A'}","${item.executionStatus}","${eq.status}","${item.technician}","${item.executionDate}","${item.checklistOk}/${item.checklistTotal}","${fotos}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Informe_Consolidado_${currentBatchStore.code}_${batchWorkType}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- INDIVIDUAL REPORTS FILTERING ---
  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    const repNum = r.reportNumber || r.code || '';
    const matchesSearch =
      repNum.toLowerCase().includes(query) ||
      r.equipmentName.toLowerCase().includes(query) ||
      r.storeName.toLowerCase().includes(query) ||
      r.technician.toLowerCase().includes(query);

    const matchesStore = selectedStoreFilter === '' || r.storeId === selectedStoreFilter;
    const matchesOutcome =
      selectedOutcomeFilter === 'todos' || r.outcome.toLowerCase() === selectedOutcomeFilter.toLowerCase();

    return matchesSearch && matchesStore && matchesOutcome;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadPdf = (rep: TechnicalReport) => {
    generatePdfFromReport(rep);
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === formStoreId) || stores[0];
    const eq = equipments.find(e => e.id === formEquipmentId) || equipments[0];
    const repNum = `INF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRep: TechnicalReport = {
      id: `rep-${Date.now()}`,
      reportNumber: repNum,
      date: new Date().toISOString().split('T')[0],
      storeId: st.id,
      storeName: st.name,
      storeCode: st.code,
      region: st.region,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.code,
      categoryName: eq.categoryName,
      serialNumber: eq.serialNumber,
      brand: eq.brand,
      model: eq.model,
      technician: currentUser.name,
      supervisor: 'Ing. Supervisor Nacional CMMS',
      outcome: formOutcome,
      findings: formFindings,
      recommendations: formRecommendations,
      parameters: {
        voltaje: '220 V ± 2%',
        corriente: '14.8 A',
        presion: '125 PSI',
        temperatura: '4.2 °C',
        vibracion: '0.8 mm/s RMS (Excelente)',
        aislamiento: '> 500 MegaOhms',
      },
      checklist: [
        { label: 'Inspección de conexiones eléctricas', status: 'conforme' },
        { label: 'Revisión y torque de tornillos estructurales', status: 'conforme' },
        { label: 'Prueba de arranque y ciclo de carga', status: 'conforme' },
        { label: 'Limpieza e higienización de bandejas', status: 'conforme' },
        { label: 'Calibración de termostatos o transductores', status: 'conforme' },
      ],
      signatures: {
        technicianSigned: true,
        supervisorSigned: true,
        clientStoreSigned: true,
      },
    };

    onAddNewReport(newRep);
    setShowNewModal(false);
    setSelectedReport(newRep);
    alert(`📄 Informe técnico ${repNum} emitido y firmado digitalmente.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#eff4ff] text-[#00236f] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#dce9ff]">
              TOPE · MERCADOS TOTTUS
            </span>
            <span className="text-xs text-[#757682]">Informes Técnicos & Auditorías</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
            Informes Técnicos de Mantenimiento
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-3xl mt-0.5">
            Generación consolidada de informes por tiendas con bloque de equipos ejecutados por tipo de trabajo (preventivo, correctivo, calibración) e informes individuales.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNewModal(true)}
            className="bg-[#00236f] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Informe Individual</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex border-b border-[#dce9ff] bg-white rounded-t-xl px-2 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => {
            setActiveTab('tiendas');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'tiendas'
              ? 'border-[#00236f] text-[#00236f] bg-[#eff4ff]/60 rounded-t-lg'
              : 'border-transparent text-[#757682] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-t-lg'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Informes por Tiendas (Bloque de Equipos Ejecutados)</span>
          <span className="ml-1 text-[11px] bg-[#00236f] text-white px-2 py-0.2 rounded-full font-mono font-bold">
            {currentBatchStore ? currentBatchStore.code : '90 Tiendas'}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('individual');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'individual'
              ? 'border-[#00236f] text-[#00236f] bg-[#eff4ff]/60 rounded-t-lg'
              : 'border-transparent text-[#757682] hover:text-[#0b1c30] hover:bg-[#f8f9ff] rounded-t-lg'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informes Individuales Emitidos (PDF)</span>
          <span className="ml-1 text-[11px] bg-[#dce9ff] text-[#00236f] px-1.5 py-0.2 rounded-full font-mono font-bold">
            {reports.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INFORMES POR TIENDA (BLOQUE DE EQUIPOS EJECUTADOS) */}
      {activeTab === 'tiendas' && (
        <div className="space-y-4">
          {/* Store & Work Type Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* 1. Selector de Tienda */}
              <div>
                <label className="text-[11px] font-bold text-[#757682] uppercase mb-1 block flex items-center gap-1">
                  <StoreIcon className="w-3.5 h-3.5 text-[#00236f]" />
                  <span>1. Seleccionar Sucursal / Tienda</span>
                </label>
                <select
                  value={batchStoreId}
                  onChange={e => {
                    setBatchStoreId(e.target.value);
                    setBatchCurrentPage(1);
                  }}
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs font-bold text-[#00236f] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white"
                >
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.code} - {st.name} ({st.region}) [CECO: {st.centroCostoSap || st.cecoSap || 'P009'}]
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Selector Selectivo de Tipo de Trabajo */}
              <div>
                <label className="text-[11px] font-bold text-[#757682] uppercase mb-1 block flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-[#00236f]" />
                  <span>2. Tipo de Trabajo (Selectivo)</span>
                </label>
                <select
                  value={batchWorkType}
                  onChange={e => {
                    setBatchWorkType(e.target.value);
                    setBatchCurrentPage(1);
                  }}
                  className="w-full h-9 px-3 bg-[#eff4ff] rounded-lg text-xs font-bold text-[#00236f] border border-[#00236f]/30 focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todos los Trabajos</option>
                  <option value="preventivo">🔧 Mantenimiento Preventivo (Periódico)</option>
                  <option value="correctivo">🚨 Mantenimiento Correctivo (Averías)</option>
                  <option value="calibracion">⚖️ Calibración Técnica Certificada</option>
                  <option value="inspeccion">📋 Inspección / Auditoría de Seguridad</option>
                </select>
              </div>

              {/* 3. Selector de Estado de Ejecución */}
              <div>
                <label className="text-[11px] font-bold text-[#757682] uppercase mb-1 block flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#757682]" />
                  <span>3. Estado de Ejecución</span>
                </label>
                <select
                  value={batchStatusFilter}
                  onChange={e => {
                    setBatchStatusFilter(e.target.value);
                    setBatchCurrentPage(1);
                  }}
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="Completado">✅ Equipos Ejecutados (Completados)</option>
                  <option value="En Progreso">⏳ En Progreso / En Taller</option>
                  <option value="Programado">📅 Programados / Pendientes</option>
                </select>
              </div>

              {/* 4. Buscador Rápido */}
              <div>
                <label className="text-[11px] font-bold text-[#757682] uppercase mb-1 block flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-[#757682]" />
                  <span>4. Filtrar en Tienda</span>
                </label>
                <input
                  type="text"
                  placeholder="HostName, serie, código o técnico..."
                  value={batchSearchQuery}
                  onChange={e => {
                    setBatchSearchQuery(e.target.value);
                    setBatchCurrentPage(1);
                  }}
                  className="w-full h-9 px-3 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>
            </div>

            {/* Store Information & KPI Summary Banner */}
            {currentBatchStore && (
              <div className="pt-2 border-t border-[#e5eeff] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] uppercase font-bold text-[#757682] block">Tienda / CECO</span>
                  <div className="font-extrabold text-[#00236f] truncate">
                    {currentBatchStore.code} · {currentBatchStore.name}
                  </div>
                  <div className="text-[10px] text-[#757682] font-mono">
                    CECO: {currentBatchStore.centroCostoSap || currentBatchStore.cecoSap || 'P009100101'}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] uppercase font-bold text-[#757682] block">Total Activos Tienda</span>
                  <div className="text-base font-extrabold text-[#0b1c30]">{batchStats.total} Equipos</div>
                  <div className="text-[10px] text-[#757682]">Registrados en Inventario</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff]">
                  <span className="text-[10px] uppercase font-bold text-[#00236f] block">Bloque Filtrado</span>
                  <div className="text-base font-extrabold text-[#00236f]">{batchStats.inBlock} Equipos</div>
                  <div className="text-[10px] text-[#00236f] font-semibold uppercase">
                    Tipo: {batchWorkType}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#e8f5e9] border border-[#a7f3d0]">
                  <span className="text-[10px] uppercase font-bold text-[#10b981] block">Ejecutados con Éxito</span>
                  <div className="text-base font-extrabold text-[#10b981]">{batchStats.completed} Equipos</div>
                  <div className="text-[10px] text-[#10b981] font-semibold">
                    {batchStats.coverageRate}% de Cobertura
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex flex-col justify-center gap-1.5">
                  <button
                    onClick={() => setShowBatchPrintModal(true)}
                    className="w-full py-2 px-3 bg-[#00236f] text-white rounded-lg text-xs font-bold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Generar Informe Bloque</span>
                  </button>
                  <button
                    onClick={handleExportBatchCSV}
                    className="w-full py-1 px-3 bg-[#eff4ff] text-[#00236f] rounded-lg text-[11px] font-semibold border border-[#dce9ff] hover:bg-[#dce9ff] transition-all flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Matriz CSV</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Consolidated Equipment Matrix Table */}
          <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
            <div className="p-3 bg-[#f8f9ff] border-b border-[#dce9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#00236f]" />
                <span className="font-bold text-xs text-[#00236f]">
                  Bloque de Equipos Ejecutados en {currentBatchStore?.name || 'Tienda'} ({filteredConsolidatedItems.length} registros)
                </span>
                <span className="text-[11px] bg-[#dce9ff] text-[#00236f] px-2 py-0.2 rounded font-mono font-bold uppercase">
                  Filtro: {batchWorkType}
                </span>
              </div>
              <div className="text-[11px] text-[#757682]">
                Haga clic en las columnas para ordenar ascendentemente o descendentemente.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-[#e2edff]"
                      onClick={() => handleSortBatch('code')}
                    >
                      <div className="flex items-center gap-1">
                        <span>CÓDIGO / HOSTNAME</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-[#e2edff]"
                      onClick={() => handleSortBatch('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>DESCRIPCIÓN DE EQUIPO</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">MARCA / SERIE</th>
                    <th className="py-2.5 px-3">UBICACIÓN</th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-[#e2edff]"
                      onClick={() => handleSortBatch('type')}
                    >
                      <div className="flex items-center gap-1">
                        <span>TIPO TRABAJO</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">N° OT</th>
                    <th
                      className="py-2.5 px-3 text-center cursor-pointer select-none hover:bg-[#e2edff]"
                      onClick={() => handleSortBatch('status')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>EJECUCIÓN</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center">ESTADO ACTIVO</th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-[#e2edff]"
                      onClick={() => handleSortBatch('date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>FECHA / TÉCNICO</span>
                        <ArrowUpDown className="w-3 h-3 text-[#757682]" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3 text-center">EVIDENCIAS</th>
                    <th className="py-2.5 px-3 text-center">CHECKLIST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4ff]">
                  {paginatedBatchItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-[#757682]">
                        No se encontraron equipos en esta tienda que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    paginatedBatchItems.map((item, idx) => {
                      const eq = item.equipment;
                      const isComplete = item.executionStatus === 'Completado';
                      const inProg = item.executionStatus === 'En Progreso';

                      const isWorkPreventivo = item.workType === 'preventivo';
                      const isWorkCorrectivo = item.workType === 'correctivo';
                      const isWorkCalibracion = item.workType === 'calibracion';

                      return (
                        <tr
                          key={eq.id}
                          className={`hover:bg-[#f8f9ff] transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-[#757682] font-mono text-[11px]">
                            {(batchCurrentPage - 1) * batchItemsPerPage + idx + 1}
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-[#00236f]">
                            <div>{eq.code}</div>
                            {eq.hostName && (
                              <div className="text-[10px] text-[#757682] font-mono font-normal">
                                DNS: {eq.hostName}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#0b1c30]">{eq.name}</div>
                            <div className="text-[10px] text-[#757682]">{eq.categoryName}</div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="text-[#0b1c30] font-medium">{eq.brand} {eq.model}</div>
                            <div className="text-[10px] font-mono text-[#757682]">{eq.serialNumber}</div>
                          </td>

                          <td className="py-2.5 px-3 text-[#444651]">
                            {eq.locationInStore}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isWorkPreventivo
                                  ? 'bg-[#eff4ff] text-[#00236f] border border-[#dce9ff]'
                                  : isWorkCorrectivo
                                  ? 'bg-[#fff3e0] text-[#fd761a] border border-[#fed7aa]'
                                  : isWorkCalibracion
                                  ? 'bg-[#f3e8ff] text-[#7c3aed] border border-[#e9d5ff]'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {item.workType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#00236f] font-bold">
                            {item.workOrder?.code || 'WO-AUTO'}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isComplete
                                  ? 'bg-[#e8f5e9] text-[#10b981]'
                                  : inProg
                                  ? 'bg-[#fff3e0] text-[#fd761a]'
                                  : 'bg-[#eff4ff] text-[#00236f]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isComplete ? 'bg-[#10b981]' : inProg ? 'bg-[#fd761a]' : 'bg-[#00236f]'
                                }`}
                              />
                              {item.executionStatus}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                eq.status === 'operativo'
                                  ? 'bg-[#e8f5e9] text-[#10b981]'
                                  : eq.status === 'mantenimiento'
                                  ? 'bg-[#fff3e0] text-[#fd761a]'
                                  : 'bg-[#ffdad6] text-[#ba1a1a]'
                              }`}
                            >
                              {eq.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono text-[11px] text-[#0b1c30]">{item.executionDate}</div>
                            <div className="text-[10px] text-[#757682]">{item.technician}</div>
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {item.hasBeforePhoto || item.hasAfterPhoto ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#e8f5e9] text-[#10b981] font-bold text-[10px] rounded border border-[#a7f3d0]">
                                <Camera className="w-3 h-3" />
                                <span>Antes/Dsp</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#757682]">Sin fotos</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-[#f8f9ff] text-[#00236f] font-mono text-[11px] font-bold border border-[#dce9ff]">
                              {item.checklistOk}/{item.checklistTotal} OK
                            </span>
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
                Mostrando <strong>{paginatedBatchItems.length}</strong> de <strong>{filteredConsolidatedItems.length}</strong> equipos en este bloque ({currentBatchStore?.name})
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBatchCurrentPage(p => Math.max(1, p - 1))}
                  disabled={batchCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#00236f]" />
                </button>
                <span className="font-semibold text-[#0b1c30]">
                  Página {batchCurrentPage} de {batchTotalPages}
                </span>
                <button
                  onClick={() => setBatchCurrentPage(p => Math.min(batchTotalPages, p + 1))}
                  disabled={batchCurrentPage === batchTotalPages}
                  className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#00236f]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INFORMES INDIVIDUALES EMITIDOS */}
      {activeTab === 'individual' && (
        <div className="space-y-4">
          {/* Filter Controls Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                <input
                  type="text"
                  placeholder="Buscar por N° informe, equipo, tienda o técnico..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
                />
              </div>

              {/* Outcome Filter */}
              <div>
                <select
                  value={selectedOutcomeFilter}
                  onChange={e => {
                    setSelectedOutcomeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="todos">Todos los Resultados</option>
                  <option value="aprobado">Aprobado / Conforme</option>
                  <option value="con observaciones">Con Observaciones</option>
                  <option value="reprobado">Reprobado / Falla</option>
                </select>
              </div>

              {/* Store Filter */}
              <div>
                <select
                  value={selectedStoreFilter}
                  onChange={e => {
                    setSelectedStoreFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="">Todas las Sucursales (90)</option>
                  {stores.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.code} - {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Tabular / List View */}
          <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                    <th className="py-3 px-3.5 w-28">N° INFORME</th>
                    <th className="py-3 px-3.5">FECHA</th>
                    <th className="py-3 px-3.5">EQUIPO EVALUADO</th>
                    <th className="py-3 px-3.5">TIENDA / SEDE</th>
                    <th className="py-3 px-3.5">ING. TÉCNICO</th>
                    <th className="py-3 px-3.5">SUPERVISOR</th>
                    <th className="py-3 px-3.5 text-center">DICTAMEN</th>
                    <th className="py-3 px-3.5 text-center w-28">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4ff]">
                  {paginatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#757682]">
                        No se encontraron informes técnicos con los filtros indicados.
                      </td>
                    </tr>
                  ) : (
                    paginatedReports.map((rep, idx) => {
                      const isAprobado = rep.outcome === 'Aprobado' || rep.outcome === 'aprobado';
                      const isObs = rep.outcome.includes('Observación') || rep.outcome.includes('observacion');

                      return (
                        <tr
                          key={rep.id}
                          onClick={() => setSelectedReport(rep)}
                          className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                          }`}
                        >
                          <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                            <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                              {rep.reportNumber || rep.code}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 font-mono text-[11px] text-[#444651] whitespace-nowrap">
                            {rep.date}
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="font-bold text-[#0b1c30]">{rep.equipmentName}</div>
                            <div className="text-[10px] font-mono text-[#757682]">
                              {rep.equipmentCode} • {rep.brand} {rep.model}
                            </div>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="font-semibold text-[#00236f]">{rep.storeName}</div>
                            <div className="text-[11px] text-[#757682]">{rep.region}</div>
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#0b1c30]">
                            {rep.technician}
                          </td>

                          <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-[#757682]">
                            {rep.supervisor || 'Ing. Supervisor CMMS'}
                          </td>

                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isAprobado
                                  ? 'bg-[#e8f5e9] text-[#10b981]'
                                  : isObs
                                  ? 'bg-[#fff3e0] text-[#fd761a]'
                                  : 'bg-[#ffdad6] text-[#ba1a1a]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAprobado ? 'bg-[#10b981]' : isObs ? 'bg-[#fd761a]' : 'bg-[#ba1a1a]'
                                }`}
                              />
                              {rep.outcome}
                            </span>
                          </td>

                          <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedReport(rep)}
                                className="p-1 text-[#00236f] hover:bg-[#eff4ff] rounded font-medium text-[11px] flex items-center gap-0.5"
                                title="Ver Informe Detallado"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(rep)}
                                className="p-1 text-[#10b981] hover:bg-[#e8f5e9] rounded font-medium text-[11px] flex items-center gap-0.5"
                                title="Descargar PDF con Formato Oficial"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
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
                Mostrando <strong>{paginatedReports.length}</strong> de <strong>{filteredReports.length}</strong> informes emitidos
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#dce9ff] bg-white disabled:opacity-40 hover:bg-[#eff4ff] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#00236f]" />
                </button>
                <span className="font-semibold text-[#0b1c30]">
                  Página {currentPage} de {totalPages}
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

      {/* MODAL: INFORME TÉCNICO CONSOLIDADO POR TIENDA (VISTA OFICIAL PARA IMPRESIÓN Y FIRMAS) */}
      {showBatchPrintModal && currentBatchStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-8 space-y-6 border border-[#e5eeff]">
            {/* Action buttons (No print) */}
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff] print:hidden">
              <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2.5 py-1 rounded">
                DOCUMENTO TÉCNICO OFICIAL · AUDITORÍA ONSITE
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#00236f] text-white rounded-lg text-xs font-bold hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar en PDF</span>
                </button>
                <button
                  onClick={handleExportBatchCSV}
                  className="px-3 py-1.5 bg-[#eff4ff] text-[#00236f] border border-[#dce9ff] rounded-lg text-xs font-bold hover:bg-[#dce9ff] transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={() => setShowBatchPrintModal(false)}
                  className="text-[#757682] p-1 font-bold hover:text-black"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="space-y-5 print:space-y-4" id="consolidated-store-report-sheet">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-[#00236f] pb-4">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#757682]">
                    HIPERMERCADOS TOTTUS S.A. · DIVISIÓN DE INFRAESTRUCTURA & SOPORTE ONSITE
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#00236f] tracking-tight mt-1">
                    INFORME TÉCNICO CONSOLIDADO DE TIENDA
                  </h1>
                  <p className="text-xs text-[#444651] font-semibold mt-0.5">
                    Bloque de Ejecución Técnica y Verificación de Estado Operativo de Activos
                  </p>
                </div>

                <div className="text-right text-xs">
                  <div className="font-mono font-extrabold text-[#00236f] text-sm">
                    INF-CONS-{currentBatchStore.code}-{new Date().getFullYear()}
                  </div>
                  <div className="text-[#757682] text-[11px]">
                    Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-PE')}</strong>
                  </div>
                  <div className="text-[11px] text-[#10b981] font-bold mt-1">
                    SISTEMA CMMS FALABELLA / TOPE
                  </div>
                </div>
              </div>

              {/* Store & Work Information Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] text-xs">
                <div>
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Sucursal / Tienda</span>
                  <strong className="text-[#00236f] text-sm block">{currentBatchStore.code} - {currentBatchStore.name}</strong>
                  <span className="text-[11px] text-[#757682]">{currentBatchStore.direccion || currentBatchStore.address}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">CECO SAP / Cluster</span>
                  <strong className="text-[#0b1c30] block font-mono">
                    {currentBatchStore.centroCostoSap || currentBatchStore.cecoSap || 'P009100101'}
                  </strong>
                  <span className="text-[11px] text-[#757682]">
                    Cluster: {currentBatchStore.cluster || 'GLP'} • {currentBatchStore.formato || 'Hiper'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Bloque de Trabajo</span>
                  <strong className="text-[#00236f] block uppercase font-bold">
                    {batchWorkType === 'todos' ? 'TODOS LOS SERVICIOS' : `MANTENIMIENTO ${batchWorkType.toUpperCase()}`}
                  </strong>
                  <span className="text-[11px] text-[#757682]">
                    Estado: {batchStatusFilter === 'todos' ? 'TODOS LOS REGISTROS' : batchStatusFilter}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Resumen de Ejecución</span>
                  <strong className="text-[#10b981] block text-sm">
                    {batchStats.completed} / {batchStats.inBlock} Ejecutados
                  </strong>
                  <span className="text-[11px] text-[#757682]">
                    Cobertura: {batchStats.coverageRate}% de activos
                  </span>
                </div>
              </div>

              {/* Table of executed equipment */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#00236f]">
                    Matriz de Activos Intervenidos en Tienda ({filteredConsolidatedItems.length} Equipos):
                  </h3>
                  <span className="text-[11px] text-[#757682]">
                    Validados bajo norma técnica y protocolos corporativos
                  </span>
                </div>

                <div className="border border-[#dce9ff] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                        <th className="py-2 px-2 text-center w-8">#</th>
                        <th className="py-2 px-2.5">CÓDIGO / DNS</th>
                        <th className="py-2 px-2.5">EQUIPO</th>
                        <th className="py-2 px-2.5">SERIE / MARCA</th>
                        <th className="py-2 px-2.5">UBICACIÓN</th>
                        <th className="py-2 px-2 text-center">TIPO</th>
                        <th className="py-2 px-2 text-center">ESTADO</th>
                        <th className="py-2 px-2 text-center">OPERATIVIDAD</th>
                        <th className="py-2 px-2 text-center">CHECKLIST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5eeff]">
                      {filteredConsolidatedItems.map((item, idx) => (
                        <tr key={item.equipment.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'}>
                          <td className="py-1.5 px-2 text-center text-[#757682] font-mono text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2.5 font-mono font-bold text-[#00236f]">
                            {item.equipment.code}
                            {item.equipment.hostName && (
                              <div className="text-[9px] text-[#757682] font-normal">{item.equipment.hostName}</div>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5">
                            <div className="font-bold text-[#0b1c30]">{item.equipment.name}</div>
                            <div className="text-[9px] text-[#757682]">{item.equipment.categoryName}</div>
                          </td>
                          <td className="py-1.5 px-2.5">
                            <div>{item.equipment.brand} {item.equipment.model}</div>
                            <div className="text-[9px] font-mono text-[#757682]">{item.equipment.serialNumber}</div>
                          </td>
                          <td className="py-1.5 px-2.5 text-[#444651]">
                            {item.equipment.locationInStore}
                          </td>
                          <td className="py-1.5 px-2 text-center font-bold text-[10px] uppercase text-[#00236f]">
                            {item.workType}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                item.executionStatus === 'Completado'
                                  ? 'bg-[#e8f5e9] text-[#10b981]'
                                  : 'bg-[#eff4ff] text-[#00236f]'
                              }`}
                            >
                              {item.executionStatus}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.equipment.status === 'operativo'
                                  ? 'text-[#10b981]'
                                  : 'text-[#ba1a1a]'
                              }`}
                            >
                              {item.equipment.status}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold text-[#00236f] text-[10px]">
                            {item.checklistOk}/{item.checklistTotal} OK
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technical Conclusions */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] text-xs space-y-1">
                <span className="font-bold text-[#00236f] uppercase block text-[11px]">
                  Dictamen de Ingeniería & Conformidad de Servicio:
                </span>
                <p className="text-[#444651] leading-relaxed">
                  Se certifica la ejecución técnica y pruebas de conectividad de los equipos detallados en la presente planilla para la sucursal {currentBatchStore.name} ({currentBatchStore.code}). Todos los puntos de venta, balanzas y sistemas de cómputo evaluados cumplen con las normativas corporativas de disponibilidad y operatividad en red.
                </p>
              </div>

              {/* Digital Signatures Block */}
              <div className="border border-[#dce9ff] rounded-xl p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold text-[#00236f] uppercase tracking-wider">
                  Firmas de Conformidad Digital (Técnico e Interlocutor de Tienda)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Signature 1: Técnico Especialista */}
                  <div className="space-y-2">
                    <SignaturePad
                      id="batch-tech-sig"
                      label="Firma de Ingeniero / Técnico Especialista IT"
                      signatoryName={techSignName}
                      onNameChange={setTechSignName}
                      value={techSignature}
                      onChange={setTechSignature}
                    />
                    <div className="text-[10px] text-[#757682] text-center">
                      Certificación técnica de servicios ejecutados en sitio
                    </div>
                  </div>

                  {/* Signature 2: Gerente / Supervisor de Tienda */}
                  <div className="space-y-2">
                    <SignaturePad
                      id="batch-store-sig"
                      label="Firma de Gerente / Administrador de Tienda"
                      signatoryName={storeSignName}
                      onNameChange={setStoreSignName}
                      value={storeSignature}
                      onChange={setStoreSignature}
                    />
                    <div className="text-[10px] text-[#757682] text-center">
                      Recepción conforme del cliente y administración de sucursal
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#e5eeff] print:hidden">
              <button
                onClick={() => setShowBatchPrintModal(false)}
                className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#dce9ff]"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  alert('✅ Informe Consolidado por Tienda validado con firmas registradas.');
                  setShowBatchPrintModal(false);
                }}
                className="px-4 py-2 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Validar & Guardar Bloque</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INDIVIDUAL REPORT DETAIL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2.5 py-0.5 rounded">
                    {selectedReport.reportNumber}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedReport.outcome === 'Aprobado'
                        ? 'bg-[#e8f5e9] text-[#10b981]'
                        : 'bg-[#fff3e0] text-[#fd761a]'
                    }`}
                  >
                    Dictamen: {selectedReport.outcome}
                  </span>
                  <span className="text-xs text-[#757682] font-mono">{selectedReport.date}</span>
                </div>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1.5">
                  Informe Técnico de Intervención: {selectedReport.equipmentName}
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedReport.storeName} ({selectedReport.region}) • Código Activo: {selectedReport.equipmentCode}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-[#757682] p-1 font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Instrumental Measurements Grid */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682]">
                Parámetros e Instrumentación Registrada:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Voltaje de Alimentación</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.voltaje}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Consumo de Corriente</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.corriente}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Presión de Trabajo</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.presion}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Temperatura de Operación</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.temperatura}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Nivel de Vibración</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.vibracion}</strong>
                </div>
                <div className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                  <span className="text-[10px] text-[#757682] uppercase block font-bold">Resistencia de Aislamiento</span>
                  <strong className="text-[#00236f] font-mono">{selectedReport.parameters.aislamiento}</strong>
                </div>
              </div>
            </div>

            {/* Findings & Conclusions */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <h5 className="font-bold text-[#00236f] uppercase text-[11px] mb-1">Conclusiones y Hallazgos:</h5>
                <p className="text-[#444651]">{selectedReport.findings}</p>
              </div>
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff]">
                <h5 className="font-bold text-[#00236f] uppercase text-[11px] mb-1">Recomendaciones del Especialista:</h5>
                <p className="text-[#444651]">{selectedReport.recommendations}</p>
              </div>
            </div>

            {/* Signatures verification */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#757682] block">Técnico Certificado</span>
                <strong className="text-[#00236f]">{selectedReport.technician}</strong>
                <div className="text-[10px] text-[#10b981] font-semibold mt-0.5">✓ Firma Digital Validada</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#757682] block">Supervisor de Mantenimiento</span>
                <strong className="text-[#00236f]">{selectedReport.supervisor}</strong>
                <div className="text-[10px] text-[#10b981] font-semibold mt-0.5">✓ Aprobación Central Validada</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#dce9ff]"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedReport)}
                className="px-4 py-2 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW INDIVIDUAL REPORT */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <h3 className="font-bold text-base text-[#00236f]">Emitir Nuevo Informe Técnico</h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tienda / Sede
                  </label>
                  <select
                    value={formStoreId}
                    onChange={e => setFormStoreId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.code} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Equipo Auditado
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={e => setFormEquipmentId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Dictamen Final
                </label>
                <select
                  value={formOutcome}
                  onChange={e => setFormOutcome(e.target.value as 'Aprobado' | 'Con Observaciones' | 'Reprobado')}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-bold"
                >
                  <option value="Aprobado">Aprobado / Conforme (100% Operativo)</option>
                  <option value="Con Observaciones">Con Observaciones (Requiere Ajuste Menor)</option>
                  <option value="Reprobado">Reprobado (Falla Crítica / No Cumple Norma)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Conclusiones de Ingeniería
                </label>
                <textarea
                  rows={3}
                  required
                  value={formFindings}
                  onChange={e => setFormFindings(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Recomendaciones Técnicas
                </label>
                <textarea
                  rows={2}
                  required
                  value={formRecommendations}
                  onChange={e => setFormRecommendations(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a]"
                >
                  Guardar & Emitir PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
