import * as vscode from "vscode";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Logger } from "@src/tools/Logger";
import { InputInfo } from "@src/actions/InputInfo";
import { CommandAction } from "@src/actions/CommandAction";
import { ActionFactory } from "@src/actions/ActionFactory";
import { Path } from "@src/tools/Path";
import { Context } from "@src/context/Context";

export class GenericExtensionSuggestion implements SuggestionAction {
    private readonly logger: Logger;
    private readonly fileSuggestion: SuggestionAction;

    public value: string = "";
    public description: string = "";
    public detail?: string;
    public readonly extension: string;

    public constructor(
        logger: Logger,
        actionFactory: ActionFactory,
        extension: string
    ) {
        this.logger = logger.create(this).create(extension);
        this.fileSuggestion = actionFactory.createFileSuggestion(this.logger);
        this.extension = extension;
    }

    public execute(ctx: Context): Promise<Path | undefined> {
        return this.fileSuggestion.execute(ctx);
    }

    public applyInput(input: InputInfo): void {
        if (!input.name) {
            this.logger.warn("Input has not file name");
        }

        if (input.extension && input.extension !== this.extension) {
            this.logger.warn(`Input extension is not "${this.extension}"`);
        }

        this.fileSuggestion.applyInput(new InputInfo(
            input.directory,
            input.name,
            input.extension ?? this.extension,
            input.template
        ));

        this.value = this.fileSuggestion.value;
        this.description = this.fileSuggestion.description;
    }

    public getTemplateCommands(): CommandAction[] {
        return this.fileSuggestion.getTemplateCommands();
    }
}