import { EmailRecipient, EmailTemplate, EmailDispatchRecord } from '../types';

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'aviso_mantenimiento',
    name: 'Aviso de Mantenimiento',
    subject: 'Aviso de Mantenimiento Programado',
    body: `Dear allar [NOMBRE],

Aviso de Mantenimiento Programado estor camdarvador, [NOMBRE], que puela enger22 la con ampeado de entroleidos en la sede [TIENDA].

Se ejecutará una ventana de inspección de comunicaciones, equipos POS y balanzas el día [FECHA] a las [HORA] horas.

Agradecemos coordinar los accesos correspondientes con el equipo técnico acreditado.

Atentamente,
Ricardo León - Soporte Onsite & Infraestructura
[Aviso + NOMBRE]`
  },
  {
    id: 'mantenimiento_cajas',
    name: 'Mantenimiento Preventivo Cajas & POS',
    subject: 'Ventana de Mantenimiento Preventivo - Línea de Cajas POS',
    body: `Estimado/a [NOMBRE],

Por medio de la presente, comunicamos que se llevará a cabo la calibración, limpieza técnica y prueba de contingencia offline de las cajas POS en la tienda [TIENDA].

Fecha programada: [FECHA]
Hora de inicio: [HORA]
Duración estimada: 2 horas (en horario de baja afluencia).

Favor de coordinar con el Supervisor de Cajas y el IT Operator asignado a su sede.

Saludos cordiales,
Ricardo León - Jefatura de Soporte Onsite`
  },
  {
    id: 'parada_frio',
    name: 'Parada Programada Frío Alimentario',
    subject: 'URGENTE: Parada Programada y Mantenimiento de Central de Frío',
    body: `Estimado/a [NOMBRE],

Se notifica a Gerencia y Prevención de [TIENDA] la parada técnica controlada de los compresores de la Central de Frío para mantenimiento del sistema de control y monitoreo de temperatura.

Fecha: [FECHA]
Horario: [HORA]
Medida preventiva: Mantener cortinas nocturnas cerradas y verificar alarmas en panel Dixell.

Atentamente,
Área de Infraestructura & Frío Industrial Tottus`
  },
  {
    id: 'red_switch',
    name: 'Ventana de Mantenimiento Red / Switch Core',
    subject: 'Aviso Técnico: Mantenimiento e Inyección de Firmware en Switches Core',
    body: `Estimado equipo de [TIENDA] y [NOMBRE],

El área de Redes & Telecomunicaciones ejecutará una actualización programada en los switches de distribución y Access Points de su sucursal.

Fecha: [FECHA] a las [HORA] hrs.
Impacto: Se prevé micro-cortes de red de hasta 5 minutos en terminales RF y POS de pasillo. Los enlaces SD-WAN conmutarán al backup 4G.

Coordinación: Mesa de Ayuda TI / IT Operator Onsite.`
  },
  {
    id: 'alerta_zonal',
    name: 'Alerta Zonal / Incidencia Crítica',
    subject: 'ALERTA OPERATIVA: Protocolo de Contingencia Zonal Activo',
    body: `A la atención de [NOMBRE] - [TIENDA],

Debido a contingencia reportada en la red metropolitana, solicitamos aplicar el checklist de verificación operativa en todos los servidores de tienda y sistemas de cobro.

Monitorear el estado de enlaces y reportar cualquier anomalía al canal de radio o helpdesk corporativo de forma inmediata.

Mando de Control de Operaciones Onsite Tottus`
  }
];

export const INITIAL_RECIPIENTS: EmailRecipient[] = [
  // Clientes VIP / Screenshot contacts
  {
    id: 'rec_vip_1',
    name: 'Ines Sanchez',
    email: 'ines@vip.com',
    storeName: 'Sede Central San Isidro',
    roleOrGroup: 'Comité de Calidad & Operaciones',
    category: 'vip',
    selected: true
  },
  {
    id: 'rec_vip_2',
    name: 'Juan Perez',
    email: 'juan@perez.net',
    storeName: 'Hipermercado MegaPlaza',
    roleOrGroup: 'Gestor de Infraestructura Senior',
    category: 'vip',
    selected: true
  },

  // Tiendas (CSV / Tiendas)
  {
    id: 'rec_td_1',
    name: 'Gerencia Tottus MegaPlaza (01)',
    email: 'gte.megaplaza@tottus.com.pe',
    storeName: 'Hiper Tottus MegaPlaza',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_2',
    name: 'Gerencia Tottus San Isidro (02)',
    email: 'gte.sanisidro@tottus.com.pe',
    storeName: 'Hiper Tottus San Isidro',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_3',
    name: 'Gerencia Tottus Las Begonias (03)',
    email: 'gte.begonias@tottus.com.pe',
    storeName: 'Super Tottus Las Begonias',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_4',
    name: 'Gerencia Tottus Jockey Plaza (04)',
    email: 'gte.jockey@tottus.com.pe',
    storeName: 'Hiper Tottus Jockey Plaza',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_5',
    name: 'Gerencia Tottus Mall del Sur (08)',
    email: 'gte.malldelsur@tottus.com.pe',
    storeName: 'Hiper Tottus Mall del Sur',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_6',
    name: 'Gerencia Tottus Trujillo Mall (12)',
    email: 'gte.trujillomall@tottus.com.pe',
    storeName: 'Hiper Tottus Trujillo Mall',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_7',
    name: 'Gerencia Tottus Arequipa Porongoche (15)',
    email: 'gte.arequipa@tottus.com.pe',
    storeName: 'Hiper Tottus Porongoche Arequipa',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },
  {
    id: 'rec_td_8',
    name: 'Gerencia Tottus Huancayo (20)',
    email: 'gte.huancayo@tottus.com.pe',
    storeName: 'Hiper Tottus Huancayo',
    roleOrGroup: 'Gerente de Tienda',
    category: 'tiendas',
    selected: true
  },

  // Cajas
  {
    id: 'rec_caja_1',
    name: 'Jefatura Cajas Lima Norte',
    email: 'sup.cajas.norte@tottus.com.pe',
    storeName: 'Zona Norte Lima',
    roleOrGroup: 'Supervisor Regional de Cajas',
    category: 'cajas',
    selected: false
  },
  {
    id: 'rec_caja_2',
    name: 'Jefatura Cajas Lima Sur',
    email: 'sup.cajas.sur@tottus.com.pe',
    storeName: 'Zona Sur Lima',
    roleOrGroup: 'Supervisor Regional de Cajas',
    category: 'cajas',
    selected: false
  },
  {
    id: 'rec_caja_3',
    name: 'Jefatura Cajas Provincias Norte',
    email: 'sup.cajas.provincias@tottus.com.pe',
    storeName: 'Zona Nor-Oriente',
    roleOrGroup: 'Supervisor de Cajas',
    category: 'cajas',
    selected: false
  },

  // Prevención de Pérdidas
  {
    id: 'rec_prev_1',
    name: 'Prevención Lima Centro & San Isidro',
    email: 'prevencion.sanisidro@tottus.com.pe',
    storeName: 'Tottus San Isidro',
    roleOrGroup: 'Jefe de Prevención y Seguridad',
    category: 'prevencion',
    selected: false
  },
  {
    id: 'rec_prev_2',
    name: 'Prevención Lima Este & Ate',
    email: 'prevencion.este@tottus.com.pe',
    storeName: 'Tottus Puruchuco / Ate',
    roleOrGroup: 'Jefe de Prevención y Seguridad',
    category: 'prevencion',
    selected: false
  },
  {
    id: 'rec_prev_3',
    name: 'Central Nacional de Monitoreo CCTV',
    email: 'cctv.nacional@tottus.com.pe',
    storeName: 'Edificio Corporativo Falabella',
    roleOrGroup: 'Supervisión Central de Seguridad',
    category: 'prevencion',
    selected: false
  },

  // Gerentes Zonales
  {
    id: 'rec_zonal_1',
    name: 'Ing. Carlos Mendoza (Zonal Lima Norte)',
    email: 'carlos.mendoza@tottus.com.pe',
    storeName: 'Región Lima Norte (18 Tiendas)',
    roleOrGroup: 'Gerente Zonal de Operaciones',
    category: 'zonales',
    selected: false
  },
  {
    id: 'rec_zonal_2',
    name: 'Lic. Mariana Ramos (Zonal Lima Sur & Centro)',
    email: 'mariana.ramos@tottus.com.pe',
    storeName: 'Región Lima Sur (22 Tiendas)',
    roleOrGroup: 'Gerente Zonal de Operaciones',
    category: 'zonales',
    selected: false
  },
  {
    id: 'rec_zonal_3',
    name: 'Ing. Fernando Castro (Zonal Provincias Norte)',
    email: 'fernando.castro@tottus.com.pe',
    storeName: 'Región Norte (Trujillo, Piura, Chiclayo)',
    roleOrGroup: 'Gerente Zonal de Operaciones',
    category: 'zonales',
    selected: false
  },
  {
    id: 'rec_zonal_4',
    name: 'Ing. Patricia Villanueva (Zonal Provincias Sur)',
    email: 'patricia.villanueva@tottus.com.pe',
    storeName: 'Región Sur (Arequipa, Cusco, Ica)',
    roleOrGroup: 'Gerente Zonal de Operaciones',
    category: 'zonales',
    selected: false
  },

  // Gerentes de Tienda
  {
    id: 'rec_gte_1',
    name: 'David Zavaleta (Tottus San Miguel)',
    email: 'david.zavaleta@tottus.com.pe',
    storeName: 'Hiper Tottus San Miguel',
    roleOrGroup: 'Gerente de Tienda',
    category: 'gerentes',
    selected: false
  },
  {
    id: 'rec_gte_2',
    name: 'Carmen Delgado (Tottus Atocongo)',
    email: 'carmen.delgado@tottus.com.pe',
    storeName: 'Hiper Tottus Atocongo',
    roleOrGroup: 'Gerente de Tienda',
    category: 'gerentes',
    selected: false
  },
  {
    id: 'rec_gte_3',
    name: 'Roberto Valdivia (Tottus Fontana)',
    email: 'roberto.valdivia@tottus.com.pe',
    storeName: 'Super Tottus La Fontana',
    roleOrGroup: 'Gerente de Tienda',
    category: 'gerentes',
    selected: false
  },

  // Lista Complementaria (IT Operators & Proveedores Especialistas)
  {
    id: 'rec_comp_1',
    name: 'Cuadrilla Frío Johnson Controls',
    email: 'soporte.johnson@partner-tottus.com',
    storeName: 'Contratista Nacional',
    roleOrGroup: 'Especialista Frío Alimentario',
    category: 'complementaria',
    selected: false
  },
  {
    id: 'rec_comp_2',
    name: 'Cuadrilla Climatización Daikin Onsite',
    email: 'soporte.daikin@partner-tottus.com',
    storeName: 'Contratista Nacional',
    roleOrGroup: 'Especialista HVAC',
    category: 'complementaria',
    selected: false
  },
  {
    id: 'rec_comp_3',
    name: 'IT Support Onsite Fast Response',
    email: 'it.soporte.onsite@tottus.com.pe',
    storeName: 'Soporte de Campo Lima',
    roleOrGroup: 'IT Operator Onsite',
    category: 'complementaria',
    selected: false
  }
];

export const INITIAL_DISPATCH_HISTORY: EmailDispatchRecord[] = [
  {
    id: 'disp_101',
    timestamp: '2026-09-09 18:30:00',
    templateName: 'Aviso de Mantenimiento',
    subject: 'Aviso de Mantenimiento Preventivo Cajas & Red - Región Lima Norte',
    totalRecipients: 24,
    successfulSends: 24,
    failedSends: 0,
    scheduledFor: '2026-09-09 18:30',
    frequency: 'una_vez',
    status: 'completado',
    senderEmail: 'rleon@tottus.com.pe',
    senderName: 'Ricardo León',
    recipientsSummary: 'Gerentes de Tienda y Supervisores de Cajas Lima Norte'
  },
  {
    id: 'disp_102',
    timestamp: '2026-09-08 09:15:00',
    templateName: 'Parada Programada Frío Alimentario',
    subject: 'URGENTE: Mantenimiento Compresores Central Frío - Tottus Megaplaza',
    totalRecipients: 8,
    successfulSends: 8,
    failedSends: 0,
    scheduledFor: '2026-09-08 09:15',
    frequency: 'una_vez',
    status: 'completado',
    senderEmail: 'rleon@tottus.com.pe',
    senderName: 'Ricardo León',
    recipientsSummary: 'Gerencia Megaplaza, Jefatura Frío y Prevención'
  }
];
