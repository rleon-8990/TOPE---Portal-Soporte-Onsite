import { AppUser, Store } from '../types';

export interface ResolvedItOperator {
  name: string;
  isRegistered: boolean;
  matchedUser: AppUser | null;
  displayStatus: 'asignado' | 'por_definir';
  roleOrCargo?: string;
  contactPhone?: string;
  contactEmail?: string;
}

/**
 * Obtiene la lista de especialistas técnicos y operadores IT registrados en el Directorio
 */
export function getRegisteredItSpecialists(users: AppUser[]): AppUser[] {
  if (!users || users.length === 0) return [];

  // Palabras clave de roles técnicos y de soporte IT
  const itKeywords = [
    'it operator',
    'operador',
    'especialista',
    'técnico',
    'tecnico',
    'soporte',
    'sistemas',
    'redes',
    'infraestructura',
    'administrador',
    'supervisor'
  ];

  return users
    .filter(u => {
      // Excluir usuarios inhabilitados
      if (u.webAccessEnabled === false || (u.name && u.name.includes('(Inhabilitado)'))) {
        return false;
      }

      const roleStr = (u.role || '').toLowerCase();
      const cargoStr = (u.cargo || '').toLowerCase();
      const specialtyStr = (u.specialty || '').toLowerCase();

      // Es especialista formal o tiene cargo/rol de soporte/IT
      return (
        u.userType === 'especialista' ||
        itKeywords.some(kw => roleStr.includes(kw) || cargoStr.includes(kw) || specialtyStr.includes(kw))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Valida y relaciona el encargado de TI de una tienda con el Directorio de Especialistas.
 * Si no está asignado o no se encuentra registrado en el Directorio, retorna 'Por definir'.
 */
export function resolveStoreItOperator(
  itOperatorName: string | undefined | null,
  users: AppUser[] = []
): ResolvedItOperator {
  const raw = (itOperatorName || '').trim();

  // Casos vacíos o no asignados
  if (
    !raw ||
    raw.toLowerCase() === 'sin asignar' ||
    raw.toLowerCase() === 'no asignado' ||
    raw.toLowerCase() === 'por definir' ||
    raw === '-'
  ) {
    return {
      name: 'Por definir',
      isRegistered: false,
      matchedUser: null,
      displayStatus: 'por_definir'
    };
  }

  const rawLower = raw.toLowerCase();

  // Buscar coincidencia en Directorio por:
  // 1. Coincidencia exacta de nombre
  // 2. Coincidencia de ID de usuario
  // 3. Coincidencia parcial de nombre (ej. "Roger Leon" vs "Roger Leon Apolinario" o "Adrian Lipa")
  const matched = users.find(u => {
    if (u.id.toLowerCase() === rawLower) return true;
    const userNameLower = u.name.toLowerCase().trim();
    if (userNameLower === rawLower) return true;
    if (userNameLower.startsWith(rawLower) || rawLower.startsWith(userNameLower)) return true;
    
    // Coincidencia con palabras clave (primer nombre + primer apellido)
    const rawTokens = rawLower.split(/\s+/);
    const userTokens = userNameLower.split(/\s+/);
    if (rawTokens.length >= 2 && userTokens.length >= 2) {
      if (rawTokens[0] === userTokens[0] && rawTokens[1] === userTokens[1]) return true;
    }
    return false;
  });

  if (matched && matched.webAccessEnabled !== false) {
    return {
      name: matched.name,
      isRegistered: true,
      matchedUser: matched,
      displayStatus: 'asignado',
      roleOrCargo: matched.cargo || matched.role || matched.specialty || 'Especialista IT',
      contactPhone: matched.phone,
      contactEmail: matched.email
    };
  }

  // Si no está registrado en el Directorio oficial
  return {
    name: 'Por definir',
    isRegistered: false,
    matchedUser: null,
    displayStatus: 'por_definir'
  };
}
