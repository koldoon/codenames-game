# CODENAMES Board Game Server and Frontend

This is a simple implementation of the famous board game - Codenames (by Vlaada Chvátil) -
using __Node.js__, __Angular__ and __Google Material UI__. No any database is used, all the games are kept in runtime memory for
one hour of inactivity. 

The Game is implemented with Russian interface and includes Russian words dictionary (so far).
You can create your own dictionary by implementing `DictionaryModel` interface (see `GamesService` for usage).

## Steps to run
 - Install [Node.js](https://nodejs.org/en/)
 - Clone this repo: `$ git clone https://github.com/koldoon/codenames-game.git`
 - `$ cd codenames-game`
 - `$ npm i` - install dependencies
 - `$ npm run build` - build sources into `./dist`
 - `$ npm run start` - start game server serving API and frontend
 - Open `http://localhost:8095/` and have a fun

Default http port (8095) can be changed via `CODENAMES_HTTP_PORT` environment variable.

## How to play
See [Wikipedia](https://en.wikipedia.org/wiki/Codenames_(board_game)) for the rules and details.
