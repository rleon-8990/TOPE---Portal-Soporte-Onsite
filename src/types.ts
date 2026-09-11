export type OperationalStatus = 'operativo' | 'mantenimiento' | 'falla_critica' | 'fuera_servicio';

export type MaintenanceResult = 'APROBADO' | 'OBSERVACIONES' | 'REPROBADO' | 'EN_PROGRESO' | 'Aprobado' | 'Con Observaciones' | 'Reprobado';

export type TicketPriority = 'critica' | 'alta' | 'media' | 'baja' | 'Crítica' | 'Alta' | 'Media' | 'Baja';

export type TicketStatus = 'abierto' | 'en_progreso' | 'espera_repuesto' | 'resuelto' | 'cerrado' | 'Abierto' | 'Asignado' | 'En Progreso' | 'Resuelto' | 'Cerrado';

export type MaintenanceType = 'preventivo' | 'correctivo' | 'calibracion' | 'inspeccion';

export type WorkOrderStatus = 'Completado' | 'En Progreso' | 'Programado' | 'Pendiente' | 'Cancelado' | 'Pendiente Repuestos' | 'todos';

export type MaintenanceFrequency = 'mensual' | 'bimestral' | 'trimestral' | 'cuatrimestral' | 'semestral' | 'anual';

export type ReportType = 'preventivo_semestral' | 'preventivo_trimestral' | 'correctivo_emergencia' | 'calibracion_tecnica' | 'auditoria_tienda';

export type ReportScope = 'unico' | 'multiple';

export type Region = 'Lima y Callao' | 'Zona Norte' | 'Zona Centro' | 'Zona Sur' | 'Zona Oriente';

export interface CategoryInfo {
  id: string;
  name: string;
  shortCode: string;
  icon: string;
  description: string;
  count: number;
}

export interface Store {
  id: string;
  code: string; // e.g. T-103 o 103
  codTienda: number | string; // Cod (103, 104, 105, etc.)
  name: string; // Tienda (Megaplaza, Las Begonias, La Marina, etc.)
  cluster?: string; // Cluster (GLP, GLA, MLP, VECINO, MLX, LFOCO, MLA, SB, UNO, CLA, HB)
  centroCostoSap?: string; // Centro de Costo SAP (P009100101, etc.)
  cecoSap?: string;
  gZonal?: string; // G Zonal (G Luna, S Nazzal, M Torres, C Farfan, G Larrab, J Hidalgo)
  gerenteTienda?: string; // Gerente de Tienda (Ricardo Paz, Sandro Jara, etc.)
  direccion?: string; // Direccion (Av. Alfredo Mendiola 3698 - Independencia, etc.)
  formato?: string; // FORMATO (Hiper, Hiper Compacto, Vecino, Super Extendido, Superbodega, Hiper Bodega, Super)
  itOperator?: string; // IT Operator (Jose Bravo, Adrian Lipa, etc.)
  ubigeo?: string | number; // Ubigeo (0, 70,101, 70,102)
  region: Region; // Region (Lima y Callao, Zona Norte, etc.)
  provincia?: string; // Provincia (Lima, Callao, etc.)
  distrito?: string; // Distrito (Independencia, San Isidro, etc.)
  situacion?: 'Alquilada' | 'Propia' | string; // SITUACIÓN
  fechaApertura?: string; // Fecha de Apertura
  latitud?: number; // Latitud (-11.99360537, etc.)
  longitud?: number; // Longitud (-77.0620619, etc.)

  // Compatibilidad con campos existentes
  city: string;
  address: string;
  phone: string;
  manager: string;
  managerEmail: string;
  totalEquipments: number;
  operationalRate: number; // e.g. 98.2%
  activeAlerts: number;
  criticalIssues: number;
  status: 'activa' | 'mantenimiento_general' | 'alerta_regional';

  // Visita Preventiva Semestral (Caminata Técnica)
  ultimaVisitaPreventiva?: {
    fecha: string; // e.g. '05/08/2026'
    estado: 'Informe generado' | 'En proceso' | 'Pendiente';
    itOperator?: string;
    gerenteTienda?: string;
    informePdf?: string;
    totalEquiposRevisados?: number;
    observacionesDetectadas?: number;
    ticketsGenerados?: number;
    semaforoSemestral?: 'al_dia' | 'proximo_a_vencer' | 'vencido';
  };
  proximaVisitaProgramada?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  technician: string;
  result?: MaintenanceResult;
  findings?: string;
  actionsTaken?: string;
  checklistPassed?: number;
  checklistTotal?: number;
  photos?: string[];
  description?: string;
  cost?: number;
}

export interface Equipment {
  id: string;
  code: string; // e.g. HVAC-001, BMB-042, POS-316001
  name: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  model: string;
  serialNumber: string;
  storeId: string;
  storeName: string;
  storeCode?: string;
  locationInStore: string;
  status: OperationalStatus;
  installDate?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  calibrationExpiry?: string;
  calibrationAlert?: boolean;
  statusDetail?: string;
  imageUrl: string;
  powerRating?: string;
  voltage?: string;
  temperatureRange?: string;
  maintenanceHistory?: MaintenanceRecord[];
  history?: MaintenanceRecord[];
  assignedTechnician?: string;
  notes?: string;

  // Encabezados corporativos TOPE / Falabella / Sistemas
  b?: string; // e.g. 'TOPE'
  pais?: string; // e.g. 'Perú'
  negocio?: string; // e.g. 'MERCADOS TOTTUS'
  storeCodeNumber?: string; // e.g. '316', '317', '338', '375', '452', '472'
  centroCostos?: string; // e.g. 'P009102301'
  sistemaAsociado?: string; // e.g. 'PUNTO DE VENTAS', 'CLIMATIZACION', 'CADENA DE FRIO'
  hostName?: string; // e.g. 'PS316001', 'OPEPOS-317001'
  partNumber?: string; // e.g. '7603-1101-8801'
  ipAddress?: string; // e.g. '172.23.87.101', '10.163.51.101'
  macAddress?: string; // e.g. '3C:E1:A1:3E:CB:5C'
  mascara?: string; // e.g. '255.255.255.0'
  gateway?: string; // e.g. '172.23.87.1'
  procesador?: string; // e.g. 'Intel(R) Celeron(R) CPU G1820TE', 'Intel(R) Core(TM) i5-9500TE'
  sistemaOperativo?: string; // e.g. 'Windows Embedded Estándar 32-bit', 'WINDOWS 10 Enterprise LTSC'
  memoriaRam?: string; // e.g. '3,511.95 MB', '8,063.27 MB', '16,251.51 MB'
  discoDuro?: string; // e.g. '106,177 MB', '218,031 MB'
  obsolescenciaHW?: string; // e.g. '31/12/2022 00:00', '08/04/2030 00:00'
  anoInstalacion?: string; // e.g. '31/12/2020', '08/04/2025'
  servicio?: string; // e.g. 'Caja Asistida', 'SCO (Self Checkout)', 'Punto de Ventas'
  estadoServicio?: string; // e.g. 'DEPLOYED', 'MAINTENANCE', 'STANDBY'
  ambiente?: string; // e.g. 'PRODUCCION', 'PILOTO', 'LAB'
  costoServicio?: string | number; // e.g. 9.86
  proveedor?: string; // e.g. 'NCR COMMERCE DEL PERU S.A.C.'
  formato?: string; // e.g. 'Hiper', 'Hiper Compacto', 'Super Extendido', 'Hiper Bodega'
  direccionFiscal?: string; // e.g. 'Av. Porongoche N° 500 - Mall Aventura plaza'

  // Enlace a Equipos de Comunicación (Switches & Puertos de Red)
  switchName?: string; // e.g. 'PE-MPO-TOT-SA-03', 'PE-HUY-TOT-SA-05'
  switchIp?: string; // e.g. '172.22.86.71', '10.161.43.77'
  puertoSwitch?: string; // e.g. 'Gi1/0/17', 'Gi1/0/10', '10', '11'
  vlan?: string; // e.g. 'VLAN 101 - POS', 'VLAN 10 - Red Gestión'
  linkStatus?: 'up' | 'down' | 'warning'; // Estado de enlace de red
  speedDuplex?: string; // e.g. '1 Gbps Full Duplex', '100 Mbps'
}

export interface Ticket {
  id: string;
  code?: string; // TK-1024 / OCR-020126
  ticketNumber?: string;
  title: string;
  description: string;
  equipmentId?: string;
  equipmentCode?: string;
  equipmentName?: string;
  storeId: string;
  storeName: string;
  storeCode?: string;
  region: Region;
  priority: TicketPriority;
  status: TicketStatus;
  reportedBy: string;
  reportedAt?: string;
  createdAt?: string;
  assignedTo?: string;
  assignedTechnicianAvatar?: string;
  updatedAt?: string;
  estimatedResolution?: string;
  slaDueIn?: string;
  commentsCount?: number;
  evidences?: string[];
  comments?: Array<{
    id: string;
    author: string;
    avatar?: string;
    text: string;
    timestamp: string;
    isInternal?: boolean;
  }>;

  // --- Columnas Oficiales Planilla Corporativa Onsite (Helpdesk, Repuestos y Presupuestos) ---
  ticketJR?: string; // TICKET JR (ej. 'OCR-020126', 'OCR-641022')
  proveedorServicio?: string; // PROVEEDOR (ej. 'DMS PERU S.A.C', 'PRECISION PERU S.A.', 'NCR')
  ticketProveedor?: string; // TICKET PROVEEDOR (ej. '98638', '98952', '98590')
  fechaInicio?: string; // FECHA INICIO (ej. '2/01/2026', '15/01/2026')
  codTiendaNum?: string | number; // COD (ej. 123, 117, 568, 569, 103, 474)
  tiendaNombre?: string; // TIENDA (ej. 'Angamas', 'Comas', 'CD Huachipa Secos', 'Megaplaza')
  cecoSap?: string; // CECO SAP (ej. 'P009102001', 'P009821001', 'P009811001')
  idEquipo?: string; // ID EQUIPO (ej. 'No Aplica', '87, 89, 90', '64', '85')
  ipAddress?: string; // IP (ej. '10.163.224.140', '172.43.41.64', 'no aplica')
  tipoEquipo?: string; // EQUIPO (ej. 'Consulta Precios', 'Terminal Móvil', 'SCO - Scanner de Mano', 'Impresora Industrial', 'Balanzas')
  marca?: string; // MARCA (ej. 'MOTOROLA', 'ZEBRA', 'PRECISION')
  modelo?: string; // MODELO (ej. 'MK500', 'TC26', 'MC93', 'DS2208', 'ZT410', '8442')
  numeroSerie?: string; // N° SERIE (ej. '12348522500479', '22067523021608', '18J171600018')
  detalleTicket?: string; // DETALLE DE TICKET / Falla (ej. 'Error app', 'talla opaca y se ve linea', 'Se reinicia', 'cabezal dañado')
  contacto?: string; // CONTACTO (ej. 'Raul Leon', 'Ronald Lopez', 'Luis Garcia', 'Jesus Bravo')
  celular?: string; // CELULAR (ej. '51 992 797 523', '987804150', '905 456 127')
  estadoTicket?: string; // ESTADO TICKET (ej. 'Atendido', 'Pendiente Reparación', 'En Proceso')
  direccionFiscal?: string; // DIRECCIÓN FISCAL (ej. 'Tomas Marsano con Av. Angamos', 'Av. Mendiola 3698 - Independencia')
  fechaCierre?: string; // FECHA CIERRE (ej. '20/01/2026 05:00', '30/12/2025 05:00')
  observaciones?: string; // OBSERVACIONES (ej. 'Mantenimiento', 'Cambio PCB', 'Cambio Cable', 'Cambio Cabezal', 'Instalacion Camara')
  creadoPor?: string; // Creado por (ej. 'Roger Leon Apolinario', 'Luis Garcia Cueva', 'Denis Bravo')
  tienePdf?: boolean | string; // pdf? (ej. 'SI', 'NO')

  // --- SECCIÓN REPUESTOS Y PRESUPUESTOS (Compras & Facturación SAP) ---
  partNumberRepuesto?: string; // Part Number (ej. 'TSRRF00026', 'P1058930-010A', 'CBA-U01-S07ZAR')
  descripcionPartNumber?: string; // Descripción Part Number (ej. 'SERVICIO DE REPARACIÓN DE EQUIPOS', 'CABEZAL 300 DPI PARA IMPRESORA ZM400')
  cotizacion?: string; // Cotización (ej. '003-00071073', '003-00070811', '003-00070885')
  precio?: number; // Precio (ej. 55, 547, 255, 448, 570, 103, 38, 21.24)
  solped?: string; // Solped (ej. '1001571403', '1001704359')
  ordenCompra?: string; // Orden de Compra (ej. '6001495464', '6001613078')
  hes?: string; // HES (ej. '1002515853', '1002727237')
  presupuestoMes?: string; // Presupuesto Mes (ej. 'Enero 2026', 'Diciembre 2025', 'Noviembre 2025')
}

export interface WorkOrder {
  id: string;
  code: string; // WO-8921
  orderNumber?: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  storeId: string;
  storeName: string;
  region: Region;
  type: MaintenanceType;
  status: 'Completado' | 'En Progreso' | 'Programado' | 'Pendiente' | 'Cancelado' | string;
  date: string;
  scheduledDate?: string;
  frequency?: MaintenanceFrequency;
  technician: string;
  technicianAvatar?: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  checklist: Array<{
    item: string;
    status: 'ok' | 'observacion' | 'falla' | 'na';
    comment?: string;
  }>;
  evidenceBefore?: string; // Evidencia fotográfica ANTES
  evidenceAfter?: string; // Evidencia fotográfica DESPUÉS
  clientSignature?: string; // Firma digital del cliente / supervisor de tienda
  clientName?: string;
  clientRole?: string;
  technicianSignature?: string; // Firma digital del técnico
  technicianName?: string;
  notes?: string;
}

export interface EvidencePhoto {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  type: 'antes' | 'despues' | 'puntual_dano';
  description: string;
  dataUrl: string;
  timestamp: string;
  capturedBy: string;
}

export interface TechnicalReport {
  id: string;
  reportNumber: string; // INF-2026-089
  title?: string;
  type?: ReportType;
  scope?: ReportScope;
  storeId: string;
  storeName: string;
  storeAddress?: string;
  storeCode?: string;
  region: Region;
  period?: string;
  dateGenerated?: string;
  date?: string;
  status?: 'Borrador' | 'Emitido' | 'Aprobado';
  equipmentId?: string;
  equipmentName?: string;
  equipmentCode?: string;
  categoryName?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  technician?: string;
  supervisor?: string;
  outcome?: 'Aprobado' | 'Con Observaciones' | 'Reprobado' | MaintenanceResult;
  findings?: string;
  recommendations?: string;
  parameters?: Record<string, string>;
  equipmentItems?: Array<{
    equipmentId: string;
    code: string;
    name: string;
    category: string;
    brand: string;
    model: string;
    serial: string;
    statusBefore: string;
    statusAfter: string;
    result: MaintenanceResult;
    checklist: Array<{ task: string; passed: boolean; note?: string }>;
    observations: string;
    evidences: EvidencePhoto[];
  }>;
  checklist?: Array<{ label: string; status: 'conforme' | 'observacion' | 'no_conforme' }>;
  signatures?: {
    technicianSigned: boolean;
    supervisorSigned: boolean;
    clientStoreSigned: boolean;
  };
  technicianName?: string;
  technicianSignature?: string;
  storeRepresentativeName?: string;
  storeRepresentativeSignature?: string;
  generalObservations?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Supervisor Regional' | 'Técnico Especialista' | 'Jefe de Tienda' | 'Administrador General' | 'Gerente de Tienda' | 'IT Operator' | 'Jefe de Mantenimiento' | 'Subgerente' | 'Jefe de Prevención' | string;
  specialty?: string;
  phone: string;
  assignedRegion: Region | 'Nacional';
  assignedStoresCount?: number;
  avatarUrl: string;
  status?: 'disponible' | 'en_servicio' | 'ausente';
  activeTicketsCount?: number;
  activeTickets?: number;
  completedOrders?: number;

  // Asignación de Tienda & Agenda de Usuarios
  userType?: 'tienda' | 'especialista';
  codTienda?: number | string; // ej. 103, 104, 105, 316
  tiendaNombre?: string; // ej. Megaplaza, Las Begonias, Porongoche
  storeId?: string; // ej. store-103
  cargo?: string; // ej. Gerente de Tienda, IT Operator Onsite, Jefe de Mantenimiento, Subgerente, etc.
  anexo?: string; // Anexo telefónico interno
  turno?: string; // ej. Turno Mañana, Turno Tarde, Completo
  distrito?: string;

  // Enrolamiento GeoVictoria & Asistencia
  dni?: string;
  geoVictoriaId?: string;
  geoVictoriaEnrolled?: boolean;
  geoVictoriaMethod?: 'facial' | 'huella' | 'app_gps' | 'pin';

  // Control de Acceso Web & Habilitación en Directorio
  webAccessEnabled?: boolean; // true = permitido para ingresar al portal web; false = bloqueado
  lastLoginAt?: string; // Fecha y hora del último login registrado
  lastLoginIp?: string; // Dirección IP del último login
  loginDevice?: string; // Dispositivo / Navegador registrado
  loginCount?: number; // Total de inicios de sesión exitosos
}

export interface LoginAuditRecord {
  id: string;
  timestamp: string;
  timeAgo?: string;
  userEmail?: string;
  userName: string;
  userRole?: string;
  email?: string;
  role?: string;
  status: 'exitoso' | 'bloqueado_no_en_directorio' | 'bloqueado_inhabilitado' | 'success' | 'blocked_not_in_directory' | 'blocked_disabled';
  ipAddress: string;
  deviceInfo?: string;
  device?: string;
  locationOrStore?: string;
  storeName?: string;
  notes?: string;
  reason?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'falla_critica' | 'ticket' | 'mantenimiento' | 'informe' | 'calibracion';
  severity: 'critica' | 'advertencia' | 'info' | 'exito';
  storeId?: string;
  storeName?: string;
  region?: Region;
  equipmentId?: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  linkModule?: 'dashboard' | 'inventario' | 'tiendas' | 'mantenimiento' | 'informes' | 'helpdesk' | 'usuarios' | 'visitas' | 'custodia' | 'monitoreo';
}

export interface RegionalAlertConfig {
  id: string;
  level?: 'regional' | 'individual';
  scope?: 'regional' | 'sucursal';
  region?: Region;
  storeId?: string;
  storeName?: string;
  title: string;
  description: string;
  severity: 'critica' | 'alta' | 'moderada' | 'advertencia' | 'emergencia_operativa';
  active: boolean;
  createdAt: string;
  affectedEquipmentsCount?: number;
  actionRequired?: string;
}

export type RegionalAlert = RegionalAlertConfig;

// ==========================================
// Control de Asistencia & Monitoreo de Personal en Tiendas
// ==========================================

export type AttendanceEventType = 'ingreso' | 'salida' | 'traslado';

export type PersonnelStatus = 'en_tienda' | 'en_traslado' | 'jornada_finalizada' | 'disponible';

export type AttendanceSource = 'geovictoria_facial' | 'geovictoria_huella' | 'geovictoria_app' | 'gps_geocerca' | 'manual';

export type AttendanceMotive =
  | 'mantenimiento_preventivo'
  | 'atencion_averia'
  | 'inventario_equipos'
  | 'soporte_onsite'
  | 'inspeccion'
  | 'otro';

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  userCargo?: string;
  userPhone?: string;
  userAvatar?: string;
  eventType: AttendanceEventType;
  
  // Tienda origen / actual
  storeId: string;
  storeCode: string | number;
  storeName: string;
  storeRegion: Region;
  
  // En caso de traslado
  targetStoreId?: string;
  targetStoreCode?: string | number;
  targetStoreName?: string;
  targetStoreRegion?: Region;
  
  timestamp: string; // ISO string e.g. 2026-09-09T08:30:00
  timeFormatted: string; // e.g. '08:30 AM'
  dateFormatted: string; // e.g. '2026-09-09'
  
  motive: AttendanceMotive;
  motiveDetail?: string; // e.g. 'Atención de Ticket TK-1024' or 'Revisión preventiva POS'
  workOrderId?: string;
  ticketId?: string;
  
  notes?: string;
  durationMinutes?: number; // Minutos de permanencia calculados en caso de salida
  durationFormatted?: string; // e.g. '2h 45m'
  
  verifiedLocation?: boolean;
  registeredBy?: string;

  // Automatización: GeoVictoria o GPS Geocerca
  source?: AttendanceSource;
  sourceDetail?: string; // ej. 'Reloj Biométrico Facial T-103' o 'Geocerca Móvil (Radio 120m)'
  geoVictoriaPunchId?: string;
  coordinates?: { lat: number; lng: number; accuracy?: number };
}

export interface ActivePersonnelPresence {
  userId: string;
  userName: string;
  userRole: string;
  userCargo?: string;
  userPhone: string;
  userAvatar?: string;
  status: PersonnelStatus;
  
  // Si está en tienda
  currentStoreId?: string;
  currentStoreCode?: string | number;
  currentStoreName?: string;
  currentStoreRegion?: Region;
  checkInTime?: string;
  checkInDate?: string;
  
  // Si está en traslado
  fromStoreId?: string;
  fromStoreCode?: string | number;
  fromStoreName?: string;
  toStoreId?: string;
  toStoreCode?: string | number;
  toStoreName?: string;
  departureTime?: string;
  
  motive?: AttendanceMotive;
  motiveDetail?: string;
  activeTicketOrWo?: string;
  lastEventTime?: string;
  todayLogsCount?: number;

  // Origen de presencia
  source?: AttendanceSource;
  coordinates?: { lat: number; lng: number };
}

export interface GeoVictoriaConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  companyCode: string;
  autoSyncIntervalMinutes: number;
  webhookEndpoint: string;
  webhookSecret: string;
  autoCheckInOnPunch: boolean;
  lastSyncTimestamp: string | null;
  lastSyncStatus: 'connected' | 'syncing' | 'idle' | 'error';
  lastSyncMessage?: string;
  syncedTodayCount: number;
}

export interface GeoVictoriaPunchRecord {
  id: string;
  rutDni: string;
  colaboradorNombre: string;
  colaboradorId?: string;
  fechaHora: string;
  horaFormato: string;
  tipo: 'ENTRADA' | 'SALIDA';
  dispositivo: string;
  metodo: 'reconocimiento_facial' | 'huella_dactilar' | 'app_geocerca' | 'pin';
  codTienda: number | string;
  nombreTienda: string;
  latitud?: number;
  longitud?: number;
  estado: 'sincronizado' | 'pendiente' | 'descartado';
  cmmsLogId?: string;
}

export interface GeofencingConfig {
  enabled: boolean;
  radiusMeters: number;
  autoCheckIn: boolean;
  autoCheckOut: boolean;
  highAccuracy: boolean;
  soundAlerts: boolean;
  activeTracking: boolean;
  lastGpsLat?: number;
  lastGpsLng?: number;
  lastGpsAccuracy?: number;
  lastGpsTimestamp?: string;
  nearestStoreCode?: string | number;
  nearestStoreName?: string;
  distanceToNearestMeters?: number;
  isInsideGeofence?: boolean;
}

// ==========================================
// Despachador Rápido de Correos (Email Dispatcher)
// ==========================================

export interface EmailRecipient {
  id: string;
  name: string;
  email: string;
  storeName?: string;
  roleOrGroup?: string;
  category: 'tiendas' | 'cajas' | 'prevencion' | 'zonales' | 'gerentes' | 'complementaria' | 'vip';
  selected: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
}

export interface EmailDispatchRecord {
  id: string;
  timestamp: string;
  templateName: string;
  subject: string;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  scheduledFor?: string;
  frequency: 'una_vez' | 'diario' | 'semanal' | 'mensual';
  status: 'completado' | 'programado' | 'en_progreso' | 'error';
  senderEmail: string;
  senderName: string;
  recipientsSummary: string;
}

// ==========================================
// Custodia & Monitoreo de PDAs e Impresoras (CCTV / Prevención)
// ==========================================

export type DeviceCustodyStatus = 'en_custodia' | 'en_uso' | 'con_falla' | 'en_reparacion';

export type DeviceType = 'PDA' | 'Impresora Portátil' | 'Scanner Anillo' | 'Batería Repuesto' | 'Otros';

export interface DeviceBorrower {
  fotocheck: string; // Fotocheck ID o DNI
  dni?: string;
  name: string;
  cargo: string;
  area: string; // Picking Ecommerce / Cajas / Reposición / Perecibles / Auditoría / Almacén / Prevención
  phone?: string;
  avatar?: string;
  borrowedAt: string; // ISO timestamp
  borrowedTimeFormatted: string; // e.g. "08:15 AM"
  borrowedDateFormatted: string; // e.g. "10/09/2026"
  releasedByCctvAgent: string; // Operador de Prevención / CCTV
  expectedReturnTime?: string; // e.g. "17:00"
}

export interface DeviceLoanHistoryItem {
  id: string;
  action: 'entrega' | 'devolucion' | 'reporte_falla';
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  fotocheck: string;
  borrowerName: string;
  cargo?: string;
  area: string;
  cctvOfficer: string;
  conditionOnReturn?: 'conforme' | 'con_falla' | 'danado' | 'bateria_baja';
  notes?: string;
  incidentDetail?: string;
  falabellaTicketCode?: string;
  helpdeskTicketId?: string;
}

export interface DeviceCustodyItem {
  id: string;
  storeId: string;
  storeCode: string | number;
  storeName: string;
  equipmentId?: string; // Enlace a Inventory Equipment
  equipmentCode: string; // e.g. 'PDA-T103-01' o 'PRN-T103-02'
  deviceType: DeviceType;
  brand: string; // Zebra, Honeywell, etc.
  model: string; // TC26, TC21, ZQ520, ZQ320, MC3300, etc.
  serialNumber: string;
  macAddress?: string;
  ipAddress?: string;
  barcode: string; // Código de barras para escaneo o QR
  status: DeviceCustodyStatus;
  batteryLevel?: number; // 0 - 100%
  hasHolster?: boolean; // Funda / Grip pistola
  hasStrap?: boolean; // Correa de hombro / cinturón
  currentBorrower?: DeviceBorrower;
  hoursInUse?: number;
  isOverdue?: boolean; // Excede 8 horas de turno
  lastIncident?: {
    reportedAt: string;
    reportedBy: string;
    fallaType: string;
    description: string;
    falabellaTicketUrl: string; // https://ai-monitoring.falabella.com/login
    falabellaTicketCode?: string;
    helpdeskTicketId?: string;
    ticketJR?: string;
  };
  loanHistory: DeviceLoanHistoryItem[];
  locationInStore?: string; // e.g. 'Casillero CCTV N° 04'
  notes?: string;
  updatedAt: string;
}

export interface StoreColaborador {
  fotocheck: string;
  dni: string;
  name: string;
  cargo: string;
  area: string;
  storeCode: string | number;
  storeName: string;
  phone?: string;
  avatar?: string;
}

// ==========================================
// SISTEMA DE VISITA PREVENTIVA (CAMINATA SEMESTRAL)
// ==========================================

export type WalkthroughCategoryId =
  | 'consulta_precios'
  | 'balanzas'
  | 'cajas_asistidas'
  | 'cajas_sco'
  | 'pda_terminales'
  | 'impresoras_portatiles'
  | 'impresoras_zebra'
  | 'etiquetas_flejes_reloj'
  | 'cpd_sistemas'
  | 'gabinete_b'
  | 'gabinete_c';

export interface WalkthroughDiagnosticItem {
  item: string;
  status: 'ok' | 'observacion' | 'falla';
  valorMedido?: string;
  comentario?: string;
}

export interface WalkthroughReviewedItem {
  id: string;
  categoryId: WalkthroughCategoryId;
  categoryName: string;
  equipoNombre: string; // ej. 'CP 1', 'POS Caja 03', 'Gabinete B - Switch Principal'
  equipmentId?: string;
  equipmentCode?: string;
  estado: 'Operativo' | 'Con observación' | 'No operativo / Falla';
  observacion: string;
  accionRealizada: string;
  ticketJR?: string; // Amarrado con Helpdesk / Mantenimiento Correctivo (ej. 'INC-12345')
  diagnostics: WalkthroughDiagnosticItem[];
  evidencias: string[];
}

export interface PreventiveVisitPhoto {
  id: string;
  title: string;
  dataUrl: string;
  categoryId?: WalkthroughCategoryId;
  equipoNombre?: string;
  timestamp: string;
}

export interface PreventiveVisit {
  id: string;
  numeroVisita: string; // ej. 'VIS-358-2026-08'
  storeId: string;
  storeCode: string | number; // 358
  storeName: string; // 'CAJAMARCA' o '358 - HT Cajamarca'
  direccionFiscal: string;
  fechaVisita: string; // '05/08/2026'
  horaInicio: string; // '08:30'
  horaTermino: string; // '14:20'
  itOperator: string; // 'Juan Pérez'
  gerenteTienda: string; // 'María Gómez'
  personalPermanente: number; // 8
  observacionesGenerales: string;
  recomendacionesPlanes: string;
  estado: 'Informe generado' | 'En proceso' | 'Pendiente';
  informePdfNombre?: string; // 'Informe_Visita_358_2026-08-05.pdf'
  informePdfUrl?: string;
  sharepointSynced?: boolean;
  sharepointListId?: string;
  itemsRevision: WalkthroughReviewedItem[];
  evidenciasGenerales: PreventiveVisitPhoto[];
  firmas?: {
    itOperatorSignature?: string;
    itOperatorSignedAt?: string;
    gerenteSignature?: string;
    gerenteSignedAt?: string;
  };
  totalEquipos: number;
  operativosCount: number;
  conObservacionCount: number;
  noOperativosCount: number;
  ticketsGeneradosCount: number;
  createdAt: string;
  updatedAt: string;
}


