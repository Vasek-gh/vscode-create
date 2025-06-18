import { FileSystemService } from "@src/services/fs/FileSystemService";
import { Logger } from "@src/utils/Logger";
import { FileSuggestion } from "@src/actions/FileSuggestion";
import { FolderSuggestion } from "@src/actions/FolderSuggestion";
import { Config } from "@src/configuration/Config";
import { FileCreator } from "@src/services/fs/FileCreator";

export class DefaultActionFactory {
    public constructor(
        private readonly logger: Logger,
        private readonly config: Config,
        private readonly fsService: FileSystemService,
        private readonly fileCreator: FileCreator
    ) {
    }

    public createFileSuggestion(): FileSuggestion {
        return new FileSuggestion(
            this.logger,
            this.config,
            this.fileCreator
        );
    }

    public createFolderSuggestion(): FolderSuggestion {
        return new FolderSuggestion(
            this.logger,
            this.fsService
        );
    }
}