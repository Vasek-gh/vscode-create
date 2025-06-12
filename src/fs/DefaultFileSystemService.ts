import * as vscode from "vscode";
import { Path } from "../utils/Path";
import { FileSystemService } from "./FileSystemService";
import { SearchMode } from "./SearchMode";
import { readFileSync, readFile } from "fs";

// todo check virual fs
export class DefaultFileSystemService implements FileSystemService {
    public async path(uri: vscode.Uri): Promise<Path> {
        const fileStat = await vscode.workspace.fs.stat(uri);

        return new Path(uri, fileStat.type);
    }

    public getRootDirectory(path: Path): Path | undefined {
        // todo getWorkspaceFolder
        const ctxWorkspaceFolders = vscode.workspace.workspaceFolders?.filter(
            wf => path.uri.path.startsWith(wf.uri.path)
        ) ?? [];

        // we are somewhere beyond the observable universe
        if (ctxWorkspaceFolders.length === 0) {
            return undefined;
        }

        // if there are many results, we take the one closest to the current one
        const maxUri = ctxWorkspaceFolders.reduce((a, b) => (a.uri.path.length > b.uri.path.length ? a : b)).uri;

        return new Path(
            maxUri,
            vscode.FileType.Directory
        );
    }

    public async getFiles(path: Path, includeDirectories: boolean): Promise<Path[]> {
        const dir = path.getDirectory();
        const dirItems = await vscode.workspace.fs.readDirectory(dir.uri);

        return dirItems
            .filter(i =>
                i[1] === vscode.FileType.File
                || i[1] === vscode.FileType.SymbolicLink
                || (includeDirectories && i[1] === vscode.FileType.Directory)
            )
            .map(i => new Path(vscode.Uri.joinPath(dir.uri, i[0]), i[1]));
    }

    // todo убрать поиск циклом, можно создавать паттерн с родительскими папками
    public async findFiles(path: Path, pattern: string, mode: SearchMode): Promise<Path[]> {
        const rootDir = this.getRootDirectory(path);
        if (!rootDir) {
            return [];
        }

        var cnt = 0;
        var result: Path[] = [];
        var currentDir = path.getDirectory();

        while (currentDir.length >= rootDir.length) {
            const files = await vscode.workspace.findFiles(
                new vscode.RelativePattern(currentDir.uri, pattern)
            );

            for (const file of files) {
                result.push(await this.path(file));
            }

            // this is in case something goes wrong
            if (cnt++ > 100) {
                break;
            }

            // in simple mode we just search by pattern and exit immediately
            if (mode === SearchMode.Simple) {
                break;
            }

            // when searching for the first match in parents, if we find something we immediately exit
            if (mode === SearchMode.IncludeParentsUntilMatch && result.length > 0) {
                break;
            }

            currentDir = currentDir.getParentDirectory();
        }

        return result;
    }

    public async readTextFile(path: Path): Promise<string> {
        if (!path.isFile()) {
            throw new Error(`Path ${path} is not file`);
        }

        const data = await vscode.workspace.fs.readFile(path.uri);
        const result = Buffer.from(data).toString("utf8");

        return result;
    }

    public async createDir(path: Path): Promise<void> {
        await vscode.workspace.fs.createDirectory(path.uri);
    }
}