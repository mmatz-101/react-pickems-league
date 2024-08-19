import argparse
import csv

import requests

NFL_URL = "https://www.oddsshark.com/api/scores/football/nfl/2024/1/?_format=json"
NCAA_URL = "https://www.oddsshark.com/api/scores/football/ncaaf/2024/1/?_format=json"
DB_URL = "http://127.0.0.1:8090"
NFL_IMAGE_DATA = {}
NCAA_IMAGE_DATE = {}


def check_team_exists(name: str) -> bool:
    params = {"filter": f'(name="{name}")'}
    resp = requests.get(f"{DB_URL}/api/collections/teams/records/", params=params)
    if resp.status_code != 200:
        print(f"Error fetching {name} from database")
        print(resp.url)
        print(resp.status_code)
        print(resp.json())
        raise Exception

    if resp.json()["items"] == []:
        return False

    return True


def get_team_id(name: str) -> str:
    params = {"filter": f'(name="{name}")'}
    resp = requests.get(
        f"{DB_URL}/api/collections/teams/records/",
        params=params,
    )
    if resp.status_code != 200:
        print(f"Error fetching id for {name} from database")
        print(resp.url)
        print(resp.status_code)
        print(resp.json())
        raise Exception

    return resp.json()["items"][0]["id"]


def update_team(abrv, display_name, name, nick_name, short_name, league):
    team = {
        "name_abbreviation": abrv,
        "display_name": display_name,
        "name": name,
        "nick_name": nick_name,
        "short_name": short_name,
        "image_src": NFL_IMAGE_DATA.get(name, "").strip()
        or NCAA_IMAGE_DATE.get(name, "").strip(),
        "league": league,
    }

    team_id = get_team_id(name)

    resp = requests.patch(
        f"{DB_URL}/api/collections/teams/records/{team_id}", json=team
    )
    if resp.status_code != 200:
        print(f"Error uploading team {name} to database")
        print(resp.url)
        print(resp.status_code)
        print(resp.json())
        raise Exception


def create_team(abrv, display_name, name, nick_name, short_name, league):
    team = {
        "name_abbreviation": abrv,
        "display_name": display_name,
        "name": name,
        "nick_name": nick_name,
        "short_name": short_name,
        "img_src": NFL_IMAGE_DATA.get(name, "").strip()
        or NCAA_IMAGE_DATE.get(name, "").strip(),
        "league": league,
    }

    resp = requests.post(f"{DB_URL}/api/collections/teams/records", json=team)
    if resp.status_code != 200:
        print(f"Error uploading team {team['name']} to database")


def open_csv(file_name) -> dict[str, str]:
    with open(file_name, "r") as file:
        reader = csv.reader(file)
        return {row[0]: row[1] for row in reader}


def main():
    response_nfl = requests.get(NFL_URL)
    response_ncaa = requests.get(NCAA_URL)
    resp_json_nfl = response_nfl.json()
    resp_json_ncaa = response_ncaa.json()

    league_resp = [resp_json_nfl, resp_json_ncaa]
    league_value = "NFL"
    for league in league_resp:
        for game in league["scores"].values():
            # get home team info
            home_abbr = game["teams"]["home"]["names"]["abbreviation"]
            home_display_name = game["teams"]["home"]["names"]["display_name"]
            home_name = game["teams"]["home"]["names"]["name"]
            home_nick_name = game["teams"]["home"]["names"]["nick_name"]
            home_short_name = game["teams"]["home"]["names"]["short_name"]
            # get away team info
            away_abbr = game["teams"]["away"]["names"]["abbreviation"]
            away_display_name = game["teams"]["away"]["names"]["display_name"]
            away_name = game["teams"]["away"]["names"]["name"]
            away_nick_name = game["teams"]["away"]["names"]["nick_name"]
            away_short_name = game["teams"]["away"]["names"]["short_name"]

            if not check_team_exists(home_name):
                create_team(
                    home_abbr,
                    home_display_name,
                    home_name,
                    home_nick_name,
                    home_short_name,
                    league_value,
                )
            else:
                update_team(
                    home_abbr,
                    home_display_name,
                    home_name,
                    home_nick_name,
                    home_short_name,
                    league_value,
                )
            if not check_team_exists(away_name):
                create_team(
                    away_abbr,
                    away_display_name,
                    away_name,
                    away_nick_name,
                    away_short_name,
                    league_value,
                )
            else:
                update_team(
                    away_abbr,
                    away_display_name,
                    away_name,
                    away_nick_name,
                    away_short_name,
                    league_value,
                )
        league_value = "NCAAF"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("team", type=str, help="Team name")
    NFL_IMAGE_DATA = open_csv("nfl_info.csv")
    NCAA_IMAGE_DATE = open_csv("ncaa_info.csv")
    main()
