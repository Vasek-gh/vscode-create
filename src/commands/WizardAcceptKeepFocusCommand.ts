import * as vscode from "vscode";
import { Wizard } from "@src/services/wizard/Wizard";
import { Utils } from "@src/utils/Utils";

export class WizardAcceptKeepFocusCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        wizard: Wizard,
    ) {
        ctx.subscriptions.push(vscode.commands.registerCommand(`${Utils.extensionId}.accept-keep-focus`, async () => {
            await wizard.accept(false, true);
        }));
    }
}
