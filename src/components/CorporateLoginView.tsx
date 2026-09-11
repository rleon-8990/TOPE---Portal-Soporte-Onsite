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
  Laptop,
  ShieldAlert,
  UserX,
  History,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import { AppUser, LoginAuditRecord } from '../types';
import { isCorporateEmail, getRoleConfig } from '../utils/rbac';

interface CorporateLoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  availableUsers: AppUser[];
  onRecordAuditLog?: (record: LoginAuditRecord) => void;
  loginAuditLogs?: LoginAuditRecord[];
}

export const CorporateLoginView: React.FC<CorporateLoginViewProps> = ({
  onLoginSuccess,
  availableUsers,
  onRecordAuditLog,
  loginAuditLogs = []
}) => {
  // State for form
  const [email, setEmail] = useState<string>('rleon@tottus.com.pe');
  const [password, setPassword] = useState<string>('Tottus2026*');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<boolean>(false);
  const [blockedDetail, setBlockedDetail] = useState<{
    type: 'not_found' | 'disabled' | 'wrong_password';
    email: string;
    userName?: string;
    message: string;
  } | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showMsalModal, setShowMsalModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [msalStep, setMsalStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');
  const [selectedUserForMsal, setSelectedUserForMsal] = useState<AppUser | null>(null);

  // Pre-configured profiles for instant evaluation
  const demoProfiles = [
    {
      label: 'Administrador General (8/8 Módulos)',
      user: availableUsers.find(u => u.email === 'rleon@tottus.com.pe') || availableUsers[0],
      roleBadge: 'Administrador',
      accessBadge: 'Acceso Total (8 Módulos)',
      statusBadge: 'Habilitado en Directorio'
    },
    {
      label: 'Supervisor Regional (7/8 Módulos)',
      user: availableUsers.find(u => u.role?.includes('Supervisor')) || availableUsers[3],
      roleBadge: 'Supervisor Regional',
      accessBadge: 'Supervisión y Tiendas (7 Módulos)',
      statusBadge: 'Habilitado en Directorio'
    },
    {
      label: 'IT Operator en Tienda Megaplaza (5/8 Módulos)',
      user: availableUsers.find(u => u.email === 'jbravo@tottus.com.pe' || u.role?.includes('Operator')) || availableUsers[1],
      roleBadge: 'IT Operator',
      accessBadge: 'Operativo & OTs (5 Módulos)',
      statusBadge: 'Habilitado en Directorio'
    },
    {
      label: 'Gerente de Tienda (4/8 Módulos)',
      user: availableUsers.find(u => u.role?.includes('Gerente de Tienda') || u.email === 'rpaz@tottus.com.pe') || availableUsers[6],
      roleBadge: 'Gerente Tienda',
      accessBadge: 'Tienda T-103 (4 Módulos)',
      statusBadge: 'Habilitado en Directorio'
    }
  ];

  const handleCorporateLogin = (
    targetUser?: AppUser,
    forceUnregisteredEmail?: string,
    forcedPassword?: string,
    forceMsalModal?: boolean
  ) => {
    setError(null);
    setBlockedDetail(null);

    const emailToTest = (forceUnregisteredEmail || (targetUser ? targetUser.email : email)).trim().toLowerCase();

    if (!isCorporateEmail(emailToTest)) {
      setError('El dominio ingresado no es un correo corporativo válido. Utilice su cuenta @tottus.com.pe, @falabella.com o @reliant-cmms.pe.');
      return;
    }

    // 1. REGLA ESTRICTA: El usuario DEBE estar registrado en el Directorio (availableUsers)
    const existingUser = targetUser || availableUsers.find(u => u.email.toLowerCase() === emailToTest);

    if (!existingUser) {
      // Registrar intento bloqueado en auditoría
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: emailToTest,
        userName: 'Cuenta No Registrada',
        userRole: 'Sin Privilegios',
        status: 'bloqueado_no_en_directorio',
        ipAddress: '190.237.14.88 [Red Pública / Móvil]',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Safari Mobile / iPhone' : 'Chrome 128 / Windows',
        locationOrStore: 'Acceso Denegado',
        notes: 'Intento de login rechazado: El usuario no figura en el Directorio Corporativo de Sistemas.'
      };
      if (onRecordAuditLog) {
        onRecordAuditLog(blockedRecord);
      }

      setError(`⛔ Cuenta No Autorizada: El correo "${emailToTest}" no se encuentra registrado en el Directorio Corporativo.`);
      setBlockedDetail({
        type: 'not_found',
        email: emailToTest,
        message: 'Por políticas de seguridad de Hipermercados Tottus, solo colaboradores dados de alta previamente en el Directorio de Sistemas por el Administrador (rleon@tottus.com.pe) pueden ingresar al portal.'
      });
      return;
    }

    // 2. REGLA ESTRICTA: Verificar si el usuario está HABILITADO para acceso web (webAccessEnabled !== false)
    if (existingUser.webAccessEnabled === false) {
      // Registrar intento bloqueado por inhabilitación
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: existingUser.email,
        userName: existingUser.name,
        userRole: existingUser.role,
        status: 'bloqueado_inhabilitado',
        ipAddress: '10.24.180.99 [LAN Tienda/Corp]',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Navegador Web / Windows',
        locationOrStore: existingUser.tiendaNombre ? `T-${existingUser.codTienda} ${existingUser.tiendaNombre}` : 'Sede Central',
        notes: `Intento de login rechazado: El usuario está registrado pero sus privilegios web están suspendidos en Directorio.`
      };
      if (onRecordAuditLog) {
        onRecordAuditLog(blockedRecord);
      }

      setError(`🔒 Acceso Web Deshabilitado: La cuenta "${existingUser.email}" está registrada pero sus privilegios de ingreso han sido suspendidos.`);
      setBlockedDetail({
        type: 'disabled',
        email: existingUser.email,
        userName: existingUser.name,
        message: `El usuario ${existingUser.name} (${existingUser.role}) tiene su switch de "Acceso Web" apagado en el Directorio de Personal. Contacte al Administrador de Sistemas para reactivar sus permisos.`
      });
      return;
    }

    // 3. REGLA ESTRICTA DE SEGURIDAD: Validación de Contraseña de Active Directory / Windows
    const expectedPassword = existingUser.password || 'Tottus2026*';
    const enteredPassword = forcedPassword !== undefined ? forcedPassword : password;

    if (!enteredPassword || enteredPassword.trim() === '') {
      setError(`⚠️ Contraseña Requerida: Por favor ingrese la contraseña corporativa de Active Directory para ${existingUser.name}.`);
      return;
    }

    if (enteredPassword !== expectedPassword) {
      // Registrar intento bloqueado por contraseña errónea en Auditoría
      const wrongPasswordRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: existingUser.email,
        userName: existingUser.name,
        userRole: existingUser.role,
        status: 'bloqueado_contrasena_incorrecta',
        ipAddress: existingUser.email === 'rleon@tottus.com.pe' ? '10.24.180.45 [Red Sede Central]' : '10.24.103.15 [LAN Tienda]',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Chrome 128 / Windows 11 Enterprise',
        locationOrStore: existingUser.tiendaNombre ? `T-${existingUser.codTienda} ${existingUser.tiendaNombre}` : 'Sede Central San Isidro',
        notes: `Intento de login RECHAZADO: Contraseña incorrecta ingresada para ${existingUser.email}. No coincide con Active Directory.`
      };
      if (onRecordAuditLog) {
        onRecordAuditLog(wrongPasswordRecord);
      }

      setError(`⛔ Contraseña Incorrecta: Las credenciales ingresadas no coinciden con la clave corporativa de Active Directory para ${existingUser.name}.`);
      setBlockedDetail({
        type: 'wrong_password',
        email: existingUser.email,
        userName: existingUser.name,
        message: `La contraseña ingresada no es válida para la cuenta de ${existingUser.name} (${existingUser.email}). El intento fallido ha sido registrado con marca de tiempo e IP en la Auditoría de Seguridad TI. (Clave corporativa predeterminada de prueba: Tottus2026*)`
      });
      return;
    }

    // 4. Usuario registrado, habilitado y con contraseña verificada
    if (forceMsalModal) {
      setSelectedUserForMsal(existingUser);
      setShowMsalModal(true);
      setMsalStep('prompt');
    } else {
      // Login directo con credenciales válidas
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        const successRecord: LoginAuditRecord = {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeAgo: 'Justo ahora',
          userEmail: existingUser.email,
          userName: existingUser.name,
          userRole: existingUser.role,
          status: 'exitoso',
          ipAddress: existingUser.email === 'rleon@tottus.com.pe' ? '10.24.180.45 [Red Sede Central]' : '10.24.103.15 [LAN Tienda]',
          deviceInfo: 'Chrome 128 · Windows 11 Enterprise (Active Directory)',
          locationOrStore: existingUser.tiendaNombre ? `T-${existingUser.codTienda} ${existingUser.tiendaNombre}` : 'Sede Central San Isidro',
          notes: `Inicio de sesión exitoso con credenciales verificadas de Active Directory (${existingUser.role})`
        };
        if (onRecordAuditLog) {
          onRecordAuditLog(successRecord);
        }

        const updatedUser: AppUser = {
          ...existingUser,
          lastLoginAt: new Date().toLocaleString('es-PE'),
          lastLoginIp: successRecord.ipAddress,
          loginDevice: successRecord.deviceInfo,
          loginCount: (existingUser.loginCount || 0) + 1
        };

        onLoginSuccess(updatedUser);
      }, 600);
    }
  };

  const handleConfirmMsalAuthorization = () => {
    setMsalStep('authorizing');
    setTimeout(() => {
      setMsalStep('success');
      setTimeout(() => {
        if (selectedUserForMsal) {
          // Registrar login exitoso en Auditoría de Accesos
          const successRecord: LoginAuditRecord = {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeAgo: 'Justo ahora',
            userEmail: selectedUserForMsal.email,
            userName: selectedUserForMsal.name,
            userRole: selectedUserForMsal.role,
            status: 'exitoso',
            ipAddress: selectedUserForMsal.email === 'rleon@tottus.com.pe' ? '10.24.180.45 [Red Sede Central]' : '10.24.103.15 [LAN Tienda]',
            deviceInfo: 'Chrome 128 · Windows 11 Enterprise (Entra ID OAuth)',
            locationOrStore: selectedUserForMsal.tiendaNombre ? `T-${selectedUserForMsal.codTienda} ${selectedUserForMsal.tiendaNombre}` : 'Sede Central San Isidro',
            notes: `Inicio de sesión exitoso con cuenta corporativa Outlook/OAuth (${selectedUserForMsal.role})`
          };
          if (onRecordAuditLog) {
            onRecordAuditLog(successRecord);
          }

          const updatedUser: AppUser = {
            ...selectedUserForMsal,
            lastLoginAt: new Date().toLocaleString('es-PE'),
            lastLoginIp: successRecord.ipAddress,
            loginDevice: successRecord.deviceInfo,
            loginCount: (selectedUserForMsal.loginCount || 0) + 1
          };

          setShowMsalModal(false);
          onLoginSuccess(updatedUser);
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-[#007a33] bg-[#007a33]/10 px-2 py-0.5 rounded-md">
                    Falabella ID
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="text-[10px] font-semibold text-[#00236f] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ver registro de auditoría de logins"
                  >
                    <History className="w-3 h-3 text-[#00236f]" />
                    <span>Auditoría Logins ({loginAuditLogs.length})</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#525e75] mt-1">
                Ingrese sus credenciales de Microsoft 365. <strong>Solo usuarios registrados y habilitados en el Directorio tienen autorización de acceso.</strong>
              </p>
            </div>

            {/* Error Message & Detailed Security Block Card */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-fadeIn text-xs text-red-900">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block text-red-900">{error}</span>
                    {blockedDetail && (
                      <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                        {blockedDetail.message}
                      </p>
                    )}
                    {blockedDetail?.type === 'wrong_password' && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPassword('Tottus2026*');
                            setError(null);
                            setBlockedDetail(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-red-700" />
                          <span>Restaurar clave válida de prueba (Tottus2026*)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-red-200/60 text-[11px] flex items-center justify-between text-red-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>Intento rechazado y registrado en la Auditoría de Seguridad</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuditModal(true)}
                    className="underline font-semibold hover:text-red-950 cursor-pointer"
                  >
                    Ver detalle en Auditoría
                  </button>
                </div>
              </div>
            )}

            {/* PRIMARY ACTION: Connect with Corporate Outlook Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCorporateLogin(undefined, undefined, undefined, true)}
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
                <span className="font-medium text-[11px] uppercase tracking-wider">O ingrese con credenciales Active Directory</span>
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
                      setBlockedDetail(null);
                    }}
                    placeholder="ejemplo: rleon@tottus.com.pe"
                    className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-[#f8faff] border border-[#dce9ff] text-[#0b1c30] placeholder-[#a3b3d1] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#0b1c30]">
                    Contraseña Corporativa (Active Directory / Windows)
                  </label>
                  <span className="text-[10px] text-[#007a33] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Validación Estricta
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757682]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                      setBlockedDetail(null);
                    }}
                    placeholder="Ingrese su contraseña de red"
                    className={`w-full h-10 pl-9 pr-10 text-xs rounded-xl bg-[#f8faff] border text-[#0b1c30] placeholder-[#a3b3d1] focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium ${
                      blockedDetail?.type === 'wrong_password'
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                        : 'border-[#dce9ff] focus:ring-[#00236f]'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757682] hover:text-[#0b1c30] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Helper / Test key reference */}
                <div className="flex items-center justify-between text-[11px] text-[#525e75] mt-1.5 px-0.5">
                  <div className="flex items-center gap-1 text-[#00236f]">
                    <KeyRound className="w-3 h-3 text-[#007a33] shrink-0" />
                    <span>Clave corporativa de prueba: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[#0b1c30] border border-slate-200">Tottus2026*</code></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPassword('Tottus2026*');
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 1800);
                    }}
                    className="text-[#007a33] hover:underline font-bold cursor-pointer text-[10px] flex items-center gap-1 ml-2 shrink-0"
                    title="Rellenar automáticamente la contraseña correcta"
                  >
                    {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPass ? 'Rellenada' : 'Rellenar'}</span>
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
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[#00236f] hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-10 bg-[#007a33] hover:bg-[#006028] text-white rounded-xl font-bold text-xs shadow-md shadow-[#007a33]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando Credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder al Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
                      onClick={() => {
                        const targetPass = item.user.password || 'Tottus2026*';
                        setEmail(item.user.email);
                        setPassword(targetPass);
                        handleCorporateLogin(item.user, undefined, targetPass);
                      }}
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

              {/* SECURITY TEST SCENARIOS (DEMONSTRATION OF RESTRICTIONS) */}
              <div className="pt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#757682]">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                    Probar Validación de Restricciones del Directorio:
                  </span>
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                    Whitelist Enforcement
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const disabledTestUser: AppUser = {
                        ...(availableUsers[1] || availableUsers[0]),
                        id: 'usr-disabled-test',
                        name: 'Pedro Morales',
                        email: 'pedro.morales@tottus.com.pe',
                        role: 'Técnico de Campo',
                        webAccessEnabled: false,
                        status: 'ausente'
                      };
                      handleCorporateLogin(disabledTestUser);
                    }}
                    className="p-2 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100/70 transition-all text-left flex items-center gap-2 cursor-pointer group"
                    title="Simula un usuario en el directorio con el switch de Acceso Web apagado"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      <Lock className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-red-900 truncate">
                        Probar Usuario Inhabilitado
                      </div>
                      <div className="text-[9px] text-red-700 truncate">
                        pedro.morales@tottus (Acceso apagado)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCorporateLogin(undefined, 'externo.proveedor@tottus.com.pe')}
                    className="p-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left flex items-center gap-2 cursor-pointer group"
                    title="Simula un intento de login con un correo que NO está dado de alta en el Directorio"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <UserX className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-800 truncate">
                        Probar No Registrado en Directorio
                      </div>
                      <div className="text-[9px] text-slate-600 truncate">
                        externo.proveedor@tottus.com.pe
                      </div>
                    </div>
                  </button>

                  {/* NUEVA PRUEBA DE CONTRASENA INCORRECTA */}
                  <button
                    type="button"
                    onClick={() => {
                      const testAdmin = availableUsers.find(u => u.email === 'rleon@tottus.com.pe') || availableUsers[0];
                      setEmail(testAdmin.email);
                      setPassword('clave_incorrecta_123');
                      handleCorporateLogin(testAdmin, undefined, 'clave_incorrecta_123');
                    }}
                    className="p-2.5 rounded-lg border border-rose-300 bg-rose-50/80 hover:bg-rose-100 transition-all text-left flex items-center gap-2.5 cursor-pointer group col-span-1 sm:col-span-2 shadow-2xs"
                    title="Simula ingresar cualquier contraseña errónea para verificar el bloqueo de acceso y registro de auditoría"
                  >
                    <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-rose-950 flex items-center justify-between">
                        <span>Probar Contraseña Incorrecta (Demostración de Bloqueo)</span>
                        <span className="text-[9px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-mono font-semibold">
                          Rechazo Activo
                        </span>
                      </div>
                      <div className="text-[9px] text-rose-700">
                        Envía la clave errónea <code>clave_incorrecta_123</code> para verificar que el acceso es denegado y auditado
                      </div>
                    </div>
                  </button>
                </div>
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

      {/* Login Audit Log Inspection Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
            
            {/* Modal Header */}
            <div className="bg-[#00236f] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Auditoría de Inicios de Sesión y Control de Acceso Web
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Registro de eventos de autenticación, IPs, dispositivos y validación de directorio en tiempo real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Informative Banner */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-blue-900">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs text-blue-950">
                    Monitoreo de Cuentas Institucionales (@tottus.com.pe)
                  </p>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Si un usuario intenta conectarse desde otra máquina o con otra cuenta (incluso si intentan iniciar sesión con <strong>rleon@tottus.com.pe</strong>), el sistema audita la IP de origen, el dispositivo y el resultado. Si la cuenta no está dada de alta en el Directorio o está deshabilitada, el acceso se bloquea de forma inmediata.
                  </p>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Intentos</div>
                  <div className="text-xl font-extrabold text-[#00236f] mt-0.5">{loginAuditLogs.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Logins Exitosos</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                    {loginAuditLogs.filter(l => l.status === 'exitoso').length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-[10px] text-rose-800 font-semibold uppercase tracking-wider">Clave Incorrecta</div>
                  <div className="text-xl font-extrabold text-rose-700 mt-0.5">
                    {loginAuditLogs.filter(l => l.status === 'bloqueado_contrasena_incorrecta').length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">No en Directorio</div>
                  <div className="text-xl font-extrabold text-amber-700 mt-0.5">
                    {loginAuditLogs.filter(l => l.status === 'bloqueado_no_en_directorio').length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-[10px] text-red-800 font-semibold uppercase tracking-wider">Inhabilitados</div>
                  <div className="text-xl font-extrabold text-red-700 mt-0.5">
                    {loginAuditLogs.filter(l => l.status === 'bloqueado_inhabilitado').length}
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 text-[11px] border-b border-slate-200 flex items-center justify-between">
                  <span>Eventos Recientes de Autenticación</span>
                  <span className="text-[10px] font-normal text-slate-500 font-mono">
                    {loginAuditLogs.length} registros en memoria
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {loginAuditLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No hay registros de auditoría de login en esta sesión.
                    </div>
                  ) : (
                    loginAuditLogs.map((record) => {
                      const isSuccess = record.status === 'exitoso';
                      const isWrongPass = record.status === 'bloqueado_contrasena_incorrecta';
                      const isNotInDir = record.status === 'bloqueado_no_en_directorio';
                      const isRleon = record.userEmail.includes('rleon@');

                      return (
                        <div
                          key={record.id}
                          className={`p-3 transition-colors ${
                            isWrongPass
                              ? 'bg-rose-50/40 hover:bg-rose-50/80'
                              : isRleon
                              ? 'bg-amber-50/40 hover:bg-amber-50/80'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> Exitoso
                                </span>
                              ) : isWrongPass ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                  <KeyRound className="w-3 h-3" /> Clave Incorrecta
                                </span>
                              ) : isNotInDir ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <UserX className="w-3 h-3" /> No en Directorio
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" /> Inhabilitado
                                </span>
                              )}

                              <span className="font-bold text-slate-900 text-xs">{record.userName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({record.userEmail})</span>
                              {isRleon && (
                                <span className="text-[9px] font-bold bg-[#00236f] text-white px-1.5 py-0.2 rounded">
                                  Cuenta Admin
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{record.timeAgo || new Date(record.timestamp).toLocaleTimeString()}</span>
                              <span>•</span>
                              <span className="font-mono text-slate-600 font-semibold">{record.ipAddress}</span>
                            </div>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                            <span>💻 {record.deviceInfo}</span>
                            <span>📍 {record.locationOrStore}</span>
                            <span>🛡️ Rol: {record.userRole}</span>
                          </div>

                          {record.notes && (
                            <div className="mt-1 text-[10px] text-slate-500 italic bg-white/70 px-2 py-1 rounded border border-slate-100">
                              {record.notes}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                La administración de privilegios y switches de acceso se gestiona dentro del <strong>Directorio</strong>.
              </span>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 bg-[#00236f] text-white font-bold rounded-lg hover:bg-[#1e3a8a] transition-colors cursor-pointer text-xs"
              >
                Cerrar Auditoría
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Forgot Password Guidance Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            <div className="bg-[#00236f] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-xs text-white">Recuperación de Contraseña Corporativa</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="font-semibold text-blue-950">
                  Políticas de Identidad Active Directory (Falabella / Tottus)
                </p>
                <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                  Las contraseñas de acceso están sincronizadas con el dominio empresarial de Microsoft Entra ID / Office 365.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#00236f] text-white text-[10px] flex items-center justify-center">1</span>
                    <span>Canal Service Desk Falabella</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-6.5">
                    Comuníquese al anexo interno <strong>4000</strong> o escriba a <code>mesadeayuda@falabella.com</code> solicitando el desbloqueo o reseteo de su clave de red.
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#00236f] text-white text-[10px] flex items-center justify-center">2</span>
                    <span>Autogestión Microsoft SSPR</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-6.5">
                    Si tiene configurado Microsoft Authenticator, ingrese al portal de autoservicio en <a href="https://passwordreset.microsoftonline.com" target="_blank" rel="noreferrer" className="text-[#00236f] font-semibold underline">passwordreset.microsoftonline.com</a>.
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span>Ambiente de Evaluación / Pruebas</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                    Para todas las cuentas de demostración, la contraseña corporativa de prueba configurada es: <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-mono">Tottus2026*</code>
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPassword('Tottus2026*');
                    setShowForgotPasswordModal(false);
                  }}
                  className="px-4 py-2 bg-[#007a33] hover:bg-[#006028] text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Rellenar con Clave de Prueba (Tottus2026*)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
