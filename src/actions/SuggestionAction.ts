import * as vscode from "vscode";
import { Action } from "./Action";
import { InputInfo } from "./InputInfo";
import { CommandAction } from "./CommandAction";

export interface SuggestionAction extends Action {
    extension?: string;

    applyInput(input: InputInfo): void;

    getTemplateCommands(): CommandAction[];
}