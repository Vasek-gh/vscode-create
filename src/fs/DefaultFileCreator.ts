import * as fs from "fs";
import * as vscode from "vscode";
import Handlebars, { Exception } from "handlebars";
import { Path } from "../utils/Path";
import { Logger } from "../utils/Logger";
import { TemplateConfig } from "../configuration/TemplateConfig";
import { FileSystemService } from "./FileSystemService";
import { Context } from "../context/Context";
import { TemplateItemConfig } from "../configuration/TemplateItemConfig";
import { FileCreator } from "./FileCreator";
import { Extension } from "@src/utils/Extension";

interface FileInfo {
    filename: string;
    template: string;
}

export class DefaultFileCreator implements FileCreator {
    public static readonly templateRawStrStart: string = ">>";

    private readonly logger: Logger;
    private readonly extensionDir: Path;

    public constructor(
        logger: Logger,
        extension: Extension,
        private readonly fsService: FileSystemService,
    ) {
        this.logger = logger.create(this);
        this.extensionDir = extension.extensionDir;

        this.init();
    }

    public async create(ctx: Context, file: Path, template?: TemplateConfig): Promise<void> {
        this.logger.trace(`Execute\ndir: ${ctx.path.getDirectory()}\nfile: ${file}\ntemplate: ${template ? "<set>" : "<unset>"}`);

        const wsRootDir = this.fsService.getRootDirectory(file);
        if (!wsRootDir) {
            throw new Exception(`No workspace root directory for ${file}`);
        }

        const filesInfo = this.getFilesInfo(file, template);
        if (filesInfo.length === 0) {
            throw new Exception(`No valid templates for ${file}`);
        }

        const vars = this.getVars(
            ctx,
            wsRootDir,
            file,
            template
        );

        for (const fileInfo of filesInfo) {
            await this.createFile(file.getDirectory(), wsRootDir, fileInfo, vars);
        }
    }

    private getFilesInfo(file: Path, template?: TemplateConfig): FileInfo[] {
        if (!template?.template
            || typeof template.template === "string"
            || template.template.length === 0
        ) {
            return [
                {
                    filename: file.getFileName(),
                    template: ""
                }
            ];
        }

        const result: FileInfo[] = [];
        const basefilename: string = file.getFileName(true);
        const items = template.template;
        for (const item of items) {
            if (!item.extension) {
                continue;
            }

            result.push({
                filename: `${basefilename}.${item.extension}`,
                template: item.template ?? ""
            });
        }

        return result;
    }

    private getVars(
        ctx: Context,
        wsRootDir: Path,
        newFileName: Path,
        templateConfig?: TemplateConfig,
    ): any {
        const now = new Date();
        const dir = newFileName.getDirectory();

        const stdVars = {
            workspaceDirectory: wsRootDir.fullPath,
            time: {
                utc: now.toISOString(),
                locale: now.toLocaleString()
            },
            file: {
                fullName: newFileName.getFileName(false),
                baseName: newFileName.getFileName(true),
                fullDir: dir.getRelative(wsRootDir),
                baseDir: dir.getRelative(dir.getParentDirectory())
            }
        };

        return {
            ...stdVars,
            ...ctx.getVars(),
            ...templateConfig?.vars,
        };
    }

    private async createFile(
        rootDir: Path,
        wsRootDir: Path,
        fileInfo: FileInfo,
        vars: any
    ): Promise<void> {
        if (!fileInfo.filename) {
            throw new Error("Filename is not set");
        }

        let content = "";
        const file = rootDir.appendFile(fileInfo.filename);

        const templateBody = await this.getTemplateBody(wsRootDir, fileInfo.template);
        if (templateBody !== "") {
            const template = Handlebars.compile(templateBody);
            content = template(vars);
        }

        // todo check exists

        await vscode.workspace.fs.writeFile(file.uri, Buffer.from(content, "utf-8"));

        // todo insert snippet

        await vscode.window.showTextDocument(file.uri);
    }

    private async getTemplateBody(
        wsRootDir: Path,
        template?: string
    ): Promise<string> {
        if (!template || template === "") {
            return "";
        }

        if (template.startsWith(DefaultFileCreator.templateRawStrStart)) {
            return this.getTemplateBodyAsRawStr(template);
        }

        const wsTemplatesFile = wsRootDir?.appendFile(".vscode", "templates", template);

        const contentFromWs = await this.readFile(wsTemplatesFile);
        if (contentFromWs) {
            return contentFromWs;
        }

        // todo vscode.workspace.workspaceFile

        const defaultTemplatesFile = this.extensionDir.appendFile("templates", template);

        return await this.readFile(defaultTemplatesFile) ?? "";
    }

    private getTemplateBodyAsRawStr(template: string): string {
        return template.substring(DefaultFileCreator.templateRawStrStart.length);
    }

    private async readFile(file?: Path): Promise<string | undefined> {
        if (!file) {
            return undefined;
        }

        if (!file.isOnDisk()) {
            // todo check if exists
            return await this.fsService.readTextFile(file);
        }

        if (!fs.existsSync(file.uri.fsPath)) {
            return undefined;
        }

        return await fs.promises.readFile(file.uri.fsPath, "utf8");
    }

    private init(): void {
        Handlebars.registerHelper("replace", function (value?: string, searchValue?: string, replaceValue?: string): string | undefined {
            if (value === undefined) {
                return undefined;
            }

            if (searchValue === undefined || replaceValue === undefined) {
                return value;
            }

            return value.replaceAll(searchValue, replaceValue);
        });

        Handlebars.registerHelper("denull", function (value: string, defaultValue: string): string {
            return value && value.length > 0
                ? value
                : defaultValue;
        });

        Handlebars.registerHelper("split", function (value: string, splitter: string): string[] {
            return value.split(splitter).filter(v => v?.length > 0);
        });

        Handlebars.registerHelper("join", function (values: string[], splitter: string): string {
            return values.join(splitter);
        });
    }
}