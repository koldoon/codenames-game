import { generate_id } from '../core/generate_id';
import { Agent } from './agent';
import { Side } from './agent_side';
import { Game } from './game';
import { GameEventKind } from './game_log_item';
import { GameMove } from './game_move';
import { PlayerSide } from './player_side';
import { Room } from './storage/room';
import shuffle = require('shuffle-array');
import generateId = generate_id.generateId;

/**
 * RoomModel keeps Room (storage) structure consistent,
 * offering methods for formal data manipulation.
 */
export class RoomModel {
    static readonly DEFAULT_BOARD_SIZE = 25;

    constructor(
        public readonly room: Room) {
    }

    static createRoom(words: string[]): Room {
        return {
            id: generateId(8),
            lastActivity: new Date(),
            gamesPlayed: 0,
            game: this.createGame(words)
        }
    }

    static createGame(words: string[]): Game {
        const boardSize = RoomModel.DEFAULT_BOARD_SIZE;
        const boardConfig = RoomModel.createRandomizedAgentsSidesList(boardSize);
        const teamSize = (boardSize - 1) / 3;
        const board: Agent[] = [];

        for (let i = 0; i < boardSize; i++) {
            board.push({
                i,
                name: words.pop()!,
                side: boardConfig.sides.pop()!,
                uncovered: false
            });
        }

        const move: GameMove = {
            side: boardConfig.firstMove,
            hint: '',
            count: 0,
            isFinished: false,
            isInited: false
        };

        const game: Game = {
            id: generateId(6),
            isFinished: false,
            blueLeft: teamSize,
            redLeft: teamSize,
            events: [],
            boardSize,
            board,
            move
        };

        move.side == Side.BLUE
            ? game.blueLeft += 1
            : game.redLeft += 1;

        return game;
    }

    newGame(words: string[]) {
        this.room.game = RoomModel.createGame(words);
        this.room.lastActivity = new Date();
        this.room.gamesPlayed += 1;
    }

    uncoverAgent(index: number) {
        if (!this.room.game)
            return null;

        const game = this.room.game;
        const agent = game.board[index];
        const moveAllowed = game.move.isInited && !game.move.isFinished;

        if (!agent || agent.uncovered || game.isFinished || !moveAllowed)
            return null;

        agent.uncovered = true;
        game.move.count -= 1;
        this.room.lastActivity = new Date();

        game.events.push({
            kind: GameEventKind.AgentUncovered,
            side: agent.side,
            index
        });

        if (agent.side == Side.BLUE) {
            game.blueLeft -= 1;
        }
        else if (agent.side == Side.RED) {
            game.redLeft -= 1;
        }

        if (agent.side != game.move.side || game.move.count == 0)
            game.move.isFinished = true;

        if (!game.redLeft || !game.blueLeft || agent.side == Side.ASSASSIN) {
            game.move.isFinished = true;
            game.isFinished = true;

            const sideWinner = agent.side == Side.ASSASSIN
                ? game.move.side == Side.RED ? Side.BLUE : Side.RED
                : game.move.side;

            game.events.push({
                kind: GameEventKind.GameFinished,
                sideWinner
            });
        }

        return agent;
    }

    commitHint(hint: string, matchCount: number) {
        const game = this.room.game;
        if (!game || game.isFinished)
            return false;

        const side = game.move.isInited
            ? game.move.side == Side.BLUE ? Side.RED : Side.BLUE
            : game.move.side;

        game.move = {
            hint,
            side,
            count: matchCount == 0 ? game.boardSize : (matchCount + 1),
            isInited: true,
            isFinished: false
        };

        game.events.push({
            kind: GameEventKind.SpymasterHint,
            hint,
            side,
            count: matchCount
        });

        return game.move;
    }

    private static createRandomizedAgentsSidesList(boardSize: number) {
        const sideSize = (boardSize - 1) / 3;

        const sides: Side[] = [
            ...Array(sideSize - 1).fill(Side.NEUTRAL), Side.ASSASSIN,
            ...Array(sideSize).fill(Side.BLUE),
            ...Array(sideSize).fill(Side.RED)
        ];

        const firstMove: PlayerSide =
            Math.random() > 0.5
                ? Side.RED
                : Side.BLUE;

        sides.push(firstMove);
        return { sides: shuffle(sides), firstMove };
    }
}
