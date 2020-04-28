import * as colors from 'colors';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import * as dateFormat from 'dateformat';
import { LogEntry } from '../log_entry';
import { LogLevel } from '../log_level';
import { LogTranslator, NextFunction } from '../log_translator';

type StringMapper = (value: string) => string;

export interface ConsoleTransportConfig {
    colorize: boolean;
    categoryPad: number;
}

export class ConsoleTransport implements LogTranslator {
    constructor(config?: Partial<ConsoleTransportConfig>) {
        this.config = { ...this.config, ...config };
        this.dimmedPainter = this.config.colorize ? colors.gray : this.dummyPainter;
    }

    private readonly config: ConsoleTransportConfig = {
        colorize: true,
        categoryPad: 0
    };
    private readonly categoryLastTime = new Map<string, number>();
    private readonly levelColor = new Map<LogLevel, Function>([
        [LogLevel.Warn, colors.yellow],
        [LogLevel.Info, colors.green],
        [LogLevel.Fatal, colors.red.underline],
        [LogLevel.Error, colors.red],
        [LogLevel.Debug, colors.dim.cyan],
        [LogLevel.Log, colors.dim.white]
    ]);
    private readonly dummyPainter: StringMapper = (value: string) => value;
    private readonly dimmedPainter: StringMapper;

    translate(entry: LogEntry, next: NextFunction) {
        const logLevelPainter = this.config.colorize
            ? this.levelColor.get(entry.level) || this.dummyPainter
            : this.dummyPainter;

        // Prepare log line values
        const pid = '[' + process.pid + ']';
        const logLevel = '[' + logLevelPainter(LogLevel[entry.level].substr(0, 3).toUpperCase()) + ']';
        const lastTime = this.categoryLastTime.get(entry.category) || performance.now();
        const categoryTimeDiff = ms(performance.now() - lastTime);
        const category = this.dimmedPainter([entry.category, ' +', categoryTimeDiff].join('').padEnd(this.config.categoryPad));
        const dateTime = dateFormat(new Date(), 'dd-mmm-yyyy HH:MM:ss.l');

        process.stdout.write([pid, dateTime, logLevel, category, ...entry.messages, '\n'].join(' '));
        this.categoryLastTime.set(entry.category, performance.now());

        next(entry);
    }

    isEnabled(): boolean {
        return true;
    }
}
