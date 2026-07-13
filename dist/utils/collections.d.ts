export declare class LargeMap<K, V> implements Map<K, V> {
    #private;
    constructor(maxSize?: number);
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: this) => void, thisArg?: unknown): void;
    has(key: K): boolean;
    set(key: K, value: V): this;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    clear(): void;
    get size(): number;
    get(key: K): V | undefined;
    get [Symbol.toStringTag](): string;
}
//# sourceMappingURL=collections.d.ts.map