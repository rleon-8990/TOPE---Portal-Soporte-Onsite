import React, { useState, useMemo } from 'react';
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
  Eye,
  Download,
  FileSpreadsheet,
  Package,
  DollarSign,
  Receipt,
  FileText,
  Building,
  Phone,
  Calendar,
  Layers,
  CheckCircle,
  Clock4,
  ExternalLink,
  Tag
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
  // Tab view modes:
  // 'planilla': Vista Planilla Onsite Completa con todas las columnas de la foto del usuario
  // 'repuestos_sap': Vista focalizada en Repuestos, Cotizaciones, Precios, Solped, O/C, HES y Presupuestos
  // 'gestion': Vista compacta de mesa de ayuda y SLA
  const [subView, setSubView] = useState<'planilla' | 'repuestos_sap' | 'gestion'>('planilla');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('todos');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('todos');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Comment state inside drawer
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(false);

  // Form states for new ticket
  const [formStoreId, setFormStoreId] = useState(stores[0]?.id || '');
  const [formEquipmentId, setFormEquipmentId] = useState(equipments[0]?.id || '');
  const [formTicketJR, setFormTicketJR] = useState('');
  const [formProveedor, setFormProveedor] = useState('DMS PERU S.A.C');
  const [formTicketProveedor, setFormTicketProveedor] = useState('');
  const [formTipoEquipo, setFormTipoEquipo] = useState('Terminal Móvil');
  const [formMarca, setFormMarca] = useState('ZEBRA');
  const [formModelo, setFormModelo] = useState('TC26');
  const [formSerie, setFormSerie] = useState('');
  const [formDetalle, setFormDetalle] = useState('');
  const [formContacto, setFormContacto] = useState(currentUser.name);
  const [formCelular, setFormCelular] = useState('51 992 797 523');
  const [formObservaciones, setFormObservaciones] = useState('Mantenimiento');
  const [formPriority, setFormPriority] = useState<TicketPriority>('Alta');
  // Repuestos & SAP
  const [formPartNumber, setFormPartNumber] = useState('');
  const [formDescPartNumber, setFormDescPartNumber] = useState('');
  const [formCotizacion, setFormCotizacion] = useState('');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formSolped, setFormSolped] = useState('');
  const [formOC, setFormOC] = useState('');
  const [formHES, setFormHES] = useState('');
  const [formPresupuestoMes, setFormPresupuestoMes] = useState('Enero 2026');

  // Available unique providers
  const providersList = useMemo(() => {
    const s = new Set<string>();
    tickets.forEach(t => {
      if (t.proveedorServicio) s.add(t.proveedorServicio);
    });
    return Array.from(s);
  }, [tickets]);

  // Available unique budget months
  const monthsList = useMemo(() => {
    const s = new Set<string>();
    tickets.forEach(t => {
      if (t.presupuestoMes) s.add(t.presupuestoMes);
    });
    return Array.from(s);
  }, [tickets]);

  // Metrics summary
  const metrics = useMemo(() => {
    let totalCosto = 0;
    let conRepuesto = 0;
    let conSAP = 0;
    let atendidos = 0;
    let pendientes = 0;

    tickets.forEach(t => {
      if (t.precio) totalCosto += Number(t.precio);
      if (t.partNumberRepuesto || t.descripcionPartNumber) conRepuesto++;
      if (t.solped || t.ordenCompra || t.hes) conSAP++;
      const st = (t.estadoTicket || t.status || '').toLowerCase();
      if (st.includes('atendido') || st.includes('resuelto') || st.includes('cerrado')) atendidos++;
      else pendientes++;
    });

    return { totalCosto, conRepuesto, conSAP, atendidos, pendientes, total: tickets.length };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const statusStr = (t.estadoTicket || t.status || '').toLowerCase();
      const matchesStatus =
        selectedStatusFilter === 'todos' ||
        (selectedStatusFilter === 'atendido' && (statusStr.includes('atendido') || statusStr.includes('resuelto') || statusStr.includes('cerrado'))) ||
        (selectedStatusFilter === 'pendiente' && (statusStr.includes('pendiente') || statusStr.includes('proceso') || statusStr.includes('abierto') || statusStr.includes('espera')));

      const matchesProvider =
        selectedProviderFilter === 'todos' ||
        t.proveedorServicio === selectedProviderFilter;

      const matchesMonth =
        selectedMonthFilter === 'todos' ||
        t.presupuestoMes === selectedMonthFilter;

      const matchesStore =
        selectedStoreFilter === '' ||
        t.storeId === selectedStoreFilter ||
        (t.tiendaNombre && t.tiendaNombre.toLowerCase().includes(selectedStoreFilter.toLowerCase()));

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesStatus && matchesProvider && matchesMonth && matchesStore;

      const hay = [
        t.ticketJR,
        t.code,
        t.ticketNumber,
        t.proveedorServicio,
        t.ticketProveedor,
        t.tiendaNombre,
        t.storeName,
        t.cecoSap,
        t.idEquipo,
        t.ipAddress,
        t.tipoEquipo,
        t.marca,
        t.modelo,
        t.numeroSerie,
        t.detalleTicket,
        t.contacto,
        t.partNumberRepuesto,
        t.descripcionPartNumber,
        t.cotizacion,
        t.solped,
        t.ordenCompra,
        t.hes,
        t.presupuestoMes,
        t.observaciones,
        t.creadoPor
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && matchesProvider && matchesMonth && matchesStore && hay.includes(query);
    });
  }, [tickets, selectedStatusFilter, selectedProviderFilter, selectedMonthFilter, selectedStoreFilter, searchQuery]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const headers = [
      'TICKET JR',
      'PROVEEDOR',
      'TICKET PROVEEDOR',
      'FECHA INICIO',
      'COD',
      'TIENDA',
      'CECO SAP',
      'ID EQUIPO',
      'IP',
      'EQUIPO',
      'MARCA',
      'MODELO',
      'N° SERIE',
      'DETALLE DE TICKET',
      'CONTACTO',
      'CELULAR',
      'ESTADO TICKET',
      'DIRECCIÓN FISCAL',
      'FECHA CIERRE',
      'OBSERVACIONES',
      'Creado por',
      'pdf?',
      'Part Number',
      'Descripción Part Number',
      'Cotización',
      'Precio ($)',
      'Solped',
      'Orden de Compra',
      'HES',
      'Presupuesto Mes'
    ];

    const rows = filteredTickets.map(t => [
      `"${t.ticketJR || t.code || t.ticketNumber || ''}"`,
      `"${t.proveedorServicio || 'DMS PERU S.A.C'}"`,
      `"${t.ticketProveedor || ''}"`,
      `"${t.fechaInicio || t.createdAt || ''}"`,
      `"${t.codTiendaNum || t.storeCode || ''}"`,
      `"${t.tiendaNombre || t.storeName || ''}"`,
      `"${t.cecoSap || ''}"`,
      `"${t.idEquipo || 'No Aplica'}"`,
      `"${t.ipAddress || ''}"`,
      `"${t.tipoEquipo || t.equipmentName || ''}"`,
      `"${t.marca || ''}"`,
      `"${t.modelo || ''}"`,
      `"${t.numeroSerie || ''}"`,
      `"${(t.detalleTicket || t.title || '').replace(/"/g, '""')}"`,
      `"${t.contacto || t.reportedBy || ''}"`,
      `"${t.celular || ''}"`,
      `"${t.estadoTicket || t.status || ''}"`,
      `"${(t.direccionFiscal || '').replace(/"/g, '""')}"`,
      `"${t.fechaCierre || ''}"`,
      `"${(t.observaciones || '').replace(/"/g, '""')}"`,
      `"${t.creadoPor || t.assignedTo || ''}"`,
      `"${t.tienePdf || 'SI'}"`,
      `"${t.partNumberRepuesto || ''}"`,
      `"${(t.descripcionPartNumber || '').replace(/"/g, '""')}"`,
      `"${t.cotizacion || ''}"`,
      `"${t.precio || ''}"`,
      `"${t.solped || ''}"`,
      `"${t.ordenCompra || ''}"`,
      `"${t.hes || ''}"`,
      `"${t.presupuestoMes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TOTTUS_HELPDESK_REPUESTOS_PRESUPUESTOS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stores.find(s => s.id === formStoreId) || stores[0];
    const eq = equipments.find(e => e.id === formEquipmentId) || equipments[0];
    const generatedJR = formTicketJR.trim() || `OCR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTicket: Ticket = {
      id: `tick-${Date.now()}`,
      ticketNumber: generatedJR,
      code: generatedJR,
      ticketJR: generatedJR,
      proveedorServicio: formProveedor,
      ticketProveedor: formTicketProveedor || `${Math.floor(98000 + Math.random() * 1000)}`,
      fechaInicio: new Date().toLocaleDateString('es-PE'),
      codTiendaNum: st.code.replace(/\D/g, '') || '101',
      tiendaNombre: st.name,
      cecoSap: eq.centroCostos || 'P009100101',
      idEquipo: 'No Aplica',
      ipAddress: eq.ipAddress || '',
      tipoEquipo: formTipoEquipo,
      marca: formMarca,
      modelo: formModelo,
      numeroSerie: formSerie || eq.serialNumber || 'SN-PENDIENTE',
      detalleTicket: formDetalle,
      contacto: formContacto,
      celular: formCelular,
      estadoTicket: 'Atendido',
      direccionFiscal: eq.direccionFiscal || 'Tomas Marsano con Av. Angamos',
      fechaCierre: '',
      observaciones: formObservaciones,
      creadoPor: currentUser.name,
      tienePdf: 'SI',

      // Repuestos & Presupuestos
      partNumberRepuesto: formPartNumber,
      descripcionPartNumber: formDescPartNumber,
      cotizacion: formCotizacion,
      precio: formPrecio ? Number(formPrecio) : undefined,
      solped: formSolped,
      ordenCompra: formOC,
      hes: formHES,
      presupuestoMes: formPresupuestoMes,

      title: `${formTipoEquipo} ${formModelo} - ${formDetalle}`,
      description: formDetalle,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.code,
      storeId: st.id,
      storeName: st.name,
      storeCode: st.code,
      region: st.region,
      reportedBy: formContacto,
      assignedTo: 'Roger Leon Apolinario',
      priority: formPriority,
      status: 'Resuelto',
      createdAt: 'Hace un momento',
      slaDueIn: '4 horas',
      commentsCount: 1,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          avatar: currentUser.avatarUrl,
          text: `Ticket generado en Planilla Oficial por ${currentUser.name}: ${formDetalle}`,
          timestamp: 'Justo ahora',
          isInternal: false
        }
      ]
    };

    onAddTicket(newTicket);
    setShowNewModal(false);
    setSelectedTicket(newTicket);
    setFormTicketJR('');
    setFormDetalle('');
    setFormSerie('');
    setFormPartNumber('');
    setFormDescPartNumber('');
    setFormCotizacion('');
    setFormPrecio('');
    setFormSolped('');
    setFormOC('');
    setFormHES('');
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
    <div className="w-full space-y-4 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-[#dce9ff] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#007a33] text-white tracking-wide uppercase">
              Tottus Onsite • Planilla Oficial
            </span>
            <span className="text-xs text-[#757682]">
              Sistemas de la Información · Helpdesk, Repuestos y Presupuestos
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0b1c30] tracking-tight">
            Helpdesk, Repuestos & Presupuestos
          </h2>
          <p className="text-xs sm:text-sm text-[#444651] max-w-3xl">
            Control consolidado con las <strong>30 columnas oficiales</strong> de la planilla corporativa: tickets de soporte JR/Proveedor, activos (Zebra, NCR, Motorola), repuestos con Part Number, cotizaciones, importes y trazabilidad SAP (Solped, O/C, HES).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Exportar archivo CSV con las 30 columnas oficiales de la planilla"
          >
            <Download className="w-4 h-4 text-[#00236f]" />
            <span>Exportar CSV (30 Col.)</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="bg-[#00236f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#00236f]/20 hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Ticket / Repuesto</span>
          </button>
        </div>
      </div>

      {/* Corporate KPIs / Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Total Tickets</span>
            <Headphones className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#0b1c30]">{metrics.total}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">En registro onsite</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Atendidos</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#007a33]" />
          </div>
          <div className="text-xl font-black text-[#007a33]">{metrics.atendidos}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">Cierre / entregado</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Pendientes</span>
            <Clock4 className="w-3.5 h-3.5 text-[#fd761a]" />
          </div>
          <div className="text-xl font-black text-[#fd761a]">{metrics.pendientes}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">En reparación / prov.</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Con Repuestos</span>
            <Package className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#00236f]">{metrics.conRepuesto}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">Part Number asignado</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Trazabilidad SAP</span>
            <Receipt className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#00236f]">{metrics.conSAP}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">Solped / OC / HES</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Presupuesto Total</span>
            <DollarSign className="w-3.5 h-3.5 text-[#007a33]" />
          </div>
          <div className="text-xl font-black text-[#007a33]">
            ${metrics.totalCosto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#757682] mt-0.5">Cotizaciones aprobadas</div>
        </div>
      </div>

      {/* Sub-view Switcher & Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        {/* Selector de Modo de Visualización */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f4ff] pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] w-fit">
            <button
              onClick={() => setSubView('planilla')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subView === 'planilla'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-[#444651] hover:text-[#00236f] hover:bg-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Planilla Completa (Todas las Columnas)</span>
            </button>

            <button
              onClick={() => setSubView('repuestos_sap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subView === 'repuestos_sap'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-[#444651] hover:text-[#00236f] hover:bg-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Repuestos & Presupuestos (SAP)</span>
            </button>

            <button
              onClick={() => setSubView('gestion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subView === 'gestion'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'text-[#444651] hover:text-[#00236f] hover:bg-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Gestión Rápida Helpdesk</span>
            </button>
          </div>

          <span className="text-xs text-[#757682]">
            Mostrando <strong>{filteredTickets.length}</strong> registros encontrados
          </span>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por Ticket JR, Proveedor, Serie, Part Number, Solped, Tienda..."
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
              <option value="todos">Todos los Estados (Ticket)</option>
              <option value="atendido">Atendido / Resuelto</option>
              <option value="pendiente">Pendiente Reparación</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <select
              value={selectedProviderFilter}
              onChange={e => {
                setSelectedProviderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Proveedores</option>
              {providersList.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Month Filter */}
          <div>
            <select
              value={selectedMonthFilter}
              onChange={e => {
                setSelectedMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="todos">Todos los Presupuestos Mes</option>
              {monthsList.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tabular View with 100% full width and scroll */}
      <div className="w-full bg-white rounded-2xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          {/* VISTA 1: PLANILLA COMPLETA CON LAS COLUMNAS EXACTAS DE LA IMAGEN */}
          {subView === 'planilla' && (
            <table className="w-full text-left text-xs border-collapse min-w-[2400px]">
              <thead>
                <tr className="bg-[#5c246f] text-white font-bold border-b border-[#471856] text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 sticky left-0 z-20 bg-[#5c246f] shadow-r min-w-[120px]">TICKET JR</th>
                  <th className="py-2.5 px-3 min-w-[150px]">PROVEEDOR</th>
                  <th className="py-2.5 px-3 min-w-[110px]">TICKET PROVEEDOR</th>
                  <th className="py-2.5 px-3 min-w-[100px]">FECHA INICIO</th>
                  <th className="py-2.5 px-2.5 text-center min-w-[60px]">COD</th>
                  <th className="py-2.5 px-3 min-w-[140px]">TIENDA</th>
                  <th className="py-2.5 px-3 min-w-[110px]">CECO SAP</th>
                  <th className="py-2.5 px-3 min-w-[100px]">ID EQUIPO</th>
                  <th className="py-2.5 px-3 min-w-[110px]">IP</th>
                  <th className="py-2.5 px-3 min-w-[150px]">EQUIPO</th>
                  <th className="py-2.5 px-3 min-w-[100px]">MARCA</th>
                  <th className="py-2.5 px-3 min-w-[100px]">MODELO</th>
                  <th className="py-2.5 px-3 min-w-[130px]">N° SERIE</th>
                  <th className="py-2.5 px-3 min-w-[200px]">DETALLE DE TICKET</th>
                  <th className="py-2.5 px-3 min-w-[120px]">CONTACTO</th>
                  <th className="py-2.5 px-3 min-w-[120px]">CELULAR</th>
                  <th className="py-2.5 px-3 text-center min-w-[140px]">ESTADO TICKET</th>
                  <th className="py-2.5 px-3 min-w-[220px]">DIRECCIÓN FISCAL</th>
                  <th className="py-2.5 px-3 min-w-[130px]">FECHA CIERRE</th>
                  <th className="py-2.5 px-3 min-w-[150px]">OBSERVACIONES</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Creado por</th>
                  <th className="py-2.5 px-2.5 text-center min-w-[60px]">pdf?</th>
                  {/* Bloque Repuestos y Presupuestos */}
                  <th className="py-2.5 px-3 bg-[#4a1859] min-w-[130px]">Part Number</th>
                  <th className="py-2.5 px-3 bg-[#4a1859] min-w-[240px]">Descripción Part Number</th>
                  <th className="py-2.5 px-3 bg-[#4a1859] min-w-[120px]">Cotización</th>
                  <th className="py-2.5 px-3 bg-[#4a1859] text-right min-w-[90px]">Precio ($)</th>
                  <th className="py-2.5 px-3 bg-[#3c1348] min-w-[110px]">Solped</th>
                  <th className="py-2.5 px-3 bg-[#3c1348] min-w-[110px]">Orden de Compra</th>
                  <th className="py-2.5 px-3 bg-[#3c1348] min-w-[110px]">HES</th>
                  <th className="py-2.5 px-3 bg-[#3c1348] min-w-[120px]">Presupuesto Mes</th>
                  <th className="py-2.5 px-3 text-center min-w-[90px] sticky right-0 z-20 bg-[#5c246f]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff] font-mono text-[11px]">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={31} className="py-12 text-center text-[#757682] font-sans">
                      No hay tickets que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t, idx) => {
                    const isAtendido = (t.estadoTicket || t.status || '').toLowerCase().includes('atendido') ||
                                       (t.estadoTicket || t.status || '').toLowerCase().includes('resuelto');
                    const hasSAP = Boolean(t.solped || t.ordenCompra || t.hes);

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#fcfdfe]'
                        }`}
                      >
                        {/* TICKET JR */}
                        <td className="py-2.5 px-3 font-bold text-[#b41a7c] sticky left-0 z-10 bg-inherit shadow-r whitespace-nowrap">
                          {t.ticketJR || t.code || t.ticketNumber}
                        </td>

                        {/* PROVEEDOR */}
                        <td className="py-2.5 px-3 text-[#0b1c30] whitespace-nowrap font-sans font-semibold">
                          {t.proveedorServicio || 'DMS PERU S.A.C'}
                        </td>

                        {/* TICKET PROVEEDOR */}
                        <td className="py-2.5 px-3 text-[#00236f] whitespace-nowrap">
                          {t.ticketProveedor || '-'}
                        </td>

                        {/* FECHA INICIO */}
                        <td className="py-2.5 px-3 text-[#444651] whitespace-nowrap">
                          {t.fechaInicio || t.createdAt || '2/01/2026'}
                        </td>

                        {/* COD */}
                        <td className="py-2.5 px-2.5 text-center font-bold text-[#0b1c30]">
                          {t.codTiendaNum || t.storeCode?.replace(/\D/g, '') || '-'}
                        </td>

                        {/* TIENDA */}
                        <td className="py-2.5 px-3 font-sans font-bold text-[#0b1c30] whitespace-nowrap">
                          {t.tiendaNombre || t.storeName}
                        </td>

                        {/* CECO SAP */}
                        <td className="py-2.5 px-3 text-[#00236f] whitespace-nowrap">
                          {t.cecoSap || 'P009100101'}
                        </td>

                        {/* ID EQUIPO */}
                        <td className="py-2.5 px-3 text-[#757682] whitespace-nowrap">
                          {t.idEquipo || 'No Aplica'}
                        </td>

                        {/* IP */}
                        <td className="py-2.5 px-3 text-[#444651] whitespace-nowrap">
                          {t.ipAddress || '-'}
                        </td>

                        {/* EQUIPO */}
                        <td className="py-2.5 px-3 font-sans font-medium text-[#0b1c30] whitespace-nowrap">
                          {t.tipoEquipo || t.equipmentName || 'Terminal Móvil'}
                        </td>

                        {/* MARCA */}
                        <td className="py-2.5 px-3 text-[#0b1c30] whitespace-nowrap font-bold">
                          {t.marca || 'ZEBRA'}
                        </td>

                        {/* MODELO */}
                        <td className="py-2.5 px-3 text-[#444651] whitespace-nowrap">
                          {t.modelo || '-'}
                        </td>

                        {/* N° SERIE */}
                        <td className="py-2.5 px-3 text-[#00236f] whitespace-nowrap font-semibold">
                          {t.numeroSerie || '-'}
                        </td>

                        {/* DETALLE DE TICKET */}
                        <td className="py-2.5 px-3 font-sans text-[#444651] max-w-xs truncate" title={t.detalleTicket || t.title}>
                          {t.detalleTicket || t.title}
                        </td>

                        {/* CONTACTO */}
                        <td className="py-2.5 px-3 font-sans text-[#0b1c30] whitespace-nowrap">
                          {t.contacto || t.reportedBy}
                        </td>

                        {/* CELULAR */}
                        <td className="py-2.5 px-3 text-[#757682] whitespace-nowrap">
                          {t.celular || '-'}
                        </td>

                        {/* ESTADO TICKET */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAtendido
                                ? 'bg-[#dcfce7] text-[#007a33]'
                                : 'bg-[#ffdad6] text-[#ba1a1a]'
                            }`}
                          >
                            {t.estadoTicket || (isAtendido ? 'Atendido' : 'Pendiente Reparación')}
                          </span>
                        </td>

                        {/* DIRECCIÓN FISCAL */}
                        <td className="py-2.5 px-3 font-sans text-[#757682] max-w-xs truncate" title={t.direccionFiscal}>
                          {t.direccionFiscal || '-'}
                        </td>

                        {/* FECHA CIERRE */}
                        <td className="py-2.5 px-3 text-[#444651] whitespace-nowrap">
                          {t.fechaCierre || '-'}
                        </td>

                        {/* OBSERVACIONES */}
                        <td className="py-2.5 px-3 font-sans text-[#444651] whitespace-nowrap">
                          {t.observaciones || 'Mantenimiento'}
                        </td>

                        {/* Creado por */}
                        <td className="py-2.5 px-3 font-sans text-[#0b1c30] whitespace-nowrap">
                          {t.creadoPor || t.assignedTo || 'Roger Leon Apolinario'}
                        </td>

                        {/* pdf? */}
                        <td className="py-2.5 px-2.5 text-center font-bold text-[#007a33]">
                          {t.tienePdf || 'SI'}
                        </td>

                        {/* Part Number */}
                        <td className="py-2.5 px-3 font-bold text-[#00236f] bg-[#faf5ff] whitespace-nowrap">
                          {t.partNumberRepuesto || '-'}
                        </td>

                        {/* Descripción Part Number */}
                        <td className="py-2.5 px-3 font-sans text-[#444651] bg-[#faf5ff] max-w-xs truncate" title={t.descripcionPartNumber}>
                          {t.descripcionPartNumber || '-'}
                        </td>

                        {/* Cotización */}
                        <td className="py-2.5 px-3 text-[#757682] bg-[#faf5ff] whitespace-nowrap">
                          {t.cotizacion || '-'}
                        </td>

                        {/* Precio */}
                        <td className="py-2.5 px-3 text-right font-bold text-[#007a33] bg-[#faf5ff] whitespace-nowrap">
                          {t.precio !== undefined && t.precio !== null ? `$${t.precio}` : '-'}
                        </td>

                        {/* Solped */}
                        <td className={`py-2.5 px-3 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'bg-[#fffbeb] text-[#757682]'}`}>
                          {t.solped || '-'}
                        </td>

                        {/* Orden de Compra */}
                        <td className={`py-2.5 px-3 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'bg-[#fffbeb] text-[#757682]'}`}>
                          {t.ordenCompra || '-'}
                        </td>

                        {/* HES */}
                        <td className={`py-2.5 px-3 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'bg-[#fffbeb] text-[#757682]'}`}>
                          {t.hes || '-'}
                        </td>

                        {/* Presupuesto Mes */}
                        <td className="py-2.5 px-3 font-sans font-semibold text-[#0b1c30] bg-[#fffbeb] whitespace-nowrap">
                          {t.presupuestoMes || '-'}
                        </td>

                        {/* Acción */}
                        <td className="py-2.5 px-3 text-center sticky right-0 z-10 bg-inherit shadow-l whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="px-2.5 py-1 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded font-bold text-[10px] transition-colors"
                          >
                            Ver Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* VISTA 2: REPUESTOS & PRESUPUESTOS (ENFOQUE DE COSTOS Y SAP) */}
          {subView === 'repuestos_sap' && (
            <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-[#00236f] text-white font-bold border-b border-[#00174a] text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">TICKET JR / COD</th>
                  <th className="py-3 px-3.5">TIENDA & CECO</th>
                  <th className="py-3 px-3.5">EQUIPO & SERIE</th>
                  <th className="py-3 px-3.5">PART NUMBER REPUESTO</th>
                  <th className="py-3 px-3.5">DESCRIPCIÓN DEL REPUESTO</th>
                  <th className="py-3 px-3.5">COTIZACIÓN N°</th>
                  <th className="py-3 px-3.5 text-right">PRECIO ($)</th>
                  <th className="py-3 px-3.5 bg-[#001b57]">SOLPED</th>
                  <th className="py-3 px-3.5 bg-[#001b57]">ORDEN DE COMPRA</th>
                  <th className="py-3 px-3.5 bg-[#001b57]">HES SAP</th>
                  <th className="py-3 px-3.5 bg-[#001b57]">PRESUPUESTO MES</th>
                  <th className="py-3 px-3.5 text-center">FICHA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff] font-mono text-xs">
                {paginatedTickets.map((t, idx) => {
                  const hasPart = Boolean(t.partNumberRepuesto || t.descripcionPartNumber);
                  const hasSAP = Boolean(t.solped || t.ordenCompra || t.hes);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`hover:bg-[#f8f9ff] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#fafcff]'
                      }`}
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap font-bold text-[#b41a7c]">
                        {t.ticketJR || t.code}
                      </td>

                      <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                        <div className="font-bold text-[#0b1c30]">{t.tiendaNombre || t.storeName}</div>
                        <div className="text-[10px] text-[#757682] font-mono">{t.cecoSap || 'P009100101'}</div>
                      </td>

                      <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                        <div className="font-semibold text-[#00236f]">{t.tipoEquipo || t.equipmentName} ({t.modelo})</div>
                        <div className="text-[10px] text-[#757682] font-mono">SN: {t.numeroSerie || 'N/A'}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {t.partNumberRepuesto ? (
                          <span className="font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                            {t.partNumberRepuesto}
                          </span>
                        ) : (
                          <span className="text-[#757682] italic">Servicio Directo</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 font-sans text-[#444651] max-w-sm truncate" title={t.descripcionPartNumber}>
                        {t.descripcionPartNumber || t.detalleTicket || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-[#757682] whitespace-nowrap font-semibold">
                        {t.cotizacion || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-[#007a33] whitespace-nowrap">
                        {t.precio !== undefined && t.precio !== null ? `$${t.precio}` : '-'}
                      </td>

                      <td className={`py-3 px-3.5 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'text-[#757682]'}`}>
                        {t.solped || '-'}
                      </td>

                      <td className={`py-3 px-3.5 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'text-[#757682]'}`}>
                        {t.ordenCompra || '-'}
                      </td>

                      <td className={`py-3 px-3.5 whitespace-nowrap ${hasSAP ? 'bg-[#fef9c3] text-[#854d0e] font-bold' : 'text-[#757682]'}`}>
                        {t.hes || '-'}
                      </td>

                      <td className="py-3 px-3.5 font-sans font-semibold text-[#0b1c30] whitespace-nowrap">
                        {t.presupuestoMes || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-sans" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="px-2.5 py-1 bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] rounded font-bold text-[11px] transition-colors"
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* VISTA 3: GESTIÓN RÁPIDA HELPDESK & SLA */}
          {subView === 'gestion' && (
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff]">
                  <th className="py-3 px-3.5 w-28">TICKET JR</th>
                  <th className="py-3 px-3.5">TIENDA / SEDE</th>
                  <th className="py-3 px-3.5">EQUIPO & SERIE</th>
                  <th className="py-3 px-3.5">ASUNTO / FALLA REPORTADA</th>
                  <th className="py-3 px-3.5">PROVEEDOR</th>
                  <th className="py-3 px-3.5">TÉCNICO ASIGNADO</th>
                  <th className="py-3 px-3.5 text-center">ESTADO</th>
                  <th className="py-3 px-3.5 text-center w-24">DETALLE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ff]">
                {paginatedTickets.map((t, idx) => {
                  const isAtendido = (t.estadoTicket || t.status || '').toLowerCase().includes('atendido') ||
                                     (t.estadoTicket || t.status || '').toLowerCase().includes('resuelto');

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
                          {t.ticketJR || t.ticketNumber || t.code}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#0b1c30]">{t.tiendaNombre || t.storeName}</div>
                        <div className="text-[11px] text-[#757682]">{t.region || 'Lima y Callao'}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-[#00236f]">{t.tipoEquipo || t.equipmentName}</div>
                        <div className="text-[10px] font-mono text-[#757682]">SN: {t.numeroSerie || t.equipmentCode}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-medium text-[#0b1c30] line-clamp-1">{t.detalleTicket || t.title}</div>
                        <div className="text-[11px] text-[#757682] line-clamp-1">{t.observaciones || t.description}</div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#444651]">
                        {t.proveedorServicio || 'DMS PERU S.A.C'}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-[#0b1c30] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#00236f]" />
                          <span>{t.creadoPor || t.assignedTo || 'Roger Leon Apolinario'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isAtendido
                              ? 'bg-[#dcfce7] text-[#007a33]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAtendido ? 'bg-[#007a33]' : 'bg-[#ba1a1a]'
                            }`}
                          />
                          {t.estadoTicket || (isAtendido ? 'Atendido' : 'Pendiente Reparación')}
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
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="py-3 px-4 bg-[#f8f9ff] border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#757682]">
          <div>
            Mostrando <strong>{paginatedTickets.length}</strong> de <strong>{filteredTickets.length}</strong> tickets en planilla
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

      {/* Ticket Detailed Management Modal (FICHA CORPORATIVA 30 COLUMNAS) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 border border-[#e5eeff]">
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-[#e5eeff] pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm bg-[#eff4ff] text-[#00236f] px-2.5 py-0.5 rounded border border-[#dce9ff]">
                    {selectedTicket.ticketJR || selectedTicket.code || selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs font-semibold text-[#757682]">
                    Proveedor: <strong className="text-[#0b1c30]">{selectedTicket.proveedorServicio || 'DMS PERU S.A.C'}</strong> (Ticket: {selectedTicket.ticketProveedor || 'N/A'})
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      (selectedTicket.estadoTicket || selectedTicket.status || '').toLowerCase().includes('atendido')
                        ? 'bg-[#dcfce7] text-[#007a33]'
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}
                  >
                    {selectedTicket.estadoTicket || selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#0b1c30] mt-1.5">
                  {selectedTicket.detalleTicket || selectedTicket.title}
                </h3>
                <p className="text-xs text-[#757682]">
                  {selectedTicket.tiendaNombre || selectedTicket.storeName} (COD {selectedTicket.codTiendaNum || selectedTicket.storeCode}) • CECO: {selectedTicket.cecoSap || 'P009100101'}
                </p>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[#757682] p-1 font-bold hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* SECCIÓN 1: DATOS DEL TICKET Y ACTIVO DE TIENDA */}
            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-3">
              <h4 className="text-xs font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Datos del Activo & Levantamiento Onsite
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Equipo / Tipo:</span>
                  <span className="font-bold text-[#0b1c30]">{selectedTicket.tipoEquipo || selectedTicket.equipmentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Marca & Modelo:</span>
                  <span className="font-bold text-[#0b1c30]">{selectedTicket.marca || 'ZEBRA'} - {selectedTicket.modelo || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">N° Serie:</span>
                  <span className="font-mono font-bold text-[#00236f]">{selectedTicket.numeroSerie || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">IP / Red:</span>
                  <span className="font-mono text-[#444651]">{selectedTicket.ipAddress || 'Sin Red / USB'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Contacto en Tienda:</span>
                  <span className="font-semibold text-[#0b1c30]">{selectedTicket.contacto || selectedTicket.reportedBy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Celular Contacto:</span>
                  <span className="font-mono text-[#00236f]">{selectedTicket.celular || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Fecha Cierre:</span>
                  <span className="text-[#444651]">{selectedTicket.fechaCierre || 'Pendiente'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Creado Por:</span>
                  <span className="font-semibold text-[#0b1c30]">{selectedTicket.creadoPor || selectedTicket.assignedTo}</span>
                </div>
              </div>

              {selectedTicket.direccionFiscal && (
                <div className="pt-2 border-t border-[#dce9ff] text-xs">
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Dirección Fiscal / Sede:</span>
                  <span className="text-[#444651]">{selectedTicket.direccionFiscal}</span>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: REPUESTOS, COTIZACIÓN & PRESUPUESTOS SAP */}
            <div className="p-4 bg-[#fdf8f6] rounded-xl border border-[#fed7aa] space-y-3">
              <h4 className="text-xs font-bold text-[#c2410c] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-[#ea580c]" />
                Columnas de Repuestos, Precios y Trazabilidad SAP
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Part Number:</span>
                  <span className="font-mono font-bold text-[#00236f] bg-white px-2 py-0.5 rounded border border-[#fed7aa]">
                    {selectedTicket.partNumberRepuesto || 'No Aplica'}
                  </span>
                </div>

                <div className="sm:col-span-3">
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Descripción Part Number:</span>
                  <span className="font-semibold text-[#0b1c30]">{selectedTicket.descripcionPartNumber || 'SERVICIO DE REPARACIÓN / MANTENIMIENTO'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">N° Cotización:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{selectedTicket.cotizacion || '-'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Precio Aprobado:</span>
                  <span className="text-base font-black text-[#007a33]">
                    {selectedTicket.precio !== undefined ? `$${selectedTicket.precio}` : '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Presupuesto Mes:</span>
                  <span className="font-bold text-[#0b1c30]">{selectedTicket.presupuestoMes || 'Enero 2026'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#757682] font-semibold block uppercase">Informe PDF:</span>
                  <span className="font-bold text-[#007a33]">{selectedTicket.tienePdf || 'SI'}</span>
                </div>

                {/* Bloque SAP */}
                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa]">
                  <span className="text-[10px] text-[#854d0e] font-bold block uppercase">Solped SAP:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{selectedTicket.solped || 'Sin Solped'}</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa]">
                  <span className="text-[10px] text-[#854d0e] font-bold block uppercase">Orden de Compra:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{selectedTicket.ordenCompra || 'Sin OC'}</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa]">
                  <span className="text-[10px] text-[#854d0e] font-bold block uppercase">HES (Hoja Entrada Serv.):</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{selectedTicket.hes || 'Sin HES'}</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-[#fed7aa]">
                  <span className="text-[10px] text-[#854d0e] font-bold block uppercase">CECO Afectado:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{selectedTicket.cecoSap || 'P009100101'}</span>
                </div>
              </div>
            </div>

            {/* Acciones de Estado y Reasignación */}
            <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#757682] uppercase">Actualizar Estado:</span>
                {(['Atendido', 'Pendiente Reparación'] as string[]).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      const newStatus = st === 'Atendido' ? 'Resuelto' : 'En Progreso';
                      onUpdateTicketStatus(selectedTicket.id, newStatus as TicketStatus);
                      setSelectedTicket({ ...selectedTicket, estadoTicket: st, status: newStatus as TicketStatus });
                    }}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                      (selectedTicket.estadoTicket === st || (st === 'Atendido' && selectedTicket.status === 'Resuelto'))
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#444651] border border-[#dce9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#757682] uppercase">Técnico Responsable:</span>
                <select
                  value={selectedTicket.assignedTo || ''}
                  onChange={e => {
                    onAssignTechnician(selectedTicket.id, e.target.value);
                    setSelectedTicket({ ...selectedTicket, assignedTo: e.target.value, creadoPor: e.target.value });
                  }}
                  className="p-1.5 text-xs bg-white border border-[#c5c5d3] rounded-lg font-semibold text-[#00236f]"
                >
                  {availableTechnicians.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bitácora de Intervenciones & Conversación */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#757682] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#00236f]" />
                Bitácora de Intervenciones Técnicas Onsite
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(selectedTicket.comments && selectedTicket.comments.length > 0) ? (
                  selectedTicket.comments.map(c => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs ${
                        c.isInternal ? 'bg-[#fff8e1] border-[#ffe082]' : 'bg-[#f8f9ff] border-[#e5eeff]'
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
                    Sin bitácoras previas. Añada la primera anotación de soporte técnico abajo.
                  </div>
                )}
              </div>

              {/* Formulario de comentario */}
              <form onSubmit={handleAddCommentToSelected} className="space-y-2 pt-2 border-t border-[#f0f4ff]">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Registrar intervención, cambio de repuesto o número de guía..."
                    value={newCommentText}
                    onChange={e => setNewCommentText(e.target.value)}
                    className="flex-1 p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg focus:outline-none focus:border-[#00236f]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00236f] text-white font-bold text-xs rounded-lg hover:bg-[#1e3a8a] flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-xl hover:bg-[#dce9ff]"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal (FORMULARIO CON LAS 30 COLUMNAS CORPORATIVAS) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#e5eeff]">
            <div className="flex justify-between items-center pb-3 border-b border-[#e5eeff]">
              <div>
                <h3 className="font-bold text-base text-[#00236f] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#007a33]" />
                  Registrar Ticket Onsite & Repuestos (30 Columnas)
                </h3>
                <p className="text-xs text-[#757682]">
                  Ingreso directo al sistema con datos de hardware, soporte y presupuesto SAP.
                </p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-[#757682] p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              {/* Bloque A: Ticket & Tienda */}
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-3">
                <span className="text-xs font-bold text-[#00236f] uppercase block">
                  1. Datos del Ticket & Sede
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">TICKET JR</label>
                    <input
                      type="text"
                      placeholder="Ej. OCR-020126"
                      value={formTicketJR}
                      onChange={e => setFormTicketJR(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">PROVEEDOR</label>
                    <select
                      value={formProveedor}
                      onChange={e => setFormProveedor(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    >
                      <option value="DMS PERU S.A.C">DMS PERU S.A.C</option>
                      <option value="PRECISION PERU S.A.">PRECISION PERU S.A.</option>
                      <option value="NCR COMMERCE DEL PERU">NCR COMMERCE DEL PERU</option>
                      <option value="HP Inc. Perú">HP Inc. Perú</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">TICKET PROVEEDOR</label>
                    <input
                      type="text"
                      placeholder="Ej. 98638 / Sin Ticket"
                      value={formTicketProveedor}
                      onChange={e => setFormTicketProveedor(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">TIENDA (90)</label>
                    <select
                      value={formStoreId}
                      onChange={e => setFormStoreId(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    >
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">EQUIPO / ACTIVO DE TIENDA</label>
                    <select
                      value={formEquipmentId}
                      onChange={e => setFormEquipmentId(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    >
                      {equipments.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.code} - {eq.name.substring(0, 30)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bloque B: Hardware & Falla */}
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-3">
                <span className="text-xs font-bold text-[#00236f] uppercase block">
                  2. Características del Equipo & Avería
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">EQUIPO</label>
                    <input
                      type="text"
                      value={formTipoEquipo}
                      onChange={e => setFormTipoEquipo(e.target.value)}
                      placeholder="Ej. Terminal Móvil"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">MARCA</label>
                    <input
                      type="text"
                      value={formMarca}
                      onChange={e => setFormMarca(e.target.value)}
                      placeholder="Ej. ZEBRA"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">MODELO</label>
                    <input
                      type="text"
                      value={formModelo}
                      onChange={e => setFormModelo(e.target.value)}
                      placeholder="Ej. TC26"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">N° SERIE</label>
                    <input
                      type="text"
                      value={formSerie}
                      onChange={e => setFormSerie(e.target.value)}
                      placeholder="Ej. 22067523021608"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">DETALLE DE TICKET / FALLA REPORTADA</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Error app / Pantalla opaca y se ve linea / Gatillo hundido"
                    value={formDetalle}
                    onChange={e => setFormDetalle(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">CONTACTO TIENDA</label>
                    <input
                      type="text"
                      value={formContacto}
                      onChange={e => setFormContacto(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">CELULAR CONTACTO</label>
                    <input
                      type="text"
                      value={formCelular}
                      onChange={e => setFormCelular(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">OBSERVACIONES</label>
                    <input
                      type="text"
                      value={formObservaciones}
                      onChange={e => setFormObservaciones(e.target.value)}
                      placeholder="Ej. Mantenimiento / Cambio Cabezal"
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque C: Repuestos y Presupuestos SAP */}
              <div className="bg-[#fffbf5] p-3 rounded-xl border border-[#fed7aa] space-y-3">
                <span className="text-xs font-bold text-[#c2410c] uppercase block">
                  3. Repuestos, Cotización & Presupuesto SAP
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">Part Number Repuesto</label>
                    <input
                      type="text"
                      placeholder="Ej. TSRRF00026 / P1058930-010A"
                      value={formPartNumber}
                      onChange={e => setFormPartNumber(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">Descripción Part Number</label>
                    <input
                      type="text"
                      placeholder="Ej. KIT, PRINTHEAD 300 DPI, ZT410"
                      value={formDescPartNumber}
                      onChange={e => setFormDescPartNumber(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">N° Cotización</label>
                    <input
                      type="text"
                      placeholder="Ej. 003-00071073"
                      value={formCotizacion}
                      onChange={e => setFormCotizacion(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 55.00"
                      value={formPrecio}
                      onChange={e => setFormPrecio(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">Presupuesto Mes</label>
                    <select
                      value={formPresupuestoMes}
                      onChange={e => setFormPresupuestoMes(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#c5c5d3] rounded-lg"
                    >
                      <option value="Enero 2026">Enero 2026</option>
                      <option value="Febrero 2026">Febrero 2026</option>
                      <option value="Marzo 2026">Marzo 2026</option>
                      <option value="Junio 2026">Junio 2026</option>
                      <option value="Noviembre 2025">Noviembre 2025</option>
                      <option value="Diciembre 2025">Diciembre 2025</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-[#854d0e] block mb-1">Solped SAP</label>
                    <input
                      type="text"
                      placeholder="Ej. 1001704359"
                      value={formSolped}
                      onChange={e => setFormSolped(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#fed7aa] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#854d0e] block mb-1">Orden de Compra (OC)</label>
                    <input
                      type="text"
                      placeholder="Ej. 6001613078"
                      value={formOC}
                      onChange={e => setFormOC(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#fed7aa] rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#854d0e] block mb-1">HES SAP</label>
                    <input
                      type="text"
                      placeholder="Ej. 1002727237"
                      value={formHES}
                      onChange={e => setFormHES(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-[#fed7aa] rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00236f] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1e3a8a]"
                >
                  Guardar en Planilla Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
