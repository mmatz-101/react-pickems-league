import type { gameType } from "@/server/actions/picks/helpers/game-data";
import type PocketBase from "pocketbase";

export type TeamRecord = {
  wins: number;
  losses: number;
  ties: number;
  atsWins: number;
  atsLosses: number;
  atsPushes: number;
};

export type TeamRecords = Record<string, TeamRecord>;

const completedStatuses = new Set(["FINAL", "FINAL OT", "COMPLETE"]);

function emptyRecord(): TeamRecord {
  return { wins: 0, losses: 0, ties: 0, atsWins: 0, atsLosses: 0, atsPushes: 0 };
}

function addStraightUp(record: TeamRecord, score: number, opponent: number) {
  if (score > opponent) record.wins += 1;
  else if (score < opponent) record.losses += 1;
  else record.ties += 1;
}

function addATS(record: TeamRecord, score: number, opponent: number, spread: number) {
  const adjustedScore = score + spread;
  if (adjustedScore > opponent) record.atsWins += 1;
  else if (adjustedScore < opponent) record.atsLosses += 1;
  else record.atsPushes += 1;
}

type LeagueGameRecord = {
  game: string;
  included: boolean;
  expand?: { game?: gameType };
};

export async function getTeamRecords(pb: PocketBase, seasonId: string, leagueId: string): Promise<TeamRecords> {
  // Use league_games as the season schedule source. This follows the same
  // relationship used by the picks page and avoids missing games whose
  // generic games.week_record relation has not been repaired yet.
  const leagueGames = await pb.collection("league_games").getFullList<LeagueGameRecord>({
    filter: `league="${leagueId}" && week.season="${seasonId}" && included=true`,
    expand: "game",
  });
  const games = leagueGames.map((leagueGame) => leagueGame.expand?.game).filter((game): game is gameType => Boolean(game));
  const records: TeamRecords = {};

  for (const game of games) {
    if (!completedStatuses.has(String(game.status).toUpperCase())) continue;

    const home = records[game.home_name] ?? emptyRecord();
    const away = records[game.away_name] ?? emptyRecord();
    addStraightUp(home, game.home_score, game.away_score);
    addStraightUp(away, game.away_score, game.home_score);

    // ATS records use the spread frozen when the game started. Do not infer
    // an ATS result for older games whose kickoff line was not captured.
    if (game.kickoff_spread_captured) {
      addATS(home, game.home_score, game.away_score, game.kickoff_home_spread);
      addATS(away, game.away_score, game.home_score, game.kickoff_away_spread);
    }
    records[game.home_name] = home;
    records[game.away_name] = away;
  }

  return records;
}

export function formatTeamRecord(record?: TeamRecord) {
  if (!record) return "0–0–0";
  return `${record.wins}–${record.losses}–${record.ties}`;
}

export function formatTeamATS(record?: TeamRecord) {
  if (!record) return "—";
  const games = record.atsWins + record.atsLosses + record.atsPushes;
  return games ? `${record.atsWins}–${record.atsLosses}–${record.atsPushes}` : "—";
}
