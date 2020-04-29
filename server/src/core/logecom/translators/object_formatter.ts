import { LogEntry } from '../log_entry';
import { LogTranslator, NextFunction } from '../log_translator';
import * as colors from 'colors';

export interface ObjectFormatterConfig {
    pad: number;
    colorize: boolean;
}

export class ObjectFormatter implements LogTranslator {
    constructor(config?: Partial<ObjectFormatterConfig>) {
        this.config = { ...this.config, ...config };
    }

    private readonly config: ObjectFormatterConfig = {
        pad: 5,
        colorize: true
    };

    translate(entry: LogEntry, next: NextFunction): void {
        for (let i = 0; i < entry.messages.length; i++) {
            const msg = entry.messages[i];
            if (typeof msg !== 'object')
                continue;

            let jsonString = msg.constructor.name + ' ' + JSON.stringify(msg, null, 2);

            if (this.config.colorize) {
                let lines = jsonString.split('\n');
                lines = lines.map((line, index) => {
                    if (index == 0 || index == lines.length - 1) {
                        line = colors.green(line);
                    }
                    else {
                        line = line
                            .replace(/(\d)/g, colors.yellow('$1'))
                            .replace(/(error|exception)/g, colors.red('$1'))
                            .replace(/(message|warning)/g, colors.green('$1'))
                            .replace(/(true|false)/g, colors.magenta('$1'))
                    }
                    return line;
                });
                jsonString = lines.join('\n'.padEnd(this.config.pad));
            }
            else if (this.config.pad) {
                jsonString = jsonString.split('\n').join('\n'.padEnd(this.config.pad));
            }

            entry.messages[i] = '\n'.padEnd(this.config.pad) + jsonString + '\n';
        }

        next(entry);
    }

    isEnabled(): boolean {
        return true;
    }
}
