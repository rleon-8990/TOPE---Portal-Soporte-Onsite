import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  History,
  X,
  Clock,
  CheckCircle,
  KeyRound,
  Building2,
  HelpCircle,
  UserCheck,
  AlertCircle,
  Send,
  UserPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { AppUser, LoginAuditRecord, AccessRequest } from '../types';
import { isCorporateEmail } from '../utils/rbac';

interface CorporateLoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  availableUsers: AppUser[];
  onRecordAuditLog?: (record: LoginAuditRecord) => void;
  loginAuditLogs?: LoginAuditRecord[];
  accessRequests?: AccessRequest[];
  onRequestAccess?: (req: Omit<AccessRequest, 'id' | 'timestamp' | 'status'>) => void;
}

type AuthMode = 'corporate' | 'local' | 'google';

export const CorporateLoginView: React.FC<CorporateLoginViewProps> = ({
  onLoginSuccess,
  availableUsers,
  onRecordAuditLog,
  loginAuditLogs = [],
  onRequestAccess
}) => {
  // Authentication Mode: Microsoft 365, Cuenta Local, o Google Workspace
  const [authMode, setAuthMode] = useState<AuthMode>('corporate');

  // Form Fields
  const [email, setEmail] = useState<string>('rleon@tottus.com.pe');
  const [password, setPassword] = useState<string>('Tottus2026*');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // States
  const [error, setError] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Microsoft Modal States
  const [showMsalModal, setShowMsalModal] = useState<boolean>(false);
  const [msalPassword, setMsalPassword] = useState<string>('Tottus2026*');
  const [showMsalPassword, setShowMsalPassword] = useState<boolean>(false);
  const [msalError, setMsalError] = useState<string | null>(null);
  const [msalStep, setMsalStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');
  const [selectedUserForMsal, setSelectedUserForMsal] = useState<AppUser | null>(null);

  // Google Modal States
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string>('rleon@tottus.com.pe');
  const [googlePassword, setGooglePassword] = useState<string>('Tottus2026*');
  const [showGooglePassword, setShowGooglePassword] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleStep, setGoogleStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');

  // Request Access Modal States (cuando el usuario no existe en el Directorio)
  const [showRequestAccessModal, setShowRequestAccessModal] = useState<boolean>(false);
  const [requestEmail, setRequestEmail] = useState<string>('');
  const [requestName, setRequestName] = useState<string>('');
  const [requestRole, setRequestRole] = useState<string>('Técnico Especialista');
  const [requestMotive, setRequestMotive] = useState<string>('Soporte y mantenimiento técnico en tienda');
  const [requestProvider, setRequestProvider] = useState<'microsoft' | 'google' | 'local'>('microsoft');
  const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

  /**
   * Envía la solicitud de acceso al Administrador cuando el usuario no figura en el Directorio.
   */
  const handleSubmitAccessRequest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!requestEmail.trim() || !requestEmail.includes('@')) {
      setError('Ingrese un correo electrónico válido para la solicitud.');
      return;
    }

    setIsSendingRequest(true);

    const payload = {
      email: requestEmail.trim().toLowerCase(),
      name: requestName.trim() || requestEmail.split('@')[0],
      requestedRole: requestRole,
      provider: requestProvider,
      notes: requestMotive.trim(),
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Navegador Web / Windows',
      ipAddress: '190.237.14.88'
    };

    if (onRequestAccess) {
      onRequestAccess(payload);
    } else {
      try {
        const savedReqs = localStorage.getItem('tottus_access_requests');
        const list = savedReqs ? JSON.parse(savedReqs) : [];
        const newReq = {
          ...payload,
          id: `req-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeAgo: 'Justo ahora',
          status: 'pendiente'
        };
        localStorage.setItem('tottus_access_requests', JSON.stringify([newReq, ...list]));
      } catch (err) {
        console.warn('Error saving access request locally', err);
      }
    }

    setTimeout(() => {
      setIsSendingRequest(false);
      setShowRequestAccessModal(false);
      setShowMsalModal(false);
      setShowGoogleModal(false);
      setError(null);
      setSuccessFeedback(
        `✅ Se envió al administrador los permisos para su aprobación. Su solicitud para "${requestEmail}" fue enviada a la Dirección de Sistemas TI (rleon@tottus.com.pe). Recibirá confirmación cuando sea aprobada.`
      );
    }, 600);
  };

  /**
   * Abre el formulario para solicitar permisos de acceso con el correo prellenado.
   */
  const handleOpenRequestAccess = (targetEmail: string, provider: 'microsoft' | 'google' | 'local') => {
    setRequestEmail(targetEmail);
    setRequestName(targetEmail.split('@')[0].replace('.', ' ').toUpperCase());
    setRequestProvider(provider);
    setShowRequestAccessModal(true);
  };

  /**
   * Manejador de Autenticación Principal
   */
  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessFeedback(null);

    const trimmedEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (!trimmedEmail) {
      setError('Por favor, ingrese su correo electrónico institucional o registrado en el Directorio.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Formato de correo electrónico inválido. Ingrese una dirección válida (ej. usuario@tottus.com.pe).');
      return;
    }

    // =========================================================================
    // CASO 1: CUENTA CORPORATIVA MICROSOFT 365 / ENTRA ID
    // =========================================================================
    if (authMode === 'corporate') {
      if (!isCorporateEmail(trimmedEmail)) {
        setError(`El correo "${trimmedEmail}" no corresponde a los dominios corporativos autorizados (@tottus.com.pe, @falabella.com, etc.). Para correos de contratistas o soporte local, seleccione la pestaña "Cuenta Local".`);
        return;
      }

      const existingUser = availableUsers.find(
        u => u.email.trim().toLowerCase() === trimmedEmail
      );

      setSelectedUserForMsal(existingUser || null);
      setMsalPassword(password || 'Tottus2026*');
      setMsalError(null);
      setShowMsalModal(true);
      setMsalStep('prompt');
      return;
    }

    // =========================================================================
    // CASO 2: CUENTA GOOGLE WORKSPACE
    // =========================================================================
    if (authMode === 'google') {
      setGoogleEmail(trimmedEmail);
      setGooglePassword(password || 'Tottus2026*');
      setGoogleError(null);
      setShowGoogleModal(true);
      setGoogleStep('prompt');
      return;
    }

    // =========================================================================
    // CASO 3: CUENTA LOCAL (USUARIOS SIN CUENTA MICROSOFT / PERSONAL DE TIENDA)
    // =========================================================================
    if (!enteredPassword) {
      setError('Por favor, ingrese la contraseña asignada a su usuario en el Directorio.');
      return;
    }

    setIsAuthenticating(true);

    // 1. REGLA ESTRICTA: El correo DEBE estar registrado en el Directorio de Sistemas (availableUsers)
    const existingUser = availableUsers.find(
      u => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!existingUser) {
      setIsAuthenticating(false);
      // Registrar intento bloqueado en auditoría
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: trimmedEmail,
        userName: 'Usuario No Registrado',
        userRole: 'Sin Privilegios',
        status: 'bloqueado_no_en_directorio',
        ipAddress: '190.237.14.88 [Red Externa]',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Navegador Web / Windows',
        locationOrStore: 'Acceso Denegado',
        notes: `Intento de inicio de sesión Local RECHAZADO: El correo ${trimmedEmail} no existe en el Directorio de Personal.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setError(`⛔ Acceso Denegado: El correo "${trimmedEmail}" no se encuentra registrado en el Directorio de Personal. Si requiere acceso, puede solicitar permisos al Administrador del Sistema.`);
      return;
    }

    // 2. REGLA ESTRICTA: Verificar si el usuario tiene el acceso web habilitado (webAccessEnabled !== false)
    if (existingUser.webAccessEnabled === false) {
      setIsAuthenticating(false);
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
        notes: `Intento de login rechazado: El colaborador ${existingUser.name} está registrado pero tiene su acceso web inhabilitado en el Directorio.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setError(`🔒 Acceso Web Deshabilitado: La cuenta de "${existingUser.name}" (${existingUser.email}) se encuentra suspendida o deshabilitada en el Directorio.`);
      return;
    }

    // 3. REGLA CRÍTICA ESTRICTA: VALIDACIÓN DE CONTRASEÑA
    // Comprobar estrictamente la contraseña contra existingUser.password
    const expectedPassword = existingUser.password || 'Tottus2026*';
    if (enteredPassword !== expectedPassword) {
      setIsAuthenticating(false);
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: existingUser.email,
        userName: existingUser.name,
        userRole: existingUser.role,
        status: 'bloqueado_contrasena_incorrecta',
        ipAddress: '10.24.180.45 [Red Corporativa]',
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvil' : 'Navegador Web / Windows',
        locationOrStore: existingUser.tiendaNombre ? `T-${existingUser.codTienda} ${existingUser.tiendaNombre}` : 'Sede Central',
        notes: `Intento de login fallido: Contraseña incorrecta ingresada para ${existingUser.name} (${existingUser.email}).`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setError(`⛔ Contraseña Incorrecta: Las credenciales ingresadas no coinciden con las registradas para ${existingUser.name} en el Directorio. Inténtelo nuevamente.`);
      return;
    }

    // Autenticación local exitosa
    const updatedUser: AppUser = {
      ...existingUser,
      lastLoginAt: 'Ahora',
      lastLoginIp: '10.24.180.45 [Red Local / Tienda]',
      loginDevice: navigator.userAgent.includes('Mobile') ? 'Móvil / Android' : 'Chrome / Windows',
      loginCount: (existingUser.loginCount || 0) + 1
    };

    const successRecord: LoginAuditRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      userEmail: updatedUser.email,
      userName: updatedUser.name,
      userRole: updatedUser.role,
      status: 'exitoso',
      ipAddress: updatedUser.lastLoginIp || '10.24.180.45',
      deviceInfo: updatedUser.loginDevice,
      locationOrStore: updatedUser.tiendaNombre ? `T-${updatedUser.codTienda} ${updatedUser.tiendaNombre}` : 'Sede Central',
      notes: `Inicio de sesión exitoso mediante Credenciales Locales de Directorio (${updatedUser.role}).`
    };

    if (onRecordAuditLog) onRecordAuditLog(successRecord);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLoginSuccess(updatedUser);
    }, 400);
  };

  /**
   * Confirma la autorización en el Modal de Microsoft Entra ID (con validación de contraseña de Microsoft).
   */
  const handleConfirmMsalAuthorization = () => {
    setMsalError(null);
    const targetEmail = email.trim().toLowerCase();
    const enteredMsalPass = msalPassword.trim();

    // 1. Validar que el usuario esté en el directorio
    const existingUser = availableUsers.find(
      u => u.email.trim().toLowerCase() === targetEmail
    );

    if (!existingUser) {
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: targetEmail,
        userName: 'Usuario No Registrado',
        userRole: 'Sin Privilegios',
        status: 'bloqueado_no_en_directorio',
        ipAddress: '190.237.14.88 [Red Corporativa Falabella]',
        deviceInfo: 'Microsoft Edge / Windows 11',
        locationOrStore: 'Acceso Denegado',
        notes: `Intento Microsoft Entra ID bloqueado: La cuenta ${targetEmail} no está en el Directorio.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setMsalError(`⛔ Acceso Denegado: La cuenta Microsoft "${targetEmail}" no se encuentra registrada en el Directorio de Sistemas Tottus.`);
      return;
    }

    // 2. Validar que tenga acceso web habilitado
    if (existingUser.webAccessEnabled === false) {
      setMsalError(`🔒 Acceso Web Deshabilitado: La cuenta "${existingUser.name}" se encuentra suspendida en el Directorio.`);
      return;
    }

    // 3. REGLA ESTRICTA: Validar contraseña en Microsoft
    const expectedPassword = existingUser.password || 'Tottus2026*';
    if (!enteredMsalPass || enteredMsalPass !== expectedPassword) {
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: existingUser.email,
        userName: existingUser.name,
        userRole: existingUser.role,
        status: 'bloqueado_contrasena_incorrecta',
        ipAddress: '10.24.180.45 [M365 Entra ID]',
        deviceInfo: 'Edge / Windows 11',
        locationOrStore: 'Acceso Denegado',
        notes: `Contraseña de Microsoft Entra ID incorrecta para ${existingUser.name}.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setMsalError('Su cuenta o contraseña es incorrecta. Asegúrese de escribir la contraseña de su cuenta profesional o educativa de Falabella / Tottus.');
      return;
    }

    setMsalStep('authorizing');

    setTimeout(() => {
      setMsalStep('success');

      const updatedUser: AppUser = {
        ...existingUser,
        lastLoginAt: 'Ahora',
        lastLoginIp: '10.24.180.45 [M365 Entra ID]',
        loginDevice: 'Chrome 128 / Windows 11 Enterprise',
        loginCount: (existingUser.loginCount || 0) + 1
      };

      const auditRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: updatedUser.email,
        userName: updatedUser.name,
        userRole: updatedUser.role,
        status: 'exitoso',
        ipAddress: '10.24.180.45 [Red Central]',
        deviceInfo: 'Microsoft Entra ID / Outlook Single Sign-On',
        locationOrStore: updatedUser.tiendaNombre ? `T-${updatedUser.codTienda} ${updatedUser.tiendaNombre}` : 'Sede Central',
        notes: `Autenticación corporativa exitosa vía Microsoft 365 Single Sign-On (${updatedUser.role}).`
      };

      if (onRecordAuditLog) onRecordAuditLog(auditRecord);

      setTimeout(() => {
        setShowMsalModal(false);
        onLoginSuccess(updatedUser);
      }, 700);
    }, 1100);
  };

  /**
   * Confirma la autorización en el Modal de Google Workspace / Gmail
   */
  const handleConfirmGoogleAuthorization = () => {
    setGoogleError(null);
    const targetEmail = googleEmail.trim().toLowerCase();
    const enteredGooglePass = googlePassword.trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setGoogleError('Ingresa un correo electrónico de Google válido.');
      return;
    }

    // 1. Validar que el usuario esté en el directorio
    const existingUser = availableUsers.find(
      u => u.email.trim().toLowerCase() === targetEmail
    );

    if (!existingUser) {
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: targetEmail,
        userName: 'Usuario No Registrado',
        userRole: 'Sin Privilegios',
        status: 'bloqueado_no_en_directorio',
        ipAddress: '190.237.14.88 [Google OAuth]',
        deviceInfo: 'Google Chrome / OAuth 2.0',
        locationOrStore: 'Acceso Denegado',
        notes: `Intento con cuenta Google ${targetEmail} bloqueado: No registrado en Directorio.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setGoogleError(`⛔ La cuenta de Google "${targetEmail}" no se encuentra registrada en el Directorio de Sistemas Tottus.`);
      return;
    }

    // 2. Validar acceso web habilitado
    if (existingUser.webAccessEnabled === false) {
      setGoogleError(`🔒 Acceso Web Deshabilitado: La cuenta "${existingUser.name}" se encuentra suspendida en el Directorio.`);
      return;
    }

    // 3. Validar contraseña
    const expectedPassword = existingUser.password || 'Tottus2026*';
    if (!enteredGooglePass || enteredGooglePass !== expectedPassword) {
      const blockedRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: existingUser.email,
        userName: existingUser.name,
        userRole: existingUser.role,
        status: 'bloqueado_contrasena_incorrecta',
        ipAddress: '10.24.180.45 [Google OAuth]',
        deviceInfo: 'Google Chrome / Android',
        locationOrStore: 'Acceso Denegado',
        notes: `Contraseña de cuenta Google incorrecta para ${existingUser.name}.`
      };
      if (onRecordAuditLog) onRecordAuditLog(blockedRecord);

      setGoogleError('Contraseña incorrecta. Inténtalo de nuevo o selecciona "¿Has olvidado la contraseña?"');
      return;
    }

    setGoogleStep('authorizing');

    setTimeout(() => {
      setGoogleStep('success');

      const updatedUser: AppUser = {
        ...existingUser,
        lastLoginAt: 'Ahora',
        lastLoginIp: '10.24.180.45 [Google Workspace]',
        loginDevice: 'Chrome / Google Account SSO',
        loginCount: (existingUser.loginCount || 0) + 1
      };

      const auditRecord: LoginAuditRecord = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        userEmail: updatedUser.email,
        userName: updatedUser.name,
        userRole: updatedUser.role,
        status: 'exitoso',
        ipAddress: '10.24.180.45 [Google OAuth]',
        deviceInfo: 'Google Workspace Single Sign-On',
        locationOrStore: updatedUser.tiendaNombre ? `T-${updatedUser.codTienda} ${updatedUser.tiendaNombre}` : 'Sede Central',
        notes: `Autenticación exitosa vía Google Account (${updatedUser.role}).`
      };

      if (onRecordAuditLog) onRecordAuditLog(auditRecord);

      setTimeout(() => {
        setShowGoogleModal(false);
        onLoginSuccess(updatedUser);
      }, 700);
    }, 1100);
  };

  /**
   * Helper para prellenar un usuario de prueba rápidamente
   */
  const handleSelectQuickUser = (user: AppUser, mode: AuthMode = 'corporate') => {
    setEmail(user.email);
    setPassword(user.password || 'Tottus2026*');
    setAuthMode(mode);
    setError(null);
    setSuccessFeedback(null);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-col justify-between text-slate-800 font-sans selection:bg-[#00236f] selection:text-white">
      
      {/* Top Corporate Nav Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#00236f] flex items-center justify-center text-white font-black text-sm tracking-tight shadow-xs">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#00236f] tracking-tight text-base leading-none">
                    HIPERMERCADOS TOTTUS
                  </span>
                  <span className="bg-[#00236f]/10 text-[#00236f] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    CMMS Mantenimiento
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Portal Central de Gestión Técnica & Red Nacional de Tiendas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAuditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00236f] bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Auditoría de Acceso ({loginAuditLogs.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Card Top Banner */}
          <div className="bg-[#00236f] text-white p-6 sm:p-7 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 text-white px-2.5 py-1 rounded-md">
                  Autenticación Unificada
                </span>
                <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Directorio Tottus</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
                Iniciar Sesión en el Portal
              </h1>
              <p className="text-xs text-white/75 leading-relaxed">
                Acceso exclusivo para personal registrado en el Directorio de Sistemas.
              </p>
            </div>
          </div>

          {/* Authentication Mode Switcher Tabs */}
          <div className="grid grid-cols-3 bg-slate-100 p-1 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('corporate');
                setError(null);
                setSuccessFeedback(null);
                if (!email.includes('@tottus.com.pe')) {
                  setEmail('rleon@tottus.com.pe');
                  setPassword('Tottus2026*');
                }
              }}
              className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'corporate'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Microsoft 4-square icon */}
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3 shrink-0">
                <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
              </div>
              <span className="truncate">Microsoft 365</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('local');
                setError(null);
                setSuccessFeedback(null);
                if (email === 'rleon@tottus.com.pe') {
                  setEmail('c.ramos@reliant-cmms.pe');
                  setPassword('Tottus2026*');
                }
              }}
              className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'local'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Cuenta Local</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setError(null);
                setSuccessFeedback(null);
              }}
              className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'google'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Google 4-color G icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="truncate">Cuenta Google</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Success Feedback Banner */}
            {successFeedback && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="leading-relaxed font-medium">
                  {successFeedback}
                </div>
              </div>
            )}

            {/* Error Banner with Request Access Action */}
            {error && (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-xs text-rose-900 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div className="leading-relaxed font-medium flex-1">
                    {error}
                  </div>
                </div>
                
                {/* Si el error es por no estar en el directorio, habilitar botón de solicitar permisos */}
                {error.includes('no se encuentra registrado') && (
                  <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                    <span className="text-[11px] text-rose-700">¿Requiere acceso a este portal?</span>
                    <button
                      type="button"
                      onClick={() => handleOpenRequestAccess(email, authMode)}
                      className="px-3 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Solicitar Permisos al Administrador</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Explanatory subtitle per mode */}
            <div className="bg-[#f0f5ff] border border-[#d4e4ff] rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#00236f] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {authMode === 'corporate' && (
                  <span>
                    <strong>Acceso Corporativo Microsoft:</strong> Valida su identidad con Microsoft Entra ID. Solo se permite el ingreso a correos registrados en el Directorio de Sistemas Tottus.
                  </span>
                )}
                {authMode === 'local' && (
                  <span>
                    <strong>Acceso Cuenta Local:</strong> Diseñado para colaboradores sin cuenta Microsoft (contratistas, técnicos o soporte local). Requiere correo registrado y contraseña de Directorio.
                  </span>
                )}
                {authMode === 'google' && (
                  <span>
                    <strong>Acceso con Google:</strong> Conéctese mediante su cuenta corporativa de Google Workspace o Gmail registrada en el Directorio de Personal.
                  </span>
                )}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAuthenticate} className="space-y-4">
              
              {/* Field 1: Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={
                      authMode === 'corporate'
                        ? 'nombre.apellido@tottus.com.pe'
                        : authMode === 'google'
                        ? 'usuario@falabella.com o gmail'
                        : 'correo.registrado@reliant-cmms.pe'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00236f]/30 focus:border-[#00236f] transition-all font-mono"
                  />
                </div>
              </div>

              {/* Field 2: Password (Visible en Modo Local y Corporativo) */}
              {authMode === 'local' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Contraseña de Acceso Local
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-semibold text-[#00236f] hover:underline cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Ingrese su contraseña asignada"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00236f]/30 focus:border-[#00236f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>* Se valida estrictamente contra el Directorio de Sistemas.</span>
                    <button
                      type="button"
                      onClick={() => setPassword('Tottus2026*')}
                      className="text-[#00236f] hover:underline font-semibold cursor-pointer"
                    >
                      Rellenar clave demo
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Mantener sesión iniciada en este equipo
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              {authMode === 'corporate' && (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#00236f] hover:bg-[#1a3882] active:bg-[#00174a] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 shrink-0">
                      <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                      <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                      <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                      <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
                    </div>
                    <span>Continuar con Microsoft 365</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}

              {authMode === 'local' && (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 px-4 bg-[#00236f] hover:bg-[#1a3882] active:bg-[#00174a] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando credenciales en Directorio...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Ingresar con Cuenta Local</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {authMode === 'google' && (
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Ingresar con Cuenta de Google</span>
                    <ArrowRight className="w-4 h-4 ml-1 text-slate-500" />
                  </button>
                </div>
              )}

            </form>

            {/* Separator */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2.5 text-slate-400 font-bold tracking-wider">
                  Acceso rápido alternativo
                </span>
              </div>
            </div>

            {/* Quick Login Buttons for other providers */}
            <div className="grid grid-cols-2 gap-2">
              {authMode !== 'corporate' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('corporate');
                    setEmail('rleon@tottus.com.pe');
                    setPassword('Tottus2026*');
                    setError(null);
                  }}
                  className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <div className="grid grid-cols-2 gap-0.5 w-3 h-3 shrink-0">
                    <div className="bg-[#f25022] w-1.5 h-1.5 rounded-xs" />
                    <div className="bg-[#7fba00] w-1.5 h-1.5 rounded-xs" />
                    <div className="bg-[#00a4ef] w-1.5 h-1.5 rounded-xs" />
                    <div className="bg-[#ffb900] w-1.5 h-1.5 rounded-xs" />
                  </div>
                  <span>Microsoft 365</span>
                </button>
              )}

              {authMode !== 'google' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('google');
                    setShowGoogleModal(true);
                    setGoogleEmail(email.includes('@') ? email : 'rleon@tottus.com.pe');
                    setGooglePassword('Tottus2026*');
                    setError(null);
                  }}
                  className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Ingresar con Google</span>
                </button>
              )}

              {authMode !== 'local' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('local');
                    setEmail('c.ramos@reliant-cmms.pe');
                    setPassword('Tottus2026*');
                    setError(null);
                  }}
                  className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cuenta Local</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenRequestAccess(email || '', authMode)}
                className="p-2 border border-amber-200 hover:border-amber-300 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Solicitar Permisos</span>
              </button>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Cuentas de Prueba Registradas en Directorio:</span>
                <span className="text-slate-400 font-normal">Clave: Tottus2026*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {availableUsers.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectQuickUser(u, u.email.endsWith('@tottus.com.pe') ? 'corporate' : 'local')}
                    className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#00236f] bg-white hover:bg-[#00236f]/5 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="truncate pr-1">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#00236f] truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {u.email}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                      {u.role.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              {/* Probar usuario no registrado */}
              <button
                type="button"
                onClick={() => {
                  setEmail('usuario.nuevo@falabella.com');
                  setPassword('Tottus2026*');
                  setAuthMode('corporate');
                  setError(null);
                }}
                className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 py-1 cursor-pointer transition-colors"
              >
                Probar validación con correo no registrado (usuario.nuevo@falabella.com)
              </button>
            </div>

          </div>

          {/* Card Footer */}
          <div className="bg-[#f8faff] px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Seguridad y control de identidades respaldado por la Dirección Nacional de Mantenimiento Tottus
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
        © 2026 Hipermercados Tottus S.A. • Falabella Retail S.A. • Sistema CMMS de Mantenimiento & Infraestructura Crítica
      </footer>

      {/* =========================================================================
          MODAL 1: MICROSOFT ENTRA ID AUTHENTICATION (AUTHENTIC MICROSOFT PROMPT)
          ========================================================================= */}
      {showMsalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-300 p-8 flex flex-col justify-between animate-slideUp">
            
            {/* Top Microsoft Logo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                    <div className="bg-[#f25022] w-2 h-2" />
                    <div className="bg-[#7fba00] w-2 h-2" />
                    <div className="bg-[#00a4ef] w-2 h-2" />
                    <div className="bg-[#ffb900] w-2 h-2" />
                  </div>
                  <span className="font-semibold text-slate-800 text-lg tracking-tight">
                    Microsoft
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMsalModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {msalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium">
                      {msalError}
                    </div>
                  </div>
                  {msalError.includes('no se encuentra registrada') && (
                    <div className="pt-1.5 border-t border-rose-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMsalModal(false);
                          handleOpenRequestAccess(email, 'microsoft');
                        }}
                        className="w-full py-1.5 bg-[#00236f] hover:bg-[#1a3882] text-white text-xs font-bold rounded-md transition-colors"
                      >
                        Solicitar Permisos al Administrador
                      </button>
                    </div>
                  )}
                </div>
              )}

              {msalStep === 'prompt' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Escribir contraseña
                    </h2>
                    <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="font-medium text-slate-900">{email}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={showMsalPassword ? 'text' : 'password'}
                        value={msalPassword}
                        onChange={(e) => {
                          setMsalPassword(e.target.value);
                          if (msalError) setMsalError(null);
                        }}
                        placeholder="Contraseña corporativa"
                        autoFocus
                        className="w-full px-3 py-2.5 border-b-2 border-[#0067b8] focus:border-[#00236f] bg-slate-50 text-slate-900 text-sm focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMsalPassword(!showMsalPassword)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showMsalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>* Contraseña asignada en Directorio</span>
                      <button
                        type="button"
                        onClick={() => setMsalPassword('Tottus2026*')}
                        className="text-[#0067b8] hover:underline font-semibold"
                      >
                        Usar Tottus2026*
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Al iniciar sesión con Microsoft Entra ID, se verificará que su correo y credenciales coincidan con el Directorio Corporativo de Hipermercados Tottus.
                  </div>
                </div>
              )}

              {msalStep === 'authorizing' && (
                <div className="py-8 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[#0067b8] animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-slate-800">
                    Comprobando credenciales en tottus.onmicrosoft.com...
                  </div>
                  <p className="text-xs text-slate-500">
                    Estableciendo sesión federada segura mediante Entra ID
                  </p>
                </div>
              )}

              {msalStep === 'success' && (
                <div className="py-6 text-center space-y-3 text-emerald-600">
                  <CheckCircle className="w-10 h-10 mx-auto" />
                  <div className="text-base font-bold text-slate-900">
                    ¡Credenciales Validadas con Éxito!
                  </div>
                  <p className="text-xs text-slate-500">
                    Ingresando al Portal CMMS...
                  </p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            {msalStep === 'prompt' && (
              <div className="flex items-center justify-end gap-2 pt-6 mt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMsalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMsalAuthorization}
                  className="px-6 py-2 bg-[#0067b8] hover:bg-[#005da6] text-white text-xs font-bold rounded shadow-xs cursor-pointer transition-colors"
                >
                  Iniciar sesión
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GOOGLE SIGN-IN AUTHENTICATION MODAL (GOOGLE ACCOUNTS PROMPT)
          ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-8 flex flex-col justify-between animate-slideUp">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {/* Google Logo */}
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Acceder con Google
                </h2>
                <p className="text-xs text-slate-500">
                  Ir a Portal CMMS Hipermercados Tottus
                </p>
              </div>

              {googleError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-medium">
                      {googleError}
                    </div>
                  </div>
                  {googleError.includes('no se encuentra registrada') && (
                    <div className="pt-1.5 border-t border-rose-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowGoogleModal(false);
                          handleOpenRequestAccess(googleEmail, 'google');
                        }}
                        className="w-full py-1.5 bg-[#00236f] hover:bg-[#1a3882] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Solicitar Permisos al Administrador
                      </button>
                    </div>
                  )}
                </div>
              )}

              {googleStep === 'prompt' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo electrónico o teléfono
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => {
                        setGoogleEmail(e.target.value);
                        if (googleError) setGoogleError(null);
                      }}
                      placeholder="usuario@tottus.com.pe o falabella.com"
                      className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#1a73e8] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña de Cuenta
                    </label>
                    <div className="relative">
                      <input
                        type={showGooglePassword ? 'text' : 'password'}
                        value={googlePassword}
                        onChange={(e) => {
                          setGooglePassword(e.target.value);
                          if (googleError) setGoogleError(null);
                        }}
                        placeholder="Ingresa tu contraseña"
                        className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-[#1a73e8] rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGooglePassword(!showGooglePassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showGooglePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>* Clave registrada en Directorio</span>
                      <button
                        type="button"
                        onClick={() => setGooglePassword('Tottus2026*')}
                        className="text-[#1a73e8] hover:underline font-semibold"
                      >
                        Rellenar Tottus2026*
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Google compartirá tu nombre, dirección de correo electrónico y preferencia de idioma con Hipermercados Tottus CMMS.
                  </div>
                </div>
              )}

              {googleStep === 'authorizing' && (
                <div className="py-8 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-[#1a73e8] animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-slate-800">
                    Autenticando con Google OAuth 2.0...
                  </div>
                  <p className="text-xs text-slate-500">
                    Verificando permisos y registro en Directorio Tottus
                  </p>
                </div>
              )}

              {googleStep === 'success' && (
                <div className="py-6 text-center space-y-3 text-emerald-600">
                  <CheckCircle className="w-10 h-10 mx-auto" />
                  <div className="text-base font-bold text-slate-900">
                    ¡Cuenta Google Verificada!
                  </div>
                  <p className="text-xs text-slate-500">
                    Ingresando al Portal CMMS...
                  </p>
                </div>
              )}
            </div>

            {googleStep === 'prompt' && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmGoogleAuthorization}
                  className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SOLICITAR PERMISOS AL ADMINISTRADOR (ALERT TO ADMINS FLOW)
          ========================================================================= */}
      {showRequestAccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            
            <div className="bg-[#00236f] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Solicitud de Permisos de Acceso al CMMS
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Envía una notificación directa a la Dirección de Sistemas TI para tu alta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestAccessModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAccessRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correo Electrónico Solicitante
                </label>
                <input
                  type="email"
                  required
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-xs bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre Completo y Apellidos
                </label>
                <input
                  type="text"
                  required
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Ej. Juan Pérez Quispe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rol Requerido
                  </label>
                  <select
                    value={requestRole}
                    onChange={(e) => setRequestRole(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value="Técnico Especialista">Técnico Especialista</option>
                    <option value="IT Operator">IT Operator Onsite</option>
                    <option value="Jefe de Mantenimiento">Jefe de Mantenimiento</option>
                    <option value="Supervisor Regional">Supervisor Regional</option>
                    <option value="Jefe de Tienda">Jefe de Tienda</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Método de Ingreso
                  </label>
                  <select
                    value={requestProvider}
                    onChange={(e) => setRequestProvider(e.target.value as any)}
                    className="w-full px-2.5 py-2.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value="microsoft">Microsoft 365</option>
                    <option value="google">Cuenta Google</option>
                    <option value="local">Cuenta Local</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo de la Solicitud / Tienda Asignada
                </label>
                <textarea
                  rows={2}
                  value={requestMotive}
                  onChange={(e) => setRequestMotive(e.target.value)}
                  placeholder="Indique tienda, contratista o motivo de la visita/servicio..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
                Al presionar "Enviar Solicitud al Administrador", el sistema creará una alerta en tiempo real para el Ingeniero Director de Mantenimiento (Ing. Roberto León), quien podrá aprobar su alta y credenciales desde su panel.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestAccessModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingRequest}
                  className="px-5 py-2.5 bg-[#00236f] hover:bg-[#1a3882] text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingRequest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando al Administrador...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Solicitud al Administrador</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: AUDITORÍA DE ACCESOS Y REGISTROS
          ========================================================================= */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
            
            <div className="bg-[#00236f] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <History className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Registro de Auditoría de Intentos de Acceso
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Trazabilidad de accesos aprobados, contraseñas fallidas y bloqueos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {loginAuditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No se registran eventos de auditoría en la sesión actual.
                </div>
              ) : (
                loginAuditLogs.map((log) => {
                  const isSuccess = log.status === 'exitoso' || log.status === 'success';
                  const isPasswordWrong = log.status === 'bloqueado_contrasena_incorrecta';
                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        isSuccess
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isPasswordWrong
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                              isSuccess
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPasswordWrong
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isSuccess ? 'Acceso Exitoso' : isPasswordWrong ? 'Clave Incorrecta' : 'Bloqueado'}
                          </span>
                          <span className="font-bold text-slate-800">{log.userName}</span>
                          <span className="font-mono text-slate-500">({log.userEmail || log.email})</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{log.notes || log.reason}</p>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>IP: {log.ipAddress}</span>
                          <span>• {log.timeAgo || log.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-1.5 bg-[#00236f] text-white font-bold rounded-lg text-xs hover:bg-[#1a3882] cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: RECUPERACIÓN DE CONTRASEÑA LOCAL
          ========================================================================= */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00236f]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Recuperación de Credenciales Locales</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Por políticas de seguridad corporativa Falabella/Tottus, las contraseñas locales son administradas por la Dirección de Mantenimiento & TI.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
              <div><strong>Contraseña Estándar de Demostración:</strong></div>
              <div className="font-mono text-sm font-bold text-[#00236f] bg-white p-2 rounded border border-slate-200 inline-block">
                Tottus2026*
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Aplica para todas las cuentas registradas en el Directorio local inicial.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setPassword('Tottus2026*');
                  setShowForgotPasswordModal(false);
                }}
                className="px-4 py-2 bg-[#00236f] text-white font-bold rounded-lg text-xs hover:bg-[#1a3882] cursor-pointer"
              >
                Aplicar Tottus2026* y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
