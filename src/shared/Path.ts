import path from "path";
import * as vscode from "vscode";

export class Path {
    public constructor(
        public readonly uri: vscode.Uri,
        public readonly type: vscode.FileType
    ) {
        const error = Path.validate(uri);
        if (error) {
            throw new Error(error);
        }

        this.uri = this.normalize(uri);
    }

    public static validate(uri: vscode.Uri): string | undefined {
        if (uri.query) {
            return "Uri with 'query' part is unsupported";
        }

        if (uri.fragment) {
            return "Uri with 'fragment' part is unsupported";
        }

        return undefined;
    }

    public static fromDir(uri: vscode.Uri): Path {
        return new Path(uri, vscode.FileType.Directory);
    }

    public static fromFile(uri: vscode.Uri): Path {
        return new Path(uri, vscode.FileType.File);
    }

    // todo kill ??
    public get length(): number {
        return this.uri.toString().length;
    }

    // todo kill ??
    public get fullPath(): string {
        return this.uri.toString();
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
        return this.uri.scheme === path.uri.scheme
            && this.uri.path === path.uri.path
            && this.uri.authority === path.uri.authority;
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

    private normalize(uri: vscode.Uri) : vscode.Uri {
        /*
        It is unknown why, but sometimes during testing some APIs can return
        the disk symbol in upper case. At the same time, these same APIs in
        production return the disk symbol in lower case. Since there is no
        certainty that the behavior in production will not change, it is necessary
        to force the lower case so that the comparison works correctly.
        */
        if (process.platform !== "win32"
            || uri.path[0] !== "/"
            || uri.path[2] !== ":"
            || (uri.path[1] < "A" && uri.path[1] > "Z")
        ) {
            return uri;
        }

        const fixedPath = "/" + uri.path[1].toLowerCase() + uri.path.substring(2);

        return uri.with({
            path: fixedPath
        });
    }

    public toString(): string {
        return this.isOnDisk() ? this.uri.fsPath : this.uri.toString();
    }
}