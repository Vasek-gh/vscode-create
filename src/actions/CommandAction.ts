import * as vscode from "vscode";
import { Action } from "./Action";

export interface CommandAction extends Action {
    iconPath?: vscode.IconPath;
}