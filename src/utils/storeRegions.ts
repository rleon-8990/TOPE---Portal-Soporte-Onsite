import { Store } from '../types';

export interface DepartmentInfo {
  id: string; // e.g. 'lima', 'arequipa', 'lambayeque', 'la_libertad', 'ica', 'piura'
  name: string; // e.g. 'Lima y Callao', 'Arequipa', 'Chiclayo (Lambayeque)', 'Trujillo (La Libertad)'
  shortName: string; // e.g. 'Lima', 'Arequipa', 'Chiclayo', 'Trujillo', 'Ica', 'Piura'
  regionName: string; // Macro-región política
  lat: number;
  lng: number;
  zoom: number;
  badgeColor?: string;
}

export const PERU_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'lima',
    name: 'Lima y Callao',
    shortName: 'Lima & Callao',
    regionName: 'Lima y Callao',
    lat: -12.046374,
    lng: -77.042793,
    zoom: 11,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'arequipa',
    name: 'Arequipa',
    shortName: 'Arequipa',
    regionName: 'Zona Sur',
    lat: -16.409047,
    lng: -71.537451,
    zoom: 12,
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300'
  },
  {
    id: 'lambayeque',
    name: 'Chiclayo (Lambayeque)',
    shortName: 'Chiclayo',
    regionName: 'Zona Norte',
    lat: -6.771370,
    lng: -79.840880,
    zoom: 12,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'la_libertad',
    name: 'Trujillo (La Libertad)',
    shortName: 'Trujillo',
    regionName: 'Zona Norte',
    lat: -8.111678,
    lng: -79.028774,
    zoom: 12,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'ica',
    name: 'Ica (Ica / Chincha / Pisco)',
    shortName: 'Ica',
    regionName: 'Zona Sur',
    lat: -14.067770,
    lng: -75.728610,
    zoom: 11,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'piura',
    name: 'Piura (Piura / Sullana / Talara)',
    shortName: 'Piura',
    regionName: 'Zona Norte',
    lat: -5.194490,
    lng: -80.632820,
    zoom: 11,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'junin',
    name: 'Huancayo (Junín)',
    shortName: 'Huancayo',
    regionName: 'Zona Centro',
    lat: -12.065130,
    lng: -75.204860,
    zoom: 12,
    badgeColor: 'bg-green-100 text-green-800 border-green-300'
  },
  {
    id: 'cusco',
    name: 'Cusco',
    shortName: 'Cusco',
    regionName: 'Zona Sur',
    lat: -13.531950,
    lng: -71.967462,
    zoom: 12,
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300'
  },
  {
    id: 'ancash',
    name: 'Chimbote (Áncash)',
    shortName: 'Chimbote',
    regionName: 'Zona Norte',
    lat: -9.074400,
    lng: -78.593600,
    zoom: 12,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'ucayali',
    name: 'Pucallpa (Ucayali)',
    shortName: 'Pucallpa',
    regionName: 'Zona Oriente',
    lat: -8.379150,
    lng: -74.553870,
    zoom: 12,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'cajamarca',
    name: 'Cajamarca',
    shortName: 'Cajamarca',
    regionName: 'Zona Norte',
    lat: -7.163780,
    lng: -78.500270,
    zoom: 12,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'tacna',
    name: 'Tacna',
    shortName: 'Tacna',
    regionName: 'Zona Sur',
    lat: -18.006567,
    lng: -70.246274,
    zoom: 12,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'huanuco',
    name: 'Huánuco',
    shortName: 'Huánuco',
    regionName: 'Zona Centro',
    lat: -9.930620,
    lng: -76.242230,
    zoom: 12,
    badgeColor: 'bg-green-100 text-green-800 border-green-300'
  }
];

// Helper to determine the department/region key for any store
export function getStoreDepartmentKey(store: Store | any): string {
  const dep = (store.departamento || '').toLowerCase();
  const prov = (store.provincia || '').toLowerCase();
  const dist = (store.distrito || '').toLowerCase();
  const city = (store.city || '').toLowerCase();
  const name = (store.name || '').toLowerCase();
  const dir = (store.direccion || store.address || '').toLowerCase();
  const combined = `${dep} ${prov} ${dist} ${city} ${name} ${dir}`;

  if (combined.includes('arequipa') || combined.includes('porongoche') || combined.includes('cayma') || combined.includes('hunter')) {
    return 'arequipa';
  }
  if (combined.includes('chiclayo') || combined.includes('lambayeque') || combined.includes('moshoqueque') || combined.includes('ferreñafe')) {
    return 'lambayeque';
  }
  if (combined.includes('trujillo') || combined.includes('la libertad') || combined.includes('porvenir') || combined.includes('huamachuco')) {
    return 'la_libertad';
  }
  if (combined.includes('ica') || combined.includes('chincha') || combined.includes('pisco') || combined.includes('nazca')) {
    return 'ica';
  }
  if (combined.includes('piura') || combined.includes('sullana') || combined.includes('talara') || combined.includes('paita') || combined.includes('catacaos')) {
    return 'piura';
  }
  if (combined.includes('huancayo') || combined.includes('junin') || combined.includes('junín') || combined.includes('el tambo') || combined.includes('tarma')) {
    return 'junin';
  }
  if (combined.includes('cusco') || combined.includes('cuzco') || combined.includes('san jerónimo')) {
    return 'cusco';
  }
  if (combined.includes('chimbote') || combined.includes('ancash') || combined.includes('áncash')) {
    return 'ancash';
  }
  if (combined.includes('pucallpa') || combined.includes('ucayali')) {
    return 'ucayali';
  }
  if (combined.includes('cajamarca') || combined.includes('jaen') || combined.includes('jaén')) {
    return 'cajamarca';
  }
  if (combined.includes('tacna')) {
    return 'tacna';
  }
  if (combined.includes('huanuco') || combined.includes('huánuco')) {
    return 'huanuco';
  }

  // Por defecto Lima y Callao
  return 'lima';
}

// Get readable department name for a store
export function getStoreDepartmentName(store: Store | any): string {
  const key = getStoreDepartmentKey(store);
  const found = PERU_DEPARTMENTS.find(d => d.id === key);
  return found ? found.name : 'Lima y Callao';
}

// Group stores by department
export function groupStoresByDepartment(stores: Store[]): { department: DepartmentInfo; stores: Store[]; operationalRate: number }[] {
  return PERU_DEPARTMENTS.map(dept => {
    const matchedStores = stores.filter(s => getStoreDepartmentKey(s) === dept.id);
    const avgRate = matchedStores.length > 0
      ? matchedStores.reduce((acc, s) => acc + (s.operationalRate || 98), 0) / matchedStores.length
      : 100;

    return {
      department: dept,
      stores: matchedStores,
      operationalRate: +avgRate.toFixed(1)
    };
  }).filter(group => group.stores.length > 0);
}
