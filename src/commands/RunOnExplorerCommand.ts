import * as vscode from "vscode";
import { Logger } from "../utils/Logger";
import { FileSystemService } from "../fs/FileSystemService";
import path from "path";
import { Wizard } from "../services/wizard/Wizard";

export class RunOnExplorerCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        extensionId: string,
        logger: Logger,
        fsService: FileSystemService,
        wizard: Wizard,
    ) {
        logger = logger.create(this);

        ctx.subscriptions.push(vscode.commands.registerCommand(`${extensionId}.run-on-explorer`, async (file: vscode.Uri | undefined, selectedFiles: vscode.Uri[]) => {
            logger.trace("Execute");

            if (!file) {
                file = await RunOnExplorerCommand.getSelectionFile();
                selectedFiles = file ? [file] : [];
            }

            if (!file || selectedFiles.length > 1) {
                return;
            }

            var path = await fsService.path(file);

            await wizard.show(path);
        }));
    }

    // workaround for https://github.com/microsoft/vscode/issues/3553
    private static async getSelectionFile(): Promise<vscode.Uri | undefined> {
        const originalClipboard = await vscode.env.clipboard.readText();
        await vscode.commands.executeCommand("copyFilePath");
        const clipboardText = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(originalClipboard);

        var selectedItems = clipboardText.split("\n");
        if (selectedItems.length === 0) {
            return undefined;
        }

        return RunOnExplorerCommand.getUri(selectedItems[0]);
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
