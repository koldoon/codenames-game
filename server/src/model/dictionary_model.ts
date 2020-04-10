export interface DictionaryModel {
    getWords(): Promise<string[]> | string[];
}
