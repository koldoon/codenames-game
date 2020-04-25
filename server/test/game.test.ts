import * as bent from 'bent';
import { GameStatus } from '../src/api/game_status';
import { CommitCodeRequest } from '../src/api/http/commit_code_request';
import { CommitCodeResponse } from '../src/api/http/commit_code_response';
import { GameStatusResponse } from '../src/api/http/game_status_response';
import { NewGameResponse } from '../src/api/http/new_game_response';
import { PlayerType } from '../src/api/player_type';
import { Side } from '../src/model/agent_side';

const serverUrl = 'http://localhost:3000';
const getJson = bent('json');
const postJson = bent('POST', 'json');

let gameId = '';
let game: GameStatus;


test('New game', async () => {
    const res = <NewGameResponse> await getJson(
        `${serverUrl}/api/games/create`
    );

    gameId = res.gameId;
    expect(gameId).toBeDefined();
    expect(typeof gameId).toBe('string');
});


test('Get captains board', async () => {
    const res = <GameStatusResponse> await getJson(
        `${serverUrl}/api/games/${gameId}/status?player=${PlayerType.Spymaster}`
    );

    game = res.game;
    expect(game).toBeDefined();
});

test('Board configuration', () => {
    const sidesCount = new Map<Side, number>();
    for (const agent of game.board) {
        sidesCount.set(agent.side, (sidesCount.get(agent.side) || 0) + 1);
    }

    expect(sidesCount.get(Side.ASSASSIN)).toBe(1);
    expect(sidesCount.get(Side.NEUTRAL)).toBe(7);
    expect(sidesCount.get(Side.BLUE)).toBeGreaterThanOrEqual(8);
    expect(sidesCount.get(Side.BLUE)).toBeLessThanOrEqual(9);
    expect(sidesCount.get(Side.RED)).toBeGreaterThanOrEqual(8);
    expect(sidesCount.get(Side.RED)).toBeLessThanOrEqual(9);
    expect(sidesCount.get(Side.RED) != sidesCount.get(Side.BLUE)).toBeTruthy();

    expect(game.board.length).toBe(25);
    expect(game.isFinished).toBeFalsy();
    expect(game.redLeft).toBe(sidesCount.get(Side.RED));
    expect(game.blueLeft).toBe(sidesCount.get(Side.BLUE));
});

test('Commit code', async () => {
    const res = <CommitCodeResponse> await postJson(
        `${serverUrl}/api/games/${gameId}/commit-code`,
        <CommitCodeRequest> {
            message: 'Allegra 8'
        }
    );

    expect(res).toMatchObject(<CommitCodeResponse> {
        move: {
            hint: 'Allegra',
            count: 9,
            isInited: true,
            isFinished: false
        }
    });

    expect(res.move.side >= Side.UNKNOWN).toBeTruthy();
    expect(res.move.side <= Side.NEUTRAL).toBeTruthy();
});
