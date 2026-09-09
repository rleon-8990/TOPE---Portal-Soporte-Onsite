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
  AttendanceMotive
} from './types';
import { playNotificationChime } from './utils/helpers';
import { MicrosoftDataService, AutoSyncConfig } from './services/microsoftDataService';
import { INITIAL_ATTENDANCE_LOGS, INITIAL_ACTIVE_PRESENCES } from './data/attendanceMockData';
import { QrCode, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';

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
import { AutoSyncStatusWidget } from './components/AutoSyncStatusWidget';

// Modals
import { NotificationModal } from './components/NotificationModal';
import { QRScannerModal } from './components/QRScannerModal';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { NewEquipmentModal } from './components/NewEquipmentModal';
import { RegionalAlertsModal } from './components/RegionalAlertsModal';
import { SharePointDataverseModal } from './components/SharePointDataverseModal';
import { SharePointStoreSyncModal } from './components/SharePointStoreSyncModal';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Core Data State with localStorage persistence for synced stores
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('reliant_cmms_stores_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading saved stores', e);
    }
    return INITIAL_STORES;
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

  // Active Current User
  const [currentUser, setCurrentUser] = useState<AppUser>(INITIAL_USERS[0]);

  // Modal Visibility States
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [selectedEquipmentForDetail, setSelectedEquipmentForDetail] = useState<Equipment | null>(null);
  const [showNewEquipment, setShowNewEquipment] = useState<boolean>(false);
  const [showRegionalAlerts, setShowRegionalAlerts] = useState<boolean>(false);
  const [showM365Sync, setShowM365Sync] = useState<boolean>(false);
  const [showStoreSharePointSync, setShowStoreSharePointSync] = useState<boolean>(false);

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
          </div>
        </header>

        {/* Main Content Area: uses full screen width on desktop, comfortably padded, never overflows */}
        <main className="flex-1 pt-20 md:pt-6 px-3.5 sm:px-6 lg:px-8 xl:px-10 w-full min-w-0 pb-12">
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
          />
        )}

        {currentView === 'mantenimiento' && (
          <MaintenanceView
            workOrders={workOrders}
            equipments={equipments}
            stores={stores}
            onAddWorkOrder={handleAddWorkOrder}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onDeleteWorkOrder={handleDeleteWorkOrder}
            onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
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
            onSelectStore={() => {
              setCurrentView('tiendas');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAlertsManager={() => setShowRegionalAlerts(true)}
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
    </div>
  );
}
