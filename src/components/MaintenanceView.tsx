import React, { useState } from 'react';
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
  CheckSquare
} from 'lucide-react';
import { WorkOrder, Equipment, Store, MaintenanceType, MaintenanceFrequency, WorkOrderStatus } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface MaintenanceViewProps {
  workOrders: WorkOrder[];
  equipments: Equipment[];
  stores: Store[];
  onAddWorkOrder: (newWo: Partial<WorkOrder>) => void;
  onUpdateWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  workOrders,
  equipments,
  stores,
  onAddWorkOrder,
  onUpdateWorkOrderStatus,
}) => {
  const [selectedTab, setSelectedTab] = useState<'todas' | MaintenanceType>('todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | WorkOrderStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedWoDetail, setSelectedWoDetail] = useState<WorkOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New Work Order Form State
  const [newEquipmentId, setNewEquipmentId] = useState(equipments[0]?.id || '');
  const [newType, setNewType] = useState<MaintenanceType>('preventivo');
  const [newFrequency, setNewFrequency] = useState<MaintenanceFrequency>('semestral');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTechnician, setNewTechnician] = useState('Ing. Carlos Ramos');
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');

  const filteredOrders = workOrders.filter(wo => {
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
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEq = equipments.find(e => e.id === newEquipmentId) || equipments[0];
    const targetStore = stores.find(s => s.id === targetEq.storeId) || stores[0];
    const newCode = `OT-${Math.floor(1000 + Math.random() * 9000)}`;

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
      checklist: [
        { item: 'Inspección visual de integridad física y cableado', status: 'na' },
        { item: 'Medición de voltaje (L1-L2-L3) y amperaje de consumo', status: 'na' },
        { item: 'Limpieza de filtros, serpentines o ductos de ventilación', status: 'na' },
        { item: 'Prueba funcional de sensores y relés térmicos de seguridad', status: 'na' },
        { item: 'Ajuste de bornes eléctricos y pernos de soporte antivibratorio', status: 'na' },
        { item: 'Emisión de reporte técnico y firma de conformidad', status: 'na' }
      ]
    });

    setShowNewModal(false);
    alert(`✅ Orden de trabajo ${newCode} programada correctamente para ${targetStore.name}.`);
  };

  const handleToggleChecklistItem = (itemIndex: number, newStatus: 'ok' | 'observacion' | 'falla' | 'na') => {
    if (!selectedWoDetail || !selectedWoDetail.checklist) return;

    const updatedChecklist = [...selectedWoDetail.checklist];
    updatedChecklist[itemIndex] = {
      ...updatedChecklist[itemIndex],
      status: newStatus
    };

    const updatedWo = {
      ...selectedWoDetail,
      checklist: updatedChecklist
    };

    setSelectedWoDetail(updatedWo);
  };

  const calculateChecklistProgress = (wo: WorkOrder) => {
    if (!wo.checklist || wo.checklist.length === 0) return 100;
    const answered = wo.checklist.filter(c => c.status !== 'na').length;
    return Math.round((answered / wo.checklist.length) * 100);
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
            Listado tabular de órdenes de trabajo (OT) programadas, rutinas semestrales y calibraciones en las 90 tiendas.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
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

      {/* Main Tabular / List View */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                <th className="py-3 px-3.5 w-24">N° OT</th>
                <th className="py-3 px-3.5">TIPO</th>
                <th className="py-3 px-3.5">EQUIPO ASIGNADO</th>
                <th className="py-3 px-3.5">SUCURSAL / TIENDA</th>
                <th className="py-3 px-3.5">FECHA PROGRAMADA</th>
                <th className="py-3 px-3.5">TÉCNICO A CARGO</th>
                <th className="py-3 px-3.5 text-center">PRIORIDAD</th>
                <th className="py-3 px-3.5 text-center">CHECKLIST</th>
                <th className="py-3 px-3.5 text-center">ESTADO</th>
                <th className="py-3 px-3.5 text-center w-24">ACCIONES</th>
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

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => setSelectedWoDetail(wo)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                          {wo.code || wo.orderNumber}
                        </span>
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

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedWoDetail(wo)}
                          className="px-2.5 py-1 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded font-bold text-[11px] transition-colors"
                        >
                          Checklist
                        </button>
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

      {/* Interactive Checklist Inspection Drawer / Modal */}
      {selectedWoDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded">
                  {selectedWoDetail.code || selectedWoDetail.orderNumber}
                </span>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1">
                  Checklist Digital de Inspección & Ejecución
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedWoDetail.equipmentName} • {selectedWoDetail.storeName} ({selectedWoDetail.region})
                </p>
              </div>
              <button
                onClick={() => setSelectedWoDetail(null)}
                className="text-[#757682] p-1 font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Checklist Items Interactive Matrix */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682]">
                Puntos de Verificación en Campo:
              </h4>

              <div className="space-y-2">
                {selectedWoDetail.checklist?.map((chk, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-xs font-semibold text-[#0b1c30]">
                      {index + 1}. {chk.item}
                    </span>

                    {/* Radio state buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
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
            </div>

            {/* Status changer buttons */}
            <div className="pt-2 border-t border-[#e5eeff] flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#757682]">Marcar Estado:</span>
                {(['Programado', 'En Progreso', 'Completado'] as WorkOrderStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateWorkOrderStatus(selectedWoDetail.id, st);
                      setSelectedWoDetail({ ...selectedWoDetail, status: st });
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

              <button
                onClick={() => {
                  onUpdateWorkOrderStatus(selectedWoDetail.id, 'Completado');
                  setSelectedWoDetail(null);
                  alert(`Orden de trabajo ${selectedWoDetail.code} completada y validada.`);
                }}
                className="px-4 py-2 bg-[#10b981] text-white font-bold text-xs rounded-lg hover:bg-[#059669] shadow-xs"
              >
                Firmar & Completar OT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program New Work Order Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Programar Orden de Trabajo (OT)
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Seleccionar Equipo
                </label>
                <select
                  value={newEquipmentId}
                  onChange={e => setNewEquipmentId(e.target.value)}
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
                    value={newType}
                    onChange={e => setNewType(e.target.value as MaintenanceType)}
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
                    Frecuencia
                  </label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as MaintenanceFrequency)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Fecha de Ejecución
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as 'Alta' | 'Media' | 'Baja')}
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
                  Técnico Especialista Asignado
                </label>
                <select
                  value={newTechnician}
                  onChange={e => setNewTechnician(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                >
                  {INITIAL_USERS.filter(u => u.role.includes('Técnico') || u.role.includes('Supervisor')).map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.specialty})
                    </option>
                  ))}
                </select>
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
                  Programar y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
