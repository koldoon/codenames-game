import { LogLevel } from './log_level';

export interface LogEntry {
    level: LogLevel;
    category: string;
    messages: any[];

    // Any extra data set by middleware
    [key: string]: any;
}
