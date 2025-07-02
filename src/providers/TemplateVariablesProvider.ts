import { Context } from "@src/context/Context";

export interface TemplateVariablesProvider {
    getTemplateVariables(context: Context): Promise<{ [key: string]: any }>;
}
