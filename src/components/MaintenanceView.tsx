import React, { useState, useMemo, useRef } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Check,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CheckSquare,
  ArrowUpDown,
  Edit2,
  Trash2,
  Camera,
  Image as ImageIcon,
  Save,
  PenTool,
  RotateCcw,
  Sparkles,
  Layers,
  ZoomIn
} from 'lucide-react';
import { WorkOrder, Equipment, Store, MaintenanceType, MaintenanceFrequency, WorkOrderStatus } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { SignaturePad } from './SignaturePad';

interface MaintenanceViewProps {
  workOrders: WorkOrder[];
  equipments: Equipment[];
  stores: Store[];
  onAddWorkOrder: (newWo: Partial<WorkOrder>) => void;
  onUpdateWorkOrder?: (updatedWo: WorkOrder) => void;
  onDeleteWorkOrder?: (id: string) => void;
  onUpdateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
}

const CHECKLIST_PRESETS = {
  general: [
    'Inspección visual de integridad física y cableado',
    'Medición de voltaje (L1-L2-L3) y amperaje de consumo',
    'Limpieza de filtros, serpentines o ductos de ventilación',
    'Prueba funcional de sensores y relés térmicos de seguridad',
    'Ajuste de bornes eléctricos y pernos de soporte antivibratorio',
    'Emisión de reporte técnico y firma de conformidad'
  ],
  hvac: [
    'Revisión de presiones de succión y descarga de refrigerante R410A',
    'Limpieza profunda y desinfección química de evaporador',
    'Inspección de drenaje de condensado y prueba de flujo',
    'Verificación de rodamientos de motor ventilador y lubricación',
    'Chequeo de contactores eléctricos y capacitores de arranque'
  ],
  pos_cajas: [
    'Limpieza óptica de escáner bióptico / de mano',
    'Prueba de corte y tracción en impresora térmica de tickets',
    'Verificación de puerto Ethernet / USB y dirección IP',
    'Aspirado interno de polvo en motherboard y fuente de poder',
    'Prueba de lectura de gaveta de dinero y teclado programable'
  ],
  balanzas: [
    'Nivelación de burbuja y soporte mecánico',
    'Prueba de pesaje con masas patrón certificadas',
    'Limpieza de cabezal térmico y platillo de acero inoxidable',
    'Calibración de celda de carga / linealidad metrológica',
    'Verificación de sellos de seguridad INACAL / metrología'
  ]
};

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  workOrders,
  equipments,
  stores,
  onAddWorkOrder,
  onUpdateWorkOrder,
  onDeleteWorkOrder,
  onUpdateWorkOrderStatus,
}) => {
  const [selectedTab, setSelectedTab] = useState<'todas' | MaintenanceType>('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | WorkOrderStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWoDetail, setSelectedWoDetail] = useState<WorkOrder | null>(null);
  const [editingWo, setEditingWo] = useState<WorkOrder | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof WorkOrder | 'progress'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default newest first

  const handleSort = (field: keyof WorkOrder | 'progress') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New Work Order Form State
  const [newEquipmentId, setNewEquipmentId] = useState(equipments[0]?.id || '');
  const [newType, setNewType] = useState<MaintenanceType>('preventivo');
  const [newFrequency, setNewFrequency] = useState<MaintenanceFrequency>('semestral');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTechnician, setNewTechnician] = useState('Ing. Carlos Ramos');
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>([...CHECKLIST_PRESETS.general]);
  const [newCustomItemText, setNewCustomItemText] = useState('');
  const [newEvidenceBefore, setNewEvidenceBefore] = useState<string>('');
  const [newEvidenceAfter, setNewEvidenceAfter] = useState<string>('');

  // Image Upload Ref Helpers
  const fileBeforeRef = useRef<HTMLInputElement | null>(null);
  const fileAfterRef = useRef<HTMLInputElement | null>(null);
  const fileDetailBeforeRef = useRef<HTMLInputElement | null>(null);
  const fileDetailAfterRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateChecklistProgress = (wo: WorkOrder) => {
    if (!wo.checklist || wo.checklist.length === 0) return 100;
    const answered = wo.checklist.filter(c => c.status !== 'na').length;
    return Math.round((answered / wo.checklist.length) * 100);
  };

  // Filtered & Sorted Work Orders
  const filteredOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesType = selectedTab === 'todas' || wo.type === selectedTab;
      const matchesStatus =
        selectedStatusFilter === 'todos' || wo.status === selectedStatusFilter;

      const query = searchQuery.toLowerCase();
      const woCode = wo.code || wo.orderNumber || '';
      const matchesSearch =
        woCode.toLowerCase().includes(query) ||
        wo.equipmentName.toLowerCase().includes(query) ||
        wo.storeName.toLowerCase().includes(query) ||
        wo.technician.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortField === 'progress') {
        valA = calculateChecklistProgress(a);
        valB = calculateChecklistProgress(b);
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      } else if (sortField === 'priority') {
        const pMap: Record<string, number> = { Urgente: 4, Alta: 3, Media: 2, Baja: 1 };
        valA = pMap[a.priority] || 0;
        valB = pMap[b.priority] || 0;
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      } else if (sortField === 'date') {
        valA = new Date(a.date || a.scheduledDate || 0).getTime();
        valB = new Date(b.date || b.scheduledDate || 0).getTime();
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      } else {
        valA = (a[sortField as keyof WorkOrder] ?? '').toString().toLowerCase();
        valB = (b[sortField as keyof WorkOrder] ?? '').toString().toLowerCase();
        const cmp = (valA as string).localeCompare(valB as string, 'es', { numeric: true, sensitivity: 'base' });
        return sortAsc ? cmp : -cmp;
      }
    });
  }, [workOrders, selectedTab, selectedStatusFilter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers for Checklist Points in Creation Form
  const handleAddChecklistPoint = () => {
    if (!newCustomItemText.trim()) return;
    setNewChecklistItems(prev => [...prev, newCustomItemText.trim()]);
    setNewCustomItemText('');
  };

  const handleRemoveChecklistPoint = (index: number) => {
    setNewChecklistItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditChecklistPoint = (index: number, newText: string) => {
    setNewChecklistItems(prev => {
      const copy = [...prev];
      copy[index] = newText;
      return copy;
    });
  };

  // Create Work Order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEq = equipments.find(e => e.id === newEquipmentId) || equipments[0];
    const targetStore = stores.find(s => s.id === targetEq.storeId) || stores[0];
    const newCode = `OT-${Math.floor(1000 + Math.random() * 9000)}`;

    const itemsToSave = newChecklistItems.length > 0 ? newChecklistItems : CHECKLIST_PRESETS.general;

    onAddWorkOrder({
      id: `wo-${Date.now()}`,
      code: newCode,
      orderNumber: newCode,
      equipmentId: targetEq.id,
      equipmentCode: targetEq.code,
      equipmentName: targetEq.name,
      storeId: targetStore.id,
      storeName: targetStore.name,
      region: targetStore.region,
      type: newType,
      frequency: newFrequency,
      status: 'Programado',
      date: newDate,
      scheduledDate: newDate,
      technician: newTechnician,
      priority: newPriority,
      evidenceBefore: newEvidenceBefore,
      evidenceAfter: newEvidenceAfter,
      checklist: itemsToSave.map(item => ({
        item,
        status: 'na'
      }))
    });

    setShowNewModal(false);
    setNewEvidenceBefore('');
    setNewEvidenceAfter('');
    alert(`✅ Orden de trabajo ${newCode} programada correctamente para ${targetStore.name} con ${itemsToSave.length} puntos de checklist definidos.`);
  };

  // Delete Work Order
  const handleDelete = (wo: WorkOrder) => {
    const confirm = window.confirm(`¿Está seguro de eliminar la Orden de Trabajo ${wo.code || wo.orderNumber} para ${wo.equipmentName}? Esta acción no se puede deshacer.`);
    if (confirm) {
      if (onDeleteWorkOrder) {
        onDeleteWorkOrder(wo.id);
      }
      if (selectedWoDetail?.id === wo.id) {
        setSelectedWoDetail(null);
      }
      alert(`Orden de trabajo ${wo.code} eliminada.`);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (wo: WorkOrder) => {
    setEditingWo(JSON.parse(JSON.stringify(wo)));
    setShowEditModal(true);
  };

  // Save Edited Work Order
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWo) return;

    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(editingWo);
    } else {
      onUpdateWorkOrderStatus(editingWo.id, editingWo.status as WorkOrderStatus);
    }

    if (selectedWoDetail?.id === editingWo.id) {
      setSelectedWoDetail(editingWo);
    }

    setShowEditModal(false);
    setEditingWo(null);
    alert(`✅ Orden de trabajo ${editingWo.code} actualizada correctamente.`);
  };

  // Toggle Checklist Status in Detail Drawer
  const handleToggleChecklistItem = (itemIndex: number, newStatus: 'ok' | 'observacion' | 'falla' | 'na') => {
    if (!selectedWoDetail || !selectedWoDetail.checklist) return;

    const updatedChecklist = [...selectedWoDetail.checklist];
    updatedChecklist[itemIndex] = {
      ...updatedChecklist[itemIndex],
      status: newStatus
    };

    const updatedWo: WorkOrder = {
      ...selectedWoDetail,
      checklist: updatedChecklist
    };

    setSelectedWoDetail(updatedWo);
    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(updatedWo);
    }
  };

  // Modify Checklist Item Text on the fly in Detail Drawer
  const handleUpdateChecklistItemText = (itemIndex: number, newText: string) => {
    if (!selectedWoDetail || !selectedWoDetail.checklist) return;
    const updatedChecklist = [...selectedWoDetail.checklist];
    updatedChecklist[itemIndex] = {
      ...updatedChecklist[itemIndex],
      item: newText
    };
    const updatedWo = { ...selectedWoDetail, checklist: updatedChecklist };
    setSelectedWoDetail(updatedWo);
    if (onUpdateWorkOrder) onUpdateWorkOrder(updatedWo);
  };

  // Add new checklist point inside Detail Drawer
  const [detailNewPointText, setDetailNewPointText] = useState('');
  const handleAddDetailChecklistPoint = () => {
    if (!detailNewPointText.trim() || !selectedWoDetail) return;
    const updatedChecklist = [
      ...(selectedWoDetail.checklist || []),
      { item: detailNewPointText.trim(), status: 'na' as const }
    ];
    const updatedWo = { ...selectedWoDetail, checklist: updatedChecklist };
    setSelectedWoDetail(updatedWo);
    setDetailNewPointText('');
    if (onUpdateWorkOrder) onUpdateWorkOrder(updatedWo);
  };

  // Remove checklist point inside Detail Drawer
  const handleRemoveDetailChecklistPoint = (index: number) => {
    if (!selectedWoDetail || !selectedWoDetail.checklist) return;
    const updatedChecklist = selectedWoDetail.checklist.filter((_, i) => i !== index);
    const updatedWo = { ...selectedWoDetail, checklist: updatedChecklist };
    setSelectedWoDetail(updatedWo);
    if (onUpdateWorkOrder) onUpdateWorkOrder(updatedWo);
  };

  // Save and Complete OT with Signatures & Evidences
  const handleSaveAndCompleteOT = () => {
    if (!selectedWoDetail) return;

    const updatedWo: WorkOrder = {
      ...selectedWoDetail,
      status: 'Completado'
    };

    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(updatedWo);
    }
    onUpdateWorkOrderStatus(selectedWoDetail.id, 'Completado');
    setSelectedWoDetail(updatedWo);
    alert(`🎉 Orden de trabajo ${selectedWoDetail.code} finalizada, firmada por Cliente y Técnico, y validada.`);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Mantenimiento Preventivo & Correctivo
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Gestión integral de órdenes de trabajo (OT) con checklists configurables, evidencia fotográfica antes/después y firmas digitales.
          </p>
        </div>

        <button
          onClick={() => {
            setNewChecklistItems([...CHECKLIST_PRESETS.general]);
            setShowNewModal(true);
          }}
          className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Mantenimiento</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por N° OT, equipo, tienda o técnico..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedTab}
              onChange={e => {
                setSelectedTab(e.target.value as 'todas' | MaintenanceType);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todas">Todos los Tipos de Mantenimiento</option>
              <option value="preventivo">Preventivo Programado</option>
              <option value="correctivo">Correctivo por Avería</option>
              <option value="calibracion">Calibración Metrológica</option>
              <option value="inspeccion">Inspección de Rutina</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={e => {
                setSelectedStatusFilter(e.target.value as 'todos' | WorkOrderStatus);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Estados de OT</option>
              <option value="Programado">Programado</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
              <option value="Pendiente Repuestos">Pendiente Repuestos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabular / List View with Column Sorting */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                <th
                  onClick={() => handleSort('code')}
                  className={`py-3 px-3.5 w-28 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'code' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por N° OT (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>N° OT</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'code' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('type')}
                  className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'type' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Tipo (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>TIPO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'type' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('equipmentName')}
                  className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'equipmentName' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Equipo Asignado (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>EQUIPO ASIGNADO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'equipmentName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('storeName')}
                  className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'storeName' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Sucursal / Tienda (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>SUCURSAL / TIENDA</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'storeName' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('date')}
                  className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'date' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Fecha Programada"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>FECHA</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'date' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('technician')}
                  className={`py-3 px-3.5 cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'technician' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Técnico a Cargo (A-Z / Z-A)"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>TÉCNICO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'technician' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('priority')}
                  className={`py-3 px-3.5 text-center cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'priority' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Prioridad"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>PRIORIDAD</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'priority' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('progress')}
                  className={`py-3 px-3.5 text-center cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'progress' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Avance de Checklist"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>CHECKLIST</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'progress' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  className={`py-3 px-3.5 text-center cursor-pointer hover:bg-[#e2edff] transition-colors group ${
                    sortField === 'status' ? 'bg-[#e2edff]' : ''
                  }`}
                  title="Ordenar por Estado"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>ESTADO</span>
                    <span className="text-xs font-bold shrink-0">
                      {sortField === 'status' ? (sortAsc ? '▲' : '▼') : <ArrowUpDown className="w-3 h-3 text-[#757682]/40 group-hover:text-[#00236f]" />}
                    </span>
                  </div>
                </th>

                <th className="py-3 px-3.5 text-center w-36">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#757682]">
                    No se encontraron órdenes de trabajo que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((wo, idx) => {
                  const progress = calculateChecklistProgress(wo);
                  const isCompleted = wo.status === 'Completado' || wo.status === 'completado';
                  const isInProgress = wo.status === 'En Progreso' || wo.status === 'en_progreso';
                  const hasPhotos = Boolean(wo.evidenceBefore || wo.evidenceAfter);
                  const hasSignatures = Boolean(wo.clientSignature || wo.technicianSignature);

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => setSelectedWoDetail(wo)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                            {wo.code || wo.orderNumber}
                          </span>
                          {hasPhotos && (
                            <span title="Contiene fotos de evidencia" className="text-xs">📸</span>
                          )}
                          {hasSignatures && (
                            <span title="Firmado digitalmente" className="text-xs">✍️</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="capitalize font-semibold text-[#444651]">
                          {wo.type}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0b1c30]">{wo.equipmentName}</div>
                        <div className="text-[10px] font-mono text-[#757682]">{wo.equipmentCode}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#00236f]">{wo.storeName}</div>
                        <div className="text-[11px] text-[#757682]">{wo.region}</div>
                      </td>

                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#444651] whitespace-nowrap">
                        {wo.date || wo.scheduledDate}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[#0b1c30] font-medium">
                          <User className="w-3.5 h-3.5 text-[#00236f]" />
                          <span>{wo.technician}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`font-bold text-[11px] px-2 py-0.5 rounded-full ${
                            wo.priority === 'Alta'
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : wo.priority === 'Media'
                              ? 'bg-[#fff3e0] text-[#fd761a]'
                              : 'bg-[#e8f5e9] text-[#10b981]'
                          }`}
                        >
                          {wo.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                          <div className="w-12 bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#10b981] h-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#00236f]">{progress}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-[#e8f5e9] text-[#10b981]'
                              : isInProgress
                              ? 'bg-[#eff4ff] text-[#00236f]'
                              : 'bg-[#fff3e0] text-[#fd761a]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted ? 'bg-[#10b981]' : isInProgress ? 'bg-[#00236f]' : 'bg-[#fd761a]'
                            }`}
                          />
                          {wo.status}
                        </span>
                      </td>

                      {/* ACCIONES: Checklist, Modificar, Eliminar */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedWoDetail(wo)}
                            className="px-2 py-1 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded font-bold text-[11px] transition-colors"
                            title="Abrir checklist de inspección y evidencias"
                          >
                            Checklist
                          </button>
                          <button
                            onClick={() => handleOpenEdit(wo)}
                            className="p-1 rounded border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] transition-colors"
                            title="Modificar datos de la OT"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(wo)}
                            className="p-1 rounded border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar orden de trabajo"
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
            Mostrando <strong>{paginatedOrders.length}</strong> de <strong>{filteredOrders.length}</strong> órdenes
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

      {/* Interactive Checklist Inspection Drawer / Modal with Evidences & Signatures */}
      {selectedWoDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded border border-[#dce9ff]">
                    {selectedWoDetail.code || selectedWoDetail.orderNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">
                    {selectedWoDetail.type}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1">
                  Checklist Digital, Evidencias Fotográficas & Firmas
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedWoDetail.equipmentName} ({selectedWoDetail.equipmentCode}) • {selectedWoDetail.storeName} ({selectedWoDetail.region})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedWoDetail)}
                  className="px-2.5 py-1 text-xs border border-[#dce9ff] rounded-lg text-[#00236f] hover:bg-[#eff4ff] flex items-center gap-1 font-semibold"
                  title="Modificar OT"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modificar</span>
                </button>
                <button
                  onClick={() => setSelectedWoDetail(null)}
                  className="text-[#757682] p-1 font-bold hover:text-black"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Checklist Items Interactive Matrix */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#00236f] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Puntos de Inspección y Verificación ({selectedWoDetail.checklist?.length || 0}):</span>
                </h4>
                <span className="text-[11px] text-[#757682]">
                  Puedes modificar el texto de cada punto directamente o añadir nuevas variables.
                </span>
              </div>

              {/* Editable Checklist Points */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedWoDetail.checklist?.map((chk, index) => (
                  <div
                    key={index}
                    className="p-2.5 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#00236f] shrink-0 w-5">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={chk.item}
                        onChange={e => handleUpdateChecklistItemText(index, e.target.value)}
                        className="w-full text-xs font-semibold text-[#0b1c30] bg-transparent border-b border-transparent hover:border-[#b4c8f0] focus:border-[#00236f] focus:bg-white px-1 py-0.5 rounded transition-all focus:outline-none"
                        title="Haz clic para modificar la variable o texto del checklist"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDetailChecklistPoint(index)}
                        className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                        title="Eliminar este punto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Radio state buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleToggleChecklistItem(index, 'ok')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                          chk.status === 'ok'
                            ? 'bg-[#10b981] text-white shadow-xs'
                            : 'bg-white text-[#444651] border border-[#c5c5d3] hover:bg-[#e8f5e9]'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>Conforme</span>
                      </button>

                      <button
                        onClick={() => handleToggleChecklistItem(index, 'observacion')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                          chk.status === 'observacion'
                            ? 'bg-[#fd761a] text-white shadow-xs'
                            : 'bg-white text-[#444651] border border-[#c5c5d3] hover:bg-[#fff3e0]'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>Obs.</span>
                      </button>

                      <button
                        onClick={() => handleToggleChecklistItem(index, 'falla')}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                          chk.status === 'falla'
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : 'bg-white text-[#444651] border border-[#c5c5d3] hover:bg-[#ffdad6]'
                        }`}
                      >
                        <X className="w-3 h-3" />
                        <span>Falla</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Checklist Item Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Escriba un nuevo punto o variable a considerar en este checklist..."
                  value={detailNewPointText}
                  onChange={e => setDetailNewPointText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDetailChecklistPoint();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 bg-[#f0f4ff] border border-[#dce9ff] rounded-lg text-[#0b1c30] placeholder:text-[#757682] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
                <button
                  type="button"
                  onClick={handleAddDetailChecklistPoint}
                  className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a] transition-all shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Variable</span>
                </button>
              </div>
            </div>

            {/* FOTOGRAFÍAS DE EVIDENCIA: ANTES Y DESPUÉS */}
            <div className="pt-3 border-t border-[#e5eeff] space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#00236f] flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>Registro de Evidencia Fotográfica (Antes & Después)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Foto ANTES */}
                <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                      <span>📸 Evidencia ANTES (Estado Inicial / Daño)</span>
                    </span>
                    {selectedWoDetail.evidenceBefore && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...selectedWoDetail, evidenceBefore: '' };
                          setSelectedWoDetail(updated);
                          if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                        }}
                        className="text-[11px] text-red-600 hover:underline font-semibold"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {selectedWoDetail.evidenceBefore ? (
                    <div className="relative group rounded-lg overflow-hidden border border-[#dce9ff] bg-black/5 aspect-video flex items-center justify-center">
                      <img
                        src={selectedWoDetail.evidenceBefore}
                        alt="Evidencia Antes"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setZoomImage(selectedWoDetail.evidenceBefore!)}
                      />
                      <button
                        type="button"
                        onClick={() => setZoomImage(selectedWoDetail.evidenceBefore!)}
                        className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ampliar foto"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileDetailBeforeRef.current?.click()}
                      className="border-2 border-dashed border-[#b4c8f0] hover:border-[#00236f] rounded-lg p-4 text-center cursor-pointer transition-colors bg-white flex flex-col items-center justify-center gap-1 text-[#757682]"
                    >
                      <Camera className="w-6 h-6 text-[#00236f]" />
                      <span className="text-xs font-semibold text-[#00236f]">Adjuntar Foto ANTES</span>
                      <span className="text-[10px]">Haz clic o toma una foto desde cámara</span>
                    </div>
                  )}

                  <input
                    ref={fileDetailBeforeRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e =>
                      handleFileUpload(e, url => {
                        const updated = { ...selectedWoDetail, evidenceBefore: url };
                        setSelectedWoDetail(updated);
                        if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                      })
                    }
                  />
                </div>

                {/* Foto DESPUÉS */}
                <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#10b981] flex items-center gap-1">
                      <span>📸 Evidencia DESPUÉS (Finalizado / Operativo)</span>
                    </span>
                    {selectedWoDetail.evidenceAfter && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...selectedWoDetail, evidenceAfter: '' };
                          setSelectedWoDetail(updated);
                          if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                        }}
                        className="text-[11px] text-red-600 hover:underline font-semibold"
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  {selectedWoDetail.evidenceAfter ? (
                    <div className="relative group rounded-lg overflow-hidden border border-[#dce9ff] bg-black/5 aspect-video flex items-center justify-center">
                      <img
                        src={selectedWoDetail.evidenceAfter}
                        alt="Evidencia Después"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setZoomImage(selectedWoDetail.evidenceAfter!)}
                      />
                      <button
                        type="button"
                        onClick={() => setZoomImage(selectedWoDetail.evidenceAfter!)}
                        className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ampliar foto"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileDetailAfterRef.current?.click()}
                      className="border-2 border-dashed border-[#b4c8f0] hover:border-[#10b981] rounded-lg p-4 text-center cursor-pointer transition-colors bg-white flex flex-col items-center justify-center gap-1 text-[#757682]"
                    >
                      <Camera className="w-6 h-6 text-[#10b981]" />
                      <span className="text-xs font-semibold text-[#10b981]">Adjuntar Foto DESPUÉS</span>
                      <span className="text-[10px]">Haz clic o toma una foto desde cámara</span>
                    </div>
                  )}

                  <input
                    ref={fileDetailAfterRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e =>
                      handleFileUpload(e, url => {
                        const updated = { ...selectedWoDetail, evidenceAfter: url };
                        setSelectedWoDetail(updated);
                        if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* FIRMAS DIGITALES DE CLIENTE Y TÉCNICO */}
            <div className="pt-3 border-t border-[#e5eeff] space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#00236f] flex items-center gap-1.5">
                <PenTool className="w-4 h-4" />
                <span>Firmas Digitales de Conformidad en Campo</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Firma del Técnico */}
                <SignaturePad
                  id="canvas-technician-sig"
                  label="Firma del Técnico Especialista"
                  placeholderName="Nombre del Técnico"
                  signatoryName={selectedWoDetail.technicianName || selectedWoDetail.technician}
                  onNameChange={name => {
                    const updated = { ...selectedWoDetail, technicianName: name };
                    setSelectedWoDetail(updated);
                    if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                  }}
                  value={selectedWoDetail.technicianSignature}
                  onChange={sigUrl => {
                    const updated = { ...selectedWoDetail, technicianSignature: sigUrl };
                    setSelectedWoDetail(updated);
                    if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                  }}
                />

                {/* Firma del Cliente / Supervisor de Tienda */}
                <SignaturePad
                  id="canvas-client-sig"
                  label="Firma del Cliente (Gerente / Supervisor de Tienda)"
                  placeholderName="Nombre del Cliente / Cargo"
                  signatoryName={selectedWoDetail.clientName || 'Gerente de Tienda'}
                  onNameChange={name => {
                    const updated = { ...selectedWoDetail, clientName: name };
                    setSelectedWoDetail(updated);
                    if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                  }}
                  value={selectedWoDetail.clientSignature}
                  onChange={sigUrl => {
                    const updated = { ...selectedWoDetail, clientSignature: sigUrl };
                    setSelectedWoDetail(updated);
                    if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                  }}
                />
              </div>
            </div>

            {/* Status changer buttons & Action Bottom Bar */}
            <div className="pt-3 border-t border-[#e5eeff] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#757682]">Marcar Estado:</span>
                {(['Programado', 'En Progreso', 'Completado'] as WorkOrderStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateWorkOrderStatus(selectedWoDetail.id, st);
                      const updated = { ...selectedWoDetail, status: st };
                      setSelectedWoDetail(updated);
                      if (onUpdateWorkOrder) onUpdateWorkOrder(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedWoDetail.status === st
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-[#eff4ff] text-[#00236f] border border-[#dce9ff] hover:bg-[#dce9ff]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedWoDetail)}
                  className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar OT</span>
                </button>

                <button
                  onClick={handleSaveAndCompleteOT}
                  className="px-4 py-2 bg-[#10b981] text-white font-bold text-xs rounded-lg hover:bg-[#059669] shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Firmar & Validar OT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program New Work Order Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Programar Orden de Trabajo (OT)
                </h3>
                <p className="text-xs text-[#757682]">
                  Define el equipo, técnico y personaliza las variables de checklist e inspección.
                </p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Seleccionar Equipo
                </label>
                <select
                  value={newEquipmentId}
                  onChange={e => setNewEquipmentId(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                >
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} - {eq.name} ({eq.storeName} - {eq.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as MaintenanceType)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                  >
                    <option value="preventivo">Preventivo Programado</option>
                    <option value="correctivo">Correctivo por Avería</option>
                    <option value="calibracion">Calibración Metrológica</option>
                    <option value="inspeccion">Inspección de Rutina</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Frecuencia
                  </label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as MaintenanceFrequency)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Fecha Programada de Ejecución
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as 'Alta' | 'Media' | 'Baja')}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Técnico Especialista Asignado
                </label>
                <select
                  value={newTechnician}
                  onChange={e => setNewTechnician(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:ring-1 focus:ring-[#00236f]"
                >
                  {INITIAL_USERS.filter(u => u.role.includes('Técnico') || u.role.includes('Supervisor')).map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.specialty || u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* CONFIGURACIÓN DE CHECKLIST PERSONALIZABLE */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-1.5 uppercase">
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist a Considerar ({newChecklistItems.length} Puntos)</span>
                  </label>

                  {/* Plantillas de Checklist Rápidas */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#757682]">Plantilla:</span>
                    <button
                      type="button"
                      onClick={() => setNewChecklistItems([...CHECKLIST_PRESETS.general])}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      General
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChecklistItems([...CHECKLIST_PRESETS.hvac])}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      HVAC/Frío
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChecklistItems([...CHECKLIST_PRESETS.pos_cajas])}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      POS/Cajas
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChecklistItems([...CHECKLIST_PRESETS.balanzas])}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      Balanzas
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#757682]">
                  Modifica el texto de las variables o puntos que debe inspeccionar el técnico, o añade ítems nuevos.
                </p>

                {/* Lista de Puntos Editables */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {newChecklistItems.map((itemText, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-[#dce9ff]">
                      <span className="text-xs font-bold text-[#00236f] w-5 text-center">{i + 1}.</span>
                      <input
                        type="text"
                        value={itemText}
                        onChange={e => handleEditChecklistPoint(i, e.target.value)}
                        className="flex-1 text-xs text-[#0b1c30] bg-transparent focus:outline-none focus:bg-blue-50 px-1 py-0.5 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistPoint(i)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Eliminar este punto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Agregar Nuevo Punto */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escriba otra variable / tarea de checklist a añadir..."
                    value={newCustomItemText}
                    onChange={e => setNewCustomItemText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistPoint();
                      }
                    }}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-[#0b1c30] placeholder:text-[#757682] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistPoint}
                    className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a] transition-all shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* FOTOS DE EVIDENCIA INICIALES (OPCIONALES AL PROGRAMAR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-1.5">
                  <label className="text-xs font-bold text-[#00236f] block">
                    Foto Evidencia ANTES (Opcional)
                  </label>
                  {newEvidenceBefore ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#dce9ff]">
                      <img src={newEvidenceBefore} alt="Antes" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewEvidenceBefore('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileBeforeRef.current?.click()}
                      className="border border-dashed border-[#b4c8f0] p-2.5 rounded-lg text-center cursor-pointer bg-white hover:bg-[#eff4ff] text-xs text-[#00236f] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Subir Foto Antes</span>
                    </div>
                  )}
                  <input
                    ref={fileBeforeRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileUpload(e, setNewEvidenceBefore)}
                  />
                </div>

                <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-1.5">
                  <label className="text-xs font-bold text-[#00236f] block">
                    Foto Evidencia DESPUÉS (Opcional)
                  </label>
                  {newEvidenceAfter ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#dce9ff]">
                      <img src={newEvidenceAfter} alt="Después" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewEvidenceAfter('')}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileAfterRef.current?.click()}
                      className="border border-dashed border-[#b4c8f0] p-2.5 rounded-lg text-center cursor-pointer bg-white hover:bg-[#eff4ff] text-xs text-[#00236f] font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Subir Foto Después</span>
                    </div>
                  )}
                  <input
                    ref={fileAfterRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileUpload(e, setNewEvidenceAfter)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#dce9ff] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Programar Orden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Work Order Modal */}
      {showEditModal && editingWo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Modificar Orden de Trabajo {editingWo.code}
                </h3>
                <p className="text-xs text-[#757682]">
                  Actualiza los datos, prioridad, fecha o estado de la orden.
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[#757682] p-1 font-bold hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Equipo Asignado
                </label>
                <select
                  value={editingWo.equipmentId}
                  onChange={e => {
                    const eq = equipments.find(x => x.id === e.target.value);
                    if (eq) {
                      setEditingWo({
                        ...editingWo,
                        equipmentId: eq.id,
                        equipmentCode: eq.code,
                        equipmentName: eq.name,
                        storeId: eq.storeId,
                        storeName: eq.storeName
                      });
                    }
                  }}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                >
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} - {eq.name} ({eq.storeName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tipo de Mantenimiento
                  </label>
                  <select
                    value={editingWo.type}
                    onChange={e => setEditingWo({ ...editingWo, type: e.target.value as MaintenanceType })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="preventivo">Preventivo Programado</option>
                    <option value="correctivo">Correctivo por Avería</option>
                    <option value="calibracion">Calibración Metrológica</option>
                    <option value="inspeccion">Inspección de Rutina</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Estado de la OT
                  </label>
                  <select
                    value={editingWo.status}
                    onChange={e => setEditingWo({ ...editingWo, status: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Programado">Programado</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completado">Completado</option>
                    <option value="Pendiente Repuestos">Pendiente Repuestos</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Fecha Programada
                  </label>
                  <input
                    type="date"
                    value={editingWo.date || editingWo.scheduledDate || ''}
                    onChange={e => setEditingWo({ ...editingWo, date: e.target.value, scheduledDate: e.target.value })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Prioridad
                  </label>
                  <select
                    value={editingWo.priority}
                    onChange={e => setEditingWo({ ...editingWo, priority: e.target.value as 'Alta' | 'Media' | 'Baja' })}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Técnico Especialista
                </label>
                <select
                  value={editingWo.technician}
                  onChange={e => setEditingWo({ ...editingWo, technician: e.target.value })}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                >
                  {INITIAL_USERS.filter(u => u.role.includes('Técnico') || u.role.includes('Supervisor')).map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.specialty || u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#1e3a8a] flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={zoomImage} alt="Evidencia ampliada" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 text-xs font-bold"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
