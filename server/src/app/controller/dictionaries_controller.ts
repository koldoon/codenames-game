import { Application, Router } from 'express';
import { DictionariesIndexResponse } from '../../api/http/dictionaries_index_response';
import { bindClass } from '../../core/bind_class';
import { asyncJson } from '../../core/express/async_json';
import { OnApplicationInit } from '../../core/on_application_init';
import { GamesService } from '../service/games_service';

export class DictionariesController implements OnApplicationInit {
    constructor(
        private app: Application,
        private gamesService: GamesService) {
        bindClass(this);
    }

    init() {
        this.app.use('/api/dictionaries', Router()
            .get('/index', asyncJson(this.getDictionariesIndex))
        );
    }

    private async getDictionariesIndex(): Promise<DictionariesIndexResponse> {
        return { dictionaries: this.gamesService.getDictionaries() };
    }
}
