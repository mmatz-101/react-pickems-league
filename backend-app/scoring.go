package main

// GetGameWinner returns the winner of the game or empty string if it isn't final.
func GetGameWinner(status string, homeScore, homeSpread, awayScore, awaySpread float32) string {
	if status != "FINAL" && status != "FINAL OT" {
		return ""
	}
	if homeScore-homeSpread > awayScore {
		return "HOME"
	}
	if awayScore-awaySpread > homeScore {
		return "AWAY"
	}
	return "PUSH"
}

// UpdatePickResult calculates a pick result from the immutable pick spread.
func UpdatePickResult(pick PickDataExpand, scoring ScoringConfig) PickDataExpand {
	var adjusted, opponent float32
	if pick.TeamSelected == "HOME" {
		adjusted, opponent = pick.PickSpread+float32(pick.Expand.Game.HomeScore), float32(pick.Expand.Game.AwayScore)
	}
	if pick.TeamSelected == "AWAY" {
		adjusted, opponent = pick.PickSpread+float32(pick.Expand.Game.AwayScore), float32(pick.Expand.Game.HomeScore)
	}
	if adjusted > opponent {
		pick.ResultText = "WIN"
		pick.ResultPoints = scoring.RegularPointValue
		if pick.PickType == "BINNY" {
			pick.ResultPoints = scoring.BinnyPointValue
		}
	} else if adjusted == opponent {
		pick.ResultText = "PUSH"
		pick.ResultPoints = scoring.RegularPointValue / 2
		if pick.PickType == "BINNY" {
			pick.ResultPoints = 0
		}
	} else {
		pick.ResultText = "LOST"
		pick.ResultPoints = 0
		if pick.PickType == "BINNY" {
			pick.ResultPoints = -scoring.BinnyPointValue
		}
	}
	return pick
}
