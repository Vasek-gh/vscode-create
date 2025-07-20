import * as vscode from "vscode";
import { Logger } from "../tools/Logger";
import { FileSystemService } from "../services/FileSystemService";
import { Path } from "../tools/Path";
import { Wizard } from "../wizard/Wizard";
import { Extension } from "../tools/Extension";

export class RunOnEditorCommand {
    public constructor(
        logger: Logger,
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
        fsService: FileSystemService,
        wizard: Wizard,
    ) {
        logger = logger.create(this);

        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.run-on-editor`, async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                logger.trace("There is not active text editor");
                return;
            }

            const file = editor.document.uri;
            logger.trace(`Command will be executed for ${file}`);

            const pathError = Path.validate(file);
            if (pathError) {
                logger.error(pathError);
                return;
            }

            const path = await fsService.getPath(file);

            await wizard.show(path);
        }));
    }
}