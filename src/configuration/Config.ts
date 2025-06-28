import * as vscode from "vscode";
import { ExtensionConfig } from "./ExtensionConfig";
import { Path } from "@src/shared/Path";
import { Extension } from "@src/tools/Extension";

type ExtensionsConfig = {
    [index:string]: ExtensionConfig | undefined;
};

export class Config {
    private root: vscode.WorkspaceConfiguration;
    private extensions: {
        [index:string]: ExtensionConfig | undefined;
    };

    public constructor(
        private readonly extension: Extension
    ) {
        this.root = vscode.workspace.getConfiguration();
        this.extensions = {};

        this.reload();
    }

    // todo cache + onDidChangeConfiguration
    public reload(path?: Path): void {
        this.root = path
            ? vscode.workspace.getConfiguration(this.extension.name, path.uri)
            : vscode.workspace.getConfiguration(this.extension.name);

        this.extensions = this.root.get<ExtensionsConfig>("extensions") ?? {};
    }

    public get<T>(section: string): T | undefined {
        return this.root.get<T>(section);
    }

    public getExtension(extension: string): ExtensionConfig {
        return this.extensions[extension] ?? {};
    }
}