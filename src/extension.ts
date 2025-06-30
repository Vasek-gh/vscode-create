import * as vscode from "vscode";
import { FileSystemService } from "./services/fs/FileSystemService";
import { DefaultFileSystemService } from "./services/fs/DefaultFileSystemService";
import { Wizard } from "./wizard/Wizard";
import { RunOnExplorerCommand } from "./commands/RunOnExplorerCommand";
import { Logger } from "./tools/Logger";
import { Utils } from "./tools/Utils";
import { ContextBuilder } from "./wizard/ContextBuilder";
import { RunOnEditorCommand } from "./commands/RunOnEditorCommand";
import { DotnetService } from "./services/dotnet/DotnetService";
import { WizardAcceptMoveFocusCommand } from "./commands/WizardAcceptMoveFocusCommand";
import { WizardAcceptKeepFocusCommand } from "./commands/WizardAcceptKeepFocusCommand";
import { Config } from "./configuration/Config";
import { ActionFactory } from "./actions/ActionFactory";
import { DefaultFileCreator } from "./services/fs/DefaultFileCreator";
import { ActionFactoryImpl } from "@src/actions/factory/ActionFactoryImpl";
import { Extension } from "./tools/Extension";
import { FileCreator } from "./services/fs/FileCreator";
import { Path } from "./tools/Path";
import { CSharpActionProviderFactory } from "./services/csharp/CSharpActionProviderFactory";
import { TestCommand } from "./commands/TestCommand";

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
        this.extensionDir = Path.fromDir(extensionContext.extension.extensionUri);

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
                new ActionFactoryImpl(this.logger, config, fsService, fileCreator)
            );

            const contextBuilder = this.registerObject<ContextBuilder>(
                new ContextBuilder(
                    this.logger,
                    fsService,
                    actionFactory,
                    [
                        new CSharpActionProviderFactory(
                            this.logger,
                            config,
                            fsService,
                            actionFactory
                        )
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

            new TestCommand(this.logger, this, extensionContext);

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