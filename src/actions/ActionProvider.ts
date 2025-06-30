import * as vscode from "vscode";
import { CommandAction } from "./CommandAction";
import { SuggestionAction } from "./SuggestionAction";
import { Context } from "@src/context/Context";

export interface ActionProvider {
    getId(): string;
    getLevel(): number | undefined;
    getCommands(context: Context): Promise<CommandAction[]>;
    getSuggestions(context: Context): Promise<SuggestionAction[]>;
    getTemplateVariables(context: Context): Promise<{ [key: string]: any }>;
}