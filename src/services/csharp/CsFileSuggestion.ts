import * as vscode from "vscode";
import { BaseAction } from "../../actions/BaseAction";
import { SuggestionAction } from "../../actions/SuggestionAction";
import { Context } from "../../context/Context";
import { Logger } from "../../utils/Logger";
import { InputInfo } from "../../actions/InputInfo";
import { CommandAction } from "../../actions/CommandAction";
import { Config } from "../../configuration/Config";
import { ActionFactory } from "../../actions/ActionFactory";

export class CsFileSuggestion extends BaseAction implements SuggestionAction {
    private readonly logger: Logger;
    private readonly genericSuggestion: SuggestionAction;

    public readonly extension: string = "cs";

    public constructor(
        logger: Logger,
        actionFactory: ActionFactory,
        private readonly config: Config,
    ) {
        super("", "", undefined);

        this.logger = logger.create(this);
        this.genericSuggestion = actionFactory.createFileSuggestion();
    }

    public execute(ctx: Context): Promise<void> {
        return this.genericSuggestion.execute(ctx);
    }

    public applyInput(input: InputInfo): void {
        if (!input.name) {
            this.logger.warn("Input has not file name");
        }

        if (input.extension && input.extension !== this.extension) {
            this.logger.warn("Input extension is not \"cs\"");
        }

        const isInterface = this.isInterface(input.name ?? "");

        this.genericSuggestion.applyInput(new InputInfo(
            input.directory,
            input.name,
            input.extension ?? "cs",
            input.template ?? (isInterface ? "interface" : "class")
        ));

        this.value = this.genericSuggestion.value;

        if (input.template === undefined) {
            this.description = `Create C# ${isInterface ? "interface" : "class"}`;
        }
        else {
            this.description = this.genericSuggestion.description;
        }
    }

    public getTemplateCommands(): CommandAction[] {
        return this.genericSuggestion.getTemplateCommands();
    }

    private isInterface(filename: string): boolean {
        return filename.length > 1 && filename[0] === "I" && filename[0] === filename[0].toUpperCase();
    }
}