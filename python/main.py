import argparse
import re
from dataclasses import dataclass

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


def main():
    print(f"Scraping {args.league} team information")
    if args.league == "nfl":
        league_url = "https://www.espn.com/nfl/teams"
    else:
        league_url = "https://www.espn.com/college-football/teams"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto(league_url)

        page.wait_for_selector("h2.di.clr-gray-01.h5")

        html_content = page.content()

        browser.close()

    @dataclass
    class Team:
        """
        Dataclass for the team information
        img_src: str
        team_name: str
        """

        team_name: str
        image_src: str

    data: list[Team] = []

    soup = BeautifulSoup(html_content, "html.parser")

    for team_content in soup.find_all("section", class_="TeamLinks flex items-center"):
        # parsing the team name
        team_name = team_content.find_next("h2", class_="di clr-gray-01 h5").text
        team_name = re.sub(r"\s+", " ", team_name).strip()
        # image src
        image_src = team_content.find_next("img", class_="Image Logo Logo__lg")["src"]

        # append to list
        data.append(Team(team_name, image_src))

    with open(f"./{args.league}_info.csv", "w") as f:
        # write the headers
        f.write("team_name, image_src\n")
        for team in data:
            f.write(f"{team.team_name}, {team.image_src}\n")
        print("Data written to csv file.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape NFL/NCAA team information")
    parser.add_argument(
        "--league", choices=["nfl", "ncaa"], required=True, help="League to process"
    )
    args = parser.parse_args()
    main()
