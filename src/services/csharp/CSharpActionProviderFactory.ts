import { Logger } from "@src/tools/Logger";
import { Config } from "@src/configuration/Config";
import { ActionProvider } from "@src/shared/ActionProvider";
import { ActionProviderFactory } from "@src/shared/ActionProviderFactory";
import { ContextFiles } from "@src/shared/ContextFiles";
import { FileLevel } from "@src/shared/FileLevel";
import { FileSystemService } from "@src/services/fs/FileSystemService";
import { ActionFactory } from "@src/actions/ActionFactory";
import { CSharpActionProvider } from "./CSharpActionProvider";
import { CSharpConfig } from "./CSharpConfig";
import { Path } from "@src/shared/Path";
import { Context } from "@src/shared/Context";

export class CSharpActionProviderFactory implements ActionProviderFactory {
    private readonly logger: Logger;
    private readonly config: CSharpConfig;

    public constructor(
        logger: Logger,
        config: Config,
        private readonly fsService: FileSystemService,
        private readonly actionFactory: ActionFactory,
    ) {
        this.logger = logger;
        this.config = new CSharpConfig(config);
    }

    public create(context: Context): Promise<ActionProvider | undefined> {
        if (!this.config.enableAll) {
            return Promise.resolve(undefined);
        }

        const csprojFile = this.findCsproj(context.files);
        if (!csprojFile || !csprojFile[1].isFile()) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(new CSharpActionProvider(
            this.logger,
            this.config,
            csprojFile[0],
            csprojFile[1],
            this.fsService,
            this.actionFactory
        ));
    }

    private findCsproj(contextFiles: ContextFiles): undefined | [number, Path] {
        let currentLevel: number = FileLevel.Current;
        do {
            const files = contextFiles.getFiles(currentLevel, "(.+).csproj");
            if (files === undefined) {
                break;
            }

            if (files.length > 0) {
                return [currentLevel, files[0]];
            }
        }
        while (currentLevel > -1000);

        return undefined;
    }
}