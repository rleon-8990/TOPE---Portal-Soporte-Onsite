import { CategoryInfo } from '../types';

export const EQUIPMENT_CATEGORIES_STORAGE_KEY = 'portal_onsite_equipment_categories_v1';

/**
 * 19 Equipos / Categorías Oficiales Validadas para Portal OnSite
 */
export const DEFAULT_EQUIPMENT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'pos_cpu',
    name: 'POS - CPU',
    shortCode: 'POS-CPU',
    icon: 'computer',
    description: 'Unidad Central de Procesamiento de Caja POS NCR / HP',
    count: 180,
    vidaUtilDefault: 5
  },
  {
    id: 'pos_dinakey',
    name: 'POS - DINAKEY',
    shortCode: 'POS-DKY',
    icon: 'keyboard',
    description: 'Teclado Programable Dinakey POS para Cajeros',
    count: 180,
    vidaUtilDefault: 5
  },
  {
    id: 'pos_gaveta',
    name: 'POS - GAVETA',
    shortCode: 'POS-GAV',
    icon: 'inbox',
    description: 'Gaveta de Efectivo y Monedero POS con apertura automática',
    count: 180,
    vidaUtilDefault: 5
  },
  {
    id: 'pos_impresora_termica',
    name: 'POS - IMPRESORA TÉRMICA',
    shortCode: 'POS-PRN',
    icon: 'printer',
    description: 'Impresora Térmica Epson TM-T88 / NCR de Comprobantes POS',
    count: 180,
    vidaUtilDefault: 4
  },
  {
    id: 'pos_scanner_balanza',
    name: 'POS - SCANNER/BALANZA Y/O SCANNER DE MANO',
    shortCode: 'POS-SCN',
    icon: 'scale',
    description: 'Lector Bióptico Balanza y/o Scanner de Mano en Checkout',
    count: 180,
    vidaUtilDefault: 7
  },
  {
    id: 'pos_monitor_cliente',
    name: 'POS - MONITOR CLIENTE',
    shortCode: 'POS-MON',
    icon: 'monitor',
    description: 'Monitor / Visor 2x20 o pantalla LCD de Precios para Cliente',
    count: 180,
    vidaUtilDefault: 6
  },
  {
    id: 'sco_cpu',
    name: 'SCO - CPU',
    shortCode: 'SCO-CPU',
    icon: 'cpu',
    description: 'CPU Central de Caja Autoasistida Self-Checkout NCR FastLane',
    count: 64,
    vidaUtilDefault: 5
  },
  {
    id: 'sco_chasis',
    name: 'SCO - CHASIS',
    shortCode: 'SCO-CHS',
    icon: 'box',
    description: 'Mueble, Tolva y Estructura Chasis de Caja Self-Checkout',
    count: 64,
    vidaUtilDefault: 6
  },
  {
    id: 'sco_monitor_cliente',
    name: 'SCO - MONITOR CLIENTE',
    shortCode: 'SCO-MON',
    icon: 'monitor',
    description: 'Monitor Touchscreen Principal de Interacción Cliente SCO',
    count: 64,
    vidaUtilDefault: 6
  },
  {
    id: 'sco_scanner_mano',
    name: 'SCO - SCANNER MANO',
    shortCode: 'SCO-SMN',
    icon: 'scan',
    description: 'Scanner de Mano Auxiliar para Artículos Voluminosos SCO',
    count: 64,
    vidaUtilDefault: 4
  },
  {
    id: 'sco_scanner_torre',
    name: 'SCO - SCANNER TORRE',
    shortCode: 'SCO-STR',
    icon: 'barcode',
    description: 'Scanner de Torre e Integrado Bióptico Vertical SCO',
    count: 64,
    vidaUtilDefault: 4
  },
  {
    id: 'terminal_movil',
    name: 'TERMINAL MOVIL',
    shortCode: 'TM-PDA',
    icon: 'smartphone',
    description: 'Terminales Móviles PDA Zebra TC52 / TC57 Colectores de Datos',
    count: 95,
    vidaUtilDefault: 4
  },
  {
    id: 'balanzas',
    name: 'BALANZAS',
    shortCode: 'BAL',
    icon: 'scale',
    description: 'Balanzas de Pesaje y Etiquetado Carnes, Fiambres y Verduras',
    count: 48,
    vidaUtilDefault: 7
  },
  {
    id: 'consulta_precios',
    name: 'CONSULTA PRECIOS',
    shortCode: 'CPR',
    icon: 'search',
    description: 'Terminales Verificadores de Precio Multimedia en Pasillo',
    count: 52,
    vidaUtilDefault: 5
  },
  {
    id: 'reloj_marcador',
    name: 'RELOJ MARCADOR',
    shortCode: 'RLJ',
    icon: 'clock',
    description: 'Reloj Control Biométrico de Asistencia y Turnos GeoVictoria',
    count: 90,
    vidaUtilDefault: 5
  },
  {
    id: 'scanner_de_mano',
    name: 'SCANNER DE MANO',
    shortCode: 'SCN',
    icon: 'qr_code_scanner',
    description: 'Pistolas Lectoras de Código de Barras 1D/2D Alámbricas e Inalámbricas',
    count: 110,
    vidaUtilDefault: 4
  },
  {
    id: 'impresora_portatil',
    name: 'IMPRESORA PORTATIL',
    shortCode: 'PRN-PRT',
    icon: 'printer',
    description: 'Impresora Móvil de Etiquetas Zebra ZQ520 para Operarios de Tienda',
    count: 45,
    vidaUtilDefault: 4
  },
  {
    id: 'impresora_industrial',
    name: 'IMPRESORA INDUSTRIAL',
    shortCode: 'PRN-IND',
    icon: 'printer',
    description: 'Impresoras Industriales Térmicas Zebra ZT411 de Almacén y Trastienda',
    count: 38,
    vidaUtilDefault: 4
  },
  {
    id: 'impresora_devoluciones_cyc',
    name: 'IMPRESORA DEVOLUCIONES C&C',
    shortCode: 'PRN-CYC',
    icon: 'printer',
    description: 'Impresora de Guías y Devoluciones de Pedidos Click & Collect',
    count: 32,
    vidaUtilDefault: 4
  }
];

/**
 * Obtiene la lista activa de categorías de equipos (oficiales + personalizadas)
 */
export function getStoredEquipmentCategories(): CategoryInfo[] {
  if (typeof window === 'undefined') {
    return DEFAULT_EQUIPMENT_CATEGORIES;
  }

  try {
    const raw = localStorage.getItem(EQUIPMENT_CATEGORIES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_EQUIPMENT_CATEGORIES;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_EQUIPMENT_CATEGORIES;
    }

    // Mapa base con los 19 oficiales
    const categoryMap = new Map<string, CategoryInfo>();
    DEFAULT_EQUIPMENT_CATEGORIES.forEach(cat => categoryMap.set(cat.id, { ...cat }));

    // Integrar las categorías guardadas (actualizar existentes o añadir personalizadas)
    parsed.forEach((cat: any) => {
      if (cat && cat.id && cat.name) {
        categoryMap.set(cat.id, {
          id: String(cat.id),
          name: String(cat.name).trim(),
          shortCode: String(cat.shortCode || cat.id.toUpperCase().substring(0, 7)).trim(),
          icon: String(cat.icon || 'box'),
          description: String(cat.description || `Equipo ${cat.name}`),
          count: typeof cat.count === 'number' ? cat.count : 0,
          isCustom: cat.isCustom ?? !DEFAULT_EQUIPMENT_CATEGORIES.some(d => d.id === cat.id),
          vidaUtilDefault: typeof cat.vidaUtilDefault === 'number' ? cat.vidaUtilDefault : 5
        });
      }
    });

    return Array.from(categoryMap.values());
  } catch (e) {
    console.warn('Error reading stored equipment categories, using default list', e);
    return DEFAULT_EQUIPMENT_CATEGORIES;
  }
}

/**
 * Añade un nuevo equipo / categoría al catálogo dinámico
 */
export function addCustomEquipmentCategory(
  category: Omit<CategoryInfo, 'id' | 'count'> & { id?: string }
): { success: boolean; category?: CategoryInfo; error?: string } {
  const trimmedName = category.name.trim();
  if (!trimmedName) {
    return { success: false, error: 'El nombre del equipo no puede estar vacío.' };
  }

  const currentCategories = getStoredEquipmentCategories();

  // Verificar si ya existe un equipo con el mismo nombre (insensible a mayúsculas)
  const existing = currentCategories.find(
    c => c.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (existing) {
    return { success: false, error: `Ya existe un equipo registrado como "${existing.name}".` };
  }

  // Generar ID seguro
  const generatedId = category.id || 
    trimmedName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remover tildes
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

  const finalShortCode = (category.shortCode || trimmedName.substring(0, 8))
    .toUpperCase()
    .replace(/\s+/g, '-');

  const newCategory: CategoryInfo = {
    id: generatedId,
    name: trimmedName,
    shortCode: finalShortCode,
    icon: category.icon || 'computer',
    description: category.description || `Categoría de equipo ${trimmedName}`,
    count: 0,
    isCustom: true,
    vidaUtilDefault: category.vidaUtilDefault || 5
  };

  const updatedList = [...currentCategories, newCategory];

  try {
    localStorage.setItem(EQUIPMENT_CATEGORIES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Error saving new equipment category to localStorage', e);
  }

  return { success: true, category: newCategory };
}

/**
 * Elimina una categoría personalizada (las 19 oficiales están protegidas)
 */
export function deleteCustomEquipmentCategory(categoryId: string): { success: boolean; error?: string } {
  const isDefault = DEFAULT_EQUIPMENT_CATEGORIES.some(d => d.id === categoryId);
  if (isDefault) {
    return { success: false, error: 'No es posible eliminar los 19 equipos oficiales base del Portal OnSite.' };
  }

  const currentCategories = getStoredEquipmentCategories();
  const updatedList = currentCategories.filter(c => c.id !== categoryId);

  try {
    localStorage.setItem(EQUIPMENT_CATEGORIES_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Error deleting custom category from localStorage', e);
  }

  return { success: true };
}

/**
 * Valida si un nombre o id de categoría corresponde a un equipo reconocido
 */
export function validateCategoryIsEquipment(categoryNameOrId: string): boolean {
  if (!categoryNameOrId) return false;
  const categories = getStoredEquipmentCategories();
  const search = categoryNameOrId.toLowerCase().trim();

  return categories.some(
    c => c.id.toLowerCase() === search || c.name.toLowerCase() === search
  );
}

/**
 * Restablece las categorías a los 19 equipos base
 */
export function resetEquipmentCategoriesToDefaults(): CategoryInfo[] {
  try {
    localStorage.removeItem(EQUIPMENT_CATEGORIES_STORAGE_KEY);
  } catch (e) {}
  return DEFAULT_EQUIPMENT_CATEGORIES;
}
