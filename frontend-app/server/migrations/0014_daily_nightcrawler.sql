DO $$ BEGIN
 CREATE TYPE "public"."pick_type" AS ENUM('REGULAR', 'BINNY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."team" AS ENUM('HOME', 'AWAY');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pick" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"game_id" text,
	"team" "team" NOT NULL,
	"pick_type" "pick_type" NOT NULL,
	"created_at" date DEFAULT now(),
	"updated_at" date DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "current_weeks" RENAME COLUMN "currentWeek" TO "current_week";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "tvStation" TO "tv_station";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "homeTeam" TO "home_team";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "homeSpread" TO "home_spread";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "awayTeam" TO "away_team";--> statement-breakpoint
ALTER TABLE "games" RENAME COLUMN "awaySpread" TO "away_spread";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pick" ADD CONSTRAINT "pick_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pick" ADD CONSTRAINT "pick_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
