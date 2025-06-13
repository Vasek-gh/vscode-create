import { Path } from "@src/utils/Path";
import { Context } from "@src/context/Context";
import { TemplateConfig } from "@src/configuration/TemplateConfig";

export interface FileCreator {
    create(ctx: Context, file: Path, template?: TemplateConfig): Promise<void>;
}