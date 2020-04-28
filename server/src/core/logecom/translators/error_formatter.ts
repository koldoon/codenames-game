import * as colors from 'colors';
import { serializeError } from 'serialize-error';
import { LogEntry } from '../log_entry';
import { LogTranslator, NextFunction } from '../log_translator';


export interface ErrorFormatterConfig {
    colorize: boolean;
}

export class ErrorFormatter implements LogTranslator {
    constructor(config?: Partial<ErrorFormatterConfig>) {
        this.config = { ...this.config, ...config };
    }

    private readonly config: ErrorFormatterConfig = {
        colorize: true
    };

    translate(entry: LogEntry, next: NextFunction): void {
        for (let i = 0; i < entry.messages.length; i++) {
            const msg = entry.messages[i];
            if (msg instanceof Error) {
                if (msg.stack) {
                    entry.messages[i] = this.config.colorize
                        ? colors.red(msg.stack) + '\n'
                        : msg.stack + '\n';
                }
                else {
                    entry.messages[i] = serializeError(msg);
                }
            }
        }
        next(entry);
    }

    isEnabled(): boolean {
        return true;
    }
}
