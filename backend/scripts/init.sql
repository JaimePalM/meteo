-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    temperature_max DECIMAL(5, 2) NOT NULL,
    temperature_min DECIMAL(5, 2) NOT NULL,
    humidity INTEGER NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
    pressure DECIMAL(7, 2) NOT NULL,
    precipitation DECIMAL(6, 2) NOT NULL DEFAULT 0,
    recorded_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for weather_data date queries
CREATE INDEX idx_weather_recorded_date ON weather_data(recorded_date DESC);

-- Create river_data table
CREATE TABLE IF NOT EXISTS river_data (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5, 2) NOT NULL,
    calidad_biologica VARCHAR(50) NOT NULL DEFAULT 'Buena',
    estado_rio VARCHAR(50) NOT NULL DEFAULT 'Bueno',
    bosque_rivera VARCHAR(50) NOT NULL DEFAULT 'Bueno',
    recorded_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate databases created by earlier versions, where river_data only stored temperature.
-- These statements are idempotent and preserve all existing records.
ALTER TABLE river_data ADD COLUMN IF NOT EXISTS calidad_biologica VARCHAR(50) NOT NULL DEFAULT 'Buena';
ALTER TABLE river_data ADD COLUMN IF NOT EXISTS estado_rio VARCHAR(50) NOT NULL DEFAULT 'Bueno';
ALTER TABLE river_data ADD COLUMN IF NOT EXISTS bosque_rivera VARCHAR(50) NOT NULL DEFAULT 'Bueno';

-- Create index for river_data date queries
CREATE INDEX idx_river_recorded_date ON river_data(recorded_date DESC);

-- Create centinelas_data table
CREATE TABLE IF NOT EXISTS centinelas_data (
    id SERIAL PRIMARY KEY,
    temperatura_agua DECIMAL(5, 2) NOT NULL,
    flora_invasora VARCHAR(50) NOT NULL DEFAULT 'Ninguna',
    residuos VARCHAR(50) NOT NULL DEFAULT 'Ninguno',
    efluentes VARCHAR(50) NOT NULL DEFAULT 'Ninguno',
    mortandades VARCHAR(50) NOT NULL DEFAULT 'Ninguna',
    recorded_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for centinelas_data date queries
CREATE INDEX idx_centinelas_recorded_date ON centinelas_data(recorded_date DESC);

-- Create pom_data table
CREATE TABLE IF NOT EXISTS pom_data (
    id SERIAL PRIMARY KEY,
    temperatura_mar DECIMAL(5, 2) NOT NULL,
    recorded_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for pom_data date queries
CREATE INDEX idx_pom_recorded_date ON pom_data(recorded_date DESC);

-- Carousel configuration and user-replaceable images. Image bytes are kept in the
-- database so an upload survives container recreation without an extra volume.
CREATE TABLE IF NOT EXISTS carousel_settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO carousel_settings (setting_key, setting_value) VALUES
    ('interval_ms', '10000'),
    ('show_indicators', 'true')
ON CONFLICT (setting_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS carousel_images (
    panel_id VARCHAR(40) PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    image_data TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt (rounds: 10)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$uQVBoncGnYX7ueVPmYcw8OfYwwrGL9GJIyMvXKPbkhb/uzaH2p9sK')
ON CONFLICT (username) DO NOTHING;

-- Insert sample weather data for the last 30 days
INSERT INTO weather_data (temperature_max, temperature_min, humidity, pressure, precipitation, recorded_date)
SELECT
    ROUND((RANDOM() * 15 + 15)::numeric, 1),
    ROUND((RANDOM() * 10 + 5)::numeric, 1),
    (RANDOM() * 40 + 40)::integer,
    ROUND((RANDOM() * 20 + 1000)::numeric, 2),
    ROUND((RANDOM() * 5)::numeric, 2),
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(0, 29) AS t(n)
ON CONFLICT DO NOTHING;

-- Insert sample river temperature data (monthly - last 12 months)
INSERT INTO river_data (temperature, calidad_biologica, estado_rio, bosque_rivera, recorded_date)
SELECT
    ROUND((RANDOM() * 8 + 13)::numeric, 2),
    CASE (RANDOM() * 3)::int
        WHEN 0 THEN 'Muy buena'
        WHEN 1 THEN 'Buena'
        ELSE 'Regular'
    END,
    CASE (RANDOM() * 3)::int
        WHEN 0 THEN 'Muy bueno'
        WHEN 1 THEN 'Bueno'
        ELSE 'Regular'
    END,
    CASE (RANDOM() * 3)::int
        WHEN 0 THEN 'Muy bueno'
        WHEN 1 THEN 'Bueno'
        ELSE 'Regular'
    END,
    (DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::interval)::DATE
FROM generate_series(0, 11) AS t(n)
ON CONFLICT DO NOTHING;

-- Insert sample centinelas data for the last 30 days (daily)
INSERT INTO centinelas_data (temperatura_agua, flora_invasora, residuos, efluentes, mortandades, recorded_date)
SELECT
    ROUND((RANDOM() * 10 + 10)::numeric, 2),
    CASE (RANDOM() * 4)::int
        WHEN 0 THEN 'Ninguna'
        WHEN 1 THEN 'Poca'
        WHEN 2 THEN 'Moderada'
        ELSE 'Mucha'
    END,
    CASE (RANDOM() * 4)::int
        WHEN 0 THEN 'Ninguno'
        WHEN 1 THEN 'Pocos'
        WHEN 2 THEN 'Moderados'
        ELSE 'Muchos'
    END,
    CASE (RANDOM() * 4)::int
        WHEN 0 THEN 'Ninguno'
        WHEN 1 THEN 'Leves'
        WHEN 2 THEN 'Moderados'
        ELSE 'Severos'
    END,
    CASE (RANDOM() * 4)::int
        WHEN 0 THEN 'Ninguna'
        WHEN 1 THEN 'Baja'
        WHEN 2 THEN 'Media'
        ELSE 'Alta'
    END,
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(0, 29) AS t(n)
ON CONFLICT DO NOTHING;

-- Insert sample POM sea temperature data (monthly - last 12 months)
INSERT INTO pom_data (temperatura_mar, recorded_date)
SELECT
    ROUND((RANDOM() * 8 + 14)::numeric, 2),
    (DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::interval)::DATE
FROM generate_series(0, 11) AS t(n)
ON CONFLICT DO NOTHING;
