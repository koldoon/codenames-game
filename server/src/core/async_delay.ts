export function asyncDelay<T>(delayMs: number, pipeData?: T): Promise<T> {
    return new Promise<T>(resolve => setTimeout(() => resolve(pipeData), delayMs));
}
