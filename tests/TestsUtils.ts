import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";

export class TestsUtils {
    public static assertIfNull<T>(value: T | undefined | null): T {
        if (value === undefined || value === null) {
            assert.fail("value is null");
        }

        return value;
    }

    public static assertIfNotNull<T>(value: T | undefined | null): void {
        if (value !== undefined && value !== null) {
            assert.fail("value is not null");
        }
    }

    public static getProjPath(projDir: string): Path {
        const uri = vscode.workspace.workspaceFolders?.find(wf => wf.name === projDir)?.uri;
        if (!uri) {
            throw new Error(`${projDir} not found`);
        }

        return Path.fromDir(uri);
    }

    public static getWsRootDir(path: Path): Path {
        const wsFolder = vscode.workspace.getWorkspaceFolder(path.uri);
        if (!wsFolder) {
            throw new Error("Root is empty");
        }

        return Path.fromDir(wsFolder.uri);
    }
}