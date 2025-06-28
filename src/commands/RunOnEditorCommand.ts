import * as vscode from "vscode";
import process from "process";
import Handlebars from "handlebars";
import { Logger } from "../tools/Logger";
import { FileSystemService } from "../services/fs/FileSystemService";
import { Path } from "../shared/Path";
import { Shell } from "../tools/Shell";
import { Wizard } from "../wizard/Wizard";
import { Utils } from "../tools/Utils";
import { Config } from "../configuration/Config";
import { InputInfo } from "@src/shared/InputInfo";
import { Extension } from "../tools/Extension";
/*
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 0: d:\Src\SampleProject\Test.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 0: d:\Src\SampleProject\SampleProject.sln
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 0: d:\Src\SampleProject\  test.txt
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SampleProject.csproj
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\Program1.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Test.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\test.bat
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\SomeClass.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\QwertyEnum.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Q.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\IQwerty.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Ftre.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Cvbn.cs
2025-06-25 20:07:02.347 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Class5.cs
2025-06-25 20:07:02.348 [info] [RunOnEditorCommand] 1: d:\Src\SampleProject\SampleProject\SomeFolder\Class1.cs


SampleProject
SampleProject/SampleProject
SampleProject/SampleProject/SomeFolder
*/



function getLevelPath(path: string): number {
    if (path === "") {
        return 0;
    }

    let result = 0;
    for (const char of path) {
        if (char === "/") {
            result++;
        }
    }

    return result + 1;
}

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


            logger.info("S3");
            {
                const wsRoot = await fsService.getRootDirectory(path);
                if (!wsRoot) {
                    throw new Error("qqq");
                }

                let levels = 2;
                let currentDir = path.getDirectory();
                const patterns = ["*", `${currentDir.getRelative(wsRoot)}/*/*`];
                while (!wsRoot?.isSame(currentDir)) {
                    patterns.push(`${currentDir.getRelative(wsRoot)}/*`);
                    currentDir = currentDir.getParentDirectory();
                    levels++;
                }

                let files = (await vscode.workspace.findFiles(
                    new vscode.RelativePattern(wsRoot.uri, `{${patterns.join(",")}}`)
                )).map(f => Path.fromFile(f));

                logger.info("S3.1");

                const levelArr: Array<Array<Path>> = new Array<Array<Path>>(levels);
                for (let index = 0; index < levelArr.length; index++) {
                    levelArr[index] = [];
                }

                /*files = files.sort((a, b) => {
                    const aDir = a.getDirectory();
                    const bDir = b.getDirectory();
                    if (aDir.isSame(bDir)) {
                        return a > b ? -1 : 1;
                    }

                    return b.length - a.length;
                });*/

                for (const file of files) {
                    const relative = file.getDirectory().getRelative(wsRoot);
                    const pathLevel = getLevelPath(relative);
                    //logger.info(`${pathLevel}: ${relative}`);
                    levelArr[pathLevel].push(file);
                }

                let index = 0;
                for (const level of levelArr) {
                    for (const path of level) {
                        logger.info(`${index}: ${path}`);
                    }
                    index++;
                }

                if (files.length > 0) {
                    logger.info(files[0].toString());
                }
            }

            logger.info("E3");


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