import * as vscode from "vscode";
import { BaseAction } from "@src/actions/BaseAction";
import { SuggestionAction } from "@src/shared/SuggestionAction";
import { Logger } from "@src/tools/Logger";
import { InputInfo } from "@src/shared/InputInfo";
import { CommandAction } from "@src/shared/CommandAction";
import { ActionFactory } from "@src/actions/ActionFactory";
import { CSharpConfig } from "./CSharpConfig";
import { Path } from "@src/shared/Path";
import { Context } from "@src/shared/Context";

export class CsFileSuggestion extends BaseAction implements SuggestionAction {
    private readonly logger: Logger;
    private readonly fileSuggestion: SuggestionAction;

    public readonly extension: string = "cs";

    public constructor(
        logger: Logger,
        actionFactory: ActionFactory,
        private readonly config: CSharpConfig,
    ) {
        super("", "", undefined);

        this.logger = logger.create(this);
        this.fileSuggestion = actionFactory.createFileSuggestion();
    }

    public execute(ctx: Context): Promise<Path | undefined> {
        return this.fileSuggestion.execute(ctx);
    }

    public applyInput(input: InputInfo): void {
        if (!input.name) {
            this.logger.warn("Input has not file name");
        }

        if (input.extension && input.extension !== this.extension) {
            this.logger.warn("Input extension is not \"cs\"");
        }

        const isInterface = this.isInterface(input.name ?? "");

        this.fileSuggestion.applyInput(new InputInfo(
            input.directory,
            input.name,
            input.extension ?? "cs",
            input.template ?? (isInterface ? "interface" : "class")
        ));

        this.value = this.fileSuggestion.value;

        if (input.template === undefined) {
            this.description = `Create C# ${isInterface ? "interface" : "class"}`;
        }
        else {
            this.description = this.fileSuggestion.description;
        }
    }

    public getTemplateCommands(): CommandAction[] {
        return this.fileSuggestion.getTemplateCommands();
    }

    private isInterface(filename: string): boolean {
        return filename.length > 1 && filename[0] === "I" && filename[0] === filename[0].toUpperCase(); // todo check
    }
}