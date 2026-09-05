import React, { useState } from 'react';
import {
  Headphones,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  MessageSquare,
  Send,
  SlidersHorizontal,
  Flame,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Paperclip,
  Eye
} from 'lucide-react';
import { Ticket, Equipment, Store, AppUser, TicketStatus, TicketPriority } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface HelpdeskViewProps {
  tickets: Ticket[];
  equipments: Equipment[];
  stores: Store[];
  currentUser: AppUser;
  onAddTicket: (newTicket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  onAssignTechnician: (ticketId: string, technician: string) => void;
}

export const HelpdeskView: React.FC<HelpdeskViewProps> = ({
  tickets,
  equipments,
  stores,
  currentUser,
  onAddTicket,
  onUpdateTicketStatus,
  onAssignTechnician,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('todas');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Comment state inside drawer
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);

  // Form states for new ticket
  const [formStoreId, setFormStoreId] = useState(stores[0]?.id || '');
  const [formEquipmentId, setFormEquipmentId] = useState(equipments[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<TicketPriority>('Alta');

  const filteredTickets = tickets.filter(t => {
    const matchesStatus =
      selectedStatusFilter === 'todos' ||
      (selectedStatusFilter === 'abiertos' && ['Abierto', 'abierto', 'Asignado', 'En Progreso', 'en_progreso'].includes(t.status)) ||
      (selectedStatusFilter === 'resueltos' && ['Resuelto', 'resuelto', 'Cerrado', 'cerrado'].includes(t.status)) ||
      t.status.toLowerCase() === selectedStatusFilter.toLowerCase();

    const matchesPriority =
      selectedPriorityFilter === 'todas' ||
      t.priority.toLowerCase() === selectedPriorityFilter.toLowerCase();

    const matchesStore =
      selectedStoreFilter === '' || t.storeId === selectedStoreFilter;

    const query = searchQuery.toLowerCase();
    const tickNum = t.ticketNumber || t.code || '';
    const matchesSearch =
      tickNum.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query) ||
      (t.equipmentName && t.equipmentName.toLowerCase().includes(query)) ||
      t.storeName.toLowerCase().includes(query) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(query));

    return matchesStatus && matchesPriority && matchesStore && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === formStoreId) || stores[0];
    const eq = equipments.find(e => e.id === formEquipmentId) || equipments[0];
    const tickNum = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: Ticket = {
      id: `tick-${Date.now()}`,
      ticketNumber: tickNum,
      code: tickNum,
      title: formTitle,
      description: formDescription,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.code,
      storeId: st.id,
      storeName: st.name,
      storeCode: st.code,
      region: st.region,
      reportedBy: currentUser.name,
      assignedTo: 'Ing. Carlos Ramos',
      priority: formPriority,
      status: 'Abierto',
      createdAt: 'Hace un momento',
      slaDueIn: formPriority === 'Crítica' || formPriority === 'critica' ? '2 horas' : '12 horas',
      commentsCount: 1,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatarUrl,
          text: `Ticket generado por ${currentUser.name}: ${formDescription}`,
          timestamp: 'Justo ahora',
          isInternal: false
        }
      ]
    };

    onAddTicket(newTicket);
    setShowNewModal(false);
    setSelectedTicket(newTicket);
    setFormTitle('');
    setFormDescription('');
    alert(`🎫 Ticket de soporte ${tickNum} creado exitosamente y asignado con notificación push.`);
  };

  const handleAddCommentToSelected = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTicket) return;

    const newCommentObj = {
      id: `comm-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatarUrl,
      text: newCommentText,
      timestamp: 'Ahora mismo',
      isInternal: isInternalNote
    };

    const updatedTicket: Ticket = {
      ...selectedTicket,
      comments: [...(selectedTicket.comments || []), newCommentObj],
      commentsCount: (selectedTicket.commentsCount || 0) + 1
    };

    setSelectedTicket(updatedTicket);
    setNewCommentText('');
  };

  const availableTechnicians = INITIAL_USERS.filter(
    u => u.role === 'Técnico Especialista' || u.role === 'Supervisor Regional'
  );

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Helpdesk & Mesa de Ayuda Técnica
          </h2>
          <p className="text-xs sm:text-sm text-[#757682] max-w-2xl mt-0.5">
            Control de incidentes, averías operativas y asignación de técnicos de soporte para las 90 tiendas.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="bg-[#00236f] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 shrink-0 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Ticket de Incidente</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por N° ticket, asunto, tienda o técnico..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={e => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="abiertos">Abiertos y en Proceso</option>
              <option value="abierto">Abierto (Sin iniciar)</option>
              <option value="asignado">Asignado a Técnico</option>
              <option value="en progreso">En Progreso</option>
              <option value="resueltos">Resueltos / Cerrados</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriorityFilter}
              onChange={e => {
                setSelectedPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todas">Todas las Prioridades</option>
              <option value="crítica">Crítica (SLA 2 hrs)</option>
              <option value="alta">Alta (SLA 6 hrs)</option>
              <option value="media">Media (SLA 24 hrs)</option>
              <option value="baja">Baja (SLA 48 hrs)</option>
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
                <th className="py-3 px-3.5 w-24">TICKET N°</th>
                <th className="py-3 px-3.5">TIENDA / SEDE</th>
                <th className="py-3 px-3.5">EQUIPO ASOCIADO</th>
                <th className="py-3 px-3.5">ASUNTO / FALLA REPORTADA</th>
                <th className="py-3 px-3.5 text-center">PRIORIDAD</th>
                <th className="py-3 px-3.5">SLA / TIEMPO</th>
                <th className="py-3 px-3.5">TÉCNICO RESPONSABLE</th>
                <th className="py-3 px-3.5 text-center">ESTADO</th>
                <th className="py-3 px-3.5 text-center w-24">DETALLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#757682]">
                    No hay tickets que coincidan con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t, idx) => {
                  const isCrit = t.priority === 'Crítica' || t.priority === 'critica';
                  const isAlta = t.priority === 'Alta' || t.priority === 'alta';
                  const isResuelto = ['Resuelto', 'resuelto', 'Cerrado', 'cerrado'].includes(t.status);
                  const isEnProgreso = ['En Progreso', 'en_progreso', 'Asignado'].includes(t.status);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-mono font-bold text-[#00236f] whitespace-nowrap">
                        <span className="bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                          {t.ticketNumber || t.code}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#0b1c30]">{t.storeName}</div>
                        <div className="text-[11px] text-[#757682]">{t.region}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#00236f]">{t.equipmentName || 'Activo General'}</div>
                        <div className="text-[10px] font-mono text-[#757682]">{t.equipmentCode}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-medium text-[#0b1c30] line-clamp-1">{t.title}</div>
                        <div className="text-[11px] text-[#757682] line-clamp-1">{t.description}</div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                            isCrit
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : isAlta
                              ? 'bg-[#fff3e0] text-[#fd761a]'
                              : 'bg-[#e8f5e9] text-[#10b981]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[#757682]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00236f]" />
                          <span>{t.slaDueIn || '4 horas'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#00236f]" />
                          <span>{t.assignedTo || 'Sin asignar'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isResuelto
                              ? 'bg-[#e8f5e9] text-[#10b981]'
                              : isEnProgreso
                              ? 'bg-[#eff4ff] text-[#00236f]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isResuelto ? 'bg-[#10b981]' : isEnProgreso ? 'bg-[#00236f]' : 'bg-[#ba1a1a]'
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-2.5 py-1 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded font-bold text-[11px] transition-colors"
                        >
                          Gestionar
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
            Mostrando <strong>{paginatedTickets.length}</strong> de <strong>{filteredTickets.length}</strong> incidentes
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

      {/* Ticket Detailed Management Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 border border-[#e5eeff]">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#eff4ff] text-[#00236f] px-2.5 py-0.5 rounded">
                    {selectedTicket.ticketNumber || selectedTicket.code}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedTicket.priority === 'Crítica' || selectedTicket.priority === 'critica'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#fff3e0] text-[#fd761a]'
                    }`}
                  >
                    Prioridad {selectedTicket.priority}
                  </span>
                  <span className="text-xs text-[#757682]">{selectedTicket.createdAt || 'Hoy'}</span>
                </div>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1.5">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedTicket.storeName} ({selectedTicket.region}) • {selectedTicket.equipmentName} ({selectedTicket.equipmentCode})
                </p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[#757682] p-1 font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Bar & Actions */}
            <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#757682] uppercase">Cambiar Estado:</span>
                {(['Abierto', 'Asignado', 'En Progreso', 'Resuelto', 'Cerrado'] as TicketStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateTicketStatus(selectedTicket.id, st);
                      setSelectedTicket({ ...selectedTicket, status: st });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      selectedTicket.status === st
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#444651] border border-[#dce9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Technician Reassignment */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#757682] uppercase">Asignar A:</span>
                <select
                  value={selectedTicket.assignedTo || ''}
                  onChange={e => {
                    onAssignTechnician(selectedTicket.id, e.target.value);
                    setSelectedTicket({ ...selectedTicket, assignedTo: e.target.value, status: 'Asignado' });
                  }}
                  className="p-1.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-semibold text-[#00236f]"
                >
                  {availableTechnicians.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.specialty?.substring(0, 20)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Problem Description Box */}
            <div className="p-3.5 bg-[#fffdfa] border border-[#ffe0b2] rounded-xl text-xs space-y-1">
              <h4 className="font-bold text-[#b45309] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Descripción del Problema por Tienda:
              </h4>
              <p className="text-[#333] leading-relaxed">{selectedTicket.description}</p>
            </div>

            {/* Comments & Activity Timeline */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#00236f]" />
                Bitácora de Intervenciones & Conversación
              </h4>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {(selectedTicket.comments && selectedTicket.comments.length > 0) ? (
                  selectedTicket.comments.map(c => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs ${
                        c.isInternal
                          ? 'bg-[#fff8e1] border-[#ffe082]'
                          : 'bg-[#f8f9ff] border-[#e5eeff]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0b1c30]">{c.author}</span>
                          {c.isInternal && (
                            <span className="text-[9px] bg-[#f57f17] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                              Nota Interna
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#757682]">{c.timestamp}</span>
                      </div>
                      <p className="text-[#444651]">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-[#f8f9ff] rounded-xl text-center text-xs text-[#757682]">
                    Sin comentarios registrados aún. Escriba el primer mensaje abajo.
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddCommentToSelected} className="space-y-2 pt-2 border-t border-[#f0f4ff]">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Escriba un reporte o actualización de estado..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:outline-none focus:border-[#00236f]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00236f] text-white font-bold text-xs rounded-lg hover:bg-[#1e3a8a] flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-[#757682] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={e => setIsInternalNote(e.target.checked)}
                    className="rounded text-[#00236f]"
                  />
                  <span>Marcar como nota interna técnica (Solo visible para ingenieros)</span>
                </label>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-lg hover:bg-[#dce9ff]"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                Registrar Nuevo Ticket de Avería
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Tienda de Origen (90)
                  </label>
                  <select
                    value={formStoreId}
                    onChange={e => setFormStoreId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                    Equipo Afectado
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={e => setFormEquipmentId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  >
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name.substring(0, 22)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Asunto / Título del Incidente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Falla en compresor principal / Balanza descalibrada"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Nivel de Prioridad
                </label>
                <select
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value as TicketPriority)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-bold"
                >
                  <option value="Crítica">Crítica (SLA 2 horas - Parada Operativa)</option>
                  <option value="Alta">Alta (SLA 6 horas)</option>
                  <option value="Media">Media (SLA 24 horas)</option>
                  <option value="Baja">Baja (SLA 48 horas)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#757682] uppercase mb-1 block">
                  Detalle y Síntomas Observados
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describa ruidos anormales, códigos de error o comportamiento observado..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:border-[#00236f] focus:outline-none"
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
                  Crear y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
