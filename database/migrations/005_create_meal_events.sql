-- Migración 005: Eventos aislados (comidas one-off, no en el catálogo de recetas)
-- Un evento existe para poder asignarlo a un slot sin guardarlo como receta.
-- Los ingredientes del evento se cargan de forma estructurada (siguiente migración).

CREATE TABLE IF NOT EXISTS meal_events (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    name        VARCHAR(200)    NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_event_user (user_id),
    CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
