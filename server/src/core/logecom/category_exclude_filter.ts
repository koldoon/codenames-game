import { ILogecomTranslator, ILogEntry } from './logecom';

/**
 * Simple solution to temporary filter out unwanted log entries
 */
export class CategoryExcludeFilter implements ILogecomTranslator {
    constructor(filter: string | string[]) {
        Array.isArray(filter)
            ? filter.forEach(category => this.filters.add(category))
            : this.filters.add(filter);
    }


    translate(entry: ILogEntry): ILogEntry | undefined {
        return this.filters.has(entry.category) ? undefined : entry;
    }

    isEnabled(): boolean {
        return true;
    }


    private filters = new Set<string>();
}
