import {
  GeoVictoriaDailyReportRow,
  GeoVictoriaPunchRow,
  GeoVictoriaReconciliationItem,
  AppUser,
  Store,
  AttendanceLog,
  ActivePersonnelPresence,
  PreventiveVisit
} from '../types';

export const GEOVICTORIA_DAILY_STORAGE_KEY = 'reliant_cmms_geovictoria_daily_reports';
export const GEOVICTORIA_PUNCHES_STORAGE_KEY = 'reliant_cmms_geovictoria_punches_report';

/**
 * Datos reales extraídos directamente de las planillas descargadas de GeoVictoria (Foto 1: Turnos y Atrasos)
 */
export const INITIAL_GEOVICTORIA_DAILY_REPORTS: GeoVictoriaDailyReportRow[] = [
  {
    id: 'gv-d-1',
    apellidos: 'Bravo Aramburu',
    nombre: 'Jose Toribio',
    identificado: '43346716',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '',
    atraso: '00:00',
    salio: '',
    ht: '00:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-2',
    apellidos: 'Bravo Aramburu',
    nombre: 'Jose Toribio',
    identificado: '43346716',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '07:00 M',
    atraso: '00:00',
    salio: '16:14',
    ht: '08:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-3',
    apellidos: 'Fernandez Mollo',
    nombre: 'Cesar Luigi',
    identificado: '44496435',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '07:02',
    atraso: '00:00',
    salio: '16:27',
    ht: '08:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-4',
    apellidos: 'Fernandez Mollo',
    nombre: 'Cesar Luigi',
    identificado: '44496435',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '06:49',
    atraso: '00:00',
    salio: '16:36',
    ht: '08:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-5',
    apellidos: 'Garcia Cueva',
    nombre: 'Luis Felipe',
    identificado: '42028524',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '10:00 - 19:00(13:00-14:00)',
    entro: '',
    atraso: '00:00',
    salio: '',
    ht: '00:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-6',
    apellidos: 'Garcia Cueva',
    nombre: 'Luis Felipe',
    identificado: '42028524',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '08:00 - 17:00(12:00-13:00)',
    entro: '07:53',
    atraso: '00:00',
    salio: '16:57',
    ht: '07:57',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-7',
    apellidos: 'Leon Apeña',
    nombre: 'Raul Rogger',
    identificado: '47250188',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '',
    atraso: '00:00',
    salio: '',
    ht: '00:00',
    cargo: 'PECARGTOT000290 - It Support'
  },
  {
    id: 'gv-d-8',
    apellidos: 'Leon Apeña',
    nombre: 'Raul Rogger',
    identificado: '47250188',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '07:00 - 16:00(13:00-14:00)',
    entro: '07:00 M',
    atraso: '00:00',
    salio: '16:00 M',
    ht: '08:00',
    cargo: 'PECARGTOT000290 - It Support'
  },
  {
    id: 'gv-d-9',
    apellidos: 'Lipa Aspilcueta',
    nombre: 'Adrian Anderson',
    identificado: '76529318',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '08:00 - 17:00(13:00-14:00)',
    entro: '08:06',
    atraso: '00:06',
    salio: '17:12',
    ht: '07:54',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-10',
    apellidos: 'Lipa Aspilcueta',
    nombre: 'Adrian Anderson',
    identificado: '76529318',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '08:00 - 17:00(13:00-14:00)',
    entro: '08:22',
    atraso: '00:22',
    salio: '17:00 M',
    ht: '07:38',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-11',
    apellidos: 'Paz Carranza',
    nombre: 'Jim Ivan',
    identificado: '42846315',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '09:00 - 18:00(13:00-14:00)',
    entro: '',
    atraso: '00:00',
    salio: '',
    ht: '00:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-12',
    apellidos: 'Paz Carranza',
    nombre: 'Jim Ivan',
    identificado: '42846315',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '09:00 - 18:00(13:00-14:00)',
    entro: '09:42',
    atraso: '00:42',
    salio: '18:39',
    ht: '07:18',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-13',
    apellidos: 'SERVELEON CERON',
    nombre: 'JUAN HAROLD',
    identificado: '70547835',
    grupo: 'Sistemas Perú',
    fecha: 'Mar 28-07-2026 (F)',
    permiso: 'Ninguno',
    turno: '08:00 - 17:00(13:00-14:00)',
    entro: '',
    atraso: '00:00',
    salio: '',
    ht: '00:00',
    cargo: 'PECARGTOT000287 - It Operator'
  },
  {
    id: 'gv-d-14',
    apellidos: 'SERVELEON CERON',
    nombre: 'JUAN HAROLD',
    identificado: '70547835',
    grupo: 'Sistemas Perú',
    fecha: 'Jue 30-07-2026',
    permiso: 'Ninguno',
    turno: '08:00 - 17:00(13:00-14:00)',
    entro: '08:17',
    atraso: '00:17',
    salio: '16:58',
    ht: '07:41',
    cargo: 'PECARGTOT000287 - It Operator'
  }
];

/**
 * Datos reales extraídos directamente de las planillas descargadas de GeoVictoria (Foto 2: Marcaciones Detalladas en Relojes)
 */
export const INITIAL_GEOVICTORIA_PUNCHES: GeoVictoriaPunchRow[] = [
  {
    id: 'gv-p-1',
    apellidos: 'Fernandez Mollo',
    nombre: 'Cesar Luigi',
    rut: '44496435',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 06:52:59',
    tipo: 'Ingreso',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA AQP CAYMA',
    relojControl: 'HHF2244400113'
  },
  {
    id: 'gv-p-2',
    apellidos: 'Fernandez Mollo',
    nombre: 'Cesar Luigi',
    rut: '44496435',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 16:23:41',
    tipo: 'Salida',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA AQP CAYMA',
    relojControl: 'HHF2244400113'
  },
  {
    id: 'gv-p-3',
    apellidos: 'Garcia Cueva',
    nombre: 'Luis Felipe',
    rut: '42028524',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 08:06:53',
    tipo: 'Ingreso',
    metodoMarca: 'Marca Web',
    nombreReloj: 'Marca Web - Portal Empleado',
    relojControl: 'WEB-SISTEMAS'
  },
  {
    id: 'gv-p-4',
    apellidos: 'Garcia Cueva',
    nombre: 'Luis Felipe',
    rut: '42028524',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 17:06:57',
    tipo: 'Salida',
    metodoMarca: 'Marca Web',
    nombreReloj: 'Marca Web - Portal Empleado',
    relojControl: 'WEB-SISTEMAS'
  },
  {
    id: 'gv-p-5',
    apellidos: 'Lipa Aspilcueta',
    nombre: 'Adrian Anderson',
    rut: '76529318',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 08:26:17',
    tipo: 'Ingreso',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA PROCERES',
    relojControl: 'HHF2244400134'
  },
  {
    id: 'gv-p-6',
    apellidos: 'Lipa Aspilcueta',
    nombre: 'Adrian Anderson',
    rut: '76529318',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 16:58:32',
    tipo: 'Salida',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA PROCERES',
    relojControl: 'HHF2244400134'
  },
  {
    id: 'gv-p-7',
    apellidos: 'Paz Carranza',
    nombre: 'Jim Ivan',
    rut: '42846315',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 10:01:51',
    tipo: 'Ingreso',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA TRUJILLO (1)',
    relojControl: 'HHF2244400103'
  },
  {
    id: 'gv-p-8',
    apellidos: 'Paz Carranza',
    nombre: 'Jim Ivan',
    rut: '42846315',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 18:46:50',
    tipo: 'Salida',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - TIENDA TRUJILLO (1)',
    relojControl: 'HHF2244400103'
  },
  {
    id: 'gv-p-9',
    apellidos: 'SERVELEON CERON',
    nombre: 'JUAN HAROLD',
    rut: '70547835',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 08:09:39',
    tipo: 'Ingreso',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - BODEGA ICA PANAMERICANA',
    relojControl: 'HHF2244400110'
  },
  {
    id: 'gv-p-10',
    apellidos: 'SERVELEON CERON',
    nombre: 'JUAN HAROLD',
    rut: '70547835',
    grupoUsuario: 'Sistemas Perú',
    fecha: '10-09-2026 17:14:00',
    tipo: 'Salida',
    metodoMarca: 'Reloj Control',
    nombreReloj: 'IN01-A - BODEGA ICA PANAMERICANA',
    relojControl: 'HHF2244400110'
  }
];

/**
 * Función para cargar y guardar en localStorage
 */
export function getStoredDailyReports(): GeoVictoriaDailyReportRow[] {
  try {
    const saved = localStorage.getItem(GEOVICTORIA_DAILY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_GEOVICTORIA_DAILY_REPORTS;
}

export function saveStoredDailyReports(rows: GeoVictoriaDailyReportRow[]) {
  try {
    localStorage.setItem(GEOVICTORIA_DAILY_STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {}
}

export function getStoredPunches(): GeoVictoriaPunchRow[] {
  try {
    const saved = localStorage.getItem(GEOVICTORIA_PUNCHES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_GEOVICTORIA_PUNCHES;
}

export function saveStoredPunches(rows: GeoVictoriaPunchRow[]) {
  try {
    localStorage.setItem(GEOVICTORIA_PUNCHES_STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {}
}

/**
 * Parser de texto copiado y pegado desde Excel de GeoVictoria (TSV o CSV)
 */
export function parseGeoVictoriaPastedText(
  rawText: string
): { dailyRows: GeoVictoriaDailyReportRow[]; punchRows: GeoVictoriaPunchRow[]; detectedType: 'daily' | 'punch' | 'unknown' } {
  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { dailyRows: [], punchRows: [], detectedType: 'unknown' };
  }

  const headerLine = lines[0].toLowerCase();
  const isPunchFormat = headerLine.includes('reloj') || headerLine.includes('método') || headerLine.includes('metodo') || headerLine.includes('tipo');
  const isDailyFormat = headerLine.includes('turno') || headerLine.includes('entró') || headerLine.includes('entro') || headerLine.includes('atraso');

  if (isPunchFormat) {
    const punchRows: GeoVictoriaPunchRow[] = [];
    const dataLines = lines.slice(1);
    dataLines.forEach((line, idx) => {
      const parts = line.split(/[\t;,]/).map(p => p.trim());
      if (parts.length >= 4) {
        punchRows.push({
          id: `pasted-p-${Date.now()}-${idx}`,
          apellidos: parts[0] || 'Desconocido',
          nombre: parts[1] || '',
          rut: parts[2] || '',
          grupoUsuario: parts[3] || 'Sistemas Perú',
          fecha: parts[4] || new Date().toLocaleString(),
          tipo: (parts[5] && parts[5].toLowerCase().includes('sal')) ? 'Salida' : 'Ingreso',
          metodoMarca: parts[6] || 'Reloj Control',
          nombreReloj: parts[13] || parts[7] || 'Reloj Tienda',
          relojControl: parts[14] || parts[8] || ''
        });
      }
    });
    return { dailyRows: [], punchRows, detectedType: 'punch' };
  }

  // Otherwise treat as daily consolidated report
  const dailyRows: GeoVictoriaDailyReportRow[] = [];
  const dataLines = isDailyFormat ? lines.slice(1) : lines;
  dataLines.forEach((line, idx) => {
    const parts = line.split(/[\t;,]/).map(p => p.trim());
    if (parts.length >= 4) {
      dailyRows.push({
        id: `pasted-d-${Date.now()}-${idx}`,
        apellidos: parts[0] || '',
        nombre: parts[1] || '',
        identificado: parts[2] || '',
        grupo: parts[3] || 'Sistemas Perú',
        fecha: parts[4] || 'Hoy',
        permiso: parts[5] || 'Ninguno',
        turno: parts[6] || '08:00 - 17:00(13:00-14:00)',
        entro: parts[7] || '',
        atraso: parts[9] || '00:00',
        salio: parts[11] || '',
        ht: parts[18] || parts[12] || '08:00',
        cargo: parts[19] || parts[13] || 'IT Operator'
      });
    }
  });

  return { dailyRows, punchRows: [], detectedType: 'daily' };
}

/**
 * Motor de Cruce de Información: Especialista Registrado en Portal OnSite vs Reporte GeoVictoria
 */
export function generateGeoVictoriaReconciliation(
  dailyReports: GeoVictoriaDailyReportRow[],
  punches: GeoVictoriaPunchRow[],
  users: AppUser[],
  stores: Store[],
  activePresences: ActivePersonnelPresence[] = [],
  preventiveVisits: PreventiveVisit[] = []
): GeoVictoriaReconciliationItem[] {
  const reconciliationItems: GeoVictoriaReconciliationItem[] = [];

  // Mapear usuarios por DNI y por Nombre Completo
  const usersByDni = new Map<string, AppUser>();
  const usersByName = new Map<string, AppUser>();

  users.forEach(u => {
    if (u.dni) usersByDni.set(u.dni.trim(), u);
    usersByName.set(u.name.toLowerCase().trim(), u);
  });

  // Procesar marcaciones detalladas (Foto 2) primero
  punches.forEach(punch => {
    const cleanDni = punch.rut?.trim();
    let matchedUser = usersByDni.get(cleanDni);
    if (!matchedUser) {
      const fullName = `${punch.nombre} ${punch.apellidos}`.toLowerCase().trim();
      const reverseName = `${punch.apellidos} ${punch.nombre}`.toLowerCase().trim();
      matchedUser = users.find(u => {
        const uLower = u.name.toLowerCase().trim();
        return uLower.includes(punch.nombre.toLowerCase()) && uLower.includes(punch.apellidos.toLowerCase());
      });
    }

    // Buscar si el especialista tiene presencia activa o visita registrada
    const presence = activePresences.find(p => p.userId === matchedUser?.id || (matchedUser && p.userName.toLowerCase().includes(matchedUser.name.toLowerCase())));
    const visit = preventiveVisits.find(v => (matchedUser && v.itOperator?.toLowerCase().includes(matchedUser.name.toLowerCase())));

    // Extraer tienda desde el nombre del reloj (ej. "IN01-A - TIENDA AQP CAYMA" -> "Cayma" o "AQP CAYMA")
    const relojClean = punch.nombreReloj || '';
    let matchedStore = stores.find(s => {
      if (relojClean.toLowerCase().includes(s.name.toLowerCase())) return true;
      if (s.distrito && relojClean.toLowerCase().includes(s.distrito.toLowerCase())) return true;
      return false;
    });

    const onsiteStore = presence?.currentStoreName || presence?.toStoreName || visit?.storeName || matchedUser?.tiendaNombre || (matchedStore?.name) || 'Tienda Asignada OnSite';
    const onsiteCod = presence?.currentStoreCode ? Number(presence.currentStoreCode) : visit?.storeCode ? Number(visit.storeCode) : matchedUser?.codTienda || matchedStore?.codTienda || 103;

    let status: GeoVictoriaReconciliationItem['status'] = 'conforme';
    let diagnostico = `Marcación ${punch.tipo} conforme en reloj biométrico ${punch.nombreReloj || ''}`;

    if (punch.metodoMarca === 'Marca Web') {
      status = 'desvio_tienda';
      diagnostico = 'Marcó mediante Marca Web (teletrabajo o fuera del reloj biométrico físico de tienda)';
    } else if (relojClean && onsiteStore && !relojClean.toLowerCase().includes(onsiteStore.toLowerCase().replace('tottus ', ''))) {
      // Si la tienda del reloj no coincide con la tienda asignada en el portal
      status = 'desvio_tienda';
      diagnostico = `Desvío detectado: Marcó en [${relojClean}] pero tiene asignación en [${onsiteStore}]`;
    }

    reconciliationItems.push({
      id: `rec-p-${punch.id}`,
      dni: cleanDni,
      specialistName: matchedUser?.name || `${punch.nombre} ${punch.apellidos}`,
      cargo: matchedUser?.cargo || matchedUser?.role || 'IT Operator',
      fecha: punch.fecha,
      onsiteStoreName: onsiteStore,
      onsiteStoreCod: onsiteCod,
      onsiteActivity: presence ? `Turno activo (${presence.status})` : visit ? `Visita Preventiva (${visit.estado})` : 'Operación Soporte Onsite',
      onsiteCheckInTime: presence?.checkInTime || punch.fecha.split(' ')[1] || '08:00',
      geoVictoriaTurno: '08:00 - 17:00',
      geoVictoriaIngreso: punch.tipo === 'Ingreso' ? punch.fecha.split(' ')[1] : undefined,
      geoVictoriaSalida: punch.tipo === 'Salida' ? punch.fecha.split(' ')[1] : undefined,
      geoVictoriaRelojTienda: punch.nombreReloj,
      geoVictoriaMetodo: punch.metodoMarca,
      status,
      diagnostico
    });
  });

  // Procesar consolidado diario (Foto 1: Turnos, Atrasos y Horas Trabajadas)
  dailyReports.forEach(daily => {
    const cleanDni = daily.identificado?.trim();
    let matchedUser = usersByDni.get(cleanDni);
    if (!matchedUser) {
      matchedUser = users.find(u => {
        const uLower = u.name.toLowerCase().trim();
        return uLower.includes(daily.nombre.toLowerCase()) && uLower.includes(daily.apellidos.toLowerCase());
      });
    }

    const hasAtraso = daily.atraso && daily.atraso !== '00:00';
    let status: GeoVictoriaReconciliationItem['status'] = 'conforme';
    let diagnostico = `Jornada normal de ${daily.ht || '08:00'} hrs trabajadas. Turno planificado ${daily.turno}`;

    if (!daily.entro && daily.fecha.includes('(F)')) {
      diagnostico = 'Día feriado o descanso programado según planilla GeoVictoria';
    } else if (!daily.entro) {
      status = 'sin_marcacion_geovictoria';
      diagnostico = 'Sin marcación de entrada en GeoVictoria para esta fecha programada';
    } else if (hasAtraso) {
      status = 'atraso';
      diagnostico = `Atraso registrado de ${daily.atraso} min. Marcó entrada a las ${daily.entro} (Turno planificado: ${daily.turno})`;
    }

    reconciliationItems.push({
      id: `rec-d-${daily.id}`,
      dni: cleanDni,
      specialistName: matchedUser?.name || `${daily.nombre} ${daily.apellidos}`,
      cargo: daily.cargo || matchedUser?.cargo || 'IT Operator',
      fecha: daily.fecha,
      onsiteStoreName: matchedUser?.tiendaNombre || 'Tienda Central Tottus',
      onsiteStoreCod: matchedUser?.codTienda || 103,
      onsiteActivity: 'Asistencia Planilla Sistemas Perú',
      geoVictoriaTurno: daily.turno,
      geoVictoriaIngreso: daily.entro || 'Sin marca',
      geoVictoriaSalida: daily.salio || 'Sin marca',
      geoVictoriaAtraso: daily.atraso,
      geoVictoriaHorasTrabajadas: daily.ht,
      geoVictoriaRelojTienda: 'Planilla Consolidada Tottus',
      geoVictoriaMetodo: daily.entro?.includes('M') ? 'Reloj Manual / Autorizado' : 'Reloj Biométrico',
      status,
      diagnostico
    });
  });

  return reconciliationItems;
}
