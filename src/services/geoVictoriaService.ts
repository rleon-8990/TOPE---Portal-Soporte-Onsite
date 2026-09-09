import {
  GeoVictoriaConfig,
  GeoVictoriaPunchRecord,
  AttendanceLog,
  ActivePersonnelPresence,
  AppUser,
  Store
} from '../types';

export const GEOVICTORIA_STORAGE_CONFIG_KEY = 'reliant_cmms_geovictoria_config';
export const GEOVICTORIA_STORAGE_PUNCHES_KEY = 'reliant_cmms_geovictoria_punches';

export const DEFAULT_GEOVICTORIA_CONFIG: GeoVictoriaConfig = {
  enabled: true,
  apiUrl: 'https://api.geovictoria.com/v1/punches',
  apiKey: 'gv_live_tottus_pe_99812x84',
  apiSecret: 'sec_corp_fala_cmms_8716391209',
  companyCode: 'TOTTUS_PERU_OPERACIONES',
  autoSyncIntervalMinutes: 5,
  webhookEndpoint: 'https://cmms.tottus.com.pe/api/webhooks/geovictoria/punch',
  webhookSecret: 'whsec_tottus_gv_live_2026',
  autoCheckInOnPunch: true,
  lastSyncTimestamp: new Date().toISOString(),
  lastSyncStatus: 'connected',
  lastSyncMessage: 'Conexión activa con Cloud GeoVictoria (Webhooks & API v1)',
  syncedTodayCount: 14
};

export const INITIAL_GEOVICTORIA_PUNCHES: GeoVictoriaPunchRecord[] = [
  {
    id: 'gv-p-9901',
    rutDni: '44892110',
    colaboradorNombre: 'Roger Leon Apolinario',
    colaboradorId: 'usr-001',
    fechaHora: '2026-09-09T08:15:22',
    horaFormato: '08:15 AM',
    tipo: 'ENTRADA',
    dispositivo: 'Bio Facial Tottus Angamas #01 (ZKTeco ProFace)',
    metodo: 'reconocimiento_facial',
    codTienda: 103,
    nombreTienda: 'Megaplaza Angamas',
    latitud: -11.99360537,
    longitud: -77.0620619,
    estado: 'sincronizado',
    cmmsLogId: 'att-log-001'
  },
  {
    id: 'gv-p-9902',
    rutDni: '41992014',
    colaboradorNombre: 'Erick Chavez',
    colaboradorId: 'usr-store-109-2',
    fechaHora: '2026-09-09T08:30:10',
    horaFormato: '08:30 AM',
    tipo: 'ENTRADA',
    dispositivo: 'Reloj Biométrico Huella Tottus San Miguel',
    metodo: 'huella_dactilar',
    codTienda: 109,
    nombreTienda: 'San Miguel',
    latitud: -12.077651,
    longitud: -77.085814,
    estado: 'sincronizado'
  },
  {
    id: 'gv-p-9903',
    rutDni: '43872190',
    colaboradorNombre: 'Segundo Quispe',
    colaboradorId: 'usr-002',
    fechaHora: '2026-09-09T09:00:45',
    horaFormato: '09:00 AM',
    tipo: 'ENTRADA',
    dispositivo: 'GeoVictoria Móvil (App Android - GPS Geocerca 82m)',
    metodo: 'app_geocerca',
    codTienda: 110,
    nombreTienda: 'Bellavista',
    latitud: -12.057791,
    longitud: -77.113063,
    estado: 'sincronizado'
  },
  {
    id: 'gv-p-9904',
    rutDni: '40781299',
    colaboradorNombre: 'Manuel Huaman',
    colaboradorId: 'usr-store-316-2',
    fechaHora: '2026-09-09T08:45:00',
    horaFormato: '08:45 AM',
    tipo: 'ENTRADA',
    dispositivo: 'Bio Facial Tottus Porongoche Arequipa',
    metodo: 'reconocimiento_facial',
    codTienda: 316,
    nombreTienda: 'Porongoche (Arequipa)',
    latitud: -16.4251,
    longitud: -71.5186,
    estado: 'sincronizado'
  },
  {
    id: 'gv-p-9905',
    rutDni: '42901844',
    colaboradorNombre: 'Luis Benites',
    colaboradorId: 'usr-store-338-2',
    fechaHora: '2026-09-09T08:50:18',
    horaFormato: '08:50 AM',
    tipo: 'ENTRADA',
    dispositivo: 'Reloj Biométrico Huella Mall Plaza Trujillo',
    metodo: 'huella_dactilar',
    codTienda: 338,
    nombreTienda: 'Mall Plaza Trujillo',
    latitud: -8.1065,
    longitud: -79.0438,
    estado: 'sincronizado'
  }
];

export function getGeoVictoriaConfig(): GeoVictoriaConfig {
  try {
    const saved = localStorage.getItem(GEOVICTORIA_STORAGE_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_GEOVICTORIA_CONFIG;
}

export function saveGeoVictoriaConfig(config: GeoVictoriaConfig): void {
  try {
    localStorage.setItem(GEOVICTORIA_STORAGE_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getGeoVictoriaPunches(): GeoVictoriaPunchRecord[] {
  try {
    const saved = localStorage.getItem(GEOVICTORIA_STORAGE_PUNCHES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return INITIAL_GEOVICTORIA_PUNCHES;
}

export function saveGeoVictoriaPunches(punches: GeoVictoriaPunchRecord[]): void {
  try {
    localStorage.setItem(GEOVICTORIA_STORAGE_PUNCHES_KEY, JSON.stringify(punches));
  } catch (e) {}
}

/**
 * Convierte una marcación de GeoVictoria en un registro de asistencia AttendanceLog
 */
export function convertPunchToAttendanceLog(
  punch: GeoVictoriaPunchRecord,
  matchedUser?: AppUser,
  matchedStore?: Store
): Partial<AttendanceLog> {
  const sourceMethod =
    punch.metodo === 'reconocimiento_facial'
      ? 'geovictoria_facial'
      : punch.metodo === 'huella_dactilar'
      ? 'geovictoria_huella'
      : 'geovictoria_app';

  const dateStr = punch.fechaHora.split('T')[0];
  const timeStr = punch.horaFormato;

  return {
    userId: matchedUser?.id || punch.colaboradorId || 'usr-external',
    userName: matchedUser?.name || punch.colaboradorNombre,
    userRole: matchedUser?.role || 'Técnico Especialista',
    userCargo: matchedUser?.cargo || 'Personal Onsite',
    userPhone: matchedUser?.phone || '+51 999 000 000',
    userAvatar: matchedUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    eventType: punch.tipo === 'ENTRADA' ? 'ingreso' : 'salida',
    storeId: matchedStore?.id || `store-${punch.codTienda}`,
    storeCode: matchedStore?.code || `T-${punch.codTienda}`,
    storeName: matchedStore?.name || punch.nombreTienda,
    storeRegion: matchedStore?.region || 'Lima y Callao',
    timestamp: punch.fechaHora,
    timeFormatted: timeStr,
    dateFormatted: dateStr,
    motive: 'soporte_onsite',
    motiveDetail: `Marcación GeoVictoria vía ${punch.dispositivo}`,
    notes: `Sincronización automática de marcación [${punch.tipo}] validada con ${punch.metodo.replace('_', ' ')}. Dispositivo: ${punch.dispositivo}`,
    verifiedLocation: true,
    registeredBy: 'GeoVictoria Cloud Integration',
    source: sourceMethod,
    sourceDetail: `${punch.dispositivo}`,
    geoVictoriaPunchId: punch.id,
    coordinates: punch.latitud && punch.longitud ? {
      lat: punch.latitud,
      lng: punch.longitud,
      accuracy: 10
    } : undefined
  };
}
