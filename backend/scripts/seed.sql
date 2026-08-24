-- Seed script to populate database with sample data
-- Run this after init.sql if tables are empty

-- Sample weather data for the last 30 days (daily)
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

-- Sample river temperature data (monthly - last 12 months)
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

-- Sample centinelas data for the last 30 days (daily)
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

-- Sample POM sea temperature data (monthly - last 12 months)
INSERT INTO pom_data (temperatura_mar, recorded_date)
SELECT
    ROUND((RANDOM() * 8 + 14)::numeric, 2),
    (DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::interval)::DATE
FROM generate_series(0, 11) AS t(n)
ON CONFLICT DO NOTHING;