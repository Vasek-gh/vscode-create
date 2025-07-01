import * as vscode from "vscode";
import { Path } from "@src/tools/Path";

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
     * todo
     */
    readTextFile(path: Path): Promise<string | undefined>;

    /**
     * todo
     */
    createDir(path: Path): Promise<void>;
}