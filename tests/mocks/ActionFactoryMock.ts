import { Logger } from "@src/tools/Logger";
import { ActionFactory } from "@src/actions/ActionFactory";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Path } from "@src/tools/Path";

export class ActionFactoryMock implements ActionFactory {
    public static readonly instance = new ActionFactoryMock(undefined, undefined);

    public constructor(
        private readonly fileSuggestion: SuggestionAction | undefined,
        private readonly folderSuggestion: SuggestionAction | undefined,
    ) {
    }

    public createFileSuggestion(parentLogger?: Logger): SuggestionAction {
        return this.fileSuggestion ?? this.createActionMock();
    }

    public createFolderSuggestion(parentLogger?: Logger): SuggestionAction {
        return this.folderSuggestion ?? this.createActionMock();
    }

    private createActionMock(): SuggestionAction {
        return {
            description: "mock",
            execute: (c): Promise<Path | undefined> => {
                return Promise.resolve(undefined);
            },
            applyInput: (): void => {
            },
            getTemplateCommands: (): CommandAction[] => {
                return [];
            }
        };
    }
}