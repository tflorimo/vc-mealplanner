// Constantes globales de la aplicación.
// Usar estas constantes en lugar de magic numbers o strings.

export const DEFAULT_DINERS = 2;

export const SLOT_TYPES = ['desayuno', 'almuerzo', 'merienda', 'cena'] as const;
export type SlotType = typeof SLOT_TYPES[number];

// Umbral de performance para el motor de compras (en milisegundos)
export const MAX_SHOPPING_CALC_MS = 1500;

// Unidades soportadas para conversión en el motor de compras
export const SUPPORTED_UNITS = ['kg', 'g', 'L', 'ml', 'u'] as const;
export type SupportedUnit = typeof SUPPORTED_UNITS[number];

// ID de usuario por defecto para MVP (single-user)
export const DEFAULT_USER_ID = 1;

// Límite de resultados para autocompletado de ingredientes
export const AUTOCOMPLETE_LIMIT = 10;
