import * as vscode from "vscode";
import { Context } from "../context/Context";
import { Logger } from "../utils/Logger";
import { BaseAction } from "./BaseAction";
import { SuggestionAction } from "./SuggestionAction";
import { InputInfo } from "./InputInfo";
import { CommandAction } from "./CommandAction";
import { FileSystemService } from "../fs/FileSystemService";

export class FolderSuggestion extends BaseAction implements SuggestionAction {
    private folder?: string;
    private template?: string;
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly fsService: FileSystemService
    ) {
        super("", "", undefined);

        this.logger = logger.create(this);
    }

    public async execute(ctx: Context): Promise<void> {
        if (!this.folder) {
            throw new Error("Folder is not set");
        }

        this.logger.trace(`Execute folder: ${this.folder} dir: ${ctx.dir}`);

        const folderPath = ctx.dir.appendDir(this.folder);

        await this.fsService.createDir(folderPath);
        await vscode.commands.executeCommand("revealInExplorer", folderPath.uri);
    }

    public applyInput(input: InputInfo): void {
        if (!input.directory || input.name) {
            this.logger.warn("Current input is not a folder");
        }

        this.folder = input.directory;
        this.template = input.template;

        this.value = this.folder ?? "";
        this.description = `Create folder ${this.folder}`;
    }

    public getTemplateCommands(): CommandAction[] {
        return [];
    }
}