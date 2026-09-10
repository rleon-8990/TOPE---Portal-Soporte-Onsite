import { DeviceCustodyItem, StoreColaborador } from '../types';

export const INITIAL_COLABORADORES: StoreColaborador[] = [
  {
    fotocheck: 'FC-10294',
    dni: '72849102',
    name: 'Marco Antonio Quispe Ramos',
    cargo: 'Operador de Picking Ecommerce',
    area: 'Picking Ecommerce (Fazil / Falabella)',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '984 123 456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-10482',
    dni: '45812903',
    name: 'Valeria Nicole Mendoza Vega',
    cargo: 'Asistente de Reposición Nocturna',
    area: 'Reposición & Abarrotes',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '992 481 029',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-10551',
    dni: '70912458',
    name: 'Carlos Eduardo Herrera Paz',
    cargo: 'Cajero / Operador Fila Cero',
    area: 'Cajas & Frontline',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '971 349 182',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-10619',
    dni: '48201948',
    name: 'Rosa Elvira Gutiérrez Cruz',
    cargo: 'Controladora de Calidad Perecibles',
    area: 'Perecibles (Carnes y F&V)',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '965 291 048',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-10702',
    dni: '71049281',
    name: 'Javier Rodrigo Silva Montes',
    cargo: 'Receptor de Mercadería Almacén',
    area: 'Recepción & Almacén Central',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '954 810 293',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-10815',
    dni: '42910482',
    name: 'Diana Patricia Flores Castillo',
    cargo: 'Auditora de Inventario Cíclico',
    area: 'Auditoría & Prevención',
    storeCode: 103,
    storeName: 'Megaplaza',
    phone: '942 109 482',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-20194',
    dni: '74820194',
    name: 'Luis Fernando Cárdenas Soto',
    cargo: 'Jefe de Sección Abarrotes',
    area: 'Abarrotes & Bazar',
    storeCode: 104,
    storeName: 'Las Begonias',
    phone: '987 654 321',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-20231',
    dni: '46820194',
    name: 'Mariana Sofia Benavides Ruiz',
    cargo: 'Operadora de Picking Express',
    area: 'Picking Ecommerce (Fazil / Falabella)',
    storeCode: 104,
    storeName: 'Las Begonias',
    phone: '951 842 109',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-30105',
    dni: '73910284',
    name: 'Alonso Gabriel Vargas Paredes',
    cargo: 'Asistente de Plataforma y Despacho',
    area: 'Despacho & Almacén',
    storeCode: 105,
    storeName: 'La Marina',
    phone: '939 102 847',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },
  {
    fotocheck: 'FC-40123',
    dni: '71829401',
    name: 'Fiorella Belén Alarcón Ponce',
    cargo: 'Encargada de Fila Cero Cajas',
    area: 'Cajas & Frontline',
    storeCode: 123,
    storeName: 'Angamas',
    phone: '928 401 928',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_DEVICE_CUSTODY_ITEMS: DeviceCustodyItem[] = [
  // --- TIENDA 103 MEGAPLAZA (Sede Principal) ---
  {
    id: 'dev-103-01',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PDA-T103-01',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Healthcare / Android 11',
    serialNumber: '21085523091001',
    macAddress: '3C:E1:A1:4B:22:11',
    ipAddress: '172.23.87.141',
    barcode: 'PDA-10301',
    status: 'en_uso',
    batteryLevel: 88,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 01',
    currentBorrower: {
      fotocheck: 'FC-10294',
      dni: '72849102',
      name: 'Marco Antonio Quispe Ramos',
      cargo: 'Operador de Picking Ecommerce',
      area: 'Picking Ecommerce (Fazil / Falabella)',
      phone: '984 123 456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '09:45 AM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Denis Bravo',
      expectedReturnTime: '18:00'
    },
    hoursInUse: 3.5,
    isOverdue: false,
    loanHistory: [
      {
        id: 'hist-1',
        action: 'entrega',
        timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
        timeFormatted: '09:45 AM',
        dateFormatted: '10/09/2026',
        fotocheck: 'FC-10294',
        borrowerName: 'Marco Antonio Quispe Ramos',
        cargo: 'Operador de Picking Ecommerce',
        area: 'Picking Ecommerce',
        cctvOfficer: 'Denis Bravo',
        conditionOnReturn: 'conforme',
        notes: 'Entregado con batería 100% y funda protectora.'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-02',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PRN-T103-01',
    deviceType: 'Impresora Portátil',
    brand: 'Zebra',
    model: 'ZQ520 Mobile Printer 4"',
    serialNumber: 'XXJ201948210',
    macAddress: '00:19:B9:5A:21:88',
    ipAddress: '172.23.87.142',
    barcode: 'PRN-10301',
    status: 'en_uso',
    batteryLevel: 74,
    hasHolster: false,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 02',
    currentBorrower: {
      fotocheck: 'FC-10294',
      dni: '72849102',
      name: 'Marco Antonio Quispe Ramos',
      cargo: 'Operador de Picking Ecommerce',
      area: 'Picking Ecommerce (Fazil / Falabella)',
      phone: '984 123 456',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '09:45 AM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Denis Bravo',
      expectedReturnTime: '18:00'
    },
    hoursInUse: 3.5,
    isOverdue: false,
    loanHistory: [
      {
        id: 'hist-2',
        action: 'entrega',
        timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
        timeFormatted: '09:45 AM',
        dateFormatted: '10/09/2026',
        fotocheck: 'FC-10294',
        borrowerName: 'Marco Antonio Quispe Ramos',
        cargo: 'Operador de Picking Ecommerce',
        area: 'Picking Ecommerce',
        cctvOfficer: 'Denis Bravo',
        conditionOnReturn: 'conforme',
        notes: 'Incluye rollo de etiquetas térmicas de picking.'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-03',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PDA-T103-02',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC21 Touch Computer Wi-Fi',
    serialNumber: '21085523091002',
    macAddress: '3C:E1:A1:4B:22:12',
    ipAddress: '172.23.87.143',
    barcode: 'PDA-10302',
    status: 'en_uso',
    batteryLevel: 42,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 03',
    currentBorrower: {
      fotocheck: 'FC-10482',
      dni: '45812903',
      name: 'Valeria Nicole Mendoza Vega',
      cargo: 'Asistente de Reposición Nocturna',
      area: 'Reposición & Abarrotes',
      phone: '992 481 029',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 8.8 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '04:30 AM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Mario Saldaña',
      expectedReturnTime: '13:00'
    },
    hoursInUse: 8.8,
    isOverdue: true, // ALERTA: Más de 8 horas de turno
    loanHistory: [
      {
        id: 'hist-3',
        action: 'entrega',
        timestamp: new Date(Date.now() - 8.8 * 3600 * 1000).toISOString(),
        timeFormatted: '04:30 AM',
        dateFormatted: '10/09/2026',
        fotocheck: 'FC-10482',
        borrowerName: 'Valeria Nicole Mendoza Vega',
        cargo: 'Asistente de Reposición',
        area: 'Reposición & Abarrotes',
        cctvOfficer: 'Mario Saldaña',
        conditionOnReturn: 'conforme',
        notes: 'Turno madrugada / reposición góndola.'
      }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-04',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PRN-T103-02',
    deviceType: 'Impresora Portátil',
    brand: 'Zebra',
    model: 'ZQ320 Plus Mobile Printer 3"',
    serialNumber: 'XXJ201948211',
    macAddress: '00:19:B9:5A:21:89',
    ipAddress: '172.23.87.144',
    barcode: 'PRN-10302',
    status: 'en_custodia',
    batteryLevel: 98,
    hasHolster: false,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 04 (Locker Cargador)',
    loanHistory: [
      {
        id: 'hist-4',
        action: 'devolucion',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        timeFormatted: '23:10 PM',
        dateFormatted: '09/09/2026',
        fotocheck: 'FC-10551',
        borrowerName: 'Carlos Eduardo Herrera Paz',
        area: 'Cajas & Frontline',
        cctvOfficer: 'Denis Bravo',
        conditionOnReturn: 'conforme',
        notes: 'Devuelto operativo al cierre de turno.'
      }
    ],
    notes: 'Disponible y con carga completa. Listo para entrega.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-05',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PDA-T103-03',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'MC3300 Gun / Colector Almacén',
    serialNumber: '21085523091003',
    macAddress: '3C:E1:A1:4B:22:13',
    ipAddress: '172.23.87.145',
    barcode: 'PDA-10303',
    status: 'en_custodia',
    batteryLevel: 100,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 05',
    loanHistory: [],
    notes: 'Equipo de almacén central con empuñadura tipo pistola.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-06',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PDA-T103-04',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Android 11',
    serialNumber: '21085523091004',
    macAddress: '3C:E1:A1:4B:22:14',
    ipAddress: '172.23.87.146',
    barcode: 'PDA-10304',
    status: 'con_falla',
    batteryLevel: 15,
    hasHolster: true,
    hasStrap: false,
    locationInStore: 'Zona de Retención CCTV (Caja Servicio Técnico)',
    lastIncident: {
      reportedAt: '09/09/2026 18:30',
      reportedBy: 'Carlos Eduardo Herrera Paz (FC-10551)',
      fallaType: 'Pantalla táctil quebrada y gatillo de escaneo inoperativo por caída',
      description: 'Equipo sufrió caída accidental en pasillo 4. Pantalla no reconoce toques en cuadrante superior y gatillo quedó trabado.',
      falabellaTicketUrl: 'https://ai-monitoring.falabella.com/login',
      falabellaTicketCode: 'FAL-TKT-994821',
      helpdeskTicketId: 'tk-103-pda-falla',
      ticketJR: 'OCR-090926-PDA'
    },
    loanHistory: [
      {
        id: 'hist-6',
        action: 'reporte_falla',
        timestamp: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
        timeFormatted: '18:30 PM',
        dateFormatted: '09/09/2026',
        fotocheck: 'FC-10551',
        borrowerName: 'Carlos Eduardo Herrera Paz',
        area: 'Cajas & Frontline',
        cctvOfficer: 'Denis Bravo',
        conditionOnReturn: 'danado',
        notes: 'Equipo devuelto con rotura de pantalla por caída. Se registró ticket en Falabella AI-Monitoring.',
        incidentDetail: 'Rotura de cristal touch y desprendimiento de gatillo.',
        falabellaTicketCode: 'FAL-TKT-994821'
      }
    ],
    notes: 'Reportado en https://ai-monitoring.falabella.com/login con ticket FAL-TKT-994821 para atención por proveedor DMS Perú.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-07',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PRN-T103-03',
    deviceType: 'Impresora Portátil',
    brand: 'Zebra',
    model: 'ZQ520 Mobile Printer 4"',
    serialNumber: 'XXJ201948212',
    macAddress: '00:19:B9:5A:21:90',
    ipAddress: '172.23.87.147',
    barcode: 'PRN-10303',
    status: 'en_custodia',
    batteryLevel: 92,
    hasHolster: false,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 06',
    loanHistory: [],
    notes: 'Operativa con cargador original.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-103-08',
    storeId: 'store-103',
    storeCode: 103,
    storeName: 'Megaplaza',
    equipmentCode: 'PDA-T103-05',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Android 11',
    serialNumber: '21085523091005',
    macAddress: '3C:E1:A1:4B:22:15',
    ipAddress: '172.23.87.148',
    barcode: 'PDA-10305',
    status: 'en_custodia',
    batteryLevel: 100,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 07',
    loanHistory: [],
    notes: 'Equipo nuevo reemplazo entregado por Sistemas.',
    updatedAt: new Date().toISOString()
  },

  // --- TIENDA 104 LAS BEGONIAS ---
  {
    id: 'dev-104-01',
    storeId: 'store-104',
    storeCode: 104,
    storeName: 'Las Begonias',
    equipmentCode: 'PDA-T104-01',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Touch Computer',
    serialNumber: '21085523092001',
    barcode: 'PDA-10401',
    status: 'en_uso',
    batteryLevel: 65,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 01',
    currentBorrower: {
      fotocheck: 'FC-20194',
      dni: '74820194',
      name: 'Luis Fernando Cárdenas Soto',
      cargo: 'Jefe de Sección Abarrotes',
      area: 'Abarrotes & Bazar',
      phone: '987 654 321',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 2.1 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '11:15 AM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Roberto Quispe',
      expectedReturnTime: '19:00'
    },
    hoursInUse: 2.1,
    isOverdue: false,
    loanHistory: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-104-02',
    storeId: 'store-104',
    storeCode: 104,
    storeName: 'Las Begonias',
    equipmentCode: 'PRN-T104-01',
    deviceType: 'Impresora Portátil',
    brand: 'Zebra',
    model: 'ZQ320 Mobile Printer',
    serialNumber: 'XXJ201948301',
    barcode: 'PRN-10401',
    status: 'en_custodia',
    batteryLevel: 95,
    hasHolster: false,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 02',
    loanHistory: [],
    updatedAt: new Date().toISOString()
  },

  // --- TIENDA 105 LA MARINA ---
  {
    id: 'dev-105-01',
    storeId: 'store-105',
    storeCode: 105,
    storeName: 'La Marina',
    equipmentCode: 'PDA-T105-01',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Touch Computer',
    serialNumber: '21085523093001',
    barcode: 'PDA-10501',
    status: 'en_uso',
    batteryLevel: 80,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 01',
    currentBorrower: {
      fotocheck: 'FC-30105',
      dni: '73910284',
      name: 'Alonso Gabriel Vargas Paredes',
      cargo: 'Asistente de Plataforma',
      area: 'Despacho & Almacén',
      phone: '939 102 847',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '09:00 AM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Jorge Salazar',
      expectedReturnTime: '17:30'
    },
    hoursInUse: 4,
    isOverdue: false,
    loanHistory: [],
    updatedAt: new Date().toISOString()
  },

  // --- TIENDA 123 ANGAMAS ---
  {
    id: 'dev-123-01',
    storeId: 'store-123',
    storeCode: 123,
    storeName: 'Angamas',
    equipmentCode: 'PDA-T123-01',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC26 Touch Computer',
    serialNumber: '21085523094001',
    barcode: 'PDA-12301',
    status: 'en_uso',
    batteryLevel: 70,
    hasHolster: true,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 01',
    currentBorrower: {
      fotocheck: 'FC-40123',
      dni: '71829401',
      name: 'Fiorella Belén Alarcón Ponce',
      cargo: 'Encargada de Fila Cero Cajas',
      area: 'Cajas & Frontline',
      phone: '928 401 928',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      borrowedAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      borrowedTimeFormatted: '12:00 PM',
      borrowedDateFormatted: '10/09/2026',
      releasedByCctvAgent: 'Oficial CCTV: Andrés Morales',
      expectedReturnTime: '20:00'
    },
    hoursInUse: 1.5,
    isOverdue: false,
    loanHistory: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dev-123-02',
    storeId: 'store-123',
    storeCode: 123,
    storeName: 'Angamas',
    equipmentCode: 'PRN-T123-01',
    deviceType: 'Impresora Portátil',
    brand: 'Zebra',
    model: 'ZQ520 Mobile Printer',
    serialNumber: 'XXJ201948401',
    barcode: 'PRN-12301',
    status: 'en_custodia',
    batteryLevel: 100,
    hasHolster: false,
    hasStrap: true,
    locationInStore: 'Casillero CCTV N° 02',
    loanHistory: [],
    updatedAt: new Date().toISOString()
  }
];

export const FALABELLA_AI_MONITORING_URL = 'https://ai-monitoring.falabella.com/login';

// Sound synthesis for barcode scanner gun feedback (Zebra / Honeywell style)
export function playScannerBeep(type: 'success' | 'error' | 'warning' = 'success') {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    if (type === 'success') {
      // Crisp 2400Hz 75ms Zebra scanner high beep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'error') {
      // Double low buzz
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc1.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
      gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.25);
    } else {
      // Warning chime
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    }
  } catch (e) {
    // Graceful fallback
  }
}
