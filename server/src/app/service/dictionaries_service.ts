import * as fs from 'fs';
import * as path from 'path';
import { DictionaryDescription } from '../../api/dictionary_description';
import { Logecom } from '../../core/logecom/logecom';
import { OnApplicationInit } from '../../core/on_application_init';
import { Dictionary } from '../../model/dictionary';
import { LocalDictionaryImpl } from '../../model/local_dictionary_impl';
import { appRoot } from '../../root';

export class DictionariesService implements OnApplicationInit {
    private readonly logger = Logecom.createLogger(this.constructor.name);
    private readonly dataDir = path.join(appRoot, '../data');

    readonly dictionaries: Dictionary[] = [];

    init() {
        this.loadDictionaries();
    }

    getDictionaries() {
        return this.dictionaries.map(dic => <DictionaryDescription> {
            name: dic.name,
            description: dic.description,
            warning: dic.warning,
            words_example: dic.getRandomWords(5)
        });
    }

    private loadDictionaries() {
        const files = fs.readdirSync(this.dataDir).filter(value => value.split('.').pop() == 'yaml').sort();
        this.logger.info(`Loading dictionaries from ${this.dataDir}`);

        if (files.length == 0)
            this.logger.error(`No dictionaries found in ${this.dataDir}`);

        for (const fileName of files) {
            const dict = new LocalDictionaryImpl(path.join(this.dataDir, fileName));
            this.dictionaries.push(dict);
            this.logger.info(`Dictionary ${fileName}: ${dict.name} (${dict.dictionary.length})`);
        }
    }
}
