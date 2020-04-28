import { LogEntry } from './log_entry';

export interface NextFunction {
    (entry?: LogEntry): void
}

export interface LogTranslator {
    isEnabled(): boolean;
    translate(entry: LogEntry, next: NextFunction): void;
}
