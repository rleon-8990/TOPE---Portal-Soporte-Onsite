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
  code: string; // e.g. T-001
  name: string;
  region: Region;
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
  code: string; // e.g. HVAC-001, BMB-042
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
}

export interface Ticket {
  id: string;
  code?: string; // TK-1024
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
}

export interface WorkOrder {
  id: string;
  code: string; // WO-8921
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  storeId: string;
  storeName: string;
  region: Region;
  type: MaintenanceType;
  status: 'Completado' | 'En Progreso' | 'Programado' | 'Pendiente' | 'Cancelado';
  date: string;
  technician: string;
  technicianAvatar?: string;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  checklist: Array<{
    item: string;
    status: 'ok' | 'observacion' | 'falla' | 'na';
    comment?: string;
  }>;
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
  role: 'Administrador' | 'Supervisor Regional' | 'Técnico Especialista' | 'Jefe de Tienda' | 'Administrador General';
  specialty?: string;
  phone: string;
  assignedRegion: Region | 'Nacional';
  assignedStoresCount?: number;
  avatarUrl: string;
  status?: 'disponible' | 'en_servicio' | 'ausente';
  activeTicketsCount?: number;
  activeTickets?: number;
  completedOrders?: number;
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
  linkModule?: 'dashboard' | 'inventario' | 'tiendas' | 'mantenimiento' | 'informes' | 'helpdesk' | 'usuarios';
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
