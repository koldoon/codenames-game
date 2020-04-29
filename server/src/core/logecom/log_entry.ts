import { LogLevel } from './log_level';

export interface LogEntry {
    level: LogLevel;
    category: string;

    /**
     * Any data to be logged. Mostly strings, but
     * objects also possible. Formatting depends on middleware used.
     */
    messages: any[];

    /**
     * Extra labels associated with entry.
     * For example, Request Id might help to find chained logs if they
     * happened asynchronously.
     */
    tags: string[];

    /**
     * Any pipe context if needed
     */
    data?: object;
}
