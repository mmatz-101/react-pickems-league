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

func registerInviteRoutes(app *pocketbase.PocketBase) {
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			e.Router.POST("/api/league-invites/accept", acceptLeagueInvite).Bind(apis.RequireAuth())
			return e.Next()
		},
	})
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
