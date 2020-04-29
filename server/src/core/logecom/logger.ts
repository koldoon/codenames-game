import { LogLevel } from './log_level';
import { Logecom } from './logecom';

export class Logger {
    constructor(
        private readonly category: string,
        private readonly logecom: Logecom) {
    }

    private createRecord(level: LogLevel, msgs: any[]) {
        this.logecom.translate({
            category: this.category,
            level: level,
            messages: msgs,
            tags: []
        });
        return this;
    }

    log(...msgs: any[]) {
        return this.createRecord(LogLevel.Log, msgs);
    }

    debug(...msgs: any[]) {
        return this.createRecord(LogLevel.Debug, msgs);
    }

    error(...msgs: any[]) {
        return this.createRecord(LogLevel.Error, msgs);
    }

    fatal(...msgs: any[]) {
        return this.createRecord(LogLevel.Fatal, msgs);
    }

    info(...msgs: any[]) {
        return this.createRecord(LogLevel.Info, msgs);
    }

    warn(...msgs: any[]) {
        return this.createRecord(LogLevel.Warn, msgs);
    }
}
