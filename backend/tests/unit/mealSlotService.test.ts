// Mockear el pool antes de importar el servicio
jest.mock('../../src/config/database', () => ({
  default: { query: jest.fn(), getConnection: jest.fn() },
}));

import * as mealSlotService from '../../src/services/mealSlotService';
import { AppError } from '../../src/middleware/errorHandler';

const DATE    = '2026-04-01';
const SLOT    = 'almuerzo' as const;
const USER_ID = 1;

describe('mealSlotService.upsert — exclusión mutua', () => {
  it('lanza 400 si recipe_id y meal_event_id están ambos seteados', async () => {
    await expect(
      mealSlotService.upsert(USER_ID, DATE, SLOT, { recipe_id: 1, meal_event_id: 2 }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 400 });
  });

  it('lanza 400 si is_fasting=true con recipe_id', async () => {
    await expect(
      mealSlotService.upsert(USER_ID, DATE, SLOT, { is_fasting: true, recipe_id: 1 }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 400 });
  });

  it('lanza 400 si is_fasting=true con meal_event_id', async () => {
    await expect(
      mealSlotService.upsert(USER_ID, DATE, SLOT, { is_fasting: true, meal_event_id: 1 }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 400 });
  });
});
