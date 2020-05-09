import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DictionaryDescription } from '../../../../server/src/api/dictionary_description';
import { DictionariesService } from './dictionaries.service';

/**
 * Used to pre-fetch dictionaries before navigate to some route
 */
@Injectable()
export class DictionariesResolve implements Resolve<DictionaryDescription[]> {
    constructor(private dictionariesService: DictionariesService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.dictionariesService.getDictionaries();
    }
}
