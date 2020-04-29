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

export function expressLoggerMiddleware() {
    const logger = Logecom.createLogger('Express');
    return (req: IncomingMessage, res: ServerResponse, next: express.NextFunction) => {
        logger.log(req, res);
        next();
    }
}

export interface HttpFormatterConfig {
    colorize: boolean;
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
        colorize: true
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
            const requestId = this.requestId++;
            const startedAt = performance.now();
            const url = req.url;
            const bytesWritten = req.socket.bytesWritten; // simple socket stats
            const ipAddr = String(req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

            const line = [
                this.gp('[') + this.reqp('→') + this.gp(']'),
                this.gp(('[' + requestId + ']').padEnd(6)),
                req.method, url,
                this.gp('[' + ipAddr + ']')
            ].join(' ');

            entry.messages = [line];
            entry.tags.push(String(req.headers['user-agent']));

            onFinished(res, () => {
                const contentLength = bytes(req.socket.bytesWritten - bytesWritten);
                const line = [
                    this.gp('[') + this.resp('←') + this.gp(']'),
                    this.gp(('[' + requestId + ']').padEnd(6)),
                    req.method, url,
                    this.gp('{' + bytes(req.socket.bytesRead) + '/' + contentLength + '}'),
                    this.gp('[' + ms(performance.now() - startedAt) + ']'),
                    this.gp('[') + this.resp(res.statusCode.toString()) + this.gp(']')
                ].join(' ');

                next({ ...entry, messages: [line] });
            });
        }

        next(entry);
    }

    isEnabled(): boolean {
        return true;
    }

}
