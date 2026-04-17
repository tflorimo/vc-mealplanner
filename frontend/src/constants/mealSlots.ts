// Tipos de slot del calendario. Orden importa: es el orden visual de arriba a abajo.
export const SLOT_TYPES = ['desayuno', 'almuerzo', 'merienda', 'cena'] as const;
export type SlotType = typeof SLOT_TYPES[number];

// Labels de display para cada tipo de slot
export const SLOT_LABELS: Record<SlotType, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  merienda: 'Merienda',
  cena:     'Cena',
};

// Colores de acento para cada slot (Tailwind classes)
export const SLOT_COLORS: Record<SlotType, { bg: string; text: string; border: string }> = {
  desayuno: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  almuerzo: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  merienda: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  cena:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
};
