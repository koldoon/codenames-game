export interface Dictionary {
    name: string;
    description: string

    getWords(): string[];
    getRandomWords(count: number): string[];
}
