import * as vscode from "vscode";
import { Path } from "../tools/Path";
import { Context } from "./Context";
import { Logger } from "../tools/Logger";
import { ActionFactory } from "../actions/ActionFactory";
import { ActionProviderFactory } from "@src/actions/ActionProviderFactory";
import { ContextFilesImpl } from "./ContextFilesImpl";
import { ActionProvider } from "@src/actions/ActionProvider";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Utils } from "@src/tools/Utils";

export class ContextBuilder {
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly actionFactory: ActionFactory,
        private readonly actionProviderFactories: ActionProviderFactory[],
    ) {
        this.logger = logger.create(this);
    }

    public async run(path: Path): Promise<Context> {
        this.logger.trace("Begin build context");
        var workspaceDir = Utils.getRootDirectory(path);
        if (!workspaceDir) {
            throw new Error(`${path} is outside workspace`);
        }

        const fileSuggestion = this.actionFactory.createFileSuggestion();
        const folderSuggestion = this.actionFactory.createFolderSuggestion();
        const contextFiles = await ContextFilesImpl.createFromPath(workspaceDir, path);

        const tmpContext = new Context(
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

        const commands: CommandAction[] = [];
        const suggestions: SuggestionAction[] = [];
        const templateVariables: { [key: string]: any } = {};

        const actionProviders = await this.getProviders(tmpContext);
        for (const actionProvider of actionProviders) {
            commands.push(...await actionProvider.getCommands(tmpContext));
            suggestions.push(...await actionProvider.getSuggestions(tmpContext));

            const variabels = await actionProvider.getTemplateVariables(tmpContext);
            for (const variableKey of Object.keys(variabels)) {
                templateVariables[variableKey] = variabels[variableKey];
            }
        }

        this.logger.trace("Context ready");

        return new Context(
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

    private async getProviders(context: Context): Promise<ActionProvider[]> {
        let result: ActionProvider[] = [];
        let maxLevel = Number.MAX_VALUE;
        const alwaysWorkingProviders: ActionProvider[] = [];

        for (const actionProviderFactory of this.actionProviderFactories) {
            const actionProvider = await actionProviderFactory.create(context);
            if (!actionProvider) {
                continue;
            }

            const level = actionProvider?.getLevel();
            if (!level) {
                alwaysWorkingProviders.push(actionProvider);
                continue;
            }

            if (level < maxLevel) {
                result = [];
                maxLevel = level;
            }

            if (level === maxLevel) {
                result.push(actionProvider);
            }
        }

        return result.concat(alwaysWorkingProviders);
    }
}