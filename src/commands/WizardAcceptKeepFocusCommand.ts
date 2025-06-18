import * as vscode from "vscode";
import { Wizard } from "@src/wizard/Wizard";
import { Extension } from "@src/utils/Extension";

export class WizardAcceptKeepFocusCommand {
    public constructor(
        extension: Extension,
        extensionCtx: vscode.ExtensionContext,
        wizard: Wizard,
    ) {
        extensionCtx.subscriptions.push(vscode.commands.registerCommand(`${extension.name}.accept-keep-focus`, async () => {
            await wizard.accept(false, true);
        }));
    }
}
