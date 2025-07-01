import { FileSystemService } from "@src/services/FileSystemService";
import { Logger } from "@src/tools/Logger";
import { FileSuggestion } from "@src/actions/factory/FileSuggestion";
import { FolderSuggestion } from "@src/actions/factory/FolderSuggestion";
import { Config } from "@src/configuration/Config";
import { FileCreator } from "@src/services/FileCreator";
import { SuggestionAction } from "@src/actions/SuggestionAction";

export class ActionFactoryImpl {
    public constructor(
        private readonly logger: Logger,
        private readonly config: Config,
        private readonly fsService: FileSystemService,
        private readonly fileCreator: FileCreator
    ) {
    }

    public createFileSuggestion(): SuggestionAction {
        return new FileSuggestion(
            this.logger,
            this.config,
            this.fileCreator
        );
    }

    public createFolderSuggestion(): SuggestionAction {
        return new FolderSuggestion(
            this.logger,
            this.fsService
        );
    }
}