import { ActionDisplayDescriptor } from "./Protocol";
import * as vscode from "vscode";

/**
 *
 */
export interface CommandActionApi {
    readonly iconPath?: vscode.IconPath;
    // readonly path?: Path;
    getDisplayInfo(): ActionDisplayDescriptor;
    // execute(context: Context): Promise<Path>;
}


/**
 *
 */
export interface SuggestionActionApi {
    readonly extension: string;
    /* getDisplayInfo(inputInfo: InputInfo): ActionDisplayDescriptor; */
}