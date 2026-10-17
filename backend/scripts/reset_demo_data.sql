-- Deliberately resets only operational measurements. Admin users and carousel
-- configuration/images are retained.
BEGIN;
TRUNCATE weather_data, river_data, centinelas_data, pom_data RESTART IDENTITY;

INSERT INTO weather_data (temperature_max, temperature_min, humidity, pressure, precipitation, recorded_date)
SELECT
  ROUND((RANDOM() * 15 + 15)::numeric, 1),
  ROUND((RANDOM() * 10 + 5)::numeric, 1),
  (RANDOM() * 40 + 40)::integer,
  ROUND((RANDOM() * 20 + 1000)::numeric, 2),
  ROUND((RANDOM() * 5)::numeric, 2),
  CURRENT_DATE - (n || ' days')::interval
FROM generate_series(0, 29) AS t(n);

WITH academic_year AS (
  SELECT CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN EXTRACT(YEAR FROM CURRENT_DATE)::int ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int - 1 END AS start_year
)
INSERT INTO river_data (temperature, calidad_biologica, estado_rio, bosque_rivera, recorded_date)
SELECT temperature, calidad, estado, bosque, measured_on
FROM academic_year,
  (VALUES
    (15.8::numeric, 'Buena', 'Bueno', 'Bueno', make_date((SELECT start_year FROM academic_year) - 1, 10, 20)),
    (17.1::numeric, 'Muy buena', 'Muy bueno', 'Bueno', make_date((SELECT start_year FROM academic_year), 5, 15))
  ) AS samples(temperature, calidad, estado, bosque, measured_on);

WITH academic_year AS (
  SELECT CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN EXTRACT(YEAR FROM CURRENT_DATE)::int ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int - 1 END AS start_year
)
INSERT INTO centinelas_data (temperatura_agua, flora_invasora, residuos, efluentes, mortandades, recorded_date)
SELECT temperatura, flora, residuos, efluentes, mortandades, measured_on
FROM academic_year,
  (VALUES
    (14.6::numeric, 'Poca', 'Pocos', 'Ninguno', 'Ninguna', CURRENT_DATE)
  ) AS samples(temperatura, flora, residuos, efluentes, mortandades, measured_on);

INSERT INTO pom_data (temperatura_mar, recorded_date)
SELECT
  ROUND((RANDOM() * 8 + 14)::numeric, 2),
  (DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::interval)::DATE
FROM generate_series(0, 11) AS t(n);
COMMIT;
