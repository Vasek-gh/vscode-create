import * as vscode from "vscode";
import { Wizard } from "../services/wizard/Wizard";

export class WizardAcceptMoveFocusCommand {
    public constructor(
        ctx: vscode.ExtensionContext,
        extensionId: string,
        wizard: Wizard,
    ) {
        ctx.subscriptions.push(vscode.commands.registerCommand(`${extensionId}.accept-move-focus`, async () => {
            await wizard.accept(false, false);
        }));
    }
}