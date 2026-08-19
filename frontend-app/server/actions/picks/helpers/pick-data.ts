export type pickType = {
  game: string;
  id: string;
  pick_spread: number;
  pick_type: "REGULAR" | "BINNY";
  result_points: number;
  result_text: string;
  team_selected: "HOME" | "AWAY";
  updated: string;
  created: string;
  user_team: string;
  league_team?: string;
  week: number;
  week_record?: string;
};

export type userTeamType = {
  id: string;
  team_name: string;
  field: string[];
};
