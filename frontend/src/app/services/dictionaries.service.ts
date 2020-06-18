import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { DictionaryDescription } from '../../../../server/src/api/dictionary_description';
import { DictionariesIndexResponse } from '../../../../server/src/api/http/dictionaries_index_response';

@Injectable({
    providedIn: 'root'
})

export class DictionariesService {
    constructor(private httpClient: HttpClient) {}

    dictionaries: DictionaryDescription[] = [];

    getDictionaries() {
        return this.httpClient
            .get<DictionariesIndexResponse>('/api/dictionaries/index')
            .pipe(
                map(value => value.dictionaries),
                tap(x => this.dictionaries = x));
    }
}
