package main

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/hook"
)

type acceptInviteRequest struct {
	Token string `json:"token"`
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

func registerInviteRoutes(app *pocketbase.PocketBase) {
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			e.Router.POST("/api/league-invites/accept", acceptLeagueInvite).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-memberships/update-display-name", updateDisplayName).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/rename", renameLeagueTeam).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/create", createLeagueTeam).Bind(apis.RequireAuth())
			e.Router.POST("/api/league-teams/move-member", moveLeagueMember).Bind(apis.RequireAuth())
			e.Router.GET("/api/scheduler/health", schedulerHealth).Bind(apis.RequireAuth())
			return e.Next()
		},
		Priority: 999,
	})
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
			"job_name":      job,
			"status":        run.GetString("status"),
			"started_at":    run.GetString("started_at"),
			"completed_at":  run.GetString("completed_at"),
			"error_message": run.GetString("error_message"),
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

		membership := core.NewRecord(memberships)
		membership.Set("league", leagueID)
		membership.Set("user", userID)
		membership.Set("role", "MEMBER")
		membership.Set("status", "ACTIVE")
		membership.Set("joined_at", time.Now().UTC().Format(time.RFC3339Nano))
		if err = txApp.Save(membership); err != nil {
			return err
		}

		teams, err := txApp.FindCollectionByNameOrId("league_teams")
		if err != nil {
			return err
		}
		displayName := strings.TrimSpace(e.Auth.GetString("first_name") + " " + e.Auth.GetString("last_name"))
		if displayName == "" {
			displayName = "Member " + userID[len(userID)-6:]
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
