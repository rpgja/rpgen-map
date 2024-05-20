export class HashMap<K, V> extends Map<K, V> {
  override get(key: K): V | undefined;
  override get(key: K, initialValue: V): V;
  override get(key: K, initialValue?: V): V | undefined {
    const value = super.get(key) ?? initialValue;

    if (initialValue !== undefined && !this.has(key)) {
      this.set(key, initialValue);
    }

    return value;
  }
}
