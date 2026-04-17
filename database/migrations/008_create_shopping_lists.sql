-- Migración 008: Listas de compras (snapshots persistidos)
-- Las listas se persisten para soporte offline (PWA).
-- El usuario puede consultar la última lista sin recalcular ni tener conexión.

CREATE TABLE IF NOT EXISTS shopping_lists (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED    NOT NULL,
    date_from       DATE            NOT NULL,
    date_to         DATE            NOT NULL,
    generated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_slots     SMALLINT        NOT NULL,   -- slots procesados (metadata de debug)
    total_items     SMALLINT        NOT NULL,   -- items en la lista resultante

    PRIMARY KEY (id),
    INDEX idx_sl_user_date (user_id, generated_at),
    CONSTRAINT fk_sl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    shopping_list_id    INT UNSIGNED    NOT NULL,
    ingredient_id       INT UNSIGNED    NOT NULL,
    total_quantity      DECIMAL(10, 3)  NOT NULL,  -- cantidad ya normalizada y sumada
    unit                VARCHAR(30)     NOT NULL,   -- unidad base del maestro

    PRIMARY KEY (id),
    INDEX idx_sli_list (shopping_list_id),
    INDEX idx_sli_ingredient (ingredient_id),
    CONSTRAINT fk_sli_list       FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_sli_ingredient FOREIGN KEY (ingredient_id)    REFERENCES ingredients(id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
