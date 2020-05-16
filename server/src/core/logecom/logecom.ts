import { LogEntry } from './log_entry';
import { LogTranslator } from './log_translator';
import { Logger } from './logger';

/**
 * Middleware-based Logging system inspired by Express http library.
 *
 * Motivation:
 *
 * There are many logging libraries presented in npm with different
 * approaches and interfaces. If you want to migrate from one logger to
 * another, you must refactor lots of points in your application where
 * particular logger is initialized or used.
 *
 * The idea is to abstract from logging process as much as possible and
 * to define simple common interface with minimal overhead and give a
 * stack to implement any logging pipe with desired functionality in one
 * place.
 *
 * There is the only interface presented for any log processing:
 *
 * <code>
 *     LogTranslator
 * </code>
 *
 * By implementing it in different ways it is possible to achieve any
 * result. You can transform, format, collect, print or send, and even
 * use another logger! - anything you want inside this pipeline.<br>
 * So, by using this interface from the very beginning, you save
 * your time in future if you would need to migrate or change logging
 * library.
 *
 * Implementing LogTranslator by Logecom itself makes it possible to
 * create complex logs translation logic when one logger can be applied
 * upto another if needed ;)
 */
export class Logecom implements LogTranslator {
    // "readonly" is important! see "createLogger" method.
    private static readonly instance = new Logecom();

    /**
     * Create Logger instance for specified category.
     * Common pattern is to use class name as a category specifier:
     * <code>
     *     private readonly logger = Logecom.createLogger(this.constructor.name);
     * </code>
     *
     * @param {string} category
     * @returns {Logger}
     */
    static createLogger(category: string): Logger {
        return new Logger(category, this.instance);
    }

    /**
     * Configure default Logecom instance.
     * For the global logging system it's ok to use Singleton pattern ;)
     *
     * To prevent possible duplicates during re-configuration by mistake,
     * this method always configure Logecom "from scratch", removing all
     * existing middleware.
     *
     * @type {Logecom}
     */
    static configure() {
        this.instance.pipe = [];
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
            if (entry == null || i >= this.pipe.length)
                return;

            this.pipe[i].translate(entry, this.getNextFunction(i + 1));
        }
    }
}
