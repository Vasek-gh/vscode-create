import { TemplateItemConfig } from "./TemplateItemConfig";

export type TemplateConfig = {
    hidden?: boolean;
    snnipet?: string;
    template?: string | TemplateItemConfig[];
    vars?: {
        [index:string]: any;
    };
};