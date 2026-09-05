package main

import "testing"

func TestLatestPreferredSpreadPrefersBet365(t *testing.T) {
	books := []CoversBookOdds{
		{SportsbookName: "DraftKings", SpreadHistory: []CoversSpreadHistory{{Spread: -4.5, OddsDate: "2026-09-05T12:00:00Z"}}},
		{SportsbookName: "Bet365", SpreadHistory: []CoversSpreadHistory{{Spread: -3.5, OddsDate: "2026-09-05T10:00:00Z"}}},
	}
	home, away, found := LatestPreferredSpread(books)
	if !found || home != -3.5 || away != 3.5 {
		t.Errorf("LatestPreferredSpread() = (%v, %v, %v), want (-3.5, 3.5, true)", home, away, found)
	}
}

func TestLatestPreferredSpreadFallsBackToDraftKings(t *testing.T) {
	books := []CoversBookOdds{
		{SportsbookName: "Bet365", SpreadHistory: []CoversSpreadHistory{{Spread: 0, OddsDate: "2026-09-05T10:00:00Z"}}},
		{SportsbookName: "DraftKings", SpreadHistory: []CoversSpreadHistory{{Spread: 2.5, OddsDate: "2026-09-05T12:00:00Z"}}},
	}
	home, away, found := LatestPreferredSpread(books)
	if !found || home != 2.5 || away != -2.5 {
		t.Errorf("LatestPreferredSpread() = (%v, %v, %v), want (2.5, -2.5, true)", home, away, found)
	}
}
