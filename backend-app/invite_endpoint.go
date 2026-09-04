package main

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

type acceptInviteRequest struct {
	Token string `json:"token"`
}

type revokeInviteRequest struct {
	Invite string `json:"invite"`
}

type overrideLeagueGameRequest struct {
	League   string `json:"league"`
	Week     string `json:"week"`
	Game     string `json:"game"`
	Included bool   `json:"included"`
}

type updateDisplayNameRequest struct {
	Membership string `json:"membership"`
	Name       string `json:"display_name"`
}

type renameLeagueTeamRequest struct {
	LeagueTeam string `json:"league_team"`
	Name       string `json:"name"`
}

type createLeagueTeamRequest struct {
	League string `json:"league"`
	Name   string `json:"name"`
}

type moveLeagueMemberRequest struct {
	Membership string `json:"membership"`
	LeagueTeam string `json:"league_team"`
}

type approveLeagueRequest struct {
	Request string `json:"request"`
}

type selectSeasonRequest struct {
	Season string `json:"season"`
}
type selectWeekRequest struct {
	Week string `json:"week"`
}

type createLeagueSeasonRequest struct {
	League      string  `json:"league"`
	Name        string  `json:"name"`
	Year        int     `json:"year"`
	RegularWin  float64 `json:"regular_win_points"`
	RegularPush float64 `json:"regular_push_points"`
	RegularLoss float64 `json:"regular_loss_points"`
	BinnyWin    float64 `json:"binny_win_points"`
	BinnyPush   float64 `json:"binny_push_points"`
	BinnyLoss   float64 `json:"binny_loss_points"`
}

type createLeagueWeekRequest struct {
	Season    string `json:"season"`
	Number    int    `json:"number"`
	Name      string `json:"name"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

type updateLeagueWeekRequest struct {
	Week               string  `json:"week"`
	Status             *string `json:"status"`
	AllowPicks         *bool   `json:"allow_picks"`
	StartDate          *string `json:"start_date"`
	EndDate            *string `json:"end_date"`
	MaxNFLPicks        *int    `json:"max_nfl_picks"`
	MaxNCAAFPicks      *int    `json:"max_ncaaf_picks"`
	MaxNFLBinnyPicks   *int    `json:"max_nfl_binny_picks"`
	MaxNCAAFBinnyPicks *int    `json:"max_ncaaf_binny_picks"`
	IsCurrent          *bool   `json:"is_current"`
}

func registerInviteRoutes(app *pocketbase.PocketBase) {
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			e.Router.POST("/api/league-invites/accept", acceptLeagueInvite).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-invites/revoke", revokeLeagueInvite).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-games/override", overrideLeagueGame).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-memberships/update-display-name", updateDisplayName).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/rename", renameLeagueTeam).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/create", createLeagueTeam).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/move-member", moveLeagueMember).Bind(apis.RequireAuth())
			e.Router.GET("/api/scheduler/health", schedulerHealth).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-requests/approve", approveLeagueRequestHandler).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-weeks/update", updateLeagueWeek).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-weeks/create", createLeagueWeek).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-seasons/create", createLeagueSeason).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-seasons/activate", activateLeagueSeason).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-weeks/set-current", setCurrentLeagueWeek).Bind(apis.RequireAuth())
			return e.Next()
		},
		Priority: 999,
	})
}

func activateLeagueSeason(e *core.RequestEvent) error {
	var body selectSeasonRequest
	if err := e.BindBody(&body); err != nil || body.Season == "" {
		return e.BadRequestError("A season is required.", err)
	}
	season, err := e.App.FindRecordById("seasons", body.Season)
	if err != nil {
		return e.NotFoundError("Season not found.", nil)
	}
	if err := requireCommissioner(e.App, season.GetString("league"), e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	seasons, _ := e.App.FindRecordsByFilter("seasons", "league = {:league}", "", 0, 0, dbx.Params{"league": season.GetString("league")})
	for _, item := range seasons {
		item.Set("status", "COMPLETED")
		if item.Id == season.Id {
			item.Set("status", "ACTIVE")
		}
		if err := e.App.Save(item); err != nil {
			return e.InternalServerError("Unable to activate season.", err)
		}
	}
	weeks, err := e.App.FindRecordsByFilter("weeks", "season = {:season}", "", 0, 0, dbx.Params{"season": season.Id})
	if err != nil {
		return e.InternalServerError("Unable to load season weeks.", err)
	}
	if len(weeks) == 0 {
		collection, err := e.App.FindCollectionByNameOrId("weeks")
		if err != nil {
			return e.InternalServerError("Weeks collection unavailable.", err)
		}
		now := time.Now().UTC()
		week := core.NewRecord(collection)
		week.Set("season", season.Id)
		week.Set("number", 1)
		week.Set("name", "Week 1")
		week.Set("status", "OPEN")
		week.Set("start_date", now.Format(time.RFC3339Nano))
		week.Set("end_date", now.AddDate(0, 0, 7).Format(time.RFC3339Nano))
		week.Set("allow_picks", true)
		week.Set("max_nfl_picks", 4)
		week.Set("max_ncaaf_picks", 4)
		week.Set("max_nfl_binny_picks", 1)
		week.Set("max_ncaaf_binny_picks", 1)
		week.Set("is_current", true)
		if err := e.App.Save(week); err != nil {
			return e.InternalServerError("Unable to create initial season week.", err)
		}
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Season activated."})
}

func setCurrentLeagueWeek(e *core.RequestEvent) error {
	var body selectWeekRequest
	if err := e.BindBody(&body); err != nil || body.Week == "" {
		return e.BadRequestError("A week is required.", err)
	}
	week, err := e.App.FindRecordById("weeks", body.Week)
	if err != nil {
		return e.NotFoundError("Week not found.", nil)
	}
	season, err := e.App.FindRecordById("seasons", week.GetString("season"))
	if err != nil {
		return e.NotFoundError("Season not found.", nil)
	}
	if err := requireCommissioner(e.App, season.GetString("league"), e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	weeks, _ := e.App.FindRecordsByFilter("weeks", "season = {:season}", "", 0, 0, dbx.Params{"season": season.Id})
	for _, item := range weeks {
		item.Set("is_current", item.Id == week.Id)
		if err := e.App.Save(item); err != nil {
			return e.InternalServerError("Unable to set current week.", err)
		}
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Current week updated."})
}

func createLeagueSeason(e *core.RequestEvent) error {
	var body createLeagueSeasonRequest
	if err := e.BindBody(&body); err != nil || body.League == "" || body.Name == "" || body.Year <= 0 {
		return e.BadRequestError("League, season name, and year are required.", err)
	}
	if err := requireCommissioner(e.App, body.League, e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	seasons, err := e.App.FindCollectionByNameOrId("seasons")
	if err != nil {
		return e.InternalServerError("Seasons collection unavailable.", err)
	}
	if _, err := e.App.FindFirstRecordByFilter(seasons, "league = {:league} && year = {:year}", dbx.Params{"league": body.League, "year": body.Year}); err == nil {
		return e.BadRequestError("That season year already exists.", nil)
	}
	season := core.NewRecord(seasons)
	season.Set("league", body.League)
	season.Set("name", body.Name)
	season.Set("year", body.Year)
	season.Set("status", "SETUP")
	season.Set("regular_win_points", body.RegularWin)
	season.Set("regular_push_points", body.RegularPush)
	season.Set("regular_loss_points", body.RegularLoss)
	season.Set("binny_win_points", body.BinnyWin)
	season.Set("binny_push_points", body.BinnyPush)
	season.Set("binny_loss_points", body.BinnyLoss)
	if err := e.App.Save(season); err != nil {
		return e.InternalServerError("Unable to create season.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"id": season.Id, "message": "Season created."})
}

func createLeagueWeek(e *core.RequestEvent) error {
	var body createLeagueWeekRequest
	if err := e.BindBody(&body); err != nil || body.Season == "" || body.Number <= 0 || body.Name == "" {
		return e.BadRequestError("Season, week number, and name are required.", err)
	}
	season, err := e.App.FindRecordById("seasons", body.Season)
	if err != nil {
		return e.NotFoundError("Season not found.", nil)
	}
	if err := requireCommissioner(e.App, season.GetString("league"), e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	weeks, err := e.App.FindCollectionByNameOrId("weeks")
	if err != nil {
		return e.InternalServerError("Weeks collection unavailable.", err)
	}
	if _, err := e.App.FindFirstRecordByFilter(weeks, "season = {:season} && number = {:number}", dbx.Params{"season": body.Season, "number": body.Number}); err == nil {
		return e.BadRequestError("That week number already exists.", nil)
	}
	week := core.NewRecord(weeks)
	week.Set("season", body.Season)
	week.Set("number", body.Number)
	week.Set("name", body.Name)
	week.Set("start_date", body.StartDate)
	week.Set("end_date", body.EndDate)
	week.Set("status", "SETUP")
	week.Set("allow_picks", false)
	week.Set("max_nfl_picks", 4)
	week.Set("max_ncaaf_picks", 4)
	week.Set("max_nfl_binny_picks", 1)
	week.Set("max_ncaaf_binny_picks", 1)
	week.Set("is_current", false)
	if err := e.App.Save(week); err != nil {
		return e.InternalServerError("Unable to create week.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"id": week.Id, "message": "League week created."})
}

func updateLeagueWeek(e *core.RequestEvent) error {
	var body updateLeagueWeekRequest
	if err := e.BindBody(&body); err != nil || body.Week == "" {
		return e.BadRequestError("A week is required.", err)
	}
	weeks, err := e.App.FindCollectionByNameOrId("weeks")
	if err != nil {
		return e.InternalServerError("Weeks collection unavailable.", err)
	}
	week, err := e.App.FindRecordById(weeks, body.Week)
	if err != nil {
		return e.NotFoundError("Week not found.", nil)
	}
	season, err := e.App.FindRecordById("seasons", week.GetString("season"))
	if err != nil {
		return e.NotFoundError("Season not found.", nil)
	}
	if err := requireCommissioner(e.App, season.GetString("league"), e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	if body.Status != nil {
		week.Set("status", *body.Status)
	}
	if body.AllowPicks != nil {
		week.Set("allow_picks", *body.AllowPicks)
	}
	if body.StartDate != nil {
		week.Set("start_date", *body.StartDate)
	}
	if body.EndDate != nil {
		week.Set("end_date", *body.EndDate)
	}
	if body.MaxNFLPicks != nil {
		week.Set("max_nfl_picks", *body.MaxNFLPicks)
	}
	if body.MaxNCAAFPicks != nil {
		week.Set("max_ncaaf_picks", *body.MaxNCAAFPicks)
	}
	if body.MaxNFLBinnyPicks != nil {
		week.Set("max_nfl_binny_picks", *body.MaxNFLBinnyPicks)
	}
	if body.MaxNCAAFBinnyPicks != nil {
		week.Set("max_ncaaf_binny_picks", *body.MaxNCAAFBinnyPicks)
	}
	if body.IsCurrent != nil && *body.IsCurrent {
		all, _ := e.App.FindRecordsByFilter(weeks, "season = {:season}", "", 0, 0, dbx.Params{"season": season.Id})
		for _, item := range all {
			item.Set("is_current", item.Id == week.Id)
			if saveErr := e.App.Save(item); saveErr != nil {
				return e.InternalServerError("Unable to update current week.", saveErr)
			}
		}
	} else if body.IsCurrent != nil {
		week.Set("is_current", false)
		if err := e.App.Save(week); err != nil {
			return e.InternalServerError("Unable to update week.", err)
		}
	}
	if body.IsCurrent == nil || !*body.IsCurrent {
		if err := e.App.Save(week); err != nil {
			return e.InternalServerError("Unable to update week.", err)
		}
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "League week updated."})
}

func approveLeagueRequestHandler(e *core.RequestEvent) error {
	if e.Auth.GetString("platform_role") != "PLATFORM_ADMIN" {
		return e.ForbiddenError("Only platform administrators can approve league requests.", nil)
	}
	var body approveLeagueRequest
	if err := e.BindBody(&body); err != nil || body.Request == "" {
		return e.BadRequestError("A league request is required.", err)
	}

	result := map[string]string{}
	err := e.App.RunInTransaction(func(txApp core.App) error {
		requests, err := txApp.FindCollectionByNameOrId("league_requests")
		if err != nil {
			return err
		}
		request, err := txApp.FindRecordById(requests, body.Request)
		if err != nil {
			return e.NotFoundError("League request not found.", nil)
		}
		if request.GetString("status") != "PENDING" {
			return errors.New("league request is not pending")
		}
		name := strings.TrimSpace(request.GetString("requested_name"))
		slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
		leagues, err := txApp.FindCollectionByNameOrId("leagues")
		if err != nil {
			return err
		}
		league := core.NewRecord(leagues)
		league.Set("name", name)
		league.Set("slug", slug)
		league.Set("description", request.GetString("description"))
		league.Set("status", "ACTIVE")
		league.Set("created_by", request.GetString("requester"))
		league.Set("approved_by", e.Auth.Id)
		league.Set("approved_at", time.Now().UTC().Format(time.RFC3339Nano))
		league.Set("timezone", "America/Chicago")
		if err := txApp.Save(league); err != nil {
			return err
		}

		seasons, err := txApp.FindCollectionByNameOrId("seasons")
		if err != nil {
			return err
		}
		now := time.Now().UTC()
		season := core.NewRecord(seasons)
		season.Set("league", league.Id)
		season.Set("name", fmt.Sprintf("%d Season", now.Year()))
		season.Set("year", now.Year())
		season.Set("status", "ACTIVE")
		season.Set("regular_win_points", 1.5)
		season.Set("regular_push_points", 0.75)
		season.Set("regular_loss_points", 0)
		season.Set("binny_win_points", 1)
		season.Set("binny_push_points", 0)
		season.Set("binny_loss_points", -1)
		if err := txApp.Save(season); err != nil {
			return err
		}

		weeks, err := txApp.FindCollectionByNameOrId("weeks")
		if err != nil {
			return err
		}
		week := core.NewRecord(weeks)
		week.Set("season", season.Id)
		week.Set("number", 1)
		week.Set("name", "Week 1")
		week.Set("status", "OPEN")
		week.Set("start_date", now.Format(time.RFC3339Nano))
		week.Set("end_date", now.AddDate(0, 0, 7).Format(time.RFC3339Nano))
		week.Set("allow_picks", true)
		week.Set("max_nfl_picks", 4)
		week.Set("max_ncaaf_picks", 4)
		week.Set("max_nfl_binny_picks", 1)
		week.Set("max_ncaaf_binny_picks", 1)
		week.Set("is_current", true)
		if err := txApp.Save(week); err != nil {
			return err
		}

		memberships, err := txApp.FindCollectionByNameOrId("league_memberships")
		if err != nil {
			return err
		}
		membership := core.NewRecord(memberships)
		membership.Set("league", league.Id)
		membership.Set("user", request.GetString("requester"))
		membership.Set("role", "COMMISSIONER")
		membership.Set("status", "ACTIVE")
		membership.Set("display_name", "")
		membership.Set("team_name", "")
		membership.Set("joined_at", time.Now().UTC().Format(time.RFC3339Nano))
		if err := txApp.Save(membership); err != nil {
			return err
		}
		teams, err := txApp.FindCollectionByNameOrId("league_teams")
		if err != nil {
			return err
		}
		team := core.NewRecord(teams)
		team.Set("league", league.Id)
		team.Set("name", name)
		team.Set("status", "ACTIVE")
		if err := txApp.Save(team); err != nil {
			return err
		}
		teamMembers, err := txApp.FindCollectionByNameOrId("league_team_members")
		if err != nil {
			return err
		}
		teamMember := core.NewRecord(teamMembers)
		teamMember.Set("league_team", team.Id)
		teamMember.Set("membership", membership.Id)
		if err := txApp.Save(teamMember); err != nil {
			return err
		}
		request.Set("status", "APPROVED")
		request.Set("reviewed_by", e.Auth.Id)
		request.Set("reviewed_at", time.Now().UTC().Format(time.RFC3339Nano))
		if err := txApp.Save(request); err != nil {
			return err
		}
		result["league"] = league.Id
		return nil
	})
	if err != nil {
		return e.BadRequestError(err.Error(), nil)
	}
	result["message"] = "League request approved."
	return e.JSON(http.StatusOK, result)
}

func schedulerHealth(e *core.RequestEvent) error {
	if e.Auth.GetString("platform_role") != "PLATFORM_ADMIN" {
		return e.ForbiddenError("Only platform administrators can view scheduler health.", nil)
	}

	runs, err := e.App.FindRecordsByFilter("scheduler_runs", "", "-started_at", 20, 0)
	if err != nil {
		return e.InternalServerError("Unable to load scheduler health.", err)
	}

	latest := map[string]map[string]any{}
	for _, run := range runs {
		job := run.GetString("job_name")
		if _, exists := latest[job]; exists {
			continue
		}
		latest[job] = map[string]any{
			"job_name":         job,
			"status":           run.GetString("status"),
			"started_at":       run.GetString("started_at"),
			"completed_at":     run.GetString("completed_at"),
			"error_message":    run.GetString("error_message"),
			"records_received": run.GetInt("records_received"),
			"records_created":  run.GetInt("records_created"),
			"records_updated":  run.GetInt("records_updated"),
			"records_failed":   run.GetInt("records_failed"),
		}
	}
	return e.JSON(http.StatusOK, map[string]any{"jobs": latest})
}

func updateDisplayName(e *core.RequestEvent) error {
	var body updateDisplayNameRequest
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.Membership) == "" {
		return e.BadRequestError("A membership is required.", err)
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 100 {
		return e.BadRequestError("Display name must be between 1 and 100 characters.", nil)
	}

	memberships, err := e.App.FindCollectionByNameOrId("league_memberships")
	if err != nil {
		return e.InternalServerError("Membership collection is unavailable.", err)
	}
	membership, err := e.App.FindRecordById(memberships, body.Membership)
	if err != nil || membership.GetString("user") != e.Auth.Id || membership.GetString("status") != "ACTIVE" {
		return e.ForbiddenError("You cannot update this membership.", nil)
	}
	membership.Set("display_name", name)
	if err := e.App.Save(membership); err != nil {
		return e.InternalServerError("Unable to update display name.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Display name updated."})
}

func createLeagueTeam(e *core.RequestEvent) error {
	var body createLeagueTeamRequest
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.League) == "" {
		return e.BadRequestError("A league is required.", err)
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 100 {
		return e.BadRequestError("Group name must be between 1 and 100 characters.", nil)
	}
	if err := requireCommissioner(e.App, body.League, e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	teams, err := e.App.FindCollectionByNameOrId("league_teams")
	if err != nil {
		return e.InternalServerError("Team collection is unavailable.", err)
	}
	if _, err = e.App.FindFirstRecordByFilter(teams, "league = {:league} && name = {:name}", map[string]any{"league": body.League, "name": name}); err == nil {
		return e.BadRequestError("That group name is already in use.", nil)
	}
	team := core.NewRecord(teams)
	team.Set("league", body.League)
	team.Set("name", name)
	team.Set("status", "ACTIVE")
	if err := e.App.Save(team); err != nil {
		return e.InternalServerError("Unable to create group.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"id": team.Id, "message": "Group created."})
}

func moveLeagueMember(e *core.RequestEvent) error {
	var body moveLeagueMemberRequest
	if err := e.BindBody(&body); err != nil || body.Membership == "" || body.LeagueTeam == "" {
		return e.BadRequestError("Membership and group are required.", err)
	}
	memberships, err := e.App.FindCollectionByNameOrId("league_memberships")
	if err != nil {
		return e.InternalServerError("Membership collection is unavailable.", err)
	}
	membership, err := e.App.FindRecordById(memberships, body.Membership)
	if err != nil {
		return e.NotFoundError("Membership not found.", nil)
	}
	leagueID := membership.GetString("league")
	if err := requireCommissioner(e.App, leagueID, e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	teams, err := e.App.FindCollectionByNameOrId("league_teams")
	if err != nil {
		return e.InternalServerError("Team collection is unavailable.", err)
	}
	target, err := e.App.FindRecordById(teams, body.LeagueTeam)
	if err != nil || target.GetString("league") != leagueID {
		return e.BadRequestError("Target group is not in this league.", nil)
	}
	teamMembers, err := e.App.FindCollectionByNameOrId("league_team_members")
	if err != nil {
		return e.InternalServerError("Team membership collection is unavailable.", err)
	}
	if existing, findErr := e.App.FindFirstRecordByFilter(teamMembers, "membership = {:membership}", map[string]any{"membership": body.Membership}); findErr == nil {
		if existing.GetString("league_team") == target.Id {
			return e.JSON(http.StatusOK, map[string]string{"message": "Member is already in this group."})
		}
		if err := e.App.Delete(existing); err != nil {
			return e.InternalServerError("Unable to remove old group membership.", err)
		}
	}
	assignment := core.NewRecord(teamMembers)
	assignment.Set("league_team", target.Id)
	assignment.Set("membership", body.Membership)
	if err := e.App.Save(assignment); err != nil {
		return e.InternalServerError("Unable to move member.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Member moved."})
}

func requireCommissioner(app core.App, leagueID string, userID string) error {
	memberships, err := app.FindCollectionByNameOrId("league_memberships")
	if err != nil {
		return err
	}
	allMemberships, err := app.FindAllRecords(memberships)
	if err != nil {
		return err
	}
	for _, membership := range allMemberships {
		if membership.GetString("league") == leagueID &&
			membership.GetString("user") == userID &&
			membership.GetString("role") == "COMMISSIONER" &&
			membership.GetString("status") == "ACTIVE" {
			return nil
		}
	}
	return errors.New("only an active league commissioner can perform this action")
}

func renameLeagueTeam(e *core.RequestEvent) error {
	var body renameLeagueTeamRequest
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.LeagueTeam) == "" {
		return e.BadRequestError("A league team is required.", err)
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || len(name) > 100 {
		return e.BadRequestError("Group name must be between 1 and 100 characters.", nil)
	}

	teams, err := e.App.FindCollectionByNameOrId("league_teams")
	if err != nil {
		return e.InternalServerError("Team collection is unavailable.", err)
	}
	team, err := e.App.FindRecordById(teams, body.LeagueTeam)
	if err != nil {
		return e.NotFoundError("League team not found.", nil)
	}
	members, err := e.App.FindCollectionByNameOrId("league_team_members")
	if err != nil {
		return e.InternalServerError("Team membership collection is unavailable.", err)
	}
	_, err = e.App.FindFirstRecordByFilter(members, "league_team = {:team} && membership.user = {:user} && membership.status = 'ACTIVE'", map[string]any{"team": team.Id, "user": e.Auth.Id})
	if err != nil {
		return e.ForbiddenError("You are not a member of this group.", nil)
	}
	_, err = e.App.FindFirstRecordByFilter(teams, "league = {:league} && name = {:name} && id != {:id}", map[string]any{"league": team.GetString("league"), "name": name, "id": team.Id})
	if err == nil {
		return e.BadRequestError("That group name is already in use.", nil)
	}
	team.Set("name", name)
	if err := e.App.Save(team); err != nil {
		return e.InternalServerError("Unable to rename group.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Group renamed."})
}

func overrideLeagueGame(e *core.RequestEvent) error {
	var body overrideLeagueGameRequest
	if err := e.BindBody(&body); err != nil || body.League == "" || body.Week == "" || body.Game == "" {
		return e.BadRequestError("League, week, and game are required.", err)
	}
	if err := requireCommissioner(e.App, body.League, e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	week, err := e.App.FindRecordById("weeks", body.Week)
	if err != nil || week.GetString("season") == "" {
		return e.NotFoundError("Week not found.", nil)
	}
	season, err := e.App.FindRecordById("seasons", week.GetString("season"))
	if err != nil || season.GetString("league") != body.League {
		return e.ForbiddenError("The week does not belong to this league.", nil)
	}
	game, err := e.App.FindRecordById("games", body.Game)
	if err != nil || game.GetString("week_record") != body.Week {
		return e.BadRequestError("The game does not belong to this league week.", nil)
	}

	leagueGames, err := e.App.FindCollectionByNameOrId("league_games")
	if err != nil {
		return e.InternalServerError("League games collection is unavailable.", err)
	}
	leagueGame, findErr := e.App.FindFirstRecordByFilter(leagueGames, "league = {:league} && game = {:game}", map[string]any{"league": body.League, "game": body.Game})
	if findErr != nil {
		leagueGame = core.NewRecord(leagueGames)
		leagueGame.Set("league", body.League)
		leagueGame.Set("week", body.Week)
		leagueGame.Set("game", body.Game)
	}
	leagueGame.Set("included", body.Included)
	leagueGame.Set("manual_override", true)
	if err := e.App.Save(leagueGame); err != nil {
		return e.InternalServerError("Unable to save game override.", err)
	}
	message := "Game included for this league."
	if !body.Included { message = "Game excluded from this league." }
	return e.JSON(http.StatusOK, map[string]string{"message": message})
}

func revokeLeagueInvite(e *core.RequestEvent) error {
	var body revokeInviteRequest
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.Invite) == "" {
		return e.BadRequestError("An invite is required.", err)
	}

	invites, err := e.App.FindCollectionByNameOrId("league_invites")
	if err != nil {
		return e.InternalServerError("Invite collection is unavailable.", err)
	}
	invite, err := e.App.FindRecordById(invites, body.Invite)
	if err != nil {
		return e.NotFoundError("Invite not found.", nil)
	}
	if err := requireCommissioner(e.App, invite.GetString("league"), e.Auth.Id); err != nil {
		return e.ForbiddenError(err.Error(), nil)
	}
	if invite.GetString("status") == "REVOKED" {
		return e.JSON(http.StatusOK, map[string]string{"message": "Invite is already revoked."})
	}
	invite.Set("status", "REVOKED")
	if err := e.App.Save(invite); err != nil {
		return e.InternalServerError("Unable to revoke invite.", err)
	}
	return e.JSON(http.StatusOK, map[string]string{"message": "Invite revoked."})
}

func acceptLeagueInvite(e *core.RequestEvent) error {
	var body acceptInviteRequest
	if err := e.BindBody(&body); err != nil || strings.TrimSpace(body.Token) == "" {
		return e.BadRequestError("A valid invite token is required.", err)
	}

	tokenHash := sha256.Sum256([]byte(body.Token))
	hash := hex.EncodeToString(tokenHash[:])
	userID := e.Auth.Id
	var leagueID string
	var teamID string

	err := e.App.RunInTransaction(func(txApp core.App) error {
		invites, err := txApp.FindCollectionByNameOrId("league_invites")
		if err != nil {
			return err
		}
		invite, err := txApp.FindFirstRecordByFilter(invites, "token_hash = {:hash}", map[string]any{"hash": hash})
		if err != nil {
			return errors.New("invite not found")
		}

		if invite.GetString("status") != "ACTIVE" {
			return errors.New("invite is not active")
		}
		if expiry := invite.GetDateTime("expires_at"); !expiry.IsZero() && !expiry.Time().After(time.Now()) {
			return errors.New("invite has expired")
		}
		if maxUses := invite.GetInt("max_uses"); maxUses > 0 && invite.GetInt("use_count") >= maxUses {
			return errors.New("invite usage limit reached")
		}

		leagueID = invite.GetString("league")
		memberships, err := txApp.FindCollectionByNameOrId("league_memberships")
		if err != nil {
			return err
		}
		if _, err = txApp.FindFirstRecordByFilter(memberships, "league = {:league} && user = {:user}", map[string]any{"league": leagueID, "user": userID}); err == nil {
			return errors.New("user is already a member of this league")
		}

		displayName := strings.TrimSpace(e.Auth.GetString("first_name") + " " + e.Auth.GetString("last_name"))
		if displayName == "" {
			displayName = "Member " + userID[len(userID)-6:]
		}

		membership := core.NewRecord(memberships)
		membership.Set("league", leagueID)
		membership.Set("user", userID)
		membership.Set("role", "MEMBER")
		membership.Set("status", "ACTIVE")
		membership.Set("display_name", displayName)
		membership.Set("joined_at", time.Now().UTC().Format(time.RFC3339Nano))
		if err = txApp.Save(membership); err != nil {
			return err
		}

		teams, err := txApp.FindCollectionByNameOrId("league_teams")
		if err != nil {
			return err
		}
		team := core.NewRecord(teams)
		team.Set("league", leagueID)
		team.Set("name", displayName)
		team.Set("status", "ACTIVE")
		if err = txApp.Save(team); err != nil {
			return err
		}
		teamID = team.Id

		teamMembers, err := txApp.FindCollectionByNameOrId("league_team_members")
		if err != nil {
			return err
		}
		teamMember := core.NewRecord(teamMembers)
		teamMember.Set("league_team", team.Id)
		teamMember.Set("membership", membership.Id)
		if err = txApp.Save(teamMember); err != nil {
			return err
		}

		invite.Set("use_count", invite.GetInt("use_count")+1)
		return txApp.Save(invite)
	})

	if err != nil {
		return e.BadRequestError(err.Error(), nil)
	}

	return e.JSON(http.StatusOK, map[string]string{
		"league":      leagueID,
		"league_team": teamID,
		"message":     "Invite accepted.",
	})
}
