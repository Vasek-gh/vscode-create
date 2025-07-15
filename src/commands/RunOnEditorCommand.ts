import * as vscode from "vscode";
import process from "process";
import { Logger } from "../tools/Logger";
import { FileSystemService } from "../services/FileSystemService";
import { Path } from "../tools/Path";
import { Wizard } from "../wizard/Wizard";
import { Utils } from "../tools/Utils";
import { InputInfo } from "@src/actions/InputInfo";
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
                return;
            }
            var path = Path.fromFile(editor.document.uri);

            const stat1 = await fsService.getStat(path);
            const stat2 = await fsService.getStat(path.getDirectory());
            const p = process.pid;

            console.log(editor.document.uri.path);
            for (const folder of vscode.workspace.workspaceFolders ?? []) {
                console.log(folder.uri.path);
            }

            const a = vscode.extensions.all;

            const str = Utils.formatLitteral(`
                rwerewre
                 rerew
                qqqqq
                `);

            const allCommands = await vscode.commands.getCommands();
            const selfCommands = allCommands.filter(c => c.startsWith("vscode-create"));

            logger.info("Run cmd");

            const cmdRes = await vscode.commands.executeCommand("vscode-create.test", InputInfo.parse("ff.cs"));

            logger.info(`Run cmd end ${cmdRes}`);

            logger.info("Run cmd 2");
            await vscode.commands.executeCommand("revealInExplorer", path.uri);
            logger.info("Run cmd 2 end");

            return;

            for (const folder of vscode.workspace.workspaceFolders ?? []) {
                console.log(folder.uri);
            }

            const version = extensionCtx.extension.packageJSON.version;
            const extensionId = extensionCtx.extension.packageJSON.name;
            const extension = vscode.extensions.getExtension("vscode-create");
        }));
    }
}