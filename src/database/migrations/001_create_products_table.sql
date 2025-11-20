-- Migración: Crear tabla de productos
-- Fecha: 2024-11-10
-- Descripción: Tabla principal para almacenar el inventario de productos

-- Crear tabla products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    reference VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500) NOT NULL,
    stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    wholesale_price_bs NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (wholesale_price_bs >= 0),
    retail_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (retail_price >= 0),
    wholesale_price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (wholesale_price_usd >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_reference ON products(reference);
CREATE INDEX IF NOT EXISTS idx_products_description ON products USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en la tabla y columnas
COMMENT ON TABLE products IS 'Tabla principal de inventario de productos';
COMMENT ON COLUMN products.id IS 'Identificador único del producto';
COMMENT ON COLUMN products.code IS 'Código del producto (opcional, puede ser NULL)';
COMMENT ON COLUMN products.reference IS 'Referencia del producto (requerida, única)';
COMMENT ON COLUMN products.description IS 'Descripción del producto';
COMMENT ON COLUMN products.stock IS 'Cantidad en existencia';
COMMENT ON COLUMN products.wholesale_price_bs IS 'Precio al mayor en bolívares (Precio 1)';
COMMENT ON COLUMN products.retail_price IS 'Precio al detal (Precio 2)';
COMMENT ON COLUMN products.wholesale_price_usd IS 'Precio al mayor en divisas (Precio 3)';
COMMENT ON COLUMN products.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN products.updated_at IS 'Fecha de última actualización del registro';
