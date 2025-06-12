import { Extension } from "../../src/utils/Extension";

export class TestExtension implements Extension {
    public readonly id: string = "vs-marketplace-vasek.vscode-create";
    public readonly name: string = "vscode-create";
    public readonly version: string = "0.0.0";
}