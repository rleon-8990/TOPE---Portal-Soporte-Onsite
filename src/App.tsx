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
  RegionalAlert
} from './types';
import { playNotificationChime } from './utils/helpers';
import { MicrosoftDataService } from './services/microsoftDataService';

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

    const syncNotif: PushNotification = {
      id: `notif-sync-${Date.now()}`,
      title: 'Planilla de Tiendas Sincronizada',
      message: `Se han integrado ${newStores.length} tiendas exitosamente desde ${sourceInfo}.`,
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
        />

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
          />
        )}

        {currentView === 'mantenimiento' && (
          <MaintenanceView
            workOrders={workOrders}
            equipments={equipments}
            stores={stores}
            onAddWorkOrder={handleAddWorkOrder}
            onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
          />
        )}

        {currentView === 'informes' && (
          <TechnicalReportsView
            reports={reports}
            equipments={equipments}
            stores={stores}
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
