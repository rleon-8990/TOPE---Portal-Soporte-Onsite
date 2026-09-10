import { LoginAuditRecord } from '../types';

export const INITIAL_LOGIN_AUDIT_LOGS: LoginAuditRecord[] = [
  {
    id: 'log-audit-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    timeAgo: 'Hace 12 min',
    userEmail: 'rleon@tottus.com.pe',
    userName: 'Raul Leon',
    role: 'Administrador',
    status: 'exitoso',
    ipAddress: '10.24.180.45 [Red Corporativa]',
    deviceInfo: 'Chrome 128.0 · Windows 11 Enterprise',
    locationOrStore: 'Sede Central San Isidro - Piso 8',
    notes: 'Inicio de sesión SSO Microsoft Entra ID exitoso'
  },
  {
    id: 'log-audit-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeAgo: 'Hace 45 min',
    userEmail: 'rleon@tottus.com.pe',
    userName: 'Raul Leon (Sesión Concurrente)',
    role: 'Administrador',
    status: 'exitoso',
    ipAddress: '190.237.45.12 [Acceso Remoto / VPN]',
    deviceInfo: 'Safari Mobile 17.5 · Apple iPhone 15',
    locationOrStore: 'Acceso Externo / Red Móvil',
    notes: 'Alerta: Conexión simultánea detectada con la cuenta rleon@'
  },
  {
    id: 'log-audit-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    timeAgo: 'Hace 1h 35m',
    userEmail: 'rleon.ti@tottus.com.pe',
    userName: 'Raul Leon Apolinario',
    role: 'Técnico Especialista',
    status: 'exitoso',
    ipAddress: '10.24.103.15 [LAN Tienda]',
    deviceInfo: 'Edge 126.0 · ThinkPad L14 Windows 10',
    locationOrStore: 'Tottus Megaplaza (T-103)',
    notes: 'Autenticación en sitio - Terminal Soporte Onsite'
  },
  {
    id: 'log-audit-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    timeAgo: 'Hace 3h',
    userEmail: 'carlos.mendoza@tottus.com.pe',
    userName: 'Carlos Mendoza',
    role: 'Supervisor Regional',
    status: 'exitoso',
    ipAddress: '10.24.105.12 [LAN Tienda]',
    deviceInfo: 'Chrome 127.0 · MacBook Pro macOS Sonoma',
    locationOrStore: 'Tottus Las Begonias (T-105)',
    notes: 'Supervisión regional de tienda'
  },
  {
    id: 'log-audit-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    timeAgo: 'Hace 4h',
    userEmail: 'pedro.inactivo@tottus.com.pe',
    userName: 'Pedro Deshabilitado',
    role: 'IT Operator (Inhabilitado)',
    status: 'bloqueado_inhabilitado',
    ipAddress: '190.187.22.90 [Red Pública]',
    deviceInfo: 'Chrome 127.0 · Windows 10',
    locationOrStore: 'Desconocida',
    notes: 'Bloqueado: El usuario tiene el switch de Acceso Web apagado en Directorio'
  },
  {
    id: 'log-audit-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    timeAgo: 'Hace 5h 20m',
    userEmail: 'desconocido.externo@gmail.com',
    userName: 'Usuario No Identificado',
    role: 'Sin Rol',
    status: 'bloqueado_no_en_directorio',
    ipAddress: '181.65.14.88 [Red Pública]',
    deviceInfo: 'Firefox 129.0 · Ubuntu Linux',
    locationOrStore: 'Exterior',
    notes: 'Bloqueado: El correo no existe en el Directorio Corporativo de Sistemas'
  }
];
