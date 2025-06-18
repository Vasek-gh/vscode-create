import { CommandAction } from "../actions/CommandAction";
import { SuggestionAction } from "../actions/SuggestionAction";
import { Logger } from "../utils/Logger";
import { Path } from "../utils/Path";
import { FilesInfo } from "./FilesInfo";
import { ActionFactory } from "../actions/ActionFactory";

export class Context {
    private readonly logger: Logger;
    private readonly states: Map<string, unknown>;
    private readonly commands: CommandAction[];
    private readonly suggestions: SuggestionAction[];
    private readonly folderSuggestion: SuggestionAction;
    private readonly genericSuggestion: SuggestionAction;

    public readonly dir: Path;

    public constructor(
        logger: Logger,
        actionFactory: ActionFactory,
        public readonly path: Path,
        public readonly filesInfo: FilesInfo,
        public readonly wsRoorDir: Path,
    ) {
        this.logger = logger.create(this);
        this.states = new Map<string, unknown>();
        this.commands = [];
        this.suggestions = [];
        this.folderSuggestion = actionFactory.createFolderSuggestion();
        this.genericSuggestion = actionFactory.createFileSuggestion();
        this.dir = path.getDirectory();
    }

    public getVar<T>(key: string): T | undefined {
        return this.states.get(key) as T;
    }

    public setVar(key: string, state: unknown): void {
        this.states.set(key, state);
    }

    public getVars(): { [key: string]: any } {
        return Object.fromEntries(this.states);
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

        return this.genericSuggestion;
    }

    public appendCommand(action: CommandAction): void {
        this.commands.push(action);
    }

    public appendSuggestion(action: SuggestionAction): void {
        this.suggestions.push(action);
    }
}