import * as vscode from "vscode";
import { SearchMode } from "./SearchMode";
import { Path } from "@src/utils/Path";

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
    findFiles(path: Path, pattern: string, mode: SearchMode): Promise<Path[]>;

    /**
     * todo
     */
    readTextFile(path: Path): Promise<string | undefined>;

    /**
     * todo
     */
    createDir(path: Path): Promise<void>;
}