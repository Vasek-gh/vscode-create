import { DefaultFileSystemService } from "@src/fs/DefaultFileSystemService";
import { FileSystemService } from "@src/fs/FileSystemService";
import { SearchMode } from "@src/fs/SearchMode";
import { Path } from "@src/utils/Path";
import { Uri, FileStat } from "vscode";
import { LoggerMock } from "./LoggerMock";

export class FileSystemServiceMock implements FileSystemService {
    private readonly defaultFsService: FileSystemService;

    public constructor() {
        this.defaultFsService = new DefaultFileSystemService(LoggerMock.instance)
    }

    public getPath(uri: Uri): Promise<Path> {
        return this.defaultFsService.getPath(uri);
    }

    public getStat(path: Path): Promise<FileStat | undefined> {
        return this.defaultFsService.getStat(path);
    }

    public getRootDirectory(path: Path): Path | undefined {
        return this.defaultFsService.getRootDirectory(path);
    }

    public findFiles(path: Path, pattern: string, mode: SearchMode): Promise<Path[]> {
        return this.defaultFsService.findFiles(path, pattern, mode);
    }

    public readTextFile(path: Path): Promise<string | undefined> {
        return this.defaultFsService.readTextFile(path);
    }

    public createDir(path: Path): Promise<void> {
        return this.defaultFsService.createDir(path);
    }
};
