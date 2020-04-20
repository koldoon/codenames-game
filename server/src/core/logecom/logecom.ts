export enum LogLevel {
    Fatal = 'fatal',
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Debug = 'debug'
}

export type LogMessage = string | string[] | any;

export interface ILogEntry {
    level: LogLevel;
    msgs: LogMessage[];
    category: string;
}

type LoggerGeneralizedMethod = (level: LogLevel, ...msgs: LogMessage[]) => ILogger;
type LoggerMethod = (...msgs: LogMessage[]) => ILogger;

export interface ILogger {
    log: LoggerGeneralizedMethod;
    debug: LoggerMethod;
    info: LoggerMethod;
    warn: LoggerMethod;
    error: LoggerMethod;
    fatal: LoggerMethod;
}

export interface ILoggerFactory {
    createLogger(category: string): ILogger;
}

export interface ILogecomTranslator {
    translate(entry: ILogEntry): ILogEntry | undefined;

    /**
     * Simplify dynamic logging targets switching
     */
    isEnabled(): boolean;
}

export interface ILogecom extends ILoggerFactory, ILogecomTranslator {
    use(translator?: ILogecomTranslator): ILogecom;
}


class Logger implements ILogger {
    constructor(
        private readonly category: string,
        private readonly logecom: ILogecomTranslator) {
    }

    log(level: LogLevel, ...msgs: LogMessage[]) {
        this.logecom.translate({
            category: this.category,
            level: level,
            msgs: msgs
        });
        return this;
    }

    debug(...msgs: LogMessage[]) {
        this.log(LogLevel.Debug, ...msgs);
        return this;
    }

    error(...msgs: LogMessage[]) {
        this.log(LogLevel.Error, ...msgs);
        return this;
    }

    fatal(...msgs: LogMessage[]) {
        this.log(LogLevel.Fatal, ...msgs);
        return this;
    }

    info(...msgs: LogMessage[]) {
        this.log(LogLevel.Info, ...msgs);
        return this;
    }

    warn(...msgs: LogMessage[]) {
        this.log(LogLevel.Warn, ...msgs);
        return this;
    }
}


/**
 * ILogecom interface default implementation
 */
export class Logecom implements ILogecom {
    pipe: ILogecomTranslator[] = [];

    use(translator?: ILogecomTranslator): ILogecom {
        if (translator)
            this.pipe.push(translator);
        return this;
    }

    createLogger(category: string): ILogger {
        return new Logger(category, this);
    }

    translate(entry: ILogEntry) {
        let pipedEntry: ILogEntry | undefined = entry;
        for (let t of this.pipe) {
            if (pipedEntry && t.isEnabled())
                pipedEntry = t.translate(pipedEntry);

            if (!pipedEntry)
                break;
        }
        return entry;
    }

    isEnabled(): boolean {
        return true;
    }
}
