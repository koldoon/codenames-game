export interface Dictionary {
    getWords(): Promise<string[]> | string[];
    getRandomWords(count: number): Promise<string[]> | string[];
}
