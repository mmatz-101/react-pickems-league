package main

type CurrentDataResponse struct {
	Page       int           `json:"page"`
	PerPage    int           `json:"perPage"`
	TotalItems int           `json:"totalItems"`
	TotalPages int           `json:"totalPages"`
	Items      []CurrentData `json:"items"`
}

type CurrentData struct {
	ID                 string  `json:"id"`
	Week               int     `json:"week"`
	Year               int     `json:"year"`
	AllowPicks         bool    `json:"allow_picks"`
	MaxNFLPicks        int     `json:"max_nfl_picks"`
	MaxNCAAFPicks      int     `json:"max_ncaaf_picks"`
	MaxNFLBinnyPicks   int     `json:"max_nfl_binny_picks"`
	MaxNCAAFBinnyPicks int     `json:"max_ncaaf_binny_picks"`
	RegularPointValue  float32 `json:"regular_point_value"`
	BinnyPointValue    float32 `json:"binny_point_value"`
	UpdateGames        bool    `json:"update_games"`
	UpdateResults      bool    `json:"update_results"`
	NFLWeekSearch      string  `json:"nfl_week_search"`
	NCAAFWeekSearch    string  `json:"ncaaf_week_search"`
}

type GamesDataResponse struct {
	Page       int        `json:"page"`
	PerPage    int        `json:"perPage"`
	TotalItems int        `json:"totalItems"`
	TotalPages int        `json:"totalPages"`
	Items      []GameData `json:"items"`
}

type GameData struct {
	ID         string  `json:"id"`
	GameID     string  `json:"game_id"`
	Date       string  `json:"date"`
	Stadium    string  `json:"stadium"`
	Status     string  `json:"status"`
	HomeSpread float32 `json:"home_spread"`
	AwaySpread float32 `json:"away_spread"`
	HomeTeam   string  `json:"home_team"`
	HomeName   string  `json:"home_name"`
	AwayTeam   string  `json:"away_team"`
	AwayName   string  `json:"away_name"`
	HomeScore  int     `json:"home_score"`
	AwayScore  int     `json:"away_score"`
	League     string  `json:"league"`
	TvStation  string  `json:"tv_station"`
	Week       int     `json:"week"`
	PickWinner string  `json:"pick_winner"`
}

type GameDataRequestBody struct {
	GameID     string  `json:"game_id"`
	Date       string  `json:"date"`
	Stadium    string  `json:"stadium"`
	Status     string  `json:"status"`
	HomeSpread float32 `json:"home_spread"`
	AwaySpread float32 `json:"away_spread"`
	HomeTeam   string  `json:"home_team"`
	HomeName   string  `json:"home_name"`
	AwayTeam   string  `json:"away_team"`
	AwayName   string  `json:"away_name"`
	HomeScore  int     `json:"home_score"`
	AwayScore  int     `json:"away_score"`
	League     string  `json:"league"`
	TvStation  string  `json:"tv_station"`
	Week       int     `json:"week"`
	PickWinner string  `json:"pick_winner"`
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

type OddsSharkResponse struct {
	Games map[string]OddsSharkGame `json:"scores"`
}

type OddsSharkGame struct {
	GameID      int   `json:"id"`
	Date        int64 `json:"date"`
	StadiumInfo struct {
		Roof string `json:"roof"`
		Name string `json:"stadium"`
	} `json:"stadium"`
	Status string `json:"status"`
	Teams  struct {
		Home struct {
			Names struct {
				Abbreviation string `json:"abbreviation"`
				DisplayName  string `json:"display_name"`
				Name         string `json:"name"`
				NickName     string `json:"nick_name"`
				ShortName    string `json:"short_name"`
			} `json:"names"`
			Record string  `json:"record"`
			Spread float32 `json:"spread"`
			Score  int     `json:"score"`
		} `json:"home"`
		Away struct {
			Names struct {
				Abbreviation string `json:"abbreviation"`
				DisplayName  string `json:"display_name"`
				Name         string `json:"name"`
				NickName     string `json:"nick_name"`
				ShortName    string `json:"short_name"`
			} `json:"names"`
			Record string  `json:"record"`
			Spread float32 `json:"spread"`
			Score  int     `json:"score"`
		} `json:"away"`
	} `json:"teams"`
	TvStation     string `json:"tvStation"`
	TvStationName string `json:"tvStationName"`
}
