import { Context } from "@src/context/Context";
import { ActionProvider } from "./ActionProvider";
import { TemplateVariablesProvider } from "./TemplateVariablesProvider";

export interface ProvidersFactory {
    getLevel(context: Context): Promise<number | undefined>;
    createActionProvider(context: Context): Promise<ActionProvider | undefined>;
    createTemplateVariablesProvider(context: Context): Promise<TemplateVariablesProvider | undefined>;
}