import { Path } from "@src/shared/Path";
import { Context } from "@src/shared/Context";
import { TemplateConfig } from "@src/configuration/TemplateConfig";

export interface FileCreator {
    create(ctx: Context, file: Path, template?: TemplateConfig): Promise<Path | undefined>;
}