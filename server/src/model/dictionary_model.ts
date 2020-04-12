export interface DictionaryModel {
    getWords(): Promise<string[]> | string[];
    getRandomWords(count: number): Promise<string[]> | string[];
}
