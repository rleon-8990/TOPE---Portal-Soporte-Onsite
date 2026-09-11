import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  Building,
  Calendar,
  Clock,
  User,
  Camera,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Share2,
  Printer,
  Laptop,
  Smartphone,
  Server,
  Layers,
  Scale,
  CreditCard,
  Tag,
  Scan,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Wrench,
  Headphones,
  Upload,
  X,
  FileCheck,
  ShieldCheck,
  Info,
  PackageCheck,
  Database,
  Network,
  Box
} from 'lucide-react';
import {
  PreventiveVisit,
  WalkthroughCategoryId,
  WalkthroughReviewedItem,
  PreventiveVisitPhoto,
  Store,
  AppUser,
  Ticket,
  Equipment
} from '../types';
import {
  WALKTHROUGH_CATEGORIES,
  WalkthroughCategoryMeta,
  getPreventiveVisitSemaforo
} from '../data/preventiveVisitsData';

interface PreventiveVisitsViewProps {
  stores: Store[];
  visits: PreventiveVisit[];
  currentUser: AppUser;
  equipments?: Equipment[];
  onSaveVisit: (visit: PreventiveVisit) => void;
  onUpdateVisit: (visit: PreventiveVisit) => void;
  onDeleteVisit: (visitId: string) => void;
  onCreateHelpdeskTicket?: (ticketData: Partial<Ticket>) => void;
  onNavigateToHelpdesk?: () => void;
  onNavigateToStores?: () => void;
  onNavigateToMaintenance?: () => void;
  onNavigateToInventory?: () => void;
}

type WizardStep =
  | 'scrInicio'
  | 'scrNuevaVisita'
  | 'scrMenu'
  | 'scrRevision'
  | 'scrEvidencias'
  | 'scrObservaciones'
  | 'scrResumen'
  | 'scrFinalizada';

export const PreventiveVisitsView: React.FC<PreventiveVisitsViewProps> = ({
  stores,
  visits,
  currentUser,
  equipments = [],
  onSaveVisit,
  onUpdateVisit,
  onDeleteVisit,
  onCreateHelpdeskTicket,
  onNavigateToHelpdesk,
  onNavigateToStores,
  onNavigateToMaintenance,
  onNavigateToInventory
}) => {
  // Navigation within the module
  const [currentStep, setCurrentStep] = useState<WizardStep>('scrInicio');
  const [selectedCategoryForReview, setSelectedCategoryForReview] = useState<WalkthroughCategoryMeta>(
    WALKTHROUGH_CATEGORIES[0]
  );

  // Inventory Integration States
  const [autoPreloadInventory, setAutoPreloadInventory] = useState<boolean>(true);
  const [selectedInventoryEquipmentIds, setSelectedInventoryEquipmentIds] = useState<string[]>([]);

  // List filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Informe generado' | 'En proceso' | 'Pendiente'>('todos');
  const [activeTab, setActiveTab] = useState<'visitas' | 'semaforo_tiendas'>('visitas');

  // Modal for Viewing Full PDF/Report
  const [reportModalVisit, setReportModalVisit] = useState<PreventiveVisit | null>(null);

  // Draft Visit State (Wizard flow)
  const [draftVisit, setDraftVisit] = useState<Partial<PreventiveVisit>>({
    numeroVisita: `VIS-${Math.floor(100 + Math.random() * 900)}-2026-08`,
    fechaVisita: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    horaInicio: '08:30',
    horaTermino: '14:30',
    itOperator: currentUser.name || 'Operador IT Onsite',
    gerenteTienda: '',
    personalPermanente: 8,
    direccionFiscal: '',
    storeId: '',
    storeCode: '',
    storeName: '',
    observacionesGenerales: '',
    recomendacionesPlanes: '',
    estado: 'En proceso',
    itemsRevision: [],
    evidenciasGenerales: [],
    firmas: {
      itOperatorSignature: `${currentUser.name} - IT Onsite`,
      itOperatorSignedAt: new Date().toLocaleString('es-PE')
    }
  });

  // Modal for adding/editing a reviewed item in a category
  const [editingItem, setEditingItem] = useState<Partial<WalkthroughReviewedItem> | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Helper: Icon map for categories
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scan':
        return <Scan className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Printer':
        return <Printer className="w-5 h-5" />;
      case 'Tag':
        return <Tag className="w-5 h-5" />;
      case 'Server':
        return <Server className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  // KPIs calculation (matches Image 1: 124, 98, 26, 87)
  const stats = useMemo(() => {
    const totalTiendas = stores.length > 0 ? stores.length : 124;
    const visitasRealizadas = visits.filter(v => v.estado === 'Informe generado' || v.estado === 'En proceso').length;
    const informesGenerados = visits.filter(v => v.estado === 'Informe generado').length;
    const pendientes = Math.max(0, totalTiendas - visitasRealizadas);

    const ultimaVisita = [...visits].sort(
      (a, b) => new Date(b.createdAt || b.fechaVisita).getTime() - new Date(a.createdAt || a.fechaVisita).getTime()
    )[0];

    const proximaPendiente = visits.find(v => v.estado === 'Pendiente' || v.estado === 'En proceso') || {
      storeName: '101 - HT Trujillo',
      storeCode: '101',
      fechaVisita: '04/08/2026'
    };

    return {
      totalTiendas,
      visitasRealizadas,
      pendientes,
      informesGenerados,
      ultimaVisita,
      proximaPendiente
    };
  }, [stores, visits]);

  // Filtered visits list
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchSearch =
        v.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(v.storeCode).toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.itOperator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.numeroVisita.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'todos' || v.estado === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [visits, searchQuery, statusFilter]);

  // Equipos registrados en inventario para la tienda seleccionada
  const storeEquipments = useMemo(() => {
    if (!equipments || equipments.length === 0) return [];
    if (!draftVisit.storeId && !draftVisit.storeCode && !draftVisit.storeName) return [];

    const found = equipments.filter(eq => {
      const matchId = draftVisit.storeId && eq.storeId === draftVisit.storeId;
      const matchCode = draftVisit.storeCode && (
        String(eq.storeCode) === String(draftVisit.storeCode) ||
        (eq.storeCodeNumber && String(eq.storeCodeNumber) === String(draftVisit.storeCode))
      );
      const matchName = draftVisit.storeName && (
        eq.storeName.toLowerCase().includes(draftVisit.storeName.toLowerCase()) ||
        draftVisit.storeName.toLowerCase().includes(eq.storeName.toLowerCase())
      );
      return matchId || matchCode || matchName;
    });

    return found;
  }, [equipments, draftVisit.storeId, draftVisit.storeCode, draftVisit.storeName]);

  // Helper to map equipment to category item
  const mapEquipmentToCategoryItem = (eq: Equipment): WalkthroughReviewedItem => {
    let catId: WalkthroughCategoryId = 'cajas_asistidas';
    let catName = 'Cajas Asistidas (POS)';
    const eqName = (eq.name || '').toLowerCase();
    const eqServ = (eq.servicio || '').toLowerCase();
    const catIdEq = (eq.categoryId || '').toLowerCase();

    if (catIdEq.includes('pos') || eqName.includes('pos') || eqServ.includes('pos') || eqName.includes('caja')) {
      if (eqName.includes('sco') || eqName.includes('self') || eqServ.includes('sco') || eqName.includes('autocobro')) {
        catId = 'cajas_sco';
        catName = 'Cajas Self-Checkout (SCO)';
      } else {
        catId = 'cajas_asistidas';
        catName = 'Cajas Asistidas (POS)';
      }
    } else if (catIdEq.includes('balanza') || eqName.includes('balanza') || eqServ.includes('balanza') || eqName.includes('toledo') || eqName.includes('bizerba')) {
      catId = 'balanzas';
      catName = 'Balanzas Perecibles y Pesaje';
    } else if (eqName.includes('switch') || eqName.includes('rack') || eqName.includes('gabinete') || catIdEq.includes('red') || eqName.includes('cisco')) {
      if (eqName.includes('b') || (eq.locationInStore && eq.locationInStore.toLowerCase().includes('b'))) {
        catId = 'gabinete_b';
        catName = 'Gabinete B (Comunicaciones)';
      } else if (eqName.includes('c') || (eq.locationInStore && eq.locationInStore.toLowerCase().includes('c'))) {
        catId = 'gabinete_c';
        catName = 'Gabinete C (Comunicaciones)';
      } else {
        catId = 'cpd_sistemas';
        catName = 'CPD / Sistemas Centrales';
      }
    } else if (catIdEq.includes('pda') || eqName.includes('pda') || eqName.includes('tc52') || eqName.includes('terminal')) {
      catId = 'pda_terminales';
      catName = 'PDAs y Terminales Móviles';
    } else if (catIdEq.includes('impresora') || eqName.includes('impresora') || eqName.includes('zebra')) {
      if (eqName.includes('portatil') || eqName.includes('zq') || eqName.includes('cctv')) {
        catId = 'impresoras_portatiles';
        catName = 'Impresoras Portátiles';
      } else {
        catId = 'impresoras_zebra';
        catName = 'Impresoras Zebra / Térmicas';
      }
    } else if (catIdEq.includes('kiosko') || eqName.includes('verificador') || eqName.includes('precio')) {
      catId = 'consulta_precios';
      catName = 'Verificadores / Kioskos';
    } else {
      catId = 'cpd_sistemas';
      catName = 'CPD / Sistemas Centrales';
    }

    const matchedCat = WALKTHROUGH_CATEGORIES.find(c => c.id === catId);
    const defaultCheck = matchedCat ? matchedCat.defaultChecklist : [
      'Inspección física y anclaje',
      'Conectividad de red e IP',
      'Prueba funcional operativa'
    ];

    return {
      id: `rev-inv-${eq.id}-${Date.now()}`,
      categoryId: catId,
      categoryName: catName,
      equipoNombre: `${eq.name} (${eq.code})`,
      equipmentCode: eq.code,
      estado: 'Operativo',
      observacion: `Registrado en Inventario Maestro TOPE. Ubicación: ${eq.locationInStore || 'Piso de Venta'}. IP: ${eq.ipAddress || '-'}. Switch: ${eq.switchName || '-'}${eq.puertoSwitch ? ` (Puerto ${eq.puertoSwitch})` : ''}.`,
      accionRealizada: 'Inspección física, conexionado y prueba funcional preventiva.',
      diagnostics: defaultCheck.map(chk => ({
        item: chk,
        status: 'ok',
        valorMedido: 'Conforme'
      })),
      evidencias: []
    };
  };

  // Load store inventory into draft visit
  const handleLoadStoreInventoryIntoVisit = () => {
    const selected = storeEquipments.filter(e =>
      selectedInventoryEquipmentIds.length === 0 || selectedInventoryEquipmentIds.includes(e.id)
    );
    if (selected.length === 0) return;

    const newItems: WalkthroughReviewedItem[] = selected.map(mapEquipmentToCategoryItem);
    setDraftVisit(prev => ({
      ...prev,
      itemsRevision: newItems
    }));
  };

  // Handle select store in Wizard
  const handleSelectStoreForNewVisit = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setDraftVisit(prev => ({
        ...prev,
        storeId: store.id,
        storeCode: store.codTienda || store.code.replace('T-', ''),
        storeName: `${store.codTienda || store.code} - ${store.name}`,
        direccionFiscal: store.direccion || store.address || `${store.city}, Perú`,
        gerenteTienda: store.gerenteTienda || store.manager || 'Gerente de Sucursal',
        itOperator: store.itOperator || currentUser.name || 'Operador IT Onsite'
      }));
    }
  };

  // Start new visit flow
  const handleStartNewVisit = () => {
    const defaultStore = stores[0];
    setDraftVisit({
      id: `vis-${Date.now()}`,
      numeroVisita: `VIS-${defaultStore?.codTienda || '358'}-${new Date().getFullYear()}-08`,
      storeId: defaultStore?.id || 'store-358',
      storeCode: defaultStore?.codTienda || '358',
      storeName: defaultStore ? `${defaultStore.codTienda} - ${defaultStore.name}` : '358 - HT Cajamarca',
      direccionFiscal: defaultStore?.direccion || defaultStore?.address || 'Av. Los Incas 123, Cajamarca',
      fechaVisita: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      horaInicio: '08:30',
      horaTermino: '14:30',
      itOperator: currentUser.name || 'Operador IT Onsite',
      gerenteTienda: defaultStore?.gerenteTienda || defaultStore?.manager || 'María Gómez',
      personalPermanente: 8,
      observacionesGenerales: '',
      recomendacionesPlanes: '',
      estado: 'En proceso',
      itemsRevision: [],
      evidenciasGenerales: [],
      firmas: {
        itOperatorSignature: `${currentUser.name} - IT Onsite Tottus`,
        itOperatorSignedAt: new Date().toLocaleString('es-PE')
      }
    });
    setCurrentStep('scrNuevaVisita');
  };

  // Open item modal to add revision
  const handleOpenAddItemModal = (cat: WalkthroughCategoryMeta) => {
    const countInCat = (draftVisit.itemsRevision || []).filter(i => i.categoryId === cat.id).length;
    setEditingItem({
      id: `rev-${cat.id}-${Date.now()}`,
      categoryId: cat.id,
      categoryName: cat.name,
      equipoNombre: `${cat.shortCode} ${countInCat + 1}`,
      equipmentCode: `${cat.shortCode}-${draftVisit.storeCode || 'T'}-0${countInCat + 1}`,
      estado: 'Operativo',
      observacion: 'Equipo inspeccionado y operativo conforme a estándar.',
      accionRealizada: 'Inspección física, limpieza técnica y prueba funcional.',
      diagnostics: cat.defaultChecklist.map(checkItem => ({
        item: checkItem,
        status: 'ok',
        valorMedido: 'Conforme'
      })),
      evidencias: []
    });
    setIsItemModalOpen(true);
  };

  // Save reviewed item into draft visit
  const handleSaveReviewedItem = () => {
    if (!editingItem || !editingItem.equipoNombre) return;

    const existing = draftVisit.itemsRevision || [];
    const itemToSave: WalkthroughReviewedItem = {
      id: editingItem.id || `rev-${Date.now()}`,
      categoryId: editingItem.categoryId || selectedCategoryForReview.id,
      categoryName: editingItem.categoryName || selectedCategoryForReview.name,
      equipoNombre: editingItem.equipoNombre,
      equipmentCode: editingItem.equipmentCode,
      estado: editingItem.estado || 'Operativo',
      observacion: editingItem.observacion || '',
      accionRealizada: editingItem.accionRealizada || '',
      ticketJR: editingItem.ticketJR,
      diagnostics: editingItem.diagnostics || [],
      evidencias: editingItem.evidencias || []
    };

    const updated = existing.some(i => i.id === itemToSave.id)
      ? existing.map(i => (i.id === itemToSave.id ? itemToSave : i))
      : [...existing, itemToSave];

    setDraftVisit(prev => ({
      ...prev,
      itemsRevision: updated
    }));

    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  // Finalize and save the visit
  const handleGenerateFinalReport = () => {
    const items = draftVisit.itemsRevision || [];
    const operativos = items.filter(i => i.estado === 'Operativo').length;
    const conObservacion = items.filter(i => i.estado === 'Con observación').length;
    const noOperativos = items.filter(i => i.estado === 'No operativo / Falla').length;
    const tickets = items.filter(i => Boolean(i.ticketJR)).length;

    const completeVisit: PreventiveVisit = {
      id: draftVisit.id || `vis-${Date.now()}`,
      numeroVisita: draftVisit.numeroVisita || `VIS-${draftVisit.storeCode}-2026-08`,
      storeId: draftVisit.storeId || stores[0]?.id || 'store-01',
      storeCode: draftVisit.storeCode || stores[0]?.codTienda || '101',
      storeName: draftVisit.storeName || stores[0]?.name || 'Tienda Tottus',
      direccionFiscal: draftVisit.direccionFiscal || 'Av. Principal',
      fechaVisita: draftVisit.fechaVisita || new Date().toLocaleDateString('es-PE'),
      horaInicio: draftVisit.horaInicio || '08:30',
      horaTermino: draftVisit.horaTermino || '14:30',
      itOperator: draftVisit.itOperator || currentUser.name,
      gerenteTienda: draftVisit.gerenteTienda || 'Gerente de Tienda',
      personalPermanente: draftVisit.personalPermanente || 8,
      observacionesGenerales: draftVisit.observacionesGenerales || 'Caminata técnica semestral ejecutada conforme a estándares de IT Tottus.',
      recomendacionesPlanes: draftVisit.recomendacionesPlanes || 'Continuar con el mantenimiento quincenal programado.',
      estado: 'Informe generado',
      informePdfNombre: `Informe_Visita_${draftVisit.storeCode}_${new Date().toISOString().split('T')[0]}.pdf`,
      informePdfUrl: '#',
      sharepointSynced: true,
      sharepointListId: `SP-LIST-TOTTUS-VIS-${draftVisit.storeCode}`,
      itemsRevision: items,
      evidenciasGenerales: draftVisit.evidenciasGenerales || [],
      firmas: {
        itOperatorSignature: draftVisit.firmas?.itOperatorSignature || `${currentUser.name} - IT Onsite`,
        itOperatorSignedAt: new Date().toLocaleString('es-PE'),
        gerenteSignature: `${draftVisit.gerenteTienda} - Gerencia Tienda`,
        gerenteSignedAt: new Date().toLocaleString('es-PE')
      },
      totalEquipos: items.length,
      operativosCount: operativos,
      conObservacionCount: conObservacion,
      noOperativosCount: noOperativos,
      ticketsGeneradosCount: tickets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveVisit(completeVisit);
    setDraftVisit(completeVisit);
    setCurrentStep('scrFinalizada');
  };

  // Helper: Count items reviewed in a category in the current draft
  const getCategoryCountInDraft = (categoryId: WalkthroughCategoryId) => {
    return (draftVisit.itemsRevision || []).filter(i => i.categoryId === categoryId).length;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* POWER APPS BRANDING HEADER (Top bar matching Image 1 & Image 2)           */}
      {/* ========================================================================= */}
      <div className="bg-[#742774] text-white px-5 py-3 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4 border border-[#8b358b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm tracking-tighter">
            PA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg tracking-tight">
                Informe de Visita Preventiva
              </h1>
              <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Power Apps · M365
              </span>
            </div>
            <p className="text-xs text-purple-100 hidden sm:block">
              Caminata Técnica Semestral: Gabinetes, POS, PDAs, Balanzas & CPD de Tiendas Tottus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-purple-200" />
            <span className="font-medium text-purple-100">{currentUser.name}</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
              {currentUser.role}
            </span>
          </div>

          {currentStep !== 'scrInicio' && (
            <button
              onClick={() => setCurrentStep('scrInicio')}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Inicio</span>
            </button>
          )}

          {currentStep === 'scrInicio' && (
            <button
              onClick={handleStartNewVisit}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Visita</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: scrInicio (Dashboard principal de visitas preventivas - Imagen 1) */}
      {/* ========================================================================= */}
      {currentStep === 'scrInicio' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#00236f] via-[#0b3b95] to-[#007a33] text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-1 rounded-md mb-2.5 inline-block">
                Portal de Auditoría Semestral
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Bienvenido - Gestiona, revisa y genera los informes de visitas preventivas a tiendas.
              </h2>
              <p className="text-xs md:text-sm text-blue-100 mt-2 leading-relaxed">
                Este sistema agiliza las caminatas técnicas en sucursales, evaluando el estado físico de cajas asistidas, self-checkout, switches de gabinetes, terminales PDA y balanzas perecibles con diagnósticos y reporte directo a Helpdesk.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
              <ClipboardCheckIcon className="w-80 h-80 text-white" />
            </div>
          </div>

          {/* 4 KPI Cards (Total de Tiendas, Visitas Realizadas, Pendientes, Informes Generados) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#525e75] block">Total de Tiendas</span>
                <span className="text-2xl font-extrabold text-[#00236f] mt-0.5 block">{stats.totalTiendas}</span>
                <span className="text-[10px] text-[#007a33] font-medium flex items-center gap-1 mt-1">
                  <Building className="w-3 h-3" />
                  Red Hipermercados Tottus
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#525e75] block">Visitas Realizadas</span>
                <span className="text-2xl font-extrabold text-[#007a33] mt-0.5 block">{stats.visitasRealizadas}</span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {Math.round((stats.visitasRealizadas / stats.totalTiendas) * 100)}% cobertura semestral
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#525e75] block">Pendientes</span>
                <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">{stats.pendientes}</span>
                <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Ciclo semestral en curso
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#525e75] block">Informes Generados</span>
                <span className="text-2xl font-extrabold text-purple-700 mt-0.5 block">{stats.informesGenerados}</span>
                <span className="text-[10px] text-purple-700 font-medium flex items-center gap-1 mt-1">
                  <FileText className="w-3 h-3" />
                  PDF & SharePoint Dataverse
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Module Switcher Tabs: 'Últimas Visitas' vs 'Semáforo de Tiendas & Mantenimiento' */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeff] pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('visitas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'visitas'
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'bg-white text-[#525e75] hover:bg-[#eff4ff] border border-[#dce9ff]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Historial de Visitas Realizadas</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
                  {visits.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('semaforo_tiendas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'semaforo_tiendas'
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'bg-white text-[#525e75] hover:bg-[#eff4ff] border border-[#dce9ff]'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Semáforo Semestral por Tienda</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  Amarrado a Mantenimiento
                </span>
              </button>
            </div>

            {/* Quick search and status filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tienda, código, IT..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#dce9ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f]/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs bg-white border border-[#dce9ff] rounded-xl px-2.5 py-1.5 text-[#00236f] font-medium focus:outline-none"
              >
                <option value="todos">Todos los estados</option>
                <option value="Informe generado">Informe generado</option>
                <option value="En proceso">En proceso</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          {/* TAB 1: LISTADO DE ÚLTIMAS VISITAS (Matching Image 1) */}
          {activeTab === 'visitas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Table of Last Visits */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dce9ff] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8faff]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00236f]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#00236f]">
                      Últimas Visitas Registradas
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#525e75] font-medium">
                    Mostrando {filteredVisits.length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f0f4fd] text-[#00236f] font-bold border-b border-[#dce9ff]">
                      <tr>
                        <th className="py-3 px-3.5">Fecha</th>
                        <th className="py-3 px-3.5">Tienda</th>
                        <th className="py-3 px-3.5">N.° Tienda</th>
                        <th className="py-3 px-3.5">Operador IT</th>
                        <th className="py-3 px-3.5">Estado</th>
                        <th className="py-3 px-3.5">Informe</th>
                        <th className="py-3 px-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5eeff]">
                      {filteredVisits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#757682]">
                            No se encontraron visitas que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredVisits.map(visit => (
                          <tr key={visit.id} className="hover:bg-[#f8faff] transition-colors">
                            <td className="py-3 px-3.5 font-medium text-[#00236f] whitespace-nowrap">
                              {visit.fechaVisita}
                            </td>
                            <td className="py-3 px-3.5 font-semibold text-[#1a1c22]">
                              {visit.storeName}
                            </td>
                            <td className="py-3 px-3.5 font-mono font-bold text-[#007a33]">
                              {visit.storeCode}
                            </td>
                            <td className="py-3 px-3.5 text-[#525e75]">
                              {visit.itOperator}
                            </td>
                            <td className="py-3 px-3.5">
                              {visit.estado === 'Informe generado' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Informe generado
                                </span>
                              )}
                              {visit.estado === 'En proceso' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  En proceso
                                </span>
                              )}
                              {visit.estado === 'Pendiente' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              {visit.estado === 'Informe generado' ? (
                                <button
                                  onClick={() => setReportModalVisit(visit)}
                                  className="text-xs font-semibold text-[#007a33] hover:text-[#005a26] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Descargar o ver informe PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Descargar</span>
                                </button>
                              ) : (
                                <span className="text-[#a0a8b8]">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setReportModalVisit(visit)}
                                  className="p-1.5 text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors cursor-pointer"
                                  title="Ver detalle del informe"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDraftVisit(visit);
                                    setCurrentStep('scrMenu');
                                  }}
                                  className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                  title="Continuar o editar revisión"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Col: Workflow Guide & Highlights (Matching Image 1 right sidebar) */}
              <div className="space-y-4">
                {/* Workflow Feature Card */}
                <div className="bg-gradient-to-br from-white to-[#f8faff] rounded-2xl border border-[#dce9ff] p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      PA
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#00236f]">
                      Flujo de Caminata Técnica
                    </h4>
                  </div>
                  <h5 className="font-bold text-sm text-[#1a1c22]">
                    Más control, mejor rendimiento de tus tiendas
                  </h5>
                  <p className="text-xs text-[#525e75] mt-1 leading-relaxed">
                    Sigue los 4 pasos del protocolo estandarizado de soporte onsite:
                  </p>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#e5eeff]">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                        1
                      </div>
                      <div>
                        <div className="font-bold text-[#00236f]">Revisión de equipos</div>
                        <div className="text-[11px] text-[#525e75]">
                          Checklist de cajas POS, switches de gabinetes, balanzas perecibles y PDAs.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#e5eeff]">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-[#00236f]">Evidencias fotográficas</div>
                        <div className="text-[11px] text-[#525e75]">
                          Adjunta fotos del estado del gabinete, pruebas de impresión y pantallas.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#e5eeff]">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-[#00236f]">Genera el informe</div>
                        <div className="text-[11px] text-[#525e75]">
                          Firma digital del IT Operator y Gerente de Tienda con reporte oficial en PDF.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-[#e5eeff]">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                        4
                      </div>
                      <div>
                        <div className="font-bold text-[#00236f]">Comparte y guarda</div>
                        <div className="text-[11px] text-[#525e75]">
                          Sincronización automática con SharePoint Dataverse y notificación vía correo.
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartNewVisit}
                    className="w-full mt-4 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Iniciar Nueva Caminata Semestral</span>
                  </button>
                </div>

                {/* 3 Summary Mini-Cards matching Image 1 bottom cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#525e75] block">Total de Informes Generados</span>
                      <span className="text-lg font-bold text-purple-700">{stats.informesGenerados}</span>
                      <span className="text-[10px] text-purple-600 block">Informes en formato PDF</span>
                    </div>
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#525e75] block">Última Visita</span>
                      <span className="text-sm font-bold text-[#00236f]">
                        {stats.ultimaVisita ? `${stats.ultimaVisita.storeName} (${stats.ultimaVisita.storeCode})` : 'Cajamarca (358)'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono block">
                        {stats.ultimaVisita ? stats.ultimaVisita.fechaVisita : '05/08/2026'}
                      </span>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#525e75] block">Próxima Visita Pendiente</span>
                      <span className="text-sm font-bold text-amber-700">
                        {stats.proximaPendiente ? `${stats.proximaPendiente.storeName} (${stats.proximaPendiente.storeCode})` : 'Trujillo (101)'}
                      </span>
                      <span className="text-[10px] text-amber-600 font-mono block">
                        {stats.proximaPendiente ? stats.proximaPendiente.fechaVisita : '04/08/2026'}
                      </span>
                    </div>
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEMÁFORO DE TIENDAS Y VINCULACIÓN CON MANTENIMIENTO */}
          {activeTab === 'semaforo_tiendas' && (
            <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs overflow-hidden">
              <div className="p-4 bg-[#f8faff] border-b border-[#e5eeff] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#00236f]">
                    Semáforo de Auditoría Semestral por Tienda
                  </h3>
                  <p className="text-xs text-[#525e75] mt-0.5">
                    Permite saber con exactitud cuándo fue la última caminata preventiva y si requiere visita urgente.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Al día (&lt; 4 meses)
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Por vencer (4 a 6 meses)
                  </span>
                  <span className="flex items-center gap-1 text-rose-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Vencida (&gt; 6 meses)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f4fd] text-[#00236f] font-bold border-b border-[#dce9ff]">
                    <tr>
                      <th className="py-3 px-3.5">Código</th>
                      <th className="py-3 px-3.5">Tienda</th>
                      <th className="py-3 px-3.5">Región</th>
                      <th className="py-3 px-3.5">Última Visita Registrada</th>
                      <th className="py-3 px-3.5">Estado Semestral</th>
                      <th className="py-3 px-3.5">Operador IT</th>
                      <th className="py-3 px-3.5">Gerente de Tienda</th>
                      <th className="py-3 px-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5eeff]">
                    {stores.map(st => {
                      // Find visit for this store
                      const stVisit = visits.find(
                        v => String(v.storeCode) === String(st.codTienda) || String(v.storeId) === String(st.id)
                      );
                      const lastDateStr = stVisit ? stVisit.fechaVisita : st.ultimaVisitaPreventiva?.fecha;
                      const semaforo = getPreventiveVisitSemaforo(lastDateStr === 'Pendiente' ? undefined : lastDateStr);

                      return (
                        <tr key={st.id} className="hover:bg-[#f8faff] transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-[#007a33]">
                            {st.codTienda || st.code}
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-[#1a1c22]">
                            {st.name}
                          </td>
                          <td className="py-3 px-3.5 text-[#525e75]">
                            {st.region}
                          </td>
                          <td className="py-3 px-3.5 font-medium text-[#00236f]">
                            {lastDateStr && lastDateStr !== 'Pendiente' ? lastDateStr : 'Sin registro previo'}
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${semaforo.badgeClass}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {semaforo.label}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-[#525e75]">
                            {stVisit?.itOperator || st.itOperator || 'Sin asignar'}
                          </td>
                          <td className="py-3 px-3.5 text-[#525e75]">
                            {stVisit?.gerenteTienda || st.gerenteTienda || st.manager || '-'}
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              onClick={() => {
                                handleSelectStoreForNewVisit(st.id);
                                setCurrentStep('scrNuevaVisita');
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-[#007a33] hover:bg-[#005a26] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Programar Caminata</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: scrNuevaVisita (Paso 1: Datos de la visita - Imagen 2)           */}
      {/* ========================================================================= */}
      {currentStep === 'scrNuevaVisita' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#dce9ff] shadow-md p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-[#e5eeff] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Paso 1 de 5 · Datos de la Visita
              </span>
              <h2 className="text-lg font-bold text-[#00236f] mt-1">
                scrNuevaVisita - Registro de Cabecera
              </h2>
            </div>
            <button
              onClick={() => setCurrentStep('scrInicio')}
              className="text-[#757682] hover:text-[#00236f] p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tienda selector */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#00236f]">Seleccionar Tienda</label>
              <select
                value={draftVisit.storeId}
                onChange={e => handleSelectStoreForNewVisit(e.target.value)}
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00236f]/20 bg-[#f8faff]"
              >
                <option value="">-- Selecciona una tienda --</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.codTienda || s.code} - {s.name} ({s.region})
                  </option>
                ))}
              </select>
            </div>

            {/* SECCIÓN VINCULADA: Inventario Oficial de Equipos de la Tienda */}
            <div className="sm:col-span-2 bg-[#f0f6ff] border border-[#bcd7ff] rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d2e4ff] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00236f] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Database className="w-5 h-5 text-[#79a9ff]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#00236f] flex items-center gap-2">
                      <span>Equipos Registrados en el Inventario Oficial</span>
                      <span className="bg-[#007a33] text-white text-[10px] font-mono px-2 py-0.2 rounded-full font-bold">
                        {storeEquipments.length} activos detectados
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#444651]">
                      Equipos enlazados al inventario de {draftVisit.storeName || 'la sucursal'}. Se evita la digitación manual duplicada.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedInventoryEquipmentIds.length === storeEquipments.length) {
                        setSelectedInventoryEquipmentIds([]);
                      } else {
                        setSelectedInventoryEquipmentIds(storeEquipments.map(e => e.id));
                      }
                    }}
                    className="text-[11px] font-bold text-[#00236f] hover:underline cursor-pointer"
                  >
                    {selectedInventoryEquipmentIds.length === storeEquipments.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLoadStoreInventoryIntoVisit();
                      setCurrentStep('scrMenu');
                    }}
                    disabled={storeEquipments.length === 0}
                    className="px-3 py-1.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Iniciar Proceso con {selectedInventoryEquipmentIds.length || storeEquipments.length} Equipos</span>
                  </button>
                </div>
              </div>

              {/* Lista visual de equipos */}
              {storeEquipments.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                    {storeEquipments.map(eq => {
                      const isSelected =
                        selectedInventoryEquipmentIds.length === 0 ||
                        selectedInventoryEquipmentIds.includes(eq.id);
                      return (
                        <div
                          key={eq.id}
                          onClick={() => {
                            setSelectedInventoryEquipmentIds(prev =>
                              prev.includes(eq.id) ? prev.filter(id => id !== eq.id) : [...prev, eq.id]
                            );
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                            isSelected
                              ? 'bg-white border-[#00236f] shadow-xs ring-1 ring-[#00236f]/20'
                              : 'bg-white/60 border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-[#00236f] focus:ring-[#00236f]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[#00236f] truncate">{eq.code}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#eff4ff] text-[#00236f] font-semibold truncate">
                                {eq.categoryName.replace(' y Sistemas de Pesaje', '').replace(' y Terminales Móviles', '')}
                              </span>
                            </div>
                            <div className="font-medium text-[#0b1c30] truncate text-[11px] mt-0.5">{eq.name}</div>
                            <div className="text-[10px] text-[#757682] truncate flex items-center gap-2 mt-0.5">
                              {eq.ipAddress && <span>IP: {eq.ipAddress}</span>}
                              {eq.switchName && <span>Switch: {eq.switchName}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#00236f] font-semibold">
                      <input
                        type="checkbox"
                        checked={autoPreloadInventory}
                        onChange={e => setAutoPreloadInventory(e.target.checked)}
                        className="rounded text-[#007a33] focus:ring-[#007a33]"
                      />
                      <span>Pre-cargar automáticamente estos equipos en el checklist de la caminata</span>
                    </label>

                    {onNavigateToInventory && (
                      <button
                        type="button"
                        onClick={onNavigateToInventory}
                        className="text-[11px] text-[#00236f] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver Inventario Completo</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esta tienda no tiene activos cargados aún en el inventario. Se utilizarán las categorías y plantillas estándar.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">N.° Tienda (Código)</label>
              <input
                type="text"
                value={draftVisit.storeCode || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, storeCode: e.target.value }))}
                placeholder="Ej. 358"
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Fecha de Visita</label>
              <input
                type="text"
                value={draftVisit.fechaVisita || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, fechaVisita: e.target.value }))}
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Hora de Inicio</label>
              <input
                type="time"
                value={draftVisit.horaInicio || '08:30'}
                onChange={e => setDraftVisit(prev => ({ ...prev, horaInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Hora de Término</label>
              <input
                type="time"
                value={draftVisit.horaTermino || '14:30'}
                onChange={e => setDraftVisit(prev => ({ ...prev, horaTermino: e.target.value }))}
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#00236f]">Dirección Fiscal de la Sucursal</label>
              <input
                type="text"
                value={draftVisit.direccionFiscal || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, direccionFiscal: e.target.value }))}
                placeholder="Av. Principal N° 123"
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Operador IT Responsable</label>
              <input
                type="text"
                value={draftVisit.itOperator || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, itOperator: e.target.value }))}
                placeholder="Nombre del técnico IT"
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Gerente de Tienda (Recepción)</label>
              <input
                type="text"
                value={draftVisit.gerenteTienda || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, gerenteTienda: e.target.value }))}
                placeholder="Nombre del gerente"
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Personal Permanente (Dotación)</label>
              <input
                type="number"
                value={draftVisit.personalPermanente || 8}
                onChange={e => setDraftVisit(prev => ({ ...prev, personalPermanente: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#00236f]">Número de Visita (Autogenerado)</label>
              <input
                type="text"
                value={draftVisit.numeroVisita || ''}
                disabled
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs font-mono bg-gray-50 text-gray-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#00236f]">Observaciones Iniciales / Objetivo de Caminata</label>
              <textarea
                rows={3}
                value={draftVisit.observacionesGenerales || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, observacionesGenerales: e.target.value }))}
                placeholder="Ingresa los objetivos o detalles preliminares de la visita..."
                className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="border-t border-[#e5eeff] pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('scrInicio')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (autoPreloadInventory && (!draftVisit.itemsRevision || draftVisit.itemsRevision.length === 0)) {
                  handleLoadStoreInventoryIntoVisit();
                }
                setCurrentStep('scrMenu');
              }}
              disabled={!draftVisit.storeCode}
              className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Siguiente: Categorías de Revisión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: scrMenu (Paso 2: Menú de Categorías a Inspeccionar - Imagen 2)   */}
      {/* ========================================================================= */}
      {currentStep === 'scrMenu' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
          {/* Top summary card for the current walk */}
          <div className="bg-white p-4 rounded-2xl border border-[#dce9ff] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Paso 2 de 5 · Selecciona Categoría a Inspeccionar
              </span>
              <h2 className="text-base font-bold text-[#00236f] mt-1">
                Caminata en: {draftVisit.storeName}
              </h2>
              <span className="text-xs text-[#525e75]">
                Fecha: {draftVisit.fechaVisita} · Operador: {draftVisit.itOperator} · Equipos auditados en esta visita:{' '}
                <strong className="text-[#007a33]">{(draftVisit.itemsRevision || []).length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('scrEvidencias')}
                className="px-3.5 py-2 border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-purple-600" />
                <span>Evidencias ({(draftVisit.evidenciasGenerales || []).length})</span>
              </button>
              <button
                onClick={() => setCurrentStep('scrResumen')}
                className="px-4 py-2 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Finalizar y Resumen</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid with the 11 categories matching Image 2 scrMenu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WALKTHROUGH_CATEGORIES.map(cat => {
              const countInDraft = getCategoryCountInDraft(cat.id);
              const itemsInCat = (draftVisit.itemsRevision || []).filter(i => i.categoryId === cat.id);
              const hasAlerts = itemsInCat.some(i => i.estado !== 'Operativo');

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryForReview(cat);
                    setCurrentStep('scrRevision');
                  }}
                  className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                    hasAlerts
                      ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                      : countInDraft > 0
                      ? 'border-emerald-300 hover:border-emerald-400 bg-emerald-50/20'
                      : 'border-[#dce9ff] hover:border-[#00236f]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#eff4ff] group-hover:bg-[#00236f] group-hover:text-white text-[#00236f] flex items-center justify-center transition-colors">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {countInDraft > 0 ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              hasAlerts
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {countInDraft} {countInDraft === 1 ? 'revisado' : 'revisados'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#757682] bg-gray-100 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-[#00236f] group-hover:text-[#007a33] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#525e75] mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e5eeff] flex items-center justify-between text-xs text-[#00236f] font-semibold">
                    <span>Revisar checklist</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep('scrNuevaVisita')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Datos de Visita</span>
            </button>

            <button
              onClick={() => setCurrentStep('scrObservaciones')}
              className="px-5 py-2.5 bg-[#00236f] hover:bg-[#00174a] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continuar a Observaciones Generales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: scrRevision (Paso 3: Checklist de la Categoría Seleccionada)     */}
      {/* ========================================================================= */}
      {currentStep === 'scrRevision' && (
        <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
          {/* Header of the Selected Category */}
          <div className="bg-white p-5 rounded-2xl border border-[#dce9ff] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#00236f] flex items-center justify-center">
                {getCategoryIcon(selectedCategoryForReview.icon)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#007a33] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Inspección In-Situ
                </span>
                <h2 className="text-lg font-bold text-[#00236f] mt-0.5">
                  {selectedCategoryForReview.name}
                </h2>
                <p className="text-xs text-[#525e75]">
                  {selectedCategoryForReview.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddItemModal(selectedCategoryForReview)}
                className="px-4 py-2 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Equipo a Revisión</span>
              </button>
            </div>
          </div>

          {/* List of reviewed equipment in this category */}
          <div className="bg-white rounded-2xl border border-[#dce9ff] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8faff]">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#00236f]">
                Equipos Auditados en {selectedCategoryForReview.name}
              </h3>
              <span className="text-xs text-[#525e75]">
                {getCategoryCountInDraft(selectedCategoryForReview.id)} registrados
              </span>
            </div>

            {getCategoryCountInDraft(selectedCategoryForReview.id) === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#00236f] mx-auto flex items-center justify-center">
                  {getCategoryIcon(selectedCategoryForReview.icon)}
                </div>
                <h4 className="font-bold text-sm text-[#00236f]">
                  No se ha registrado ningún equipo en esta categoría todavía
                </h4>
                <p className="text-xs text-[#525e75] max-w-md mx-auto">
                  Haz clic en el botón para agregar el primer equipo (ej. {selectedCategoryForReview.shortCode} 1) y completar su checklist de diagnóstico.
                </p>
                <button
                  onClick={() => handleOpenAddItemModal(selectedCategoryForReview)}
                  className="px-4 py-2 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar {selectedCategoryForReview.name}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#e5eeff]">
                {(draftVisit.itemsRevision || [])
                  .filter(i => i.categoryId === selectedCategoryForReview.id)
                  .map(item => (
                    <div key={item.id} className="p-4 hover:bg-[#f8faff] transition-colors space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#00236f]">
                            {item.equipoNombre}
                          </span>
                          {item.equipmentCode && (
                            <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">
                              {item.equipmentCode}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.estado === 'Operativo'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : item.estado === 'Con observación'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}
                          >
                            {item.estado}
                          </span>
                          {item.ticketJR && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Headphones className="w-3 h-3" />
                              Ticket: {item.ticketJR}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              setDraftVisit(prev => ({
                                ...prev,
                                itemsRevision: (prev.itemsRevision || []).filter(i => i.id !== item.id)
                              }));
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic items checklist chips */}
                      {item.diagnostics && item.diagnostics.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {item.diagnostics.map((diag, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                                diag.status === 'ok'
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                  : diag.status === 'observacion'
                                  ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                                  : 'bg-rose-50/50 border-rose-200 text-rose-900'
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="font-semibold block truncate">{diag.item}</span>
                                {diag.valorMedido && (
                                  <span className="text-[10px] opacity-80 block truncate font-mono">
                                    {diag.valorMedido}
                                  </span>
                                )}
                              </div>
                              <span className="shrink-0">
                                {diag.status === 'ok' ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : diag.status === 'observacion' ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Observations and Actions text */}
                      <div className="text-xs text-[#525e75] bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex flex-wrap gap-4">
                        <div>
                          <strong className="text-[#00236f]">Observación:</strong> {item.observacion || 'Ninguna.'}
                        </div>
                        <div>
                          <strong className="text-[#007a33]">Acción realizada:</strong>{' '}
                          {item.accionRealizada || 'Inspección conforme.'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep('scrMenu')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver al Menú de Categorías</span>
            </button>

            <button
              onClick={() => setCurrentStep('scrMenu')}
              className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Guardar y Elegir Otra Categoría</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: scrEvidencias (Paso 4: Evidencias Fotográficas - Imagen 2)       */}
      {/* ========================================================================= */}
      {currentStep === 'scrEvidencias' && (
        <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
          <div className="bg-white p-5 rounded-2xl border border-[#dce9ff] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Paso 3 de 5 · Evidencias Fotográficas
              </span>
              <h2 className="text-lg font-bold text-[#00236f] mt-1">
                scrEvidencias - Galería de Registro
              </h2>
              <p className="text-xs text-[#525e75]">
                Agrega las evidencias visuales de la caminata (Gabinete de redes, POS, balanzas, cables peinados).
              </p>
            </div>

            <label className="px-4 py-2 bg-[#00236f] hover:bg-[#00174a] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
              <Camera className="w-4 h-4" />
              <span>+ Subir Foto</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const newPhoto: PreventiveVisitPhoto = {
                        id: `photo-${Date.now()}`,
                        title: file.name,
                        dataUrl: reader.result as string,
                        timestamp: new Date().toLocaleString('es-PE')
                      };
                      setDraftVisit(prev => ({
                        ...prev,
                        evidenciasGenerales: [...(prev.evidenciasGenerales || []), newPhoto]
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(draftVisit.evidenciasGenerales || []).length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-[#dce9ff] text-center space-y-3">
                <Camera className="w-12 h-12 text-[#757682] mx-auto" />
                <h4 className="font-bold text-sm text-[#00236f]">No se han adjuntado fotos todavía</h4>
                <p className="text-xs text-[#525e75]">
                  Puedes subir fotos de la inspección o continuar directamente al paso de observaciones.
                </p>
              </div>
            ) : (
              (draftVisit.evidenciasGenerales || []).map(photo => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl border border-[#dce9ff] overflow-hidden shadow-xs group"
                >
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                      src={photo.dataUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => {
                        setDraftVisit(prev => ({
                          ...prev,
                          evidenciasGenerales: (prev.evidenciasGenerales || []).filter(p => p.id !== photo.id)
                        }));
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <input
                      type="text"
                      value={photo.title}
                      onChange={e => {
                        const newTitle = e.target.value;
                        setDraftVisit(prev => ({
                          ...prev,
                          evidenciasGenerales: (prev.evidenciasGenerales || []).map(p =>
                            p.id === photo.id ? { ...p, title: newTitle } : p
                          )
                        }));
                      }}
                      className="w-full font-semibold text-xs text-[#00236f] border-b border-transparent hover:border-[#dce9ff] focus:border-[#00236f] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#757682] block mt-1 font-mono">
                      {photo.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep('scrMenu')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a Categorías</span>
            </button>

            <button
              onClick={() => setCurrentStep('scrObservaciones')}
              className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Siguiente: Observaciones y Planes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: scrObservaciones (Paso 5: Observaciones y Planes a Seguir)       */}
      {/* ========================================================================= */}
      {currentStep === 'scrObservaciones' && (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#dce9ff] shadow-md p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-[#e5eeff] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Paso 4 de 5 · Conclusiones y Plan de Acción
            </span>
            <h2 className="text-lg font-bold text-[#00236f] mt-1">
              scrObservaciones - Observaciones Generales y Planes
            </h2>
            <p className="text-xs text-[#525e75]">
              Resume el estado general de la tienda tras la caminata y los acuerdos técnicos con la gerencia.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#00236f]">Observaciones Generales de la Caminata</label>
              <textarea
                rows={4}
                value={draftVisit.observacionesGenerales || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, observacionesGenerales: e.target.value }))}
                placeholder="Detalla el estado de la tienda, cumplimiento de la ruta de caminata, nivel de orden en gabinetes y estado de cajas..."
                className="w-full p-3 border border-[#dce9ff] rounded-xl text-xs focus:ring-2 focus:ring-[#00236f]/20 leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#00236f]">Recomendaciones y Planes a Seguir (Plan de Acción)</label>
              <textarea
                rows={4}
                value={draftVisit.recomendacionesPlanes || ''}
                onChange={e => setDraftVisit(prev => ({ ...prev, recomendacionesPlanes: e.target.value }))}
                placeholder="Acciones correctivas programadas, fechas de seguimiento de tickets abiertos, pedidos de repuestos a logística..."
                className="w-full p-3 border border-[#dce9ff] rounded-xl text-xs focus:ring-2 focus:ring-[#00236f]/20 leading-relaxed"
              />
            </div>
          </div>

          <div className="border-t border-[#e5eeff] pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('scrMenu')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Volver al Menú
            </button>
            <button
              onClick={() => setCurrentStep('scrResumen')}
              className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continuar a Resumen y Firmas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 7: scrResumen (Paso 6: Resumen Ejecutivo y Firmas Digitales)        */}
      {/* ========================================================================= */}
      {currentStep === 'scrResumen' && (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#dce9ff] shadow-md p-6 space-y-6 animate-fadeIn">
          <div className="border-b border-[#e5eeff] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Paso 5 de 5 · Validación y Firma
              </span>
              <h2 className="text-lg font-bold text-[#00236f] mt-1">
                scrResumen - Resumen de la Visita Preventiva
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#007a33] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {draftVisit.numeroVisita}
            </span>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8faff] p-3 rounded-xl border border-[#dce9ff]">
              <span className="text-[11px] text-[#525e75] block">Equipos Auditados</span>
              <span className="text-xl font-extrabold text-[#00236f]">
                {(draftVisit.itemsRevision || []).length}
              </span>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-800 block">Operativos</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {(draftVisit.itemsRevision || []).filter(i => i.estado === 'Operativo').length}
              </span>
            </div>
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-800 block">Con Observación</span>
              <span className="text-xl font-extrabold text-amber-700">
                {(draftVisit.itemsRevision || []).filter(i => i.estado === 'Con observación').length}
              </span>
            </div>
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200">
              <span className="text-[11px] text-blue-800 block">Tickets Amarrados</span>
              <span className="text-xl font-extrabold text-blue-700">
                {(draftVisit.itemsRevision || []).filter(i => Boolean(i.ticketJR)).length}
              </span>
            </div>
          </div>

          {/* Store & Technical Data */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-[#00236f] block">Tienda y Ubicación:</span>
              <span className="text-[#1a1c22] font-semibold">{draftVisit.storeName}</span>
              <span className="text-[#525e75] block mt-0.5">{draftVisit.direccionFiscal}</span>
            </div>
            <div>
              <span className="font-bold text-[#00236f] block">Fecha y Horario:</span>
              <span className="text-[#1a1c22]">
                {draftVisit.fechaVisita} ({draftVisit.horaInicio} - {draftVisit.horaTermino})
              </span>
            </div>
          </div>

          {/* Digital Signatures Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#dce9ff] bg-[#f8faff] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#007a33]" />
                <span className="font-bold text-xs text-[#00236f]">Firma Operador IT Onsite</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-dashed border-[#dce9ff] text-center font-mono text-xs text-[#00236f]">
                {draftVisit.firmas?.itOperatorSignature || `${draftVisit.itOperator} - IT Tottus`}
              </div>
              <span className="text-[10px] text-[#757682] block text-center">
                Firmado digitalmente: {new Date().toLocaleDateString('es-PE')}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#dce9ff] bg-[#f8faff] space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#00236f]" />
                <span className="font-bold text-xs text-[#00236f]">Conformidad Gerente de Tienda</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-dashed border-[#dce9ff] text-center font-mono text-xs text-[#00236f]">
                {draftVisit.gerenteTienda} - Gerencia Sucursal
              </div>
              <span className="text-[10px] text-[#757682] block text-center">
                Recepción y visto bueno de auditoría in-situ
              </span>
            </div>
          </div>

          <div className="border-t border-[#e5eeff] pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('scrObservaciones')}
              className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl cursor-pointer"
            >
              Volver a Observaciones
            </button>
            <button
              onClick={handleGenerateFinalReport}
              className="px-6 py-3 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Generar Informe Oficial PDF & Sincronizar</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 8: scrFinalizada (Paso 7: Confirmación con Check Verde Power Apps)   */}
      {/* ========================================================================= */}
      {currentStep === 'scrFinalizada' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#dce9ff] shadow-xl p-8 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Power Apps · Dataverse Sync
            </span>
            <h2 className="text-2xl font-extrabold text-[#00236f]">
              ¡Informe Generado con Éxito!
            </h2>
            <p className="text-xs text-[#525e75] max-w-sm mx-auto leading-relaxed">
              La visita técnica semestral de <strong>{draftVisit.storeName}</strong> ha sido registrada, el informe PDF oficial ha sido generado y los datos se han sincronizado con la lista de SharePoint.
            </p>
          </div>

          <div className="bg-[#f8faff] p-4 rounded-2xl border border-[#dce9ff] text-xs font-mono text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-[#525e75]">N.° Informe:</span>
              <strong className="text-[#00236f]">{draftVisit.numeroVisita}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525e75]">Archivo PDF:</span>
              <strong className="text-[#007a33]">{draftVisit.informePdfNombre}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525e75]">SharePoint List ID:</span>
              <span className="text-purple-700">{draftVisit.sharepointListId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#525e75]">Estado Semáforo Tienda:</span>
              <span className="text-emerald-600 font-bold">AL DÍA (0 días transcurridos)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setReportModalVisit(draftVisit as PreventiveVisit)}
              className="px-5 py-2.5 bg-[#00236f] hover:bg-[#00174a] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Informe en Pantalla</span>
            </button>

            <button
              onClick={() => setCurrentStep('scrInicio')}
              className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR / EDITAR EQUIPO AUDITADO (Con checklist de diagnóstico)   */}
      {/* ========================================================================= */}
      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-[#dce9ff] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {editingItem.categoryName}
                </span>
                <h3 className="text-base font-bold text-[#00236f] mt-1">
                  Inspección y Diagnóstico de Equipo
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-[#757682] hover:text-[#00236f] p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-fill from store inventory */}
            {storeEquipments.length > 0 && (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-3 space-y-1.5">
                <label className="font-bold text-[#00236f] flex items-center gap-1.5 text-xs">
                  <Database className="w-3.5 h-3.5 text-[#00236f]" />
                  <span>Vincular con Equipo del Inventario Oficial (Autocompletar)</span>
                </label>
                <select
                  onChange={e => {
                    const found = storeEquipments.find(eq => eq.id === e.target.value);
                    if (found) {
                      setEditingItem(prev => ({
                        ...prev,
                        equipoNombre: `${found.name} (${found.code})`,
                        equipmentCode: found.code,
                        observacion: prev?.observacion || `Ubicación: ${found.locationInStore || 'Tienda'}. IP: ${found.ipAddress || '-'}. Switch: ${found.switchName || '-'}${found.puertoSwitch ? ` (Puerto ${found.puertoSwitch})` : ''}.`,
                        accionRealizada: prev?.accionRealizada || 'Revisión y diagnóstico preventivo en sitio.'
                      }));
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#93c5fd] rounded-lg text-xs font-semibold text-[#00236f] focus:outline-none"
                  defaultValue=""
                >
                  <option value="">-- Selecciona un equipo del inventario para rellenar datos automáticamente --</option>
                  {storeEquipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.code} - {eq.name} ({eq.categoryName.replace(' y Sistemas de Pesaje', '').replace(' y Terminales Móviles', '')})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#525e75]">
                  Al seleccionar un activo registrado en el inventario se importan automáticamente el código, nombre y datos de red, evitando duplicar registros.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#00236f]">Nombre / Número del Equipo</label>
                <input
                  type="text"
                  value={editingItem.equipoNombre || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, equipoNombre: e.target.value }))}
                  placeholder="Ej. POS Caja 01 - Rápida, CP 1..."
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#00236f]">Código de Inventario / Serie</label>
                <input
                  type="text"
                  value={editingItem.equipmentCode || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, equipmentCode: e.target.value }))}
                  placeholder="Ej. POS-358-01"
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#00236f]">Estado Físico / Operativo</label>
                <select
                  value={editingItem.estado}
                  onChange={e => setEditingItem(prev => ({ ...prev, estado: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl font-bold bg-[#f8faff]"
                >
                  <option value="Operativo">Operativo (Conforme)</option>
                  <option value="Con observación">Con observación (Requiere atención)</option>
                  <option value="No operativo / Falla">No operativo / Falla crítica</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#00236f]">Código Ticket Helpdesk / Mantenimiento Correctivo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingItem.ticketJR || ''}
                    onChange={e => setEditingItem(prev => ({ ...prev, ticketJR: e.target.value }))}
                    placeholder="Ej. INC-12345 o TK-9840"
                    className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl font-mono text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTicketCode = `INC-${Math.floor(10000 + Math.random() * 90000)}`;
                      setEditingItem(prev => ({ ...prev, ticketJR: newTicketCode }));
                    }}
                    className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-bold rounded-xl shrink-0 cursor-pointer"
                    title="Autogenerar código de ticket correctivo"
                  >
                    Auto Generar
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist items specific to this category */}
            <div className="space-y-2 pt-2 border-t border-[#e5eeff]">
              <label className="font-bold text-xs text-[#00236f] block">
                Puntos de Control y Diagnósticos Técnicos
              </label>

              <div className="space-y-2 text-xs">
                {(editingItem.diagnostics || []).map((diag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-[#dce9ff] bg-[#f8faff] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-[180px]">
                      <span className="font-semibold text-[#00236f]">{diag.item}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Medición / Comentario (ej. 100%, 21°C)"
                        value={diag.valorMedido || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEditingItem(prev => {
                            const updatedDiags = [...(prev?.diagnostics || [])];
                            updatedDiags[idx] = { ...updatedDiags[idx], valorMedido: val };
                            return { ...prev, diagnostics: updatedDiags };
                          });
                        }}
                        className="px-2 py-1 bg-white border border-[#dce9ff] rounded-lg text-xs w-36 font-mono"
                      />

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(prev => {
                              const updatedDiags = [...(prev?.diagnostics || [])];
                              updatedDiags[idx] = { ...updatedDiags[idx], status: 'ok' };
                              return { ...prev, diagnostics: updatedDiags };
                            });
                          }}
                          className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                            diag.status === 'ok'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title="OK / Conforme"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(prev => {
                              const updatedDiags = [...(prev?.diagnostics || [])];
                              updatedDiags[idx] = { ...updatedDiags[idx], status: 'observacion' };
                              return { ...prev, diagnostics: updatedDiags };
                            });
                          }}
                          className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                            diag.status === 'observacion'
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                          }`}
                          title="Con observación"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(prev => {
                              const updatedDiags = [...(prev?.diagnostics || [])];
                              updatedDiags[idx] = { ...updatedDiags[idx], status: 'falla' };
                              return { ...prev, diagnostics: updatedDiags };
                            });
                          }}
                          className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                            diag.status === 'falla'
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                          }`}
                          title="Falla"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations and Actions */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#00236f]">Observación Detectada</label>
                <input
                  type="text"
                  value={editingItem.observacion || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, observacion: e.target.value }))}
                  placeholder="Ej. Impresora con corte irregular, polvo acumulado en switch, etc."
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#007a33]">Acción Realizada en Sitio</label>
                <input
                  type="text"
                  value={editingItem.accionRealizada || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, accionRealizada: e.target.value }))}
                  placeholder="Ej. Limpieza con alcohol isopropílico, reordenamiento de patch cords..."
                  className="w-full px-3 py-2 border border-[#dce9ff] rounded-xl"
                />
              </div>
            </div>

            <div className="border-t border-[#e5eeff] pt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReviewedItem}
                className="px-5 py-2.5 bg-[#007a33] hover:bg-[#005a26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Equipo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISOR DE INFORME TÉCNICO OFICIAL PDF (Descargar / Imprimir)        */}
      {/* ========================================================================= */}
      {reportModalVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {/* Modal Actions Bar */}
            <div className="bg-[#00236f] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">
                    {reportModalVisit.informePdfNombre || `Informe_Visita_${reportModalVisit.storeCode}.pdf`}
                  </h3>
                  <span className="text-[10px] text-blue-200 font-mono">
                    SharePoint Dataverse: {reportModalVisit.sharepointListId || 'SP-LIST-TOTTUS-VIS'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => {
                    alert(`Descargando documento oficial: ${reportModalVisit.informePdfNombre || 'informe.pdf'}`);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setReportModalVisit(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs bg-[#fafbfc] print:p-0 print:bg-white">
              {/* Header with Tottus / Falabella branding */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#007a33] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                    T
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#007a33] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Hipermercados Tottus S.A. · Gerencia de TI
                    </span>
                    <h1 className="text-base md:text-lg font-bold text-[#00236f] mt-0.5">
                      INFORME TÉCNICO DE VISITA PREVENTIVA (CAMINATA SEMESTRAL)
                    </h1>
                    <span className="text-[11px] text-[#525e75]">
                      Auditoría Local de Infraestructura, Puntos de Venta (POS), Gabinetes de Red y Balanzas
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-[#00236f]">{reportModalVisit.numeroVisita}</div>
                  <div className="text-emerald-700 font-semibold">{reportModalVisit.fechaVisita}</div>
                  <div className="text-[#757682] text-[10px]">
                    {reportModalVisit.horaInicio} - {reportModalVisit.horaTermino}
                  </div>
                </div>
              </div>

              {/* Store & Header Data Table */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Tienda</span>
                  <strong className="text-xs text-[#00236f]">{reportModalVisit.storeName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Código Tienda</span>
                  <strong className="text-xs text-[#007a33] font-mono">{reportModalVisit.storeCode}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Operador IT</span>
                  <strong className="text-xs text-[#1a1c22]">{reportModalVisit.itOperator}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Gerente de Tienda</span>
                  <strong className="text-xs text-[#1a1c22]">{reportModalVisit.gerenteTienda}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Dirección Fiscal</span>
                  <span className="text-xs text-[#525e75]">{reportModalVisit.direccionFiscal}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Personal Permanente</span>
                  <span className="text-xs text-[#525e75] font-semibold">{reportModalVisit.personalPermanente} colaboradores</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#757682] uppercase font-bold block">Estado de Auditoría</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    {reportModalVisit.estado}
                  </span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#757682] block">Total Equipos</span>
                  <span className="text-lg font-bold text-[#00236f]">
                    {reportModalVisit.totalEquipos || reportModalVisit.itemsRevision?.length || 0}
                  </span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block">Operativos</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {reportModalVisit.operativosCount ||
                      reportModalVisit.itemsRevision?.filter(i => i.estado === 'Operativo').length ||
                      0}
                  </span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 block">Con Observación</span>
                  <span className="text-lg font-bold text-amber-700">
                    {reportModalVisit.conObservacionCount ||
                      reportModalVisit.itemsRevision?.filter(i => i.estado === 'Con observación').length ||
                      0}
                  </span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-800 block">Tickets Correctivos</span>
                  <span className="text-lg font-bold text-blue-700">
                    {reportModalVisit.ticketsGeneradosCount ||
                      reportModalVisit.itemsRevision?.filter(i => Boolean(i.ticketJR)).length ||
                      0}
                  </span>
                </div>
              </div>

              {/* Detailed Review Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-3.5 bg-gray-50 border-b border-gray-200 font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  Detalle de Inspección de Equipos y Gabinetes
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f4fd] text-[#00236f] font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Equipo</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3">Diagnósticos</th>
                      <th className="py-2.5 px-3">Observación / Acción</th>
                      <th className="py-2.5 px-3">Ticket Correctivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(reportModalVisit.itemsRevision || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-[#757682]">
                          Sin registros de equipos detallados.
                        </td>
                      </tr>
                    ) : (
                      reportModalVisit.itemsRevision.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-semibold text-[#007a33]">
                            {item.categoryName}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#00236f]">
                            {item.equipoNombre}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.estado === 'Operativo'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {item.estado}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[#525e75]">
                            {item.diagnostics?.map((d, idx) => (
                              <div key={idx} className="flex items-center gap-1 font-mono text-[10px]">
                                <span className={d.status === 'ok' ? 'text-emerald-600' : 'text-amber-600'}>
                                  {d.status === 'ok' ? '✔' : '⚠'}
                                </span>
                                <span>{d.item}: {d.valorMedido || 'OK'}</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-2.5 px-3 text-[11px]">
                            <div><strong>Obs:</strong> {item.observacion || '-'}</div>
                            <div className="text-emerald-700"><strong>Acción:</strong> {item.accionRealizada || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                            {item.ticketJR || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* General Observations & Action Plans */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#00236f]">
                    Observaciones Generales de la Visita
                  </h4>
                  <p className="text-xs text-[#525e75] mt-1 leading-relaxed">
                    {reportModalVisit.observacionesGenerales || 'Visita conforme a protocolo.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#007a33]">
                    Recomendaciones y Planes a Seguir (Mantenimiento Preventivo & Correctivo)
                  </h4>
                  <p className="text-xs text-[#525e75] mt-1 leading-relaxed">
                    {reportModalVisit.recomendacionesPlanes || 'Continuar con el cronograma semestral.'}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center space-y-1">
                  <div className="h-12 border-b border-gray-300 flex items-end justify-center font-mono text-xs text-[#00236f] pb-1">
                    {reportModalVisit.firmas?.itOperatorSignature || `${reportModalVisit.itOperator} - IT Onsite`}
                  </div>
                  <span className="font-bold text-xs text-[#00236f] block">Operador IT Onsite</span>
                  <span className="text-[10px] text-[#757682] block">
                    {reportModalVisit.firmas?.itOperatorSignedAt || reportModalVisit.fechaVisita}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center space-y-1">
                  <div className="h-12 border-b border-gray-300 flex items-end justify-center font-mono text-xs text-[#00236f] pb-1">
                    {reportModalVisit.firmas?.gerenteSignature || `${reportModalVisit.gerenteTienda} - Gerencia`}
                  </div>
                  <span className="font-bold text-xs text-[#00236f] block">Gerente de Tienda (Conforme)</span>
                  <span className="text-[10px] text-[#757682] block">
                    {reportModalVisit.firmas?.gerenteSignedAt || reportModalVisit.fechaVisita}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ClipboardCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}
