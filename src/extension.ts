import * as vscode from "vscode";
import { FileSystemService } from "./fs/FileSystemService";
import { DefaultFileSystemService } from "./fs/DefaultFileSystemService";
import { Wizard } from "./services/wizard/Wizard";
import { RunOnExplorerCommand } from "./commands/RunOnExplorerCommand";
import { Logger } from "./utils/Logger";
import { Utils } from "./utils/Utils";
import { CSharpContextHandler } from "./services/csharp/CSharpContextHandler";
import { ContextBuilder } from "./context/ContextBuilder";
import { RunOnEditorCommand } from "./commands/RunOnEditorCommand";
import { DotnetService } from "./services/dotnet/DotnetService";
import { ContextHandler } from "./context/ContextHandler";
import { WizardAcceptMoveFocusCommand } from "./commands/WizardAcceptMoveFocusCommand";
import { WizardAcceptKeepFocusCommand } from "./commands/WizardAcceptKeepFocusCommand";
import { Config } from "./configuration/Config";
import { ActionFactory } from "./actions/ActionFactory";
import { FileCreator } from "./services/FileCreator";
import { DefaultActionFactory } from "./context/DefaultActionFactory";

/**
 * Entry point of this extension
*/
class Extension implements vscode.Disposable {
    private readonly logger: Logger;
    private readonly version: string;
    private readonly extensionId: string;
    private readonly disposables: vscode.Disposable[];

    public constructor(
        extensionContext: vscode.ExtensionContext,
    ) {
        this.version = extensionContext.extension.packageJSON.version;
        this.extensionId = extensionContext.extension.packageJSON.name;

        const config = new Config(this.extensionId);
        const loggerChannel = vscode.window.createOutputChannel(this.extensionId, { log: true });

        this.disposables = [
            loggerChannel
        ];

        this.logger = new Logger(Utils.getTypeName(this), loggerChannel);

        try {
            this.logger.info("Initializing...");
            this.logger.info(`Version: ${this.version}`);

            const fsService = this.registerService<FileSystemService, DefaultFileSystemService>(new DefaultFileSystemService());
            const fileCreator = this.registerObject<FileCreator>(new FileCreator(this.logger, extensionContext, fsService));
            const dotnetService = this.registerObject<DotnetService>(new DotnetService(this.logger));
            const actionFactory = this.registerObject<ActionFactory>(new DefaultActionFactory(this.logger, config, fsService, fileCreator));

            const csharpContextHandler = this.registerService<ContextHandler, CSharpContextHandler>(
                new CSharpContextHandler(
                    this.logger,
                    config,
                    fsService,
                    actionFactory
                )
            );

            const contextBuilder = this.registerObject<ContextBuilder>(
                new ContextBuilder(
                    this.logger,
                    fsService,
                    actionFactory,
                    [
                        csharpContextHandler
                    ]
                )
            );

            const wizard = this.registerObject<Wizard>(
                new Wizard(
                    this.logger,
                    config,
                    this.extensionId,
                    contextBuilder,
                    fsService
                )
            );

            new RunOnEditorCommand(extensionContext, this.extensionId, this.logger, fsService, wizard);
            new RunOnExplorerCommand(extensionContext, this.extensionId, this.logger, fsService, wizard);
            new WizardAcceptMoveFocusCommand(extensionContext, this.extensionId, wizard);
            new WizardAcceptKeepFocusCommand(extensionContext, this.extensionId, wizard);

            this.logger.info("Initialization complete");
        }
        catch (e) {
            this.logger.exception(e, "Initialization fail");
            throw e;
        }
    }

    public dispose(): void {
        for (var disposable of this.disposables) {
            disposable.dispose();
        }

        this.logger.trace("Disposed");
    }

    private registerObject<TService>(object: TService): TService {
        var disposable = object as vscode.Disposable;
        if (disposable) {
            this.disposables.push(disposable);
        }

        return object;
    }

    private registerService<TService, TObject extends TService>(object: TObject): TService {
        var instance = object as TService;
        if (!instance) {
            this.logger.error("Init fail: Fail to convert object");
            throw new Error("Fail to convert object");
        }

        var disposable = object as vscode.Disposable;
        if (disposable) {
            this.disposables.push(disposable);
        }

        return instance;
    }
}

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(new Extension(context));
}