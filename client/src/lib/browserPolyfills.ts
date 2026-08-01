declare global {
  interface Map<K, V> {
    getOrInsert(key: K, defaultValue: V): V;
    getOrInsertComputed(key: K, callback: (key: K) => V): V;
  }
}

if (typeof Map.prototype.getOrInsert !== "function") {
  Map.prototype.getOrInsert = function <K, V>(this: Map<K, V>, key: K, defaultValue: V): V {
    if (this.has(key)) return this.get(key) as V;
    this.set(key, defaultValue);
    return defaultValue;
  };
}

if (typeof Map.prototype.getOrInsertComputed !== "function") {
  Map.prototype.getOrInsertComputed = function <K, V>(
    this: Map<K, V>,
    key: K,
    callback: (key: K) => V,
  ): V {
    if (this.has(key)) return this.get(key) as V;
    const value = callback(key);
    this.set(key, value);
    return value;
  };
}

export {};