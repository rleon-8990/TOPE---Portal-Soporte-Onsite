import {
  PreventiveVisit,
  WalkthroughCategoryId,
  WalkthroughReviewedItem,
  Store
} from '../types';

export interface WalkthroughCategoryMeta {
  id: WalkthroughCategoryId;
  name: string;
  shortCode: string;
  icon: string;
  description: string;
  defaultChecklist: string[];
}

export const WALKTHROUGH_CATEGORIES: WalkthroughCategoryMeta[] = [
  {
    id: 'consulta_precios',
    name: 'Consulta Precios',
    shortCode: 'CP',
    icon: 'Scan',
    description: 'Verificadores de precios para clientes en piso de venta.',
    defaultChecklist: [
      'Pantalla LCD y brillo adecuado',
      'Lector óptico 1D / 2D operativo',
      'Conectividad de red PoE y ping a servidor',
      'Sujeción mecánica a columna o pared'
    ]
  },
  {
    id: 'balanzas',
    name: 'Balanzas - Perecibles',
    shortCode: 'BAL',
    icon: 'Scale',
    description: 'Balanzas de autoservicio, carnes, pescados, fiambres y panadería.',
    defaultChecklist: [
      'Nivelación mecánica por burbuja de aire',
      'Calibración de cero y precisión metrológica',
      'Limpieza y estado de cabezal térmico',
      'Impresión nítida de ticket y código de barras',
      'Platillo de acero inoxidable limpio y sin rozamiento'
    ]
  },
  {
    id: 'cajas_asistidas',
    name: 'Cajas Asistidas (POS)',
    shortCode: 'POS',
    icon: 'CreditCard',
    description: 'Línea de cajas registradoras con cajero en piso de venta.',
    defaultChecklist: [
      'Calidad de impresión térmica y corte automático',
      'Estado del teclado de cajero (sin teclas duras o pegadas)',
      'Gaveta de dinero (apertura eléctrica y resorte)',
      'Scanner bióptico Magellan / Honeywell (lectura ágil)',
      'Monitor touch de cajero y display cliente',
      'UPS / Estabilizador de caja (sin alarmas de batería)',
      'Pinpad de tarjetas (comunicación y contactless)'
    ]
  },
  {
    id: 'cajas_sco',
    name: 'Cajas SCO (Self-Checkout)',
    shortCode: 'SCO',
    icon: 'Laptop',
    description: 'Estaciones de autoatención para clientes.',
    defaultChecklist: [
      'Monitor touch interactivo y calibración táctil',
      'Balanza de seguridad de embolsado (tara correcta)',
      'Scanner de mano y bióptico vertical',
      'Impresora de boletas y sensores de papel',
      'Torre luminosa de estado (verde/rojo/ámbar)',
      'Pinpad y pedestal antivandálico'
    ]
  },
  {
    id: 'pda_terminales',
    name: 'PDA / TC26 / TC27',
    shortCode: 'PDA',
    icon: 'Smartphone',
    description: 'Terminales móviles de picking ecommerce, inventario y reposición.',
    defaultChecklist: [
      'Pantalla táctil y cristal Gorilla Glass sin fisuras',
      'Gatillo lector / Trigger gun y haz láser 2D',
      'Estado y salud de batería (>80% capacidad)',
      'Conectividad Wi-Fi a SSID corporativo Falabella',
      'Funda protectora de goma y correa de sujeción'
    ]
  },
  {
    id: 'impresoras_portatiles',
    name: 'Impresoras Portátiles',
    shortCode: 'PRN-P',
    icon: 'Printer',
    description: 'Impresoras móviles Zebra ZQ520 / ZQ320 para flejado y precios.',
    defaultChecklist: [
      'Cabezal térmico sin líneas blancas o puntos ciegos',
      'Rodillo de tracción de etiquetas limpio y sin muescas',
      'Batería con retención de carga óptima',
      'Conexión Bluetooth / Wi-Fi con PDAs de tienda',
      'Sensor de GAP y sensor de papel alineados'
    ]
  },
  {
    id: 'impresoras_zebra',
    name: 'Impresoras Zebra (Mesa)',
    shortCode: 'PRN-Z',
    icon: 'Printer',
    description: 'Impresoras industriales de etiquetas Zebra ZT410 / ZM400 / ZD420.',
    defaultChecklist: [
      'Calidad de impresión y nitidez en ribbons / etiquetas',
      'Calibración de sensor de medios y marcas negras',
      'Limpieza con alcohol isopropílico de cabezal y rodillo',
      'Conectividad de red Ethernet e IP fija asignada',
      'Eje tensor de ribbon y rebobinador operativo'
    ]
  },
  {
    id: 'etiquetas_flejes_reloj',
    name: 'Etiquetas / Flejes / C&C / Reloj',
    shortCode: 'ELEC',
    icon: 'Tag',
    description: 'Relojes biométricos de asistencia, flejes electrónicos y Click & Collect.',
    defaultChecklist: [
      'Reloj marcador biométrico GeoVictoria (lector huella/facial)',
      'Pantalla táctil de asistencia y fuente de poder 12V',
      'Estación Click & Collect y scanner de retiro',
      'Antenas y transmisores de flejes electrónicos (ESL)'
    ]
  },
  {
    id: 'cpd_sistemas',
    name: 'CPD - Sistemas (Data Center)',
    shortCode: 'CPD',
    icon: 'Server',
    description: 'Sala técnica principal de telecomunicaciones y servidores de tienda.',
    defaultChecklist: [
      'Temperatura ambiente controlada (aire acondicionado < 22°C)',
      'UPS centralizado y banco de baterías sin alarmas',
      'Limpieza general del piso técnico y ausencia de humedad',
      'Servidores locales, storage y NVR CCTV operativos',
      'Sistema de alarma contra incendio y luces de emergencia'
    ]
  },
  {
    id: 'gabinete_b',
    name: 'Gabinete B - Sistemas',
    shortCode: 'GAB-B',
    icon: 'Layers',
    description: 'Rack secundario de cableado estructurado y distribución.',
    defaultChecklist: [
      'Peinado y ordenamiento de patch cords con velcro',
      'Extractores de aire del rack funcionando y limpios',
      'Switches Cisco / Aruba con luces link en puertos activos',
      'PDU y tomas eléctricas rotuladas sin sobrecarga',
      'Cerradura de puerta frontal y paneles laterales cerrados'
    ]
  },
  {
    id: 'gabinete_c',
    name: 'Gabinete C - Sistemas',
    shortCode: 'GAB-C',
    icon: 'Layers',
    description: 'Rack auxiliar de piso de venta / almacén.',
    defaultChecklist: [
      'Cableado de red ordenado y debidamente rotulado',
      'Ventilación forzada y filtro de polvo limpio',
      'Patch panel identificado con numeración de puntos de red',
      'Alimentación eléctrica estabilizada conectada a UPS',
      'Seguridad física y candado / llave de custodia'
    ]
  }
];

export const INITIAL_PREVENTIVE_VISITS: PreventiveVisit[] = [
  {
    id: 'vis-358-2026-08',
    numeroVisita: 'VIS-358-2026-08',
    storeId: 'store-358',
    storeCode: '358',
    storeName: '358 - HT Cajamarca',
    direccionFiscal: 'Av. Los Incas 123, Cajamarca',
    fechaVisita: '05/08/2026',
    horaInicio: '08:30',
    horaTermino: '14:20',
    itOperator: 'Juan Pérez',
    gerenteTienda: 'María Gómez',
    personalPermanente: 8,
    observacionesGenerales: 'Caminata técnica semestral ejecutada conforme a cronograma. Se revisaron gabinetes de comunicación, línea completa de cajas asistidas y equipos móviles.',
    recomendacionesPlanes: 'Programar cambio preventivo de rodillo en Impresora Portátil PRN-02 y reemplazo de patch cord deteriorado en Gabinete B.',
    estado: 'Informe generado',
    informePdfNombre: 'Informe_Visita_358_2026-08-05.pdf',
    informePdfUrl: '#',
    sharepointSynced: true,
    sharepointListId: 'SP-LIST-TOTTUS-VIS-358',
    totalEquipos: 28,
    operativosCount: 26,
    conObservacionCount: 2,
    noOperativosCount: 0,
    ticketsGeneradosCount: 1,
    firmas: {
      itOperatorSignature: 'Juan Pérez - IT Onsite Tottus',
      itOperatorSignedAt: '05/08/2026 14:15',
      gerenteSignature: 'María Gómez - Gerencia Tienda Cajamarca',
      gerenteSignedAt: '05/08/2026 14:20'
    },
    itemsRevision: [
      {
        id: 'rev-358-cp1',
        categoryId: 'consulta_precios',
        categoryName: 'Consulta Precios',
        equipoNombre: 'CP 1 - Pasillo Abarrotes',
        equipmentCode: 'CP-358-01',
        estado: 'Operativo',
        observacion: 'Equipo operativo sin observaciones.',
        accionRealizada: 'Limpieza óptica y prueba de lectura con código EAN13.',
        diagnostics: [
          { item: 'Pantalla LCD y brillo', status: 'ok', valorMedido: '100% brillo' },
          { item: 'Lector óptico', status: 'ok', valorMedido: 'Lectura instantánea' },
          { item: 'Conectividad PoE', status: 'ok', valorMedido: 'Ping 2ms' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60']
      },
      {
        id: 'rev-358-cp2',
        categoryId: 'consulta_precios',
        categoryName: 'Consulta Precios',
        equipoNombre: 'CP 2 - Pasillo Lácteos',
        equipmentCode: 'CP-358-02',
        estado: 'Operativo',
        observacion: 'Operativo.',
        accionRealizada: 'Ajuste de soporte a pilar metálico.',
        diagnostics: [
          { item: 'Pantalla LCD y brillo', status: 'ok' },
          { item: 'Lector óptico', status: 'ok' },
          { item: 'Conectividad PoE', status: 'ok' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60']
      },
      {
        id: 'rev-358-cp3',
        categoryId: 'consulta_precios',
        categoryName: 'Consulta Precios',
        equipoNombre: 'CP 3 - Pasillo Perfumería',
        equipmentCode: 'CP-358-03',
        estado: 'Con observación',
        observacion: 'Precio desactualizado en base local / desincronizado.',
        accionRealizada: 'Reinicio de servicio y sincronización forzada.',
        ticketJR: 'INC-12345',
        diagnostics: [
          { item: 'Pantalla LCD y brillo', status: 'ok' },
          { item: 'Lector óptico', status: 'ok' },
          { item: 'Conectividad PoE', status: 'observacion', comentario: 'Requirió sincronización' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=60']
      },
      {
        id: 'rev-358-pos1',
        categoryId: 'cajas_asistidas',
        categoryName: 'Cajas Asistidas (POS)',
        equipoNombre: 'POS Caja 01 - Rápida',
        equipmentCode: 'POS-358-01',
        estado: 'Operativo',
        observacion: 'Impresora térmica y teclado en buen estado.',
        accionRealizada: 'Limpieza de cabezal térmico Epson y prueba de corte.',
        diagnostics: [
          { item: 'Calidad de impresión térmica', status: 'ok', valorMedido: 'Nitidez 100%' },
          { item: 'Estado del teclado de cajero', status: 'ok', valorMedido: 'Todas las teclas OK' },
          { item: 'Gaveta de dinero', status: 'ok', valorMedido: 'Apertura suave' },
          { item: 'Scanner bióptico', status: 'ok', valorMedido: 'Balanza integrada calibrada' },
          { item: 'UPS de caja', status: 'ok', valorMedido: '120V estable' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=400&auto=format&fit=crop&q=60']
      },
      {
        id: 'rev-358-pos2',
        categoryId: 'cajas_asistidas',
        categoryName: 'Cajas Asistidas (POS)',
        equipoNombre: 'POS Caja 02',
        equipmentCode: 'POS-358-02',
        estado: 'Con observación',
        observacion: 'Impresora térmica con corte de papel irregular por desgaste en cuchilla.',
        accionRealizada: 'Limpieza con alcohol y reporte para cambio de cabezal/cuchilla.',
        ticketJR: 'TK-9862',
        diagnostics: [
          { item: 'Calidad de impresión térmica', status: 'observacion', valorMedido: 'Corte irregular' },
          { item: 'Estado del teclado de cajero', status: 'ok' },
          { item: 'Gaveta de dinero', status: 'ok' },
          { item: 'Scanner bióptico', status: 'ok' },
          { item: 'UPS de caja', status: 'ok' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=400&auto=format&fit=crop&q=60']
      },
      {
        id: 'rev-358-gabb',
        categoryId: 'gabinete_b',
        categoryName: 'Gabinete B - Sistemas',
        equipoNombre: 'Gabinete B - Rack Cableado Piso Venta',
        equipmentCode: 'GAB-B-358',
        estado: 'Operativo',
        observacion: 'Switches operativos, ventiladores en funcionamiento.',
        accionRealizada: 'Reordenamiento de patch cords con velcro corporativo y aspirado de polvo.',
        diagnostics: [
          { item: 'Peinado y ordenamiento de patch cords', status: 'ok', valorMedido: 'Conforme con velcro' },
          { item: 'Ventilación y temperatura de rack', status: 'ok', valorMedido: '21.5 °C' },
          { item: 'Limpieza interna de bandejas', status: 'ok', valorMedido: 'Aspirado completado' },
          { item: 'Estado de switches y patch panels', status: 'ok', valorMedido: 'Cisco 2960X Link OK' },
          { item: 'PDU y tomas eléctricas', status: 'ok', valorMedido: '220V estabilizado' }
        ],
        evidencias: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60']
      }
    ],
    evidenciasGenerales: [
      {
        id: 'ev-358-01',
        title: 'Gabinete de Redes peinado y limpio',
        dataUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60',
        categoryId: 'gabinete_b',
        equipoNombre: 'Gabinete B',
        timestamp: '05/08/2026 10:45'
      },
      {
        id: 'ev-358-02',
        title: 'Caja POS 01 prueba de impresión conforme',
        dataUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=400&auto=format&fit=crop&q=60',
        categoryId: 'cajas_asistidas',
        equipoNombre: 'POS Caja 01',
        timestamp: '05/08/2026 11:30'
      }
    ],
    createdAt: '2026-08-05T08:30:00.000Z',
    updatedAt: '2026-08-05T14:20:00.000Z'
  },
  {
    id: 'vis-101-2026-08',
    numeroVisita: 'VIS-101-2026-08',
    storeId: 'store-101',
    storeCode: '101',
    storeName: '101 - HT Trujillo',
    direccionFiscal: 'Av. América Norte 2400, Trujillo',
    fechaVisita: '04/08/2026',
    horaInicio: '09:00',
    horaTermino: '16:00',
    itOperator: 'Carlos Medina',
    gerenteTienda: 'Roberto Sánchez',
    personalPermanente: 10,
    observacionesGenerales: 'Caminata técnica semestral en ejecución. Pendiente revisión de CPD y Self-Checkout.',
    recomendacionesPlanes: 'Culminar revisión de SCO y validar UPS de CPD.',
    estado: 'En proceso',
    sharepointSynced: false,
    totalEquipos: 18,
    operativosCount: 16,
    conObservacionCount: 2,
    noOperativosCount: 0,
    ticketsGeneradosCount: 1,
    firmas: {},
    itemsRevision: [
      {
        id: 'rev-101-pos1',
        categoryId: 'cajas_asistidas',
        categoryName: 'Cajas Asistidas (POS)',
        equipoNombre: 'POS Caja 05',
        equipmentCode: 'POS-101-05',
        estado: 'Operativo',
        observacion: 'Operativo.',
        accionRealizada: 'Limpieza de teclado y comprobación de gaveta.',
        diagnostics: [
          { item: 'Calidad de impresión térmica', status: 'ok' },
          { item: 'Estado del teclado de cajero', status: 'ok' }
        ],
        evidencias: []
      }
    ],
    evidenciasGenerales: [],
    createdAt: '2026-08-04T09:00:00.000Z',
    updatedAt: '2026-08-04T12:00:00.000Z'
  },
  {
    id: 'vis-250-2026-08',
    numeroVisita: 'VIS-250-2026-08',
    storeId: 'store-250',
    storeCode: '250',
    storeName: '250 - HT Chiclayo',
    direccionFiscal: 'Av. Víctor Raúl Haya de la Torre, Chiclayo',
    fechaVisita: '03/08/2026',
    horaInicio: '08:00',
    horaTermino: '15:00',
    itOperator: 'Luis García',
    gerenteTienda: 'Patricia Alva',
    personalPermanente: 9,
    observacionesGenerales: 'Revisión semestral completada al 100%. Equipos de pesaje y balanzas con calibración certificada.',
    recomendacionesPlanes: 'Mantener rutina de limpieza quincenal en cabezales de balanzas perecibles.',
    estado: 'Informe generado',
    informePdfNombre: 'Informe_Visita_250_2026-08-03.pdf',
    informePdfUrl: '#',
    sharepointSynced: true,
    totalEquipos: 34,
    operativosCount: 33,
    conObservacionCount: 1,
    noOperativosCount: 0,
    ticketsGeneradosCount: 0,
    firmas: {
      itOperatorSignature: 'Luis García - IT Operator Chiclayo',
      itOperatorSignedAt: '03/08/2026 14:50',
      gerenteSignature: 'Patricia Alva - Gerencia Tienda',
      gerenteSignedAt: '03/08/2026 15:00'
    },
    itemsRevision: [],
    evidenciasGenerales: [],
    createdAt: '2026-08-03T08:00:00.000Z',
    updatedAt: '2026-08-03T15:00:00.000Z'
  },
  {
    id: 'vis-400-2026-08',
    numeroVisita: 'VIS-400-2026-08',
    storeId: 'store-400',
    storeCode: '400',
    storeName: '400 - HT Piura',
    direccionFiscal: 'Av. Sánchez Cerro 1200, Piura',
    fechaVisita: '02/08/2026',
    horaInicio: '09:00',
    horaTermino: '17:00',
    itOperator: 'Juan Pérez',
    gerenteTienda: 'Jorge Chang',
    personalPermanente: 8,
    observacionesGenerales: 'Visita preventiva programada para ciclo semestral.',
    recomendacionesPlanes: 'Inspección prioritaria de aires acondicionados en CPD por alta temperatura en Piura.',
    estado: 'Pendiente',
    sharepointSynced: false,
    totalEquipos: 0,
    operativosCount: 0,
    conObservacionCount: 0,
    noOperativosCount: 0,
    ticketsGeneradosCount: 0,
    firmas: {},
    itemsRevision: [],
    evidenciasGenerales: [],
    createdAt: '2026-08-02T08:00:00.000Z',
    updatedAt: '2026-08-02T08:00:00.000Z'
  },
  {
    id: 'vis-215-2026-08',
    numeroVisita: 'VIS-215-2026-08',
    storeId: 'store-215',
    storeCode: '215',
    storeName: '215 - HT Arequipa',
    direccionFiscal: 'Av. Ejército 795, Cayma, Arequipa',
    fechaVisita: '01/08/2026',
    horaInicio: '08:30',
    horaTermino: '14:00',
    itOperator: 'Renato Salas',
    gerenteTienda: 'Cecilia Valdivia',
    personalPermanente: 9,
    observacionesGenerales: 'Auditoría semestral concluida. Se encontraron 3 PDAs con protectores deteriorados cambiados en sitio.',
    recomendacionesPlanes: 'Reforzar cambio de baterías en PDAs con más de 2 años de uso.',
    estado: 'Informe generado',
    informePdfNombre: 'Informe_Visita_215_2026-08-01.pdf',
    informePdfUrl: '#',
    sharepointSynced: true,
    totalEquipos: 30,
    operativosCount: 29,
    conObservacionCount: 1,
    noOperativosCount: 0,
    ticketsGeneradosCount: 1,
    firmas: {
      itOperatorSignature: 'Renato Salas - IT Arequipa',
      itOperatorSignedAt: '01/08/2026 13:50',
      gerenteSignature: 'Cecilia Valdivia - Gerente Tienda',
      gerenteSignedAt: '01/08/2026 14:00'
    },
    itemsRevision: [],
    evidenciasGenerales: [],
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-01T14:00:00.000Z'
  }
];

/**
 * Calcula el semáforo semestral de visita preventiva para una tienda
 * Regla: Semestral = 180 días (~6 meses)
 */
export function getPreventiveVisitSemaforo(lastVisitDateStr?: string): {
  status: 'al_dia' | 'proximo_a_vencer' | 'vencido';
  label: string;
  badgeClass: string;
  daysSinceLastVisit: number;
} {
  if (!lastVisitDateStr) {
    return {
      status: 'vencido',
      label: 'Sin Visita Registrada (> 6 meses)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      daysSinceLastVisit: 999
    };
  }

  // Parse date: e.g. "05/08/2026" or ISO
  let lastDate: Date;
  if (lastVisitDateStr.includes('/')) {
    const parts = lastVisitDateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      lastDate = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
    } else {
      lastDate = new Date(lastVisitDateStr);
    }
  } else {
    lastDate = new Date(lastVisitDateStr);
  }

  if (isNaN(lastDate.getTime())) {
    return {
      status: 'vencido',
      label: 'Fecha No Válida',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      daysSinceLastVisit: 999
    };
  }

  // Use reference time ~September 2026 as per workspace local time
  const now = new Date('2026-09-11T09:30:00');
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 120) {
    return {
      status: 'al_dia',
      label: `Al Día (${diffDays} días)`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      daysSinceLastVisit: diffDays
    };
  } else if (diffDays <= 180) {
    return {
      status: 'proximo_a_vencer',
      label: `Por Vencer (${diffDays} días)`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      daysSinceLastVisit: diffDays
    };
  } else {
    return {
      status: 'vencido',
      label: `Vencida (${diffDays} días)`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      daysSinceLastVisit: diffDays
    };
  }
}

/**
 * Enlaza y sincroniza el estado de las tiendas con el historial de visitas preventivas
 */
export function enrichStoresWithVisits(stores: Store[], visits: PreventiveVisit[]): Store[] {
  return stores.map(store => {
    // Buscar la visita más reciente de esta tienda
    const storeVisits = visits.filter(v =>
      String(v.storeCode) === String(store.codTienda) ||
      String(v.storeId) === String(store.id)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestVisit = storeVisits[0];

    if (latestVisit) {
      const semaforo = getPreventiveVisitSemaforo(latestVisit.fechaVisita);
      return {
        ...store,
        ultimaVisitaPreventiva: {
          fecha: latestVisit.fechaVisita,
          estado: latestVisit.estado,
          itOperator: latestVisit.itOperator,
          gerenteTienda: latestVisit.gerenteTienda,
          informePdf: latestVisit.informePdfNombre,
          totalEquiposRevisados: latestVisit.totalEquipos,
          observacionesDetectadas: latestVisit.conObservacionCount,
          ticketsGenerados: latestVisit.ticketsGeneradosCount,
          semaforoSemestral: semaforo.status
        }
      };
    } else {
      // Fallback para tiendas sin visita registrada aún
      return {
        ...store,
        ultimaVisitaPreventiva: {
          fecha: 'Pendiente',
          estado: 'Pendiente',
          itOperator: store.itOperator || 'Sin Asignar',
          gerenteTienda: store.gerenteTienda || store.manager,
          semaforoSemestral: 'vencido'
        }
      };
    }
  });
}
