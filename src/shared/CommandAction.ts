import * as vscode from "vscode";
import { Action } from "@src/shared/Action";

export interface CommandAction extends Action {
    iconPath?: vscode.IconPath;
}