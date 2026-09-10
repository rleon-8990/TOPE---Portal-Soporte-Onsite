import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  LayoutDashboard,
  Boxes,
  Wrench,
  UserCheck,
  FileText,
  Store,
  Headphones,
  UserPlus,
  Info,
  Lock,
  ArrowRight,
  Send
} from 'lucide-react';
import { AppUser } from '../types';
import { APP_MODULES, ROLE_CONFIGS, getRoleConfig, hasPageAccess } from '../utils/rbac';

interface PrivilegesMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onSwitchUserRole?: (role: string) => void;
}

export const PrivilegesMatrixModal: React.FC<PrivilegesMatrixModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUserRole
}) => {
  if (!isOpen) return null;

  const currentConfig = getRoleConfig(currentUser.role);
  const rolesList = Object.values(ROLE_CONFIGS).filter((r, idx, arr) => 
    arr.findIndex(item => item.label === r.label) === idx
  );
  const modulesList = Object.values(APP_MODULES);

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return LayoutDashboard;
      case 'inventario': return Boxes;
      case 'mantenimiento': return Wrench;
      case 'monitoreo': return UserCheck;
      case 'informes': return FileText;
      case 'tiendas': return Store;
      case 'helpdesk': return Headphones;
      case 'usuarios': return Users;
      case 'despachador': return Send;
      default: return LayoutDashboard;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#dce9ff] overflow-hidden animate-slideUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-linear-to-r from-[#00236f] to-[#1e3a8a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Matriz de Privilegios & Control de Acceso (RBAC)
              </h3>
              <p className="text-xs text-white/80">
                Políticas de visibilidad y acceso por rol corporativo en Tottus Onsite
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#0b1c30]">
          
          {/* Current User Privileges Summary Banner */}
          <div className="bg-[#eff4ff] border border-[#dce9ff] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00236f]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#00236f]">{currentUser.name}</span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    🟢 Outlook Activo
                  </span>
                </div>
                <div className="text-xs text-[#525e75] mt-0.5">
                  Correo: <strong>{currentUser.email}</strong> • Rol: <strong>{currentUser.role}</strong>
                </div>
                <div className="text-[11px] text-[#757682]">
                  Módulos permitidos: <strong>{currentConfig.allowedModules.length} de {modulesList.length}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${currentConfig.badgeColor}`}>
                Nivel: {currentConfig.label}
              </span>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-3.5 bg-[#f8faff] rounded-xl border border-[#e5eeff] text-xs text-[#525e75] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#00236f] shrink-0 mt-0.5" />
            <p>
              Cada usuario autenticado con su cuenta institucional de Outlook hereda automáticamente los permisos establecidos en Microsoft Entra ID para su cargo. A continuación se detalla la matriz de visibilidad de pantallas:
            </p>
          </div>

          {/* RBAC Matrix Table */}
          <div className="border border-[#dce9ff] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f0f4ff] border-b border-[#dce9ff] text-[#00236f]">
                  <th className="py-3 px-4 font-bold sticky left-0 bg-[#f0f4ff] z-10">Módulo / Pantalla</th>
                  {rolesList.map(r => (
                    <th key={r.role} className="py-3 px-3 font-bold text-center whitespace-nowrap">
                      <div className="flex flex-col items-center">
                        <span className={currentUser.role === r.role ? 'text-[#007a33] font-extrabold underline' : ''}>
                          {r.label}
                        </span>
                        {currentUser.role === r.role && (
                          <span className="text-[9px] font-normal text-[#007a33] bg-emerald-100 px-1.5 rounded-full">
                            Tu Rol
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f4ff]">
                {modulesList.map(mod => {
                  const Icon = getModuleIcon(mod.id);
                  const isCurrentAllowed = currentConfig.allowedModules.includes(mod.id);
                  return (
                    <tr key={mod.id} className={`hover:bg-[#f8faff] ${isCurrentAllowed ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="py-3 px-4 sticky left-0 bg-white shadow-xs z-10">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${isCurrentAllowed ? 'bg-[#eff4ff] text-[#00236f]' : 'bg-slate-100 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className={`font-semibold block ${isCurrentAllowed ? 'text-[#0b1c30]' : 'text-slate-500'}`}>
                              {mod.name}
                            </span>
                            <span className="text-[10px] text-[#757682] line-clamp-1">
                              {mod.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {rolesList.map(r => {
                        const hasAccess = r.allowedModules.includes(mod.id);
                        return (
                          <td key={r.role} className="py-3 px-3 text-center">
                            {hasAccess ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto" title="Acceso Permitido">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-300 mx-auto" title="Acceso Restringido">
                                <XCircle className="w-4 h-4" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Role Switcher for Testing in Realtime */}
          {onSwitchUserRole && (
            <div className="pt-3 border-t border-[#e5eeff] space-y-2">
              <span className="text-xs font-bold text-[#00236f] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#007a33]" />
                Simular y probar la vista con otro Rol:
              </span>
              <div className="flex flex-wrap gap-2">
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      onSwitchUserRole(r.role);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      currentUser.role === r.role
                        ? 'bg-[#00236f] text-white border-[#00236f] shadow-sm font-bold'
                        : 'bg-white text-[#444651] border-[#dce9ff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {r.label} ({r.allowedModules.length} módulos)
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#f8faff] border-t border-[#e5eeff] flex items-center justify-between text-xs text-[#757682]">
          <span>Conforme a políticas de seguridad Microsoft Entra ID de Grupo Falabella</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
