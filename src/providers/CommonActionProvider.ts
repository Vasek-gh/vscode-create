import * as vscode from "vscode";
import { ActionProvider } from "@src/providers/ActionProvider";
import { ProvidersFactory } from "@src/providers/ProvidersFactory";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Context } from "@src/context/Context";
import { FileCreator } from "@src/services/FileCreator";
import { Utils } from "@src/tools/Utils";
import { Logger } from "../tools/Logger";
import { Path } from "@src/tools/Path";
import { TemplateVariablesProvider } from "./TemplateVariablesProvider";
import { FileLevel } from "@src/context/FileLevel";

class Commands {
    public static createReadmeMd(logger: Logger, fileCreator: FileCreator): CommandAction {
        const name = "README.md";

        return this.createCommand(
            logger,
            fileCreator,
            name,
            undefined,
            "Blank README file",
            undefined
        );
    }

    public static createDockerfile(logger: Logger, fileCreator: FileCreator): CommandAction {
        const name = "Dockerfile";

        return this.createCommand(
            logger,
            fileCreator,
            name,
            undefined,
            "Set of instructions used to build a Docker image",
            undefined
        );
    }

    public static createDirectoryBuildProps(logger: Logger, fileCreator: FileCreator): CommandAction {
        const name = "Directory.Build.props";
        const content = Utils.formatLitteral(`
            <Project>
            </Project>
        `);

        return this.createCommand(
            logger,
            fileCreator,
            name,
            undefined,
            "Override default property settings",
            content
        );
    }

    public static createDirectoryBuildTargets(logger: Logger, fileCreator: FileCreator): CommandAction {
        const name = "Directory.Build.targets";
        const content = Utils.formatLitteral(`
            <Project>
            </Project>
        `);

        return this.createCommand(
            logger,
            fileCreator,
            name,
            undefined,
            "Override default property settings",
            content
        );
    }

    private static createCommand(
        logger: Logger,
        fileCreator: FileCreator,
        filename: string,
        description?: string,
        detail?: string,
        content?: string
    ): CommandAction {
        return {
            label: filename,
            description: description ?? `Create ${filename}`,
            detail: detail,
            iconPath: vscode.ThemeIcon.File,
            async execute(context: Context): Promise<Path | undefined> {
                logger.trace(`Execute ${filename} at ${context.currentDir}`);
                const file = context.currentDir.appendFile(filename);
                return await fileCreator.createByContent(file, content ?? "");
            }
        };
    }
}

export class CommonActionProvider implements ActionProvider, ProvidersFactory {
    private readonly logger: Logger;
    private readonly commands: CommandAction[];
    private readonly rootCommands: CommandAction[];

    public constructor(
        logger: Logger,
        fileCreator: FileCreator
    ) {
        this.logger = logger.create(this);

        this.commands = [
            Commands.createDockerfile(this.logger, fileCreator),
            Commands.createDirectoryBuildProps(this.logger, fileCreator), // todo only in dotnet context
            Commands.createDirectoryBuildTargets(this.logger, fileCreator) // todo only in dotnet context
        ];

        this.rootCommands = [
            Commands.createReadmeMd(this.logger, fileCreator),
        ];
    }

    public getLevel(context: Context): Promise<number | undefined> {
        return Promise.resolve(FileLevel.Root);
    }

    public createActionProvider(context: Context): Promise<ActionProvider | undefined> {
        return Promise.resolve(this);
    }

    public createTemplateVariablesProvider(context: Context): Promise<TemplateVariablesProvider | undefined> {
        return Promise.resolve(undefined);
    }

    public getCommands(context: Context): Promise<CommandAction[]> {
        return Promise.resolve(
            !context.rootDir.isSame(context.currentDir)
                ? this.commands
                : this.rootCommands.concat(this.commands)
        );
    }

    public getSuggestions(context: Context): Promise<SuggestionAction[]> {
        return Promise.resolve([]);
    }
}
