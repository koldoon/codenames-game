import { HttpRequestEntry } from './http_formatter';
import { ILogecomTranslator, ILogEntry, LogLevel } from './logecom';

const colors = require('colors');
const prettyMs = require('pretty-ms');
type StatusSource = () => boolean;

/**
 * Simple console transport ILogecomTransport implementation
 */
export class ConsoleTransport implements ILogecomTranslator {
    constructor(
        private httpCategory: string,
        private enabled: StatusSource = () => true) {

        this.levelColor.set(LogLevel.Warn, colors.yellow);
        this.levelColor.set(LogLevel.Info, colors.green);
        this.levelColor.set(LogLevel.Fatal, colors.red.underline);
        this.levelColor.set(LogLevel.Error, colors.red);
        this.levelColor.set(LogLevel.Debug, colors.blue);
    }

    private readonly categoryLastTime = new Map<string, number>();
    private readonly levelColor = new Map<LogLevel, Function>();

    translate(entry: ILogEntry) {
        const lastTime = this.categoryLastTime.get(entry.category) || Date.now();
        const painter = this.levelColor.get(entry.level);
        const levelStr = painter ? painter(entry.level) : entry.level;
        const categoryStr = colors.gray(entry.category);
        const timeDiff = colors.gray('+' + prettyMs(Date.now() - lastTime));

        if (entry.category == this.httpCategory) {
            const msg = entry.msgs[0] as HttpRequestEntry;
            const logLine = msg.response
                ? `${colors.magenta('<<')} ${msg.method} ${msg.url} -> ${colors.magenta(msg.response.status)} ${prettyMs(msg.response.duration)} ${colors.gray('[' + msg.id + ']')}`
                : `${colors.cyan('>>')} ${msg.method.toUpperCase()} ${msg.url} ${colors.gray('[' + msg.id + ']')}`;

            console.log([levelStr, categoryStr, logLine, timeDiff].join(' '));
            if (msg.response && msg.response.error) {
                console.log(msg.response.error instanceof Error && msg.response.error.stack
                    ? msg.response.error.stack
                    : this.formatObject(msg.response.error));
            }
        }
        else {
            const msgs = entry.msgs.map(m => typeof m === 'object' ? this.formatObject(m) : m);
            console.log([levelStr, categoryStr, ...msgs, timeDiff].join(' '));
        }

        this.categoryLastTime.set(entry.category, Date.now());
        return entry;
    }

    isEnabled(): boolean {
        return this.enabled();
    }

    private formatObject(obj: any): string {
        return JSON.stringify(obj, obj instanceof Error ? Object.getOwnPropertyNames(obj) : null, 4);
    }
}
