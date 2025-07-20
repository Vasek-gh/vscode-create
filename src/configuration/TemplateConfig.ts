import { TemplateItemConfig } from "./TemplateItemConfig";

export type TemplateConfig = {
    hidden?: boolean;
    template?: string | TemplateItemConfig[];
    vars?: {
        [index:string]: any;
    };
};