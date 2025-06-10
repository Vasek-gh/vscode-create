import * as vscode from "vscode";
import { Wizard } from "@src/services/wizard/Wizard";
import { Utils } from "@src/utils/Utils";

export class WizardAcceptMoveFocusCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        wizard: Wizard,
    ) {
        ctx.subscriptions.push(vscode.commands.registerCommand(`${Utils.extensionId}.accept-move-focus`, async () => {
            await wizard.accept(false, false);
        }));
    }
}