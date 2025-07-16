import * as vscode from "vscode";
import { Path } from "@src/tools/Path";

export interface FileSystemService {
    /**
     * Create Path object from vscode.Uri.
     * If the path leads to a non-existent file or folder throw error.
     */
    getPath(uri: vscode.Uri): Promise<Path>;

    /**
     * Return path status.
     * If the path leads to a non-existent file or folder, return undefined.
     */
    getStat(path: Path): Promise<vscode.FileStat | undefined>;

    /**
     * Creates directory.
     * If the specified path is not a folder throw error.
     */
    createDir(path: Path): Promise<void>;

    /**
     * Reads file and return its content.
     * If the specified path is not a file throw error.
     * If an exception occurs while reading the file, undefined will be returned.
     */
    readTextFile(path: Path): Promise<string | undefined>;
}