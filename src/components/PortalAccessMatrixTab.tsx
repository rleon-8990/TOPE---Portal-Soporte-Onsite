import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Search,
  Filter,
  Download,
  SlidersHorizontal,
  ExternalLink,
  Edit2,
  Clock,
  Eye,
  Check,
  X,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { AppUser, Store } from '../types';
import {
  APP_MODULES,
  AVAILABLE_ROLES,
  getUserAllowedModules,
  canUserEdit,
  getRoleConfig
} from '../utils/rbac';

interface PortalAccessMatrixTabProps {
  users?: AppUser[];
  stores: Store[];
  currentUser?: AppUser;
  onUpdateUser?: (updatedUser: AppUser) => void;
  onNavigateToUsers?: () => void;
}

export const PortalAccessMatrixTab: React.FC<PortalAccessMatrixTabProps> = ({
  users = [],
  stores,
  currentUser,
  onUpdateUser,
  onNavigateToUsers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [canEditFilter, setCanEditFilter] = useState<'all' | 'can_edit' | 'read_only'>('all');

  // Notification toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal state for editing a user's modules and write permission
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [modalAllowedModules, setModalAllowedModules] = useState<string[]>([]);
  const [modalCanEdit, setModalCanEdit] = useState<boolean>(true);
  const [modalRole, setModalRole] = useState<string>('');

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const enabled = users.filter(u => u.webAccessEnabled !== false).length;
    const canEditCount = users.filter(u => canUserEdit(u)).length;
    const readOnlyCount = total - canEditCount;
    const uniqueStores = new Set(users.map(u => u.codTienda || u.tiendaNombre).filter(Boolean)).size;
    return { total, enabled, canEditCount, readOnlyCount, uniqueStores };
  }, [users]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Web access filter
      const isEnabled = user.webAccessEnabled !== false;
      if (accessFilter === 'enabled' && !isEnabled) return false;
      if (accessFilter === 'disabled' && isEnabled) return false;

      // Edit permission filter
      const userCanEdit = canUserEdit(user);
      if (canEditFilter === 'can_edit' && !userCanEdit) return false;
      if (canEditFilter === 'read_only' && userCanEdit) return false;

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;

      // Region filter
      if (regionFilter !== 'all' && user.assignedRegion !== regionFilter && user.assignedRegion !== 'Nacional') {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesRole = (user.role || '').toLowerCase().includes(q);
        const matchesTienda = (user.tiendaNombre || '').toLowerCase().includes(q);
        const matchesCod = String(user.codTienda || '').toLowerCase().includes(q);
        const matchesCargo = (user.cargo || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole && !matchesTienda && !matchesCod && !matchesCargo) {
          return false;
        }
      }

      return true;
    });
  }, [users, accessFilter, canEditFilter, roleFilter, regionFilter, searchQuery]);

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
      `Permiso de modificación actualizado: ${user.name} ahora ${
        newCanEdit ? 'PUEDE HACER CAMBIOS (Escritura)' : 'está en modo SOLO LECTURA (Sin cambios)'
      }`
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Quick toggle: Web Access
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
      `Acceso web al portal ${newStatus ? 'HABILITADO' : 'INHABILITADO'} para ${user.name}`
    );
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Change Role dropdown
  const handleChangeRole = (user: AppUser, newRole: string) => {
    if (!onUpdateUser) return;
    const updatedUser: AppUser = {
      ...user,
      role: newRole
    };
    onUpdateUser(updatedUser);
    setActionNotice(`Rol actualizado a "${newRole}" para ${user.name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Open modal to configure modules
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setModalRole(user.role);
    setModalCanEdit(canUserEdit(user));
    setModalAllowedModules(getUserAllowedModules(user));
  };

  // Save modal changes
  const handleSaveModal = () => {
    if (!editingUser || !onUpdateUser) return;

    const updatedUser: AppUser = {
      ...editingUser,
      role: modalRole,
      canEdit: modalCanEdit,
      accessType: modalCanEdit ? 'escritura' : 'lectura',
      allowedModules: modalAllowedModules
    };

    onUpdateUser(updatedUser);
    setActionNotice(`Privilegios y módulos actualizados correctamente para ${editingUser.name}`);
    setEditingUser(null);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nombre',
      'Email',
      'Cargo',
      'Tienda',
      'CodTienda',
      'Region',
      'Rol',
      'PuedeHacerCambios',
      'TipoAcceso',
      'ModulosAutorizados',
      'AccesoWebHabilitado',
      'UltimoLogin'
    ];

    const rows = filteredUsers.map(u => {
      const allowed = getUserAllowedModules(u);
      const isEditable = canUserEdit(u);
      return [
        u.id,
        `"${u.name}"`,
        u.email,
        `"${u.cargo || u.role}"`,
        `"${u.tiendaNombre || 'Corporativo'}"`,
        u.codTienda || '',
        `"${u.assignedRegion || 'Nacional'}"`,
        `"${u.role}"`,
        isEditable ? 'SI' : 'NO',
        isEditable ? 'Escritura' : 'Solo Lectura',
        `"${allowed.join(', ')}"`,
        u.webAccessEnabled !== false ? 'Habilitado' : 'Inhabilitado',
        `"${u.lastLoginAt || 'Sin registro'}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriz_Usuarios_Privilegios_Tottus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Toast Banner */}
      {actionNotice && (
        <div className="p-3 bg-[#00236f] text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-blue-200 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#757682] tracking-wider">
              Total en Portal
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#00236f] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0b1c30] mt-1.5">{stats.total}</div>
          <div className="text-[11px] text-[#007a33] font-semibold flex items-center gap-1 mt-0.5">
            <Check className="w-3 h-3" />
            <span>{stats.enabled} con acceso activo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#757682] tracking-wider">
              Pueden Hacer Cambios
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1.5">{stats.canEditCount}</div>
          <div className="text-[11px] text-[#444651] mt-0.5">
            Permiso de <strong className="text-emerald-700">Escritura y Gestión</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#757682] tracking-wider">
              Solo Lectura (Auditoría)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1.5">{stats.readOnlyCount}</div>
          <div className="text-[11px] text-[#444651] mt-0.5">
            Consulta y supervisión sin alteración
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#757682] tracking-wider">
              Sedes Vinculadas
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#00236f] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#00236f] mt-1.5">{stats.uniqueStores}</div>
          <div className="text-[11px] text-[#757682] mt-0.5">
            Tiendas y oficinas con usuarios
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar colaborador por nombre, correo, tienda o cargo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-7 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#757682] hover:text-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Permiso de Cambios Filter */}
          <div>
            <select
              value={canEditFilter}
              onChange={e => setCanEditFilter(e.target.value as any)}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="all">Todos los Permisos de Edición</option>
              <option value="can_edit">🟢 Puede hacer cambios (Escritura)</option>
              <option value="read_only">🔒 Solo lectura (Sin cambios)</option>
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

          {/* Export / Directory Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 h-9 px-3 bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#00236f] text-xs font-bold rounded-lg border border-[#dce9ff] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar reporte completo en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
            {onNavigateToUsers && (
              <button
                onClick={onNavigateToUsers}
                className="h-9 px-3 bg-[#00236f] hover:bg-[#001b54] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Ir al Directorio de Usuarios Corporativo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Directorio</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick info banner */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#f0f4ff] flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#444651] text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> colaboradores registrados con credenciales para el portal.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Escritura activa (puede modificar)
            </span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Solo lectura (auditoría)
            </span>
          </div>
        </div>
      </div>

      {/* Users & Privileges Matrix Table */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold border-b border-[#dce9ff] select-none">
                <th className="py-3 px-3.5">COLABORADOR / USUARIO</th>
                <th className="py-3 px-3.5">TIENDA / SEDE</th>
                <th className="py-3 px-3.5">TIPO DE PRIVILEGIOS (ROL)</th>
                <th className="py-3 px-3.5 text-center">¿PUEDE HACER CAMBIOS?</th>
                <th className="py-3 px-3.5">MÓDULOS QUE PUEDE VER</th>
                <th className="py-3 px-3.5 text-center">ACCESO WEB</th>
                <th className="py-3 px-3.5 text-right">ACCIONES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5eeff]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#757682]">
                    <Users className="w-10 h-10 mx-auto text-[#757682]/40 mb-2" />
                    <div className="font-bold text-[#00236f]">No se encontraron colaboradores</div>
                    <p className="text-xs text-[#757682] mt-0.5">
                      Ajuste los filtros de búsqueda, rol o permisos de edición.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isEnabled = user.webAccessEnabled !== false;
                  const userCanMakeChanges = canUserEdit(user);
                  const allowedModules = getUserAllowedModules(user);
                  const isRleon = user.email === 'rleon@tottus.com.pe';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#f8faff] transition-colors ${
                        !isEnabled ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                user.avatarUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-[#dce9ff]"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                isEnabled ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              title={isEnabled ? 'Acceso Web Habilitado' : 'Acceso Web Inhabilitado'}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isRleon && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Master
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#00236f] font-mono mt-0.5">{user.email}</div>
                            <div className="text-[10px] text-[#757682]">{user.cargo || user.role}</div>
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
                              <span>{user.assignedRegion || 'Lima y Callao'}</span>
                              {user.codTienda && <span className="font-mono">(T-{user.codTienda})</span>}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {user.assignedRegion || 'Nacional / Sede Central'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3 px-3.5">
                        <select
                          value={user.role}
                          onChange={e => handleChangeRole(user, e.target.value)}
                          className="bg-white border border-[#c5c5d3] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f] shadow-2xs cursor-pointer"
                        >
                          {AVAILABLE_ROLES.map(r => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ¿Puede hacer cambios? (Permiso de Modificación) */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCanEdit(user)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              userCanMakeChanges
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                            title="Click para alternar entre Escritura y Solo Lectura"
                          >
                            {userCanMakeChanges ? (
                              <>
                                <Edit2 className="w-3 h-3 text-emerald-600" />
                                <span>Sí (Escritura)</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-amber-600" />
                                <span>Solo Lectura</span>
                              </>
                            )}
                          </button>
                          <span className="text-[9px] text-[#757682]">
                            {userCanMakeChanges ? 'Puede modificar datos' : 'Sin permisos de edición'}
                          </span>
                        </div>
                      </td>

                      {/* Módulos que puede ver */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {allowedModules.map(modKey => {
                              const meta = APP_MODULES[modKey];
                              return (
                                <span
                                  key={modKey}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-[#eff4ff] text-[#00236f] border border-[#c4dcff] font-medium"
                                  title={meta?.description || modKey}
                                >
                                  {meta?.name ? meta.name.split('/')[0].trim() : modKey}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-[#757682] flex items-center justify-between">
                            <span>
                              {allowedModules.length} de {Object.keys(APP_MODULES).length} módulos autorizados
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                              className="text-[#00236f] hover:underline font-bold text-[10px] cursor-pointer"
                            >
                              Configurar
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Acceso Web Toggle */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAccess(user)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                            title={isEnabled ? 'Click para inhabilitar acceso web' : 'Click para habilitar acceso web'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-bold ${
                              isEnabled ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isEnabled ? 'Habilitado' : 'Inhabilitado'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(user)}
                          className="px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-xs font-bold rounded-lg border border-[#c4dcff] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ajustar módulos y permisos específicos"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ajustar</span>
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

      {/* MODAL: Granular Configuration of User Privileges & Modules */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-[#dce9ff] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00236f] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#00236f]">
                    Configurar Privilegios & Módulos
                  </h3>
                  <div className="text-xs text-[#525e75]">
                    {editingUser.name} ({editingUser.email}) · {editingUser.tiendaNombre || 'Sede Central'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingUser(null)}
                className="text-[#757682] hover:text-black p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role & Edit Permissions Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8faff] p-4 rounded-2xl border border-[#dce9ff]">
              <div className="space-y-1">
                <label className="font-bold text-xs text-[#00236f]">Rol Corporativo</label>
                <select
                  value={modalRole}
                  onChange={e => {
                    const newR = e.target.value;
                    setModalRole(newR);
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#c5c5d3] rounded-xl text-xs font-semibold text-[#00236f] focus:outline-none"
                >
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#757682]">Define el nivel jerárquico y responsabilidades.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-xs text-[#00236f]">¿Puede hacer cambios? (Permiso de Modificación)</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0b1c30]">
                    <input
                      type="radio"
                      name="modalCanEdit"
                      checked={modalCanEdit}
                      onChange={() => setModalCanEdit(true)}
                      className="text-[#007a33] focus:ring-[#007a33]"
                    />
                    <span className="text-emerald-700">🟢 Modo Escritura (Puede modificar)</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0b1c30]">
                    <input
                      type="radio"
                      name="modalCanEdit"
                      checked={!modalCanEdit}
                      onChange={() => setModalCanEdit(false)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-amber-800">🔒 Solo Lectura (No puede hacer cambios)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modules Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#00236f] uppercase tracking-wider">
                  Módulos que puede ver en la plataforma ({modalAllowedModules.length} seleccionados)
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalAllowedModules(Object.keys(APP_MODULES))}
                    className="text-[11px] font-bold text-[#00236f] hover:underline cursor-pointer"
                  >
                    Seleccionar Todos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setModalAllowedModules([])}
                    className="text-[11px] font-bold text-[#ba1a1a] hover:underline cursor-pointer"
                  >
                    Desmarcar Todos
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(APP_MODULES).map(mod => {
                  const isChecked = modalAllowedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        setModalAllowedModules(prev =>
                          prev.includes(mod.id) ? prev.filter(id => id !== mod.id) : [...prev, mod.id]
                        );
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-blue-50/50 border-[#00236f] shadow-2xs ring-1 ring-[#00236f]/20'
                          : 'bg-white border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#00236f] focus:ring-[#00236f]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#00236f] flex items-center justify-between gap-1">
                          <span>{mod.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 font-mono">
                            {mod.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#525e75] mt-0.5 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#e5eeff] pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-[#dce9ff] text-[#525e75] hover:bg-[#eff4ff] text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2.5 bg-[#00236f] hover:bg-[#00174a] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Privilegios del Usuario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
