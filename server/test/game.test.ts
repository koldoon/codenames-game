import * as axios from 'axios';
import { GameStatus } from '../src/api/game_status';
import { CommitCodeRequest } from '../src/api/http/commit_code_request';
import { CommitCodeResponse } from '../src/api/http/commit_code_response';
import { GameStatusResponse } from '../src/api/http/game_status_response';
import { NewGameResponse } from '../src/api/http/new_game_response';
import { UncoverAgentResponse } from '../src/api/http/uncover_agent_response';
import { PlayerType } from '../src/api/player_type';
import { Side } from '../src/model/agent_side';

const serverUrl = process.env.TEST_URL || 'http://localhost:3000';
const request = axios.default.create({
    baseURL: serverUrl
});

let gameId = '';
let game: GameStatus;

test('Stat ' + serverUrl, async () => {
    const res = await request('/api/stat/info');
    console.info(res.data);
});

async function updateCaptainsBoard() {
    const res = await request(`/api/games/${gameId}/status?player=${PlayerType.Spymaster}`);
    game = (res.data as GameStatusResponse).game;
}

test('New game', async () => {
    const res = await request(`/api/games/create`);
    gameId = (res.data as NewGameResponse).gameId;
    expect(gameId).toBeDefined();
    expect(typeof gameId).toBe('string');
});


test('Get captains board', async () => {
    await updateCaptainsBoard();
    expect(game).toBeDefined();
});

test('Board configuration', () => {
    const sidesCount = new Map<Side, number>();
    for (const agent of game.board) {
        expect(agent.name).toBeTruthy();
        expect(agent.name.length >= 2).toBeTruthy();
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

test('Commit code in general', async () => {
    const res = await request({
        url: `/api/games/${gameId}/commit-code`,
        method: 'post',
        data: <CommitCodeRequest> {
            message: 'Allegra 8'
        }
    });
    const data = res.data as CommitCodeResponse;

    expect(data).toMatchObject(<CommitCodeResponse> {
        move: {
            hint: 'Allegra',
            count: 9,
            isInited: true,
            isFinished: false
        }
    });

    expect(data.move.side >= Side.UNKNOWN).toBeTruthy();
    expect(data.move.side <= Side.NEUTRAL).toBeTruthy();
});

test('Uncover the agent', async () => {
    const index = Number((Math.random() * 24).toFixed(0));
    const res = await request(`/api/games/${gameId}/agents/${index}/uncover`);
    const data = res.data as UncoverAgentResponse;

    expect(data).toMatchObject(<UncoverAgentResponse> {
        agent: {
            i: index,
            name: game.board[index].name,
            side: game.board[index].side,
            uncovered: true
        }
    });
});

test('Commit code zero', async () => {
    const res = await request({
        url: `/api/games/${gameId}/commit-code`,
        method: 'post',
        data: <CommitCodeRequest> {
            message: 'Joy 0'
        }
    });
    const data = res.data as CommitCodeResponse;

    expect(data).toMatchObject(<CommitCodeResponse> {
        move: {
            hint: 'Joy',
            count: 25,
            isInited: true,
            isFinished: false
        }
    });
});
