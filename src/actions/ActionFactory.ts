import { SuggestionAction } from "@src/shared/SuggestionAction";

export interface ActionFactory {
    createFileSuggestion(): SuggestionAction;
    createFolderSuggestion(): SuggestionAction;
}