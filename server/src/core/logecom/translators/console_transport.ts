import * as colors from 'colors';
import { performance } from 'perf_hooks';
import * as ms from 'pretty-ms';
import * as dateFormat from 'dateformat';
import { LogEntry } from '../log_entry';
import { LogLevel } from '../log_level';
import { LogTranslator, NextFunction } from '../log_translator';
import { StringMapper } from './string_mapper';

export interface ConsoleTransportConfig {
    colorize: boolean;
    categoryDiffTime: boolean;
    padMessages: boolean;
    initialPadValue: number;
}

export class ConsoleTransport implements LogTranslator {
    constructor(config?: Partial<ConsoleTransportConfig>) {
        this.config = { ...this.config, ...config };
        this.gp = this.config.colorize ? colors.gray : this.dummyPainter;
        this.categoryMaxLength = this.config.initialPadValue || 0;
    }

    private readonly config: ConsoleTransportConfig = {
        colorize: true,
        categoryDiffTime: false,
        padMessages: true,
        initialPadValue: 12
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
    private readonly levelLabel = new Map<LogLevel, string>([
        [LogLevel.Warn, 'WRN'],
        [LogLevel.Info, 'INF'],
        [LogLevel.Fatal, 'FAT'],
        [LogLevel.Error, 'ERR'],
        [LogLevel.Debug, 'DEB'],
        [LogLevel.Log, 'LOG']
    ]);


    private readonly dummyPainter: StringMapper = str => str;
    private readonly gp: StringMapper;
    private categoryMaxLength = 0;

    translate(entry: LogEntry, next: NextFunction) {
        const logLevelPainter = this.config.colorize
            ? this.levelColor.get(entry.level) || this.dummyPainter
            : this.dummyPainter;

        // Prepare log line values
        const pid = '[' + process.pid + ']';
        const now = new Date();
        const dateTime = dateFormat(now, 'yyyy/mm/dd HH:MM:ss') + this.gp(dateFormat(now, '.l'));
        const logLevel = this.gp('[') + logLevelPainter(this.levelLabel.get(entry.level)) + this.gp(']');

        let category = entry.category;
        if (this.config.categoryDiffTime) {
            const lastTime = this.categoryLastTime.get(entry.category) || performance.now();
            category += ' +' + ms(performance.now() - lastTime);
        }
        if (this.config.padMessages) {
            this.categoryMaxLength = Math.max(this.categoryMaxLength, category.length);
            category = (category).padEnd(this.categoryMaxLength);
        }
        category = this.gp(category);

        process.stdout.write([pid, dateTime, logLevel, category, ...entry.messages, '\n'].join(' '));

        if (this.config.categoryDiffTime)
            this.categoryLastTime.set(entry.category, performance.now());

        next(entry);
    }

    isEnabled(): boolean {
        return true;
    }
}
