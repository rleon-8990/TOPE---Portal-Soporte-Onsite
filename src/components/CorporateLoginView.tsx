import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Key,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { AppUser } from '../types';
import { isCorporateEmail, getRoleConfig } from '../utils/rbac';

interface CorporateLoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  availableUsers: AppUser[];
}

export const CorporateLoginView: React.FC<CorporateLoginViewProps> = ({
  onLoginSuccess,
  availableUsers
}) => {
  // State for form
  const [email, setEmail] = useState<string>('rleon@tottus.com.pe');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showMsalModal, setShowMsalModal] = useState<boolean>(false);
  const [msalStep, setMsalStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');
  const [selectedUserForMsal, setSelectedUserForMsal] = useState<AppUser | null>(null);

  // Pre-configured profiles for instant evaluation
  const demoProfiles = [
    {
      label: 'Administrador General (8/8 Módulos)',
      user: availableUsers.find(u => u.email === 'rleon@tottus.com.pe') || availableUsers[0],
      roleBadge: 'Administrador',
      accessBadge: 'Acceso Total (8 Módulos)'
    },
    {
      label: 'Supervisor Regional (7/8 Módulos)',
      user: availableUsers.find(u => u.role.includes('Supervisor')) || availableUsers[3],
      roleBadge: 'Supervisor Regional',
      accessBadge: 'Supervisión y Tiendas (7 Módulos)'
    },
    {
      label: 'Técnico Especialista / IT Operator (5/8 Módulos)',
      user: availableUsers.find(u => u.email === 'rleon.ti@tottus.com.pe' || u.role.includes('Operator')) || availableUsers[1],
      roleBadge: 'IT Operator / Especialista',
      accessBadge: 'Operativo & OTs (5 Módulos)'
    },
    {
      label: 'Gerente de Tienda (4/8 Módulos)',
      user: availableUsers.find(u => u.role.includes('Gerente de Tienda')) || availableUsers[6],
      roleBadge: 'Gerente Tienda',
      accessBadge: 'Tienda T-103 (4 Módulos)'
    },
    {
      label: 'Jefe de Mantenimiento (6/8 Módulos)',
      user: availableUsers.find(u => u.role.includes('Jefe de Mantenimiento')) || availableUsers[7],
      roleBadge: 'Mantenimiento',
      accessBadge: 'Técnico y Equipos (6 Módulos)'
    }
  ];

  const handleCorporateLogin = (targetUser?: AppUser) => {
    setError(null);
    const userToAuth = targetUser || availableUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr-ext-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email.toLowerCase(),
      role: 'IT Operator',
      cargo: 'Soporte Informático Onsite',
      phone: '+51 999 000 123',
      assignedRegion: 'Lima y Callao' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      status: 'disponible' as const,
      userType: 'tienda' as const,
      codTienda: 103,
      tiendaNombre: 'Megaplaza'
    };

    if (!targetUser) {
      if (!isCorporateEmail(email)) {
        setError('El dominio ingresado no es un correo corporativo válido. Utilice su cuenta @tottus.com.pe, @falabella.com o @reliant-cmms.pe.');
        return;
      }
    }

    setSelectedUserForMsal(userToAuth);
    setShowMsalModal(true);
    setMsalStep('prompt');
  };

  const handleConfirmMsalAuthorization = () => {
    setMsalStep('authorizing');
    setTimeout(() => {
      setMsalStep('success');
      setTimeout(() => {
        if (selectedUserForMsal) {
          setShowMsalModal(false);
          onLoginSuccess(selectedUserForMsal);
        }
      }, 900);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0f4ff] via-[#f8faff] to-[#e8f0fe] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#00236f] selection:text-white">
      {/* Top Banner with Tottus & Falabella affiliation */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between px-2 text-xs text-[#525e75]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-[#dce9ff] shadow-xs font-semibold text-[#007a33]">
            <span className="w-2 h-2 rounded-full bg-[#007a33] animate-pulse" />
            Hipermercados Tottus S.A.
          </span>
          <span className="hidden sm:inline text-[#757682]">| Sistemas de la Información</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4059aa] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00236f]" />
            Entra ID SSO v2.0
          </span>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,35,111,0.08)] border border-[#dce9ff] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Col: Brand Presentation & Outlook Details */}
        <div className="lg:col-span-5 bg-linear-to-b from-[#00236f] via-[#001c57] to-[#00143f] text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Deco Circles */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#007a33]/20 blur-xl pointer-events-none" />

          {/* Top Brand Identity */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#007a33] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border border-white/20">
                T
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-xl text-white block">
                  Tottus Onsite
                </span>
                <span className="text-xs text-white/75 font-medium tracking-wide">
                  CMMS & Soporte Red Nacional
                </span>
              </div>
            </div>

            <div className="pt-3">
              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Portal de Soporte Onsite & Telecomunicaciones
              </h2>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Acceso exclusivo para colaboradores, técnicos de campo, gerentes de tienda y supervisores de las 90 tiendas a nivel nacional.
              </p>
            </div>

            {/* Microsoft Outlook Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2 mt-4">
              <div className="flex items-center gap-2">
                {/* Microsoft 4-square official colors icon */}
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                  <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-white">Autenticación Microsoft 365</span>
              </div>
              <p className="text-[11px] text-white/75 leading-relaxed">
                Conecte de forma segura utilizando su cuenta institucional de correo <strong>Outlook (@tottus.com.pe)</strong>. El sistema validará automáticamente sus privilegios y roles asignados.
              </p>
            </div>
          </div>

          {/* Bottom Security Credentials & Compliance */}
          <div className="relative z-10 pt-6 border-t border-white/10 space-y-2 text-[11px] text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>Control de Acceso Basado en Roles (RBAC Tottus)</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-300" />
              <span>Cifrado TLS 1.3 & Auditoría de Actividad Azure</span>
            </div>
          </div>
        </div>

        {/* Right Col: Login Actions & Fast Switcher */}
        <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            
            {/* Header / Intro */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#00236f] tracking-tight">
                  Iniciar Sesión Institucional
                </h3>
                <span className="text-[10px] font-semibold text-[#007a33] bg-[#007a33]/10 px-2 py-0.5 rounded-md">
                  Falabella ID
                </span>
              </div>
              <p className="text-xs text-[#525e75] mt-1">
                Ingrese sus credenciales de Microsoft 365 o inicie con su cuenta corporativa detectada.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Acceso no autorizado</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* PRIMARY ACTION: Connect with Corporate Outlook Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCorporateLogin()}
                className="w-full h-12 bg-white hover:bg-[#f8faff] text-[#00236f] border-2 border-[#00236f] hover:border-[#1e3a8a] rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md active:scale-[0.99] cursor-pointer group"
              >
                {/* Microsoft 4-square official colors icon */}
                <div className="grid grid-cols-2 gap-1 w-5 h-5 shrink-0">
                  <div className="bg-[#f25022] w-2 h-2 rounded-xs" />
                  <div className="bg-[#7fba00] w-2 h-2 rounded-xs" />
                  <div className="bg-[#00a4ef] w-2 h-2 rounded-xs" />
                  <div className="bg-[#ffb900] w-2 h-2 rounded-xs" />
                </div>
                <span className="truncate">Iniciar sesión con cuenta Outlook Corporativo</span>
                <ArrowRight className="w-4 h-4 text-[#00236f] group-hover:translate-x-1 transition-transform ml-auto mr-1" />
              </button>

              <div className="flex items-center gap-3 text-xs text-[#757682] my-2">
                <div className="flex-1 h-px bg-[#e5eeff]" />
                <span className="font-medium text-[11px] uppercase tracking-wider">O ingrese con su correo @tottus</span>
                <div className="flex-1 h-px bg-[#e5eeff]" />
              </div>
            </div>

            {/* Email & Password Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCorporateLogin();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="ejemplo: rleon@tottus.com.pe"
                    className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-[#f8faff] border border-[#dce9ff] text-[#0b1c30] placeholder-[#a3b3d1] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                  Contraseña Corporativa (Active Directory)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de red"
                    className="w-full h-10 pl-9 pr-10 text-xs rounded-xl bg-[#f8faff] border border-[#dce9ff] text-[#0b1c30] placeholder-[#a3b3d1] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:bg-white transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757682] hover:text-[#0b1c30]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#525e75]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#dce9ff] text-[#00236f] focus:ring-[#00236f]"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para restablecer su clave corporativa, contacte al Service Desk Falabella anexo 4000 o visite passwordreset.microsoftonline.com')}
                  className="text-[#00236f] hover:underline font-semibold text-[11px]"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-[#007a33] hover:bg-[#006028] text-white rounded-xl font-bold text-xs shadow-md shadow-[#007a33]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Acceder al Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* QUICK ROLE EVALUATOR / TESTER SECTION */}
            <div className="pt-4 border-t border-[#e5eeff] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#007a33]" />
                  Selector de Perfil Rápido (Validación RBAC)
                </span>
                <span className="text-[10px] text-[#757682] bg-slate-100 px-2 py-0.5 rounded">
                  Modo Auditoría
                </span>
              </div>
              <p className="text-[11px] text-[#757682]">
                Haga clic en cualquiera de estos perfiles corporativos para ingresar instantáneamente y validar qué páginas puede ver cada rol:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoProfiles.map((item, idx) => {
                  if (!item.user) return null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCorporateLogin(item.user)}
                      className="p-2.5 rounded-xl border border-[#dce9ff] bg-[#f8f9ff] hover:bg-[#eff4ff] hover:border-[#00236f] transition-all text-left flex items-center gap-2.5 group cursor-pointer"
                    >
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#00236f]/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-[#0b1c30] group-hover:text-[#00236f] truncate">
                          {item.user.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#525e75]">
                          <span className="font-bold text-[#007a33] truncate">{item.roleBadge}</span>
                          <span>•</span>
                          <span className="text-[#757682] truncate">{item.accessBadge}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="pt-4 mt-4 border-t border-[#e5eeff] text-center text-[10px] text-[#757682]">
            © {new Date().getFullYear()} Hipermercados Tottus S.A. Todos los derechos reservados · Plataforma CMMS Conectada a Microsoft Azure & Dataverse
          </div>
        </div>
      </div>

      {/* Microsoft MSAL Interactive Simulation Popup Modal */}
      {showMsalModal && selectedUserForMsal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            
            {/* MSAL Header */}
            <div className="bg-[#f3f4f6] px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                  <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                  <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
                </div>
                <span className="text-xs font-bold text-slate-700">Microsoft Entra ID (Azure AD)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">login.microsoftonline.com</span>
            </div>

            {/* MSAL Content */}
            <div className="p-6 space-y-4">
              {msalStep === 'prompt' && (
                <>
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <img
                      src={selectedUserForMsal.avatarUrl}
                      alt={selectedUserForMsal.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#007a33]"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#0b1c30] truncate">{selectedUserForMsal.name}</h4>
                      <p className="text-xs text-slate-600 truncate">{selectedUserForMsal.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {selectedUserForMsal.role} · {selectedUserForMsal.assignedRegion}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      Hipermercados Tottus S.A. - Portal Soporte Onsite solicita permisos para:
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Ver su perfil corporativo y dirección de correo institucional (User.Read)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Conectar con buzón de alertas Outlook Corporativo (Mail.Read)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Validar privilegios y grupos de seguridad RBAC de Tottus</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowMsalModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMsalAuthorization}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#00236f] hover:bg-[#1e3a8a] rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Aceptar y Continuar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}

              {msalStep === 'authorizing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-[#00236f] border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="text-sm font-bold text-[#00236f]">Autenticando con Microsoft Entra ID...</h4>
                  <p className="text-xs text-slate-500">
                    Generando token OAuth Bearer y cargando privilegios del rol <strong>{selectedUserForMsal.role}</strong>
                  </p>
                </div>
              )}

              {msalStep === 'success' && (
                <div className="py-8 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-800">¡Conexión Exitosa con Outlook Corporativo!</h4>
                  <p className="text-xs text-slate-600">
                    Bienvenido, <strong>{selectedUserForMsal.name}</strong>. Accediendo a los módulos autorizados...
                  </p>
                </div>
              )}
            </div>

            {/* MSAL Footer */}
            <div className="bg-[#f9fafb] px-5 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Tenant ID: tottus-corp.onmicrosoft.com</span>
              <span>TLS 1.3 Seguro</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
