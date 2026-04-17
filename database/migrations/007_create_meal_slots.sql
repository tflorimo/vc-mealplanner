-- Migración 007: Slots del calendario (las celdas del grid mensual)
-- Cada fila = un día + un tipo de slot para un usuario.
-- El UNIQUE en (user_id, slot_date, slot_type) enforces la rigidez del grid:
-- no puede haber dos registros para el mismo día/slot.
--
-- Estados posibles de un slot:
--   Empty:    recipe_id IS NULL, meal_event_id IS NULL, is_fasting = 0
--   Fasting:  is_fasting = 1, recipe_id IS NULL, meal_event_id IS NULL
--   Recipe:   recipe_id IS NOT NULL, meal_event_id IS NULL, is_fasting = 0
--   Event:    meal_event_id IS NOT NULL, recipe_id IS NULL, is_fasting = 0
--
-- NOTA: MySQL 8.0 no permite usar en un CHECK constraint columnas que también
-- tienen ON DELETE SET NULL en un FK (error 3818). La exclusión mutua se
-- enforza en mealSlotService.ts (validación antes de cada upsert).

CREATE TABLE IF NOT EXISTS meal_slots (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED    NOT NULL,
    slot_date       DATE            NOT NULL,
    slot_type       ENUM('desayuno','almuerzo','merienda','cena') NOT NULL,
    is_fasting      TINYINT(1)      NOT NULL DEFAULT 0,
    recipe_id       INT UNSIGNED    NULL,
    meal_event_id   INT UNSIGNED    NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    -- Una celda única por usuario/día/tipo: el grid es rígido
    UNIQUE KEY uq_slot (user_id, slot_date, slot_type),
    -- Index crítico para el motor de compras: filtra por usuario + rango de fechas
    INDEX idx_slot_date_range (user_id, slot_date),
    INDEX idx_slot_recipe (recipe_id),
    INDEX idx_slot_event (meal_event_id),

    CONSTRAINT fk_slot_user   FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_slot_recipe FOREIGN KEY (recipe_id)     REFERENCES recipes(id)     ON DELETE SET NULL,
    CONSTRAINT fk_slot_event  FOREIGN KEY (meal_event_id) REFERENCES meal_events(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
