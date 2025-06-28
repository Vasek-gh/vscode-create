import * as vscode from "vscode";
import { ContextFiles } from "@src/shared/ContextFiles";
import { Path } from "@src/shared/Path";
import { FileLevel } from "@src/shared/FileLevel";

export class ContextFilesImpl implements ContextFiles {
    public constructor(
        private readonly items: Path[][]
    ) {
    }

    public getFiles(level: number | FileLevel, pattern?: string): undefined | Path[] {
        const index = this.levelToIndex(level);
        if (!index) {
            return undefined;
        }

        const files = this.items[index];
        if (!pattern) {
            return files;
        }

        const regExp = new RegExp(pattern);
        return files.filter(f => regExp.exec(f.getFileName()) !== undefined);
    }

    private levelToIndex(level: number | FileLevel): number | undefined {
        if (level === FileLevel.Root) {
            return 0;
        }

        const index = level + this.items.length - 2;

        return index >= 0 && index < this.items.length
            ? index
            : undefined;
    }

    public static async create(path: Path, workspaceDir: Path): Promise<ContextFiles> {
        const patterns = this.buildSearchPatterns(path, workspaceDir);

        const files = (await vscode.workspace.findFiles(
            new vscode.RelativePattern(workspaceDir.uri, `{${patterns.join(",")}}`)
        )).map(f => Path.fromFile(f));

        const levelArr: Array<Array<Path>> = new Array<Array<Path>>(patterns.length);
        for (let index = 0; index < levelArr.length; index++) {
            levelArr[index] = [];
        }

        for (const file of files) {
            const relative = file.getDirectory().getRelative(workspaceDir);
            const pathLevel = this.getPathLevel(relative);
            levelArr[pathLevel].push(file);
        }

        return new ContextFilesImpl(levelArr);
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