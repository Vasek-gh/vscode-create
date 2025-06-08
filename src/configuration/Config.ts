import * as vscode from "vscode";
import { ExtensionConfig } from "./ExtensionConfig";
import { TemplateConfig } from "./TemplateConfig";

type ConfigData = {
    extensions: {
        [index:string]: ExtensionConfig | undefined;
    };
};

export class Config {
    private extensions: {
        [index:string]: ExtensionConfig | undefined;
    };

    public root: vscode.WorkspaceConfiguration;

    public constructor(
        private readonly extensionId: string,
    ) {
        this.extensions = {};
        this.root = vscode.workspace.getConfiguration();

        this.reload();
    }

    public reload(): void {
        this.root = vscode.workspace.getConfiguration();
        const rootData = this.root.get<ConfigData>(this.extensionId) ?? { extensions: {} };

        this.extensions = rootData.extensions;
    }

    public get<T>(section: string): T | undefined {
        return this.root.get<T>(this.extensionId + "." + section);
    }

    public getExtension(extension: string): ExtensionConfig | undefined {
        return this.extensions[extension];
    }

    public getExtensionTemplate(extension: string, template: string): TemplateConfig | undefined {
        return this.extensions[extension]?.[template];
    }
}