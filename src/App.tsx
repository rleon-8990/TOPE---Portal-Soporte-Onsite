import React, { useState, useEffect } from 'react';
import {
  INITIAL_STORES,
  INITIAL_EQUIPMENTS,
  INITIAL_TICKETS,
  INITIAL_WORK_ORDERS,
  INITIAL_REPORTS,
  INITIAL_USERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REGIONAL_ALERTS
} from './data/mockData';
import {
  Equipment,
  Store,
  Ticket,
  WorkOrder,
  TechnicalReport,
  AppUser,
  PushNotification,
  RegionalAlert,
  AttendanceLog,
  ActivePersonnelPresence,
  AttendanceEventType,
  AttendanceMotive,
  LoginAuditRecord,
  DeviceCustodyItem,
  StoreColaborador,
  PreventiveVisit
} from './types';
import { INITIAL_LOGIN_AUDIT_LOGS } from './data/loginAuditData';
import { INITIAL_DEVICE_CUSTODY_ITEMS, INITIAL_COLABORADORES, FALABELLA_AI_MONITORING_URL, playScannerBeep } from './data/deviceCustodyData';
import { INITIAL_PREVENTIVE_VISITS, enrichStoresWithVisits } from './data/preventiveVisitsData';
import { playNotificationChime } from './utils/helpers';
import { MicrosoftDataService, AutoSyncConfig } from './services/microsoftDataService';
import { INITIAL_ATTENDANCE_LOGS, INITIAL_ACTIVE_PRESENCES } from './data/attendanceMockData';
import { QrCode, AlertTriangle, Bell, CheckCircle2, ShieldCheck, LogOut, ChevronDown, User, ExternalLink, Send, Smartphone } from 'lucide-react';
import { hasPageAccess, getDefaultViewForRole, getRoleConfig, getAllowedModulesForRole, APP_MODULES } from './utils/rbac';

// Components
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { StoresView } from './components/StoresView';
import { MaintenanceView } from './components/MaintenanceView';
import { TechnicalReportsView } from './components/TechnicalReportsView';
import { HelpdeskView } from './components/HelpdeskView';
import { UserDirectoryView } from './components/UserDirectoryView';
import { PersonnelMonitoringView } from './components/PersonnelMonitoringView';
import { DeviceCustodyView } from './components/DeviceCustodyView';
import { PreventiveVisitsView } from './components/PreventiveVisitsView';
import { AutoSyncStatusWidget } from './components/AutoSyncStatusWidget';
import { CorporateLoginView } from './components/CorporateLoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { QuickEmailDispatcher } from './components/QuickEmailDispatcher';

// Modals
import { NotificationModal } from './components/NotificationModal';
import { QRScannerModal } from './components/QRScannerModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { NewEquipmentModal } from './components/NewEquipmentModal';
import { RegionalAlertsModal } from './components/RegionalAlertsModal';
import { SharePointDataverseModal } from './components/SharePointDataverseModal';
import { SharePointStoreSyncModal } from './components/SharePointStoreSyncModal';
import { PrivilegesMatrixModal } from './components/PrivilegesMatrixModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Core Data State with localStorage persistence for synced stores
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_stores_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return enrichStoresWithVisits(parsed, INITIAL_PREVENTIVE_VISITS);
      }
    } catch (e) {
      console.warn('Error reading saved stores', e);
    }
    return enrichStoresWithVisits(INITIAL_STORES, INITIAL_PREVENTIVE_VISITS);
  });
  const [equipments, setEquipments] = useState<Equipment[]>(INITIAL_EQUIPMENTS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [reports, setReports] = useState<TechnicalReport[]>(INITIAL_REPORTS);
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_users_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved users', e);
    }
    return INITIAL_USERS;
  });
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [regionalAlerts, setRegionalAlerts] = useState<RegionalAlert[]>(INITIAL_REGIONAL_ALERTS);

  // Attendance & Presence Monitoring State with persistence
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_attendance_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved attendance logs', e);
    }
    return INITIAL_ATTENDANCE_LOGS;
  });

  const [activePresences, setActivePresences] = useState<ActivePersonnelPresence[]>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_active_presences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved active presences', e);
    }
    return INITIAL_ACTIVE_PRESENCES;
  });

  // Authentication & Corporate Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('reliant_cmms_auth_session');
      if (session === 'false') return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  // Active Current User (persisted in session)
  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch (e) {}
    return INITIAL_USERS[0];
  });

  // Modal Visibility States
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [selectedEquipmentForDetail, setSelectedEquipmentForDetail] = useState<Equipment | null>(null);
  const [showNewEquipment, setShowNewEquipment] = useState<boolean>(false);
  const [showRegionalAlerts, setShowRegionalAlerts] = useState<boolean>(false);
  const [showM365Sync, setShowM365Sync] = useState<boolean>(false);
  const [showStoreSharePointSync, setShowStoreSharePointSync] = useState<boolean>(false);
  const [showPrivilegesMatrix, setShowPrivilegesMatrix] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Login Audit Records State (persisted in session)
  const [loginAuditLogs, setLoginAuditLogs] = useState<LoginAuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tottus_cmms_login_audit');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_LOGIN_AUDIT_LOGS;
  });

  const handleRecordLoginAudit = (record: LoginAuditRecord) => {
    setLoginAuditLogs(prev => {
      const updated = [record, ...prev];
      try {
        localStorage.setItem('tottus_cmms_login_audit', JSON.stringify(updated.slice(0, 100)));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearLoginAuditLogs = () => {
    setLoginAuditLogs([]);
    try {
      localStorage.removeItem('tottus_cmms_login_audit');
    } catch (e) {}
  };

  // Device Custody State (PDAs and Mobile Printers)
  const [deviceCustodyItems, setDeviceCustodyItems] = useState<DeviceCustodyItem[]>(() => {
    try {
      const saved = localStorage.getItem('tottus_device_custody_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_DEVICE_CUSTODY_ITEMS;
  });

  const [storeColaboradores, setStoreColaboradores] = useState<StoreColaborador[]>(() => {
    try {
      const saved = localStorage.getItem('tottus_store_colaboradores_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_COLABORADORES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tottus_device_custody_data', JSON.stringify(deviceCustodyItems));
    } catch (e) {}
  }, [deviceCustodyItems]);

  // Preventive Visits State (Caminata Técnica Semestral Power Apps)
  const [preventiveVisits, setPreventiveVisits] = useState<PreventiveVisit[]>(() => {
    try {
      const saved = localStorage.getItem('tottus_preventive_visits_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved preventive visits', e);
    }
    return INITIAL_PREVENTIVE_VISITS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('tottus_preventive_visits_data', JSON.stringify(preventiveVisits));
    } catch (e) {}
  }, [preventiveVisits]);

  const handleRegisterLoan = (device: DeviceCustodyItem, borrower: StoreColaborador, notes?: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString('es-PE');

    const historyItem = {
      id: `hist-${Date.now()}`,
      action: 'entrega' as const,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      fotocheck: borrower.fotocheck,
      borrowerName: borrower.name,
      cargo: borrower.cargo,
      area: borrower.area,
      cctvOfficer: currentUser.name,
      conditionOnReturn: 'conforme' as const,
      notes: notes || 'Entregado operativo desde casillero CCTV'
    };

    setDeviceCustodyItems(prev => prev.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          status: 'en_uso',
          currentBorrower: {
            fotocheck: borrower.fotocheck,
            dni: borrower.dni,
            name: borrower.name,
            cargo: borrower.cargo,
            area: borrower.area,
            phone: borrower.phone,
            avatar: borrower.avatar,
            borrowedAt: now.toISOString(),
            borrowedTimeFormatted: timeFormatted,
            borrowedDateFormatted: dateFormatted,
            releasedByCctvAgent: currentUser.name
          },
          hoursInUse: 0.1,
          isOverdue: false,
          loanHistory: [historyItem, ...(d.loanHistory || [])],
          updatedAt: now.toISOString()
        };
      }
      return d;
    }));

    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `Préstamo de ${device.equipmentCode}`,
      message: `${device.deviceType} entregado a ${borrower.name} (${borrower.area}) en T-${device.storeCode}.`,
      type: 'ticket',
      severity: 'info',
      timestamp: now.toISOString(),
      timeAgo: 'Hace un momento',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleRegisterReturn = (device: DeviceCustodyItem, condition: 'conforme' | 'con_falla', notes?: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString('es-PE');

    const borrower = device.currentBorrower;

    const historyItem = {
      id: `hist-${Date.now()}`,
      action: 'devolucion' as const,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      fotocheck: borrower?.fotocheck || 'S/F',
      borrowerName: borrower?.name || 'Colaborador',
      cargo: borrower?.cargo,
      area: borrower?.area || 'Piso de venta',
      cctvOfficer: currentUser.name,
      conditionOnReturn: condition,
      notes: notes || (condition === 'conforme' ? 'Devuelto conforme a casillero CCTV' : 'Devuelto con observación técnica')
    };

    setDeviceCustodyItems(prev => prev.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          status: condition === 'con_falla' ? 'con_falla' : 'en_custodia',
          currentBorrower: undefined,
          hoursInUse: 0,
          isOverdue: false,
          loanHistory: [historyItem, ...(d.loanHistory || [])],
          updatedAt: now.toISOString()
        };
      }
      return d;
    }));

    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `Retorno de ${device.equipmentCode}`,
      message: `${device.equipmentCode} retornado a casillero CCTV (${condition === 'conforme' ? 'Conforme' : 'Con Falla'}).`,
      type: condition === 'conforme' ? 'ticket' : 'falla_critica',
      severity: condition === 'conforme' ? 'exito' : 'advertencia',
      timestamp: now.toISOString(),
      timeAgo: 'Hace un momento',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleReportIncident = (device: DeviceCustodyItem, incident: {
    fallaType: string;
    description: string;
    falabellaTicketCode: string;
    createHelpdeskTicket: boolean;
  }) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString('es-PE');

    const borrower = device.currentBorrower;

    const historyItem = {
      id: `hist-${Date.now()}`,
      action: 'reporte_falla' as const,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted,
      fotocheck: borrower?.fotocheck || 'S/F',
      borrowerName: borrower?.name || currentUser.name,
      cargo: borrower?.cargo || currentUser.role,
      area: borrower?.area || 'Prevención / CCTV',
      cctvOfficer: currentUser.name,
      conditionOnReturn: 'danado' as const,
      notes: `Falla: ${incident.fallaType}`,
      incidentDetail: incident.description,
      falabellaTicketCode: incident.falabellaTicketCode
    };

    const newTicketCode = incident.falabellaTicketCode || `FAL-AI-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update custody device state
    setDeviceCustodyItems(prev => prev.map(d => {
      if (d.id === device.id) {
        return {
          ...d,
          status: 'con_falla',
          currentBorrower: undefined,
          hoursInUse: 0,
          isOverdue: false,
          lastIncident: {
            reportedAt: `${dateFormatted} ${timeFormatted}`,
            reportedBy: currentUser.name,
            fallaType: incident.fallaType,
            description: incident.description,
            falabellaTicketUrl: 'https://ai-monitoring.falabella.com/login',
            falabellaTicketCode: newTicketCode
          },
          loanHistory: [historyItem, ...(d.loanHistory || [])],
          notes: `Retenido por avería. Reportado en Falabella AI-Monitoring: ${newTicketCode}`,
          updatedAt: now.toISOString()
        };
      }
      return d;
    }));

    // If requested, synchronize and create Ticket in Helpdesk CMMS
    if (incident.createHelpdeskTicket) {
      const targetStore = stores.find(s => s.id === device.storeId);
      const storeRegion = targetStore?.region || 'Región 1 - Lima Norte';

      const newHelpdeskTicket: Ticket = {
        id: `tk-cust-${Date.now()}`,
        code: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Avería de ${device.equipmentCode} (${device.model}) - ${incident.fallaType}`,
        description: `${incident.description}. Reportado por custodia CCTV. Portal Falabella AI-Monitoring: ${newTicketCode}`,
        priority: 'Alta',
        status: 'En Progreso',
        storeId: device.storeId,
        storeName: device.storeName,
        storeCode: String(device.storeCode),
        region: storeRegion,
        reportedBy: currentUser.name,
        assignedTo: 'DMS PERU S.A.C / Zebra',
        createdAt: 'Hace un momento',
        slaDueIn: '24 horas',
        ticketJR: newTicketCode,
        proveedorServicio: 'DMS PERU S.A.C',
        numeroSerie: device.serialNumber,
        modelo: device.model,
        detalleTicket: incident.description,
        tipoEquipo: device.deviceType,
        presupuestoMes: now.toLocaleString('es-PE', { month: 'long', year: 'numeric' }),
        fechaInicio: dateFormatted,
        commentsCount: 1,
        comments: [
          {
            id: `c-${Date.now()}`,
            author: currentUser.name,
            text: `Ticket generado automáticamente desde Custodia CCTV. Enlace oficial: https://ai-monitoring.falabella.com/login (Código Falabella: ${newTicketCode})`,
            timestamp: 'Justo ahora',
            isInternal: false
          }
        ]
      };

      setTickets(prev => [newHelpdeskTicket, ...prev]);
    }

    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `Incidencia Registrada: ${device.equipmentCode}`,
      message: `Equipo retenido en T-${device.storeCode}. Ticket Falabella: ${newTicketCode}`,
      type: 'falla_critica',
      severity: 'advertencia',
      timestamp: now.toISOString(),
      timeAgo: 'Hace un momento',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Corporate Login / SSO Handlers
  const handleLoginSuccess = (user: AppUser) => {
    // Strict directory check: is web access enabled?
    if (user.webAccessEnabled === false) {
      alert(`Acceso denegado: El usuario ${user.name} (${user.email}) se encuentra inhabilitado en el Directorio.`);
      return;
    }

    // Update user in directory with login timestamp and counter
    setUsers(prev => prev.map(u => {
      if (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()) {
        return {
          ...u,
          lastLoginAt: 'Ahora',
          lastLoginIp: user.lastLoginIp || '10.24.180.45 [Red Corporativa]',
          loginCount: (u.loginCount || 0) + 1
        };
      }
      return u;
    }));

    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('reliant_cmms_auth_session', 'true');
      localStorage.setItem('reliant_cmms_current_user', JSON.stringify(user));
    } catch (e) {}

    // Verify if current view is allowed for this role, redirect if needed
    if (!hasPageAccess(user.role, currentView)) {
      setCurrentView(getDefaultViewForRole(user.role));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowUserMenu(false);
    try {
      localStorage.setItem('reliant_cmms_auth_session', 'false');
    } catch (e) {}
  };

  const handleSwitchUserRole = (targetRole: string) => {
    const matched = users.find(u => u.role === targetRole);
    if (matched) {
      handleLoginSuccess(matched);
    } else {
      const updated = { ...currentUser, role: targetRole };
      handleLoginSuccess(updated);
    }
    setShowPrivilegesMatrix(false);
  };

  // Responsive Sidebar Collapse State (default to collapsed on tablet screens < 1150px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1150;
    }
    return false;
  });

  // Toast banner for live push simulation
  const [liveToast, setLiveToast] = useState<PushNotification | null>(null);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // AutoSync Engine State & Operations
  const [autoSyncConfig, setAutoSyncConfig] = useState<AutoSyncConfig>(() => MicrosoftDataService.getAutoSyncConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('reliant_cmms_stores_last_sync') || autoSyncConfig.lastSyncTimestamp;
  });

  const handleUpdateAutoSyncConfig = (patch: Partial<AutoSyncConfig>) => {
    const updated = MicrosoftDataService.saveAutoSyncConfig(patch);
    setAutoSyncConfig(updated);
  };

  const handleTriggerAutoSync = async (isStartup = false) => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await MicrosoftDataService.runBackgroundSync(stores, users);
      setIsSyncing(false);
      setLastSyncTime(result.timestamp);
      setAutoSyncConfig(MicrosoftDataService.getAutoSyncConfig());

      if (result.storesUpdated && result.storesUpdated.length > 0) {
        setStores(result.storesUpdated);
        try {
          localStorage.setItem('reliant_cmms_stores_data', JSON.stringify(result.storesUpdated));
          localStorage.setItem('reliant_cmms_stores_last_sync', result.timestamp);
        } catch (e) {}
      }

      if (result.usersUpdated && result.usersUpdated.length > 0) {
        setUsers(result.usersUpdated);
        try {
          localStorage.setItem('reliant_cmms_users_data', JSON.stringify(result.usersUpdated));
        } catch (e) {}
      }

      if (!isStartup) {
        const notif: PushNotification = {
          id: `notif-autosync-${Date.now()}`,
          title: 'Auto-Sincronización Completada',
          message: result.message,
          type: 'mantenimiento',
          severity: 'info',
          timestamp: result.timestamp,
          timeAgo: 'Ahora',
          read: false,
          linkModule: 'tiendas'
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } catch (e) {
      setIsSyncing(false);
    }
  };

  // Run on startup if configured
  useEffect(() => {
    if (autoSyncConfig.enabled && autoSyncConfig.syncOnStartup) {
      handleTriggerAutoSync(true);
    }
  }, []);

  // Recurring timer
  useEffect(() => {
    if (!autoSyncConfig.enabled || autoSyncConfig.intervalMinutes <= 0) return;
    const intervalMs = autoSyncConfig.intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      handleTriggerAutoSync(false);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoSyncConfig.enabled, autoSyncConfig.intervalMinutes, stores.length, users.length]);

  // Real-time Push Simulator Handler
  const handleSimulateNewPush = () => {
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const randomEq = equipments[Math.floor(Math.random() * equipments.length)];

    const newPush: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `Alerta Telemetría: ${randomEq.code}`,
      message: `Desviación térmica detectada en ${randomEq.name} (${randomStore.name}). Presión excedió umbral en 12%.`,
      type: 'falla_critica',
      severity: 'critica',
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      read: false,
      storeId: randomStore.id,
      storeName: randomStore.name,
      region: randomStore.region,
      linkModule: 'helpdesk'
    };

    setNotifications(prev => [newPush, ...prev]);
    setLiveToast(newPush);
    playNotificationChime();

    MicrosoftDataService.pushRecord('regionalAlerts', newPush);

    setTimeout(() => {
      setLiveToast(null);
    }, 6000);
  };

  // Add Equipment Handler
  const handleAddEquipment = (newEq: Equipment) => {
    setEquipments(prev => [newEq, ...prev]);
    MicrosoftDataService.pushRecord('equipments', newEq);
  };

  // Update Equipment Handler
  const handleUpdateEquipment = (updatedEq: Equipment) => {
    setEquipments(prev =>
      prev.map(eq => (eq.id === updatedEq.id ? updatedEq : eq))
    );
    MicrosoftDataService.pushRecord('equipments', updatedEq);
  };

  // Delete Equipment Handler
  const handleDeleteEquipment = (equipmentId: string) => {
    setEquipments(prev => prev.filter(eq => eq.id !== equipmentId));
  };

  // Update Store Handler
  const handleUpdateStore = (updatedStore: Store) => {
    setStores(prev => {
      const next = prev.map(s => (s.id === updatedStore.id ? updatedStore : s));
      try {
        localStorage.setItem('reliant_cmms_stores_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    MicrosoftDataService.pushRecord('stores', updatedStore);
  };

  // Delete Store Handler
  const handleDeleteStore = (storeId: string) => {
    setStores(prev => {
      const next = prev.filter(s => s.id !== storeId);
      try {
        localStorage.setItem('reliant_cmms_stores_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Add Ticket Handler
  const handleAddTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
    MicrosoftDataService.pushRecord('tickets', newTicket);

    // Also trigger push notification
    const newNotif: PushNotification = {
      id: `notif-tick-${Date.now()}`,
      title: `Nuevo Ticket Creado: ${newTicket.ticketNumber}`,
      message: `${newTicket.title} en ${newTicket.storeName}. Asignado a ${newTicket.assignedTo}.`,
      type: 'falla_critica',
      severity: newTicket.priority === 'Crítica' ? 'critica' : 'advertencia',
      timestamp: new Date().toISOString(),
      timeAgo: 'Ahora',
      read: false,
      storeId: newTicket.storeId,
      storeName: newTicket.storeName,
      region: newTicket.region,
      linkModule: 'helpdesk'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Update Ticket Status
  const handleUpdateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status } : t))
    );
    MicrosoftDataService.pushRecord('tickets', { id: ticketId, status });
  };

  // Update Ticket Full Handler
  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev =>
      prev.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
    );
    MicrosoftDataService.pushRecord('tickets', updatedTicket);
  };

  // Delete Ticket Handler
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
  };

  // Assign Technician
  const handleAssignTechnician = (ticketId: string, technician: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, assignedTo: technician, status: 'Asignado' } : t))
    );
    MicrosoftDataService.pushRecord('tickets', { id: ticketId, assignedTo: technician, status: 'Asignado' });
  };

  // Add Work Order Handler
  const handleAddWorkOrder = (newWo: Partial<WorkOrder>) => {
    const fullWo: WorkOrder = {
      id: `wo-${Date.now()}`,
      code: newWo.code || `WO-${Math.floor(1000 + Math.random() * 9000)}`,
      equipmentId: newWo.equipmentId || equipments[0].id,
      equipmentCode: newWo.equipmentCode || equipments[0].code,
      equipmentName: newWo.equipmentName || equipments[0].name,
      storeId: newWo.storeId || stores[0].id,
      storeName: newWo.storeName || stores[0].name,
      region: newWo.region || 'Lima y Callao',
      type: newWo.type || 'preventivo',
      status: 'Programado',
      date: newWo.date || new Date().toISOString().split('T')[0],
      technician: newWo.technician || 'Ing. Carlos Ramos',
      priority: 'Media',
      checklist: newWo.checklist || [
        { item: 'Inspección visual de componentes', status: 'na' },
        { item: 'Prueba de aislamiento y voltaje', status: 'na' }
      ]
    };
    setWorkOrders(prev => [fullWo, ...prev]);
    MicrosoftDataService.pushRecord('workOrders', fullWo);
  };

  // Add Bulk Work Orders Handler (Programación Masiva con Plantilla)
  const handleAddBulkWorkOrders = (newWos: Partial<WorkOrder>[]) => {
    const fullWos: WorkOrder[] = newWos.map((newWo, idx) => ({
      id: newWo.id || `wo-bulk-${Date.now()}-${idx}`,
      code: newWo.code || `OT-CAMP-${Math.floor(2000 + idx * 10 + Math.random() * 9)}`,
      orderNumber: newWo.code || `OT-CAMP-${Math.floor(2000 + idx * 10 + Math.random() * 9)}`,
      equipmentId: newWo.equipmentId || equipments[0]?.id || 'eq-gen',
      equipmentCode: newWo.equipmentCode || 'EQ-GEN',
      equipmentName: newWo.equipmentName || 'Mantenimiento Integral de Equipos Críticos',
      storeId: newWo.storeId || stores[0]?.id || 'store-001',
      storeName: newWo.storeName || stores[0]?.name || 'Tienda Tottus',
      region: newWo.region || 'Lima y Callao',
      type: newWo.type || 'preventivo',
      frequency: newWo.frequency || 'semestral',
      status: 'Programado',
      date: newWo.date || new Date().toISOString().split('T')[0],
      scheduledDate: newWo.scheduledDate || newWo.date || new Date().toISOString().split('T')[0],
      technician: newWo.technician || 'Cuadrilla Especializada por Región',
      priority: newWo.priority || 'Media',
      notes: newWo.notes,
      checklist: newWo.checklist || [
        { item: 'Inspección visual de componentes y conexionado', status: 'na' },
        { item: 'Pruebas de aislamiento eléctrico y verificación térmica', status: 'na' },
        { item: 'Limpieza técnica y lubricación de partes móviles', status: 'na' },
        { item: 'Prueba funcional operativa y firma de conformidad', status: 'na' }
      ]
    }));
    setWorkOrders(prev => [...fullWos, ...prev]);
    fullWos.forEach(wo => MicrosoftDataService.pushRecord('workOrders', wo));
  };

  // Update Work Order Status
  const handleUpdateWorkOrderStatus = (id: string, status: WorkOrder['status']) => {
    setWorkOrders(prev =>
      prev.map(w => (w.id === id ? { ...w, status } : w))
    );
    MicrosoftDataService.pushRecord('workOrders', { id, status });
  };

  // Update Full Work Order Handler
  const handleUpdateWorkOrder = (updatedWo: WorkOrder) => {
    setWorkOrders(prev =>
      prev.map(w => (w.id === updatedWo.id ? updatedWo : w))
    );
    MicrosoftDataService.pushRecord('workOrders', updatedWo);
  };

  // Delete Work Order Handler
  const handleDeleteWorkOrder = (workOrderId: string) => {
    setWorkOrders(prev => prev.filter(w => w.id !== workOrderId));
  };

  // Preventive Visit Handlers (Caminata Técnica Semestral)
  const handleSavePreventiveVisit = (newVisit: PreventiveVisit) => {
    setPreventiveVisits(prev => {
      const exists = prev.some(v => v.id === newVisit.id);
      if (exists) {
        return prev.map(v => v.id === newVisit.id ? newVisit : v);
      }
      return [newVisit, ...prev];
    });

    // Update store's ultimaVisitaPreventiva in stores state
    setStores(prevStores => prevStores.map(st => {
      if (String(st.codTienda) === String(newVisit.storeCode) || String(st.id) === String(newVisit.storeId)) {
        return {
          ...st,
          ultimaVisitaPreventiva: {
            fecha: newVisit.fechaVisita,
            estado: newVisit.estado,
            itOperator: newVisit.itOperator,
            gerenteTienda: newVisit.gerenteTienda,
            informePdf: newVisit.informePdfNombre,
            totalEquiposRevisados: newVisit.totalEquipos,
            observacionesDetectadas: newVisit.conObservacionCount,
            ticketsGenerados: newVisit.ticketsGeneradosCount,
            semaforoSemestral: 'al_dia'
          }
        };
      }
      return st;
    }));

    // Auto-generate Helpdesk Tickets for any items with ticketJR
    newVisit.itemsRevision.forEach(item => {
      if (item.ticketJR && (item.estado === 'Con observación' || item.estado === 'No operativo / Falla')) {
        const targetStore = stores.find(s => s.id === newVisit.storeId);
        const storeRegion = targetStore?.region || 'Región 1 - Lima Norte';
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('es-PE');

        const newTicket: Ticket = {
          id: `tk-vis-${Date.now()}-${item.id}`,
          code: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
          title: `[Caminata Semestral] ${item.equipoNombre} - ${item.observacion || 'Falla técnica detectada'}`,
          description: `Detectado durante Caminata Semestral ${newVisit.numeroVisita} en ${newVisit.storeName}. Operador IT: ${newVisit.itOperator}. Observación: ${item.observacion || 'Revisión requerida'}. Acción técnica: ${item.accionRealizada || 'Inspección correctiva'}. Reporte Falabella AI-Monitoring: ${item.ticketJR}`,
          priority: item.estado === 'No operativo / Falla' ? 'Alta' : 'Media',
          status: 'En Progreso',
          storeId: newVisit.storeId,
          storeName: newVisit.storeName,
          storeCode: String(newVisit.storeCode),
          region: storeRegion,
          reportedBy: newVisit.itOperator,
          assignedTo: 'Soporte Local Onsite',
          createdAt: 'Hace un momento',
          slaDueIn: '24 horas',
          ticketJR: item.ticketJR,
          proveedorServicio: item.categoryId === 'balanzas' ? 'SISTEMAS DE PESAJE S.A.C' : (item.categoryId.includes('pda') || item.categoryId.includes('impresora')) ? 'DMS PERU S.A.C / Zebra' : 'SOPORTE LOCAL RETAIL',
          detalleTicket: item.observacion || 'Falla registrada durante la caminata semestral',
          tipoEquipo: item.equipoNombre,
          presupuestoMes: now.toLocaleString('es-PE', { month: 'long', year: 'numeric' }),
          fechaInicio: dateFormatted,
          commentsCount: 1,
          comments: [
            {
              id: `c-vis-${Date.now()}`,
              author: `${newVisit.itOperator} (Técnico IT)`,
              timestamp: `${dateFormatted} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
              text: `Equipo inspeccionado en caminata semestral de tienda. Registrado con ticket Falabella: ${item.ticketJR}`
            }
          ]
        };
        setTickets(prev => [newTicket, ...prev]);
        MicrosoftDataService.pushRecord('tickets', newTicket);
      }
    });

    playNotificationChime();

    // Push notification
    const notif: PushNotification = {
      id: `notif-vis-${Date.now()}`,
      title: `Caminata Semestral Registrada: ${newVisit.storeName}`,
      message: `El operador ${newVisit.itOperator} guardó la visita preventiva ${newVisit.numeroVisita} (${newVisit.totalEquipos} equipos evaluados, ${newVisit.ticketsGeneradosCount} ticket(s) correctivo(s)).`,
      type: 'mantenimiento',
      severity: 'info',
      timestamp: new Date().toISOString(),
      timeAgo: 'Ahora',
      read: false,
      storeId: newVisit.storeId,
      storeName: newVisit.storeName,
      linkModule: 'visitas'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleUpdatePreventiveVisit = (updatedVisit: PreventiveVisit) => {
    setPreventiveVisits(prev => prev.map(v => v.id === updatedVisit.id ? updatedVisit : v));
  };

  const handleDeletePreventiveVisit = (visitId: string) => {
    setPreventiveVisits(prev => prev.filter(v => v.id !== visitId));
  };

  // Add Technical Report Handler
  const handleAddNewReport = (newRep: TechnicalReport) => {
    setReports(prev => [newRep, ...prev]);
    MicrosoftDataService.pushRecord('reports', newRep);
  };

  // Add User Handler
  const handleAddUser = (newUser: AppUser) => {
    setUsers(prev => {
      const next = [newUser, ...prev];
      try {
        localStorage.setItem('reliant_cmms_users_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    MicrosoftDataService.pushRecord('users', newUser);
  };

  // Update User Handler
  const handleUpdateUser = (updatedUser: AppUser) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      try {
        localStorage.setItem('reliant_cmms_users_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    MicrosoftDataService.pushRecord('users', updatedUser);
  };

  // Delete User Handler
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem('reliant_cmms_users_data', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Attendance & Presence Handlers
  const handleAddAttendanceLog = (newLogData: Partial<AttendanceLog>, updatePresence = true) => {
    const fullLog: AttendanceLog = {
      id: newLogData.id || `att-log-${Date.now()}`,
      userId: newLogData.userId || currentUser.id,
      userName: newLogData.userName || currentUser.name,
      userRole: newLogData.userRole || currentUser.role,
      userCargo: newLogData.userCargo || currentUser.cargo || currentUser.role,
      userPhone: newLogData.userPhone || currentUser.phone,
      userAvatar: newLogData.userAvatar || currentUser.avatarUrl,
      eventType: newLogData.eventType || 'ingreso',
      storeId: newLogData.storeId || stores[0].id,
      storeCode: newLogData.storeCode || stores[0].codTienda,
      storeName: newLogData.storeName || stores[0].name,
      storeRegion: newLogData.storeRegion || stores[0].region,
      targetStoreId: newLogData.targetStoreId,
      targetStoreCode: newLogData.targetStoreCode,
      targetStoreName: newLogData.targetStoreName,
      targetStoreRegion: newLogData.targetStoreRegion,
      timestamp: newLogData.timestamp || new Date().toISOString(),
      timeFormatted: newLogData.timeFormatted || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dateFormatted: newLogData.dateFormatted || new Date().toISOString().split('T')[0],
      motive: newLogData.motive || 'soporte_onsite',
      motiveDetail: newLogData.motiveDetail || '',
      ticketId: newLogData.ticketId,
      workOrderId: newLogData.workOrderId,
      notes: newLogData.notes,
      durationMinutes: newLogData.durationMinutes,
      durationFormatted: newLogData.durationFormatted,
      verifiedLocation: newLogData.verifiedLocation ?? true,
      registeredBy: newLogData.registeredBy || currentUser.name,
      source: newLogData.source || 'manual',
      sourceDetail: newLogData.sourceDetail,
      coordinates: newLogData.coordinates
    };

    setAttendanceLogs(prev => {
      const next = [fullLog, ...prev];
      try {
        localStorage.setItem('reliant_cmms_attendance_logs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (updatePresence) {
      setActivePresences(prev => {
        const existingIdx = prev.findIndex(p => p.userId === fullLog.userId);
        let updatedList = [...prev];

        if (fullLog.eventType === 'ingreso') {
          const newPresence: ActivePersonnelPresence = {
            userId: fullLog.userId,
            userName: fullLog.userName,
            userRole: fullLog.userRole,
            userCargo: fullLog.userCargo,
            userPhone: fullLog.userPhone,
            userAvatar: fullLog.userAvatar,
            status: 'en_tienda',
            currentStoreId: fullLog.storeId,
            currentStoreCode: fullLog.storeCode,
            currentStoreName: fullLog.storeName,
            currentStoreRegion: fullLog.storeRegion,
            checkInTime: fullLog.timeFormatted,
            checkInDate: fullLog.dateFormatted,
            motive: fullLog.motive,
            motiveDetail: fullLog.motiveDetail,
            activeTicketOrWo: fullLog.ticketId || fullLog.workOrderId,
            lastEventTime: fullLog.timeFormatted,
            todayLogsCount: (existingIdx >= 0 ? prev[existingIdx].todayLogsCount : 0) + 1
          };

          if (existingIdx >= 0) {
            updatedList[existingIdx] = newPresence;
          } else {
            updatedList.unshift(newPresence);
          }
        } else if (fullLog.eventType === 'salida') {
          if (existingIdx >= 0) {
            updatedList[existingIdx] = {
              ...prev[existingIdx],
              status: 'jornada_finalizada',
              currentStoreId: undefined,
              currentStoreCode: undefined,
              currentStoreName: undefined,
              lastEventTime: `${fullLog.timeFormatted} (Salida de T-${fullLog.storeCode})`,
              todayLogsCount: prev[existingIdx].todayLogsCount + 1
            };
          }
        } else if (fullLog.eventType === 'traslado') {
          const newPresence: ActivePersonnelPresence = {
            userId: fullLog.userId,
            userName: fullLog.userName,
            userRole: fullLog.userRole,
            userCargo: fullLog.userCargo,
            userPhone: fullLog.userPhone,
            userAvatar: fullLog.userAvatar,
            status: 'en_traslado',
            currentStoreId: undefined,
            fromStoreId: fullLog.storeId,
            fromStoreCode: fullLog.storeCode,
            fromStoreName: fullLog.storeName,
            toStoreId: fullLog.targetStoreId,
            toStoreCode: fullLog.targetStoreCode,
            toStoreName: fullLog.targetStoreName,
            departureTime: fullLog.timeFormatted,
            motive: fullLog.motive,
            motiveDetail: fullLog.motiveDetail,
            lastEventTime: `${fullLog.timeFormatted} (Traslado)`,
            todayLogsCount: (existingIdx >= 0 ? prev[existingIdx].todayLogsCount : 0) + 1
          };

          if (existingIdx >= 0) {
            updatedList[existingIdx] = newPresence;
          } else {
            updatedList.unshift(newPresence);
          }
        }

        try {
          localStorage.setItem('reliant_cmms_active_presences', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });
    }
  };

  const handleUpdateAttendanceLog = (updated: AttendanceLog) => {
    setAttendanceLogs(prev => {
      const next = prev.map(l => l.id === updated.id ? updated : l);
      try {
        localStorage.setItem('reliant_cmms_attendance_logs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleDeleteAttendanceLog = (id: string) => {
    setAttendanceLogs(prev => {
      const next = prev.filter(l => l.id !== id);
      try {
        localStorage.setItem('reliant_cmms_attendance_logs', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleQuickCheckIn = (userId: string, storeId: string, motive: AttendanceMotive, detail?: string) => {
    const user = users.find(u => u.id === userId) || currentUser;
    const store = stores.find(s => s.id === storeId) || stores[0];
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    handleAddAttendanceLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userCargo: user.cargo || user.role,
      userPhone: user.phone,
      userAvatar: user.avatarUrl,
      eventType: 'ingreso',
      storeId: store.id,
      storeCode: store.codTienda,
      storeName: store.name,
      storeRegion: store.region,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted: now.toISOString().split('T')[0],
      motive,
      motiveDetail: detail || 'Ingreso registrado en tienda',
      verifiedLocation: true,
      registeredBy: currentUser.name
    }, true);
  };

  const handleQuickCheckOut = (userId: string, notes?: string) => {
    const presence = activePresences.find(p => p.userId === userId);
    if (!presence) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    handleAddAttendanceLog({
      userId: presence.userId,
      userName: presence.userName,
      userRole: presence.userRole,
      userCargo: presence.userCargo,
      userPhone: presence.userPhone,
      userAvatar: presence.userAvatar,
      eventType: 'salida',
      storeId: presence.currentStoreId || stores[0].id,
      storeCode: presence.currentStoreCode || stores[0].codTienda,
      storeName: presence.currentStoreName || stores[0].name,
      storeRegion: presence.currentStoreRegion || stores[0].region,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted: now.toISOString().split('T')[0],
      motive: presence.motive || 'soporte_onsite',
      motiveDetail: 'Salida de tienda registrada',
      notes: notes || 'Fin de permanencia en tienda',
      verifiedLocation: true,
      registeredBy: currentUser.name
    }, true);
  };

  const handleQuickTransfer = (userId: string, targetStoreId: string, motiveDetail?: string) => {
    const presence = activePresences.find(p => p.userId === userId);
    const targetStore = stores.find(s => s.id === targetStoreId);
    if (!presence || !targetStore) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    handleAddAttendanceLog({
      userId: presence.userId,
      userName: presence.userName,
      userRole: presence.userRole,
      userCargo: presence.userCargo,
      userPhone: presence.userPhone,
      userAvatar: presence.userAvatar,
      eventType: 'traslado',
      storeId: presence.currentStoreId || stores[0].id,
      storeCode: presence.currentStoreCode || stores[0].codTienda,
      storeName: presence.currentStoreName || stores[0].name,
      storeRegion: presence.currentStoreRegion || stores[0].region,
      targetStoreId: targetStore.id,
      targetStoreCode: targetStore.codTienda,
      targetStoreName: targetStore.name,
      targetStoreRegion: targetStore.region,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted: now.toISOString().split('T')[0],
      motive: 'soporte_onsite',
      motiveDetail: motiveDetail || `Traslado hacia T-${targetStore.codTienda} ${targetStore.name}`,
      verifiedLocation: true,
      registeredBy: currentUser.name
    }, true);
  };

  // Broadcast Regional Alert
  const handleBroadcastAlert = (newAlert: RegionalAlert) => {
    setRegionalAlerts(prev => [newAlert, ...prev]);
    MicrosoftDataService.pushRecord('regionalAlerts', newAlert);

    // Create push notifications for this broadcast
    const newNotif: PushNotification = {
      id: `notif-alert-${Date.now()}`,
      title: `🚨 ALERTA CRÍTICA: ${newAlert.title}`,
      message: `${newAlert.description} (${newAlert.scope === 'regional' ? newAlert.region : newAlert.storeName})`,
      type: 'falla_critica',
      severity: 'critica',
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      read: false,
      region: newAlert.region,
      storeId: newAlert.storeId,
      storeName: newAlert.storeName,
      linkModule: 'dashboard'
    };
    setNotifications(prev => [newNotif, ...prev]);
    setLiveToast(newNotif);
  };

  // Resolve Alert
  const handleResolveAlert = (alertId: string) => {
    setRegionalAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, active: false } : a))
    );
  };

  // Mark single notification as read
  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const handleMarkAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Handler for applying stores synced from SharePoint
  const handleApplySyncedStores = (newStores: Store[], sourceInfo: string) => {
    setStores(newStores);
    try {
      localStorage.setItem('reliant_cmms_stores_data', JSON.stringify(newStores));
      localStorage.setItem('reliant_cmms_stores_last_sync', new Date().toISOString());
      localStorage.setItem('reliant_cmms_stores_source', sourceInfo);
    } catch (e) {
      console.warn('Error saving stores to localStorage', e);
    }

    if (autoSyncConfig.syncUsersAgenda) {
      const mergedUsers = MicrosoftDataService.extractUsersFromStores(newStores, users);
      setUsers(mergedUsers);
      try {
        localStorage.setItem('reliant_cmms_users_data', JSON.stringify(mergedUsers));
      } catch (e) {}
    }

    const syncNotif: PushNotification = {
      id: `notif-sync-${Date.now()}`,
      title: 'Planilla de Tiendas Sincronizada',
      message: `Se han integrado ${newStores.length} tiendas exitosamente desde ${sourceInfo}.${autoSyncConfig.syncUsersAgenda ? ' Agenda de usuarios en tienda actualizada.' : ''}`,
      type: 'mantenimiento',
      severity: 'info',
      timestamp: new Date().toISOString(),
      timeAgo: 'Ahora',
      read: false,
      linkModule: 'tiendas'
    };
    setNotifications(prev => [syncNotif, ...prev]);
  };

  // Reset stores to default 90 stores
  const handleResetToDefaultStores = () => {
    setStores(INITIAL_STORES);
    try {
      localStorage.removeItem('reliant_cmms_stores_data');
      localStorage.removeItem('reliant_cmms_stores_last_sync');
      localStorage.removeItem('reliant_cmms_stores_source');
    } catch (e) {
      console.warn('Error clearing stores cache', e);
    }
  };

  // Corporate Login Gate (Single Sign-On Outlook)
  if (!isAuthenticated) {
    return (
      <CorporateLoginView
        onLoginSuccess={handleLoginSuccess}
        availableUsers={users}
        onRecordAuditLog={handleRecordLoginAudit}
        loginAuditLogs={loginAuditLogs}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans selection:bg-[#00236f] selection:text-white overflow-x-hidden">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        currentView={currentView}
        onSelectView={setCurrentView}
        currentUser={currentUser}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenAlertsManager={() => setShowRegionalAlerts(true)}
        onOpenM365Sync={() => setShowM365Sync(true)}
        onOpenPrivilegesMatrix={() => setShowPrivilegesMatrix(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area Wrapper: adapts dynamically to sidebar and uses 100% viewport width */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[260px]'
      }`}>
        {/* Mobile Top Header */}
        <MobileHeader
          currentView={currentView}
          currentUser={currentUser}
          unreadCount={unreadNotificationsCount}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenQRScanner={() => setShowQRScanner(true)}
          onOpenAlertsManager={() => setShowRegionalAlerts(true)}
          onOpenM365Sync={() => setShowM365Sync(true)}
          onOpenStoreSync={() => setShowStoreSharePointSync(true)}
          onOpenPrivilegesMatrix={() => setShowPrivilegesMatrix(true)}
          onLogout={handleLogout}
          isAutoSyncActive={autoSyncConfig.enabled}
        />

        {/* Desktop Top Header Bar with AutoSync Status & Quick Actions */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 xl:px-10 py-3 bg-white border-b border-[#e5eeff] sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#00236f]">CMMS Tottus</span>
              <span className="text-[#c4c6d0]">/</span>
              <span className="text-[#444651] capitalize font-semibold">
                {currentView === 'dashboard' ? 'Panel General' :
                 currentView === 'inventario' ? 'Inventario de Activos' :
                 currentView === 'mantenimiento' ? 'Mantenimiento & OTs' :
                 currentView === 'monitoreo' ? 'Asistencia & Monitoreo Onsite' :
                 currentView === 'informes' ? 'Informes Técnicos' :
                 currentView === 'tiendas' ? 'Sucursales (90)' :
                 currentView === 'helpdesk' ? 'Helpdesk & Repuestos' :
                 currentView === 'usuarios' ? 'Agenda de Tiendas' : currentView}
              </span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stores.length} Tiendas en Red
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* AutoSync Status Indicator & Settings Widget */}
            <AutoSyncStatusWidget
              onTriggerSync={() => handleTriggerAutoSync(false)}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onOpenSyncModal={() => setShowStoreSharePointSync(true)}
              autoSyncConfig={autoSyncConfig}
              onUpdateConfig={handleUpdateAutoSyncConfig}
            />

            <div className="h-5 w-px bg-[#e5eeff]" />

            {/* Quick action buttons */}
            {hasPageAccess(currentUser.role, 'custodia') && (
              <button
                onClick={() => setCurrentView('custodia')}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  currentView === 'custodia'
                    ? 'bg-[#00236f] text-white'
                    : 'text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff]'
                }`}
                title="Custodia CCTV & Monitoreo de PDAs e Impresoras"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-bold">Custodia CCTV</span>
              </button>
            )}

            {hasPageAccess(currentUser.role, 'despachador') && (
              <button
                onClick={() => setCurrentView('despachador')}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  currentView === 'despachador'
                    ? 'bg-[#00236f] text-white'
                    : 'text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff]'
                }`}
                title="Despachador Rápido de Correos"
              >
                <Send className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-bold">Despacho Correos</span>
              </button>
            )}

            <button
              onClick={() => setShowQRScanner(true)}
              className="p-1.5 rounded-lg text-[#00236f] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors"
              title="Escanear QR de Equipo"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowRegionalAlerts(true)}
              className="p-1.5 rounded-lg text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6] transition-colors"
              title="Alertas Críticas"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-1.5 rounded-lg text-[#444651] bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white" />
              )}
            </button>

            <div className="h-5 w-px bg-[#e5eeff]" />

            {/* Outlook Corporate Profile & RBAC Controls */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-[#dce9ff] bg-[#f8faff] hover:bg-[#eff4ff] transition-all cursor-pointer text-left shadow-xs"
                title="Perfil y Privilegios"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-[#00236f]/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-[#00236f] leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#007a33] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#757682]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-[#dce9ff] p-3.5 z-50 animate-fadeIn space-y-3">
                  <div className="border-b border-[#e5eeff] pb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#007a33] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Outlook Conectado
                      </span>
                      <span className="text-[10px] text-[#757682] font-semibold">
                        {getAllowedModulesForRole(currentUser.role).length}/{Object.keys(APP_MODULES).length} módulos
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#00236f] mt-1.5">{currentUser.name}</div>
                    <div className="text-[11px] text-[#525e75] font-mono truncate">{currentUser.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRoleConfig(currentUser.role).badgeColor}`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowPrivilegesMatrix(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#00236f] hover:bg-[#eff4ff] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Matriz de Privilegios</span>
                      </div>
                      <span className="text-[10px] bg-[#eff4ff] text-[#00236f] px-1.5 py-0.5 rounded font-bold border border-[#c4dcff]">
                        RBAC
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión Corporativa Outlook</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area: Protected by Role-Based Access Control (RBAC) */}
        <main className="flex-1 pt-20 md:pt-6 px-3.5 sm:px-6 lg:px-8 xl:px-10 w-full min-w-0 pb-12">
          {!hasPageAccess(currentUser.role, currentView) ? (
            <AccessDeniedView
              currentView={currentView}
              currentUser={currentUser}
              onNavigateToAllowed={(targetView) => setCurrentView(targetView)}
              onOpenPrivilegesModal={() => setShowPrivilegesMatrix(true)}
              onChangeAccount={handleLogout}
            />
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  tickets={tickets}
                  workOrders={workOrders}
                  stores={stores}
                  onNavigate={setCurrentView}
                  onOpenNewTicket={() => setCurrentView('helpdesk')}
                  onOpenQRScanner={() => setShowQRScanner(true)}
                  onOpenAlertsManager={() => setShowRegionalAlerts(true)}
                  onSelectTicket={(t) => {
                    setCurrentView('helpdesk');
                  }}
                />
              )}

              {currentView === 'inventario' && (
                <InventoryView
                  equipments={equipments}
                  stores={stores}
                  onSelectEquipment={(eq) => setSelectedEquipmentForDetail(eq)}
                  onOpenNewEquipment={() => setShowNewEquipment(true)}
                  onOpenQRScanner={() => setShowQRScanner(true)}
                  onUpdateEquipment={handleUpdateEquipment}
                  onDeleteEquipment={handleDeleteEquipment}
                />
              )}

              {currentView === 'tiendas' && (
                <StoresView
                  stores={stores}
                  equipments={equipments}
                  onSelectStore={(st) => {
                    setCurrentView('inventario');
                  }}
                  onGenerateReportForStore={(st) => {
                    setCurrentView('informes');
                  }}
                  onOpenRegionalAlerts={() => setShowRegionalAlerts(true)}
                  onOpenSharePointSync={() => setShowStoreSharePointSync(true)}
                  onUpdateStore={handleUpdateStore}
                  onDeleteStore={handleDeleteStore}
                  onNavigateToVisitas={() => setCurrentView('visitas')}
                />
              )}

              {currentView === 'mantenimiento' && (
                <MaintenanceView
                  workOrders={workOrders}
                  equipments={equipments}
                  stores={stores}
                  users={users}
                  currentUser={currentUser}
                  onAddWorkOrder={handleAddWorkOrder}
                  onAddBulkWorkOrders={handleAddBulkWorkOrders}
                  onUpdateWorkOrder={handleUpdateWorkOrder}
                  onDeleteWorkOrder={handleDeleteWorkOrder}
                  onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
                  onNavigateToVisitas={() => setCurrentView('visitas')}
                />
              )}

              {currentView === 'visitas' && (
                <PreventiveVisitsView
                  stores={stores}
                  visits={preventiveVisits}
                  currentUser={currentUser}
                  onSaveVisit={handleSavePreventiveVisit}
                  onUpdateVisit={handleUpdatePreventiveVisit}
                  onDeleteVisit={handleDeletePreventiveVisit}
                  onCreateHelpdeskTicket={handleAddTicket}
                  onNavigateToHelpdesk={() => setCurrentView('helpdesk')}
                  onNavigateToStores={() => setCurrentView('tiendas')}
                  onNavigateToMaintenance={() => setCurrentView('mantenimiento')}
                />
              )}

              {currentView === 'custodia' && (
                <DeviceCustodyView
                  devices={deviceCustodyItems}
                  stores={stores}
                  colaboradores={storeColaboradores}
                  currentUser={currentUser}
                  equipments={equipments}
                  onAddDevice={(dev) => setDeviceCustodyItems(prev => [dev, ...prev])}
                  onUpdateDevice={(dev) => setDeviceCustodyItems(prev => prev.map(d => d.id === dev.id ? dev : d))}
                  onDeleteDevice={(id) => setDeviceCustodyItems(prev => prev.filter(d => d.id !== id))}
                  onRegisterLoan={handleRegisterLoan}
                  onRegisterReturn={handleRegisterReturn}
                  onReportIncident={handleReportIncident}
                  onNavigateToHelpdesk={() => setCurrentView('helpdesk')}
                  onNavigateToInventory={() => setCurrentView('inventario')}
                />
              )}

              {currentView === 'monitoreo' && (
                <PersonnelMonitoringView
                  logs={attendanceLogs}
                  presences={activePresences}
                  stores={stores}
                  users={users}
                  currentUser={currentUser}
                  onAddLog={handleAddAttendanceLog}
                  onUpdateLog={handleUpdateAttendanceLog}
                  onDeleteLog={handleDeleteAttendanceLog}
                  onQuickCheckIn={handleQuickCheckIn}
                  onQuickCheckOut={handleQuickCheckOut}
                  onQuickTransfer={handleQuickTransfer}
                />
              )}

              {currentView === 'informes' && (
                <TechnicalReportsView
                  reports={reports}
                  equipments={equipments}
                  stores={stores}
                  workOrders={workOrders}
                  currentUser={currentUser}
                  onAddNewReport={handleAddNewReport}
                />
              )}

              {currentView === 'helpdesk' && (
                <HelpdeskView
                  tickets={tickets}
                  equipments={equipments}
                  stores={stores}
                  currentUser={currentUser}
                  onAddTicket={handleAddTicket}
                  onUpdateTicket={handleUpdateTicket}
                  onDeleteTicket={handleDeleteTicket}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  onAssignTechnician={handleAssignTechnician}
                />
              )}

              {currentView === 'usuarios' && (
                <UserDirectoryView
                  users={users}
                  stores={stores}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  loginAuditLogs={loginAuditLogs}
                  onRecordLoginAudit={handleRecordLoginAudit}
                  onClearLoginAuditLogs={handleClearLoginAuditLogs}
                  currentUser={currentUser}
                  onSelectStore={() => {
                    setCurrentView('tiendas');
                  }}
                />
              )}

              {currentView === 'despachador' && (
                <QuickEmailDispatcher
                  currentUser={currentUser}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          currentView={currentView}
          onSelectView={setCurrentView}
          onOpenAlertsManager={() => setShowRegionalAlerts(true)}
          currentUser={currentUser}
          onOpenPrivilegesMatrix={() => setShowPrivilegesMatrix(true)}
          onLogout={handleLogout}
        />
      </div>

      {/* Floating Live Push Toast Notification Banner */}
      {liveToast && (
        <div
          onClick={() => {
            setShowNotifications(true);
            setLiveToast(null);
          }}
          className="fixed top-18 md:top-4 right-4 z-50 max-w-sm w-full bg-white rounded-2xl p-4 shadow-2xl border-2 border-[#ba1a1a] flex items-start gap-3 cursor-pointer animate-bounce"
        >
          <div className="w-9 h-9 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
            🚨
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#ba1a1a] truncate">{liveToast.title}</h4>
              <span className="text-[10px] text-[#757682]">Ahora</span>
            </div>
            <p className="text-xs text-[#444651] line-clamp-2 mt-0.5">{liveToast.message}</p>
            <span className="text-[10px] text-[#00236f] font-semibold mt-1 block">
              Toca para ver detalles →
            </span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onSimulateNewPush={handleSimulateNewPush}
        onNavigateModule={(mod) => setCurrentView(mod)}
      />

      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        equipments={equipments}
        onSelectEquipment={(eq) => setSelectedEquipmentForDetail(eq)}
      />

      <EquipmentDetailModal
        equipment={selectedEquipmentForDetail}
        onClose={() => setSelectedEquipmentForDetail(null)}
        onOpenReportForEquipment={(eq) => {
          setCurrentView('informes');
        }}
        onOpenTicketForEquipment={(eq) => {
          setCurrentView('helpdesk');
        }}
      />

      <NewEquipmentModal
        isOpen={showNewEquipment}
        onClose={() => setShowNewEquipment(false)}
        stores={stores}
        onAddEquipment={handleAddEquipment}
      />

      <RegionalAlertsModal
        isOpen={showRegionalAlerts}
        onClose={() => setShowRegionalAlerts(false)}
        stores={stores}
        regionalAlerts={regionalAlerts}
        onBroadcastAlert={handleBroadcastAlert}
        onResolveAlert={handleResolveAlert}
      />

      <SharePointDataverseModal
        isOpen={showM365Sync}
        onClose={() => setShowM365Sync(false)}
        stores={stores}
        equipments={equipments}
        tickets={tickets}
        workOrders={workOrders}
        reports={reports}
        users={users}
        regionalAlerts={regionalAlerts}
      />

      <SharePointStoreSyncModal
        isOpen={showStoreSharePointSync}
        onClose={() => setShowStoreSharePointSync(false)}
        currentStores={stores}
        onApplyStores={handleApplySyncedStores}
        onResetToDefaultStores={handleResetToDefaultStores}
      />

      <PrivilegesMatrixModal
        isOpen={showPrivilegesMatrix}
        onClose={() => setShowPrivilegesMatrix(false)}
        currentUser={currentUser}
        onSwitchUserRole={handleSwitchUserRole}
      />
    </div>
  );
}
