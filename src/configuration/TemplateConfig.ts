import { TemplateItemConfig } from "./TemplateItemConfig";

export type TemplateConfig = {
    hidden?: boolean;
    snnipet?: string; // todo kill
    template?: string | TemplateItemConfig[];
    vars?: {
        [index:string]: any;
    };
};