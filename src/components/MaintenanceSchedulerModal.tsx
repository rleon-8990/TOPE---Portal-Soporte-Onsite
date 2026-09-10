import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Layers,
  Store as StoreIcon,
  Users,
  CheckSquare,
  Wrench,
  Clock,
  Send,
  Mail,
  Sparkles,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Camera,
  RotateCcw,
  Check,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  WorkOrder,
  Equipment,
  Store,
  AppUser,
  MaintenanceType,
  MaintenanceFrequency,
  WorkOrderStatus,
  Region
} from '../types';
import { INITIAL_USERS } from '../data/mockData';

export interface MaintenanceSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  equipments: Equipment[];
  users?: AppUser[];
  currentUser?: AppUser;
  onAddWorkOrder: (newWo: Partial<WorkOrder>) => void;
  onAddBulkWorkOrders?: (newWos: Partial<WorkOrder>[]) => void;
  initialStoreId?: string;
  defaultMode?: 'individual' | 'masivo';
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
    'Revisión de presiones de succión y descarga de refrigerante R410A / R404A',
    'Limpieza profunda y desinfección química de evaporador y condensadores',
    'Inspección de drenaje de condensado y prueba de flujo continuo',
    'Verificación de rodamientos de motor ventilador y lubricación',
    'Chequeo de contactores eléctricos, capacitores y panel Dixell'
  ],
  pos_cajas: [
    'Limpieza óptica de escáner bióptico / de mano',
    'Prueba de corte y tracción en impresora térmica de tickets',
    'Verificación de puerto Ethernet / USB y dirección IP en switch',
    'Aspirado interno de polvo en motherboard y fuente de poder',
    'Prueba de contingencia offline y gaveta de dinero'
  ],
  balanzas: [
    'Nivelación de burbuja y soporte mecánico',
    'Prueba de pesaje con masas patrón certificadas (linealidad metrológica)',
    'Limpieza de cabezal térmico y platillo de acero inoxidable',
    'Calibración de celda de carga y verificación de precintos INACAL',
    'Prueba de transmisión Ethernet hacia servidor central de precios'
  ],
  redes: [
    'Verificación de puertos Gigabit Ethernet y enlaces troncales de fibra óptica',
    'Limpieza y aspirado de gabinete Rack de Telecomunicaciones',
    'Inspección de fuentes de poder redundantes y balance de carga PoE',
    'Comprobación de conectividad hacia APs de pasillo y POS',
    'Revisión de registros de temperatura y ventiladores del Switch Core'
  ]
};

const BULK_CAMPAIGN_TEMPLATES = [
  {
    id: 'campana_balanzas',
    name: 'Campaña Preventiva Trimestral de Balanzas y Checkouts',
    categoryName: 'Balanzas y Cajas',
    frequency: 'trimestral' as MaintenanceFrequency,
    priority: 'Alta' as const,
    presetKey: 'balanzas' as const,
    description: 'Calibración metrológica, limpieza de cabezales y pruebas de pesaje en las balanzas de frescos y cajas.',
    estimatedHours: 4
  },
  {
    id: 'campana_frio',
    name: 'Mantenimiento Preventivo de Centrales de Frío y Cámaras Frigoríficas',
    categoryName: 'Centrales Frigoríficas',
    frequency: 'semestral' as MaintenanceFrequency,
    priority: 'Alta' as const,
    presetKey: 'hvac' as const,
    description: 'Inspección de presiones, detección de fugas, condensadores y sistemas Dixell en cámaras y vitrinas.',
    estimatedHours: 6
  },
  {
    id: 'campana_redes',
    name: 'Inspección y Limpieza de Racks, Switches y Puntos de Acceso WiFi',
    categoryName: 'Redes y Comunicaciones',
    frequency: 'semestral' as MaintenanceFrequency,
    priority: 'Media' as const,
    presetKey: 'redes' as const,
    description: 'Mantenimiento de gabinete telecom, ordenamiento de patch cords, PoE y enlace de contingencia.',
    estimatedHours: 3
  },
  {
    id: 'campana_pos',
    name: 'Revisión Integral de Terminales POS NCR y Periféricos',
    categoryName: 'Puntos de Ventas POS',
    frequency: 'trimestral' as MaintenanceFrequency,
    priority: 'Alta' as const,
    presetKey: 'pos_cajas' as const,
    description: 'Aspirado interno, limpieza de escáneres, firmware y prueba de impresión en todas las cajas de tienda.',
    estimatedHours: 5
  },
  {
    id: 'campana_integral',
    name: 'Plan Preventivo General de Tiendas (Clima, Iluminación, Balanzas y Redes)',
    categoryName: 'Mantenimiento Integral',
    frequency: 'anual' as MaintenanceFrequency,
    priority: 'Media' as const,
    presetKey: 'general' as const,
    description: 'Inspección completa multidisciplinaria de infraestructura crítica en toda la sucursal.',
    estimatedHours: 8
  }
];

export const MaintenanceSchedulerModal: React.FC<MaintenanceSchedulerModalProps> = ({
  isOpen,
  onClose,
  stores,
  equipments,
  users = INITIAL_USERS,
  currentUser,
  onAddWorkOrder,
  onAddBulkWorkOrders,
  initialStoreId,
  defaultMode = 'individual'
}) => {
  if (!isOpen) return null;

  // Main Active Mode
  const [activeMode, setActiveMode] = useState<'individual' | 'masivo'>(defaultMode);

  // ----------------------------------------------------
  // INDIVIDUAL MODE STATE
  // ----------------------------------------------------
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (initialStoreId) return initialStoreId;
    return stores[0]?.id || '';
  });

  const selectedStore = useMemo(() => {
    return stores.find(s => s.id === selectedStoreId) || stores[0];
  }, [stores, selectedStoreId]);

  // Equipments filtered for the selected store
  const storeEquipments = useMemo(() => {
    if (!selectedStore) return [];
    return equipments.filter(
      eq => eq.storeId === selectedStore.id || eq.storeName.toLowerCase().includes(selectedStore.name.toLowerCase())
    );
  }, [equipments, selectedStore]);

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('general');
  const [indivType, setIndivType] = useState<MaintenanceType>('preventivo');
  const [indivFrequency, setIndivFrequency] = useState<MaintenanceFrequency>('semestral');
  const [indivDate, setIndivDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [indivShift, setIndivShift] = useState<string>('Turno Noche (22:00 - 06:00)');
  const [indivPriority, setIndivPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [indivTechnician, setIndivTechnician] = useState<string>('Ing. Carlos Ramos');
  const [indivChecklistItems, setIndivChecklistItems] = useState<string[]>([...CHECKLIST_PRESETS.general]);
  const [indivCustomCheckItem, setIndivCustomCheckItem] = useState('');

  // Individual Email Options
  const [indivSendEmail, setIndivSendEmail] = useState<boolean>(true);
  const [indivSelectedEmails, setIndivSelectedEmails] = useState<string[]>([]);
  const [indivEmailSubject, setIndivEmailSubject] = useState<string>('');
  const [indivEmailNotes, setIndivEmailNotes] = useState<string>('');

  // ----------------------------------------------------
  // MASIVO MODE STATE
  // ----------------------------------------------------
  const [selectedCampaignTemplateId, setSelectedCampaignTemplateId] = useState<string>(BULK_CAMPAIGN_TEMPLATES[0].id);
  const selectedCampaignTemplate = useMemo(() => {
    return BULK_CAMPAIGN_TEMPLATES.find(t => t.id === selectedCampaignTemplateId) || BULK_CAMPAIGN_TEMPLATES[0];
  }, [selectedCampaignTemplateId]);

  const [bulkStartDate, setBulkStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bulkShift, setBulkShift] = useState<string>('Turno Noche (22:00 - 06:00)');
  const [bulkTechnicianTeam, setBulkTechnicianTeam] = useState<string>('Cuadrilla Especializada por Región');
  const [bulkPriority, setBulkPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  
  // Store selection for bulk
  const [bulkStoreScope, setBulkStoreScope] = useState<'todas' | 'Lima y Callao' | 'Zona Norte' | 'Zona Sur' | 'Zona Oriente' | 'custom'>('todas');
  const [bulkSelectedStoreIds, setBulkSelectedStoreIds] = useState<string[]>(() => stores.map(s => s.id));
  const [bulkStoreSearch, setBulkStoreSearch] = useState('');

  // Bulk Email Options
  const [bulkSendEmail, setBulkSendEmail] = useState<boolean>(true);
  const [bulkRecipientTypes, setBulkRecipientTypes] = useState<{
    gerentes: boolean;
    itOperators: boolean;
    supervisores: boolean;
    mantenimiento: boolean;
  }>({
    gerentes: true,
    itOperators: true,
    supervisores: true,
    mantenimiento: false
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);

  // ----------------------------------------------------
  // DIRECTORY RECIPIENTS LOGIC (REQUERIMIENTO PRINCIPAL)
  // ----------------------------------------------------
  // Get directory users mapped to the individually selected store
  const storeDirectoryUsers = useMemo(() => {
    if (!selectedStore) return [];

    const storeCod = String(selectedStore.codTienda || '');
    const storeNameLower = selectedStore.name.toLowerCase();

    const matched = users.filter(u => {
      if (u.codTienda && String(u.codTienda) === storeCod) return true;
      if (u.storeId && (u.storeId === selectedStore.id || u.storeId === `store-${storeCod}`)) return true;
      if (u.tiendaNombre && (storeNameLower.includes(u.tiendaNombre.toLowerCase()) || u.tiendaNombre.toLowerCase().includes(storeNameLower))) return true;
      if ((u.role.includes('Supervisor') || u.role.includes('Zonal')) && u.assignedRegion === selectedStore.region) return true;
      return false;
    });

    // Ensure store manager is present
    if (!matched.some(u => u.role.includes('Gerente') || u.role.includes('Jefe de Tienda')) && selectedStore.gerenteTienda) {
      matched.push({
        id: `synth-mgr-${selectedStore.id}`,
        name: selectedStore.gerenteTienda,
        email: selectedStore.managerEmail || `${selectedStore.gerenteTienda.toLowerCase().replace(/\s+/g, '.')}@tottus.com.pe`,
        role: 'Gerente de Tienda',
        cargo: 'Gerente de Tienda',
        phone: selectedStore.phone || '+51 980 000 000',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    // Ensure IT Operator is present
    if (!matched.some(u => u.role.includes('IT Operator') || u.cargo?.includes('IT')) && selectedStore.itOperator) {
      matched.push({
        id: `synth-it-${selectedStore.id}`,
        name: selectedStore.itOperator,
        email: `${selectedStore.itOperator.toLowerCase().replace(/\s+/g, '.')}@tottus.com.pe`,
        role: 'IT Operator',
        cargo: 'IT Operator Onsite',
        phone: '+51 950 000 000',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    // Ensure Regional Supervisor is present
    if (!matched.some(u => u.role.includes('Supervisor') || u.role.includes('Zonal'))) {
      const zonalName = selectedStore.gZonal || 'Supervisor Zonal ' + selectedStore.region;
      matched.push({
        id: `synth-zonal-${selectedStore.region}`,
        name: zonalName,
        email: `zonal.${selectedStore.region.toLowerCase().replace(/\s+/g, '')}@tottus.com.pe`,
        role: 'Supervisor Regional',
        cargo: 'Gerencia Zonal',
        phone: '+51 990 123 456',
        assignedRegion: selectedStore.region,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        userType: 'tienda',
        codTienda: selectedStore.codTienda,
        tiendaNombre: selectedStore.name,
        storeId: selectedStore.id
      });
    }

    return matched;
  }, [selectedStore, users]);

  // Update Individual Subject and Preselect default recipients when store changes
  React.useEffect(() => {
    if (selectedStore) {
      setIndivEmailSubject(`[Tottus Onsite] Aviso de Mantenimiento Preventivo - ${selectedStore.name} (${selectedStore.code || selectedStore.codTienda})`);
      const defaults = storeDirectoryUsers
        .filter(u => u.role.includes('Gerente') || u.role.includes('IT Operator') || u.cargo?.includes('IT'))
        .map(u => u.email);
      setIndivSelectedEmails(defaults.length > 0 ? defaults : storeDirectoryUsers.map(u => u.email));
    }
  }, [selectedStore, storeDirectoryUsers]);

  // BUTTON GROUP HANDLERS FOR INDIVIDUAL DIRECTORY RECIPIENTS (SOLICITADO POR EL USUARIO)
  const handleSelectAllStoreRecipients = () => {
    setIndivSelectedEmails(storeDirectoryUsers.map(u => u.email));
  };

  const handleSelectManagersOnly = () => {
    const mgrs = storeDirectoryUsers.filter(u => 
      u.role.includes('Gerente') || u.role.includes('Jefe de Tienda') || u.cargo?.includes('Gerente')
    ).map(u => u.email);
    setIndivSelectedEmails(mgrs);
  };

  const handleSelectItOperatorsOnly = () => {
    const its = storeDirectoryUsers.filter(u => 
      u.role.includes('IT Operator') || u.cargo?.includes('IT') || u.role.includes('Informática')
    ).map(u => u.email);
    setIndivSelectedEmails(its);
  };

  const handleSelectMaintenanceOnly = () => {
    const maints = storeDirectoryUsers.filter(u => 
      u.role.includes('Mantenimiento') || u.cargo?.includes('Mantenimiento') || u.role.includes('Técnico')
    ).map(u => u.email);
    setIndivSelectedEmails(maints);
  };

  const handleSelectSupervisorsOnly = () => {
    const sups = storeDirectoryUsers.filter(u => 
      u.role.includes('Supervisor') || u.role.includes('Zonal') || u.cargo?.includes('Zonal')
    ).map(u => u.email);
    setIndivSelectedEmails(sups);
  };

  const handleClearIndividualRecipients = () => {
    setIndivSelectedEmails([]);
  };

  const toggleIndivEmail = (email: string) => {
    setIndivSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  // ----------------------------------------------------
  // MASIVO SCOPE HANDLERS
  // ----------------------------------------------------
  const handleApplyScope = (scope: 'todas' | 'Lima y Callao' | 'Zona Norte' | 'Zona Sur' | 'Zona Oriente') => {
    setBulkStoreScope(scope);
    if (scope === 'todas') {
      setBulkSelectedStoreIds(stores.map(s => s.id));
    } else {
      setBulkSelectedStoreIds(stores.filter(s => s.region === scope).map(s => s.id));
    }
  };

  const toggleBulkStoreId = (id: string) => {
    setBulkStoreScope('custom');
    setBulkSelectedStoreIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Selected stores for bulk creation
  const selectedBulkStores = useMemo(() => {
    return stores.filter(s => bulkSelectedStoreIds.includes(s.id));
  }, [stores, bulkSelectedStoreIds]);

  // Bulk Directory Recipients calculation based on chosen checkboxes
  const bulkTotalRecipientsCount = useMemo(() => {
    let count = 0;
    if (bulkRecipientTypes.gerentes) count += selectedBulkStores.length; // 1 manager per store
    if (bulkRecipientTypes.itOperators) count += selectedBulkStores.length; // 1 IT op per store
    if (bulkRecipientTypes.supervisores) count += 5; // 5 regional zonal supervisors
    if (bulkRecipientTypes.mantenimiento) count += 6; // 6 regional maintenance heads
    return count;
  }, [bulkRecipientTypes, selectedBulkStores]);

  // ----------------------------------------------------
  // SUBMISSION LOGIC
  // ----------------------------------------------------
  const handleSaveIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const targetEq = storeEquipments.find(e => e.id === selectedEquipmentId) || {
      id: `eq-gen-${selectedStore.id}`,
      code: `EQ-${selectedStore.code || selectedStore.codTienda}`,
      name: 'Mantenimiento General de Equipos e Instalaciones Críticas'
    };

    const newCode = `OT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newWo: Partial<WorkOrder> = {
      id: `wo-${Date.now()}`,
      code: newCode,
      orderNumber: newCode,
      equipmentId: targetEq.id,
      equipmentCode: targetEq.code,
      equipmentName: targetEq.name,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      region: selectedStore.region,
      type: indivType,
      frequency: indivFrequency,
      status: 'Programado',
      date: indivDate,
      scheduledDate: indivDate,
      technician: indivTechnician,
      priority: indivPriority,
      notes: `Horario: ${indivShift}. ${indivEmailNotes ? 'Notas: ' + indivEmailNotes : ''}`,
      checklist: indivChecklistItems.map(item => ({
        item,
        status: 'na'
      }))
    };

    onAddWorkOrder(newWo);

    setTimeout(() => {
      setIsProcessing(false);
      setProcessSuccess(`✅ Orden ${newCode} programada para ${selectedStore.name}.${indivSendEmail ? ` Correo oficial despachado a ${indivSelectedEmails.length} destinatarios del directorio.` : ''}`);
      confetti({ particleCount: 60, spread: 50 });

      setTimeout(() => {
        setProcessSuccess(null);
        onClose();
      }, 2000);
    }, 800);
  };

  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBulkStores.length === 0) {
      alert('⚠️ Por favor seleccione al menos una tienda para la programación masiva.');
      return;
    }

    setIsProcessing(true);

    const presetItems = CHECKLIST_PRESETS[selectedCampaignTemplate.presetKey] || CHECKLIST_PRESETS.general;

    const newOrders: Partial<WorkOrder>[] = selectedBulkStores.map((store, index) => {
      const code = `OT-CAMP-${Math.floor(2000 + index * 10 + Math.random() * 9)}`;
      return {
        id: `wo-bulk-${Date.now()}-${index}`,
        code,
        orderNumber: code,
        equipmentId: `eq-camp-${store.id}`,
        equipmentCode: `CAMP-${selectedCampaignTemplate.presetKey.toUpperCase()}`,
        equipmentName: `${selectedCampaignTemplate.name} — ${store.name}`,
        storeId: store.id,
        storeName: store.name,
        region: store.region,
        type: 'preventivo',
        frequency: selectedCampaignTemplate.frequency,
        status: 'Programado',
        date: bulkStartDate,
        scheduledDate: bulkStartDate,
        technician: bulkTechnicianTeam,
        priority: bulkPriority,
        notes: `Campaña Multitienda: ${selectedCampaignTemplate.name}. Ventana: ${bulkShift}.`,
        checklist: presetItems.map(item => ({
          item,
          status: 'na'
        }))
      };
    });

    if (onAddBulkWorkOrders) {
      onAddBulkWorkOrders(newOrders);
    } else {
      newOrders.forEach(o => onAddWorkOrder(o));
    }

    setTimeout(() => {
      setIsProcessing(false);
      setProcessSuccess(`🎉 ¡Campaña masiva programada con éxito! Se crearon ${newOrders.length} órdenes de trabajo en ${newOrders.length} tiendas.${bulkSendEmail ? ` Se enviaron ${bulkTotalRecipientsCount} notificaciones M365 al personal del directorio.` : ''}`);
      confetti({ particleCount: 100, spread: 80 });

      setTimeout(() => {
        setProcessSuccess(null);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#dce9ff] overflow-hidden animate-slideUp">
        
        {/* Modal Header with Mode Tabs */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Calendar className="w-5 h-5 text-[#fd761a]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Programación de Mantenimiento Preventivo
              </h3>
              <p className="text-xs text-white/80">
                Gestión individual por tienda o masiva con plantillas institucionales y despacho de correos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Tab Switcher */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 border border-white/20">
              <button
                type="button"
                onClick={() => setActiveMode('individual')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMode === 'individual'
                    ? 'bg-white text-[#00236f] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <StoreIcon className="w-3.5 h-3.5" />
                <span>Individual (Por Tienda)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('masivo')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMode === 'masivo'
                    ? 'bg-white text-[#00236f] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#fd761a]" />
                <span>Masiva (90 Tiendas)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#0b1c30]">
          
          {/* ======================================================== */}
          {/* INDIVIDUAL PROGRAMMING MODE */}
          {/* ======================================================== */}
          {activeMode === 'individual' && (
            <form onSubmit={handleSaveIndividual} className="space-y-5">
              
              {/* Step 1: Tienda Selection & Details */}
              <div className="bg-[#f8faff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                    <StoreIcon className="w-4 h-4 text-[#00236f]" />
                    <span>1. Tienda de Destino</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#525e75]">
                    {stores.length} tiendas disponibles en red nacional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={selectedStoreId}
                      onChange={e => setSelectedStoreId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                    >
                      {stores.map(st => (
                        <option key={st.id} value={st.id}>
                          T-{st.codTienda || st.code} — {st.name} ({st.region})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-[#e5eeff] text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#00236f]">{selectedStore?.name}</div>
                      <div className="text-[11px] text-[#525e75]">
                        Gerente: <strong>{selectedStore?.gerenteTienda || selectedStore?.manager || 'Asignado'}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded-full font-bold">
                      {selectedStore?.region}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Equipo y Parámetros */}
              <div className="bg-white p-4 rounded-xl border border-[#dce9ff] space-y-3 shadow-2xs">
                <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                  <Wrench className="w-4 h-4 text-[#00236f]" />
                  <span>2. Parámetros de la Orden de Trabajo</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Equipo Específico a Intervenir
                    </label>
                    <select
                      value={selectedEquipmentId}
                      onChange={e => setSelectedEquipmentId(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="general">
                        ⚡ Mantenimiento General de Equipos e Instalaciones Críticas de Tienda
                      </option>
                      {storeEquipments.map(eq => (
                        <option key={eq.id} value={eq.id}>
                          {eq.code} — {eq.name} ({eq.categoryName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Prioridad
                    </label>
                    <select
                      value={indivPriority}
                      onChange={e => setIndivPriority(e.target.value as 'Alta' | 'Media' | 'Baja')}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Tipo de Mantenimiento
                    </label>
                    <select
                      value={indivType}
                      onChange={e => setIndivType(e.target.value as MaintenanceType)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="preventivo">Preventivo Programado</option>
                      <option value="calibracion">Calibración Metrológica</option>
                      <option value="inspeccion">Inspección de Rutina</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Frecuencia
                    </label>
                    <select
                      value={indivFrequency}
                      onChange={e => setIndivFrequency(e.target.value as MaintenanceFrequency)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Fecha de Ejecución
                    </label>
                    <input
                      type="date"
                      required
                      value={indivDate}
                      onChange={e => setIndivDate(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Ventana Operativa
                    </label>
                    <select
                      value={indivShift}
                      onChange={e => setIndivShift(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="Turno Noche (22:00 - 06:00)">Turno Noche (22:00 - 06:00)</option>
                      <option value="Apertura Tienda (07:00 - 12:00)">Apertura (07:00 - 12:00)</option>
                      <option value="Horario Completo (09:00 - 18:00)">Diurno (09:00 - 18:00)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                    Técnico / Cuadrilla Asignada
                  </label>
                  <select
                    value={indivTechnician}
                    onChange={e => setIndivTechnician(e.target.value)}
                    className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f]"
                  >
                    {users.filter(u => u.role.includes('Técnico') || u.role.includes('Supervisor') || u.role.includes('Mantenimiento')).map(u => (
                      <option key={u.id} value={u.name}>
                        {u.name} — {u.role} ({u.specialty || u.assignedRegion})
                      </option>
                    ))}
                    <option value="Cuadrilla Especializada Onsite">Cuadrilla Especializada Onsite</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Checklist Personalizable con Presets Rápidos */}
              <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-1.5 uppercase">
                    <CheckSquare className="w-4 h-4 text-[#00236f]" />
                    <span>Checklist de Inspección ({indivChecklistItems.length} Puntos)</span>
                  </label>

                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-[#757682] mr-1">Plantilla rápida:</span>
                    <button
                      type="button"
                      onClick={() => setIndivChecklistItems([...CHECKLIST_PRESETS.general])}
                      className="px-2 py-0.5 font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      General
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndivChecklistItems([...CHECKLIST_PRESETS.hvac])}
                      className="px-2 py-0.5 font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      Frío/HVAC
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndivChecklistItems([...CHECKLIST_PRESETS.pos_cajas])}
                      className="px-2 py-0.5 font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      POS Cajas
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndivChecklistItems([...CHECKLIST_PRESETS.balanzas])}
                      className="px-2 py-0.5 font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      Balanzas
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndivChecklistItems([...CHECKLIST_PRESETS.redes])}
                      className="px-2 py-0.5 font-semibold bg-white border border-[#dce9ff] rounded hover:bg-[#eff4ff]"
                    >
                      Redes
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {indivChecklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-[#dce9ff]">
                      <span className="text-xs font-bold text-[#00236f] w-5 text-center">{idx + 1}.</span>
                      <span className="text-xs text-[#0b1c30] flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => setIndivChecklistItems(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escriba otra tarea o punto de inspección a añadir..."
                    value={indivCustomCheckItem}
                    onChange={e => setIndivCustomCheckItem(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (indivCustomCheckItem.trim()) {
                          setIndivChecklistItems(prev => [...prev, indivCustomCheckItem.trim()]);
                          setIndivCustomCheckItem('');
                        }
                      }
                    }}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-[#0b1c30] focus:ring-1 focus:ring-[#00236f] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (indivCustomCheckItem.trim()) {
                        setIndivChecklistItems(prev => [...prev, indivCustomCheckItem.trim()]);
                        setIndivCustomCheckItem('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#00236f] text-white text-xs font-semibold rounded-lg hover:bg-[#1e3a8a] transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Step 4: NOTIFICACIÓN POR CORREO CON GRUPO DE BOTONES DE DESTINATARIOS (EXPLICIT USER REQUIREMENT) */}
              <div className="bg-[#f8faff] p-4 rounded-xl border border-[#c4dcff] space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide cursor-pointer">
                    <input
                      type="checkbox"
                      checked={indivSendEmail}
                      onChange={e => setIndivSendEmail(e.target.checked)}
                      className="w-4 h-4 text-[#00236f] rounded border-gray-300 focus:ring-[#00236f]"
                    />
                    <Mail className="w-4 h-4 text-[#fd761a]" />
                    <span>3. Notificar por Correo Oficial a Destinatarios del Directorio</span>
                  </label>

                  <span className="text-[11px] font-bold text-[#007a33] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    🟢 Outlook Conectado
                  </span>
                </div>

                {indivSendEmail && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-[#525e75]">
                      Al elegir la tienda, selecciona los destinatarios registrados en el <strong>Directorio Corporativo</strong> usando el grupo de botones:
                    </p>

                    {/* GRUPO DE BOTONES PARA DESTINATARIOS DEL DIRECTORIO */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-[#c4dcff] shadow-2xs">
                      <span className="text-[11px] font-bold text-[#00236f] px-1 mr-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#fd761a]" />
                        <span>Filtro Rápido:</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleSelectAllStoreRecipients}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f0f4ff] border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>👥 Todos en Tienda</span>
                        <span className="text-[10px] bg-white text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                          {storeDirectoryUsers.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectManagersOnly}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f0f4ff] border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>👤 Gerente Tienda</span>
                        <span className="text-[10px] bg-white text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                          {storeDirectoryUsers.filter(u => u.role.includes('Gerente') || u.role.includes('Jefe de Tienda')).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectItOperatorsOnly}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f0f4ff] border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>💻 IT Operator</span>
                        <span className="text-[10px] bg-white text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                          {storeDirectoryUsers.filter(u => u.role.includes('IT Operator') || u.cargo?.includes('IT')).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectMaintenanceOnly}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f0f4ff] border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>🔧 Mantenimiento</span>
                        <span className="text-[10px] bg-white text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                          {storeDirectoryUsers.filter(u => u.role.includes('Mantenimiento') || u.cargo?.includes('Mantenimiento')).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSelectSupervisorsOnly}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#f0f4ff] border border-[#b4c8f0] text-[#00236f] hover:bg-[#00236f] hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>🏢 Supervisor Zonal</span>
                        <span className="text-[10px] bg-white text-[#00236f] px-1.5 py-0.2 rounded-full font-bold">
                          {storeDirectoryUsers.filter(u => u.role.includes('Supervisor') || u.role.includes('Zonal')).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearIndividualRecipients}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all ml-auto"
                      >
                        <span>Limpiar</span>
                      </button>
                    </div>

                    {/* Recipient Cards with Checkboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                      {storeDirectoryUsers.map(user => {
                        const isChecked = indivSelectedEmails.includes(user.email);
                        return (
                          <div
                            key={user.id}
                            onClick={() => toggleIndivEmail(user.email)}
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 select-none ${
                              isChecked
                                ? 'bg-white border-[#00236f] shadow-xs ring-1 ring-[#00236f]/30'
                                : 'bg-white/70 border-[#e5eeff] hover:border-[#b4c8f0]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-[#00236f] rounded border-gray-300 focus:ring-[#00236f] pointer-events-none"
                            />
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-[#00236f] truncate">{user.name}</span>
                                <span className="text-[9px] bg-[#eff4ff] text-[#00236f] px-1 rounded font-semibold shrink-0">
                                  {user.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#525e75] font-mono truncate">{user.email}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Email Subject and Notes */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-[#525e75] block mb-0.5">
                          Asunto del Correo
                        </label>
                        <input
                          type="text"
                          value={indivEmailSubject}
                          onChange={e => setIndivEmailSubject(e.target.value)}
                          className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#525e75] block mb-0.5">
                          Observaciones / Medidas de Seguridad para la Tienda
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Coordinar accesos a sala de máquinas y lineal de cajas; técnicos cuentan con SCTR."
                          value={indivEmailNotes}
                          onChange={e => setIndivEmailNotes(e.target.value)}
                          className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e5eeff]">
                <div className="text-xs text-[#525e75]">
                  Tienda: <strong className="text-[#00236f]">{selectedStore?.name}</strong> • Fecha: <strong className="text-[#00236f]">{indivDate}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-xl hover:bg-[#dce9ff] transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 bg-[#00236f] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Programar Orden de Trabajo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MASIVO PROGRAMMING MODE (PLANTILLA PARA TODAS LAS TIENDAS) */}
          {/* ======================================================== */}
          {activeMode === 'masivo' && (
            <form onSubmit={handleSaveBulk} className="space-y-5">
              
              {/* Step 1: Plantilla Institucional de Mantenimiento */}
              <div className="bg-[#f8faff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-[#fd761a]" />
                    <span>1. Seleccionar Plantilla Institucional de Campaña</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#00236f] bg-white border border-[#c4dcff] px-2.5 py-0.5 rounded-full">
                    {BULK_CAMPAIGN_TEMPLATES.length} Plantillas Estandarizadas Tottus
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BULK_CAMPAIGN_TEMPLATES.map(tmpl => {
                    const isSelected = selectedCampaignTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedCampaignTemplateId(tmpl.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 select-none ${
                          isSelected
                            ? 'bg-[#eff4ff] border-[#00236f] shadow-md ring-1 ring-[#00236f]'
                            : 'bg-white border-[#e5eeff] hover:border-[#b4c8f0] hover:bg-[#f8faff]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#00236f] flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00236f]' : 'bg-gray-300'}`} />
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] bg-white border border-[#c4dcff] text-[#00236f] px-2 py-0.2 rounded-full font-bold">
                            {tmpl.frequency}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#525e75] leading-relaxed">
                          {tmpl.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-[#757682] pt-0.5 font-medium">
                          <span>⏱️ Tiempo estimado: <strong>{tmpl.estimatedHours} hrs / tienda</strong></span>
                          <span>•</span>
                          <span>Prioridad: <strong>{tmpl.priority}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Alcance de Tiendas (Todas o Filtradas) */}
              <div className="bg-white p-4 rounded-xl border border-[#dce9ff] space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                      <StoreIcon className="w-4 h-4 text-[#00236f]" />
                      <span>2. Alcance de Tiendas Seleccionadas ({selectedBulkStores.length} de {stores.length})</span>
                    </label>
                    <p className="text-[11px] text-[#525e75]">
                      Puedes aplicar la plantilla a las 90 tiendas a nivel nacional o por zona geográfica:
                    </p>
                  </div>

                  {/* Search Store inside bulk */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#757682]" />
                    <input
                      type="text"
                      placeholder="Buscar tiendas..."
                      value={bulkStoreSearch}
                      onChange={e => setBulkStoreSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#f8f9ff] border border-[#dce9ff] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                    />
                  </div>
                </div>

                {/* Scope Quick Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#f0f4ff] rounded-xl border border-[#c4dcff]">
                  <span className="text-[11px] font-bold text-[#00236f] px-1 mr-1">Regiones:</span>

                  <button
                    type="button"
                    onClick={() => handleApplyScope('todas')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      bulkStoreScope === 'todas'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#00236f] border border-[#c4dcff] hover:bg-blue-50'
                    }`}
                  >
                    🏪 Todas las Tiendas (90)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyScope('Lima y Callao')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      bulkStoreScope === 'Lima y Callao'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#00236f] border border-[#c4dcff] hover:bg-blue-50'
                    }`}
                  >
                    🏙️ Lima y Callao ({stores.filter(s => s.region === 'Lima y Callao').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyScope('Zona Norte')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      bulkStoreScope === 'Zona Norte'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#00236f] border border-[#c4dcff] hover:bg-blue-50'
                    }`}
                  >
                    🌾 Zona Norte ({stores.filter(s => s.region === 'Zona Norte').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyScope('Zona Sur')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      bulkStoreScope === 'Zona Sur'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#00236f] border border-[#c4dcff] hover:bg-blue-50'
                    }`}
                  >
                    🏔️ Zona Sur ({stores.filter(s => s.region === 'Zona Sur').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyScope('Zona Oriente')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      bulkStoreScope === 'Zona Oriente'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-white text-[#00236f] border border-[#c4dcff] hover:bg-blue-50'
                    }`}
                  >
                    🌴 Zona Oriente ({stores.filter(s => s.region === 'Zona Oriente').length})
                  </button>
                </div>

                {/* Multiselect Store Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {stores
                    .filter(s => !bulkStoreSearch || s.name.toLowerCase().includes(bulkStoreSearch.toLowerCase()) || String(s.codTienda).includes(bulkStoreSearch))
                    .map(store => {
                      const isChecked = bulkSelectedStoreIds.includes(store.id);
                      return (
                        <div
                          key={store.id}
                          onClick={() => toggleBulkStoreId(store.id)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f] font-semibold'
                              : 'bg-white border-[#e5eeff] text-[#757682] hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-[#00236f] rounded border-gray-300 pointer-events-none"
                          />
                          <span className="truncate">
                            T-{store.codTienda || store.code} {store.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Step 3: Parámetros del Cronograma y Cuadrilla */}
              <div className="bg-[#f8faff] p-4 rounded-xl border border-[#dce9ff] space-y-3">
                <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-[#00236f]" />
                  <span>3. Cronograma & Asignación de Cuadrillas</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Fecha de Inicio de Campaña
                    </label>
                    <input
                      type="date"
                      required
                      value={bulkStartDate}
                      onChange={e => setBulkStartDate(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Ventana Operativa de Ejecución
                    </label>
                    <select
                      value={bulkShift}
                      onChange={e => setBulkShift(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs"
                    >
                      <option value="Turno Noche (22:00 - 06:00)">Turno Noche (22:00 - 06:00)</option>
                      <option value="Apertura (07:00 - 12:00)">Apertura (07:00 - 12:00)</option>
                      <option value="Diurno Continuo (09:00 - 18:00)">Diurno Continuo (09:00 - 18:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#525e75] block mb-1">
                      Asignación de Personal / Cuadrilla
                    </label>
                    <select
                      value={bulkTechnicianTeam}
                      onChange={e => setBulkTechnicianTeam(e.target.value)}
                      className="w-full p-2 bg-white border border-[#c4dcff] rounded-lg text-xs font-semibold text-[#00236f]"
                    >
                      <option value="Cuadrilla Especializada por Región">Cuadrilla Especializada por Región</option>
                      <option value="Técnicos Especialistas Onsite (Locales)">Técnicos Especialistas Onsite (Locales)</option>
                      <option value="Proveedor Contratista Acreditado">Proveedor Contratista Acreditado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4: Notificación Masiva por Correo con Botones de Destinatarios del Directorio */}
              <div className="bg-white p-4 rounded-xl border border-[#c4dcff] space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#00236f] flex items-center gap-2 uppercase tracking-wide cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkSendEmail}
                      onChange={e => setBulkSendEmail(e.target.checked)}
                      className="w-4 h-4 text-[#00236f] rounded border-gray-300 focus:ring-[#00236f]"
                    />
                    <Mail className="w-4 h-4 text-[#fd761a]" />
                    <span>4. Notificar Masivamente a Destinatarios del Directorio</span>
                  </label>

                  <span className="text-[11px] font-bold text-[#007a33] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {bulkTotalRecipientsCount} Destinatarios M365
                  </span>
                </div>

                {bulkSendEmail && (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-[#525e75]">
                      Selecciona qué cargos del <strong>Directorio</strong> de las {selectedBulkStores.length} tiendas seleccionadas recibirán la circular oficial de la campaña:
                    </p>

                    {/* BOTONES DE DESTINATARIOS MASIVOS DEL DIRECTORIO */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkRecipientTypes(prev => ({ ...prev, gerentes: !prev.gerentes }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          bulkRecipientTypes.gerentes
                            ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f] shadow-2xs'
                            : 'bg-white border-[#e5eeff] text-[#757682] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkRecipientTypes.gerentes}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-[#00236f] rounded pointer-events-none"
                          />
                          <div>
                            <div className="font-bold text-xs">Gerentes de Tienda</div>
                            <div className="text-[10px] text-[#525e75]">Del Directorio</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#c4dcff]">
                          {selectedBulkStores.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkRecipientTypes(prev => ({ ...prev, itOperators: !prev.itOperators }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          bulkRecipientTypes.itOperators
                            ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f] shadow-2xs'
                            : 'bg-white border-[#e5eeff] text-[#757682] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkRecipientTypes.itOperators}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-[#00236f] rounded pointer-events-none"
                          />
                          <div>
                            <div className="font-bold text-xs">IT Operators</div>
                            <div className="text-[10px] text-[#525e75]">Del Directorio</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#c4dcff]">
                          {selectedBulkStores.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkRecipientTypes(prev => ({ ...prev, supervisores: !prev.supervisores }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          bulkRecipientTypes.supervisores
                            ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f] shadow-2xs'
                            : 'bg-white border-[#e5eeff] text-[#757682] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkRecipientTypes.supervisores}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-[#00236f] rounded pointer-events-none"
                          />
                          <div>
                            <div className="font-bold text-xs">Supervisores Zonales</div>
                            <div className="text-[10px] text-[#525e75]">5 Regiones</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#c4dcff]">
                          5
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBulkRecipientTypes(prev => ({ ...prev, mantenimiento: !prev.mantenimiento }))}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          bulkRecipientTypes.mantenimiento
                            ? 'bg-[#eff4ff] border-[#00236f] text-[#00236f] shadow-2xs'
                            : 'bg-white border-[#e5eeff] text-[#757682] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkRecipientTypes.mantenimiento}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-[#00236f] rounded pointer-events-none"
                          />
                          <div>
                            <div className="font-bold text-xs">Jefes Mantenimiento</div>
                            <div className="text-[10px] text-[#525e75]">Infraestructura</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-[#c4dcff]">
                          6
                        </span>
                      </button>
                    </div>

                    {/* Summary Callout */}
                    <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#c4dcff] text-xs text-[#00236f] flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#007a33] shrink-0" />
                      <div>
                        Se generará una circular formal de Microsoft 365 Exchange con el título:
                        <br />
                        <strong>[Tottus Onsite] Despliegue de Campaña: {selectedCampaignTemplate.name}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e5eeff]">
                <div className="text-xs text-[#525e75]">
                  Total a generar: <strong className="text-[#00236f]">{selectedBulkStores.length} OTs</strong> en <strong className="text-[#00236f]">{selectedBulkStores.length} tiendas</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#eff4ff] text-[#00236f] font-bold text-xs rounded-xl hover:bg-[#dce9ff] transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || selectedBulkStores.length === 0}
                    className="px-5 py-2 bg-[#00236f] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1e3a8a] transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generando Campaña Masiva...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-[#fd761a]" />
                        <span>Generar {selectedBulkStores.length} OTs Masivas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Success Message Banner */}
          {processSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{processSuccess}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
