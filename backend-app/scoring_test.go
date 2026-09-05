package main

import "testing"

func TestIsGameComplete(t *testing.T) {
	for _, status := range []string{"FINAL", "FINAL OT", "complete", " COMPLETE "} {
		if !IsGameComplete(status) {
			t.Errorf("IsGameComplete(%q) = false, want true", status)
		}
	}
	for _, status := range []string{"SCHEDULED", "IN PROGRESS", ""} {
		if IsGameComplete(status) {
			t.Errorf("IsGameComplete(%q) = true, want false", status)
		}
	}
}

func TestGetGameWinnerScoresCompleteStatus(t *testing.T) {
	if winner := GetGameWinner("COMPLETE", 51, -40.5, 0, 40.5); winner != "HOME" {
		t.Errorf("GetGameWinner(COMPLETE) = %q, want HOME", winner)
	}
}
