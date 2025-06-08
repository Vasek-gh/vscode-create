import * as vscode from "vscode";
import { Wizard } from "../services/wizard/Wizard";

export class WizardAcceptKeepFocusCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        extensionId: string,
        wizard: Wizard,
    ) {
        ctx.subscriptions.push(vscode.commands.registerCommand(`${extensionId}.accept-keep-focus`, async () => {
            await wizard.accept(false, true);
        }));
    }
}
