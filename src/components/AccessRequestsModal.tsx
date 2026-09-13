import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  X,
  UserCheck,
  Building2,
  Mail,
  Laptop,
  Check,
  AlertCircle
} from 'lucide-react';
import { AccessRequest, AppUser, Store } from '../types';

interface AccessRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: AccessRequest[];
  onApproveRequest: (requestId: string, role: string, codTienda?: string | number) => void;
  onDenyRequest: (requestId: string) => void;
  stores?: Store[];
  currentUser: AppUser;
}

export const AccessRequestsModal: React.FC<AccessRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onApproveRequest,
  onDenyRequest,
  stores = [],
  currentUser
}) => {
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'aprobado' | 'denegado'>('pendiente');
  const [selectedRoles, setSelectedRoles] = useState<{ [reqId: string]: string }>({});
  const [selectedStores, setSelectedStores] = useState<{ [reqId: string]: string | number }>({});
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRequests = requests.filter(r => {
    if (filter === 'todos') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pendiente').length;

  const handleApprove = (req: AccessRequest) => {
    const assignedRole = selectedRoles[req.id] || req.requestedRole || 'Técnico Especialista';
    const assignedStore = selectedStores[req.id] || 103;

    onApproveRequest(req.id, assignedRole, assignedStore);
    setActionSuccessMessage(`✅ Solicitud de ${req.email} aprobada. El usuario fue registrado y habilitado en el Directorio.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleDeny = (req: AccessRequest) => {
    onDenyRequest(req.id);
    setActionSuccessMessage(`⛔ Solicitud de ${req.email} denegada.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-[#00236f] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Solicitudes de Acceso al Portal CMMS
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950">
                    {pendingCount} pendientes
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/70">
                Usuarios que intentaron iniciar sesión y requieren alta en el Directorio de Personal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback message */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#f8faff] border-b border-[#e5eeff] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('pendiente')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                filter === 'pendiente'
                  ? 'bg-[#00236f] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('aprobado')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                filter === 'aprobado'
                  ? 'bg-[#00236f] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Aprobadas ({requests.filter(r => r.status === 'aprobado').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('denegado')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                filter === 'denegado'
                  ? 'bg-[#00236f] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Denegadas ({requests.filter(r => r.status === 'denegado').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('todos')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                filter === 'todos'
                  ? 'bg-[#00236f] text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todas ({requests.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Admin: <strong>{currentUser.name}</strong>
          </span>
        </div>

        {/* Requests List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">
                No hay solicitudes de acceso {filter !== 'todos' ? `en estado "${filter}"` : ''}.
              </p>
              <p className="text-[11px] text-slate-400">
                Cuando un usuario sin registrar intente ingresar y envíe su solicitud, aparecerá listado aquí.
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isPending = req.status === 'pendiente';
              const isApproved = req.status === 'aprobado';
              const isDenied = req.status === 'denegado';

              const roleValue = selectedRoles[req.id] || req.requestedRole || 'Técnico Especialista';
              const storeValue = selectedStores[req.id] || 103;

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-white border-amber-200 shadow-xs'
                      : isApproved
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    {/* User and Provider info */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Provider tag */}
                        {req.provider === 'microsoft' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5 shrink-0">
                              <div className="bg-[#f25022] w-1 h-1 rounded-xs" />
                              <div className="bg-[#7fba00] w-1 h-1 rounded-xs" />
                              <div className="bg-[#00a4ef] w-1 h-1 rounded-xs" />
                              <div className="bg-[#ffb900] w-1 h-1 rounded-xs" />
                            </div>
                            Microsoft 365
                          </span>
                        ) : req.provider === 'google' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                            </svg>
                            Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <UserCheck className="w-2.5 h-2.5" /> Cuenta Local
                          </span>
                        )}

                        <span className="font-bold text-sm text-[#00236f]">{req.name || req.email}</span>
                        
                        {/* Status badge */}
                        {isPending ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente de Aprobación
                          </span>
                        ) : isApproved ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Aprobado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Denegado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                        <span className="flex items-center gap-1 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {req.email}
                        </span>
                        {req.ipAddress && (
                          <span className="text-slate-400 hidden sm:inline">
                            IP: {req.ipAddress}
                          </span>
                        )}
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <strong>Motivo / Cargo:</strong> {req.notes}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                        <span>Enviado: {req.timeAgo || new Date(req.timestamp).toLocaleString('es-PE')}</span>
                        {req.reviewedBy && (
                          <span>• Revisado por: {req.reviewedBy}</span>
                        )}
                      </div>
                    </div>

                    {/* Pending Action Controls */}
                    {isPending && (
                      <div className="sm:w-64 shrink-0 bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-2.5">
                        <div className="text-[11px] font-bold text-amber-950">
                          Asignar Rol y Tienda para Alta:
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Rol Asignado
                          </label>
                          <select
                            value={roleValue}
                            onChange={(e) => setSelectedRoles({ ...selectedRoles, [req.id]: e.target.value })}
                            className="w-full h-8 text-xs bg-white rounded-lg border border-slate-300 px-2 font-medium text-slate-800 focus:ring-1 focus:ring-[#00236f]"
                          >
                            <option value="Técnico Especialista">Técnico Especialista</option>
                            <option value="IT Operator">IT Operator Onsite</option>
                            <option value="Jefe de Mantenimiento">Jefe de Mantenimiento</option>
                            <option value="Supervisor Regional">Supervisor Regional</option>
                            <option value="Jefe de Tienda">Jefe de Tienda</option>
                            <option value="Administrador">Administrador</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Tienda Base
                          </label>
                          <select
                            value={storeValue}
                            onChange={(e) => setSelectedStores({ ...selectedStores, [req.id]: e.target.value })}
                            className="w-full h-8 text-xs bg-white rounded-lg border border-slate-300 px-2 font-medium text-slate-800 focus:ring-1 focus:ring-[#00236f]"
                          >
                            {stores.length > 0 ? (
                              stores.slice(0, 30).map(s => (
                                <option key={s.id} value={s.codTienda}>
                                  T-{s.codTienda} {s.name}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value={103}>T-103 Megaplaza</option>
                                <option value={104}>T-104 Las Begonias</option>
                                <option value={105}>T-105 San Isidro</option>
                                <option value={316}>T-316 Huachipa</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApprove(req)}
                            className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeny(req)}
                            className="h-8 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Denegar</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Las aprobaciones crean de inmediato al usuario en el Directorio con acceso web habilitado.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00236f] text-white font-bold rounded-lg hover:bg-[#1e3a8a] transition-colors cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
