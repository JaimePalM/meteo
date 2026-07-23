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
    recorded_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for weather_data date queries
CREATE INDEX idx_weather_recorded_date ON weather_data(recorded_date DESC);

-- Create river_data table
CREATE TABLE IF NOT EXISTS river_data (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(5, 2) NOT NULL,
    recorded_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for river_data date queries
CREATE INDEX idx_river_recorded_date ON river_data(recorded_date DESC);

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

-- Insert sample river temperature data for the last 30 days
INSERT INTO river_data (temperature, recorded_date)
SELECT
    ROUND((RANDOM() * 8 + 13)::numeric, 2),
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(0, 29) AS t(n)
ON CONFLICT DO NOTHING;
