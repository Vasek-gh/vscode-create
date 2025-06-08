import * as vscode from "vscode";
import { Context } from "./Context";

export interface ContextHandler extends vscode.Disposable {
    getId(): string;
    handle(ctx: Context): Promise<void>;
}