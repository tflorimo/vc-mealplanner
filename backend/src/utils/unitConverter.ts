// Conversor de unidades para el motor de proyección de compras.
// Solo maneja conversiones dentro del mismo grupo (masa, volumen, piezas).
// Si las unidades son incompatibles, lanza UnitConversionError (error de datos,
// que debe detectarse al guardar la receta, no al calcular).

export class UnitConversionError extends Error {
  constructor(fromUnit: string, toUnit: string) {
    super(`No se puede convertir de '${fromUnit}' a '${toUnit}': unidades incompatibles.`);
    this.name = 'UnitConversionError';
  }
}

// Factor de conversión hacia la unidad base del grupo.
// Grupo masa: base = kg
// Grupo volumen: base = L
// Grupo piezas: base = u (no hay conversión)
const CONVERSION_TO_BASE: Record<string, number> = {
  kg:  1,
  g:   0.001,     // 1g = 0.001kg
  L:   1,
  ml:  0.001,     // 1ml = 0.001L
  u:   1,
};

// Mapeo de cada unidad a su grupo
const UNIT_GROUP: Record<string, string> = {
  kg:  'masa',
  g:   'masa',
  L:   'volumen',
  ml:  'volumen',
  u:   'pieza',
};

// Convierte 'quantity' expresada en 'fromUnit' a 'toUnit'.
// Ejemplo: convertToUnit(500, 'g', 'kg') → 0.5
// Precondición: fromUnit y toUnit deben ser del mismo grupo.
export function convertToUnit(quantity: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return quantity;

  const fromGroup = UNIT_GROUP[fromUnit];
  const toGroup = UNIT_GROUP[toUnit];

  if (!fromGroup || !toGroup) {
    throw new UnitConversionError(fromUnit, toUnit);
  }

  if (fromGroup !== toGroup) {
    throw new UnitConversionError(fromUnit, toUnit);
  }

  const fromFactor = CONVERSION_TO_BASE[fromUnit];
  const toFactor = CONVERSION_TO_BASE[toUnit];

  if (fromFactor === undefined || toFactor === undefined) {
    throw new UnitConversionError(fromUnit, toUnit);
  }

  // Convertir a base, luego a destino
  const inBase = quantity * fromFactor;
  return inBase / toFactor;
}

// Convierte directamente a la unidad base del grupo (kg, L, u)
// Usado por el motor de compras para normalizar antes de sumar.
export function convertToBaseUnit(quantity: number, fromUnit: string): number {
  const factor = CONVERSION_TO_BASE[fromUnit];
  if (factor === undefined) {
    throw new UnitConversionError(fromUnit, '?');
  }
  return quantity * factor;
}

// Retorna la unidad base del grupo al que pertenece 'unit'
export function getBaseUnit(unit: string): string {
  const group = UNIT_GROUP[unit];
  if (!group) {
    throw new UnitConversionError(unit, '?');
  }
  // La unidad base de cada grupo
  const BASE_BY_GROUP: Record<string, string> = {
    masa:    'kg',
    volumen: 'L',
    pieza:   'u',
  };
  return BASE_BY_GROUP[group] as string;
}
