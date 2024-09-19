import { userTeamType } from "./pick-data";

export type weeklyWinnerType = {
  id: string;
  user_team: string;
  enrolled: boolean;
};

export type weeklyWinnerTableType = {
  user_team: string;
  week_winner: string;
};

export type weeklyWinnerExpandTableType = {
  user_team: string;
  week_winner: string;
  expand: { user_team: userTeamType };
};
