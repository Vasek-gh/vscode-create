import * as vscode from "vscode";
import { Context } from "@src/shared/Context";
import { Logger } from "@src/tools/Logger";
import { BaseAction } from "./BaseAction";
import { SuggestionAction } from "@src/shared/SuggestionAction";
import { InputInfo } from "@src/shared/InputInfo";
import { CommandAction } from "@src/shared/CommandAction";
import { FileSystemService } from "@src/services/fs/FileSystemService";
import { Path } from "@src/shared/Path";

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

    public async execute(ctx: Context): Promise<Path | undefined> {
        if (!this.folder) {
            throw new Error("Folder is not set");
        }

        this.logger.trace(`Execute folder: ${this.folder} dir: ${ctx.currentDir}`);

        const folderPath = ctx.currentDir.appendDir(this.folder);

        await this.fsService.createDir(folderPath);
        await vscode.commands.executeCommand("revealInExplorer", folderPath.uri);

        return undefined;
    }

    public applyInput(input: InputInfo): void {
        this.invalidate();
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

    private invalidate(): void {
        this.value = "<invalid>";
        this.description = "<invalid>";
        this.folder = undefined;
        this.template = undefined;
    }
}