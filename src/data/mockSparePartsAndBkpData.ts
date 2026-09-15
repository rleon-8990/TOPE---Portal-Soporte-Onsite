import {
  ProviderQuoteSparePart,
  BackupEquipment,
  EquipmentCoverageMovement,
  InternalSparePart,
  InternalSpareConsumption,
  CoverageValidationAudit
} from '../types';

/**
 * DATAVERSE LINKED STOCKS & TRACEABILITY
 * 
 * Los datos ficticios han sido removidos para producción.
 * Esta capa se conecta a las entidades existentes en Microsoft Dataverse:
 * - cr_cmms_repuestos_cotizados (Repuestos suministrados por proveedores DMS, NCR, Zebra)
 * - cr_cmms_equipos_bkp (Stock de contingencia BKP en almacenes y talleres TI)
 * - cr_cmms_movimientos_cobertura (Trazabilidad de traslados BKP entre tiendas)
 * - cr_cmms_repuestos_taller (Stock interno de consumibles de laboratorio)
 * - cr_cmms_consumos_taller (Registro de consumo por orden de trabajo)
 * - cr_cmms_auditorias_cobertura (Actas y dictámenes de validación SAP/HES)
 */

/**
 * 1. REPUESTOS SUMINISTRADOS POR PROVEEDORES VINCULADOS A COTIZACIONES
 * Tabla Dataverse: cr_cmms_repuestos_cotizados
 */
export const INITIAL_PROVIDER_QUOTE_PARTS: ProviderQuoteSparePart[] = [];

/**
 * 2. POOL DE EQUIPOS BACKUP (BKP / STOCK DE CONTINGENCIA DE TI)
 * Tabla Dataverse: cr_cmms_equipos_bkp
 */
export const INITIAL_BACKUP_EQUIPMENT: BackupEquipment[] = [];

/**
 * 3. MOVIMIENTOS Y PRÉSTAMOS DE EQUIPOS BKP ENTRE TIENDAS
 * Tabla Dataverse: cr_cmms_movimientos_cobertura
 */
export const INITIAL_COVERAGE_MOVEMENTS: EquipmentCoverageMovement[] = [];

/**
 * 4. STOCK INTERNO DE REPUESTOS EN TALLER CENTRAL TI
 * Tabla Dataverse: cr_cmms_repuestos_taller
 */
export const INITIAL_INTERNAL_SPARE_PARTS: InternalSparePart[] = [];

/**
 * 5. REGISTRO DE CONSUMOS DE REPUESTOS INTERNOS EN INTERVENCIONES
 * Tabla Dataverse: cr_cmms_consumos_taller
 */
export const INITIAL_INTERNAL_CONSUMPTIONS: InternalSpareConsumption[] = [];

/**
 * 6. AUDITORÍAS DE COBERTURA Y CONCILIACIÓN
 * Tabla Dataverse: cr_cmms_auditorias_cobertura
 */
export const INITIAL_COVERAGE_AUDITS: CoverageValidationAudit[] = [];
