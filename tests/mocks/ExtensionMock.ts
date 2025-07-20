import * as vscode from "vscode";
import { Extension } from "@src/tools/Extension";
import { Path } from "@src/tools/Path";

export class ExtensionMock implements Extension {
    public readonly id: string = "vs-marketplace-vasek.vscode-create";
    public readonly name: string = "vscode-create";
    public readonly version: string = "0.0.0";
    public readonly extensionDir: Path;

    public static readonly instance: Extension = new ExtensionMock();

    public constructor() {
        const extension = vscode.extensions.getExtension(this.id);
        if (!extension) {
            throw new Error("Extension object not found");
        }

        this.extensionDir = Path.fromDir(extension.extensionUri);
    }
}