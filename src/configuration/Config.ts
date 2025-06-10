import * as vscode from "vscode";
import { ExtensionConfig } from "./ExtensionConfig";
import { TemplateConfig } from "./TemplateConfig";
import { Utils } from "@src/utils/Utils";

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
    ) {
        this.extensions = {};
        this.root = vscode.workspace.getConfiguration();

        this.reload();
    }

    public reload(): void {
        this.root = vscode.workspace.getConfiguration();
        const rootData = this.root.get<ConfigData>(Utils.extensionId) ?? { extensions: {} };

        this.extensions = rootData.extensions;
    }

    public get<T>(section: string): T | undefined {
        return this.root.get<T>(Utils.extensionId + "." + section);
    }

    public getExtension(extension: string): ExtensionConfig | undefined {
        return this.extensions[extension];
    }

    public getExtensionTemplate(extension: string, template: string): TemplateConfig | undefined {
        return this.extensions[extension]?.[template];
    }
}