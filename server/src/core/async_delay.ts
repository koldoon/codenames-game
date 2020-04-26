/**
 * Simple promise-based async delay
 */
export function asyncDelay<T>(delayMs: number, data?: T): Promise<T> {
    return new Promise<T>(resolve => setTimeout(() => resolve(data), delayMs));
}
