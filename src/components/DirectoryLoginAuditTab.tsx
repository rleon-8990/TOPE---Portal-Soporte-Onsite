import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Laptop,
  Globe,
  Trash2,
  Users,
  Store,
  RefreshCw,
  ExternalLink,
  ShieldX,
  AlertCircle
} from 'lucide-react';
import { LoginAuditRecord, AppUser } from '../types';

interface DirectoryLoginAuditTabProps {
  loginAuditLogs: LoginAuditRecord[];
  users: AppUser[];
  currentUser?: AppUser;
  onClearLogs?: () => void;
  initialFilterEmail?: string;
}

export const DirectoryLoginAuditTab: React.FC<DirectoryLoginAuditTabProps> = ({
  loginAuditLogs = [],
  users = [],
  currentUser,
  onClearLogs,
  initialFilterEmail = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilterEmail);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'blocked_not_in_directory' | 'blocked_disabled'>('all');
  const [filterRleonOnly, setFilterRleonOnly] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = loginAuditLogs.length;
    const success = loginAuditLogs.filter(l => l.status === 'success' || l.status === 'exitoso').length;
    const notInDir = loginAuditLogs.filter(l => l.status === 'blocked_not_in_directory' || l.status === 'bloqueado_no_en_directorio').length;
    const disabled = loginAuditLogs.filter(l => l.status === 'blocked_disabled' || l.status === 'bloqueado_inhabilitado').length;
    const rleonLogins = loginAuditLogs.filter(l => (l.email || l.userEmail || '').toLowerCase().includes('rleon')).length;

    return { total, success, notInDir, disabled, rleonLogins };
  }, [loginAuditLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return loginAuditLogs.filter(log => {
      const email = log.email || log.userEmail || '';
      const role = log.role || log.userRole || '';
      const device = log.device || log.deviceInfo || '';
      const store = log.storeName || log.locationOrStore || '';
      const reason = log.reason || log.notes || '';
      const isSuccess = log.status === 'success' || log.status === 'exitoso';
      const isNotInDir = log.status === 'blocked_not_in_directory' || log.status === 'bloqueado_no_en_directorio';
      const isDisabled = log.status === 'blocked_disabled' || log.status === 'bloqueado_inhabilitado';

      // rleon filter
      if (filterRleonOnly && !email.toLowerCase().includes('rleon')) {
        return false;
      }

      // Status filter
      if (statusFilter === 'success' && !isSuccess) return false;
      if (statusFilter === 'blocked_not_in_directory' && !isNotInDir) return false;
      if (statusFilter === 'blocked_disabled' && !isDisabled) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = log.userName.toLowerCase().includes(q);
        const matchesEmail = email.toLowerCase().includes(q);
        const matchesIp = log.ipAddress.toLowerCase().includes(q);
        const matchesDevice = device.toLowerCase().includes(q);
        const matchesStore = store.toLowerCase().includes(q);
        const matchesRole = role.toLowerCase().includes(q);
        const matchesReason = reason.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesIp &&
          !matchesDevice &&
          !matchesStore &&
          !matchesRole &&
          !matchesReason
        ) {
          return false;
        }
      }

      return true;
    });
  }, [loginAuditLogs, filterRleonOnly, statusFilter, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Colaborador',
      'Correo_Corporativo',
      'Rol_Evaluado',
      'Estado_Autorizacion',
      'Direccion_IP',
      'Dispositivo_Navegador',
      'Tienda_Sede',
      'Detalle_Seguridad'
    ];

    const rows = filteredLogs.map(l => {
      const email = l.email || l.userEmail || '';
      const role = l.role || l.userRole || 'Sin Rol';
      const device = l.device || l.deviceInfo || '';
      const store = l.storeName || l.locationOrStore || 'N/A';
      const reason = l.reason || l.notes || '';
      return [
        `"${l.timestamp}"`,
        `"${l.userName.replace(/"/g, '""')}"`,
        `"${email}"`,
        `"${role}"`,
        `"${l.status}"`,
        `"${l.ipAddress}"`,
        `"${device.replace(/"/g, '""')}"`,
        `"${store.replace(/"/g, '""')}"`,
        `"${reason.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_logins_cmms_tottus_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Directive Banner addressing the user's explicit request */}
      <div className="bg-gradient-to-r from-[#00236f] via-[#0b1c30] to-[#12284c] text-white p-5 rounded-2xl shadow-sm border border-[#00236f]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Auditoría de Inicios de Sesión & Detección de Concurrencia
              </h2>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              <strong>Control Anti-Suplantación y Cuentas Compartidas:</strong> Cada vez que un usuario intenta ingresar a la web con Outlook corporativo, el sistema comprueba su presencia en el Directorio y su switch de habilitación. Las conexiones quedan registradas con huella de red, IP, tienda y dispositivo.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Si otro usuario u ordenador inicia sesión con la cuenta <strong>rleon@tottus.com.pe</strong>, se identificará de inmediato la IP y ubicación de la terminal.
              </span>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setFilterRleonOnly(!filterRleonOnly);
                if (!filterRleonOnly) {
                  setSearchQuery('rleon');
                } else {
                  setSearchQuery('');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                filterRleonOnly
                  ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>{filterRleonOnly ? 'Viendo solo cuenta rleon@' : 'Filtrar actividad rleon@'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            {onClearLogs && (
              <button
                onClick={() => {
                  if (confirm('¿Deseas limpiar el registro histórico de logins locales?')) {
                    onClearLogs();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/80 hover:text-red-200 border border-white/10 text-xs font-medium transition-all"
                title="Limpiar registro local"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-blue-200 font-medium">Total Eventos</div>
            <div className="text-xl font-black text-white mt-0.5">{stats.total}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Intentos registrados</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Logins Exitosos</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.success}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Acceso concedido</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
              <ShieldX className="w-3 h-3" />
              <span>No en Directorio</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-0.5">{stats.notInDir}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Rechazados: no existe</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Inhabilitados</span>
            </div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{stats.disabled}</div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">Rechazados: switch apagado</div>
          </div>
          <div className="bg-amber-400/10 backdrop-blur-xs p-2.5 rounded-xl border border-amber-300/30">
            <div className="text-[11px] text-amber-200 font-bold flex items-center gap-1">
              <span>Cuenta rleon@</span>
            </div>
            <div className="text-xl font-black text-amber-300 mt-0.5">{stats.rleonLogins}</div>
            <div className="text-[10px] text-amber-200/80 mt-0.5">Conexiones registradas</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
            <input
              type="text"
              placeholder="Buscar por colaborador, correo, IP de origen, tienda o dispositivo..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#757682] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f] focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full h-9 px-2.5 bg-[#f8f9ff] rounded-lg text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            >
              <option value="all">Todos los Resultados de Login</option>
              <option value="success">Solo Inicios Exitosos ✅</option>
              <option value="blocked_not_in_directory">Solo Bloqueados: No en Directorio ⛔</option>
              <option value="blocked_disabled">Solo Bloqueados: Acceso Inhabilitado 🔒</option>
            </select>
          </div>
        </div>

        {/* Counter and status tags */}
        <div className="flex items-center justify-between text-xs text-[#757682] pt-1">
          <div>
            Mostrando <strong>{filteredLogs.length}</strong> de <strong>{loginAuditLogs.length}</strong> eventos registrados
          </div>
          {filterRleonOnly && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
              Filtro activo: Solo actividad de rleon@tottus.com.pe
            </span>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#dce9ff] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f0f4ff] text-[#00236f] font-bold text-[11px] uppercase tracking-wider border-b border-[#dce9ff]">
                <th className="py-3 px-3.5">Fecha & Hora</th>
                <th className="py-3 px-3.5">Colaborador / Cuenta Outlook</th>
                <th className="py-3 px-3.5">Rol Evaluado</th>
                <th className="py-3 px-3.5 text-center">Estado de Autorización</th>
                <th className="py-3 px-3.5">Dirección IP & Red</th>
                <th className="py-3 px-3.5">Terminal / Dispositivo</th>
                <th className="py-3 px-3.5">Tienda / Ubicación</th>
                <th className="py-3 px-3.5">Detalle de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#757682]">
                    <Clock className="w-8 h-8 text-[#a3b3d1] mx-auto mb-2" />
                    <p className="font-semibold text-[#0b1c30]">No se registraron eventos con los filtros seleccionados.</p>
                    <p className="text-xs">Intenta restablecer la búsqueda o realizar una prueba de login.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const email = log.email || log.userEmail || '';
                  const role = log.role || log.userRole || 'Sin Rol Asignado';
                  const device = log.device || log.deviceInfo || 'Terminal Web';
                  const store = log.storeName || log.locationOrStore;
                  const reason = log.reason || log.notes || 'Verificación de credenciales Outlook';
                  const isRleon = email.toLowerCase().includes('rleon');
                  const isSuccess = log.status === 'success' || log.status === 'exitoso';
                  const isNotInDir = log.status === 'blocked_not_in_directory' || log.status === 'bloqueado_no_en_directorio';
                  const isBlocked = !isSuccess;

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-[#f8faff] transition-colors ${
                        isRleon ? 'bg-amber-50/20' : ''
                      } ${isBlocked ? 'bg-rose-50/20' : ''}`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-[#444651]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#757682]" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User & Email */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                          <span>{log.userName}</span>
                          {isRleon && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              👑 Master Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#00236f] font-mono mt-0.5">
                          {email}
                        </div>
                      </td>

                      {/* Evaluated Role */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eef4ff] text-[#00236f] border border-[#dce9ff]">
                          {role}
                        </span>
                      </td>

                      {/* Authorization Status */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Autorizado</span>
                          </span>
                        ) : isNotInDir ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <ShieldX className="w-3.5 h-3.5 text-rose-600" />
                            <span>No en Directorio</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Inhabilitado</span>
                          </span>
                        )}
                      </td>

                      {/* IP Address & Network */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0b1c30]">
                          <Globe className="w-3.5 h-3.5 text-[#00236f]" />
                          <span>{log.ipAddress}</span>
                        </div>
                        <div className="text-[10px] text-[#757682]">
                          {log.ipAddress.startsWith('10.24.') ? 'LAN Corporativa Tottus' : 'Acceso Externo / Remoto'}
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-[#444651]">
                        <div className="flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-[#757682]" />
                          <span>{device}</span>
                        </div>
                      </td>

                      {/* Store / Location */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[11px] text-[#444651]">
                        {store ? (
                          <div className="flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#00236f]" />
                            <span className="font-semibold">{store}</span>
                          </div>
                        ) : (
                          <span className="text-[#757682]">Sede Central</span>
                        )}
                      </td>

                      {/* Security Detail / Reason */}
                      <td className="py-3 px-3.5 text-[11px] max-w-xs text-[#444651]">
                        <div className="leading-snug">
                          {reason}
                        </div>
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
