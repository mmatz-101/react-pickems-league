package main

type ScoringConfig struct {
	RegularPointValue float32
	BinnyPointValue   float32
}

type GamesDataResponse struct {
	Page       int        `json:"page"`
	PerPage    int        `json:"perPage"`
	TotalItems int        `json:"totalItems"`
	TotalPages int        `json:"totalPages"`
	Items      []GameData `json:"items"`
}

type GameData struct {
	ID           string  `json:"id"`
	GameID       string  `json:"game_id"`
	Date         string  `json:"date"`
	Stadium      string  `json:"stadium"`
	Status       string  `json:"status"`
	HomeSpread   float32 `json:"home_spread"`
	AwaySpread   float32 `json:"away_spread"`
	HomeTeam     string  `json:"home_team"`
	HomeName     string  `json:"home_name"`
	AwayTeam     string  `json:"away_team"`
	AwayName     string  `json:"away_name"`
	HomeScore    int     `json:"home_score"`
	AwayScore    int     `json:"away_score"`
	League       string  `json:"league"`
	Sport        string  `json:"sport"`
	ProviderWeek int     `json:"provider_week"`
	TvStation    string  `json:"tv_station"`
	Week         int     `json:"week"`
	PickWinner   string  `json:"pick_winner"`
}

type GameDataRequestBody struct {
	GameID       string  `json:"game_id"`
	Date         string  `json:"date"`
	Stadium      string  `json:"stadium"`
	Status       string  `json:"status"`
	HomeSpread   float32 `json:"home_spread"`
	AwaySpread   float32 `json:"away_spread"`
	HomeTeam     string  `json:"home_team"`
	HomeName     string  `json:"home_name"`
	AwayTeam     string  `json:"away_team"`
	AwayName     string  `json:"away_name"`
	HomeScore    int     `json:"home_score"`
	AwayScore    int     `json:"away_score"`
	League       string  `json:"league"`
	Sport        string  `json:"sport"`
	ProviderWeek int     `json:"provider_week"`
	TvStation    string  `json:"tv_station,omitempty"`
	Week         int     `json:"week"`
	PickWinner   string  `json:"pick_winner"`
}

type TeamDataResponse struct {
	Page       int        `json:"page"`
	PerPage    int        `json:"perPage"`
	TotalItems int        `json:"totalItems"`
	TotalPages int        `json:"totalPages"`
	Items      []TeamData `json:"items"`
}

type TeamData struct {
	ID               string `json:"id"`
	NameAbbreviation string `json:"name_abbreviation"`
	DisplayName      string `json:"display_name"`
	Name             string `json:"name"`
	NickName         string `json:"nick_name"`
	ShortName        string `json:"short_name"`
	ImageSrc         string `json:"image_src"`
	League           string `json:"league"`
}

type PickDataResponse struct {
	Page       int        `json:"page"`
	PerPage    int        `json:"perPage"`
	TotalItems int        `json:"totalItems"`
	TotalPages int        `json:"totalPages"`
	Items      []PickData `json:"items"`
}

type PickData struct {
	ID           string  `json:"id"`
	User         string  `json:"user"`
	Game         string  `json:"game"`
	PickSpread   float32 `json:"pick_spread"`
	PickType     string  `json:"pick_type"`
	Week         int     `json:"week"`
	TeamSelected string  `json:"team_selected"`
	ResultPoints float32 `json:"result_points"`
	ResultText   string  `json:"result_text"`
	FavOrUnd     string  `json:"fav_or_und"`
}

type PickDataExpandResponse struct {
	Page       int              `json:"page"`
	PerPage    int              `json:"perPage"`
	TotalItems int              `json:"totalItems"`
	TotalPages int              `json:"totalPages"`
	Items      []PickDataExpand `json:"items"`
}

type PickDataExpand struct {
	ID           string  `json:"id"`
	User         string  `json:"user"`
	Game         string  `json:"game"`
	PickSpread   float32 `json:"pick_spread"`
	PickType     string  `json:"pick_type"`
	Week         int     `json:"week"`
	TeamSelected string  `json:"team_selected"`
	ResultPoints float32 `json:"result_points"`
	ResultText   string  `json:"result_text"`
	FavOrUnd     string  `json:"fav_or_und"`
	Expand       struct {
		Game GameData `json:"game"`
	} `json:"expand"`
}

type CoversGameResponse struct {
	Game CoversGame       `json:"game"`
	Odds []CoversBookOdds `json:"odds"`
}

type CoversGame struct {
	GameID        int        `json:"gameId"`
	StartDate     string     `json:"startDate"`
	Status        string     `json:"status"`
	LeagueName    string     `json:"leagueName"`
	SeasonPhase   string     `json:"seasonPhase"`
	HomeTeamScore int        `json:"homeTeamScore"`
	AwayTeamScore int        `json:"awayTeamScore"`
	VenueName     string     `json:"venueName"`
	HomeTeam      CoversTeam `json:"homeTeam"`
	AwayTeam      CoversTeam `json:"awayTeam"`
}

type CoversTeam struct {
	TeamID      int    `json:"teamId"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	ShortName   string `json:"shortName"`
	Logo        string `json:"logo"`
	SVGLogo     string `json:"svgLogo"`
}

type CoversBookOdds struct {
	SportsbookName string                `json:"sportsbookName"`
	SpreadHistory  []CoversSpreadHistory `json:"spreadHistory"`
}

type CoversSpreadHistory struct {
	Spread   float32 `json:"spread"`
	HomeOdds int     `json:"homeOdds"`
	AwayOdds int     `json:"awayOdds"`
	OddsDate string  `json:"oddsDate"`
}
