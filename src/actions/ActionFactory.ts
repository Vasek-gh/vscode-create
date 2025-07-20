import { Logger } from "@src/tools/Logger";
import { SuggestionAction } from "./SuggestionAction";

export interface ActionFactory {
    createFileSuggestion(parentLogger?: Logger): SuggestionAction;
    createFolderSuggestion(parentLogger?: Logger): SuggestionAction;
}