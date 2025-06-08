import * as vscode from "vscode";
import { SearchMode } from "./SearchMode";
import { Path } from "../utils/Path";

export interface FileSystemService {
    /**
     * Create Path object from vscode.Uri
     */
    path(uri: vscode.Uri): Promise<Path>;

    // todo kill
    getFiles(path: Path, includeDirectories: boolean): Promise<Path[]>;

    /**
     * Return workspace root directory for given path
     */
    getRootDirectory(path: Path): Path | undefined;

    /**
     * todo
     */
    findFiles(path: Path, pattern: string, mode: SearchMode): Promise<Path[]>;

    /**
     *
     */
    readTextFile(path: Path): Promise<string>;

    /**
     * Create Path object from vscode.Uri
     */
    createDir(Path: Path): Promise<void>;
}