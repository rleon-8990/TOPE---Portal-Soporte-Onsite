import React, { useState, useMemo } from 'react';
import {
  Package,
  Receipt,
  Repeat,
  Wrench,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Filter,
  DollarSign,
  Download,
  Calendar,
  Building,
  Cpu,
  ArrowRight,
  ChevronRight,
  FileText,
  UserCheck,
  Tag,
  Check,
  X,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Layers,
  ArrowUpDown,
  History,
  QrCode,
  Info
} from 'lucide-react';
import {
  ProviderQuoteSparePart,
  BackupEquipment,
  EquipmentCoverageMovement,
  InternalSparePart,
  InternalSpareConsumption,
  CoverageValidationAudit,
  Equipment,
  Store,
  AppUser,
  ValidationAuditStatus
} from '../types';

interface CoverageAndSparePartsViewProps {
  providerQuoteParts: ProviderQuoteSparePart[];
  backupEquipments: BackupEquipment[];
  coverageMovements: EquipmentCoverageMovement[];
  internalSpareParts: InternalSparePart[];
  internalConsumptions: InternalSpareConsumption[];
  coverageAudits: CoverageValidationAudit[];
  equipments: Equipment[];
  stores: Store[];
  currentUser: AppUser;
  onAddQuotePart: (part: ProviderQuoteSparePart) => void;
  onUpdateQuotePartStatus: (partId: string, status: ValidationAuditStatus, observations?: string) => void;
  onAddCoverageMovement: (movement: EquipmentCoverageMovement) => void;
  onReturnCoverageBkp: (movementId: string, returnDate: string, testOk: boolean, notes: string) => void;
  onAddInternalConsumption: (consumption: InternalSpareConsumption) => void;
  onAddAuditRecord: (audit: CoverageValidationAudit) => void;
  onNavigateToHelpdesk?: () => void;
  onNavigateToInventory?: () => void;
}

export const CoverageAndSparePartsView: React.FC<CoverageAndSparePartsViewProps> = ({
  providerQuoteParts,
  backupEquipments,
  coverageMovements,
  internalSpareParts,
  internalConsumptions,
  coverageAudits,
  equipments,
  stores,
  currentUser,
  onAddQuotePart,
  onUpdateQuotePartStatus,
  onAddCoverageMovement,
  onReturnCoverageBkp,
  onAddInternalConsumption,
  onAddAuditRecord,
  onNavigateToHelpdesk,
  onNavigateToInventory,
}) => {
  // Primary Tabs
  const [activeTab, setActiveTab] = useState<
    'proveedores_cotizaciones' | 'pool_bkp' | 'repuestos_internos' | 'validacion_trazabilidad'
  >('proveedores_cotizaciones');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('todos');
  const [selectedValidationFilter, setSelectedValidationFilter] = useState('todos');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('todos');
  const [selectedBkpStatusFilter, setSelectedBkpStatusFilter] = useState('todos');

  // Modals state
  const [showNewQuotePartModal, setShowNewQuotePartModal] = useState(false);
  const [showNewCoverageModal, setShowNewCoverageModal] = useState(false);
  const [showReturnBkpModal, setShowReturnBkpModal] = useState(false);
  const [selectedMovementForReturn, setSelectedMovementForReturn] = useState<EquipmentCoverageMovement | null>(null);
  const [showNewInternalConsumptionModal, setShowNewInternalConsumptionModal] = useState(false);
  const [showAuditDetailModal, setShowAuditDetailModal] = useState<CoverageValidationAudit | null>(null);
  const [showActaPrintModal, setShowActaPrintModal] = useState<EquipmentCoverageMovement | ProviderQuoteSparePart | null>(null);

  // Form states for New Quote Spare Part
  const [newPartTicketJR, setNewPartTicketJR] = useState('');
  const [newPartTicketProv, setNewPartTicketProv] = useState('');
  const [newPartStoreId, setNewPartStoreId] = useState(stores[0]?.id || '');
  const [newPartEquipmentId, setNewPartEquipmentId] = useState(equipments[0]?.id || '');
  const [newPartProveedor, setNewPartProveedor] = useState('DMS PERU S.A.C');
  const [newPartCotizacion, setNewPartCotizacion] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartDesc, setNewPartDesc] = useState('');
  const [newPartCantidad, setNewPartCantidad] = useState('1');
  const [newPartPrecio, setNewPartPrecio] = useState('');
  const [newPartMoneda, setNewPartMoneda] = useState<'USD' | 'PEN'>('USD');
  const [newPartSolped, setNewPartSolped] = useState('');
  const [newPartOC, setNewPartOC] = useState('');
  const [newPartHES, setNewPartHES] = useState('');
  const [newPartPresupuestoMes, setNewPartPresupuestoMes] = useState('Marzo 2026');
  const [newPartGarantia, setNewPartGarantia] = useState('6');
  const [newPartSerieAnterior, setNewPartSerieAnterior] = useState('');
  const [newPartSerieNuevo, setNewPartSerieNuevo] = useState('');

  // Form states for New Coverage Movement (Assign BKP)
  const [covStoreId, setCovStoreId] = useState(stores[0]?.id || '');
  const [covEquipmentId, setCovEquipmentId] = useState(equipments[0]?.id || '');
  const [covBkpId, setCovBkpId] = useState(backupEquipments.find(b => b.estado === 'disponible')?.id || backupEquipments[0]?.id || '');
  const [covTicketJR, setCovTicketJR] = useState('');
  const [covMotivo, setCovMotivo] = useState('Falla crítica en tienda; se asigna equipo BKP de reemplazo para mantener operatividad.');
  const [covResponsableEntrega, setCovResponsableEntrega] = useState(currentUser.name);
  const [covReceptorTienda, setCovReceptorTienda] = useState('Gerente / Supervisor de Turno');
  const [covFechaEstimadaRetorno, setCovFechaEstimadaRetorno] = useState('30/03/2026');

  // Form states for Return BKP
  const [returnTestOk, setReturnTestOk] = useState(true);
  const [returnNotes, setReturnNotes] = useState('Equipo titular retornado de taller e instalado en tienda. BKP devuelto y testeado OK.');

  // Form states for New Internal Consumption
  const [intSpareId, setIntSpareId] = useState(internalSpareParts[0]?.id || '');
  const [intStoreId, setIntStoreId] = useState(stores[0]?.id || '');
  const [intEquipmentId, setIntEquipmentId] = useState(equipments[0]?.id || '');
  const [intCantidad, setIntCantidad] = useState('1');
  const [intDiagnostico, setIntDiagnostico] = useState('');
  const [intTrabajo, setIntTrabajo] = useState('');

  // Quick validation modal/prompt state
  const [validatingPartId, setValidatingPartId] = useState<string | null>(null);
  const [validationNoteInput, setValidationNoteInput] = useState('');

  // Timeline lookup query
  const [timelineLookupQuery, setTimelineLookupQuery] = useState('');

  // Providers list
  const uniqueProviders = useMemo(() => {
    const s = new Set<string>();
    providerQuoteParts.forEach(p => {
      if (p.proveedor) s.add(p.proveedor);
    });
    return Array.from(s);
  }, [providerQuoteParts]);

  // Filtered Quote Parts
  const filteredQuoteParts = useMemo(() => {
    return providerQuoteParts.filter(p => {
      const matchesSearch =
        searchQuery === '' ||
        p.descripcionRepuesto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.numeroCotizacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ticketJR && p.ticketJR.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.proveedor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.solpedSap && p.solpedSap.includes(searchQuery)) ||
        (p.ordenCompraSap && p.ordenCompraSap.includes(searchQuery)) ||
        (p.hesSap && p.hesSap.includes(searchQuery));

      const matchesProvider = selectedProviderFilter === 'todos' || p.proveedor === selectedProviderFilter;
      const matchesValidation = selectedValidationFilter === 'todos' || p.estadoValidacion === selectedValidationFilter;
      const matchesStore = selectedStoreFilter === 'todos' || p.storeId === selectedStoreFilter;

      return matchesSearch && matchesProvider && matchesValidation && matchesStore;
    });
  }, [providerQuoteParts, searchQuery, selectedProviderFilter, selectedValidationFilter, selectedStoreFilter]);

  // Filtered BKP Equipment
  const filteredBkpEquipment = useMemo(() => {
    return backupEquipments.filter(b => {
      const matchesSearch =
        searchQuery === '' ||
        b.codigoBkp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.numeroSerie.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.almacenUbicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tiendaActualPrestamo && b.tiendaActualPrestamo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedBkpStatusFilter === 'todos' || b.estado === selectedBkpStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [backupEquipments, searchQuery, selectedBkpStatusFilter]);

  // KPIs
  const metrics = useMemo(() => {
    const totalQuoteAmount = providerQuoteParts.reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
    const validatedQuoteParts = providerQuoteParts.filter(p => p.estadoValidacion === 'validado_conforme').length;
    const pendingValidationQuoteParts = providerQuoteParts.filter(p => p.estadoValidacion === 'pendiente_validacion').length;
    const observedQuoteParts = providerQuoteParts.filter(p => p.estadoValidacion === 'observado_diferencia').length;

    const totalBkpCount = backupEquipments.length;
    const availableBkpCount = backupEquipments.filter(b => b.estado === 'disponible').length;
    const onLoanBkpCount = backupEquipments.filter(b => b.estado === 'en_prestamo_cobertura').length;

    const activeMovementsCount = coverageMovements.filter(m => m.estadoCobertura === 'activo_en_tienda').length;
    const longDurationMovements = coverageMovements.filter(m => m.estadoCobertura === 'activo_en_tienda' && m.diasEnCobertura > 15).length;

    const internalPartsCount = internalSpareParts.length;
    const internalLowStock = internalSpareParts.filter(p => p.stockDisponible <= p.stockMinimo).length;

    return {
      totalQuoteAmount,
      validatedQuoteParts,
      pendingValidationQuoteParts,
      observedQuoteParts,
      totalBkpCount,
      availableBkpCount,
      onLoanBkpCount,
      activeMovementsCount,
      longDurationMovements,
      internalPartsCount,
      internalLowStock,
    };
  }, [providerQuoteParts, backupEquipments, coverageMovements, internalSpareParts]);

  // Handlers
  const handleCreateQuotePart = (e: React.FormEvent) => {
    e.preventDefault();
    const storeObj = stores.find(s => s.id === newPartStoreId) || stores[0];
    const eqObj = equipments.find(e => e.id === newPartEquipmentId);

    const newPart: ProviderQuoteSparePart = {
      id: `pqp-${Date.now()}`,
      ticketJR: newPartTicketJR.trim() || `OCR-${Math.floor(100000 + Math.random() * 900000)}`,
      ticketProveedor: newPartTicketProv.trim(),
      equipmentId: eqObj?.id,
      equipmentCode: eqObj?.code || 'EQ-GENERAL',
      equipmentName: eqObj?.name || 'Equipo Onsite',
      storeId: storeObj.id,
      storeName: storeObj.name,
      codTienda: storeObj.codTienda,
      cecoSap: storeObj.centroCostoSap || 'P009100101',
      proveedor: newPartProveedor,
      numeroCotizacion: newPartCotizacion.trim() || `003-${Math.floor(10000000 + Math.random() * 90000000)}`,
      fechaCotizacion: new Date().toLocaleDateString('es-PE'),
      partNumber: newPartNumber.trim(),
      descripcionRepuesto: newPartDesc.trim(),
      cantidad: Number(newPartCantidad) || 1,
      precioUnitario: Number(newPartPrecio) || 0,
      moneda: newPartMoneda,
      precioTotal: (Number(newPartCantidad) || 1) * (Number(newPartPrecio) || 0),
      solpedSap: newPartSolped.trim(),
      ordenCompraSap: newPartOC.trim(),
      hesSap: newPartHES.trim(),
      presupuestoMes: newPartPresupuestoMes,
      fechaInstalacion: new Date().toLocaleDateString('es-PE'),
      garantiaMeses: Number(newPartGarantia) || 6,
      estadoValidacion: 'pendiente_validacion',
      numeroSerieAnterior: newPartSerieAnterior.trim(),
      numeroSerieNuevo: newPartSerieNuevo.trim(),
    };

    onAddQuotePart(newPart);
    setShowNewQuotePartModal(false);
    // Reset form
    setNewPartTicketJR('');
    setNewPartTicketProv('');
    setNewPartCotizacion('');
    setNewPartNumber('');
    setNewPartDesc('');
    setNewPartPrecio('');
    setNewPartSolped('');
    setNewPartOC('');
    setNewPartHES('');
  };

  const handleCreateCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    const storeObj = stores.find(s => s.id === covStoreId) || stores[0];
    const eqObj = equipments.find(e => e.id === covEquipmentId) || equipments[0];
    const bkpObj = backupEquipments.find(b => b.id === covBkpId);

    if (!bkpObj) return;

    const newMov: EquipmentCoverageMovement = {
      id: `cob-${Date.now()}`,
      codigoMovimiento: `COB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      ticketJR: covTicketJR.trim() || `OCR-${Math.floor(100000 + Math.random() * 900000)}`,
      tiendaId: storeObj.id,
      tiendaNombre: storeObj.name,
      codTienda: storeObj.codTienda,
      fechaInicioCobertura: new Date().toLocaleDateString('es-PE'),
      equipoTitularId: eqObj.id,
      equipoTitularCodigo: eqObj.code,
      equipoTitularNombre: eqObj.name,
      equipoTitularSerie: eqObj.serialNumber,
      equipoTitularModelo: eqObj.model,
      motivoReemplazo: covMotivo,
      estadoTitular: 'en_taller_proveedor',
      backupEquipmentId: bkpObj.id,
      backupCodigo: bkpObj.codigoBkp,
      backupSerie: bkpObj.numeroSerie,
      backupModelo: `${bkpObj.marca} ${bkpObj.modelo}`,
      responsableEntrega: covResponsableEntrega,
      receptorTienda: covReceptorTienda,
      fechaEstimadaRetorno: covFechaEstimadaRetorno,
      diasEnCobertura: 1,
      estadoCobertura: 'activo_en_tienda',
      validadoRetorno: false,
      testOperativoBkpOk: true,
      actaMovimientoFirmada: true,
    };

    onAddCoverageMovement(newMov);
    setShowNewCoverageModal(false);
  };

  const handleConfirmReturnBkp = () => {
    if (!selectedMovementForReturn) return;
    onReturnCoverageBkp(
      selectedMovementForReturn.id,
      new Date().toLocaleDateString('es-PE'),
      returnTestOk,
      returnNotes
    );
    setShowReturnBkpModal(false);
    setSelectedMovementForReturn(null);
  };

  const handleCreateInternalConsumption = (e: React.FormEvent) => {
    e.preventDefault();
    const spare = internalSpareParts.find(s => s.id === intSpareId);
    const store = stores.find(st => st.id === intStoreId) || stores[0];
    const eq = equipments.find(e => e.id === intEquipmentId) || equipments[0];

    if (!spare) return;

    const newCons: InternalSpareConsumption = {
      id: `cons-${Date.now()}`,
      repuestoId: spare.id,
      codigoInterno: spare.codigoInterno,
      descripcionRepuesto: spare.descripcion,
      cantidad: Number(intCantidad) || 1,
      equipoDestinoId: eq.id,
      equipoDestinoCodigo: eq.code,
      equipoDestinoNombre: eq.name,
      equipoDestinoSerie: eq.serialNumber,
      tiendaId: store.id,
      tiendaNombre: store.name,
      codTienda: store.codTienda,
      fechaConsumo: new Date().toLocaleDateString('es-PE'),
      tecnicoInstalo: currentUser.name,
      diagnosticoPrevio: intDiagnostico.trim() || 'Falla resuelta con stock propio del taller de TI.',
      trabajoRealizado: intTrabajo.trim() || 'Reemplazo y calibración en sitio.',
      resultadoOperativo: 'Operativo Conforme',
    };

    onAddInternalConsumption(newCons);
    setShowNewInternalConsumptionModal(false);
    setIntDiagnostico('');
    setIntTrabajo('');
  };

  const handleQuickValidate = (partId: string, status: ValidationAuditStatus) => {
    onUpdateQuotePartStatus(
      partId,
      status,
      validationNoteInput.trim() || `Validado por ${currentUser.name} en fecha ${new Date().toLocaleDateString('es-PE')}`
    );
    setValidatingPartId(null);
    setValidationNoteInput('');
  };

  return (
    <div className="w-full space-y-4 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dce9ff] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00236f] text-white tracking-wide uppercase">
              Trazabilidad & Cobertura TI
            </span>
            <span className="text-xs text-[#757682] font-semibold">
              Control de Repuestos Cotizados • Pool de Equipos BKP • Auditoría Técnica
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Gestión de Repuestos, Equipos BKP & Trazabilidad de Cobertura
          </h1>
          <p className="text-xs sm:text-sm text-[#444651] max-w-3xl">
            Valide los repuestos instalados por proveedores (amarrados a cotizaciones y trazabilidad SAP), gestione el stock de contingencia de <strong>Equipos BKP</strong> para cubrir fallas en tienda, controle repuestos de taller interno y audite la cadena de custodia.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onNavigateToHelpdesk && (
            <button
              onClick={onNavigateToHelpdesk}
              className="bg-[#eff4ff] text-[#00236f] hover:bg-[#dce9ff] px-3.5 py-2 rounded-xl text-xs font-bold border border-[#c4dcff] transition-all flex items-center gap-1.5"
              title="Volver a la Mesa de Ayuda y Tickets"
            >
              <Headphones className="w-3.5 h-3.5 text-[#00236f]" />
              <span>Ir a Helpdesk</span>
            </button>
          )}

          {activeTab === 'proveedores_cotizaciones' && (
            <button
              onClick={() => setShowNewQuotePartModal(true)}
              className="bg-[#00236f] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Repuesto x Cotización</span>
            </button>
          )}

          {activeTab === 'pool_bkp' && (
            <button
              onClick={() => setShowNewCoverageModal(true)}
              className="bg-[#00873d] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#006e31] transition-all flex items-center gap-1.5"
            >
              <Repeat className="w-4 h-4" />
              <span>Asignar BKP de Cobertura</span>
            </button>
          )}

          {activeTab === 'repuestos_internos' && (
            <button
              onClick={() => setShowNewInternalConsumptionModal(true)}
              className="bg-[#00236f] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Consumo de Taller</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Presupuesto Cotizado</span>
            <DollarSign className="w-3.5 h-3.5 text-[#00873d]" />
          </div>
          <div className="text-xl font-black text-[#00873d]">
            ${metrics.totalQuoteAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#757682] mt-0.5">{providerQuoteParts.length} repuestos registrados</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Validados Conforme</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00873d]" />
          </div>
          <div className="text-xl font-black text-[#00873d]">{metrics.validatedQuoteParts}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">Auditados con HES/Serie OK</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Pend. Validación</span>
            <Clock className="w-3.5 h-3.5 text-[#fd761a]" />
          </div>
          <div className="text-xl font-black text-[#fd761a]">{metrics.pendingValidationQuoteParts}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">Por cotejar en tienda</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Pool BKP Total</span>
            <Layers className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#00236f]">{metrics.totalBkpCount}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">
            <span className="text-[#00873d] font-bold">{metrics.availableBkpCount} disponibles</span> en almacén
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>BKP en Cobertura</span>
            <Repeat className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#00236f]">{metrics.activeMovementsCount}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">
            {metrics.longDurationMovements > 0 ? (
              <span className="text-[#ba1a1a] font-bold">⚠️ {metrics.longDurationMovements} con &gt;15 días</span>
            ) : (
              'Dentro del plazo de taller'
            )}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between text-[#757682] text-[11px] font-semibold mb-1">
            <span>Repuestos Taller TI</span>
            <Wrench className="w-3.5 h-3.5 text-[#00236f]" />
          </div>
          <div className="text-xl font-black text-[#0b1c30]">{metrics.internalPartsCount}</div>
          <div className="text-[10px] text-[#757682] mt-0.5">
            {metrics.internalLowStock > 0 ? (
              <span className="text-amber-600 font-bold">{metrics.internalLowStock} ítems en stock bajo</span>
            ) : (
              'Stock suficiente en taller'
            )}
          </div>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('proveedores_cotizaciones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'proveedores_cotizaciones'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Repuestos Proveedores & Cotizaciones ({providerQuoteParts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pool_bkp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pool_bkp'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff]'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>Pool de Equipos BKP & Cobertura ({backupEquipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('repuestos_internos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'repuestos_internos'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Repuestos Internos TI Tottus ({internalSpareParts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('validacion_trazabilidad')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'validacion_trazabilidad'
                ? 'bg-[#00873d] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#00873d] hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Centro de Validación & Trazabilidad 360° ({coverageAudits.length})</span>
          </button>
        </div>

        {/* Global search within this module */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar serie, cotización, parte..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#f8f9ff] text-xs rounded-xl border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REPUESTOS PROVEEDORES & COTIZACIONES */}
      {/* ========================================================================= */}
      {activeTab === 'proveedores_cotizaciones' && (
        <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <span>Repuestos Suministrados por Proveedores Amarrados a Cotizaciones</span>
                <span className="text-xs font-normal text-[#757682]">({filteredQuoteParts.length} registros)</span>
              </h2>
              <p className="text-xs text-[#757682] mt-0.5">
                Cotejo oficial entre lo presupuestado en la Cotización del Proveedor (DMS, NCR, Precision) y lo ingresado físicamente al activo en tienda.
              </p>
            </div>

            {/* Sub-filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedProviderFilter}
                onChange={e => setSelectedProviderFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] font-medium"
              >
                <option value="todos">Todos los Proveedores</option>
                {uniqueProviders.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={selectedValidationFilter}
                onChange={e => setSelectedValidationFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] font-medium"
              >
                <option value="todos">Cualquier Validación</option>
                <option value="validado_conforme">✅ Validado Conforme</option>
                <option value="pendiente_validacion">⏳ Pendiente Validación</option>
                <option value="observado_diferencia">⚠️ Observado</option>
              </select>

              {(selectedProviderFilter !== 'todos' || selectedValidationFilter !== 'todos' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedProviderFilter('todos');
                    setSelectedValidationFilter('todos');
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold px-1"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-[#e5eeff] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#00236f] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Ticket JR / Prov.</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Tienda / CECO</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Proveedor</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">N° Cotización</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Part Number</th>
                  <th className="py-2.5 px-3 whitespace-nowrap min-w-[200px]">Descripción Repuesto</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Precio ($)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Trazabilidad SAP</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Garantía</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Estado Validación</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Acciones / Acta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff]">
                {filteredQuoteParts.map(part => {
                  const isValidated = part.estadoValidacion === 'validado_conforme';
                  const isPending = part.estadoValidacion === 'pendiente_validacion';
                  const isObserved = part.estadoValidacion === 'observado_diferencia';

                  return (
                    <tr key={part.id} className="hover:bg-[#f8f9ff] transition-colors">
                      {/* Ticket JR / Prov */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#00236f]">{part.ticketJR || 'N/A'}</div>
                        {part.ticketProveedor && (
                          <div className="text-[10px] text-[#757682]">Prov: {part.ticketProveedor}</div>
                        )}
                      </td>

                      {/* Tienda */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#0b1c30]">{part.storeName}</div>
                        <div className="font-mono text-[10px] text-[#757682]">Cod {part.codTienda} • {part.cecoSap}</div>
                      </td>

                      {/* Proveedor */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#2c3e50]">
                        {part.proveedor}
                      </td>

                      {/* Cotizacion */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {part.numeroCotizacion}
                        </span>
                        <div className="text-[10px] text-[#757682] mt-0.5">{part.fechaCotizacion}</div>
                      </td>

                      {/* Part Number */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] font-bold text-[#00236f]">
                        {part.partNumber || '-'}
                      </td>

                      {/* Descripcion */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#0b1c30] line-clamp-1" title={part.descripcionRepuesto}>
                          {part.descripcionRepuesto}
                        </div>
                        <div className="text-[10px] text-[#757682] flex items-center gap-2 mt-0.5">
                          <span>Cant: <strong>{part.cantidad}</strong></span>
                          {part.numeroSerieNuevo && (
                            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                              Serie Nueva: {part.numeroSerieNuevo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-bold text-[#00873d]">
                        ${part.precioTotal.toFixed(2)}
                      </td>

                      {/* SAP */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[10px] font-mono">
                        <div>Solped: <strong>{part.solpedSap || 'Pendiente'}</strong></div>
                        <div>O/C: {part.ordenCompraSap || 'Sin O/C'}</div>
                        <div>HES: {part.hesSap || 'Sin HES'}</div>
                      </td>

                      {/* Garantia */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                        <span className="font-semibold text-[#0b1c30]">{part.garantiaMeses} meses</span>
                        {part.fechaFinGarantia && (
                          <div className="text-[10px] text-[#757682]">Hasta: {part.fechaFinGarantia}</div>
                        )}
                      </td>

                      {/* Estado Validacion */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        {isValidated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Validado Conforme
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Pendiente Validación
                          </span>
                        )}
                        {isObserved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <AlertTriangle className="w-3 h-3 text-red-700" />
                            Observado
                          </span>
                        )}
                        {part.validadoPor && (
                          <div className="text-[9px] text-[#757682] mt-0.5 truncate max-w-[120px]" title={part.validadoPor}>
                            {part.validadoPor}
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isPending && (
                            <button
                              onClick={() => {
                                setValidatingPartId(part.id);
                                setValidationNoteInput(part.observacionesValidacion || '');
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#00873d] border border-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1"
                              title="Validar recepción y conformidad del repuesto"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Validar</span>
                            </button>
                          )}
                          <button
                            onClick={() => setShowActaPrintModal(part)}
                            className="p-1 text-[#00236f] hover:bg-[#eff4ff] rounded border border-[#dce9ff]"
                            title="Generar e imprimir Ficha de Trazabilidad y Acta"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POOL DE EQUIPOS BACKUP (BKP) & COBERTURA DE REEMPLAZO */}
      {/* ========================================================================= */}
      {activeTab === 'pool_bkp' && (
        <div className="space-y-4">
          {/* Top Banner: Explanation */}
          <div className="bg-gradient-to-r from-[#00236f]/10 via-[#eff4ff] to-white p-4 rounded-2xl border border-[#dce9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00236f] text-white flex items-center justify-center font-bold shrink-0">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#00236f]">
                  Pool de Contingencia de Equipos BKP (Sistemas Tottus)
                </h3>
                <p className="text-xs text-[#444651]">
                  Cuando un equipo titular (POS, Handheld Zebra, Impresora, Balanza) sufre una falla crítica, se asigna temporalmente un equipo BKP para no frenar la venta o el despacho. Al repararse el titular, el BKP retorna al stock mediante checklist técnico.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewCoverageModal(true)}
              className="bg-[#00873d] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#006e31] transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Asignar BKP a Tienda</span>
            </button>
          </div>

          {/* Active Coverage Movements in Stores */}
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                  <span>Equipos BKP en Préstamo Activo (Cobertura de Tiendas en Vivo)</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#00236f] text-white">
                    {coverageMovements.filter(m => m.estadoCobertura === 'activo_en_tienda').length} activos
                  </span>
                </h3>
                <p className="text-xs text-[#757682]">
                  Equipos sustitutos que se encuentran actualmente en tiendas reemplazando equipos titulares enviados a taller.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {coverageMovements.map(mov => {
                const isActive = mov.estadoCobertura === 'activo_en_tienda';
                const isOverdue = mov.diasEnCobertura > 15;

                return (
                  <div
                    key={mov.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? isOverdue
                          ? 'border-amber-300 bg-amber-50/40'
                          : 'border-[#dce9ff] bg-white'
                        : 'border-emerald-200 bg-emerald-50/20 opacity-85'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                        {mov.codigoMovimiento}
                      </span>
                      {isActive ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isOverdue ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{mov.diasEnCobertura} días en tienda</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Retornado a BKP</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Tienda & Ticket */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0b1c30] text-sm">{mov.tiendaNombre} (Cod {mov.codTienda})</span>
                        <span className="font-mono text-xs text-[#00236f] font-semibold">{mov.ticketJR}</span>
                      </div>

                      {/* Comparativa Titular vs BKP */}
                      <div className="bg-[#f8f9ff] p-2.5 rounded-lg border border-[#e5eeff] space-y-1.5">
                        <div className="text-[11px]">
                          <span className="text-[#ba1a1a] font-bold">🔴 Titular Averiado:</span>{' '}
                          <span className="font-semibold text-[#0b1c30]">{mov.equipoTitularNombre}</span>
                          <div className="font-mono text-[10px] text-[#757682] ml-4">
                            Serie: {mov.equipoTitularSerie} • Estado: {mov.estadoTitular.replace(/_/g, ' ')}
                          </div>
                        </div>

                        <div className="text-[11px]">
                          <span className="text-[#00873d] font-bold">🟢 BKP Asignado:</span>{' '}
                          <span className="font-semibold text-[#0b1c30]">{mov.backupModelo} ({mov.backupCodigo})</span>
                          <div className="font-mono text-[10px] text-[#757682] ml-4">
                            Serie BKP: {mov.backupSerie}
                          </div>
                        </div>
                      </div>

                      {/* Motivo */}
                      <p className="text-[11px] text-[#444651] line-clamp-2">
                        <strong>Motivo:</strong> {mov.motivoReemplazo}
                      </p>

                      {/* Responsable y fecha */}
                      <div className="pt-2 border-t border-[#e5eeff] flex items-center justify-between text-[11px] text-[#757682]">
                        <span>Entregó: <strong>{mov.responsableEntrega.split(' ')[0]}</strong></span>
                        <span>Inicio: {mov.fechaInicioCobertura}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 pt-2.5 border-t border-[#e5eeff] flex items-center justify-between gap-2">
                      <button
                        onClick={() => setShowActaPrintModal(mov)}
                        className="text-xs font-semibold text-[#00236f] hover:underline flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ver Acta de Relevo</span>
                      </button>

                      {isActive && (
                        <button
                          onClick={() => {
                            setSelectedMovementForReturn(mov);
                            setShowReturnBkpModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Registrar Retorno</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup Pool Inventory Table */}
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                  <span>Inventario General de Equipos BKP de Reserva</span>
                  <span className="text-xs font-normal text-[#757682]">({filteredBkpEquipment.length} unidades)</span>
                </h3>
                <p className="text-xs text-[#757682]">
                  Unidades listas para despacho inmediato ante contingencias en cajas, balanzas o inventario nocturno.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedBkpStatusFilter}
                  onChange={e => setSelectedBkpStatusFilter(e.target.value)}
                  className="h-8 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] font-medium"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="disponible">🟢 Disponibles en Almacén</option>
                  <option value="en_prestamo_cobertura">🔵 En Cobertura (Tienda)</option>
                  <option value="en_mantenimiento_bkp">🟠 En Mantenimiento BKP</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#e5eeff] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#00236f] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 whitespace-nowrap">Código BKP</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tipo de Equipo</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Marca / Modelo</th>
                    <th className="py-2.5 px-3 whitespace-nowrap font-mono">Número de Serie</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Ubicación / Almacén</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Condición</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Estado Actual</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Historial Préstamos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {filteredBkpEquipment.map(bkp => {
                    const isAvail = bkp.estado === 'disponible';
                    const isLoaned = bkp.estado === 'en_prestamo_cobertura';

                    return (
                      <tr key={bkp.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-[#00236f]">
                          {bkp.codigoBkp}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-[#0b1c30]">
                          {bkp.tipoEquipo}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#2c3e50]">
                          <strong>{bkp.marca}</strong> {bkp.modelo}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {bkp.numeroSerie}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[#444651]">
                          {bkp.almacenUbicacion}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#00236f] border border-blue-200">
                            {bkp.condicionFisica}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {isAvail && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Disponible en Almacén
                            </span>
                          )}
                          {isLoaned && (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#00236f]">
                                <Repeat className="w-3 h-3 text-[#00236f]" />
                                En Cobertura Activa
                              </span>
                              <div className="text-[10px] text-[#757682]">{bkp.tiendaActualPrestamo}</div>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-center font-bold text-[#00236f]">
                          {bkp.totalVecesPrestado} relevos
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPUESTOS INTERNOS DE TI (TALLER PROPIO) */}
      {/* ========================================================================= */}
      {activeTab === 'repuestos_internos' && (
        <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5eeff] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <span>Stock de Repuestos Propios de TI (Taller Interno Tottus)</span>
                <span className="text-xs font-normal text-[#757682]">({internalSpareParts.length} repuestos en catálogo)</span>
              </h2>
              <p className="text-xs text-[#757682] mt-0.5">
                Piezas de recambio disponibles en el almacén de Sistemas (fuentes, RAM, discos SSD, rodillos, cables) utilizadas por IT Operators para reparaciones directas sin coste de proveedor tercero.
              </p>
            </div>

            <button
              onClick={() => setShowNewInternalConsumptionModal(true)}
              className="bg-[#00236f] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#1e3a8a] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Consumo en Equipo</span>
            </button>
          </div>

          {/* Cards of Available Internal Parts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {internalSpareParts.map(part => {
              const isLow = part.stockDisponible <= part.stockMinimo;

              return (
                <div key={part.id} className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#00236f] bg-white px-2 py-0.5 rounded border border-[#dce9ff]">
                        {part.codigoInterno}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Stock: {part.stockDisponible} un.
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#0b1c30] leading-snug line-clamp-2" title={part.descripcion}>
                      {part.descripcion}
                    </h4>

                    <div className="text-[11px] text-[#757682] mt-2 space-y-1">
                      <div>Categoría: <strong className="text-[#0b1c30]">{part.categoria}</strong></div>
                      <div>P/N Fab.: <span className="font-mono text-[#00236f]">{part.partNumberFabricante || 'N/A'}</span></div>
                      <div>Compatibilidad: {part.marcaCompatible}</div>
                      <div>Ubicación: {part.almacenUbicacion}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#e5eeff] flex items-center justify-between text-xs">
                    <span className="text-[#757682]">Costo Estimado:</span>
                    <span className="font-bold text-[#00873d]">${part.costoUnitarioEstimado.toFixed(2)} USD</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consumptions History Table */}
          <div className="pt-4 border-t border-[#e5eeff] space-y-2.5">
            <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
              <History className="w-4 h-4 text-[#00236f]" />
              <span>Historial de Consumo de Repuestos Internos en Tiendas</span>
              <span className="text-xs font-normal text-[#757682]">({internalConsumptions.length} intervenciones registradas)</span>
            </h3>

            <div className="overflow-x-auto border border-[#e5eeff] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f0f4ff] text-[#00236f] text-[11px] font-bold uppercase">
                    <th className="py-2 px-3 whitespace-nowrap">Fecha</th>
                    <th className="py-2 px-3 whitespace-nowrap">Repuesto Interno</th>
                    <th className="py-2 px-3 whitespace-nowrap">Tienda & Equipo Destino</th>
                    <th className="py-2 px-3 whitespace-nowrap">Ticket JR</th>
                    <th className="py-2 px-3 whitespace-nowrap">Técnico Instalador</th>
                    <th className="py-2 px-3 min-w-[200px]">Diagnóstico & Trabajo</th>
                    <th className="py-2 px-3 whitespace-nowrap text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {internalConsumptions.map(cons => (
                    <tr key={cons.id} className="hover:bg-[#f8f9ff]">
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-[#0b1c30]">{cons.fechaConsumo}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-bold text-[#00236f]">{cons.codigoInterno}</div>
                        <div className="text-[10px] text-[#757682]">{cons.descripcionRepuesto} (x{cons.cantidad})</div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#0b1c30]">{cons.tiendaNombre}</div>
                        <div className="text-[10px] text-[#757682]">{cons.equipoDestinoNombre} ({cons.equipoDestinoCodigo})</div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-mono text-[#00236f] font-semibold">
                        {cons.ticketJR || 'N/A'}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap font-medium text-[#2c3e50]">{cons.tecnicoInstalo}</td>
                      <td className="py-2 px-3 text-[11px] text-[#444651]">
                        <div>{cons.trabajoRealizado}</div>
                        <div className="text-[10px] text-[#757682] italic">Previo: {cons.diagnosticoPrevio}</div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cons.resultadoOperativo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CENTRO DE VALIDACIÓN & TRAZABILIDAD 360° */}
      {/* ========================================================================= */}
      {activeTab === 'validacion_trazabilidad' && (
        <div className="space-y-4">
          {/* Methodology Card: ¿Cómo se valida esto? */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dce9ff] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#00873d] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Metodología Oficial de Validación y Auditoría Técnica de Cobertura</span>
            </div>
            <h2 className="text-lg font-black text-[#0b1c30] tracking-tight">
              ¿Cómo se valida la cobertura, los repuestos y los equipos de contingencia?
            </h2>
            <p className="text-xs text-[#444651] leading-relaxed max-w-4xl">
              Para garantizar que el dinero de cotizaciones no se desvíe, que los activos corporativos no se extravíen y que la tienda mantenga su continuidad operativa, el sistema implementa un <strong>protocolo de validación en 4 puntos de control cruzado</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00236f] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span className="font-bold text-xs text-[#00236f]">Cotejo de Cotización</span>
                </div>
                <p className="text-[11px] text-[#757682] pt-1">
                  Se valida que el Part Number físico entregado por el proveedor coincida con la Cotización aprobada, Solped y Orden de Compra SAP.
                </p>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00236f] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <span className="font-bold text-xs text-[#00236f]">Custodia BKP Reemplazo</span>
                </div>
                <p className="text-[11px] text-[#757682] pt-1">
                  Se vincula la Serie del equipo titular averiado con la Serie del BKP entregado, emitiendo un Acta de Relevo con firma del receptor de tienda.
                </p>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00236f] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <span className="font-bold text-xs text-[#00236f]">Prueba Operativa en Sitio</span>
                </div>
                <p className="text-[11px] text-[#757682] pt-1">
                  El IT Operator ejecuta pruebas de estrés (lectura de códigos, impresión térmica o cobro con pinpad) antes de dar el visto bueno de cierre.
                </p>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00873d] text-white flex items-center justify-center text-xs font-bold">4</span>
                  <span className="font-bold text-xs text-[#00873d]">Reingreso y Cierre HES</span>
                </div>
                <p className="text-[11px] text-[#757682] pt-1">
                  Al retornar el equipo titular reparado, el BKP reingresa al stock de contingencia y se emite la HES para el pago al proveedor.
                </p>
              </div>
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                  <span>Dictámenes de Auditoría & Conformidad Técnica</span>
                  <span className="text-xs font-normal text-[#757682]">({coverageAudits.length} expedientes auditados)</span>
                </h3>
                <p className="text-xs text-[#757682]">
                  Expedientes formales de validación con evaluación de los 4 criterios obligatorios.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#e5eeff] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#00236f] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 whitespace-nowrap">Código Auditoría</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tipo de Cobertura</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Tienda & Activo</th>
                    <th className="py-2.5 px-3 whitespace-nowrap font-mono">Series Cruzadas</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">C1: Serie</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">C2: SAP/Cotiz.</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">C3: Test OK</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">C4: Retorno</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Dictamen Final</th>
                    <th className="py-2.5 px-3 whitespace-nowrap text-center">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {coverageAudits.map(audit => {
                    const isPassed = audit.dictamenFinal === 'validado_conforme';
                    const isPending = audit.dictamenFinal === 'pendiente_validacion';
                    const isObserved = audit.dictamenFinal === 'observado_diferencia';

                    return (
                      <tr key={audit.id} className="hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-[#00236f]">
                          {audit.codigoAuditoria}
                          <div className="text-[10px] text-[#757682] font-normal">{audit.fechaAuditoria}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-[#0b1c30] capitalize">
                            {audit.tipoCobertura.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[10px] text-[#757682]">{audit.referenciaCodigo}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-[#0b1c30]">{audit.tiendaNombre}</div>
                          <div className="text-[10px] text-[#757682]">{audit.equipoAfectado}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px]">
                          <div>Titular: <strong className="text-red-700">{audit.serieTitular}</strong></div>
                          <div>BKP/Rep: <strong className="text-emerald-700">{audit.serieBkpOrRepuesto}</strong></div>
                        </td>

                        {/* Criteria checks */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {audit.criterio1_SerieCoincide ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 inline" />
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {audit.criterio2_CotizacionAprobada ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 inline" />
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {audit.criterio3_TestOperativoSuperado ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <X className="w-4 h-4 text-red-600 inline" />
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {audit.criterio4_TitularRetornadoOValidado ? (
                            <Check className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <X className="w-4 h-4 text-amber-600 inline" />
                          )}
                        </td>

                        {/* Dictamen */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {isPassed && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✅ Conforme
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              ⏳ En Proceso
                            </span>
                          )}
                          {isObserved && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              ⚠️ Observado
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-center text-[10px] text-[#757682]">
                          {audit.auditorNombre}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR REPUESTO X COTIZACIÓN */}
      {/* ========================================================================= */}
      {showNewQuotePartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Registrar Repuesto de Proveedor x Cotización</h3>
                <p className="text-xs text-[#757682]">Vincule el repuesto cotizado por el proveedor con el ticket y las órdenes SAP</p>
              </div>
              <button onClick={() => setShowNewQuotePartModal(false)} className="text-[#757682] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotePart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Ticket JR / Helpdesk</label>
                  <input
                    type="text"
                    required
                    value={newPartTicketJR}
                    onChange={e => setNewPartTicketJR(e.target.value)}
                    placeholder="ej. OCR-020126"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Ticket Proveedor (Opcional)</label>
                  <input
                    type="text"
                    value={newPartTicketProv}
                    onChange={e => setNewPartTicketProv(e.target.value)}
                    placeholder="ej. 98638"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Tienda Destino (Inventario de Sedes)</label>
                  <select
                    value={newPartStoreId}
                    onChange={e => {
                      const newSid = e.target.value;
                      setNewPartStoreId(newSid);
                      const firstEq = equipments.find(eq => eq.storeId === newSid);
                      if (firstEq) setNewPartEquipmentId(firstEq.id);
                    }}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Cod {s.codTienda})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Equipo Asociado del Inventario</label>
                  <select
                    value={newPartEquipmentId}
                    onChange={e => setNewPartEquipmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-bold text-[#00236f]"
                  >
                    {equipments
                      .filter(eq => !newPartStoreId || eq.storeId === newPartStoreId)
                      .map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.code} - {eq.name} (S/N: {eq.serialNumber})
                        </option>
                      ))}
                    {equipments.filter(eq => !newPartStoreId || eq.storeId === newPartStoreId).length === 0 && (
                      <option value="">No hay equipos registrados en esta tienda</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Proveedor del Servicio</label>
                  <select
                    value={newPartProveedor}
                    onChange={e => setNewPartProveedor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  >
                    <option value="DMS PERU S.A.C">DMS PERU S.A.C (Zebra / Motorola)</option>
                    <option value="NCR COMMERCE DEL PERU S.A.C.">NCR COMMERCE DEL PERU (POS)</option>
                    <option value="PRECISION PERU S.A.">PRECISION PERU S.A. (Balanzas)</option>
                    <option value="POSIFLEX PERU S.A.C.">POSIFLEX PERU S.A.C.</option>
                    <option value="ZEBRA TECHNOLOGIES">ZEBRA TECHNOLOGIES</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">N° de Cotización</label>
                  <input
                    type="text"
                    required
                    value={newPartCotizacion}
                    onChange={e => setNewPartCotizacion(e.target.value)}
                    placeholder="ej. 003-00071073"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Part Number del Repuesto</label>
                  <input
                    type="text"
                    required
                    value={newPartNumber}
                    onChange={e => setNewPartNumber(e.target.value)}
                    placeholder="ej. P1058930-010A"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#0b1c30] block mb-1">Descripción del Repuesto</label>
                  <input
                    type="text"
                    required
                    value={newPartDesc}
                    onChange={e => setNewPartDesc(e.target.value)}
                    placeholder="ej. CABEZAL TÉRMICO 300 DPI PARA ZEBRA ZT410"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Cantidad & Precio Unitario ($)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={newPartCantidad}
                      onChange={e => setNewPartCantidad(e.target.value)}
                      className="w-20 px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newPartPrecio}
                      onChange={e => setNewPartPrecio(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-bold text-[#00873d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Garantía (Meses)</label>
                  <select
                    value={newPartGarantia}
                    onChange={e => setNewPartGarantia(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  >
                    <option value="3">3 Meses</option>
                    <option value="6">6 Meses</option>
                    <option value="12">12 Meses (1 Año)</option>
                    <option value="24">24 Meses (2 Años)</option>
                  </select>
                </div>

                {/* SAP Fields */}
                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Solped SAP</label>
                  <input
                    type="text"
                    value={newPartSolped}
                    onChange={e => setNewPartSolped(e.target.value)}
                    placeholder="ej. 1001571403"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Orden de Compra SAP (O/C)</label>
                  <input
                    type="text"
                    value={newPartOC}
                    onChange={e => setNewPartOC(e.target.value)}
                    placeholder="ej. 6001495464"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">HES SAP</label>
                  <input
                    type="text"
                    value={newPartHES}
                    onChange={e => setNewPartHES(e.target.value)}
                    placeholder="ej. 1002515853"
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Presupuesto Mes</label>
                  <select
                    value={newPartPresupuestoMes}
                    onChange={e => setNewPartPresupuestoMes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  >
                    <option value="Marzo 2026">Marzo 2026</option>
                    <option value="Febrero 2026">Febrero 2026</option>
                    <option value="Enero 2026">Enero 2026</option>
                    <option value="Abril 2026">Abril 2026</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowNewQuotePartModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#444651] hover:bg-[#eff4ff] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00236f] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1e3a8a]"
                >
                  Guardar Repuesto Cotizado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ASIGNAR EQUIPO BKP A TIENDA (NUEVA COBERTURA) */}
      {/* ========================================================================= */}
      {showNewCoverageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#00236f]">Asignar Equipo BKP de Contingencia</h3>
                <p className="text-xs text-[#757682]">Relevo temporal en tienda para equipo titular que ingresa a taller</p>
              </div>
              <button onClick={() => setShowNewCoverageModal(false)} className="text-[#757682] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoverage} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Tienda Afectada</label>
                <select
                  value={covStoreId}
                  onChange={e => {
                    const newSid = e.target.value;
                    setCovStoreId(newSid);
                    const firstEq = equipments.find(eq => eq.storeId === newSid);
                    if (firstEq) setCovEquipmentId(firstEq.id);
                  }}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Cod {s.codTienda})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Equipo Titular que Sufrió la Avería</label>
                <select
                  value={covEquipmentId}
                  onChange={e => setCovEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                >
                  {equipments
                    .filter(eq => !covStoreId || eq.storeId === covStoreId)
                    .map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {eq.code} - {eq.name} (S/N: {eq.serialNumber})
                      </option>
                    ))}
                  {equipments.filter(eq => !covStoreId || eq.storeId === covStoreId).length === 0 && (
                    <option value="">No hay equipos en esta tienda</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Equipo BKP Seleccionado del Pool</label>
                <select
                  value={covBkpId}
                  onChange={e => setCovBkpId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-bold text-[#00873d]"
                >
                  {backupEquipments
                    .filter(b => b.estado === 'disponible')
                    .map(b => (
                      <option key={b.id} value={b.id}>
                        {b.codigoBkp} - {b.marca} {b.modelo} (S/N: {b.numeroSerie}) - {b.almacenUbicacion}
                      </option>
                    ))}
                </select>
                {backupEquipments.filter(b => b.estado === 'disponible').length === 0 && (
                  <p className="text-[11px] text-red-600 mt-1">⚠️ No hay equipos BKP disponibles en almacén actualmente.</p>
                )}
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Ticket JR Asociado</label>
                <input
                  type="text"
                  value={covTicketJR}
                  onChange={e => setCovTicketJR(e.target.value)}
                  placeholder="ej. OCR-150126"
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Motivo del Reemplazo</label>
                <textarea
                  rows={2}
                  required
                  value={covMotivo}
                  onChange={e => setCovMotivo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Responsable Entrega (TI)</label>
                  <input
                    type="text"
                    value={covResponsableEntrega}
                    onChange={e => setCovResponsableEntrega(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Receptor en Tienda</label>
                  <input
                    type="text"
                    value={covReceptorTienda}
                    onChange={e => setCovReceptorTienda(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowNewCoverageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#444651] hover:bg-[#eff4ff] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00873d] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#006e31]"
                >
                  Confirmar Asignación & Generar Acta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTRAR RETORNO DE BKP / TITULAR REPARADO */}
      {/* ========================================================================= */}
      {showReturnBkpModal && selectedMovementForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Registrar Retorno de Equipo BKP</h3>
                <p className="text-xs text-[#757682]">El equipo titular regresa reparado y el BKP reingresa al pool de contingencia</p>
              </div>
              <button onClick={() => setShowReturnBkpModal(false)} className="text-[#757682] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] space-y-1.5 text-xs">
              <div>Tienda: <strong>{selectedMovementForReturn.tiendaNombre}</strong></div>
              <div>BKP a Reingresar: <strong className="text-[#00236f]">{selectedMovementForReturn.backupCodigo}</strong> (Serie: {selectedMovementForReturn.backupSerie})</div>
              <div>Titular Reinstalado: <strong className="text-[#00873d]">{selectedMovementForReturn.equipoTitularNombre}</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#0b1c30]">
                <input
                  type="checkbox"
                  checked={returnTestOk}
                  onChange={e => setReturnTestOk(e.target.checked)}
                  className="w-4 h-4 text-[#00873d] rounded"
                />
                <span>Prueba Técnica Operativa Superada (Checklist de estrés y firmware OK)</span>
              </label>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Observaciones de Cierre / Reincorporación</label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={e => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e5eeff]">
              <button
                type="button"
                onClick={() => setShowReturnBkpModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#444651] hover:bg-[#eff4ff] rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReturnBkp}
                className="px-4 py-2 bg-[#00873d] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#006e31]"
              >
                Confirmar Reingreso al Stock BKP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONSUMO DE REPUESTOS INTERNOS */}
      {/* ========================================================================= */}
      {showNewInternalConsumptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Registrar Consumo de Repuesto de Taller TI</h3>
                <p className="text-xs text-[#757682]">Salida de piezas de stock interno para reparación directa en tienda</p>
              </div>
              <button onClick={() => setShowNewInternalConsumptionModal(false)} className="text-[#757682] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInternalConsumption} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Repuesto a Utilizar</label>
                <select
                  value={intSpareId}
                  onChange={e => setIntSpareId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-bold text-[#00236f]"
                >
                  {internalSpareParts.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.codigoInterno} - {sp.descripcion} (Disp: {sp.stockDisponible} un.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={intCantidad}
                    onChange={e => setIntCantidad(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#0b1c30] block mb-1">Tienda Destino (Inventario Sedes)</label>
                  <select
                    value={intStoreId}
                    onChange={e => {
                      const newSid = e.target.value;
                      setIntStoreId(newSid);
                      const firstEq = equipments.find(eq => eq.storeId === newSid);
                      if (firstEq) setIntEquipmentId(firstEq.id);
                    }}
                    className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.name} (Cod {st.codTienda})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Equipo Receptor del Repuesto</label>
                <select
                  value={intEquipmentId}
                  onChange={e => setIntEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs font-medium"
                >
                  {equipments
                    .filter(eq => !intStoreId || eq.storeId === intStoreId)
                    .map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.code} - {eq.name} (SN: {eq.serialNumber})</option>
                    ))}
                  {equipments.filter(eq => !intStoreId || eq.storeId === intStoreId).length === 0 && (
                    <option value="">No hay equipos registrados en esta tienda</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Diagnóstico Previo</label>
                <input
                  type="text"
                  required
                  value={intDiagnostico}
                  onChange={e => setIntDiagnostico(e.target.value)}
                  placeholder="ej. Fuente de POS quemada por chispa"
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0b1c30] block mb-1">Trabajo Técnico Realizado</label>
                <textarea
                  rows={2}
                  required
                  value={intTrabajo}
                  onChange={e => setIntTrabajo(e.target.value)}
                  placeholder="ej. Sustitución de fuente y prueba de encendido con multímetro a 24V"
                  className="w-full px-3 py-2 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setShowNewInternalConsumptionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#444651] hover:bg-[#eff4ff] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00236f] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1e3a8a]"
                >
                  Registrar Salida de Repuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VALIDACIÓN RÁPIDA DE REPUESTO DE COTIZACIÓN */}
      {/* ========================================================================= */}
      {validatingPartId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-3 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-2">
              <h3 className="text-sm font-bold text-[#0b1c30]">Validación Técnica de Repuesto Suministrado</h3>
              <button onClick={() => setValidatingPartId(null)} className="text-[#757682]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#444651]">
              ¿El repuesto suministrado por el proveedor coincide exactamente con el <strong>Part Number</strong> y las especificaciones cotizadas en SAP?
            </p>

            <div>
              <label className="text-[11px] font-semibold text-[#0b1c30] block mb-1">Observaciones de Validación</label>
              <textarea
                rows={2}
                value={validationNoteInput}
                onChange={e => setValidationNoteInput(e.target.value)}
                placeholder="ej. Repuesto instalado con éxito. Pruebas de funcionamiento 100% conformes."
                className="w-full px-3 py-1.5 bg-[#f8f9ff] rounded-lg border border-[#dce9ff] text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                type="button"
                onClick={() => handleQuickValidate(validatingPartId, 'observado_diferencia')}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold border border-red-200"
              >
                Observar Diferencia
              </button>
              <button
                type="button"
                onClick={() => handleQuickValidate(validatingPartId, 'validado_conforme')}
                className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-xs"
              >
                Validar Conforme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ACTA DIGITAL OFICIAL DE VALIDACIÓN Y RELEVO */}
      {/* ========================================================================= */}
      {showActaPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#dce9ff]">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#007a33] text-white flex items-center justify-center font-bold">T</div>
                <div>
                  <h3 className="text-sm font-black text-[#00236f] uppercase">Acta Oficial de Trazabilidad y Cobertura</h3>
                  <p className="text-[10px] text-[#757682]">Hipermercados Tottus S.A. • Gerencia de Sistemas & Soporte Onsite</p>
                </div>
              </div>
              <button onClick={() => setShowActaPrintModal(null)} className="text-[#757682] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="p-4 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#e5eeff] pb-2 text-[11px]">
                <span>Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-PE')}</strong></span>
                <span className="font-mono text-[#00236f] font-bold">EXP-TRAZ-{Date.now().toString().slice(-6)}</span>
              </div>

              {'codigoMovimiento' in showActaPrintModal ? (
                // Acta de Movimiento BKP
                <div className="space-y-2">
                  <div className="font-bold text-sm text-[#0b1c30] text-center bg-white p-2 rounded-lg border border-[#e5eeff]">
                    ACTA DE PRÉSTAMO Y COBERTURA TEMPORAL DE EQUIPO BKP
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Tienda: <strong>{(showActaPrintModal as EquipmentCoverageMovement).tiendaNombre}</strong></div>
                    <div>Ticket JR: <strong>{(showActaPrintModal as EquipmentCoverageMovement).ticketJR}</strong></div>
                    <div>Equipo Titular: {(showActaPrintModal as EquipmentCoverageMovement).equipoTitularNombre}</div>
                    <div>Serie Titular: <strong className="font-mono text-red-700">{(showActaPrintModal as EquipmentCoverageMovement).equipoTitularSerie}</strong></div>
                    <div>Equipo BKP Asignado: {(showActaPrintModal as EquipmentCoverageMovement).backupModelo}</div>
                    <div>Serie BKP: <strong className="font-mono text-emerald-700">{(showActaPrintModal as EquipmentCoverageMovement).backupSerie}</strong></div>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#e5eeff] text-[11px]">
                    <strong>Motivo:</strong> {(showActaPrintModal as EquipmentCoverageMovement).motivoReemplazo}
                  </div>
                </div>
              ) : (
                // Acta de Repuesto x Cotización
                <div className="space-y-2">
                  <div className="font-bold text-sm text-[#0b1c30] text-center bg-white p-2 rounded-lg border border-[#e5eeff]">
                    ACTA DE CONFORMIDAD DE REPUESTO DE PROVEEDOR (SAP)
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Proveedor: <strong>{(showActaPrintModal as ProviderQuoteSparePart).proveedor}</strong></div>
                    <div>Cotización N°: <strong>{(showActaPrintModal as ProviderQuoteSparePart).numeroCotizacion}</strong></div>
                    <div>Ticket JR: {(showActaPrintModal as ProviderQuoteSparePart).ticketJR}</div>
                    <div>Part Number: <strong className="font-mono text-[#00236f]">{(showActaPrintModal as ProviderQuoteSparePart).partNumber}</strong></div>
                    <div>Repuesto: {(showActaPrintModal as ProviderQuoteSparePart).descripcionRepuesto}</div>
                    <div>Precio Total: <strong className="text-emerald-700">${(showActaPrintModal as ProviderQuoteSparePart).precioTotal.toFixed(2)}</strong></div>
                    <div>Solped SAP: {(showActaPrintModal as ProviderQuoteSparePart).solpedSap || 'N/A'}</div>
                    <div>HES SAP: {(showActaPrintModal as ProviderQuoteSparePart).hesSap || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Signatures box */}
              <div className="pt-4 border-t border-[#e5eeff] grid grid-cols-2 gap-6 text-center text-[10px]">
                <div className="border-t border-dashed border-[#757682] pt-2">
                  <div className="font-bold text-[#0b1c30]">{currentUser.name}</div>
                  <div className="text-[#757682]">Especialista TI Onsite (Tottus)</div>
                </div>
                <div className="border-t border-dashed border-[#757682] pt-2">
                  <div className="font-bold text-[#0b1c30]">Firma & Sello de Recepción</div>
                  <div className="text-[#757682]">Gerente / Supervisor de Tienda</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#00236f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
