CREATE TABLE IF NOT EXISTS "games" (
	"id" text PRIMARY KEY NOT NULL,
	"league" text,
	"year" integer,
	"week" integer,
	"date" date,
	"status" text,
	"tvStation" text,
	"homeTeam" text,
	"homeSpread" integer,
	"awayTeam" text,
	"awaySpread" integer
);
