import { LogEntry } from './log_entry';
import { LogTranslator } from './log_translator';
import { Logger } from './logger';

export class Logecom {
    private static instance = new Logecom();

    static createLogger(category: string): Logger {
        return new Logger(category, this.instance);
    }

    static getInstance() {
        return this.instance;
    }

    private pipe: LogTranslator[] = [];

    use(translator: LogTranslator) {
        this.pipe.push(translator);
        return this;
    }

    translate(entry: LogEntry) {
        if (!this.pipe.length)
            return;

        this.getNextFunction(0)(entry);
    }

    private getNextFunction(i: number) {
        return (entry?: LogEntry) => {
            if (entry == null)
                return;

            while (i < this.pipe.length && !this.pipe[i].isEnabled())
                i++;

            if (i < this.pipe.length && this.pipe[i].isEnabled())
                this.pipe[i].translate(entry, this.getNextFunction(i + 1));
        }
    }
}
