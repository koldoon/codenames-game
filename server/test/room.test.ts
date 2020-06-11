import * as bent from 'bent';
import { RoomIdResponse } from '../src/api/http/room_id_response';
import { RoomResponse } from '../src/api/http/room_response';
import { PlayerType } from '../src/api/player_type';
import { Room } from '../src/model/storage/room';

const serverUrl = process.env.TEST_URL || 'http://localhost:3000';
const getJson = bent('json', serverUrl);
// const postJson = bent('POST', 'json', serverUrl);

let roomId: string;
let room: Room;

test('Stat ' + serverUrl, async () => {
    console.info(await getJson('/api/stat/info'));
});

test('New game', async () => {
    const r = <RoomIdResponse> await getJson(`/api/rooms/create?dictId=0`);
    roomId = r.roomId;
    console.info(r);
    expect(roomId).toBeDefined();
    expect(typeof roomId).toBe('string');
});

async function updateCaptainsBoard() {
    const r = <RoomResponse> await getJson(`/api/rooms/${roomId}?player=${PlayerType.Spymaster}`);
    room = r.room;
}

test('Get captains board', async () => {
    await updateCaptainsBoard();
    console.info(room);
    expect(room).toBeDefined();
});
