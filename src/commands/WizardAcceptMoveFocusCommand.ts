import * as vscode from "vscode";
import { Wizard } from "@src/wizard/Wizard";
import { Extension } from "@src/utils/Extension";

export class WizardAcceptMoveFocusCommand {
    public constructor(
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
        wizard: Wizard,
    ) {
        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.accept-move-focus`, async () => {
            await wizard.accept(false, false);
        }));
    }
}