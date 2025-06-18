import path from "path";
import * as vscode from "vscode";

// todo check virual fs
export class Path {
    public constructor(
        public readonly uri: vscode.Uri,
        public readonly type: vscode.FileType
    ) {
    }

    public static fromDir(uri: vscode.Uri): Path {
        return new Path(uri, vscode.FileType.Directory);
    }

    public static fromFile(uri: vscode.Uri): Path {
        return new Path(uri, vscode.FileType.File);
    }

    public get length(): number {
        return this.uri.path.length;
    }

    public get fullPath(): string {
        return this.uri.path;
    }

    public isFile(): boolean {
        return this.type !== vscode.FileType.Directory;
    }

    public isDirectory(): boolean {
        return this.type === vscode.FileType.Directory;
    }

    public isOnDisk(): boolean {
        return this.uri.scheme === "file";
    }

    public hasExtension(extension: string): boolean {
        if (this.isDirectory() || extension.length === 0) {
            return false;
        }

        const pathExtension = this.getExtension();
        const queryExtension = extension[0] === "."
            ? extension
            : "." + extension;

        return pathExtension.toLowerCase() === queryExtension.toLowerCase();
    }

    public isSame(path: Path): boolean {
        return this.uri.path === path.uri.path;
    }

    public getDirectory(): Path {
        return this.isDirectory()
            ? this
            : this.getParentDirectory();
    }

    public getParentDirectory(): Path {
        return new Path(
            vscode.Uri.file(path.dirname(this.uri.path)),
            vscode.FileType.Directory
        );
    }

    public getRelative(base: Path): string { // todo null if false ???
        return !this.fullPath.startsWith(base.fullPath)
            ? ""
            : this.fullPath.substring(base.fullPath.length + 1);
    }

    public getFileName(withoutExtension: boolean = false): string { // todo rename to basename
        const suffix = withoutExtension
            ? this.getExtension()
            : "";

        return path.basename(this.uri.path, suffix);
    }

    public getExtension(withoutDot: boolean = false): string { // todo null if dir or not exists
        if (this.isDirectory()) {
            return "";
        }

        var result = path.extname(this.uri.path);

        return withoutDot && result.length > 0 && result[0] === "."
            ? result.substring(1)
            : result;
    }

    public appendDir(...pathSegments: string[]): Path {
        return this.doAppend(vscode.FileType.Directory, ...pathSegments);
    }

    public appendFile(...pathSegments: string[]): Path {
        return this.doAppend(vscode.FileType.File, ...pathSegments);
    }

    private doAppend(type: vscode.FileType, ...pathSegments: string[]): Path {
        if (pathSegments.length === 0) {
            return this;
        }

        if (this.isFile()) {
            throw new Error(`Attempt join to file(${this.fullPath}) new serment(${pathSegments[0]})`);
        }

        return new Path(
            vscode.Uri.joinPath(this.uri, ...pathSegments),
            type
        );
    }

    public toString(): string {
        return this.uri.toString();
    }
}