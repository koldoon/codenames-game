import * as bytes from 'bytes';
import { IncomingMessage, ServerResponse } from 'http';
import { Collection, MongoClient } from 'mongodb';
import * as onFinished from 'on-finished';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import { LogEntry } from '../log_entry';
import { LogLevel } from '../log_level';
import { LogTranslator, NextFunction } from '../log_translator';
import { RequestIdResolver } from './http_formatter';

export interface MongodbTransportConfig {
    mongoConnectionString: string;
}

export class MongodbTransport implements LogTranslator {
    constructor(config?: Partial<MongodbTransportConfig>) {
        this.config = { ...this.config, ...config };
        this.client = new MongoClient(this.config.mongoConnectionString, { useUnifiedTopology: true });
        this.client.connect()
            .then(async value => {
                this.collection = this.client.db().collection('logs');
                this.sendLogsPending();
            })
            .catch(reason => {
                console.error('MongodbTransport: Could not connect to mongodb');
                console.error(reason);
            });
    }

    private readonly config: MongodbTransportConfig = {
        mongoConnectionString: 'mongodb://localhost:27017'
    };


    private collection?: Collection<MongodbLogEntry>;
    private logsPending: MongodbLogEntry[] = [];
    private readonly client: MongoClient;
    private readonly levelLabel = new Map<LogLevel, string>([
        [LogLevel.Warn, 'wrn'],
        [LogLevel.Info, 'inf'],
        [LogLevel.Fatal, 'ftl'],
        [LogLevel.Error, 'err'],
        [LogLevel.Debug, 'dbg'],
        [LogLevel.Log, 'log']
    ]);

    private requestId = 1;

    async translate(entry: LogEntry, next: NextFunction) {
        const dbEntry = <MongodbLogEntry> {
            category: entry.category,
            dateTime: new Date(),
            level: entry.level,
            levelName: this.levelLabel.get(entry.level)!,
            pid: process.pid
        };

        if (entry.messages[0] instanceof IncomingMessage && entry.messages[1] instanceof ServerResponse) {
            const [req, res, idResolver] = entry.messages as [IncomingMessage, ServerResponse, RequestIdResolver?];
            const requestId = idResolver ? idResolver(req) : (this.requestId++).toString();
            const startedAt = performance.now();
            const method = (req.method || '').padEnd(4);
            const bytesWritten = req.socket.bytesWritten; // simple socket stats
            const url = req.url || '';
            const ipAddr = String(req.headers['x-forwarded-for'] || '').split(',').pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress;

            onFinished(res, () => {
                const contentLength = bytes(req.socket.bytesWritten - bytesWritten);
                const latency = Math.round((performance.now() - startedAt) * 100) / 100;
                const line = [
                    '[' + requestId + ']',
                    method, url, '→', res.statusCode,
                    '[' + ms(latency) + ']',
                    '[' + ipAddr + ']',
                    '{' + bytes(req.socket.bytesRead) + '/' + contentLength + '}'
                ];

                dbEntry.message = line.join(' ');
                dbEntry.http = {
                    id: requestId,
                    statusCode: res.statusCode,
                    ipAddr,
                    url,
                    method,
                    latency
                };

                this.sendDbEntry(dbEntry);
            });
        }
        else {
            const objects: any[] = [];
            const messages: string[] = [];
            for (const msg of entry.messages) {
                if (msg instanceof Error) {
                    messages.push(msg.stack || msg.message);
                }
                else if (typeof msg === 'object') {
                    objects.push(msg);
                    if (messages.length == 0)
                        messages.push(msg.constructor.name);
                }
                else {
                    messages.push(msg);
                }
            }
            dbEntry.message = messages.join(' ');
            dbEntry.context = objects.length <= 1 ? objects[0] : objects;
            this.sendDbEntry(dbEntry);
        }

        next(entry);
    }

    private sendDbEntry(entry: MongodbLogEntry) {
        if (this.collection) {
            this.collection.insertOne(entry)
                .catch(reason => console.error(reason));
        }
        else {
            this.logsPending.push(entry);
        }
    }

    private sendLogsPending() {
        if (!this.collection)
            return;

        this.collection.insertMany(this.logsPending)
            .catch(reason => console.log(reason));
    }
}

interface MongodbLogEntry {
    pid: number;
    level: LogLevel;
    levelName: string;
    category: string;
    dateTime: Date;
    message: string;
    context: any;
    http?: MongodbLogEntryHttp;
}

interface MongodbLogEntryHttp {
    id: string;
    method: string;
    url: string;
    statusCode: number;
    latency: number;
    ipAddr?: string;
}
