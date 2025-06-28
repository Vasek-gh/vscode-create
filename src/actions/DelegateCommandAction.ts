import * as vscode from "vscode";
import { BaseAction } from "./BaseAction";
import { CommandAction } from "@src/shared/CommandAction";
import { Context } from "@src/shared/Context";
import { Path } from "@src/shared/Path";

// todo kill ??
export class DelegateCommandAction extends BaseAction implements CommandAction {
    public constructor(
        label: string,
        description: string,
        detail: string | undefined,
        public readonly iconPath: vscode.IconPath | undefined,
        private readonly action: (context: Context) => Promise<Path | undefined>
    ) {
        super(label, description, detail);
    }

    public execute(context: Context): Promise<Path | undefined> {
        return this.action(context);
    }
}