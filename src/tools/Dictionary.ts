export class Dictionary<TKey, TValue> extends Map<TKey, TValue> {
    public getDefault(key: TKey, defaultValue: TValue): TValue {
        let result = this.get(key);
        if (!result) {
            result = defaultValue;
            this.set(key, defaultValue);
        }

        return result;
    }
}
