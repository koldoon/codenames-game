import { Collection } from 'mongodb';
import { ErrorCode } from '../../api/api_error';
import { PlayerType } from '../../api/player_type';
import { assert } from '../../core/assert';
import { createGameError } from '../../core/create_game_error';
import { OnApplicationInit } from '../../core/on_application_init';
import { Agent } from '../../model/agent';
import { Side } from '../../model/agent_side';
import { GameMove } from '../../model/game_move';
import { RoomModel } from '../../model/room_model';
import { Room } from '../../model/storage/room';
import { DictionariesService } from './dictionaries_service';
import { StorageService } from './storage_service';

export class RoomsService implements OnApplicationInit {
    constructor(
        private storage: StorageService,
        private dictionariesService: DictionariesService) {
    }

    private rooms!: Collection<Room>;

    init() {
        this.rooms = this.storage.db.collection('rooms');
    }

    async createNewGame(dictionaryId: number, prev?: { roomId: string, gameId: string }) {
        const dictionary = this.dictionariesService.dictionaries[dictionaryId];
        assert.found(dictionary, createGameError(ErrorCode.DictionaryNotFound));

        if (prev) {
            return await this.storage.transaction(async session => {
                const room = await this.rooms.findOne({ id: prev.roomId }, { session });
                assert.found(room, createGameError(ErrorCode.RoomNotFound));

                if (room.game.id != prev.gameId)
                    return room.id; // game already created by someone

                const roomModel = new RoomModel(room);
                roomModel.newGame(dictionary.getRandomWords(RoomModel.DEFAULT_BOARD_SIZE));
                const r = await this.rooms.replaceOne({ id: prev.roomId }, roomModel.room, { session });
                assert.success(r.result.ok && r.result.n == 1, 'Db access error: replaceOne');

                return room.id;
            });
        }
        else {
            const room = RoomModel.createRoom(dictionary.getRandomWords(RoomModel.DEFAULT_BOARD_SIZE));
            const r = await this.rooms.insertOne(room);
            assert.success(r.result.ok && r.result.n == 1, 'Db access error: insertOne');

            return room.id;
        }
    }

    async getRoom(roomId: string, playerType: PlayerType): Promise<Room> {
        const room = await this.rooms.findOne<Room>({ id: roomId }, { projection: { _id: 0 } });
        assert.found(room, createGameError(ErrorCode.RoomNotFound));

        let board: Agent[];
        if (playerType == PlayerType.Spymaster) {
            board = room.game.board.map(card => <Agent> {
                name: card.name,
                side: card.side,
                uncovered: card.uncovered
            });
        }
        else {
            board = room.game.board.map(card => <Agent> {
                name: card.name,
                side: card.uncovered ? card.side : Side.UNKNOWN
            });
        }

        room.game.board = board;
        return room;
    }

    async uncoverAgent(roomId: string, agentIndex: number) {
        return await this.storage.transaction(async session => {
            const room = await this.rooms.findOne({ id: roomId }, { session });
            assert.found(room, createGameError(ErrorCode.RoomNotFound));

            const roomModel = new RoomModel(room);
            const agent = roomModel.uncoverAgent(agentIndex);
            assert.value(agent, createGameError(ErrorCode.UncoverNotAllowed));

            await this.rooms.replaceOne({ id: roomId }, roomModel.room, { session });
            return agent;
        });
    }

    async commitCode(roomId: string, message: string): Promise<GameMove> {
        const [hint, count_s] = message.trim().split(/[\s,;]+/);
        const count = Number(count_s);
        assert.value(hint != '', createGameError(ErrorCode.WrongSpymasterHint));
        assert.range(count, [0, (RoomModel.DEFAULT_BOARD_SIZE - 1) / 3 + 1], 'Invalid code word match count');

        return await this.storage.transaction(async session => {
            const room = await this.rooms.findOne({ id: roomId }, { session });
            assert.found(room, createGameError(ErrorCode.RoomNotFound));

            const roomModel = new RoomModel(room);
            const move = roomModel.commitHint(hint, count);
            assert.value(move, createGameError(ErrorCode.GameIsFinished));

            await this.rooms.replaceOne({ id: roomId }, roomModel.room, { session });
            return move;
        });
    }

}
