import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpLoadingStatusService } from './http-loading-status.service';

@Injectable()
export class HttpLoadingStatusInterceptor implements HttpInterceptor {
    constructor(private service: HttpLoadingStatusService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        this.service.setStatus(true);

        return next.handle(request.clone())
            .pipe(finalize(() => this.service.setStatus(false)));
    }
}
