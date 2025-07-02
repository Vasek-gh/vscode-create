import * as vscode from "vscode";
import { Path } from "./Path";

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

    public static getRootDirectory(path: Path): Path | undefined {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(path.uri);

        return workspaceFolder === undefined
            ? undefined
            : Path.fromDir(workspaceFolder.uri);
    }

    public static getFileVars(file: Path, baseDir: Path): any {
        const dir = file.getDirectory();

        return {
            fullName: file.getFileName(false),
            baseName: file.getFileName(true),
            fullDir: dir.getRelative(baseDir),
            baseDir: dir.getRelative(dir.getParentDirectory())
        };
    }

    public static formatLitteral(value: string): string {
        if (value === "") {
            return value;
        }

        const rows = value.split("\n");
        if (rows.length === 0) {
            return value;
        }

        const startIndex = rows[0].trim() === "" ? 1 : 0;
        const endIndex = rows.length - (rows[rows.length - 1].trim() === "" ? 2 : 1);
        const whiteSpaceCount = rows[startIndex].length - rows[startIndex].trimStart().length;

        return rows.slice(startIndex, endIndex + 1).map(r => r.substring(whiteSpaceCount).trimEnd())
            .join("\n");
    }

    /* todo kill
    public static groupBy<T, TKey>(items: T[], predicate: (item: T) => TKey): Map<TKey, T[]> {
        return items.reduce<Map<TKey, T[]>>((map, item, index, array): Map<TKey, T[]> => {
            const key = predicate(item);
            map.set(key, map.get(key) || []);
            map.get(key)?.push(item);
            return map;
        }, new Map<TKey, T[]>());
    }
    */
}