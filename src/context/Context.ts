import { CommandAction } from "@src/shared/CommandAction";
import { SuggestionAction } from "@src/shared/SuggestionAction";
import { Path } from "@src/shared/Path";
import { TemplateVariables } from "./TemplateVariables";
import { Context as SharedContext } from "@src/shared/Context";
import { ContextFiles } from "@src/shared/ContextFiles";

export class Context implements SharedContext {
    private readonly commands: CommandAction[];
    private readonly suggestions: SuggestionAction[];
    private readonly fileSuggestion: SuggestionAction;
    private readonly folderSuggestion: SuggestionAction;
    private readonly templateVariables: TemplateVariables;

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
    ) {
        this.rootDir = rootDir;
        this.currentDir = currentDir;
        this.currentPath = currentPath;
        this.files = contextFiles;

        this.commands = commands;
        this.suggestions = suggestions;
        this.fileSuggestion = fileSuggestion;
        this.folderSuggestion = folderSuggestion;

        this.templateVariables = new TemplateVariables();
    }

    public setTemplateVariable(key: string, templateVariable: any): void {
        this.templateVariables.setVariable(key, templateVariable);
    }

    public getTemplateVariables(): { [key: string]: any } {
        return this.templateVariables.getVariables();
    }

    public getCommands(): CommandAction[] {
        return this.commands;
    }

    public getFolderAction(): SuggestionAction {
        return this.folderSuggestion;
    }

    public getDefaultSuggestions(): SuggestionAction[] {
        return this.suggestions;
    }

    public getExtensionSuggestion(extension: string): SuggestionAction {
        const fromDefaults = this.suggestions.find(s => s.extension === extension);
        if (fromDefaults) {
            return fromDefaults;
        }

        return this.fileSuggestion;
    }
}