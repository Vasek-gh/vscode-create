import * as vscode from "vscode";
import path from "path";
import { Logger } from "@src/utils/Logger";
import { FileSystemService } from "@src/fs/FileSystemService";
import { Wizard } from "@src/services/wizard/Wizard";
import { Utils } from "@src/utils/Utils";

export class RunOnExplorerCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        logger: Logger,
        fsService: FileSystemService,
        wizard: Wizard,
    ) {
        logger = logger.create(this);

        ctx.subscriptions.push(vscode.commands.registerCommand(`${Utils.extensionId}.run-on-explorer`, async (file: vscode.Uri | undefined, selectedFiles: vscode.Uri[]) => {
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
