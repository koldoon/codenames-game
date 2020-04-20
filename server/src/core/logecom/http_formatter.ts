import { IncomingMessage, ServerResponse } from 'http';
import { ILogecomTranslator, ILogEntry, ILogger } from './logecom';

const onFinished = require('on-finished');

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

/**
 * Translate logged requests and responses into HttpRequestEntry structure to simplify
 * further log formatting
 */
export class HttpFormatter implements ILogecomTranslator {
    /**
     * @param logger Logger instance to create extra log entries for responses
     */
    constructor(private logger: ILogger) {
    }

    isEnabled(): boolean {
        return true;
    }

    translate(entry: ILogEntry): ILogEntry | undefined {
        if (entry.msgs.length == 2 && entry.msgs[0] instanceof IncomingMessage && entry.msgs[1] instanceof ServerResponse) {
            const [req, res] = entry.msgs as [IncomingMessage & { id: string }, ServerResponse & { error?: any }];
            const startedAt = Date.now();
            const ipAddr = String(req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

            const logEntry = <HttpRequestEntry> {
                id: req.id,
                url: req.url,
                method: req.method,
                headers: req.headers,
                userAgent: req.headers['user-agent'],
                remoteIp: ipAddr
            };
            this.logger.info(logEntry);

            onFinished(res, () => {
                logEntry.response = {
                    bytesRead: req.socket.bytesRead,
                    bytesWritten: req.socket.bytesWritten,
                    duration: Date.now() - startedAt,
                    error: res.error,
                    status: res.statusCode
                };
                this.logger.info(logEntry);
            });
            return undefined
        }

        return entry;
    }
}
