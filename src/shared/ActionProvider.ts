import * as vscode from "vscode";
import { CommandAction } from "@src/shared/CommandAction";
import { SuggestionAction } from "@src/shared/SuggestionAction";
import { Context } from "@src/shared/Context";

export interface ActionProvider {
    getId(): string;
    getLevel(): number | undefined;
    getCommands(context: Context): Promise<CommandAction[]>;
    getSuggestions(context: Context): Promise<SuggestionAction[]>;
}