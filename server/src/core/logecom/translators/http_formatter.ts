import * as bytes from 'bytes';
import * as colors from 'colors';
import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import * as onFinished from 'on-finished';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import { LogEntry } from '../log_entry';
import { LogTranslator, NextFunction } from '../log_translator';
import { Logecom } from '../logecom';
import { StringMapper } from './string_mapper';

export function expressLogMiddleware() {
    const logger = Logecom.createLogger('Express');
    return (req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
        logger.log(req, res);
        next();
    }
}

export interface HttpFormatterConfig {
    colorize: boolean;
    responsesOnly: boolean;
    padRequestId: number;
}

/**
 * Very simple HTTP requests formatter implementation.
 * Useful to print some nice stats in the development console.
 */
export class HttpFormatter implements LogTranslator {
    constructor(config?: Partial<HttpFormatterConfig>) {
        this.config = { ...this.config, ...config };

        if (!this.config.colorize) {
            this.gp = this.reqp = this.resp = src => src;
        }
    }

    private readonly config: HttpFormatterConfig = {
        colorize: true,
        responsesOnly: true,
        padRequestId: 4
    };

    private readonly gp: StringMapper = colors.gray;      // "gray" painter
    private readonly reqp: StringMapper = colors.cyan;    // "request" painter
    private readonly resp: StringMapper = colors.yellow;  // "response" painter

    // Simple idempotency key.
    // For extensive request chain tracing smth like async request context must be used.
    // See Node.js async_hooks, etc.
    private requestId = 1;

    translate(entry: LogEntry, next: NextFunction): void {
        if (entry.messages.length == 2 && entry.messages[0] instanceof IncomingMessage && entry.messages[1] instanceof ServerResponse) {
            const [req, res] = entry.messages as [IncomingMessage, ServerResponse];
            const requestId = (this.requestId++).toString();
            const startedAt = performance.now();
            const method = (req.method || '').padEnd(4);
            const url = req.url;
            const bytesWritten = req.socket.bytesWritten; // simple socket stats
            const ipAddr = String(req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

            if (!this.config.responsesOnly) {
                const line = [
                    this.gp('[') + this.reqp('→') + this.gp(']'),
                    this.gp('[' + requestId.padEnd(this.config.padRequestId) + ']'),
                    method, url,
                    this.gp('[' + ipAddr + ']')
                ].join(' ');

                entry.messages = [line];
            }
            entry.tags.push(String(req.headers['user-agent']));

            onFinished(res, () => {
                const contentLength = bytes(req.socket.bytesWritten - bytesWritten);
                const directionTag = !this.config.responsesOnly ? [this.gp('[') + this.resp('←') + this.gp(']')] : [];
                const ipAddrTag = this.config.responsesOnly ? [this.gp('[' + ipAddr + ']')] : [];

                const line = [
                    ...directionTag,
                    this.gp('[' + requestId.padStart(this.config.padRequestId) + ']'),
                    method, url, this.resp('→ ' + res.statusCode.toString()),
                    this.gp('[' + ms(performance.now() - startedAt) + ']'),
                    ...ipAddrTag,
                    this.gp('{' + bytes(req.socket.bytesRead) + '/' + contentLength + '}')
                ];

                if (this.config.responsesOnly) {
                    entry.messages = [line.join(' ')];
                    next(entry);
                }
                else {
                    next({ ...entry, messages: [line.join(' ')] });
                }
            });

            if (!this.config.responsesOnly)
                next(entry);
        }
        else {
            next(entry);
        }
    }

    isEnabled(): boolean {
        return true;
    }

}
