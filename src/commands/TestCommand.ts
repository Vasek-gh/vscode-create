import * as vscode from "vscode";
import process from "process";
import { Logger } from "../tools/Logger";
import { FileSystemService } from "../services/fs/FileSystemService";
import { Path } from "../tools/Path";
import { Wizard } from "../wizard/Wizard";
import { InputInfo } from "@src/actions/InputInfo";
import { Extension } from "../tools/Extension";

export class TestCommand {
    public constructor(
        logger: Logger,
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
    ) {
        logger = logger.create(this);

        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.test`, async (inputInfo: InputInfo): Promise<string> => {
            console.log(inputInfo);

            return "hello";
        }));
    }
}
