import * as vscode from "vscode";
import { ContextHandler } from "../../context/ContextHandler";
import { FileSystemService } from "../../fs/FileSystemService";
import { SearchMode } from "../../fs/SearchMode";
import { Logger } from "../../utils/Logger";
import { Path } from "../../utils/Path";
import { Context } from "../../context/Context";
import { FilesInfo } from "../../context/FilesInfo";
import { FileNameInfo } from "../../context/FileNameInfo";
import { Utils } from "../../utils/Utils";
import { CsFileSuggestion } from "./CsFileSuggestion";
import { CommandAction } from "../../actions/CommandAction";
import { SuggestionAction } from "../../actions/SuggestionAction";
import { CSharpVars } from "./CSharpVars";
import { Config } from "../../configuration/Config";
import { CSharpConfig } from "./CSharpConfig";
import { ActionFactory } from "../../actions/ActionFactory";

const SLN_EXT: string = "sln";
const SLNX_EXT: string = "slnx";
const CSPROJ_EXT: string = "csproj";
const CS_EXT: string = "cs";
const XAML_EXT: string = "xaml";
const AXAML_EXT: string = "axaml";

const KNOWN_EXTENSIONS: string[] = [
    "cs",
    "xaml",
    "axaml",
];

const XAML_EXTENSIONS: string[] = [
    "xaml",
    "axaml",
];

// information for C# file
interface CsFileInfo {
    // file name without extension
    name: string;
    // file extension
    extension: string;
    // this file have child file(e.g. xaml.cs)
    hasChild: boolean;
}

// all C# files information
interface CsFilesInfo {
    // files
    items: CsFileInfo[];
    // determines that files are priority in the current context
    primary: boolean;
}

export class CSharpContextHandler implements ContextHandler {
    private readonly logger: Logger;
    private readonly config: CSharpConfig;

    public constructor(
        logger: Logger,
        config: Config,
        private readonly fsService: FileSystemService,
        private readonly actionFactory: ActionFactory,
    ) {
        this.logger = logger.create(this);
        this.config = new CSharpConfig(config);
    }

    public dispose(): void {
        // nop
    }

    public getId(): string {
        return "CSharpResolver";
    }

    public async handle(ctx: Context): Promise<void> {
        if (!this.config.enableAll.get()) {
            return;
        }

        this.logger.trace("Execute");

        // this never create with our hands, just delete from handling
        ctx.filesInfo.extractExtension(CSPROJ_EXT);
        ctx.filesInfo.extractExtension(SLN_EXT); // todo dotnet
        ctx.filesInfo.extractExtension(SLNX_EXT); // todo dotnet

        const currentDir = ctx.path.getDirectory();
        const projectFile = await this.getProjectFile(currentDir);
        if (!projectFile) {
            this.logger.trace("Project file not found. Skipping.");
            return;
        }

        ctx.setVar(CSharpVars.csprojFile, projectFile);
        this.registerCommands(ctx, projectFile);
        this.registerSuggestions(ctx, projectFile);
    }

    private async getProjectFile(path: Path): Promise<Path | undefined> {
        let files = await this.fsService.findFiles(
            path,
            `*.{${SLN_EXT},${SLNX_EXT},${CSPROJ_EXT}}`, // todo CSPROJ_EXT only
            SearchMode.IncludeParents
        );

        files = files.sort((a, b) => {
            const aDir = a.getDirectory();
            const bDir = b.getDirectory();
            if (aDir.isSame(bDir)) {
                const aExtRate = a.getExtension(true) === CSPROJ_EXT ? 2 : 1;
                const bExtRate = b.getExtension(true) === CSPROJ_EXT ? 2 : 1;
                return aExtRate - bExtRate;
            }

            return b.length - a.length;
        });

        return files.length > 0
            ? files[0]
            : undefined;
    }

    private registerCommands(ctx: Context, csprojFile: Path): void {
        if (!csprojFile.getDirectory().isSame(ctx.path.getDirectory())) {
            return;
        }

        ctx.appendCommand(this.createDirectoryPropsAction(csprojFile));
        ctx.appendCommand(this.createDirectoryPropsAction(csprojFile));
    }

    private registerSuggestions(ctx: Context, csprojFile: Path): void {
        this.logger.trace(`Current project file: ${csprojFile}`);

        // после этого нам известны все cs файлы в контексте
        const csFilesInfo = CSharpContextHandler.extractCSharpFiles(ctx, csprojFile);
        // получаем карту расширений
        const extensions = Utils.groupBy(csFilesInfo.items, (fi) => fi.extension);

        if (extensions.has(CS_EXT)) {
            ctx.appendSuggestion(this.createCsFileSuggestion());
        }

        if (CSharpContextHandler.isWpfProject(csprojFile) || extensions.has(XAML_EXT)) {
            // create xaml item
        }

        if (CSharpContextHandler.isAvaloniaProject(csprojFile) || extensions.has(AXAML_EXT)) {
            // create axaml item
        }
    }

    private static isWpfProject(csprojFile: Path): boolean {
        return false;
    }

    private static isAvaloniaProject(csprojFile: Path): boolean {
        return false;
    }

    private createCsFileSuggestion(): SuggestionAction {
        return new CsFileSuggestion(this.logger, this.actionFactory, this.config);
    }

    private createDirectoryPropsAction(csprojFile: Path): CommandAction {
        const logger = this.logger;

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

    private static extractCSharpFiles(ctx: Context, csprojFile: Path): CsFilesInfo {
        if (ctx.path === csprojFile.getDirectory()) {
            ctx.filesInfo.parentFiles = [];
        }

        const csFilesInfo = ctx.filesInfo.extract((fni) => KNOWN_EXTENSIONS.some(e => e === fni.extension));
        const genericFiles = this.getNonCSharpFiles(ctx, csFilesInfo, csprojFile);

        var parentFiles = this.getCsFileInfos(csFilesInfo.parentFiles);
        var currentFiles = this.getCsFileInfos(csFilesInfo.currentFiles);
        var siblingsFiles = this.getCsFileInfos(csFilesInfo.siblingsFiles);
        var allFiles = parentFiles.concat(currentFiles).concat(siblingsFiles);

        return {
            items: allFiles,
            primary: genericFiles.length === 0,
        };
    }

    private static getNonCSharpFiles(ctx: Context, csFilesInfo: FilesInfo, csprojFile: Path): FileNameInfo[] {
        const ctxDir = ctx.path.getDirectory();
        const rootDir = csprojFile.getDirectory();

        if (ctxDir === rootDir) {
            return [];
        }

        // если в текущей есть cs файлы это точно не генерик папка
        if (csFilesInfo.currentFiles.length !== 0) {
            return [];
        }

        // если в текущей есть генерик файлы или родитель содержит только генерик
        if (ctx.filesInfo.currentFiles.length > 0
            || (ctx.filesInfo.parentFiles.length > 0 && csFilesInfo.parentFiles.length === 0)
        ) {
            return ctx.filesInfo.parentFiles.concat(ctx.filesInfo.currentFiles)
                .concat(ctx.filesInfo.siblingsFiles);
        }

        return [];
    }

    private static getCsFileInfos(fileNameInfos: FileNameInfo[]): CsFileInfo[] {
        const normalFiles = fileNameInfos.filter(fni => !this.getCodeBehindMainName(fni));
        const codeBehindFiles = fileNameInfos.filter(fni => this.getCodeBehindMainName(fni));

        const result = new Map<string, CsFileInfo>(
            normalFiles.map(fni => [
                fni.name,
                {
                    name: fni.name,
                    extension: fni.extension,
                    hasChild: false
                }
            ])
        );

        for (const fni of codeBehindFiles) {
            var name = this.getCodeBehindMainName(fni) ?? "";
            var parent = result.get(name);
            if (parent) {
                parent.hasChild = true;
                continue;
            }

            result.set(
                fni.name,
                {
                    name: fni.name,
                    extension: fni.extension,
                    hasChild: false
                }
            );
        }

        return Array.from(result.values());
    }

    private static getCodeBehindMainName(fni: FileNameInfo): string | undefined {
        const dotIndex = fni.name.lastIndexOf(".");
        if (dotIndex < 0) {
            return undefined;
        }

        const ext = fni.name.substring(dotIndex + 1, fni.name.length - dotIndex - 1);
        if (!XAML_EXTENSIONS.some(xExt => xExt === ext)) {
            return undefined;
        }

        return fni.name.substring(0, dotIndex);
    }
}