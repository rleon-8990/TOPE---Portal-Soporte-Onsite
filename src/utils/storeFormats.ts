import { Store } from '../types';

export type EmpresaTienda = 'Hipermercados Tottus S.A.' | 'HiperBodegas Precio Uno';

export interface FormatTaxonomyItem {
  empresa: EmpresaTienda;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const TOTTUS_FORMATS = [
  'Hiper',
  'Hiper Compacto',
  'Super',
  'Super Extendido',
  'Vecino'
] as const;

export const PRECIO_UNO_FORMATS = [
  'HiperBodega',
  'SuperBodega'
] as const;

export const STORE_FORMAT_CONFIG: Record<string, FormatTaxonomyItem> = {
  'Hiper': {
    empresa: 'Hipermercados Tottus S.A.',
    label: 'Hiper',
    color: '#00873d',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    description: 'Grandes hipermercados con surtido completo de alimentación, textil y electro'
  },
  'Hiper Compacto': {
    empresa: 'Hipermercados Tottus S.A.',
    label: 'Hiper Compacto',
    color: '#059669',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
    description: 'Formato mediano optimizado para centros comerciales y zonas urbanas densas'
  },
  'Super': {
    empresa: 'Hipermercados Tottus S.A.',
    label: 'Super',
    color: '#0284c7',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-800',
    borderColor: 'border-sky-300',
    description: 'Supermercado enfocado en frescos, abarrotes y perecibles de conveniencia'
  },
  'Super Extendido': {
    empresa: 'Hipermercados Tottus S.A.',
    label: 'Super Extendido',
    color: '#2563eb',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    description: 'Supermercado de alta capacidad con surtido ampliado de hogar y no perecibles'
  },
  'Vecino': {
    empresa: 'Hipermercados Tottus S.A.',
    label: 'Vecino',
    color: '#7c3aed',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-300',
    description: 'Tienda de proximidad barrial enfocada en compras rápidas del día a día'
  },
  'HiperBodega': {
    empresa: 'HiperBodegas Precio Uno',
    label: 'HiperBodega',
    color: '#ea580c',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-300',
    description: 'Formato mayorista / descuento con precios bajos y compras por volumen'
  },
  'SuperBodega': {
    empresa: 'HiperBodegas Precio Uno',
    label: 'SuperBodega',
    color: '#dc2626',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-300',
    description: 'Bodega de conveniencia y precios competitivos en zonas populares'
  }
};

/**
 * Normaliza cualquier variante de formato encontrada en bases de datos a la taxonomía oficial
 */
export function normalizeStoreFormat(rawFormat?: string): string {
  if (!rawFormat) return 'Hiper';
  const clean = rawFormat.trim().toLowerCase();

  if (clean.includes('hiper') && clean.includes('bodega')) return 'HiperBodega';
  if (clean.includes('super') && clean.includes('bodega')) return 'SuperBodega';
  if (clean.includes('hiper') && clean.includes('compacto')) return 'Hiper Compacto';
  if (clean.includes('super') && clean.includes('extendido')) return 'Super Extendido';
  if (clean === 'hiper' || clean.startsWith('hiper')) return 'Hiper';
  if (clean === 'super' || clean.startsWith('super')) return 'Super';
  if (clean.includes('vecino')) return 'Vecino';
  if (clean.includes('bodega')) return 'HiperBodega';

  return rawFormat;
}

/**
 * Retorna la empresa matriz correspondiente según el formato oficial
 */
export function getStoreEmpresa(format?: string): EmpresaTienda {
  const norm = normalizeStoreFormat(format);
  if (norm === 'HiperBodega' || norm === 'SuperBodega') {
    return 'HiperBodegas Precio Uno';
  }
  return 'Hipermercados Tottus S.A.';
}
