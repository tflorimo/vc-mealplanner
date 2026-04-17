import {
  convertToUnit,
  convertToBaseUnit,
  getBaseUnit,
  UnitConversionError,
} from '../../src/utils/unitConverter';

describe('convertToUnit', () => {
  it('convierte 500g a kg → 0.5', () => {
    expect(convertToUnit(500, 'g', 'kg')).toBeCloseTo(0.5);
  });

  it('convierte 250ml a L → 0.25', () => {
    expect(convertToUnit(250, 'ml', 'L')).toBeCloseTo(0.25);
  });

  it('convierte 2kg a g → 2000', () => {
    expect(convertToUnit(2, 'kg', 'g')).toBeCloseTo(2000);
  });

  it('misma unidad devuelve el mismo valor', () => {
    expect(convertToUnit(3, 'kg', 'kg')).toBe(3);
    expect(convertToUnit(5, 'u', 'u')).toBe(5);
  });

  it('lanza UnitConversionError con unidades de grupos distintos', () => {
    expect(() => convertToUnit(1, 'kg', 'L')).toThrow(UnitConversionError);
    expect(() => convertToUnit(1, 'ml', 'g')).toThrow(UnitConversionError);
    expect(() => convertToUnit(1, 'u', 'kg')).toThrow(UnitConversionError);
  });
});

describe('convertToBaseUnit', () => {
  it('1000g → 1kg', () => expect(convertToBaseUnit(1000, 'g')).toBeCloseTo(1));
  it('500ml → 0.5L', () => expect(convertToBaseUnit(500, 'ml')).toBeCloseTo(0.5));
  it('2.5kg sin cambio', () => expect(convertToBaseUnit(2.5, 'kg')).toBe(2.5));
  it('3L sin cambio', () => expect(convertToBaseUnit(3, 'L')).toBe(3));
  it('4u sin cambio', () => expect(convertToBaseUnit(4, 'u')).toBe(4));
});

describe('getBaseUnit', () => {
  it('kg → kg', () => expect(getBaseUnit('kg')).toBe('kg'));
  it('g → kg',  () => expect(getBaseUnit('g')).toBe('kg'));
  it('L → L',   () => expect(getBaseUnit('L')).toBe('L'));
  it('ml → L',  () => expect(getBaseUnit('ml')).toBe('L'));
  it('u → u',   () => expect(getBaseUnit('u')).toBe('u'));
});
