export class LargeMap<K, V> implements Map<K, V> {
  readonly #maxSize: number;

  constructor(maxSize: number = 2 << 23) {
    this.#maxSize = maxSize;
  }

  delete(key: K): boolean {
    const map = this.#findMapByKey(key);

    return map?.delete(key) ?? false;
  }

  forEach(
    callbackfn: (value: V, key: K, map: this) => void,
    thisArg?: unknown,
  ): void {
    for (const [key, value] of this) {
      callbackfn.call(thisArg, value, key, this);
    }
  }

  has(key: K): boolean {
    for (const map of this.#maps) {
      if (map.has(key)) {
        return true;
      }
    }

    return false;
  }

  set(key: K, value: V): this {
    const map = this.#findMapByKey(key) ?? this.#findMap();

    map.set(key, value);

    return this;
  }

  *entries(): IterableIterator<[K, V]> {
    for (const map of this.#maps) {
      yield* map;
    }
  }

  *keys(): IterableIterator<K> {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  *values(): IterableIterator<V> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  #maps: Map<K, V>[] = [];

  clear(): void {
    this.#maps = [];
  }

  get size(): number {
    let size = 0;

    for (const map of this.#maps) {
      size += map.size;
    }

    return size;
  }

  #findMapByKey(key: K): Map<K, V> | undefined {
    for (const map of this.#maps) {
      if (map.has(key)) {
        return map;
      }
    }
  }

  #findMap(): Map<K, V> {
    const maps = this.#maps;
    const maxSize = this.#maxSize;
    let mapIndex = 0;
    let map = maps[mapIndex];

    while (!map || map.size >= maxSize) {
      if (mapIndex < maps.length) {
        map = maps[mapIndex++];
      } else {
        map = new Map();
        maps.push(map);
      }
    }

    return map;
  }

  get(key: K): V | undefined {
    for (const map of this.#maps) {
      const value = map.get(key);

      if (value && map.has(key)) {
        return value;
      }
    }
  }

  get [Symbol.toStringTag](): string {
    return this.#findMap()[Symbol.toStringTag];
  }
}
