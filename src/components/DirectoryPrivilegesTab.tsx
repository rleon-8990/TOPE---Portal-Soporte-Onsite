import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  History,
  Building2,
  MapPin,
  Clock,
  Users,
  Edit2,
  Layers,
  Repeat,
  FileText,
  Wrench,
  Boxes,
  Store,
  Headphones,
  UserCheck,
  Send,
  LayoutDashboard,
  Check,
  X,
  RotateCcw,
  Crown,
  Info,
  SlidersHorizontal,
  Save
} from 'lucide-react';
import { AppUser } from '../types';
import {
  APP_MODULES,
  AVAILABLE_ROLES,
  RoleConfig,
  getRoleConfig,
  getStoredRoleConfigs,
  saveRoleConfig,
  resetRoleConfigsToDefault,
  canUserManagePrivileges,
  getUserAllowedModules,
  canUserEdit
} from '../utils/rbac';

interface DirectoryPrivilegesTabProps {
  users: AppUser[];
  currentUser?: AppUser;
  onUpdateUser?: (user: AppUser) => void;
  onNavigateToAudit?: (userEmail?: string) => void;
  onLoginAsAdmin?: () => void;
}

export const DirectoryPrivilegesTab: React.FC<DirectoryPrivilegesTabProps> = ({
  users,
  currentUser,
  onUpdateUser,
  onNavigateToAudit,
  onLoginAsAdmin
}) => {
  // Sub-navigation: Privilegios por Colaborador vs Perfiles de Rol (RBAC)
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'roles'>('usuarios');

  // Filters for User view
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal State for Editing Individual User Privileges
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userModalAllowedModules, setUserModalAllowedModules] = useState<string[]>([]);
  const [userModalCanEdit, setUserModalCanEdit] = useState<boolean>(true);
  const [userModalCanManagePrivileges, setUserModalCanManagePrivileges] = useState<boolean>(false);
  const [userModalWebAccess, setUserModalWebAccess] = useState<boolean>(true);
  const [userModalRole, setUserModalRole] = useState<string>('');

  // State for Managing Role Profiles (RBAC)
  const [storedRoles, setStoredRoles] = useState<Record<string, RoleConfig>>(() => getStoredRoleConfigs());
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(AVAILABLE_ROLES[0]);
  const [roleModalAllowedModules, setRoleModalAllowedModules] = useState<string[]>(() => {
    const cfg = getRoleConfig(AVAILABLE_ROLES[0]);
    return cfg.allowedModules;
  });
  const [roleCanManageM365, setRoleCanManageM365] = useState<boolean>(false);
  const [roleCanManageUsers, setRoleCanManageUsers] = useState<boolean>(false);
  const [roleCanBroadcastAlerts, setRoleCanBroadcastAlerts] = useState<boolean>(false);
  const [roleCanManagePrivileges, setRoleCanManagePrivileges] = useState<boolean>(false);

  // Authority verification
  const isMasterAuthorized = canUserManagePrivileges(currentUser);

  // When changing selected role in the Role Profiles view
  const handleSelectRoleToEdit = (role: string) => {
    setSelectedRoleKey(role);
    const cfg = getRoleConfig(role);
    setRoleModalAllowedModules([...cfg.allowedModules]);
    setRoleCanManageM365(!!cfg.canManageM365);
    setRoleCanManageUsers(!!cfg.canManageUsers);
    setRoleCanBroadcastAlerts(!!cfg.canBroadcastAlerts);
    setRoleCanManagePrivileges(!!cfg.canManagePrivileges);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const enabled = users.filter(u => u.webAccessEnabled !== false).length;
    const disabled = users.filter(u => u.webAccessEnabled === false).length;
    const privilegeDelegates = users.filter(u => canUserManagePrivileges(u)).length;
    return { total, enabled, disabled, privilegeDelegates };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Access filter
      const isEnabled = user.webAccessEnabled !== false;
      if (accessFilter === 'enabled' && !isEnabled) return false;
      if (accessFilter === 'disabled' && isEnabled) return false;

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;

      // Region filter
      if (regionFilter !== 'all' && user.assignedRegion !== regionFilter && user.assignedRegion !== 'Nacional') return false;

      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesRole = (user.role || '').toLowerCase().includes(q);
        const matchesTienda = (user.tiendaNombre || '').toLowerCase().includes(q);
        const matchesCod = String(user.codTienda || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole && !matchesTienda && !matchesCod) {
          return false;
        }
      }

      return true;
    });
  }, [users, accessFilter, roleFilter, regionFilter, searchQuery]);

  // Open Edit User Modal
  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser(user);
    const effectiveModules = getUserAllowedModules(user);
    setUserModalAllowedModules([...effectiveModules]);
    setUserModalCanEdit(canUserEdit(user));
    setUserModalCanManagePrivileges(canUserManagePrivileges(user));
    setUserModalWebAccess(user.webAccessEnabled !== false);
    setUserModalRole(user.role);
  };

  // Toggle Module in User Modal
  const handleToggleUserModule = (moduleId: string) => {
    setUserModalAllowedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(m => m !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Save User Privileges
  const handleSaveUserPrivileges = () => {
    if (!editingUser || !onUpdateUser) return;

    const updatedUser: AppUser = {
      ...editingUser,
      role: userModalRole,
      allowedModules: userModalAllowedModules,
      canEdit: userModalCanEdit,
      accessType: userModalCanEdit ? 'escritura' : 'lectura',
      canManagePrivileges: userModalCanManagePrivileges,
      webAccessEnabled: userModalWebAccess
    };

    onUpdateUser(updatedUser);
    setEditingUser(null);
    setActionNotice(`Privilegios y módulos actualizados exitosamente para ${updatedUser.name}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Reset User Modules to Role Defaults
  const handleResetUserToRoleDefaults = () => {
    const roleCfg = getRoleConfig(userModalRole);
    setUserModalAllowedModules([...roleCfg.allowedModules]);
  };

  // Toggle Module in Role Profile
  const handleToggleRoleModule = (moduleId: string) => {
    setRoleModalAllowedModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(m => m !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Save Role Profile (RBAC)
  const handleSaveRoleProfile = () => {
    const updated = saveRoleConfig(selectedRoleKey, {
      allowedModules: roleModalAllowedModules,
      canManageM365: roleCanManageM365,
      canManageUsers: roleCanManageUsers,
      canBroadcastAlerts: roleCanBroadcastAlerts,
      canManagePrivileges: roleCanManagePrivileges
    });
    setStoredRoles(updated);
    setActionNotice(`Perfil de Rol "${selectedRoleKey}" guardado y aplicado a nivel global.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Reset All Role Profiles to Factory Defaults
  const handleResetAllRoles = () => {
    if (confirm('¿Restablecer todos los perfiles de roles a los valores originales de fábrica?')) {
      const reset = resetRoleConfigsToDefault();
      setStoredRoles(reset);
      const currentCfg = reset[selectedRoleKey] || reset['Administrador'];
      setRoleModalAllowedModules([...currentCfg.allowedModules]);
      setRoleCanManageM365(!!currentCfg.canManageM365);
      setRoleCanManageUsers(!!currentCfg.canManageUsers);
      setRoleCanBroadcastAlerts(!!currentCfg.canBroadcastAlerts);
      setRoleCanManagePrivileges(!!currentCfg.canManagePrivileges);
      setActionNotice('Se han restablecido los perfiles de roles a valores de fábrica.');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Quick toggle: ¿Puede hacer cambios? (Escritura vs Lectura)
  const handleToggleCanEdit = (user: AppUser) => {
    if (!onUpdateUser) return;
    const currentCanEdit = canUserEdit(user);
    const newCanEdit = !currentCanEdit;

    const updatedUser: AppUser = {
      ...user,
      canEdit: newCanEdit,
      accessType: newCanEdit ? 'escritura' : 'lectura'
    };

    onUpdateUser(updatedUser);
    setActionNotice(
      `Permiso de cambios: ${user.name} ahora ${
        newCanEdit ? 'PUEDE HACER CAMBIOS (Escritura)' : 'está en SOLO LECTURA'
      }`
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Toggle Web Access switch
  const handleToggleAccess = (user: AppUser) => {
    if (!onUpdateUser) return;
    const currentStatus = user.webAccessEnabled !== false;
    const newStatus = !currentStatus;

    const updatedUser: AppUser = {
      ...user,
      webAccessEnabled: newStatus
    };

    onUpdateUser(updatedUser);
    setActionNotice(
      `Acceso web ${newStatus ? 'HABILITADO' : 'INHABILITADO'} para ${user.name}`
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return LayoutDashboard;
      case 'inventario': return Boxes;
      case 'mantenimiento': return Wrench;
      case 'custodia': return Shield;
      case 'visitas': return UserCheck;
      case 'monitoreo': return Clock;
      case 'informes': return FileText;
      case 'tiendas': return Store;
      case 'helpdesk': return Headphones;
      case 'trazabilidad': return Repeat;
      case 'despachador': return Send;
      case 'usuarios': return Users;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security Banner Header */}
      <div className="bg-linear-to-r from-[#00236f] via-[#0b1c30] to-[#001744] text-white p-5 rounded-2xl shadow-sm border border-[#00236f]/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Centro de Control de Privilegios & Perfiles OnSite (RBAC)</span>
              </h2>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Gestión centralizada de permisos y módulos. Configure qué módulos puede ver cada colaborador, controle el modo escritura/lectura y asigne la autoridad para delegar privilegios.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Status of current user authority */}
            {isMasterAuthorized ? (
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Control Maestro Activo ({currentUser?.name?.split(' ')[0] || 'Admin'})</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Modo Solo Consulta</span>
              </div>
            )}

            {onNavigateToAudit && (
              <button
                onClick={() => onNavigateToAudit()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <History className="w-3.5 h-3.5 text-emerald-300" />
                <span>Auditoría Logins</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Account Authority Information Callout */}
        <div className="mt-4 p-3 bg-white/10 rounded-xl border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 font-black flex items-center justify-center shrink-0">
              👑
            </div>
            <div>
              <span className="font-bold text-amber-200">Administración General de Privilegios:</span>
              <span className="text-blue-100 ml-1">
                El Administrador General tiene potestad para decidir la visibilidad de 1 o varios módulos para los usuarios registrados en el Directorio.
              </span>
            </div>
          </div>
          <span className="text-[11px] text-blue-200/90 font-medium">
            Seguridad y Privilegios OnSite
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">Total en Directorio</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Usuarios registrados</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
              <Unlock className="w-3 h-3" />
              <span>Acceso Web Activo</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.enabled}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Autorizados para ingresar</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Inhabilitados</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{stats.disabled}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Bloqueados por seguridad</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span>Con Poder de Privilegios</span>
            </div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{stats.privilegeDelegates}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Autorizados a delegar</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'usuarios'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Privilegios por Colaborador</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
              {filteredUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'roles'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <span>Perfiles de Privilegios por Rol (RBAC)</span>
            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full text-[10px]">
              {AVAILABLE_ROLES.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Módulos del Sistema OnSite: <strong>{Object.keys(APP_MODULES).length}</strong>
        </div>
      </div>

      {/* SUBTAB 1: PRIVILEGIOS POR COLABORADOR */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Search Box */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                <input
                  type="text"
                  placeholder="Buscar colaborador, correo corporativo, rol o tienda..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
                />
              </div>

              {/* Access Status Filter */}
              <div>
                <select
                  value={accessFilter}
                  onChange={e => setAccessFilter(e.target.value as any)}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="all">Todos los Estados de Acceso</option>
                  <option value="enabled">Solo con Acceso Web Habilitado 🟢</option>
                  <option value="disabled">Solo Inhabilitados / Bloqueados 🔒</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                >
                  <option value="all">Todos los Roles</option>
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Indicator info */}
            <div className="flex items-center justify-between text-xs text-[#757682] pt-1">
              <div>
                Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> colaboradores
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-purple-800 font-semibold">
                  <Repeat className="w-3 h-3 text-purple-600" />
                  Incluye Repuestos, BKP & Trazabilidad
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0f4ff] text-[#00236f] font-bold text-[11px] uppercase tracking-wider border-b border-[#dce9ff]">
                    <th className="py-3 px-3.5">Colaborador</th>
                    <th className="py-3 px-3.5">Tienda / Región</th>
                    <th className="py-3 px-3.5">Rol Actual</th>
                    <th className="py-3 px-3.5 text-center">Permiso de Cambios</th>
                    <th className="py-3 px-3.5 text-center">Módulos Asignados</th>
                    <th className="py-3 px-3.5 text-center">Autoridad Privilegios</th>
                    <th className="py-3 px-3.5 text-center">Acceso Web</th>
                    <th className="py-3 px-3.5 text-center">Configurar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f4ff]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#757682]">
                        <Users className="w-8 h-8 text-[#a3b3d1] mx-auto mb-2" />
                        <p className="font-semibold text-[#0b1c30]">No se encontraron colaboradores con estos filtros.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isEnabled = user.webAccessEnabled !== false;
                      const allowedModules = getUserAllowedModules(user);
                      const userCanMakeChanges = canUserEdit(user);
                      const userCanDelegate = canUserManagePrivileges(user);
                      const isMasterAccount = user.username === 'admin' || user.email.toLowerCase() === 'admin@tottus.com.pe';
                      const hasTrazabilidad = allowedModules.includes('trazabilidad');

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-[#f8faff] transition-colors ${
                            !isEnabled ? 'bg-rose-50/30' : isMasterAccount ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          {/* User */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <img
                                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                  alt={user.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#dce9ff]"
                                />
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                    isEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="font-bold text-[#0b1c30] flex items-center gap-1.5 flex-wrap">
                                  <span>{user.name}</span>
                                  {isMasterAccount && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                                      👑 Admin Master
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#00236f] font-mono">
                                  {user.email}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {user.cargo || user.role}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Store / Region */}
                          <td className="py-3 px-3.5">
                            {user.tiendaNombre || user.codTienda ? (
                              <div>
                                <div className="font-semibold text-[#0b1c30] flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-[#00236f]" />
                                  <span>{user.tiendaNombre || `Tienda ${user.codTienda}`}</span>
                                </div>
                                <div className="text-[10px] text-[#757682] flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />
                                  <span>{user.assignedRegion || 'Lima'}</span>
                                  {user.codTienda && <span className="font-mono">(T-{user.codTienda})</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {user.assignedRegion || 'Nacional / Corporativo'}
                              </span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 inline-block">
                              {user.role}
                            </span>
                          </td>

                          {/* Edit / Read-Only Toggle */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCanEdit(user)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                                userCanMakeChanges
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title="Click para alternar entre Escritura y Solo Lectura"
                            >
                              {userCanMakeChanges ? (
                                <>
                                  <Edit2 className="w-3 h-3 text-emerald-600" />
                                  <span>Escritura</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-amber-600" />
                                  <span>Solo Lectura</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Modules Badge */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer group"
                              title="Click para abrir control individual de módulos"
                            >
                              <Shield className="w-3.5 h-3.5 text-indigo-700 group-hover:scale-110 transition-transform" />
                              <span>{allowedModules.length} de {Object.keys(APP_MODULES).length}</span>
                              {hasTrazabilidad && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Acceso a Trazabilidad activo" />
                              )}
                            </button>
                          </td>

                          {/* Privilege Authority */}
                          <td className="py-3 px-3.5 text-center">
                            {userCanDelegate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                <Crown className="w-3 h-3 text-amber-700" />
                                <span>Puede Otorgar</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                No delegado
                              </span>
                            )}
                          </td>

                          {/* Web Access Toggle */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => handleToggleAccess(user)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* Configure Button */}
                          <td className="py-3 px-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="px-2.5 py-1 bg-white hover:bg-[#eff4ff] border border-[#dce9ff] text-[#00236f] font-bold rounded-lg text-xs transition-colors flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
                            >
                              <Edit2 className="w-3 h-3 text-[#00236f]" />
                              <span>Editar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PERFILES DE PRIVILEGIOS POR ROL (RBAC) */}
      {activeSubTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-[#00236f] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-purple-700" />
                  <span>Configuración de Perfiles de Privilegios por Rol</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Los cambios realizados aquí aplican de forma inmediata a todos los colaboradores asignados a este rol.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAllRoles}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Restablecer perfiles a valores predeterminados"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restablecer Fábrica</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRoleProfile}
                  className="px-4 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios del Perfil</span>
                </button>
              </div>
            </div>

            {/* Role Selector Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Seleccione el Rol a Modificar:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map(roleName => {
                  const isSelected = selectedRoleKey === roleName;
                  const cfg = getRoleConfig(roleName);
                  const count = cfg.allowedModules.length;

                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => handleSelectRoleToEdit(roleName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-purple-800 text-white border-purple-800 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{roleName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {count} mods
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Detail Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-[#00236f] flex items-center gap-2">
                    <span>Perfil Activo:</span>
                    <span className="text-purple-800 bg-purple-100 px-2 py-0.5 rounded-lg">
                      {selectedRoleKey}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getRoleConfig(selectedRoleKey).description}
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-600">
                  {roleModalAllowedModules.length} de {Object.keys(APP_MODULES).length} módulos seleccionados
                </div>
              </div>

              {/* Special Permissions Capabilities */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Facultades y Privilegios Especiales del Rol:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={roleCanManagePrivileges}
                      onChange={e => setRoleCanManagePrivileges(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700 border-slate-300 focus:ring-purple-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Otorgar Privilegios</div>
                      <div className="text-[10px] text-slate-500">Puede asignar módulos a otros</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={roleCanManageUsers}
                      onChange={e => setRoleCanManageUsers(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700 border-slate-300 focus:ring-purple-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Gestión de Personal</div>
                      <div className="text-[10px] text-slate-500">Crear y editar usuarios</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={roleCanBroadcastAlerts}
                      onChange={e => setRoleCanBroadcastAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700 border-slate-300 focus:ring-purple-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Alertas Regionales</div>
                      <div className="text-[10px] text-slate-500">Emitir avisos en vivo</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={roleCanManageM365}
                      onChange={e => setRoleCanManageM365(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700 border-slate-300 focus:ring-purple-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Sincronizar M365</div>
                      <div className="text-[10px] text-slate-500">Conexión con SharePoint</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Module Checkboxes */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-bold text-slate-700">
                    Módulos Habilitados para el Perfil {selectedRoleKey}:
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRoleModalAllowedModules(Object.keys(APP_MODULES))}
                      className="text-[11px] font-bold text-purple-800 hover:underline cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setRoleModalAllowedModules([])}
                      className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {Object.values(APP_MODULES).map(mod => {
                    const isChecked = roleModalAllowedModules.includes(mod.id);
                    const Icon = getModuleIcon(mod.id);
                    const isTrazabilidad = mod.id === 'trazabilidad';

                    return (
                      <label
                        key={mod.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? isTrazabilidad
                              ? 'bg-purple-50/70 border-purple-300 text-purple-950 shadow-2xs ring-1 ring-purple-300'
                              : 'bg-white border-blue-200 text-[#0b1c30] shadow-2xs'
                            : 'bg-slate-100/70 border-slate-200 text-slate-400 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRoleModule(mod.id)}
                          className="w-4 h-4 mt-0.5 rounded text-[#00236f] border-slate-300 focus:ring-[#00236f]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? (isTrazabilidad ? 'text-purple-700' : 'text-[#00236f]') : 'text-slate-400'}`} />
                            <span className="truncate">{mod.name}</span>
                            {isTrazabilidad && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-200 text-purple-900 font-extrabold shrink-0">
                                BKP / Stock
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {mod.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INDIVIDUAL USER PRIVILEGES */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            
            {/* Header */}
            <div className="px-6 py-4 bg-linear-to-r from-[#00236f] to-[#1e3a8a] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">
                    Personalizar Privilegios de Acceso
                  </h3>
                  <p className="text-xs text-white/80">
                    {editingUser.name} &bull; {editingUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
              
              {/* Role and Access Control Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rol Asignado
                  </label>
                  <select
                    value={userModalRole}
                    onChange={e => setUserModalRole(e.target.value)}
                    className="w-full h-9 px-2.5 bg-slate-50 rounded-lg text-xs text-slate-900 border border-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  >
                    {AVAILABLE_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Acceso Web al Portal
                  </label>
                  <button
                    type="button"
                    onClick={() => setUserModalWebAccess(!userModalWebAccess)}
                    className={`w-full h-9 px-3 rounded-lg text-xs font-bold border flex items-center justify-between cursor-pointer transition-colors ${
                      userModalWebAccess
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span>{userModalWebAccess ? '🟢 Acceso Habilitado' : '🔒 Acceso Bloqueado'}</span>
                    <span className="text-[11px] underline">Alternar</span>
                  </button>
                </div>
              </div>

              {/* Special Permissions Flags */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 mb-1">
                  Permisos de Edición y Autoridad:
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={userModalCanEdit}
                      onChange={e => setUserModalCanEdit(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00236f]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">¿Puede hacer cambios?</span>
                      <span className="text-[10px] text-slate-500">Escritura vs Solo Lectura</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={userModalCanManagePrivileges}
                      onChange={e => setUserModalCanManagePrivileges(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <div>
                      <span className="font-bold text-amber-900 block">Autoridad para Dar Privilegios</span>
                      <span className="text-[10px] text-slate-500">Delegar asignación de permisos</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modules Selection Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Módulos Habilitados para este Colaborador ({userModalAllowedModules.length}):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUserModalAllowedModules(Object.keys(APP_MODULES))}
                      className="text-[11px] font-bold text-[#00236f] hover:underline cursor-pointer"
                    >
                      Todos
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setUserModalAllowedModules([])}
                      className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                    >
                      Ninguno
                    </button>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={handleResetUserToRoleDefaults}
                      className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
                      title="Rellenar módulos según el rol seleccionado"
                    >
                      Valores del Rol
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                  {Object.values(APP_MODULES).map(mod => {
                    const isChecked = userModalAllowedModules.includes(mod.id);
                    const Icon = getModuleIcon(mod.id);
                    const isTrazabilidad = mod.id === 'trazabilidad';

                    return (
                      <label
                        key={mod.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? isTrazabilidad
                              ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold'
                              : 'bg-white border-blue-200 text-slate-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUserModule(mod.id)}
                          className="w-4 h-4 mt-0.5 rounded text-[#00236f]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? (isTrazabilidad ? 'text-purple-700' : 'text-[#00236f]') : 'text-slate-400'}`} />
                            <span className="truncate">{mod.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-normal">
                            {mod.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveUserPrivileges}
                className="px-5 py-2 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Privilegios del Usuario</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
