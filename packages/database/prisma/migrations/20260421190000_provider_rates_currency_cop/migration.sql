-- Plataforma en COP: default para filas nuevas y normalización de existentes.
UPDATE "provider_rates" SET "currency" = 'COP';

ALTER TABLE "provider_rates" ALTER COLUMN "currency" SET DEFAULT 'COP';
