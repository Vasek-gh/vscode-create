import * as vscode from "vscode";
import path from "path";
import { Logger } from "@src/tools/Logger";
import { FileSystemService } from "@src/services/fs/FileSystemService";
import { Wizard } from "@src/wizard/Wizard";
import { Extension } from "@src/tools/Extension";
import { Path } from "@src/shared/Path";

export class RunOnExplorerCommand {
    public constructor(
        logger: Logger,
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
        fsService: FileSystemService,
        wizard: Wizard,
    ) {
        logger = logger.create(this);

        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.run-on-explorer`, async (file: vscode.Uri | undefined, selectedFiles: vscode.Uri[]) => {
            logger.trace("Execute");

            if (!file) {
                logger.trace("Argument 'file' is not assigned. Trying to get it through workaround...");
                file = await RunOnExplorerCommand.getSelectionFile();
                selectedFiles = file ? [file] : [];
            }

            if (!file || selectedFiles.length > 1) {
                logger.trace("Unable to determine where to create the file");
                return;
            }

            logger.trace(`Command will be executed for ${file}`);
            const pathError = Path.validate(file);
            if (pathError) {
                logger.error(pathError);
                return;
            }

            var path = await fsService.getPath(file);

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
