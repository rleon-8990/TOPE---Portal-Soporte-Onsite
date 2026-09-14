import { AppUser } from '../types';

export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  requiredRoles: string[];
  category: 'operativo' | 'administrativo' | 'gestion';
}

export const APP_MODULES: Record<string, ModulePermission> = {
  dashboard: {
    id: 'dashboard',
    name: 'Panel General / Dashboard',
    description: 'Métricas clave, disponibilidad de tiendas, OTs críticas y resumen nacional.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'gestion'
  },
  inventario: {
    id: 'inventario',
    name: 'Inventario de Activos y Red',
    description: 'Catálogo de POS, switches, servidores, balanzas, IP, MAC y puertos de comunicaciones.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Jefe de Mantenimiento', 'Gerente de Tienda'],
    category: 'operativo'
  },
  mantenimiento: {
    id: 'mantenimiento',
    name: 'Mantenimiento & Órdenes de Trabajo',
    description: 'Programación de preventivos, correctivos, checklist técnico, fotos y firmas digitales.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  monitoreo: {
    id: 'monitoreo',
    name: 'Asistencia & Monitoreo Onsite',
    description: 'Radar de tiendas en vivo, integración GeoVictoria, geocercas GPS y control de cuadrillas.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  informes: {
    id: 'informes',
    name: 'Informes Técnicos',
    description: 'Generación, firma y descarga PDF de informes de servicio técnico en tienda.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  tiendas: {
    id: 'tiendas',
    name: 'Sucursales (90 Tiendas)',
    description: 'Directorio nacional de hipermercados y supermercados Tottus por 5 regiones geográficas.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Jefe de Mantenimiento'],
    category: 'gestion'
  },
  helpdesk: {
    id: 'helpdesk',
    name: 'Helpdesk, Tickets & Repuestos',
    description: 'Gestión de incidencias, solicitudes de repuestos, cotizaciones y pedidos SAP/HES.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  trazabilidad: {
    id: 'trazabilidad',
    name: 'Repuestos, BKP & Trazabilidad',
    description: 'Control de repuestos de proveedores x cotización, stock de contingencia BKP, repuestos de taller interno y auditoría de validación técnica.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  custodia: {
    id: 'custodia',
    name: 'Custodia CCTV & Equipos Móviles',
    description: 'Monitoreo de PDAs e impresoras en tiendas, escaneo ágil con fotocheck, equipos en uso vs. casillero e incidencias Falabella AI-Monitoring.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  visitas: {
    id: 'visitas',
    name: 'Visitas Preventivas (Caminatas)',
    description: 'Auditoría semestral in-situ: caminata técnica por gabinetes, puntos de venta (POS), PDAs, balanzas y CPD con generación de informes y sincronización.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Técnico Especialista', 'IT Operator', 'Gerente de Tienda', 'Jefe de Tienda', 'Jefe de Mantenimiento'],
    category: 'operativo'
  },
  usuarios: {
    id: 'usuarios',
    name: 'Directorio y Agenda Corporativa',
    description: 'Agenda telefónica de tiendas, anexo interno, gerentes, IT operators y cuadrillas de soporte.',
    requiredRoles: ['Administrador', 'Administrador General'],
    category: 'administrativo'
  },
  despachador: {
    id: 'despachador',
    name: 'Despachador Rápido de Correos',
    description: 'Notificaciones masivas, avisos de mantenimiento y circulares operativas mediante Microsoft 365 Exchange.',
    requiredRoles: ['Administrador', 'Administrador General', 'Supervisor Regional', 'Jefe de Mantenimiento', 'IT Operator'],
    category: 'operativo'
  }
};

export interface RoleConfig {
  role: string;
  label: string;
  description: string;
  allowedModules: string[];
  badgeColor: string;
  accessLevel: 'total' | 'supervision' | 'operativo' | 'tienda';
  canManageM365: boolean;
  canManageUsers: boolean;
  canBroadcastAlerts: boolean;
  canManagePrivileges?: boolean; // Capacidad para otorgar o modificar perfiles de privilegios
}

export const DEFAULT_ROLE_CONFIGS: Record<string, RoleConfig> = {
  Administrador: {
    role: 'Administrador',
    label: 'Administrador General',
    description: 'Acceso irrestricto a todos los módulos del portal, sincronización M365 y administración de personal.',
    allowedModules: ['dashboard', 'inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'tiendas', 'helpdesk', 'trazabilidad', 'usuarios', 'despachador'],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accessLevel: 'total',
    canManageM365: true,
    canManageUsers: true,
    canBroadcastAlerts: true,
    canManagePrivileges: true
  },
  'Administrador General': {
    role: 'Administrador General',
    label: 'Administrador General',
    description: 'Acceso irrestricto a todos los módulos del portal, sincronización M365 y administración de personal.',
    allowedModules: ['dashboard', 'inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'tiendas', 'helpdesk', 'trazabilidad', 'usuarios', 'despachador'],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    accessLevel: 'total',
    canManageM365: true,
    canManageUsers: true,
    canBroadcastAlerts: true,
    canManagePrivileges: true
  },
  'Supervisor Regional': {
    role: 'Supervisor Regional',
    label: 'Supervisor Regional',
    description: 'Supervisión de métricas, tiendas asignadas, mantenimiento, informes técnicos, trazabilidad y helpdesk en su región.',
    allowedModules: ['dashboard', 'inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'tiendas', 'helpdesk', 'trazabilidad', 'despachador'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    accessLevel: 'supervision',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: true,
    canManagePrivileges: false
  },
  'Técnico Especialista': {
    role: 'Técnico Especialista',
    label: 'Técnico Especialista Onsite',
    description: 'Ejecución de órdenes de trabajo en tienda, inventario técnico, repuestos, bkp, informes y registro de presencia.',
    allowedModules: ['inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'helpdesk', 'trazabilidad'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    accessLevel: 'operativo',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  },
  'IT Operator': {
    role: 'IT Operator',
    label: 'IT Operator Tienda',
    description: 'Soporte informático en sitio para cajas POS, switches, balanzas, trazabilidad de repuestos y atención de tickets locales.',
    allowedModules: ['inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'helpdesk', 'trazabilidad', 'despachador'],
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    accessLevel: 'operativo',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  },
  'Jefe de Mantenimiento': {
    role: 'Jefe de Mantenimiento',
    label: 'Jefe de Mantenimiento',
    description: 'Gestión técnica de activos de frío, clima, balanzas, stock de repuestos BKP y supervisión de cuadrillas de tienda.',
    allowedModules: ['dashboard', 'inventario', 'mantenimiento', 'custodia', 'visitas', 'monitoreo', 'informes', 'tiendas', 'helpdesk', 'trazabilidad', 'despachador'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    accessLevel: 'supervision',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  },
  'Gerente de Tienda': {
    role: 'Gerente de Tienda',
    label: 'Gerente de Tienda',
    description: 'Visión de estado operativo de su sucursal, presencia de técnicos, trazabilidad de repuestos y reporte de incidencias en Helpdesk.',
    allowedModules: ['dashboard', 'visitas', 'custodia', 'helpdesk', 'trazabilidad', 'monitoreo', 'inventario'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accessLevel: 'tienda',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  },
  'Jefe de Tienda': {
    role: 'Jefe de Tienda',
    label: 'Jefe de Tienda',
    description: 'Visión de estado operativo de su sucursal, presencia de técnicos, trazabilidad de repuestos y reporte de incidencias en Helpdesk.',
    allowedModules: ['dashboard', 'visitas', 'custodia', 'helpdesk', 'trazabilidad', 'monitoreo', 'inventario'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accessLevel: 'tienda',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  }
};

// Aliased export for backwards compatibility
export const ROLE_CONFIGS = DEFAULT_ROLE_CONFIGS;

export const ROLE_CONFIGS_STORAGE_KEY = 'portal_onsite_role_configs_v2';

/**
 * Carga las configuraciones de roles dinámicas persistidas en localStorage
 */
export function getStoredRoleConfigs(): Record<string, RoleConfig> {
  try {
    const raw = localStorage.getItem(ROLE_CONFIGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_ROLE_CONFIGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading role configs from storage', e);
  }
  return DEFAULT_ROLE_CONFIGS;
}

/**
 * Guarda y actualiza la configuración de un perfil de rol en localStorage
 */
export function saveRoleConfig(role: string, updatedConfig: Partial<RoleConfig>): Record<string, RoleConfig> {
  const current = getStoredRoleConfigs();
  const existing = current[role] || DEFAULT_ROLE_CONFIGS[role] || {
    role,
    label: role,
    description: `Perfil de permisos para ${role}`,
    allowedModules: ['dashboard', 'helpdesk', 'monitoreo'],
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    accessLevel: 'operativo',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  };

  const updated: RoleConfig = {
    ...existing,
    ...updatedConfig,
    role
  };

  const newConfigs = {
    ...current,
    [role]: updated
  };

  try {
    localStorage.setItem(ROLE_CONFIGS_STORAGE_KEY, JSON.stringify(newConfigs));
  } catch (e) {
    console.warn('Error saving role configs', e);
  }

  return newConfigs;
}

/**
 * Restablece todas las configuraciones de roles a los valores por defecto
 */
export function resetRoleConfigsToDefault(): Record<string, RoleConfig> {
  try {
    localStorage.removeItem(ROLE_CONFIGS_STORAGE_KEY);
  } catch (e) {}
  return DEFAULT_ROLE_CONFIGS;
}

/**
 * Normaliza un rol para obtener su configuración RBAC (lee configuraciones dinámicas)
 */
export function getRoleConfig(role: string): RoleConfig {
  const allConfigs = getStoredRoleConfigs();
  if (allConfigs[role]) {
    return allConfigs[role];
  }
  
  // Coincidencias aproximadas
  const lower = role.toLowerCase();
  if (lower.includes('admin') || lower.includes('director')) {
    return allConfigs['Administrador General'] || allConfigs['Administrador'] || DEFAULT_ROLE_CONFIGS['Administrador'];
  }
  if (lower.includes('supervisor') || lower.includes('regional')) {
    return allConfigs['Supervisor Regional'] || DEFAULT_ROLE_CONFIGS['Supervisor Regional'];
  }
  if (lower.includes('gerente') || lower.includes('subgerente')) {
    return allConfigs['Gerente de Tienda'] || DEFAULT_ROLE_CONFIGS['Gerente de Tienda'];
  }
  if (lower.includes('jefe de mantenimiento')) {
    return allConfigs['Jefe de Mantenimiento'] || DEFAULT_ROLE_CONFIGS['Jefe de Mantenimiento'];
  }
  if (lower.includes('jefe')) {
    return allConfigs['Jefe de Tienda'] || DEFAULT_ROLE_CONFIGS['Jefe de Tienda'];
  }
  if (lower.includes('operator') || lower.includes('it')) {
    return allConfigs['IT Operator'] || DEFAULT_ROLE_CONFIGS['IT Operator'];
  }
  if (lower.includes('téc') || lower.includes('especialista') || lower.includes('ingeniero')) {
    return allConfigs['Técnico Especialista'] || DEFAULT_ROLE_CONFIGS['Técnico Especialista'];
  }

  // Fallback por defecto seguro
  return {
    role,
    label: role,
    description: 'Acceso estándar para personal de soporte y tienda.',
    allowedModules: ['dashboard', 'helpdesk', 'monitoreo'],
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    accessLevel: 'tienda',
    canManageM365: false,
    canManageUsers: false,
    canBroadcastAlerts: false,
    canManagePrivileges: false
  };
}

/**
 * Determina si un usuario tiene autorización para administrar privilegios y roles
 */
export function canUserManagePrivileges(user?: AppUser | null): boolean {
  if (!user) return false;
  
  // La cuenta 'admin' root o con username 'admin' tiene autoridad master
  if (
    user.username === 'admin' ||
    user.email.toLowerCase() === 'admin@tottus.com.pe' ||
    user.email.toLowerCase().startsWith('admin@') ||
    user.id === 'usr-admin-master' ||
    user.id === 'usr-root-admin'
  ) {
    return true;
  }

  // Cuenta autorizada rleon@tottus.com.pe
  if (user.email.toLowerCase().includes('rleon')) {
    return true;
  }

  // Flag explícito de delegación en usuario
  if (user.canManagePrivileges === true) {
    return true;
  }

  // Por rol configurado
  const config = getRoleConfig(user.role);
  if (config.canManagePrivileges === true) {
    return true;
  }

  return false;
}

/**
 * Verifica si un rol o usuario específico tiene permiso para acceder a una vista/página
 */
export function hasPageAccess(
  roleOrUser: string | AppUser | null | undefined,
  viewId: string,
  maybeUser?: AppUser | null
): boolean {
  let user: AppUser | null | undefined = maybeUser;
  let role = '';

  if (typeof roleOrUser === 'object' && roleOrUser !== null) {
    user = roleOrUser;
    role = user.role || '';
  } else if (typeof roleOrUser === 'string') {
    role = roleOrUser;
  }

  // Si no se pasó usuario explícito, intentar resolver desde sesión si coincide el rol
  if (!user && typeof window !== 'undefined') {
    try {
      const savedUserStr = localStorage.getItem('reliant_cmms_current_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && (parsed.role === role || !role)) {
          user = parsed;
        }
      }
    } catch (e) {}
  }

  if (user) {
    // Cuenta admin root o admin master tiene acceso irrestricto universal
    if (
      user.username === 'admin' ||
      user.email.toLowerCase() === 'admin@tottus.com.pe' ||
      user.email.toLowerCase().startsWith('admin@') ||
      user.id === 'usr-admin-master' ||
      user.id === 'usr-root-admin'
    ) {
      return true;
    }

    // Cuenta autorizada rleon
    if (user.email.toLowerCase().includes('rleon')) {
      return true;
    }

    // Si tiene lista personalizada de módulos en el usuario
    if (user.allowedModules && user.allowedModules.length > 0) {
      return user.allowedModules.includes(viewId);
    }
  }

  const config = getRoleConfig(role);
  return config.allowedModules.includes(viewId);
}

/**
 * Retorna la lista de módulos accesibles para un rol
 */
export function getAllowedModulesForRole(role: string): string[] {
  const config = getRoleConfig(role);
  return config.allowedModules;
}

/**
 * Retorna los módulos efectivos a los que tiene acceso un usuario específico
 */
export function getUserAllowedModules(user: AppUser): string[] {
  if (
    user.username === 'admin' ||
    user.email.toLowerCase() === 'admin@tottus.com.pe' ||
    user.id === 'usr-admin-master'
  ) {
    return Object.keys(APP_MODULES);
  }

  if (user.allowedModules && user.allowedModules.length > 0) {
    return user.allowedModules;
  }
  return getAllowedModulesForRole(user.role);
}

/**
 * Determina si un usuario tiene permisos de edición (puede hacer cambios) o solo lectura
 */
export function canUserEdit(user?: AppUser | null): boolean {
  if (!user) return false;
  
  // Si tiene flag explícito de edición
  if (user.canEdit !== undefined) {
    return user.canEdit;
  }
  
  // Si tiene accessType definido
  if (user.accessType === 'lectura') return false;
  if (user.accessType === 'escritura') return true;

  // Por rol: Auditor / Consulta son solo lectura
  const lowerRole = (user.role || '').toLowerCase();
  if (lowerRole.includes('auditor') || lowerRole.includes('consulta') || lowerRole.includes('solo lectura')) {
    return false;
  }

  // Roles operativos y de administración pueden hacer cambios
  return true;
}

/**
 * Verifica si un usuario puede ver un módulo determinado
 */
export function hasUserModuleAccess(user: AppUser, moduleKey: string): boolean {
  const modules = getUserAllowedModules(user);
  return modules.includes(moduleKey);
}

/**
 * Obtiene la página de inicio por defecto para un rol
 */
export function getDefaultViewForRole(role: string): string {
  const allowed = getAllowedModulesForRole(role);
  if (allowed.includes('dashboard')) return 'dashboard';
  if (allowed.includes('mantenimiento')) return 'mantenimiento';
  if (allowed.includes('inventario')) return 'inventario';
  if (allowed.includes('monitoreo')) return 'monitoreo';
  return allowed[0] || 'dashboard';
}

/**
 * Verifica si el correo corresponde a un dominio corporativo admitido
 */
export function isCorporateEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  const validDomains = [
    'tottus.com.pe',
    'falabella.com',
    'falabella.cl',
    'falabella.com.pe',
    'sodimac.com.pe',
    'reliant-cmms.pe',
    'microsoft.com'
  ];
  return validDomains.some(vd => domain === vd || domain.endsWith('.' + vd));
}

export const AVAILABLE_ROLES: string[] = [
  'Administrador',
  'Administrador General',
  'Supervisor Regional',
  'IT Operator',
  'Jefe de Mantenimiento',
  'Gerente de Tienda',
  'Jefe de Tienda',
  'Técnico Especialista',
  'Técnico de Campo',
  'Auditor / Consulta'
];
