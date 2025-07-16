import * as vscode from "vscode";
import { FileSystemService } from "@src/services/FileSystemService";
import { Logger } from "@src/tools/Logger";
import { Path } from "@src/tools/Path";
import { Utils } from "@src/tools/Utils";
import { CsFileSuggestion } from "./CsFileSuggestion";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { VarsNames } from "./VarsNames";
import { CSharpConfig } from "./CSharpConfig";
import { ActionFactory } from "@src/actions/ActionFactory";
import { ActionProvider } from "@src/providers/ActionProvider";
import { Context } from "@src/context/Context";
import { FileLevel } from "@src/context/FileLevel";
import { Dictionary } from "@src/tools/Dictionary";
import { FileExtensions } from "../FileExtensions";
import { TemplateVariablesProvider } from "@src/providers/TemplateVariablesProvider";

interface ExtensionInfo {
    value: string;
    count: number;
    csharp: boolean;
}

export class CSharpProvider implements ActionProvider, TemplateVariablesProvider {
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly config: CSharpConfig,
        private readonly csprojFile: Path,
        private readonly fsService: FileSystemService, // todo kill to decouple the code for dotnet from the extension code, it will be necessary to remake it into its own class for reading files
        private readonly actionFactory: ActionFactory,
    ) {
        this.logger = logger.create(this);
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

        result[VarsNames.csproj] = {
            namespace: await this.getNamespace(),
            ...Utils.getFileVars(this.csprojFile, context.rootDir)
        };

        return result;
    }

    private getExtensionInfo(context: Context): ExtensionInfo[] {
        const csprojDir = this.csprojFile.getDirectory();
        let extensionInfos = this.getCurrentExtensionInfo(context, csprojDir);

        // in the current empty let's try to find in the parent
        if (extensionInfos.length === 0) {
            extensionInfos = this.getParentExtensionInfo(context, csprojDir);
        }

        // there is nothing in the parent, let's try to find it in the siblings
        if (extensionInfos.length === 0) {
            extensionInfos = this.getLevelExtensionInfo(context, FileLevel.Siblings);
        }

        // if we didn't find anything, we assume that this is a folder with a project
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

            let extension = FileExtensions.csExtensions.find(e => filename.endsWith(e));
            const isPrimary = extension !== undefined;

            if (extension === FileExtensions.cs && filename.endsWith(FileExtensions.xamlCs)) {
                extension = FileExtensions.xamlCs;
            }

            if (extension === FileExtensions.cs && filename.endsWith(FileExtensions.axamlCs)) {
                extension = FileExtensions.axamlCs;
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

        if (extensionInfos.some(ei => ei.value = FileExtensions.cs)) {
            result.push(this.createCsFileSuggestion());
        }

        if (this.isWpfProject() || extensionInfos.some(ei => ei.value = FileExtensions.xaml)) {
            const onlyXaml = !extensionInfos.some(ei => ei.value = FileExtensions.xamlCs);
            // create xaml item
        }

        if (this.isAvaloniaProject() || extensionInfos.some(ei => ei.value = FileExtensions.axaml)) {
            const onlyXaml = !extensionInfos.some(ei => ei.value = FileExtensions.axamlCs);
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