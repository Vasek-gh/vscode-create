import * as vscode from "vscode";
import { FileSystemService } from "@src/services/fs/FileSystemService";
import { Path } from "@src/tools/Path";
import { Logger } from "@src/tools/Logger";

// todo check virual fs
export class DefaultFileSystemService implements FileSystemService {
    private readonly fileNotFound = vscode.FileSystemError.FileNotFound("dummy");
    private readonly logger: Logger;

    public constructor(
        logger: Logger
    ) {
        this.logger = logger.create(this);
    }

    public async getPath(uri: vscode.Uri): Promise<Path> {
        const fileStat = await this.internalStat(uri);
        if (!fileStat) {
            throw vscode.FileSystemError.FileNotFound;
        }

        return new Path(uri, fileStat.type);
    }

    public getStat(path: Path): Promise<vscode.FileStat | undefined> {
        return this.internalStat(path.uri);
    }

    public getRootDirectory(path: Path): Path | undefined {
        const wsFolder = vscode.workspace.getWorkspaceFolder(path.uri);

        return wsFolder === undefined
            ? undefined
            : Path.fromDir(wsFolder.uri);
    }

    public async readTextFile(path: Path): Promise<string | undefined> {
        if (!path.isFile()) {
            throw new Error(`Path ${path} is not file`);
        }

        try {
            const stat = await this.getStat(path);
            if (!stat) {
                return undefined;
            }

            const data = await vscode.workspace.fs.readFile(path.uri);
            const result = Buffer.from(data).toString("utf8");

            return result;
        }
        catch (e: any) {
            this.logger.exception(e);

            return undefined;
        }
    }

    public async createDir(path: Path): Promise<void> {
        await vscode.workspace.fs.createDirectory(path.uri);
    }

    private async internalStat(uri: vscode.Uri): Promise<vscode.FileStat | undefined> {
        try {
            return await vscode.workspace.fs.stat(uri);
        }
        catch (e: any) {
            if (e instanceof vscode.FileSystemError && (e as vscode.FileSystemError).code === this.fileNotFound.code) {
                return undefined;
            }

            throw e;
        }
    }
}