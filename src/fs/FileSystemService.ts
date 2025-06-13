import * as vscode from "vscode";
import { SearchMode } from "./SearchMode";
import { Path } from "../utils/Path";

export interface FileSystemService {
    /**
     * Create Path object from vscode.Uri
     */
    path(uri: vscode.Uri): Promise<Path>;

    /**
     * todo kill
     */
    exists(path: Path): Promise<boolean>;

    /**
     * Return path status
     */
    stat(path: Path): Promise<vscode.FileStat | undefined>;

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
    readTextFile(path: Path): Promise<string>;

    /**
     * todo
     */
    createDir(path: Path): Promise<void>;
}