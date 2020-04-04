import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EntityNotFoundError } from './model/entity_not_found_error';

// @Injectable()
// export class NotFoundInterceptor implements NestInterceptor {
//     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//         // next.handle() is an Observable of the controller's result value
//         return next.handle()
//             .pipe(catchError(error => {
//                 if (error instanceof EntityNotFoundErrorFoundError) {
//                     throw new NotFoundException(error.message);
//                 }
//                 else {
//                     throw error;
//                 }
//             }));
//     }
// }
