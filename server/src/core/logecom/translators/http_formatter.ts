import { LogEntry } from '../log_entry';
import { LogTranslator, NextFunction } from '../log_translator';

// const onFinished = require('on-finished');

export interface HttpRequestEntry {
    method: string,
    url: string,
    headers: object,
    id: string,
    userAgent: string,
    remoteIp: string,
    response?: {
        status: number,
        error: any,
        duration: number,
        bytesRead: number,
        bytesWritten: number,
    }
}

export class HttpFormatter implements LogTranslator {
    translate(entry: LogEntry, next: NextFunction): void {
    }


    //
    // translate(entry: LogEntry): LogEntry | undefined {
    //     if (entry.messages.length == 2 && entry.messages[0] instanceof IncomingMessage && entry.messages[1] instanceof ServerResponse) {
    //         const [req, res] = entry.messages as [IncomingMessage & { id: string }, ServerResponse & { error?: any }];
    //         const startedAt = Date.now();
    //         const ipAddr = String(req.headers['x-forwarded-for'] || '').split(',').pop() ||
    //             req.connection.remoteAddress ||
    //             req.socket.remoteAddress;
    //
    //         const logEntry = <HttpRequestEntry> {
    //             id: req.id,
    //             url: req.url,
    //             method: req.method,
    //             headers: req.headers,
    //             userAgent: req.headers['user-agent'],
    //             remoteIp: ipAddr
    //         };
    //         // this.logger.info(logEntry);
    //
    //         onFinished(res, () => {
    //             logEntry.response = {
    //                 bytesRead: req.socket.bytesRead,
    //                 bytesWritten: req.socket.bytesWritten,
    //                 duration: Date.now() - startedAt,
    //                 error: res.error,
    //                 status: res.statusCode
    //             };
    //             // this.logger.info(logEntry);
    //         });
    //         return undefined
    //     }
    //
    //     return entry;
    // }

    isEnabled(): boolean {
        return true;
    }

}
