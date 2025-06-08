import { ActionFactory } from "@src/actions/ActionFactory";
import { SuggestionAction } from "@src/actions/SuggestionAction";

export class ActionFactoryMock implements ActionFactory {
    public constructor(
        private readonly fileSuggestion: SuggestionAction,
        private readonly folderSuggestion: SuggestionAction,
    ) {

    }

    public createFileSuggestion(): SuggestionAction {
        return this.fileSuggestion;
    }

    public createFolderSuggestion(): SuggestionAction {
        return this.folderSuggestion;
    }
};
