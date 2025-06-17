import { FileSystemService } from "@src/fs/FileSystemService";
import { SearchMode } from "@src/fs/SearchMode";
import { Path } from "@src/utils/Path";
import { Uri, FileStat } from "vscode";

export class FileSystemServiceMock implements FileSystemService {
    public constructor(
        private readonly fsService: FileSystemService
    ) {
    }

    public getPath(uri: Uri): Promise<Path> {
        return this.fsService.getPath(uri);
    }

    public getStat(path: Path): Promise<FileStat | undefined> {
        return this.fsService.getStat(path);
    }

    public getRootDirectory(path: Path): Path | undefined {
        return this.fsService.getRootDirectory(path);
    }

    public findFiles(path: Path, pattern: string, mode: SearchMode): Promise<Path[]> {
        return this.fsService.findFiles(path, pattern, mode);
    }

    public readTextFile(path: Path): Promise<string | undefined> {
        return this.fsService.readTextFile(path);
    }

    public createDir(path: Path): Promise<void> {
        return this.fsService.createDir(path);
    }
};
