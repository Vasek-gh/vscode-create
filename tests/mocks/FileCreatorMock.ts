import { Path } from "@src/tools/Path";
import { TemplateConfig } from "@src/configuration/TemplateConfig";
import { Context } from "@src/context/Context";
import { FileCreator } from "@src/services/FileCreator";

interface CreateQuery {
    file: Path;
    template?: TemplateConfig;
}

export class FileCreatorMock implements FileCreator {
    public createQueries: CreateQuery[] = [];

    public createByContent(file: Path, content: string): Promise<Path | undefined> {
        return Promise.resolve(undefined);
    }

    public create(ctx: Context, file: Path, template?: TemplateConfig): Promise<Path | undefined> {
        this.createQueries.push({
            file,
            template
        });

        return Promise.resolve(undefined);
    }

    public clearInvocations(): void {
        this.createQueries = [];
    }
}