import * as vscode from "vscode";
import path from "path";
import { Logger } from "@src/tools/Logger";
import { FileSystemService } from "@src/services/FileSystemService";
import { Wizard } from "@src/wizard/Wizard";
import { Extension } from "@src/tools/Extension";
import { Path } from "@src/tools/Path";

export class RunOnExplorerCommand {
    private readonly logger: Logger;
    private readonly fsService: FileSystemService;
    private readonly wizard: Wizard;

    public constructor(
        logger: Logger,
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
        fsService: FileSystemService,
        wizard: Wizard,
    ) {
        this.logger = logger.create(this);
        this.fsService = fsService;
        this.wizard = wizard;

        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.run-on-explorer-at-root`, async () => {
            this.logger.trace("Execute at root");
            if (!vscode.workspace.workspaceFolders) {
                this.logger.trace("Skipping because: Empty workspace");
                return;
            }

            if (vscode.workspace.workspaceFolders.length !== 1) {
                this.logger.trace("Skipping because: To many workspaces");
                return;
            }

            await this.execute(vscode.workspace.workspaceFolders[0].uri);
        }));

        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.run-on-explorer-at-resource`, async (file: vscode.Uri | undefined, selectedFiles: vscode.Uri[]) => {
            this.logger.trace("Execute at resource");

            if (!file) {
                this.logger.trace("Argument 'file' is not assigned. Trying to get it through workaround...");
                file = await RunOnExplorerCommand.getSelectionFile();
                selectedFiles = file ? [file] : [];
            }

            if (!file || selectedFiles.length > 1) {
                this.logger.trace("Unable to determine where to create the file");
                return;
            }

            await this.execute(file);
        }));
    }

    private async execute(uri: vscode.Uri): Promise<void> {
        this.logger.trace(`Command will be executed for ${uri}`);
        const pathError = Path.validate(uri);
        if (pathError) {
            this.logger.error(pathError);
            return;
        }

        const path = await this.fsService.getPath(uri);

        await this.wizard.show(path);
    }

    // workaround for https://github.com/microsoft/vscode/issues/3553
    private static async getSelectionFile(): Promise<vscode.Uri | undefined> {
        const originalClipboard = await vscode.env.clipboard.readText();
        await vscode.commands.executeCommand("copyFilePath");
        const clipboardText = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(originalClipboard);

        const selectedItems = clipboardText.split("\n");
        if (selectedItems.length === 0) {
            return undefined;
        }

        return RunOnExplorerCommand.getUri(selectedItems[0].trimEnd());
    }

    private static getUri(filename: string): vscode.Uri {
        if (process.platform !== "win32") {
            return vscode.Uri.file(filename);
        }

        const parsedPath = path.parse(filename);
        const parsedRoot = parsedPath.root.toLowerCase();

        parsedPath.root = parsedRoot;
        parsedPath.dir = parsedRoot + parsedPath.dir.substring(parsedRoot.length);

        return vscode.Uri.file(path.format(parsedPath));
    }
}
