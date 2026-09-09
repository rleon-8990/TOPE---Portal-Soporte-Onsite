import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Users, ExternalLink } from 'lucide-react';
import { AppUser } from '../types';
import { APP_MODULES, getRoleConfig, getDefaultViewForRole } from '../utils/rbac';

interface AccessDeniedViewProps {
  currentView: string;
  currentUser: AppUser;
  onNavigateToAllowed: (viewId: string) => void;
  onOpenPrivilegesModal: () => void;
  onChangeAccount: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentView,
  currentUser,
  onNavigateToAllowed,
  onOpenPrivilegesModal,
  onChangeAccount
}) => {
  const moduleInfo = APP_MODULES[currentView] || {
    id: currentView,
    name: currentView.toUpperCase(),
    description: 'Módulo del portal de soporte onsite',
    requiredRoles: ['Administrador', 'Supervisor Regional']
  };

  const userConfig = getRoleConfig(currentUser.role);
  const defaultView = getDefaultViewForRole(currentUser.role);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border-2 border-red-100 shadow-xl text-center space-y-6">
        
        {/* Icon */}
        <div className="w-18 h-18 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-red-50/50">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Control de Acceso RBAC
          </span>
          <h2 className="text-2xl font-extrabold text-[#00236f] tracking-tight">
            Acceso Restringido a {moduleInfo.name}
          </h2>
          <p className="text-xs text-[#525e75] leading-relaxed">
            Su cuenta corporativa conectada de Outlook (<strong>{currentUser.email}</strong>) cuenta con el rol de <strong>{currentUser.role}</strong>, el cual no dispone de privilegios de acceso para esta sección.
          </p>
        </div>

        {/* Roles required box */}
        <div className="bg-[#f8faff] rounded-2xl p-4 border border-[#dce9ff] text-left space-y-2">
          <div className="text-xs font-bold text-[#00236f] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00236f]" />
            Roles con autorización para este módulo:
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {moduleInfo.requiredRoles.map((role, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-white border border-[#dce9ff] text-[#00236f] px-2.5 py-1 rounded-lg"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={() => onNavigateToAllowed(defaultView)}
            className="flex-1 h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir a mi módulo asignado</span>
          </button>
          
          <button
            onClick={onOpenPrivilegesModal}
            className="px-4 h-11 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-semibold text-xs rounded-xl border border-[#dce9ff] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Ver Matriz de Roles</span>
          </button>
        </div>

        {/* Change account link */}
        <div className="pt-2 border-t border-[#f0f4ff]">
          <button
            onClick={onChangeAccount}
            className="text-xs text-[#757682] hover:text-[#00236f] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
          >
            <span>Iniciar sesión con otra cuenta Outlook</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
