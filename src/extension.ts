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
import { DefaultFileCreator } from "./fs/DefaultFileCreator";
import { DefaultActionFactory } from "./context/DefaultActionFactory";
import { Extension } from "./utils/Extension";
import { FileCreator } from "./fs/FileCreator";
import { Path } from "./utils/Path";

/**
 * Entry point of this extension
*/
class Host implements Extension, vscode.Disposable {
    private readonly logger: Logger;
    private readonly disposables: vscode.Disposable[] = [];

    public readonly id: string;
    public readonly name: string;
    public readonly version: string;
    public readonly extensionDir: Path;

    public constructor(
        extensionContext: vscode.ExtensionContext,
    ) {
        this.id = extensionContext.extension.id;
        this.name = extensionContext.extension.packageJSON.name;
        this.version = extensionContext.extension.packageJSON.version;
        this.extensionDir = new Path(extensionContext.extension.extensionUri, vscode.FileType.Directory);

        this.logger = this.createLogger();

        try {
            this.logger.info("Initializing...");
            this.logger.info(`Version: ${this.version}`);

            const config = new Config(this);

            const fsService = this.registerObject<FileSystemService>(
                new DefaultFileSystemService(this.logger)
            );
            const fileCreator = this.registerObject<FileCreator>(
                new DefaultFileCreator(this.logger, this, fsService)
            );
            const dotnetService = this.registerObject<DotnetService>(
                new DotnetService(this.logger)
            );
            const actionFactory = this.registerObject<ActionFactory>(
                new DefaultActionFactory(this.logger, config, fsService, fileCreator)
            );

            const csharpContextHandler = this.registerObject<ContextHandler>(
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
                    this,
                    config,
                    contextBuilder,
                    fsService
                )
            );

            new RunOnEditorCommand(this.logger, this, extensionContext, fsService, wizard);
            new RunOnExplorerCommand(this.logger, this, extensionContext, fsService, wizard);
            new WizardAcceptMoveFocusCommand(this, extensionContext, wizard);
            new WizardAcceptKeepFocusCommand(this, extensionContext, wizard);

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

    private createLogger(): Logger {
        const loggerChannel = vscode.window.createOutputChannel(this.name, { log: true });

        this.disposables.push(loggerChannel);

        return new Logger(Utils.getTypeName(this), loggerChannel);
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
    context.subscriptions.push(new Host(context));
}