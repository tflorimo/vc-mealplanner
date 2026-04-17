import { agent, cleanTables } from './helpers';

beforeEach(async () => {
  await cleanTables('shopping_list_items', 'shopping_lists', 'meal_slots', 'event_ingredients',
    'meal_events', 'recipe_ingredients', 'recipes', 'ingredients');
});

describe('POST /api/v1/ingredients', () => {
  it('crea un ingrediente y devuelve 201', async () => {
    const res = await agent.post('/api/v1/ingredients').send({ name: 'Papas', unit: 'kg' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Papas', unit: 'kg' });
    expect(res.body.is_pantry == 0).toBe(true); // mysql2 puede retornar 0 o false
    expect(res.body.id).toBeDefined();
  });

  it('ingrediente duplicado devuelve 409', async () => {
    await agent.post('/api/v1/ingredients').send({ name: 'Arroz', unit: 'kg' });
    const res = await agent.post('/api/v1/ingredients').send({ name: 'Arroz', unit: 'kg' });
    expect(res.status).toBe(409);
  });

  it('falta nombre devuelve 400', async () => {
    const res = await agent.post('/api/v1/ingredients').send({ unit: 'kg' });
    expect(res.status).toBe(400);
  });

  it('unidad inválida devuelve 400', async () => {
    const res = await agent.post('/api/v1/ingredients').send({ name: 'Test', unit: 'tonelada' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/ingredients', () => {
  it('devuelve lista vacía cuando no hay ingredientes', async () => {
    const res = await agent.get('/api/v1/ingredients');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filtra por nombre con ?q=', async () => {
    await agent.post('/api/v1/ingredients').send({ name: 'Papas fritas', unit: 'kg' });
    await agent.post('/api/v1/ingredients').send({ name: 'Papa hervida', unit: 'kg' });
    await agent.post('/api/v1/ingredients').send({ name: 'Arroz', unit: 'kg' });

    const res = await agent.get('/api/v1/ingredients?q=papa');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((i: { name: string }) => i.name.toLowerCase().includes('papa'))).toBe(true);
  });
});

describe('PUT /api/v1/ingredients/:id', () => {
  it('actualiza nombre e is_pantry', async () => {
    const create = await agent.post('/api/v1/ingredients').send({ name: 'Sal', unit: 'kg' });
    const id = create.body.id as number;

    const res = await agent.put(`/api/v1/ingredients/${id}`).send({ name: 'Sal fina', unit: 'kg', is_pantry: true });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sal fina');
    expect(res.body.is_pantry == 1).toBe(true); // mysql2 puede retornar 1 o true
  });

  it('id inexistente devuelve 404', async () => {
    const res = await agent.put('/api/v1/ingredients/9999').send({ name: 'X', unit: 'kg' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/v1/ingredients/:id', () => {
  it('elimina y devuelve 204', async () => {
    const create = await agent.post('/api/v1/ingredients').send({ name: 'Temporal', unit: 'u' });
    const id = create.body.id as number;

    const del = await agent.delete(`/api/v1/ingredients/${id}`);
    expect(del.status).toBe(204);

    const get = await agent.get('/api/v1/ingredients');
    expect(get.body.find((i: { id: number }) => i.id === id)).toBeUndefined();
  });
});
