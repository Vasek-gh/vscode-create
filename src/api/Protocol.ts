import * as vscode from "vscode";

export interface ActionDisplayDescriptor {
    readonly caption: string;
    readonly description?: string;
    readonly detail?: string;
}

interface CommandActionDescriptor {
    readonly uuid: string;
    readonly iconPath?: vscode.IconPath;

    readonly getDisplayInfoCommandId: string;
    readonly executeCommandId: string;
}

export interface SuggestionActionDescriptor {
    readonly uuid: string;
    readonly extension: string;

    readonly getDisplayInfoCommandId: string;
}