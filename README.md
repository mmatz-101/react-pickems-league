# PICKEMS
____
Pickem's is a sports betting league for the NFL and NCAA, where you can challenge friends and family by betting against team spreads. I created this site to eliminate the need for the Excel file previously used by the commissioner.

This project uses __Pocketbase__ for the backend, along with custom CRON jobs to pull spreads from existing sports betting sites. The frontend is built with __Next.js__ and __Tailwind CSS__, and I use __Python__ scripts to automate various database-related tasks.


# FAQ:
How often are the games/results updated?
- Every minute, this is subject to change depending on loading and cost on server.
___
What are the point systems?
- Regular Picks 
	- WIN = 1.5
	- PUSH = .75
	- LOST = 0
- Binny Buys
	- WIN = 1 
	- PUSH = 0
	- LOST = -1
___
How many picks do I get?
- On a normal week, 4 regular college games, 4 regular professional games, 1 binnny college game, 1 binny professional game
- Depending on season length random weeks (like playoffs) might have different numbers.
___
Are my picks __FINAL__?
- __Yes__, picks and spread are finalized once the pick is submitted. Your pick spread will be reflected in the user dashboard. However, the realtime spread will be shown in the picks tab.
___
When is the last day/time I can submit my pick?
- __Up until kickoff__, after that picks for that game will be closed. Make sure to pace yourself so that you use all of the picks you are allotted.
___
Can I see other people's picks?
- __Yes__, the up to date picks for the current week list will be availabl. Feel free to use this to your advantage (aka. fade Jayson).
