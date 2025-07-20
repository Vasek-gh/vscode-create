import { TemplateConfig } from "./TemplateConfig";

export type ExtensionConfig = {
    default?: string;
} & {
    [id: string]: TemplateConfig | undefined;
};