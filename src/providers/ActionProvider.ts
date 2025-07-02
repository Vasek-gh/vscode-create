import { Context } from "@src/context/Context";
import { CommandAction } from "../actions/CommandAction";
import { SuggestionAction } from "../actions/SuggestionAction";

export interface ActionProvider {
    getLevel(): number | undefined;
    getCommands(context: Context): Promise<CommandAction[]>;
    getSuggestions(context: Context): Promise<SuggestionAction[]>;
    getTemplateVariables(context: Context): Promise<{ [key: string]: any }>;
}