import { Action } from "@src/shared/Action";
import { InputInfo } from "@src/shared/InputInfo";
import { CommandAction } from "@src/shared/CommandAction";

export interface SuggestionAction extends Action {
    extension?: string;

    applyInput(input: InputInfo): void;

    getTemplateCommands(): CommandAction[];
}