import { agent, cleanTables, getPool } from './helpers';

beforeEach(async () => {
  await cleanTables('shopping_list_items', 'shopping_lists', 'meal_slots', 'event_ingredients',
    'meal_events', 'recipe_ingredients', 'recipes', 'ingredients');
});

async function seedSlotWithRecipe(date: string, slotType: string, recipeId: number) {
  await getPool().query(
    `INSERT INTO meal_slots (user_id, slot_date, slot_type, recipe_id) VALUES (1, ?, ?, ?)
     ON DUPLICATE KEY UPDATE recipe_id = VALUES(recipe_id)`,
    [date, slotType, recipeId],
  );
}

async function seedFastingSlot(date: string, slotType: string) {
  await getPool().query(
    `INSERT INTO meal_slots (user_id, slot_date, slot_type, is_fasting) VALUES (1, ?, ?, 1)
     ON DUPLICATE KEY UPDATE is_fasting = 1, recipe_id = NULL, meal_event_id = NULL`,
    [date, slotType],
  );
}

describe('POST /api/v1/shopping/calculate', () => {
  it('suma correctamente ingredientes de múltiples slots', async () => {
    const papas  = (await agent.post('/api/v1/ingredients').send({ name: 'Papas', unit: 'kg' })).body as { id: number };
    const arroz  = (await agent.post('/api/v1/ingredients').send({ name: 'Arroz', unit: 'kg' })).body as { id: number };

    // Receta 1: 0.5kg papas
    const r1 = (await agent.post('/api/v1/recipes').send({
      name: 'Guiso', diners: 2,
      ingredients: [{ ingredient_id: papas.id, quantity: 0.5, unit: 'kg' }],
    })).body as { id: number };

    // Receta 2: 500g papas + 200g arroz (mezcla de unidades compatibles)
    const r2 = (await agent.post('/api/v1/recipes').send({
      name: 'Arroz con papas', diners: 2,
      ingredients: [
        { ingredient_id: papas.id, quantity: 500, unit: 'g' },
        { ingredient_id: arroz.id, quantity: 200, unit: 'g' },
      ],
    })).body as { id: number };

    await seedSlotWithRecipe('2026-05-01', 'almuerzo', r1.id);
    await seedSlotWithRecipe('2026-05-02', 'cena',     r2.id);

    const res = await agent.post('/api/v1/shopping/calculate').send({
      date_from: '2026-05-01',
      date_to:   '2026-05-02',
    });

    expect(res.status).toBe(200);
    const papasItem = res.body.items.find((i: { ingredient_name: string }) => i.ingredient_name === 'Papas');
    const arrozItem = res.body.items.find((i: { ingredient_name: string }) => i.ingredient_name === 'Arroz');

    // 0.5kg + 500g = 1.0kg
    expect(papasItem.total_quantity).toBeCloseTo(1.0);
    expect(papasItem.unit).toBe('kg');

    // 200g = 0.2kg
    expect(arrozItem.total_quantity).toBeCloseTo(0.2);
  });

  it('slots en ayuno quedan excluidos del cálculo', async () => {
    const ing = (await agent.post('/api/v1/ingredients').send({ name: 'Leche', unit: 'L' })).body as { id: number };
    const r = (await agent.post('/api/v1/recipes').send({
      name: 'Desayuno', diners: 1,
      ingredients: [{ ingredient_id: ing.id, quantity: 0.25, unit: 'L' }],
    })).body as { id: number };

    await seedSlotWithRecipe('2026-05-03', 'desayuno', r.id);
    await seedFastingSlot('2026-05-04', 'desayuno');

    const res = await agent.post('/api/v1/shopping/calculate').send({
      date_from: '2026-05-03',
      date_to:   '2026-05-04',
    });

    expect(res.status).toBe(200);
    // Solo el slot del día 3 (no ayuno) debe incluirse
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].total_quantity).toBeCloseTo(0.25);
  });

  it('ingredientes de despensa quedan excluidos', async () => {
    const sal  = (await agent.post('/api/v1/ingredients').send({ name: 'Sal', unit: 'kg', is_pantry: true })).body as { id: number };
    const carne = (await agent.post('/api/v1/ingredients').send({ name: 'Carne', unit: 'kg' })).body as { id: number };

    const r = (await agent.post('/api/v1/recipes').send({
      name: 'Churrasco', diners: 2,
      ingredients: [
        { ingredient_id: sal.id,   quantity: 5,   unit: 'g'  },
        { ingredient_id: carne.id, quantity: 0.3, unit: 'kg' },
      ],
    })).body as { id: number };

    await seedSlotWithRecipe('2026-05-05', 'cena', r.id);

    const res = await agent.post('/api/v1/shopping/calculate').send({
      date_from: '2026-05-05',
      date_to:   '2026-05-05',
    });

    expect(res.status).toBe(200);
    // Solo carne, sal es is_pantry
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].ingredient_name).toBe('Carne');
  });

  it('rango sin slots devuelve lista vacía', async () => {
    const res = await agent.post('/api/v1/shopping/calculate').send({
      date_from: '2026-01-01',
      date_to:   '2026-01-31',
    });
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
  });

  it('body inválido devuelve 400', async () => {
    const res = await agent.post('/api/v1/shopping/calculate').send({ date_from: 'hoy', date_to: '2026-01-01' });
    expect(res.status).toBe(400);
  });

  it('guarda la lista cuando save=true', async () => {
    const ing = (await agent.post('/api/v1/ingredients').send({ name: 'Tomate', unit: 'kg' })).body as { id: number };
    const r   = (await agent.post('/api/v1/recipes').send({
      name: 'Ensalada', diners: 2,
      ingredients: [{ ingredient_id: ing.id, quantity: 2, unit: 'u' }],
    })).body as { id: number };

    await seedSlotWithRecipe('2026-05-10', 'almuerzo', r.id);

    const res = await agent.post('/api/v1/shopping/calculate').send({
      date_from: '2026-05-10',
      date_to:   '2026-05-10',
      save: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.list).toBeDefined();
    expect(res.body.list.id).toBeGreaterThan(0);

    const lists = await agent.get('/api/v1/shopping/lists');
    expect(lists.body).toHaveLength(1);
  });
});
