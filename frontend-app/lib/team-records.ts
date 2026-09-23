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

export type TeamGame = {
  id: string;
  date: string;
  opponent: string;
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
  spread: number;
  result: "W" | "L" | "T";
  atsResult: "W" | "L" | "P" | "—";
};

export type TeamGames = Record<string, TeamGame[]>;

export function teamRecordKey(sport: string | undefined, teamName: string) {
  return `${sport ?? "unknown"}:${teamName}`;
}

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

    const homeKey = teamRecordKey(game.sport, game.home_name);
    const awayKey = teamRecordKey(game.sport, game.away_name);
    const home = records[homeKey] ?? emptyRecord();
    const away = records[awayKey] ?? emptyRecord();
    addStraightUp(home, game.home_score, game.away_score);
    addStraightUp(away, game.away_score, game.home_score);

    // ATS records use the spread frozen when the game started. Do not infer
    // an ATS result for older games whose kickoff line was not captured.
    if (game.kickoff_spread_captured) {
      addATS(home, game.home_score, game.away_score, game.kickoff_home_spread);
      addATS(away, game.away_score, game.home_score, game.kickoff_away_spread);
    }
    records[homeKey] = home;
    records[awayKey] = away;
  }

  return records;
}

export async function getTeamGames(pb: PocketBase, seasonId: string, leagueId: string): Promise<TeamGames> {
  const leagueGames = await pb.collection("league_games").getFullList<LeagueGameRecord>({
    filter: `league="${leagueId}" && week.season="${seasonId}" && included=true`,
    expand: "game",
  });
  const histories: TeamGames = {};

  for (const leagueGame of leagueGames) {
    const game = leagueGame.expand?.game;
    if (!game || !completedStatuses.has(String(game.status).toUpperCase())) continue;
    const add = (teamName: string, history: TeamGame) => {
      (histories[teamRecordKey(game.sport, teamName)] ??= []).push(history);
    };
    const homeWon = game.home_score > game.away_score;
    const tied = game.home_score === game.away_score;
    const atsAvailable = Boolean(game.kickoff_spread_captured);
    const homeATS = !atsAvailable ? "—" : game.home_score + game.kickoff_home_spread > game.away_score ? "W" : game.home_score + game.kickoff_home_spread < game.away_score ? "L" : "P";
    const awayATS = !atsAvailable ? "—" : game.away_score + game.kickoff_away_spread > game.home_score ? "W" : game.away_score + game.kickoff_away_spread < game.home_score ? "L" : "P";
    add(game.home_name, { id: game.id, date: game.date, opponent: game.away_name, isHome: true, teamScore: game.home_score, opponentScore: game.away_score, spread: game.kickoff_home_spread, result: tied ? "T" : homeWon ? "W" : "L", atsResult: homeATS });
    add(game.away_name, { id: game.id, date: game.date, opponent: game.home_name, isHome: false, teamScore: game.away_score, opponentScore: game.home_score, spread: game.kickoff_away_spread, result: tied ? "T" : homeWon ? "L" : "W", atsResult: awayATS });
  }

  for (const games of Object.values(histories)) games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return histories;
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
