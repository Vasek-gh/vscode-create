import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Path } from "@src/tools/Path";
import { Context as ContextInterface } from "@src/context/Context";
import { ContextFiles } from "@src/context/ContextFiles";

export class Context implements ContextInterface {
    private readonly commands: CommandAction[];
    private readonly suggestions: SuggestionAction[];
    private readonly fileSuggestion: SuggestionAction;
    private readonly folderSuggestion: SuggestionAction;
    private readonly templateVariables: { [key: string]: any };

    public readonly rootDir: Path;
    public readonly currentDir: Path;
    public readonly currentPath: Path;
    public readonly files: ContextFiles;

    public constructor(
        rootDir: Path,
        currentDir: Path,
        currentPath: Path,
        contextFiles: ContextFiles,
        commands: CommandAction[] = [],
        suggestions: SuggestionAction[] = [],
        fileSuggestion: SuggestionAction,
        folderSuggestion: SuggestionAction,
        templateVariables: { [key: string]: any }
    ) {
        this.rootDir = rootDir;
        this.currentDir = currentDir;
        this.currentPath = currentPath;
        this.files = contextFiles;

        this.commands = commands;
        this.suggestions = suggestions;
        this.fileSuggestion = fileSuggestion;
        this.folderSuggestion = folderSuggestion;

        this.templateVariables = templateVariables;
    }

    public getTemplateVariables(): { [key: string]: any } {
        return this.templateVariables;
    }

    public getCommands(): CommandAction[] {
        return this.commands;
    }

    public getFolderAction(): SuggestionAction {
        return this.folderSuggestion;
    }

    public getDefaultSuggestions(): SuggestionAction[] {
        return this.suggestions.length === 0
            ? [this.fileSuggestion]
            : this.suggestions;
    }

    public getExtensionSuggestion(extension: string): SuggestionAction {
        const fromDefaults = this.suggestions.find(s => s.extension === extension);
        if (fromDefaults) {
            return fromDefaults;
        }

        return this.fileSuggestion;
    }
}