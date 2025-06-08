import { TemplateConfig } from "./TemplateConfig";

export type ExtensionConfig = {
    default?: string;
} & {
    [index:string]: TemplateConfig | undefined;
};