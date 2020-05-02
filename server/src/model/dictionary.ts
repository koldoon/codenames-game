export interface Dictionary {
    name: string;
    description: string
    warning: boolean;

    getWords(): string[];
    getRandomWords(count: number): string[];
}
