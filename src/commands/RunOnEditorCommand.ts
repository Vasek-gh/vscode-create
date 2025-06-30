import * as vscode from "vscode";
import process from "process";
import Handlebars from "handlebars";
import { Logger } from "../tools/Logger";
import { FileSystemService } from "../services/fs/FileSystemService";
import { Path } from "../tools/Path";
import { Shell } from "../tools/Shell";
import { Wizard } from "../wizard/Wizard";
import { Utils } from "../tools/Utils";
import { Config } from "../configuration/Config";
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
            const p = process.pid;

            console.log(editor.document.uri.path);
            for (const folder of vscode.workspace.workspaceFolders ?? []) {
                console.log(folder.uri.path);
            }

            const a = vscode.extensions.all;

            const allCommands = await vscode.commands.getCommands();
            const selfCommands = allCommands.filter(c => c.startsWith("vscode-create"));

            logger.info('Run cmd');

            const cmdRes = await vscode.commands.executeCommand("vscode-create.test", InputInfo.parse("ff.cs"));

            logger.info(`Run cmd end ${cmdRes}`);

            logger.info('Run cmd 2');
            await vscode.commands.executeCommand("revealInExplorer", path.uri);
            logger.info(`Run cmd 2 end`);

            return;

            for (const folder of vscode.workspace.workspaceFolders ?? []) {
                console.log(folder.uri);
            }

            const version = extensionCtx.extension.packageJSON.version;
            const extensionId = extensionCtx.extension.packageJSON.name;
            const extension = vscode.extensions.getExtension("vscode-create");



            const iii = InputInfo.parse("\\dir/dir\\dir\\");

            const wsRootDir = fsService.getRootDirectory(path) ?? path;

            const vars2 = new Map<string, unknown>();
            const csproj = wsRootDir.appendFile("SampleProject", "SampleProject.csproj");
            vars2.set("csproj", {
                filename: csproj.fullPath.substring(wsRootDir.fullPath.length + 1),
                filenameFull: csproj.fullPath,
                directory: csproj.getDirectory().fullPath.substring(wsRootDir.fullPath.length + 1),
                directoryFull: csproj.getDirectory().fullPath,
                namespace: "Qwerty.Cli"
            });
        }));
    }
}