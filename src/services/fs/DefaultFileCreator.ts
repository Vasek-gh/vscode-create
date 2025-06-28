import * as vscode from "vscode";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { Path } from "@src/shared/Path";
import { Logger } from "@src/tools/Logger";
import { TemplateConfig } from "@src/configuration/TemplateConfig";
import { FileSystemService } from "./FileSystemService";
import { Context } from "@src/shared/Context";
import { FileCreator } from "./FileCreator";
import { Extension } from "@src/tools/Extension";
import { Utils } from "@src/tools/Utils";
import { TemplateVariables } from "@src/context/TemplateVariables";

interface FileInfo {
    path: Path;
    exists: boolean;
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

    public async create(ctx: Context, file: Path, template?: TemplateConfig): Promise<Path | undefined> {
        this.logger.trace(`Execute\ndir: ${ctx.currentDir}\nfile: ${file}\ntemplate: ${template ? "<set>" : "<unset>"}`);

        const filesInfo = await this.getFilesInfo(file, template);
        if (filesInfo.length === 0) {
            throw new Error(`No valid templates for ${file}`);
        }

        const existsList = filesInfo.filter(fi => fi.exists)
            .map(fi => `    ${fi.path.getFileName()}`)
            .join("\n");

        if (existsList) {
            const overwriteQueryResult = await vscode.window.showWarningMessage("File exists. Overwrite?", {
                modal: true,
                detail: "These files will be overwritten:\n" + existsList
            }, "Overwrite");

            if (overwriteQueryResult !== "Overwrite") {
                return undefined;
            }
        }

        const vars = this.getVars(
            ctx,
            ctx.rootDir,
            file,
            template
        );

        const wsEdit = new vscode.WorkspaceEdit();
        for (const fileInfo of filesInfo) {
            const fileBody = await this.getFileBody(ctx.rootDir, fileInfo, vars);
            wsEdit.createFile(fileInfo.path.uri, {
                overwrite: true,
                contents: Buffer.from(fileBody)
            });
        }

        const result = await vscode.workspace.applyEdit(wsEdit, { isRefactoring: false });
        if (!result) {
            this.logger.error(`Something went wrong and the file(${file}) was not created`);
            return undefined;
        }

        return filesInfo[0].path;
    }

    private async getFilesInfo(file: Path, templateConfig?: TemplateConfig): Promise<FileInfo[]> {
        if (!templateConfig?.template
            || typeof templateConfig.template === "string"
            || templateConfig.template.length === 0
        ) {
            return [
                {
                    path: file,
                    exists: await this.fsService.getStat(file) !== undefined,
                    template: typeof templateConfig?.template === "string"
                        ? templateConfig?.template
                        : ""
                }
            ];
        }

        const result: FileInfo[] = [];
        const directory = file.getDirectory();
        const baseFilename: string = file.getFileName(true);
        const items = templateConfig.template;
        for (const item of items) {
            if (!item.extension) {
                continue;
            }

            const path = directory.appendFile(`${baseFilename}.${item.extension}`);

            result.push({
                path: path,
                exists: await this.fsService.getStat(path) !== undefined,
                template: item.template ?? ""
            });
        }

        return result;
    }

    private getVars(
        ctx: Context,
        rootDir: Path,
        newFileName: Path,
        templateConfig?: TemplateConfig,
    ): any {
        const now = new Date();
        const contextVars = ctx.getTemplateVariables();

        const stdVars = {
            time: {
                utc: now.toISOString(),
                locale: now.toLocaleString()
            },
            file: Utils.getFileVars(newFileName, rootDir)
        };

        return {
            ...stdVars,
            ...contextVars,
            ...templateConfig?.vars,
        };
    }

    private async getFileBody(
        rootDir: Path,
        fileInfo: FileInfo,
        vars: any
    ): Promise<string> {
        const templateBody = await this.getTemplateBody(rootDir, fileInfo.template);
        if (templateBody !== "") {
            const template = Handlebars.compile(templateBody);
            return template(vars);
        }

        return "";
    }

    private async getTemplateBody(
        rootDir: Path,
        template?: string
    ): Promise<string> {
        if (!template || template === "") {
            return "";
        }

        if (template.startsWith(DefaultFileCreator.templateRawStrStart)) {
            return this.getTemplateBodyAsRawStr(template);
        }

        if (path.isAbsolute(template)) {
            return this.getTemplateBodyFromAbsolutePath(template);
        }

        const wsFolderTemplatesFile = rootDir.appendFile(".vscode", "templates", template);

        const contentFromWsFolder = await this.readFile(wsFolderTemplatesFile);
        if (contentFromWsFolder) {
            return contentFromWsFolder;
        }

        if (vscode.workspace.workspaceFile) {
            const wsTemplateFile = Path.fromFile(vscode.workspace.workspaceFile).getDirectory().appendFile(template);
            const contentFromWs = await this.readFile(wsTemplateFile);
            if (contentFromWs) {
                return contentFromWs;
            }
        }

        const defaultTemplatesFile = this.extensionDir.appendFile("templates", template);

        return await this.readFile(defaultTemplatesFile) ?? "";
    }

    private getTemplateBodyAsRawStr(template: string): string {
        return template.substring(DefaultFileCreator.templateRawStrStart.length);
    }

    private getTemplateBodyFromAbsolutePath(template: string): string {
        if (!fs.existsSync(template)) {
            return "";
        }

        try {
            return fs.readFileSync(template, { encoding: "utf8" });
        }
        catch (e: any) {
            this.logger.exception(e);

            return "";
        }
    }

    private async readFile(file: Path): Promise<string | undefined> {
        if (!file.isFile()) {
            return undefined;
        }

        return await this.fsService.readTextFile(file);
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