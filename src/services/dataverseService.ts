/**
 * DATAVERSE INTEGRATION SERVICE - TOTTUS ON-SITE CMMS
 * 
 * Contiene las líneas con códigos establecidos, esquemas OData v9.2,
 * configuración de autenticación Azure AD / Microsoft Entra ID y funciones
 * directas para lectura y actualización de tablas existentes en Microsoft Dataverse
 * (Dynamics 365 / Power Apps Dataverse).
 */

import { Store } from '../types';

export interface DataverseConfig {
  tenantId: string;
  clientId: string;
  clientSecret?: string;
  environmentUrl: string; // ej: https://tottus-corp.crm.dynamics.com
  entityPrefix: string;   // ej: cr_cmms_ o crc64_
  entityPluralName: string; // ej: cr_cmms_tiendas
  apiVersion: string;     // ej: v9.2
  accessToken?: string;   // Token Bearer temporal para testing directo
}

export const DEFAULT_DATAVERSE_CONFIG: DataverseConfig = {
  tenantId: 'tottus-corp.onmicrosoft.com',
  clientId: '00000000-0000-0000-0000-000000000000',
  environmentUrl: 'https://tottus-corp.crm.dynamics.com',
  entityPrefix: 'cr_cmms_',
  entityPluralName: 'cr_cmms_tiendas',
  apiVersion: 'v9.2'
};

/**
 * Definición de columnas de esquema Dataverse
 */
export interface DataverseFieldDefinition {
  dataverseColumn: string;
  displayName: string;
  appField: string;
  dataType: 'Edm.Int32' | 'Edm.String' | 'Edm.Decimal' | 'Edm.Int32 (Choice)' | 'Edm.Guid' | 'Edm.DateTimeOffset' | 'Edm.Boolean';
  precision?: number;
  scale?: number;
  description: string;
  isCoordinate?: boolean;
}

/**
 * 1. ESQUEMA TABLA TIENDAS (cr_cmms_tiendas)
 */
export const DATAVERSE_STORE_SCHEMA: DataverseFieldDefinition[] = [
  {
    dataverseColumn: 'cr_cmms_tiendaid',
    displayName: 'ID Primario (GUID)',
    appField: 'id',
    dataType: 'Edm.Guid',
    description: 'Identificador único global generado automáticamente por Dataverse.'
  },
  {
    dataverseColumn: 'cr_cmms_codtienda',
    displayName: 'Número de Tienda',
    appField: 'codTienda',
    dataType: 'Edm.Int32',
    description: 'Código numérico interno oficial Tottus (ej. 103, 104, 114).'
  },
  {
    dataverseColumn: 'cr_cmms_codigo',
    displayName: 'Código Formato',
    appField: 'code',
    dataType: 'Edm.String',
    description: 'Código de identificación alfanumérico (ej. T-103, T-104).'
  },
  {
    dataverseColumn: 'cr_cmms_nombre',
    displayName: 'Nombre de Tienda / Sucursal',
    appField: 'name',
    dataType: 'Edm.String',
    description: 'Nombre comercial de la sucursal (ej. Megaplaza, Las Begonias).'
  },
  {
    dataverseColumn: 'cr_cmms_cecosap',
    displayName: 'Centro de Costo SAP (CECO)',
    appField: 'centroCostoSap',
    dataType: 'Edm.String',
    description: 'Código de Centro de Costos SAP (ej. P009100101).'
  },
  {
    dataverseColumn: 'cr_cmms_latitud',
    displayName: 'Latitud GPS',
    appField: 'latitud',
    dataType: 'Edm.Decimal',
    precision: 9,
    scale: 6,
    description: 'Coordenada geográfica de latitud (-90.000000 a +90.000000). Rango Perú: -18.35 a -0.03.',
    isCoordinate: true
  },
  {
    dataverseColumn: 'cr_cmms_longitud',
    displayName: 'Longitud GPS',
    appField: 'longitud',
    dataType: 'Edm.Decimal',
    precision: 9,
    scale: 6,
    description: 'Coordenada geográfica de longitud (-180.000000 a +180.000000). Rango Perú: -81.33 a -68.65.',
    isCoordinate: true
  },
  {
    dataverseColumn: 'cr_cmms_direccion',
    displayName: 'Dirección Física',
    appField: 'direccion',
    dataType: 'Edm.String',
    description: 'Dirección física completa de la sucursal.'
  },
  {
    dataverseColumn: 'cr_cmms_distrito',
    displayName: 'Distrito',
    appField: 'distrito',
    dataType: 'Edm.String',
    description: 'Distrito donde se ubica la tienda.'
  },
  {
    dataverseColumn: 'cr_cmms_provincia',
    displayName: 'Provincia',
    appField: 'provincia',
    dataType: 'Edm.String',
    description: 'Provincia de ubicación.'
  },
  {
    dataverseColumn: 'cr_cmms_region',
    displayName: 'Región Geográfica',
    appField: 'region',
    dataType: 'Edm.String',
    description: 'Lima y Callao, Zona Norte, Zona Sur, Zona Centro, Zona Oriente.'
  },
  {
    dataverseColumn: 'cr_cmms_formato',
    displayName: 'Formato Comercial',
    appField: 'formato',
    dataType: 'Edm.String',
    description: 'Hiper, Super, Vecino, Express, Power Center.'
  },
  {
    dataverseColumn: 'cr_cmms_encargadoti',
    displayName: 'Especialista TI Responsable',
    appField: 'itOperator',
    dataType: 'Edm.String',
    description: 'Nombre del operador o especialista asignado desde el Directorio TI.'
  },
  {
    dataverseColumn: 'cr_cmms_gerente',
    displayName: 'Gerente de Tienda',
    appField: 'gerenteTienda',
    dataType: 'Edm.String',
    description: 'Nombre del gerente de tienda.'
  },
  {
    dataverseColumn: 'cr_cmms_gzonal',
    displayName: 'Gerencia Zonal',
    appField: 'gZonal',
    dataType: 'Edm.String',
    description: 'Gerente zonal a cargo.'
  },
  {
    dataverseColumn: 'cr_cmms_ipred',
    displayName: 'Segmento IP de Red',
    appField: 'ipRed',
    dataType: 'Edm.String',
    description: 'Segmento de red asignado (ej. 10.103.0.0/24).'
  },
  {
    dataverseColumn: 'cr_cmms_situacion',
    displayName: 'Situación Inmueble',
    appField: 'situacion',
    dataType: 'Edm.String',
    description: 'Propia, Arrendada o Mixta.'
  }
];

/**
 * 2. ESQUEMA TABLA EQUIPOS / INVENTARIO (cr_cmms_equipos)
 */
export const DATAVERSE_EQUIPMENT_SCHEMA: DataverseFieldDefinition[] = [
  { dataverseColumn: 'cr_cmms_equipoid', displayName: 'ID Primario (GUID)', appField: 'id', dataType: 'Edm.Guid', description: 'GUID único del activo' },
  { dataverseColumn: 'cr_cmms_codigo', displayName: 'Código Activo', appField: 'code', dataType: 'Edm.String', description: 'Código único de equipo (ej. POS-001-CPU)' },
  { dataverseColumn: 'cr_cmms_nombre', displayName: 'Nombre / Descripción', appField: 'name', dataType: 'Edm.String', description: 'Nombre descriptivo del equipo' },
  { dataverseColumn: 'cr_cmms_categoria', displayName: 'Categoría', appField: 'categoryName', dataType: 'Edm.String', description: 'POS CPU, Scanner Balanza, Zebra Handheld, etc.' },
  { dataverseColumn: 'cr_cmms_marca', displayName: 'Marca', appField: 'brand', dataType: 'Edm.String', description: 'NCR, Zebra, Datalogic, Honeywell, etc.' },
  { dataverseColumn: 'cr_cmms_modelo', displayName: 'Modelo', appField: 'model', dataType: 'Edm.String', description: 'Modelo técnico del fabricante' },
  { dataverseColumn: 'cr_cmms_serie', displayName: 'Número de Serie', appField: 'serialNumber', dataType: 'Edm.String', description: 'Número de serie de fábrica' },
  { dataverseColumn: 'cr_cmms_codtienda', displayName: 'Código Tienda', appField: 'storeId', dataType: 'Edm.Int32', description: 'Tienda donde se encuentra asignado' },
  { dataverseColumn: 'cr_cmms_estado', displayName: 'Estado Operativo', appField: 'status', dataType: 'Edm.String', description: 'operativo, falla_menor, falla_critica, baja' },
  { dataverseColumn: 'cr_cmms_criticidad', displayName: 'Nivel de Criticidad', appField: 'criticality', dataType: 'Edm.String', description: 'alta, media, baja' }
];

/**
 * 3. ESQUEMA TABLA TICKETS / HELPDESK (cr_cmms_tickets)
 */
export const DATAVERSE_TICKET_SCHEMA: DataverseFieldDefinition[] = [
  { dataverseColumn: 'cr_cmms_ticketid', displayName: 'ID Primario (GUID)', appField: 'id', dataType: 'Edm.Guid', description: 'GUID único del ticket' },
  { dataverseColumn: 'cr_cmms_numerojr', displayName: 'Ticket JR / Incidencia', appField: 'ticketJR', dataType: 'Edm.String', description: 'Código de ticket corporativo JR (ej. OCR-020126)' },
  { dataverseColumn: 'cr_cmms_titulo', displayName: 'Título / Asunto', appField: 'title', dataType: 'Edm.String', description: 'Breve resumen de la avería o requerimiento' },
  { dataverseColumn: 'cr_cmms_descripcion', displayName: 'Detalle Técnico', appField: 'description', dataType: 'Edm.String', description: 'Descripción completa de la falla' },
  { dataverseColumn: 'cr_cmms_codtienda', displayName: 'Código Tienda', appField: 'storeId', dataType: 'Edm.Int32', description: 'Tienda afectada' },
  { dataverseColumn: 'cr_cmms_prioridad', displayName: 'Prioridad', appField: 'priority', dataType: 'Edm.String', description: 'critica, alta, media, baja' },
  { dataverseColumn: 'cr_cmms_estado', displayName: 'Estado', appField: 'status', dataType: 'Edm.String', description: 'abierto, en_proceso, pendiente_repuesto, resuelto' },
  { dataverseColumn: 'cr_cmms_asignadoa', displayName: 'Especialista TI Asignado', appField: 'assignedTo', dataType: 'Edm.String', description: 'Nombre del técnico Onsite asignado' },
  { dataverseColumn: 'cr_cmms_fechacreacion', displayName: 'Fecha Apertura', appField: 'createdAt', dataType: 'Edm.DateTimeOffset', description: 'Fecha y hora de registro' }
];

/**
 * 4. ESQUEMA TABLA REPUESTOS COTIZADOS (cr_cmms_repuestos_cotizados)
 */
export const DATAVERSE_SPARE_PARTS_SCHEMA: DataverseFieldDefinition[] = [
  { dataverseColumn: 'cr_cmms_repuestoid', displayName: 'ID Primario (GUID)', appField: 'id', dataType: 'Edm.Guid', description: 'GUID único del repuesto cotizado' },
  { dataverseColumn: 'cr_cmms_ticketjr', displayName: 'Ticket JR', appField: 'ticketJR', dataType: 'Edm.String', description: 'Ticket JR asociado a la cotización' },
  { dataverseColumn: 'cr_cmms_proveedor', displayName: 'Proveedor', appField: 'proveedor', dataType: 'Edm.String', description: 'DMS PERU S.A.C, NCR, ZEBRA, PRECISION' },
  { dataverseColumn: 'cr_cmms_numerocotizacion', displayName: 'N° Cotización', appField: 'numeroCotizacion', dataType: 'Edm.String', description: 'Código de cotización del proveedor' },
  { dataverseColumn: 'cr_cmms_partnumber', displayName: 'Part Number (P/N)', appField: 'partNumber', dataType: 'Edm.String', description: 'Número de parte oficial del fabricante' },
  { dataverseColumn: 'cr_cmms_descripcion', displayName: 'Descripción Repuesto', appField: 'descripcionRepuesto', dataType: 'Edm.String', description: 'Detalle de la pieza o componente' },
  { dataverseColumn: 'cr_cmms_cantidad', displayName: 'Cantidad', appField: 'cantidad', dataType: 'Edm.Int32', description: 'Unidades cotizadas' },
  { dataverseColumn: 'cr_cmms_preciototal', displayName: 'Monto Total', appField: 'precioTotal', dataType: 'Edm.Decimal', precision: 12, scale: 2, description: 'Costo total en USD / PEN' },
  { dataverseColumn: 'cr_cmms_solpedsap', displayName: 'SOLPED SAP', appField: 'solpedSap', dataType: 'Edm.String', description: 'Solicitud de pedido SAP' },
  { dataverseColumn: 'cr_cmms_ordencomprasap', displayName: 'Orden Compra SAP (OC)', appField: 'ordenCompraSap', dataType: 'Edm.String', description: 'Orden de compra oficial en SAP' },
  { dataverseColumn: 'cr_cmms_hessap', displayName: 'HES SAP', appField: 'hesSap', dataType: 'Edm.String', description: 'Hoja de Entrada de Servicio SAP' },
  { dataverseColumn: 'cr_cmms_estadovalidacion', displayName: 'Estado Validación', appField: 'estadoValidacion', dataType: 'Edm.String', description: 'validado_conforme, pendiente_validacion, observado_diferencia' }
];

/**
 * 5. ESQUEMA TABLA EQUIPOS BACKUP (cr_cmms_equipos_bkp)
 */
export const DATAVERSE_BKP_SCHEMA: DataverseFieldDefinition[] = [
  { dataverseColumn: 'cr_cmms_bkpid', displayName: 'ID Primario (GUID)', appField: 'id', dataType: 'Edm.Guid', description: 'GUID único del equipo backup' },
  { dataverseColumn: 'cr_cmms_codigobkp', displayName: 'Código BKP', appField: 'codigoBkp', dataType: 'Edm.String', description: 'Código del pool (ej. BKP-ZBR-001)' },
  { dataverseColumn: 'cr_cmms_tipoequipo', displayName: 'Tipo Equipo', appField: 'tipoEquipo', dataType: 'Edm.String', description: 'Handheld, POS, Balanza, etc.' },
  { dataverseColumn: 'cr_cmms_marca', displayName: 'Marca', appField: 'marca', dataType: 'Edm.String', description: 'ZEBRA, NCR, etc.' },
  { dataverseColumn: 'cr_cmms_modelo', displayName: 'Modelo', appField: 'modelo', dataType: 'Edm.String', description: 'Modelo técnico' },
  { dataverseColumn: 'cr_cmms_serie', displayName: 'Número Serie', appField: 'numeroSerie', dataType: 'Edm.String', description: 'Serie de fábrica del BKP' },
  { dataverseColumn: 'cr_cmms_almacenubicacion', displayName: 'Ubicación Almacén', appField: 'almacenUbicacion', dataType: 'Edm.String', description: 'Almacén Central Santa Anita, Taller San Isidro, etc.' },
  { dataverseColumn: 'cr_cmms_estado', displayName: 'Estado Disponibilidad', appField: 'estado', dataType: 'Edm.String', description: 'disponible, prestado, en_reparacion, baja' }
];

/**
 * METADATOS DE TABLAS DATAVERSE DISPONIBLES
 */
export const DATAVERSE_TABLES = [
  { id: 'cr_cmms_tiendas', name: 'Tiendas y Sucursales', schema: DATAVERSE_STORE_SCHEMA, icon: 'store', description: 'Sucursales Tottus y Precio Uno con coordenadas Latitud y Longitud' },
  { id: 'cr_cmms_equipos', name: 'Inventario de Equipos', schema: DATAVERSE_EQUIPMENT_SCHEMA, icon: 'cpu', description: 'Parque de POS, Handhelds, Balanzas y Servidores' },
  { id: 'cr_cmms_tickets', name: 'Helpdesk & Tickets JR', schema: DATAVERSE_TICKET_SCHEMA, icon: 'ticket', description: 'Incidencias JR, asignaciones Onsite y estado de resolución' },
  { id: 'cr_cmms_repuestos_cotizados', name: 'Repuestos Cotizados', schema: DATAVERSE_SPARE_PARTS_SCHEMA, icon: 'tool', description: 'Piezas DMS/NCR/Zebra con cruce SAP (SOLPED, OC, HES)' },
  { id: 'cr_cmms_equipos_bkp', name: 'Pool de Equipos BKP', schema: DATAVERSE_BKP_SCHEMA, icon: 'shield', description: 'Stock de contingencia de TI para relevo en tiendas' }
];

/**
 * CÓDIGOS ESTABLECIDOS: Muestra y exporta las líneas de código exactas
 * para implementar la conexión en Node.js, TypeScript, Power Automate y cURL.
 */
export const DATAVERSE_CODE_SNIPPETS = {
  // 1. Script Node.js con MSAL para Backend o Función Serverless
  nodeJsBackend: `/**
 * SERVICIO BACKEND DATAVERSE - NODE.JS / TYPESCRIPT
 * Dependencias requeridas:
 * npm install @azure/msal-node axios
 */

import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';

// 1. Configuración de Credenciales de Aplicación Azure AD (Microsoft Entra ID)
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'TU_CLIENT_ID_AQUI',
    authority: \`https://login.microsoftonline.com/\${process.env.AZURE_TENANT_ID || 'TU_TENANT_ID'}\`,
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'TU_CLIENT_SECRET_AQUI',
  }
};

const cca = new ConfidentialClientApplication(msalConfig);
const DATAVERSE_ORG_URL = process.env.DATAVERSE_URL || 'https://tottus-corp.crm.dynamics.com';
const API_VERSION = 'v9.2';

/**
 * Obtiene un token Bearer válido para Dataverse mediante Client Credentials
 */
async function getDataverseToken(): Promise<string> {
  const tokenRequest = {
    scopes: [\`\${DATAVERSE_ORG_URL}/.default\`]
  };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  if (!response?.accessToken) {
    throw new Error('No se pudo obtener el token de acceso a Dataverse.');
  }
  return response.accessToken;
}

/**
 * 1. OBTENER TIENDAS DESDE cr_cmms_tiendas
 */
export async function getStoresFromDataverse() {
  const token = await getDataverseToken();
  const selectFields = [
    'cr_cmms_tiendaid',
    'cr_cmms_codtienda',
    'cr_cmms_codigo',
    'cr_cmms_nombre',
    'cr_cmms_cecosap',
    'cr_cmms_latitud',
    'cr_cmms_longitud',
    'cr_cmms_direccion',
    'cr_cmms_distrito',
    'cr_cmms_provincia',
    'cr_cmms_region',
    'cr_cmms_formato',
    'cr_cmms_encargadoti'
  ].join(',');

  const url = \`\${DATAVERSE_ORG_URL}/api/data/\${API_VERSION}/cr_cmms_tiendas?$select=\${selectFields}&$orderby=cr_cmms_codtienda asc\`;
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Accept': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0'
    }
  });

  return response.data.value;
}

/**
 * 2. ACTUALIZAR COORDENADAS GPS (LATITUD Y LONGITUD) DE UNA TIENDA
 */
export async function updateStoreCoordinatesInDataverse(storeGuid: string, latitud: number, longitud: number) {
  const token = await getDataverseToken();
  const url = \`\${DATAVERSE_ORG_URL}/api/data/\${API_VERSION}/cr_cmms_tiendas(\${storeGuid})\`;

  await axios.patch(
    url,
    {
      cr_cmms_latitud: latitud,
      cr_cmms_longitud: longitud
    },
    {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'If-Match': '*'
      }
    }
  );

  return { success: true, storeGuid, latitud, longitud };
}

/**
 * 3. CONSULTAR EQUIPOS DE INVENTARIO (cr_cmms_equipos)
 */
export async function getEquipmentsFromDataverse(codTienda?: number) {
  const token = await getDataverseToken();
  let url = \`\${DATAVERSE_ORG_URL}/api/data/\${API_VERSION}/cr_cmms_equipos?$top=500\`;
  if (codTienda) {
    url += \`&$filter=cr_cmms_codtienda eq \${codTienda}\`;
  }
  const response = await axios.get(url, {
    headers: { 'Authorization': \`Bearer \${token}\`, 'Accept': 'application/json' }
  });
  return response.data.value;
}

/**
 * 4. INSERTAR NUEVO TICKET JR (cr_cmms_tickets)
 */
export async function createTicketInDataverse(ticketData: {
  numeroJR: string;
  titulo: string;
  descripcion: string;
  codTienda: number;
  prioridad: string;
}) {
  const token = await getDataverseToken();
  const url = \`\${DATAVERSE_ORG_URL}/api/data/\${API_VERSION}/cr_cmms_tickets\`;

  const response = await axios.post(
    url,
    {
      cr_cmms_numerojr: ticketData.numeroJR,
      cr_cmms_titulo: ticketData.titulo,
      cr_cmms_descripcion: ticketData.descripcion,
      cr_cmms_codtienda: ticketData.codTienda,
      cr_cmms_prioridad: ticketData.prioridad,
      cr_cmms_estado: 'abierto'
    },
    {
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}`,

  // 2. cURL para pruebas en Postman o Terminal
  curlTest: `### 1. Obtener Token OAuth 2.0 desde Microsoft Entra ID (Terminal / Bash)
curl -X POST https://login.microsoftonline.com/TU_TENANT_ID/oauth2/v2.0/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=TU_CLIENT_ID" \\
  -d "client_secret=TU_CLIENT_SECRET" \\
  -d "scope=https://tottus-corp.crm.dynamics.com/.default"

### 2. Consultar Tiendas con Coordenadas Latitud y Longitud
curl -X GET "https://tottus-corp.crm.dynamics.com/api/data/v9.2/cr_cmms_tiendas?\\$select=cr_cmms_codtienda,cr_cmms_nombre,cr_cmms_latitud,cr_cmms_longitud,cr_cmms_cecosap,cr_cmms_encargadoti" \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \\
  -H "Accept: application/json" \\
  -H "OData-MaxVersion: 4.0" \\
  -H "OData-Version: 4.0"

### 3. Actualizar Coordenada de Tienda (PATCH)
curl -X PATCH "https://tottus-corp.crm.dynamics.com/api/data/v9.2/cr_cmms_tiendas(GUID_DE_LA_TIENDA)" \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "If-Match: *" \\
  -d '{
    "cr_cmms_latitud": -11.993605,
    "cr_cmms_longitud": -77.062062
  }'

### 4. Consultar Tickets Abiertos (cr_cmms_tickets)
curl -X GET "https://tottus-corp.crm.dynamics.com/api/data/v9.2/cr_cmms_tickets?\\$filter=cr_cmms_estado eq 'abierto'" \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \\
  -H "Accept: application/json"`,

  // 3. Flujo Power Automate HTTP Webhook (Opción No-Code para intranet corporativa Tottus)
  powerAutomateWebhook: `{
  "description": "Líneas de conexión mediante Power Automate HTTP Action con conector nativo de Dataverse",
  "step1_trigger": "When an HTTP request is received (Method: POST)",
  "step1_schema": {
    "type": "object",
    "properties": {
      "action": { "type": "string" },
      "storeGuid": { "type": "string" },
      "latitud": { "type": "number" },
      "longitud": { "type": "number" }
    }
  },
  "step2_dataverse_action": "Microsoft Dataverse -> Update a row",
  "dataverse_parameters": {
    "Table name": "cr_cmms_tiendas",
    "Row ID": "@{triggerBody()?['storeGuid']}",
    "Latitud GPS": "@{triggerBody()?['latitud']}",
    "Longitud GPS": "@{triggerBody()?['longitud']}"
  },
  "step3_response": {
    "status": 200,
    "body": {
      "updated": true,
      "timestamp": "@{utcNow()}"
    }
  }
}`
};

/**
 * Validador de coordenadas para Perú:
 * Latitud Perú: entre -18.35 y -0.03
 * Longitud Perú: entre -81.33 y -68.65
 */
export function validateCoordinatesPeru(lat: number | null | undefined, lng: number | null | undefined): {
  isValid: boolean;
  isReversed: boolean;
  message: string;
} {
  if (lat === null || lat === undefined || lng === null || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return { isValid: false, isReversed: false, message: 'Coordenadas sin definir o no numéricas.' };
  }

  // Comprobar si están invertidas (latitud típica de Perú como longitud o viceversa)
  if (lat < -65 && lng > -25 && lng < 0) {
    return {
      isValid: false,
      isReversed: true,
      message: 'Las coordenadas parecen estar invertidas (la Latitud contiene valores de Longitud).'
    };
  }

  const isLatOk = lat >= -18.5 && lat <= -0.01;
  const isLngOk = lng >= -81.5 && lng <= -68.5;

  if (isLatOk && isLngOk) {
    return { isValid: true, isReversed: false, message: 'Coordenadas válidas dentro del territorio peruano.' };
  }

  return {
    isValid: false,
    isReversed: false,
    message: `Coordenadas fuera de los límites de Perú (Latitud: ${lat.toFixed(4)}, Longitud: ${lng.toFixed(4)}).`
  };
}

/**
 * Función en vivo para consultar Dataverse Web API directamente (si se suministra un Token Bearer o proxy)
 */
export async function queryDataverseLive(config: DataverseConfig): Promise<{
  success: boolean;
  stores?: Partial<Store>[];
  count?: number;
  error?: string;
}> {
  if (!config.environmentUrl) {
    return { success: false, error: 'URL de entorno Dataverse no configurada.' };
  }

  if (!config.accessToken) {
    return {
      success: false,
      error: 'Token Bearer no proporcionado. Utilice el código backend de autenticación con Azure AD proporcionado en la pestaña "Códigos Establecidos" para generar el token automáticamente.'
    };
  }

  try {
    const cleanUrl = config.environmentUrl.replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/api/data/${config.apiVersion}/${config.entityPluralName}?$select=cr_cmms_tiendaid,cr_cmms_codtienda,cr_cmms_codigo,cr_cmms_nombre,cr_cmms_cecosap,cr_cmms_latitud,cr_cmms_longitud,cr_cmms_direccion,cr_cmms_distrito,cr_cmms_provincia,cr_cmms_region,cr_cmms_formato,cr_cmms_encargadoti&$top=100`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Error HTTP ${res.status} de Dataverse: ${errText.slice(0, 300)}`
      };
    }

    const data = await res.json();
    const rows = data.value || [];

    const mapped: Partial<Store>[] = rows.map((r: any) => ({
      id: r.cr_cmms_tiendaid || `store-${r.cr_cmms_codtienda}`,
      code: r.cr_cmms_codigo || `T-${r.cr_cmms_codtienda}`,
      codTienda: r.cr_cmms_codtienda,
      name: r.cr_cmms_nombre,
      centroCostoSap: r.cr_cmms_cecosap,
      cecoSap: r.cr_cmms_cecosap,
      latitud: typeof r.cr_cmms_latitud === 'number' ? r.cr_cmms_latitud : undefined,
      longitud: typeof r.cr_cmms_longitud === 'number' ? r.cr_cmms_longitud : undefined,
      direccion: r.cr_cmms_direccion,
      distrito: r.cr_cmms_distrito,
      provincia: r.cr_cmms_provincia,
      region: r.cr_cmms_region,
      formato: r.cr_cmms_formato,
      itOperator: r.cr_cmms_encargadoti
    }));

    return { success: true, stores: mapped, count: mapped.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de red al consultar Dataverse.' };
  }
}
