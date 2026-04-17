// Evita que database.ts lance error por variables de entorno al importar el servicio
jest.mock('../../src/config/database', () => ({
  default: { query: jest.fn(), getConnection: jest.fn() },
}));

import {
  aggregateRows,
  PROJECTION_QUERY,
} from '../../src/services/shoppingProjectionService';
import { MAX_SHOPPING_CALC_MS } from '../../src/config/constants';

// ─── aggregateRows (función pura, sin DB) ─────────────────────────────────────

describe('aggregateRows — conversión y suma', () => {
  it('suma 500g + 0.5kg = 1.0kg', () => {
    const rows = [
      { id: 1, name: 'Papas', base_unit: 'kg', quantity: 500,  raw_unit: 'g'  },
      { id: 1, name: 'Papas', base_unit: 'kg', quantity: 0.5,  raw_unit: 'kg' },
    ];
    const result = aggregateRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0]!.total_quantity).toBeCloseTo(1.0);
    expect(result[0]!.unit).toBe('kg');
  });

  it('suma 500ml + 0.5L = 1.0L', () => {
    const rows = [
      { id: 2, name: 'Aceite', base_unit: 'L', quantity: 500, raw_unit: 'ml' },
      { id: 2, name: 'Aceite', base_unit: 'L', quantity: 0.5, raw_unit: 'L'  },
    ];
    const result = aggregateRows(rows);
    expect(result[0]!.total_quantity).toBeCloseTo(1.0);
    expect(result[0]!.unit).toBe('L');
  });

  it('ingredientes distintos se listan por separado ordenados por nombre', () => {
    const rows = [
      { id: 1, name: 'Zanahoria', base_unit: 'kg', quantity: 0.5, raw_unit: 'kg' },
      { id: 2, name: 'Arroz',     base_unit: 'kg', quantity: 1.0, raw_unit: 'kg' },
    ];
    const result = aggregateRows(rows);
    expect(result).toHaveLength(2);
    expect(result[0]!.ingredient_name).toBe('Arroz');     // orden alfabético
    expect(result[1]!.ingredient_name).toBe('Zanahoria');
  });

  it('retorna lista vacía si no hay filas', () => {
    expect(aggregateRows([])).toEqual([]);
  });
});

// ─── PROJECTION_QUERY — filtros correctos en SQL ───────────────────────────────

describe('PROJECTION_QUERY — filtros de ayuno y despensa', () => {
  it('excluye slots en ayuno (is_fasting = 0)', () => {
    expect(PROJECTION_QUERY).toContain('is_fasting = 0');
  });

  it('excluye ingredientes de despensa (is_pantry = 0)', () => {
    expect(PROJECTION_QUERY).toContain('is_pantry = 0');
  });

  it('es una UNION ALL (combina recetas y eventos en un solo round-trip)', () => {
    expect(PROJECTION_QUERY).toContain('UNION ALL');
  });
});

// ─── Performance ──────────────────────────────────────────────────────────────

describe('performance', () => {
  it(`agrega 600 filas (120 slots × 5 ing.) en menos de ${MAX_SHOPPING_CALC_MS}ms`, () => {
    const mockRows = Array.from({ length: 600 }, (_, i) => ({
      id:        (i % 20) + 1,
      name:      `Ingrediente ${String((i % 20) + 1).padStart(2, '0')}`,
      base_unit: 'kg',
      quantity:  0.1,
      raw_unit:  'kg',
    }));

    const start   = Date.now();
    aggregateRows(mockRows);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(MAX_SHOPPING_CALC_MS);
  });
});
