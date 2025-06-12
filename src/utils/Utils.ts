import * as vscode from "vscode";

export class Utils {
    public static templateSelector = ":";

    public static getTypeName<T>(obj: T): string {
        if (typeof obj === "object" && obj !== null) {
            return !obj.constructor.name.startsWith("_")
                ? obj.constructor.name
                : obj.constructor.name.substring(1);
        }

        return typeof obj;
    }

    public static groupBy<T, TKey>(items: T[], predicate: (item: T) => TKey): Map<TKey, T[]> {
        return items.reduce<Map<TKey, T[]>>((map, item, index, array): Map<TKey, T[]> => {
            const key = predicate(item);
            map.set(key, map.get(key) || []);
            map.get(key)?.push(item);
            return map;
        }, new Map<TKey, T[]>());
    }
}