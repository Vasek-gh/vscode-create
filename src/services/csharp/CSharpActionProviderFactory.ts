import { Logger } from "@src/tools/Logger";
import { Config } from "@src/configuration/Config";
import { ActionProvider } from "@src/providers/ActionProvider";
import { ProvidersFactory } from "@src/providers/ProvidersFactory";
import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";
import { FileSystemService } from "@src/services/FileSystemService";
import { ActionFactory } from "@src/actions/ActionFactory";
import { CSharpActionProvider } from "./CSharpActionProvider";
import { CSharpConfig } from "./CSharpConfig";
import { Path } from "@src/tools/Path";
import { Context } from "@src/context/Context";

export class CSharpActionProviderFactory implements ProvidersFactory {
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
            const files = contextFiles.getByRegExp(currentLevel, "(.+)\\.csproj$");
            if (files === undefined) {
                break;
            }

            if (files.length > 0) {
                return [currentLevel, files[0]];
            }

            currentLevel--;
        }
        while (currentLevel > -1000);

        return undefined;
    }
}