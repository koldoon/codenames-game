import * as shuffle from 'shuffle-array';
import { Dictionary } from './dictionary';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

export class LocalDictionaryImpl implements Dictionary {
    name = '';
    description = '';
    /**
     * Flag to pay attention to this dict (because of age restriction, explicit words, etc)
     */
    warning = false;

    private dictionary: string[] = [];

    constructor(fileName?: string) {
        if (fileName)
            this.loadFromFile(fileName);
    }

    getWords() {
        return this.dictionary;
    }

    getRandomWords(count: number) {
        shuffle(this.dictionary);
        return this.dictionary.slice(0, count);
    }

    private loadFromFile(fileName: string) {
        const doc = yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
        this.dictionary = String(doc.words).split(/[\s]+/);
        this.name = String(doc.name);
        this.description = String(doc.description);
        this.warning = Boolean(doc.warn);
    }
}
