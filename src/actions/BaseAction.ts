import * as vscode from "vscode";

export abstract class BaseAction {
    public constructor(
        public value: string,
        public description: string,
        public detail?: string
    ) {

    }
}