import * as vscode from "vscode";
import { FileSystemService } from "@src/services/fs/FileSystemService";
import { Logger } from "@src/tools/Logger";
import { Path } from "@src/tools/Path";
import { Utils } from "@src/tools/Utils";
import { CsFileSuggestion } from "./CsFileSuggestion";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { CSharpVars } from "./CSharpVars";
import { CSharpConfig } from "./CSharpConfig";
import { ActionFactory } from "@src/actions/ActionFactory";
import { ActionProvider } from "@src/actions/ActionProvider";
import { Context } from "@src/context/Context";
import { FileLevel } from "@src/context/FileLevel";
import { Dictionary } from "@src/tools/Dictionary";

const CS_EXT: string = ".cs";
const XAML_EXT: string = ".xaml";
const XAML_CS_EXT: string = ".xaml.cs";
const AXAML_EXT: string = ".axaml";
const AXAML_CS_EXT: string = ".axaml.cs";

const CS_EXTENSIONS: string[] = [
    CS_EXT,
    XAML_EXT,
    XAML_CS_EXT,
    AXAML_EXT,
    AXAML_CS_EXT,
];

interface ExtensionInfo {
    value: string;
    count: number;
    csharp: boolean;
}

export class CSharpActionProvider implements ActionProvider {
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly config: CSharpConfig,
        private readonly level: number,
        private readonly csprojFile: Path,
        private readonly fsService: FileSystemService,
        private readonly actionFactory: ActionFactory,
    ) {
        this.logger = logger.create(this);
    }

    public getId(): string {
        return Utils.getTypeName(this);
    }

    public getLevel(): number | undefined {
        return this.level;
    }

    public getCommands(context: Context): Promise<CommandAction[]> {
        return Promise.resolve([]);
    }

    public async getSuggestions(context: Context): Promise<SuggestionAction[]> {
        if (!this.config.enableAll.get()) {
            return [];
        }

        const extensionInfos = this.getExtensionInfo(context);

        return extensionInfos.filter(ei => !ei.csharp).length === 0
            ? this.getCsharpSuggestions(extensionInfos)
            : [];
    }

    public async getTemplateVariables(context: Context): Promise<{ [key: string]: any }> {
        const result: { [key: string]: any } = {};
        if (!this.config.enableAll.get()) {
            return result;
        }

        result[CSharpVars.csproj] = {
            namespace: await this.getNamespace(),
            ...Utils.getFileVars(this.csprojFile, context.rootDir)
        };

        return result;
    }

    private getExtensionInfo(context: Context): ExtensionInfo[] {
        const csprojDir = this.csprojFile.getDirectory();
        let extensionInfos = this.getCurrentExtensionInfo(context, csprojDir);

        // в текущем пусто попробуем найти в родителе
        if (extensionInfos.length === 0) {
            extensionInfos = this.getParentExtensionInfo(context, csprojDir);
        }

        // в родителе пусто попробуем найти в братьях
        if (extensionInfos.length === 0) {
            extensionInfos = this.getLevelExtensionInfo(context, FileLevel.Siblings);
        }

        // если ни чего не нашли считаем
        if (extensionInfos.length === 0) {
            extensionInfos = [{
                value: ".cs",
                count: 1,
                csharp: true
            }];
        }

        return extensionInfos;
    }

    private getCurrentExtensionInfo(context: Context, csprojDir: Path): ExtensionInfo[] {
        const extensionInfos = this.getLevelExtensionInfo(context, FileLevel.Current);
        const primaryExtensionInfos = extensionInfos.filter(ei => ei.csharp);

        if (context.currentDir.isSame(csprojDir)) {
            return primaryExtensionInfos.length > 0
                ? primaryExtensionInfos
                : [{
                    value: ".cs",
                    count: 1,
                    csharp: true
                }];
        }

        return primaryExtensionInfos.length > 0
            ? primaryExtensionInfos
            : extensionInfos;
    }

    // todo refactoring with getCurrentExtensionInfo
    private getParentExtensionInfo(context: Context, csprojDir: Path): ExtensionInfo[] {
        const parentDir = context.currentDir.getParentDirectory();
        const extensionInfos = this.getLevelExtensionInfo(context, FileLevel.Parent);
        const primaryExtensionInfos = extensionInfos.filter(ei => ei.csharp);

        if (!parentDir.isSame(csprojDir) && primaryExtensionInfos.length === 0 && extensionInfos.length > 0) {
            return extensionInfos;
        }

        return primaryExtensionInfos.length > 0
            ? primaryExtensionInfos
            : [{
                value: ".cs",
                count: 1,
                csharp: true
            }];
    }

    private getLevelExtensionInfo(context: Context, level: FileLevel): ExtensionInfo[] {
        const map = new Dictionary<string, ExtensionInfo>();
        const files = context.files.getFiles(level);
        if (!files) {
            return [];
        }

        for (const file of files) {
            const filename = file.getFileName();

            let extension = CS_EXTENSIONS.find(e => filename.endsWith(e));
            const isPrimary = extension !== undefined;

            if (extension === CS_EXT && filename.endsWith(XAML_CS_EXT)) {
                extension = XAML_CS_EXT;
            }

            if (extension === CS_EXT && filename.endsWith(AXAML_CS_EXT)) {
                extension = AXAML_CS_EXT;
            }

            if (!extension) {
                extension = file.getExtension(false);
            }

            const extensionInfo = map.getDefault(extension, {
                value: extension,
                count: 0,
                csharp: isPrimary
            });

            extensionInfo.count++;
        }

        return [...map.values()];
    }

    private getCsharpSuggestions(extensionInfos: ExtensionInfo[]): SuggestionAction[] {
        const result: SuggestionAction[] = [];

        if (extensionInfos.some(ei => ei.value = CS_EXT)) {
            result.push(this.createCsFileSuggestion());
        }

        if (this.isWpfProject() || extensionInfos.some(ei => ei.value = XAML_EXT)) {
            const onlyXaml = !extensionInfos.some(ei => ei.value = XAML_CS_EXT);
            // create xaml item
        }

        if (this.isAvaloniaProject() || extensionInfos.some(ei => ei.value = AXAML_EXT)) {
            const onlyXaml = !extensionInfos.some(ei => ei.value = AXAML_CS_EXT);
            // create axaml item
        }

        return result;
    }

    private isWpfProject(): boolean {
        return false;
    }

    private isAvaloniaProject(): boolean {
        return false;
    }

    private createCsFileSuggestion(): SuggestionAction {
        return new CsFileSuggestion(this.logger, this.actionFactory, this.config);
    }

    /* move to dotnet
    private createDirectoryPropsAction(): CommandAction {
        const logger = this.logger;
        const csprojFile = this.csprojFile;

        return {
            value: "Directory.Build.props",
            description: "Create blank Directory.Build.props",
            detail: "Override default property settings",
            iconPath: undefined,
            async execute(context: Context): Promise<Path | undefined> {
                logger.trace(`Create Directory.Build.props at ${csprojFile.getDirectory()}`);
                return; // todo
            }
        };
    }
    */

    private async getNamespace(): Promise<string> {
        const content = await this.fsService.readTextFile(this.csprojFile);

        let match: RegExpExecArray | null = null;
        if (content) {
            const regExp = new RegExp("<RootNamespace>(.*)<\/RootNamespace>");
            match = regExp.exec(content);
        }

        return match !== null
            ? match[1]
            : this.csprojFile.getFileName(true);
    }
}