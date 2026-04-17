-- Migración 003: Catálogo de recetas
-- Una receta es reutilizable: se puede asignar a múltiples slots del calendario.
-- El campo 'diners' es inmutable por defecto (2 comensales).

CREATE TABLE IF NOT EXISTS recipes (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED    NOT NULL,
    name        VARCHAR(200)    NOT NULL,
    description TEXT            NULL,
    diners      TINYINT         NOT NULL DEFAULT 2,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_recipe_user (user_id),
    INDEX idx_recipe_name (name),
    CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
