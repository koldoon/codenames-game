import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HttpLoadingStatusService {
    constructor() {
        this.state$.pipe(debounceTime(150)).subscribe(value => this.isLoading.next(value));
    }

    isLoading = new BehaviorSubject(0);

    private state$ = new BehaviorSubject(0);
    private state = 0;

    setStatus(value: boolean) {
        value ? this.state++ : this.state--;
        this.state$.next(this.state);
    }
}
