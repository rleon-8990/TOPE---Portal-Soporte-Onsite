/**
 * DATAVERSE INTEGRATION SERVICE - TOTTUS ON-SITE CMMS
 * 
 * Contiene las líneas con códigos establecidos, esquemas de tablas OData v9.2,
 * configuración de autenticación Azure AD / Microsoft Entra ID y funciones
 * directas para lectura y actualización de coordenadas (Latitud y Longitud)
 * hacia Microsoft Dataverse (Dynamics 365 / Power Apps Dataverse).
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
 * Esquema OData y mapeo de campos establecidos en Dataverse
 */
export interface DataverseFieldDefinition {
  dataverseColumn: string;
  displayName: string;
  appField: keyof Store | string;
  dataType: 'Edm.Int32' | 'Edm.String' | 'Edm.Decimal' | 'Edm.Int32 (Choice)' | 'Edm.Guid';
  precision?: number;
  scale?: number;
  description: string;
  isCoordinate?: boolean;
}

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
 * Obtener tiendas desde la tabla cr_cmms_tiendas
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
      'OData-Version': '4.0',
      'Prefer': 'odata.include-annotations="*"'
    }
  });

  return response.data.value;
}

/**
 * Actualizar las coordenadas GPS (Latitud y Longitud) de una tienda en Dataverse
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
        'If-Match': '*' // Evitar conflictos de concurrencia
      }
    }
  );

  return { success: true, storeGuid, latitud, longitud };
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
  }'`,

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
