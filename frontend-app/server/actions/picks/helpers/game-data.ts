export type gameType = {
  away_name: string;
  away_team: teamType | null;
  away_score: number;
  away_spread: number;
  collectionId: string;
  collectionName: string;
  created: string;
  date: string;
  game_id: string;
  home_name: string;
  home_team: teamType | null;
  home_score: number;
  home_spread: number;
  id: string;
  pick_winner: string;
  league: "NFL" | "NCAAF";
  stadium: string;
  status: string;
  tv_station: string;
  updated: string;
  week: number;
};

export type teamType = {
  id: string;
  name_abbreviation: string;
  display_name: string;
  name: string;
  nick_name: string;
  short_name: string;
  image_src: string;
  league: "NFL" | "NCAAF";
};

