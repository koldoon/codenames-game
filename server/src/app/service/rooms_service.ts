import { Collection } from 'mongodb';
import { ErrorCode } from '../../api/api_error';
import { assert } from '../../core/assert';
import { createGameError } from '../../core/create_game_error';
import { OnApplicationInit } from '../../core/on_application_init';
import { RoomModel } from '../../model/room_model';
import { Room } from '../../model/storage/room';
import { DictionariesService } from './dictionaries_service';
import { StorageService } from './storage_service';

export class RoomsService implements OnApplicationInit {
    constructor(
        private storage: StorageService,
        private dictionariesService: DictionariesService) {
    }

    private rooms: Collection<Room>;

    init() {
        this.rooms = this.storage.db.collection('rooms');
    }

    async createNewGame(dictionaryId: number, env?: { roomId: string, gameId: string }) {
        const dictionary = this.dictionariesService.dictionaries[dictionaryId];
        assert.found(dictionary, createGameError(ErrorCode.DictionaryNotFound));

        let roomModel: RoomModel;
        if (env) {
            await this.storage.transaction(async session => {

                const room = await this.rooms.findOne({ id: env.roomId }, { session });
                assert.found(room, createGameError(ErrorCode.RoomNotFound));
                roomModel = Object.assign(new RoomModel(), room);

                if (room.game.id != env.gameId)
                    return; // game already created by someone

                roomModel.newGame(dictionary.getRandomWords(RoomModel.DEFAULT_BOARD_SIZE));
                await this.rooms.replaceOne({ id: env.roomId }, roomModel, { session });

            });
        }
        else {
            roomModel = new RoomModel();
            roomModel.newGame(dictionary.getRandomWords(RoomModel.DEFAULT_BOARD_SIZE));
            await this.rooms.insertOne(roomModel);
        }

        return roomModel as Room;
    }

    async getRoom(roomId: string) {
        return this.rooms.findOne<Room>({ id: roomId });
    }


}
