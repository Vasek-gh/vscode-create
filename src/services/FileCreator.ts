import { Path } from "@src/tools/Path";
import { Context } from "@src/context/Context";
import { TemplateConfig } from "@src/configuration/TemplateConfig";

export interface FileCreator {
    createByContent(file: Path, content: string): Promise<Path | undefined>;
    create(ctx: Context, file: Path, template?: TemplateConfig): Promise<Path | undefined>;
}