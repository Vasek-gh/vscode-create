import { FileSystemService } from "../fs/FileSystemService";
import { Path } from "../utils/Path";
import { SearchMode } from "../fs/SearchMode";
import { FilesInfo } from "./FilesInfo";
import { FileNameInfo } from "./FileNameInfo";
import { Context } from "./Context";
import { Logger } from "../utils/Logger";
import { ContextHandler } from "./ContextHandler";
import { ActionFactory } from "../actions/ActionFactory";

export class ContextBuilder {
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly fsService: FileSystemService,
        private readonly actionFactory: ActionFactory,
        private readonly handlers: ContextHandler[],
    ) {
        this.logger = logger.create(this);
    }

    public async run(path: Path): Promise<Context> {
        var wsRootDir = this.fsService.getRootDirectory(path);
        if (!wsRootDir) {
            throw new Error(`${path} is outside workspace`);
        }

        const result = new Context(
            this.logger,
            this.actionFactory,
            path,
            await this.getFilesInfo(path, wsRootDir),
            wsRootDir
        );

        for (const handler of this.handlers) {
            await handler.handle(result);
        }

        return result;
    }

    private async getFilesInfo(path: Path, wsRootDir: Path): Promise<FilesInfo> {
        const currentDir = path.getDirectory();
        const currentDirBase = currentDir.getFileName();

        const [baseDir, pattern] = currentDir.isSame(wsRootDir)
            ? [wsRootDir, "{*.*,*/*.*}"]
            : [currentDir.getParentDirectory(), `{*,${currentDirBase}/*,${currentDirBase}/*/*}`];

        const allFiles = await this.fsService.findFiles(baseDir, pattern, SearchMode.Simple);
        const currentFiles = allFiles.filter(p => p.getDirectory().isSame(currentDir));
        const relatedFiles = allFiles.filter(p => !p.getDirectory().isSame(currentDir));

        return new FilesInfo(
            this.getFileNameInfos(currentFiles),
            this.getFileNameInfos(relatedFiles),
            []
        );
    }

    private getFileNameInfos(files: Path[]): FileNameInfo[] {
        return files.map(f => {
            var ext = f.getExtension(true);
            var name = f.getFileName(true);

            return {
                name: name,
                extension: ext
            };
        });
    }
}