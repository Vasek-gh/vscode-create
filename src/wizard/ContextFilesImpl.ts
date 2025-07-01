import * as vscode from "vscode";
import { ContextFiles } from "@src/context/ContextFiles";
import { Path } from "@src/tools/Path";
import { FileLevel } from "@src/context/FileLevel";

export class ContextFilesImpl implements ContextFiles {
    private constructor(
        private readonly items: Path[][],
        private readonly currentLevelIndex: number
    ) {
        const minIndex = items.length > 0 ? 0 : -1;
        if (currentLevelIndex < minIndex && currentLevelIndex >= items.length) {
            throw new Error("Current level is outside of bounds");
        }
    }

    public getFiles(level: number | FileLevel): undefined | Path[] {
        const index = this.levelToIndex(level);

        return index === undefined
            ? undefined
            : this.items[index];
    }

    public getByRegExp(level: number | FileLevel, pattern: string): undefined | Path[] {
        const files = this.getFiles(level);
        if (!files || pattern.length === 0) {
            return files;
        }

        const regExp = new RegExp(pattern);
        return files.filter(f => regExp.test(f.getFileName()));
    }

    private levelToIndex(level: number | FileLevel): number | undefined {
        if (this.currentLevelIndex < 0) {
            return undefined;
        }

        if (level === FileLevel.Root) {
            return 0;
        }

        const index = this.currentLevelIndex + level;

        return index >= 0 && index < this.items.length
            ? index
            : undefined;
    }

    public static async createFromPath(workspaceDir: Path, path: Path): Promise<ContextFiles> {
        const patterns = this.buildSearchPatterns(path, workspaceDir);

        const files = (await vscode.workspace.findFiles(
            new vscode.RelativePattern(workspaceDir.uri, `{${patterns.join(",")}}`)
        )).map(f => Path.fromFile(f));

        return this.createFromFiles(workspaceDir, files, patterns.length, patterns.length - 2);
    }

    private static createFromFiles(workspaceDir: Path, files: Path[], levelCount: number, currentLevel: number): ContextFiles {
        const levelMap = new Map<number, Path[]>();

        for (const file of files) {
            const relative = file.getDirectory().getRelative(workspaceDir);
            const pathLevel = this.getPathLevel(relative);

            let level = levelMap.get(pathLevel);
            if (!level) {
                level = [];
                levelMap.set(pathLevel, level);
            }

            level.push(file);
        }

        const levelArray: Path[][] = [];
        for (let index = 0; index < levelCount; index++) {
            levelArray.push(levelMap.get(index) ?? []);
        }

        return new ContextFilesImpl(
            levelArray,
            currentLevel
        );
    }

    private static buildSearchPatterns(path: Path, workspaceDir: Path): string[] {
        let levels = 2;
        let currentDir = path.getDirectory();
        const patterns = ["*", `${currentDir.getRelative(workspaceDir)}/*/*`];
        while (!workspaceDir?.isSame(currentDir)) {
            patterns.push(`${currentDir.getRelative(workspaceDir)}/*`);
            currentDir = currentDir.getParentDirectory();
            levels++;
        }

        return patterns;
    }

    private static getPathLevel(path: string): number {
        if (path === "") {
            return 0;
        }

        let result = 0;
        for (const char of path) {
            if (char === "/") {
                result++;
            }
        }

        return result + 1;
    }
}