# CODENAMES Board Game Server and Frontend

This is a simple implementation of the famous board game - Codenames (by Vlaada Chvátil) -
using __Node.js__, __Angular__ and __Google Material UI__. No any database is used, all the games are kept in runtime memory for
one hour of inactivity. 

The Game is implemented with Russian interface and includes Russian words dictionary (so far).
You can create your own dictionary by implementing `DictionaryModel` interface (see `GamesService` for usage) or simply
put extra yaml files in `dist/data` directory respecting the same structure as in others.

## Steps to run
 - Install [Node.js](https://nodejs.org/en/)
 - `$ git clone https://github.com/koldoon/codenames-game.git` - clone this repo
 - `$ cd codenames-game`
 - `$ npm i` - install dependencies
 - `$ npm run build` - build sources into `./dist`
 - `$ npm run start` - start game server serving API and frontend
 - Open `http://localhost:8095/` and have a fun

## Build Docker image from local sources build
 - Install [Node.js](https://nodejs.org/en/)
 - Install [Docker](https://www.docker.com/)
 - `$ git clone https://github.com/koldoon/codenames-game.git` - clone this repo
 - `$ cd codenames-game`
 - `$ npm i` - install dependencies
 - `$ npm run build-docker`
 
Result image will be tagged as `codenames-game:latest`.

## Build Docker image only (using staged build)
 - Install [Docker](https://www.docker.com/)
 - `$ curl https://raw.githubusercontent.com/koldoon/codenames-game/master/Dockerfile.master -o Dockerfile`
 - `$ docker build -t codenames-game .`

## ENV Options
 - Default http port (8095) can be changed via `CODENAMES_HTTP_PORT`
 - `NO_CONSOLE_COLORS=1` to disable colorful console output 

## How to play
See [Wikipedia](https://en.wikipedia.org/wiki/Codenames_(board_game)) for the rules and details.
