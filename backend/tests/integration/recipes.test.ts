import { agent, cleanTables } from './helpers';

beforeEach(async () => {
  await cleanTables('shopping_list_items', 'shopping_lists', 'meal_slots', 'event_ingredients',
    'meal_events', 'recipe_ingredients', 'recipes', 'ingredients');
});

async function createIngredient(name: string, unit = 'kg') {
  const res = await agent.post('/api/v1/ingredients').send({ name, unit });
  return res.body as { id: number };
}

describe('POST /api/v1/recipes', () => {
  it('crea receta con ingredientes y devuelve 201', async () => {
    const ing = await createIngredient('Harina');
    const res = await agent.post('/api/v1/recipes').send({
      name: 'Torta',
      diners: 4,
      ingredients: [{ ingredient_id: ing.id, quantity: 0.5, unit: 'kg' }],
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Torta', diners: 4 });
    expect(res.body.id).toBeDefined();
  });

  it('receta sin ingredientes devuelve 400', async () => {
    const res = await agent.post('/api/v1/recipes').send({ name: 'Vacía', diners: 2, ingredients: [] });
    expect(res.status).toBe(400);
  });

  it('ingrediente duplicado devuelve 400', async () => {
    const ing = await createIngredient('Leche', 'L');
    const res = await agent.post('/api/v1/recipes').send({
      name: 'Test',
      diners: 2,
      // mismo ingredient_id dos veces → debe rechazarse
      ingredients: [
        { ingredient_id: ing.id, quantity: 200, unit: 'ml' },
        { ingredient_id: ing.id, quantity: 0.2, unit: 'L'  },
      ],
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/recipes', () => {
  it('devuelve lista con ingredient_count', async () => {
    const ing1 = await createIngredient('Tomate');
    const ing2 = await createIngredient('Queso');
    await agent.post('/api/v1/recipes').send({
      name: 'Pizza',
      diners: 2,
      ingredients: [
        { ingredient_id: ing1.id, quantity: 3, unit: 'u' },
        { ingredient_id: ing2.id, quantity: 0.2, unit: 'kg' },
      ],
    });

    const res = await agent.get('/api/v1/recipes');
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ name: 'Pizza', ingredient_count: 2 });
  });
});

describe('GET /api/v1/recipes/:id', () => {
  it('devuelve receta con ingredientes completos', async () => {
    const ing = await createIngredient('Carne');
    const create = await agent.post('/api/v1/recipes').send({
      name: 'Milanesas',
      diners: 3,
      ingredients: [{ ingredient_id: ing.id, quantity: 0.6, unit: 'kg' }],
    });
    const id = create.body.id as number;

    const res = await agent.get(`/api/v1/recipes/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.ingredients).toHaveLength(1);
    expect(res.body.ingredients[0]).toMatchObject({ ingredient_name: 'Carne', quantity: 0.6 });
  });

  it('id inexistente devuelve 404', async () => {
    const res = await agent.get('/api/v1/recipes/9999');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/recipes/:id', () => {
  it('elimina y devuelve 204', async () => {
    const ing = await createIngredient('Pasta');
    const create = await agent.post('/api/v1/recipes').send({
      name: 'Fideos', diners: 2,
      ingredients: [{ ingredient_id: ing.id, quantity: 200, unit: 'g' }],
    });
    const id = create.body.id as number;

    const del = await agent.delete(`/api/v1/recipes/${id}`);
    expect(del.status).toBe(204);

    expect((await agent.get(`/api/v1/recipes/${id}`)).status).toBe(404);
  });
});
