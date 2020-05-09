import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NewGameResponse } from '../../../../server/src/api/http/new_game_response';
import { cleanHttpParams } from '../utils/clean-http-params';

@Injectable()
export class GamesService {
    constructor(private httpClient: HttpClient) {
    }

    createNewGame(dictionaryIndex: number, previousGameId?: string) {
        return this.httpClient
            .get<NewGameResponse>(`/api/games/create`, {
                params: cleanHttpParams({
                    from: previousGameId,
                    dict: dictionaryIndex.toString()
                })
            });
    }
}


