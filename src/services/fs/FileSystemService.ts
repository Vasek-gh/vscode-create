import * as vscode from "vscode";
import { Path } from "@src/shared/Path";

export interface FileSystemService {
    /**
     * Create Path object from vscode.Uri
     */
    getPath(uri: vscode.Uri): Promise<Path>;

    /**
     * Return path status
     */
    getStat(path: Path): Promise<vscode.FileStat | undefined>;

    /**
     * Return workspace root directory for given path
     */
    getRootDirectory(path: Path): Path | undefined;

    /**
     * todo
     */
    readTextFile(path: Path): Promise<string | undefined>;

    /**
     * todo
     */
    createDir(path: Path): Promise<void>;
}