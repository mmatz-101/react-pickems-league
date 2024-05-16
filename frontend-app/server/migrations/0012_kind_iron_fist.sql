CREATE TABLE IF NOT EXISTS "current_weeks" (
	"id" text PRIMARY KEY DEFAULT 'current_week' NOT NULL,
	"currentWeek" integer
);
