import * as vscode from "vscode";
import { Logger } from "../utils/Logger";
import { Path } from "../utils/Path";
import { Context } from "../context/Context";
import { ContextBuilder } from "../context/ContextBuilder";
import { Action } from "../actions/Action";
import { SuggestionAction } from "../actions/SuggestionAction";
import { FileSystemService } from "../services/fs/FileSystemService";
import { InputInfo } from "../actions/InputInfo";
import { Config } from "../configuration/Config";
import { Utils } from "@src/utils/Utils";
import { Extension } from "@src/utils/Extension";

interface QuickPickItem extends vscode.QuickPickItem {
    execute(ctx: Context): Promise<Path | undefined>;
}

export class Wizard implements vscode.Disposable {
    private readonly logger: Logger;

    private ctx?: Context;
    private quickPick?: vscode.QuickPick<vscode.QuickPickItem>;

    public constructor(
        logger: Logger,
        private readonly extension: Extension,
        private readonly config: Config,
        private readonly contextBuilder: ContextBuilder,
        private readonly fsService: FileSystemService
    ) {
        this.logger = logger.create(this);
    }

    public dispose(): void {
        this.logger.trace("Dispose");
        this.hide();
    }

    public async show(path: Path): Promise<void> {
        this.logger.trace(`Show path: ${path}`);

        this.config.reload(path);

        if (this.ctx) {
            this.logger.warn("Showing when have context");
        }

        await this.showQuickPick(path);
    }

    public async accept(hide: boolean, keepFocus: boolean): Promise<void> {
        this.logger.trace(`Accept hide: ${hide} keepFocus: ${keepFocus} `);
        if (!this.ctx) {
            this.logger.error("Accepting when no context"); // todo show error
            return;
        }

        if (!this.quickPick) {
            this.logger.error("Accepting when no quick pick"); // todo show error
            return;
        }

        if (this.quickPick.selectedItems.length > 0) {
            const selectedItem = this.quickPick.selectedItems[0] as QuickPickItem;
            const newFile = await selectedItem.execute(this.ctx);
            if (newFile) {
                await vscode.window.showTextDocument(newFile.uri);
            }
        }

        if (hide) {
            this.hide();
        }
        else {
            await this.showQuickPick(this.ctx.path);
        }
    }

    private hide(): void {
        this.logger.trace("Hide");
        this.ctx = undefined;
        this.quickPick?.hide();
        this.quickPick?.dispose();
        this.quickPick = undefined;
        this.setActiveState(false);
    }

    private async showQuickPick(path: Path): Promise<void> {
        this.logger.trace("Show QuickPick");

        let value = "";
        if (this.quickPick) {
            value = this.quickPick.value;
            this.hide();
        }

        const rootDir = this.fsService.getRootDirectory(path);
        if (!rootDir) {
            this.logger.error(`Current path is outside workspace: ${path}`); // todo show error
            return;
        }

        this.setActiveState(true);

        this.ctx = await this.contextBuilder.run(path);

        const relativePath = "./" + path.getDirectory().getRelative(rootDir);

        this.quickPick = vscode.window.createQuickPick();
        this.quickPick.title = `New in: ${relativePath}`;
        this.quickPick.placeholder = "Start typing a file name or filter";
        this.quickPick.keepScrollPosition = true;
        this.quickPick.ignoreFocusOut = true; // todo kill
        (this.quickPick as any).sortByLabel = false;

        this.quickPick.onDidHide(() => {
            this.logger.trace("OnDidHide");
            this.hide();
        });

        this.quickPick.onDidAccept(async () => {
            this.logger.trace("OnDidAccept");
            await this.accept(false/* todo true */, false);
        });

        this.quickPick.onDidChangeValue((value) => {
            this.applyValue(value);
        });

        this.quickPick.value = value;
        this.quickPick.show();

        this.logger.trace("QuickPick opened");
    }

    private applyValue(input: string): void {
        if (this.ctx && this.quickPick) {
            const inputInfo = InputInfo.parse(input);
            this.quickPick.items = this.createItems(inputInfo);
            this.quickPick.title = this.ctx.path.toString();
        }
    }

    private createItems(input: InputInfo): vscode.QuickPickItem[] {
        return [
            ...this.createSuggestionsItems(input),
            ...this.createCommandsItems(input)
        ];
    }

    private createCommandsItems(input: InputInfo): vscode.QuickPickItem[] {
        if (!this.ctx || input.template !== undefined) {
            return [];
        }

        return [
            {
                label: "Commands",
                kind: vscode.QuickPickItemKind.Separator
            },
            ...this.ctx.getCommands().map(cmd => this.createItem(cmd, false, cmd.iconPath))
        ];
    }

    private createSuggestionsItems(input: InputInfo): vscode.QuickPickItem[] {
        const result: vscode.QuickPickItem[] = [];

        const suggestions = this.createSuggestions(input);
        for (const suggestion of suggestions) {
            suggestion.applyInput(input);

            const commands = suggestion.getTemplateCommands();
            if (input.template === undefined || commands.length === 0) {
                result.push(this.createItem(suggestion, true, undefined));
            }
            else {
                const commands = suggestion.getTemplateCommands();
                for (const command of commands) {
                    result.push(this.createItem(command, true, undefined));
                }
            }
        }

        return result;
    }

    private createSuggestions(input: InputInfo): SuggestionAction[] {
        if (!this.ctx) {
            return [];
        }

        if (input.directory && !input.name && !input.extension) {
            return [this.ctx.getFolderAction()];
        }

        // todo fix file without extnsion
        if (input.name) {
            if (input.extension) {
                return [this.ctx.getExtensionSuggestion(input.extension)];
            }
            else {
                return this.ctx.getDefaultSuggestions();
            }
        }

        return [];
    }

    private createItem(action: Action, alwaysShow: boolean, iconPath?: vscode.IconPath): QuickPickItem {
        return {
            label: action.value,
            description: action.description,
            detail: action.detail,
            alwaysShow: alwaysShow,
            // iconPath: iconPath, // todo
            iconPath: vscode.ThemeIcon.File,
            execute(ctx): Promise<Path | undefined> {
                return action.execute(ctx);
            },
        };
    }

    private setActiveState(value: boolean): void {
        this.logger.trace(`Set active state: ${value}`);
        vscode.commands.executeCommand("setContext", `${this.extension.name}.wizard.active`, value);
    }
}