import argparse
import csv
import requests
from difflib import get_close_matches
import re

NFL_URL = "https://www.oddsshark.com/api/ticker/nfl?_format=json"
NCAA_URL = "https://www.oddsshark.com/api/ticker/ncaaf?_format=json"
DB_URL = "http://127.0.0.1:8090"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0"
}
NFL_IMAGE_DATA = {}
NCAA_IMAGE_DATA = {}


def _norm(s: str) -> str:
    s = s.casefold().strip()
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s


def get_image_src_fuzzy_stdlib(
    name: str, *image_maps: dict[str, str], cutoff=0.82
) -> str:
    if not name:
        return ""
    flat = {}
    for m in image_maps:
        flat.update(m)
    norm_keys = {_norm(k): k for k in flat.keys()}

    if name in flat:
        return flat[name].strip()

    norm = _norm(name)
    if norm in norm_keys:
        return flat[norm_keys[norm]].strip()

    candidates = get_close_matches(norm, norm_keys.keys(), n=1, cutoff=cutoff)
    if candidates:
        return flat[norm_keys[candidates[0]]].strip()
    return ""


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
    if league == "NFL":
        src = get_image_src_fuzzy_stdlib(name, NFL_IMAGE_DATA, cutoff=0.50)
    else:
        src = get_image_src_fuzzy_stdlib(name, NCAA_IMAGE_DATA, cutoff=0.80)

    if src == "image_src":
        src = ""
    team = {
        "name_abbreviation": abrv,
        "display_name": display_name,
        "name": name,
        "nick_name": nick_name,
        "short_name": short_name,
        "image_src": src,
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
    if league == "NFL":
        src = get_image_src_fuzzy_stdlib(name, NFL_IMAGE_DATA, cutoff=0.50)
    else:
        src = get_image_src_fuzzy_stdlib(name, NCAA_IMAGE_DATA, cutoff=0.80)

    if src == "image_src":
        src = ""
    team = {
        "name_abbreviation": abrv,
        "display_name": display_name,
        "name": name,
        "nick_name": nick_name,
        "short_name": short_name,
        "image_src": src,
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
    response_nfl = requests.get(NFL_URL, headers=HEADERS)
    response_ncaa = requests.get(NCAA_URL, headers=HEADERS)
    resp_json_nfl = response_nfl.json()
    resp_json_ncaa = response_ncaa.json()

    league_resp = [resp_json_nfl, resp_json_ncaa]
    league_value = "NFL"
    for league in league_resp:
        for matches in league["matches"]:
            for match in matches["matches"]:
                # get home team info
                home_abbr = match["teams"]["home"]["shortName"]
                home_display_name = match["teams"]["home"]["name"]
                home_name = match["teams"]["home"]["name"]
                home_nick_name = match["teams"]["home"]["shortName"]
                home_short_name = match["teams"]["home"]["shortName"]
                # get away team info
                away_abbr = match["teams"]["away"]["shortName"]
                away_display_name = match["teams"]["away"]["name"]
                away_name = match["teams"]["away"]["name"]
                away_nick_name = match["teams"]["away"]["shortName"]
                away_short_name = match["teams"]["away"]["shortName"]

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
    NCAA_IMAGE_DATA = open_csv("ncaa_info.csv")
    main()
