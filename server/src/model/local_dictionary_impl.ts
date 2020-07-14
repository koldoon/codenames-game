import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as shuffle from 'shuffle-array';
import { Dictionary } from './dictionary';
import { DictionaryConfig } from './dictionary_config';

export class LocalDictionaryImpl implements Dictionary {
    /**
     * Flag to pay attention to this dict (because of age restriction, explicit words, etc)
     */
    warning = false;

    name = '';
    description = '';
    dictionary: string[] = [];

    constructor(fileName?: string) {
        if (fileName)
            this.loadFromFile(fileName);
    }

    getWords() {
        return this.dictionary;
    }

    getRandomWords(count: number) {
        const markers = shuffle([
            ...Array(count).fill(true),
            ...Array(this.dictionary.length - count).fill(false)
        ]);
        return this.dictionary.filter((value, index) => markers[index] === true);
    }

    private loadFromFile(fileName: string) {
        const doc = yaml.safeLoad(fs.readFileSync(fileName, 'utf8')) as DictionaryConfig;
        // Filter out possible input mistakes (just in case)
        const words = String(doc.words)
            .split(/[\s;,]+/)
            .map(w => w.trim())
            .filter(w => w != '');
        const unique = new Set(words);

        this.dictionary = [...unique];
        this.name = String(doc.name);
        this.description = String(doc.description);
        this.warning = Boolean(doc.warn);
    }
}
