import * as vscode from "vscode";
import { BaseAction } from "./BaseAction";
import { CommandAction } from "./CommandAction";
import { Context } from "../context/Context";

export class DelegateCommandAction extends BaseAction implements CommandAction {
    public constructor(
        label: string,
        description: string,
        detail: string | undefined,
        public readonly iconPath: vscode.IconPath | undefined,
        private readonly action: (context: Context) => Promise<void>
    ) {
        super(label, description, detail);
    }

    public execute(context: Context): Promise<void> {
        return this.action(context);
    }
}