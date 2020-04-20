import * as path from 'path';
import { ILogecomTranslator, ILogEntry } from './logecom';

/**
 * Format category as a given class or module file name. Uses base dir
 * to cut and simplify the path.
 */
export class CategoryFormatter implements ILogecomTranslator {
    private excludeSet = new Set<string>();

    constructor(
        private baseDir: string,
        excludes?: string[]) {

        this.excludeSet = new Set<string>(excludes);
    }

    translate(entry: ILogEntry) {
        if (this.excludeSet.has(entry.category))
            return entry;

        const parts = path.relative(this.baseDir, entry.category).split(path.sep).join('/').split('.');
        parts.pop();                       // remove extension
        entry.category = parts.join('.');  // in case of dots somewhere in the middle
        return entry;
    }

    isEnabled(): boolean {
        return true;
    }
}
