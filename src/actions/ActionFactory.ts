import { SuggestionAction } from "./SuggestionAction";

export interface ActionFactory {
    createFileSuggestion(): SuggestionAction;
    createFolderSuggestion(): SuggestionAction;
}