import { Logger } from "@src/tools/Logger";
import { Config } from "@src/configuration/Config";
import { ActionProvider } from "@src/providers/ActionProvider";
import { ProvidersFactory } from "@src/providers/ProvidersFactory";
import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";
import { FileSystemService } from "@src/services/FileSystemService";
import { ActionFactory } from "@src/actions/ActionFactory";
import { CSharpProvider } from "./CSharpProvider";
import { CSharpConfig } from "./CSharpConfig";
import { Path } from "@src/tools/Path";
import { Context } from "@src/context/Context";
import { TemplateVariablesProvider } from "@src/providers/TemplateVariablesProvider";

interface ProviderCache {
    readonly context: Context;
    readonly level?: number;
    readonly provider?: CSharpProvider;
}

export class CSharpProvidersFactory implements ProvidersFactory {
    private providerCache: ProviderCache | undefined;

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

    public getLevel(context: Context): Promise<number | undefined> {
        if (!this.config.isEnableAll()) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(this.getContextCache(context).level);
    }

    public createActionProvider(context: Context): Promise<ActionProvider | undefined> {
        if (!this.config.isEnableAll()) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(this.getContextCache(context).provider);
    }

    public createTemplateVariablesProvider(context: Context): Promise<TemplateVariablesProvider | undefined> {
        if (!this.config.isEnableAll()) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(this.getContextCache(context).provider);
    }

    private getContextCache(context: Context): ProviderCache {
        if (!this.providerCache || this.providerCache.context.uuid !== context.uuid) {
            const csprojFile = this.findCsproj(context.files);
            if (!csprojFile || !csprojFile[1].isFile()) {
                this.providerCache = {
                    context: context
                };
            }
            else {
                this.providerCache = {
                    context: context,
                    level: csprojFile[0],
                    provider: new CSharpProvider(
                        this.logger,
                        this.config,
                        csprojFile[1],
                        this.fsService,
                        this.actionFactory
                    )
                };
            }
        }

        return this.providerCache;
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