import * as axios from 'axios';
import { RoomIdResponse } from '../src/api/http/room_id_response';
import { RoomResponse } from '../src/api/http/room_response';
import { PlayerType } from '../src/api/player_type';
import { Room } from '../src/model/storage/room';

const serverUrl = process.env.TEST_URL || 'http://localhost:3000';
const request = axios.default.create({
    baseURL: serverUrl
});

let roomId: string;
let room: Room;

test('Stat ' + serverUrl, async () => {
    const res = await request('/api/stat/info');
    console.info(res.data);
});

test('New game', async () => {
    const res = await request(`/api/rooms/create?dictId=0`);
    roomId = (res.data as RoomIdResponse).roomId;
    expect(roomId).toBeDefined();
    expect(typeof roomId).toBe('string');
});

async function updateCaptainsBoard() {
    const res = await request(`/api/rooms/${roomId}?player=${PlayerType.Spymaster}`);
    room = (res.data as RoomResponse).room;
}

test('Get captains board', async () => {
    await updateCaptainsBoard();
    console.info(room);
    expect(room).toBeDefined();
});
