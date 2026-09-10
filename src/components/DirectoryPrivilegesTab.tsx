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
  ExternalLink,
  History,
  Check,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react';
import { AppUser } from '../types';
import { ROLE_CONFIGS, APP_MODULES, getAllowedModulesForRole } from '../utils/rbac';

interface DirectoryPrivilegesTabProps {
  users: AppUser[];
  onUpdateUser?: (user: AppUser) => void;
  onNavigateToAudit?: (userEmail?: string) => void;
}

const AVAILABLE_ROLES = [
  'Administrador',
  'Supervisor Regional',
  'IT Operator',
  'Jefe de Mantenimiento',
  'Gerente de Tienda',
  'Técnico Especialista',
  'Técnico de Campo',
  'Auditor / Consulta'
];

export const DirectoryPrivilegesTab: React.FC<DirectoryPrivilegesTabProps> = ({
  users,
  onUpdateUser,
  onNavigateToAudit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const enabled = users.filter(u => u.webAccessEnabled !== false).length;
    const disabled = users.filter(u => u.webAccessEnabled === false).length;
    const admins = users.filter(u => u.role === 'Administrador' || u.role === 'Supervisor Regional').length;
    return { total, enabled, disabled, admins };
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
      `Acceso web ${newStatus ? 'HABILITADO' : 'INHABILITADO'} para ${user.name} (${user.email})`
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
    setActionNotice(`Rol y privilegios actualizados a "${newRole}" para ${user.name}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Security Banner Header */}
      <div className="bg-gradient-to-r from-[#00236f] via-[#0b1c30] to-[#001744] text-white p-5 rounded-2xl shadow-sm border border-[#00236f]/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold tracking-tight text-white">
                Control de Acceso Web & Matriz de Privilegios (RBAC)
              </h2>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              <strong>Autorización estricta por Directorio:</strong> Todo usuario que intente iniciar sesión con su cuenta corporativa Outlook (@tottus.com.pe) debe existir previamente en esta agenda y tener el switch <strong>Acceso Web Habilitado</strong>. Si un usuario no está registrado o se encuentra inhabilitado, el portal bloqueará el acceso automáticamente y registrará la tentativa en la auditoría.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToAudit && (
              <button
                onClick={() => onNavigateToAudit()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <History className="w-4 h-4 text-emerald-300" />
                <span>Ver Registro de Logins</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">Total en Directorio</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Colaboradores registrados</div>
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
              <Key className="w-3 h-3" />
              <span>Roles Directivos</span>
            </div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{stats.admins}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Admins & Supervisores</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
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

        {/* Status indicator bar */}
        <div className="flex items-center justify-between text-xs text-[#757682] pt-1">
          <div>
            Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> colaboradores
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Acceso Web Habilitado
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Acceso Web Bloqueado
            </span>
          </div>
        </div>
      </div>

      {/* Privileges & Access Table */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold text-[11px] uppercase tracking-wider border-b border-[#dce9ff]">
                <th className="py-3 px-3.5">Colaborador & Correo Outlook</th>
                <th className="py-3 px-3.5">Asignación Tienda / Región</th>
                <th className="py-3 px-3.5">Rol de Privilegios</th>
                <th className="py-3 px-3.5 text-center">Módulos Habilitados</th>
                <th className="py-3 px-3.5 text-center">Estado Acceso Web</th>
                <th className="py-3 px-3.5">Última Conexión</th>
                <th className="py-3 px-3.5 text-center">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#757682]">
                    <Users className="w-8 h-8 text-[#a3b3d1] mx-auto mb-2" />
                    <p className="font-semibold text-[#0b1c30]">No se encontraron colaboradores con estos filtros.</p>
                    <p className="text-xs">Ajusta la búsqueda o restablece los filtros de acceso.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isEnabled = user.webAccessEnabled !== false;
                  const allowedModules = getAllowedModulesForRole(user.role);
                  const isRleon = user.email.toLowerCase().includes('rleon');

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#f8faff] transition-colors ${
                        !isEnabled ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
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
                              title={isEnabled ? 'Acceso Web Habilitado' : 'Acceso Web Inhabilitado'}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isRleon && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  Cuenta Master
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#00236f] font-mono mt-0.5">
                              {user.email}
                            </div>
                            <div className="text-[10px] text-[#757682]">
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
                              <span>{user.assignedRegion || 'Lima y Callao'}</span>
                              {user.codTienda && <span className="font-mono">(T-{user.codTienda})</span>}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {user.assignedRegion || 'Nacional / Corporativo'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Role Dropdown */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={user.role}
                            onChange={e => handleChangeRole(user, e.target.value)}
                            className="bg-white border border-[#c5c5d3] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#00236f] focus:outline-none focus:ring-1 focus:ring-[#00236f] shadow-2xs"
                          >
                            {AVAILABLE_ROLES.map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Modules Count Badge */}
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                            allowedModules.length >= 7
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : allowedModules.length >= 5
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                          title={`Módulos autorizados: ${allowedModules.map(modKey => APP_MODULES[modKey]?.name || modKey).join(', ')}`}
                        >
                          <Shield className="w-3 h-3 text-[#00236f]" />
                          <span>{allowedModules.length} de {Object.keys(APP_MODULES).length} módulos</span>
                        </span>
                      </td>

                      {/* Web Access Switch (Toggle) */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
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

                      {/* Last Login Info */}
                      <td className="py-3 px-3.5 text-[11px] text-[#444651]">
                        {user.lastLoginAt ? (
                          <div>
                            <div className="font-semibold text-[#0b1c30] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#757682]" />
                              <span>{user.lastLoginAt}</span>
                            </div>
                            <div className="text-[10px] text-[#757682] font-mono mt-0.5">
                              {user.lastLoginIp || '10.24.180.45'}
                            </div>
                            {user.loginCount ? (
                              <div className="text-[10px] text-emerald-700 font-medium">
                                {user.loginCount} inicios registrados
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[#757682] italic">Sin registros aún</span>
                        )}
                      </td>

                      {/* Audit Quick Link */}
                      <td className="py-3 px-3.5 text-center">
                        {onNavigateToAudit && (
                          <button
                            onClick={() => onNavigateToAudit(user.email)}
                            className="p-1.5 rounded-lg border border-[#dce9ff] text-[#00236f] hover:bg-[#eff4ff] transition-colors"
                            title={`Ver registro de inicios de sesión de ${user.name}`}
                          >
                            <History className="w-4 h-4" />
                          </button>
                        )}
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
  );
};
