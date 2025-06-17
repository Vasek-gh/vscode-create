import * as vscode from "vscode";
import Handlebars from "handlebars";
import { Logger } from "../utils/Logger";
import { FileSystemService } from "../fs/FileSystemService";
import { Path } from "../utils/Path";
import { Shell } from "../utils/Shell";
import { Wizard } from "../services/wizard/Wizard";
import { Utils } from "../utils/Utils";
import { Config } from "../configuration/Config";
import { InputInfo } from "../actions/InputInfo";
import { Extension } from "../utils/Extension";


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
            var path = new Path(editor.document.uri, vscode.FileType.File);


            await vscode.window.showWarningMessage("File exists. Overwrite?", {
                modal: true,
                detail: "These files will be overwritten:\n    qqq.txt\n    nnn.txt"
            }, "Overwrite");

            const wsRoot1 = fsService.getRootDirectory(path);
            const wsRoot2 = fsService.getRootDirectory(path.getParentDirectory());
            const wsRoot3 = fsService.getRootDirectory(path.getParentDirectory().getParentDirectory().getParentDirectory());

            const ex = await fsService.getStat(path.getDirectory().appendFile("qwerty.txt"));

            const wsEdit = new vscode.WorkspaceEdit();
            wsEdit.createFile(path.getDirectory().appendFile("qwerty.txt").uri, {
                //ignoreIfExists: true,
                contents: Buffer.from("ffff")
            });

            try {
                //await vscode.workspace.fs.writeFile(wsEdit);
                const r = await vscode.workspace.applyEdit(wsEdit, { isRefactoring: false });
                console.log(`Suc: ${r}`);
            }
            catch (e) {
                console.log(e);
            }

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

            /*
            await creator.create(
                path.getDirectory().appendFile("Test.cs"),
                "class",
                vars2
            )
            */

            /*
            await creator.create(
                path.getDirectory().appendFile("Test.cs"),
                "interface",
                vars2
            )

            await creator.create(
                path.getDirectory().appendFile("Test.txt"),
                "interface",
                vars2
            )
            */

            /*
            if (q) {
                const csConfig2 = q["cs"];
                const def = csConfig2.default;
                const goConfig2 = q["go"];
            }
            */

            /*
            workbench.explorer.fileView.open
            workbench.explorer.fileView.focus
            workbench.explorer.fileView.resetViewLocation

            editor.action.insertSnippet
            editor.action.showSnippets

            workbench.files.action.showActiveFileInExplorer
            */

            /*
            const commands = await vscode.commands.getCommands();
            logger.info(commands.join("\n"));
            */

            const template = Handlebars.compile(`
                {{join (split name "/") "."}}
                {{#if csproj}}
                namespace {{csproj.namespace}}{{replace (replace directory csproj.directory "") "/" "."}};
                {{else}}
                namespace {{replace directory "/" "."}};
                {{/if}}

                public {{denull csfile.type "class"}} {{filenameBase}}
                {
                }
            `);

            const vars = {
                name: "////dddd/dddd///dddd///",
                filename: "TestClass.cs",
                filenameBase: "TestClass",
                directory: "src/Qwerty.Cli/SomeDir/SomDir2",
                csfile: {
                    type: "interface"
                },
                csproj: {
                    filename: "Qwerty.Cli",
                    directory: "src/Qwerty.Cli",
                    namespace: "Qwerty.Cli",
                    ctxDirectory: "SomeDir/SomDir2",
                }
            };

            const result = template(vars);

            // await vscode.commands.executeCommand("revealInExplorer", path.getDirectory().uri); todo

            /*
            const wse = new vscode.WorkspaceEdit();
            wse.createFile(newFilename);
            await vscode.workspace.applyEdit(wse);
            await vscode.window.showTextDocument(newFilename);*/

            /*
            await vscode.workspace.fs.writeFile(newFilename, Buffer.from(''));
            const newEditor = await vscode.window.showTextDocument(newFilename);*/

            /*
            const completionList: vscode.CompletionList = await vscode.commands.executeCommand(
                'vscode.executeCompletionItemProvider',
                newEditor?.document.uri,
                newEditor?.selection.active
            );

            const snippets = completionList.items.filter(c => c.kind === vscode.CompletionItemKind.Snippet);
            for (const snippet of snippets) {
                const itemLabel = snippet.label as vscode.CompletionItemLabel;
                const label = itemLabel?.label ?? snippet.label as string ?? "";
                const snippetString = snippet.insertText as vscode.SnippetString

                if (label === "log" && snippetString ) {
                    newEditor.insertSnippet(snippetString);

                    return;
                }
            }

            await newEditor.document.save();*/
        }));
    }
}