import * as vscode from "vscode";
import { Utils } from "./Utils";

export class Logger {
    private readonly categoryTitle;

    public constructor(
        private readonly category: string,
        private readonly channel?: vscode.LogOutputChannel
    ) {
        this.categoryTitle = `[${category}] `;
    }

    public trace(message: string): void {
        if (this.canShowLogLevel(vscode.LogLevel.Trace)) {
            this.channel?.trace(this.categoryTitle + message);
        }
    }

    public info(message: string): void {
        if (this.canShowLogLevel(vscode.LogLevel.Info)) {
            this.channel?.info(this.categoryTitle + message);
        }
    }

    public warn(message: string): void {
        if (this.canShowLogLevel(vscode.LogLevel.Warning)) {
            this.channel?.warn(this.categoryTitle + message);
        }
    }

    public error(message: string): void {
        if (this.canShowLogLevel(vscode.LogLevel.Error)) {
            this.channel?.error(this.categoryTitle + message);
        }
    }

    public exception(error: any, message?: string): void {
        let errorValue = "";
        if (message) {
            errorValue += message + ": ";
        }

        if (error.stack) {
            errorValue += error.stack;
        }
        else if (error.message) {
            errorValue += error.message;
        }

        this.error(errorValue);
    }

    public create<T>(obj: T): Logger {
        return new Logger(Utils.getTypeName<T>(obj), this.channel);
    }

    public createChild(category: string): Logger {
        return new Logger(`${this.category}.${category}`, this.channel);
    }

    private canShowLogLevel(level: vscode.LogLevel): boolean {
        const currentLevel = this.channel?.logLevel ?? vscode.LogLevel.Off;
        return currentLevel === vscode.LogLevel.Off
            ? false
            : currentLevel <= level;
    }
}