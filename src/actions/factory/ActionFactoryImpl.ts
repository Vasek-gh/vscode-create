import { FileSystemService } from "@src/services/FileSystemService";
import { Logger } from "@src/tools/Logger";
import { FileSuggestion } from "@src/actions/factory/FileSuggestion";
import { FolderSuggestion } from "@src/actions/factory/FolderSuggestion";
import { Config } from "@src/configuration/Config";
import { FileCreator } from "@src/services/FileCreator";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { ActionFactory } from "../ActionFactory";

export class ActionFactoryImpl implements ActionFactory {
    public constructor(
        private readonly logger: Logger,
        private readonly config: Config,
        private readonly fsService: FileSystemService,
        private readonly fileCreator: FileCreator
    ) {
    }

    public createFileSuggestion(parentLogger?: Logger): SuggestionAction {
        return new FileSuggestion(
            parentLogger ?? this.logger,
            this.config,
            this.fileCreator
        );
    }

    public createFolderSuggestion(parentLogger?: Logger): SuggestionAction {
        return new FolderSuggestion(
            parentLogger ?? this.logger,
            this.fsService
        );
    }
}