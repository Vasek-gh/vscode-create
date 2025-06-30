import * as vscode from "vscode";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Context } from "@src/context/Context";
import { InputInfo } from "@src/actions/InputInfo";
import { Path } from "@src/tools/Path";
//import { Path } from "../shared/Path";
//import { Context } from "@src/shared/Context";
//import { InputInfo } from "@src/shared/InputInfo";

//export { Path } from "../shared/Path";
//export { Context } from "@src/shared/Context";

export { ActionDisplayDescriptor } from "@src/api/Protocol";

    //export const x: 1;
    //export { Context } from "@src/shared/Context";



    interface ActionDisplayDescriptor {
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

interface SuggestionActionDescriptor {
    readonly uuid: string;
    readonly extension: string;

    readonly getDisplayInfoCommandId: string;
}

interface CommandActionApi {
    readonly iconPath?: vscode.IconPath;
    getDisplayInfo(): ActionDisplayDescriptor;
    execute(context: Context): Promise<Path>;
}

interface SuggestionActionApi {
    readonly extension: string;
    getDisplayInfo(inputInfo: InputInfo): ActionDisplayDescriptor;
}

interface ActionProviderGetLevelRequest {
    readonly uuid: string;
}

interface ActionProviderGetLevelResponse {
    readonly level: number | undefined;
}

interface ActionProviderGetCommandsRequest {
    readonly uuid: string;
    readonly context: Context;
}

interface ActionProviderGetCommandsRequest {
    readonly uuid: string;
    readonly context: Context;
}

interface ActionProviderGetCommandsRequest {
    readonly uuid: string;
    readonly context: Context;
}

interface ActionProviderGetCommandsResponse {
    readonly commands: CommandActionDescriptor[];
}

interface ActionProviderGetSuggestionsRequest {
    readonly uuid: string;
    readonly context: Context;
}

interface ActionProviderGetSuggestionsResponse {
    readonly suggestions: SuggestionActionDescriptor[];
}

interface CommandExecuteRequest {
    readonly uuid: string;
    readonly context: Context;
}

interface CommandExecuteResponse {
    readonly path: Path | undefined;
}

interface CommandGetDisplayinfoRequest {
    readonly uuid: string;
}

interface CommandGetDisplayinfoResponse {
    readonly descriptor: ActionDisplayDescriptor;
}

interface SuggestionGetDisplayinfoRequest {
    readonly uuid: string;
    readonly inputInfo: InputInfo;
}

interface SuggestionGetDisplayinfoResponse {
    readonly descriptor: ActionDisplayDescriptor;
}

interface ActionProviderApi {
    getLevel(): number | undefined;
    getCommands(context: Context): Promise<CommandActionApi[]>;
    getSuggestions(context: Context): Promise<SuggestionActionApi[]>;
}

interface ActionProviderDiscriptor {
    uuid: string;
    getLevelCommandId: string;
    getCommandsCommandId: string;
    getSuggestionsCommandId: string;
}

interface HostApi {
    registerActionProvider(actionProvider: ActionProviderApi): Promise<void>;
    registerExtensionConfiguration(section: string): Promise<void>;
}

class UuidGenerator {
    private counter: number = Number.MIN_VALUE;

    public generate(): string {
        return (this.counter++).toString();
    }
}

class ClientCommands {
    private static readonly prefix = "vscode-create-api-client";

    public static readonly actionProviderGetLevel = `${this.prefix}.actionProvider.getLevel`;
    public static readonly actionProvidergetCommands = `${this.prefix}.actionProvider.getCommands`;
    public static readonly actionProvidergetSuggestions = `${this.prefix}.actionProvider.getSuggestions`;

    public static readonly commandActionGetDisplayinfo = `${this.prefix}.commandAction.getDisplayinfo`;
    public static readonly commandActionExecute = `${this.prefix}.commandAction.execute`;

    public static readonly suggestionActionGetDisplayinfo = `${this.prefix}.suggestionAction.getDisplayinfo`;
}

class ActionProviderHolder {
    private readonly uuidGenerator: UuidGenerator;
    private readonly commands: Map<string, CommandActionApi>;
    private readonly suggestinos: Map<string, SuggestionActionApi>;
    private readonly actionProviders: Map<string, ActionProviderApi>;

    public constructor(
        private readonly extensionContext: vscode.ExtensionContext
    ) {
        this.uuidGenerator = new UuidGenerator();
        this.commands = new Map<string, CommandActionApi>();
        this.suggestinos = new Map<string, SuggestionActionApi>();
        this.actionProviders = new Map<string, ActionProviderApi>();

        this.registerClientCommand(ClientCommands.actionProviderGetLevel, (message: ActionProviderGetLevelRequest): ActionProviderGetLevelResponse | null => {
            const provider = this.actionProviders.get(message.uuid);
            if (!provider) {
                return null;
            }

            return {
                level: provider.getLevel()
            };
        });

        this.registerClientCommand(ClientCommands.actionProvidergetCommands, async (request: ActionProviderGetCommandsRequest): Promise<ActionProviderGetCommandsResponse | null> => {
            const provider = this.actionProviders.get(request.uuid);
            if (!provider) {
                return null;
            }

            const commands = await provider.getCommands(request.context);
            if (!commands) {
                return null;
            }

            return {
                commands: this.addCommands(commands)
            };
        });

        this.registerClientCommand(ClientCommands.actionProvidergetSuggestions, async (request: ActionProviderGetSuggestionsRequest): Promise<ActionProviderGetSuggestionsResponse | null> => {
            const provider = this.actionProviders.get(request.uuid);
            if (!provider) {
                return null;
            }

            const suggestinos = await provider.getSuggestions(request.context);
            if (!suggestinos) {
                return null;
            }

            return {
                suggestions: this.addSuggestions(suggestinos)
            };
        });

        this.registerClientCommand(ClientCommands.commandActionGetDisplayinfo, async (request: CommandGetDisplayinfoRequest): Promise<CommandGetDisplayinfoResponse | null> => {
            const command = this.commands.get(request.uuid);
            if (!command) {
                return null;
            }

            return {
                descriptor: command.getDisplayInfo()
            };
        });

        this.registerClientCommand(ClientCommands.commandActionExecute, async (request: CommandExecuteRequest): Promise<CommandExecuteResponse | null> => {
            const command = this.commands.get(request.uuid);
            if (!command) {
                return null;
            }

            return {
                path: await command.execute(request.context)
            };
        });

        this.registerClientCommand(ClientCommands.suggestionActionGetDisplayinfo, async (request: SuggestionGetDisplayinfoRequest): Promise<SuggestionGetDisplayinfoResponse | null> => {
            const suggestinos = this.suggestinos.get(request.uuid);
            if (!suggestinos) {
                return null;
            }

            return {
                descriptor: await suggestinos.getDisplayInfo(request.inputInfo)
            };
        });
    }

    public addProvider(actionProvider: ActionProviderApi): void {
        const instanceUuid = this.uuidGenerator.generate();
        this.actionProviders.set(instanceUuid, actionProvider);
    }

    private addCommands(commands: CommandActionApi[]): CommandActionDescriptor[] {
        this.commands.clear();

        const result: CommandActionDescriptor[] = [];
        for (const command of commands) {
            const instanceUuid = this.uuidGenerator.generate();
            this.commands.set(instanceUuid, command);

            result.push({
                uuid: instanceUuid,
                iconPath: command.iconPath,
                getDisplayInfoCommandId: ClientCommands.commandActionGetDisplayinfo,
                executeCommandId: ClientCommands.commandActionExecute
            });
        }

        return result;
    }

    private addSuggestions(suggestions: SuggestionActionApi[]): SuggestionActionDescriptor[] {
        this.commands.clear();

        const result: SuggestionActionDescriptor[] = [];
        for (const suggestion of suggestions) {
            const instanceUuid = this.uuidGenerator.generate();
            this.suggestinos.set(instanceUuid, suggestion);

            result.push({
                uuid: instanceUuid,
                extension: suggestion.extension,
                getDisplayInfoCommandId: ClientCommands.suggestionActionGetDisplayinfo,
            })
        }

        return result;
    }

    private registerClientCommand(id: string, callback: (...args: any[]) => any): void {
        const command = vscode.commands.registerCommand(id, callback);
        this.extensionContext.subscriptions.push(command);
    }
}

class HostApi {
    constructor() {

    }
/*
    public registerActionProvider(actionProvider: ActionProviderApi): Promise<void> {

    }

    public registerExtensionConfiguration(section: string): Promise<void> {

    }*/
}