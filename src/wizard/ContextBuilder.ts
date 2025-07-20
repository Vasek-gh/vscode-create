import * as vscode from "vscode";
import { Path } from "../tools/Path";
import { WizardContext } from "./WizardContext";
import { Logger } from "../tools/Logger";
import { ActionFactory } from "../actions/ActionFactory";
import { ProvidersFactory } from "@src/providers/ProvidersFactory";
import { ContextFilesImpl } from "./ContextFilesImpl";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Utils } from "@src/tools/Utils";
import { GenericActionProvider } from "@src/providers/GenericActionProvider";
import { FileLevel } from "@src/context/FileLevel";

export class ContextBuilder {
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly actionFactory: ActionFactory,
        private readonly genericActionProvider: GenericActionProvider,
        private readonly providerFactories: ProvidersFactory[],
    ) {
        this.logger = logger.create(this);
    }

    public async run(path: Path): Promise<WizardContext> {
        this.logger.trace("Begin build context");
        var workspaceDir = Utils.getRootDirectory(path);
        if (!workspaceDir) {
            throw new Error(`${path} is outside workspace`);
        }

        const fileSuggestion = this.actionFactory.createFileSuggestion();
        const folderSuggestion = this.actionFactory.createFolderSuggestion();
        const contextFiles = await ContextFilesImpl.createFromPath(workspaceDir, path);

        const tmpContext = new WizardContext(
            workspaceDir,
            path.getDirectory(),
            path,
            contextFiles,
            [],
            [],
            fileSuggestion,
            folderSuggestion,
            {}
        );

        let commands: CommandAction[] = [];
        let suggestions: SuggestionAction[] = [];
        let templateVariables: { [key: string]: any } = {};

        const factories = await this.getProviderFactories(tmpContext);
        for (const factory of factories) {
            const actionProvider = await factory.createActionProvider(tmpContext);
            if (actionProvider) {
                commands.push(...await actionProvider.getCommands(tmpContext));
                suggestions.push(...await actionProvider.getSuggestions(tmpContext));
            }

            const templateVariablesProvider = await factory.createTemplateVariablesProvider(tmpContext);
            if (templateVariablesProvider) {
                const variabels = await templateVariablesProvider.getTemplateVariables(tmpContext);
                for (const variableKey of Object.keys(variabels)) {
                    templateVariables[variableKey] = variabels[variableKey];
                }
            }
        }

        if (suggestions.length === 0) {
            suggestions = this.genericActionProvider.getSuggestions(tmpContext);
        }

        this.logger.trace("Context ready");

        return new WizardContext(
            tmpContext.rootDir,
            tmpContext.currentDir,
            tmpContext.currentPath,
            tmpContext.files,
            commands,
            suggestions,
            fileSuggestion,
            folderSuggestion,
            templateVariables
        );
    }

    private async getProviderFactories(context: WizardContext): Promise<ProvidersFactory[]> {
        let result: ProvidersFactory[] = [];
        let maxLevel = Number.MIN_VALUE;

        const alwaysWorkingFactories: ProvidersFactory[] = [];

        for (const providerFactory of this.providerFactories) {
            const level = await providerFactory.getLevel(context);
            if (level === undefined) {
                continue;
            }

            if (level === FileLevel.Root) {
                alwaysWorkingFactories.push(providerFactory);
                continue;
            }

            if (level < maxLevel) {
                result = [];
                maxLevel = level;
            }

            if (level === maxLevel) {
                result.push(providerFactory);
            }
        }

        return result.concat(alwaysWorkingFactories);
    }
}