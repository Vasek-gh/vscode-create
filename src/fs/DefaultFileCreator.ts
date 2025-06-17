import * as vscode from "vscode";
import Handlebars from "handlebars";
import { Path } from "../utils/Path";
import { Logger } from "../utils/Logger";
import { TemplateConfig } from "../configuration/TemplateConfig";
import { FileSystemService } from "./FileSystemService";
import { Context } from "../context/Context";
import { FileCreator } from "./FileCreator";
import { Extension } from "@src/utils/Extension";

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
        this.logger.trace(`Execute\ndir: ${ctx.path.getDirectory()}\nfile: ${file}\ntemplate: ${template ? "<set>" : "<unset>"}`);

        const rootDir = this.fsService.getRootDirectory(file);
        if (!rootDir) {
            throw new Error(`No workspace root directory for ${file}`);
        }

        //console.log("1");

        const filesInfo = await this.getFilesInfo(file, template);
        if (filesInfo.length === 0) {
            console.log("1.1");
            throw new Error(`No valid templates for ${file}`);
        }

        //console.log("2");

        const existsList = filesInfo.filter(fi => fi.exists)
            .map(fi => `    ${fi.path.getFileName()}`)
            .join("\n");
        if (existsList) {
            const overwriteQueryResult = await vscode.window.showWarningMessage("File exists. Overwrite?", {
                modal: true,
                detail: "These files will be overwritten:\n" + existsList
            }, "Overwrite");

            console.log("3");

            if (overwriteQueryResult !== "Overwrite") {
                console.log(`overwriteQueryResult: ${overwriteQueryResult}`)
                return undefined;
            }
        }

        //console.log("4");

        const vars = this.getVars(
            ctx,
            rootDir,
            file,
            template
        );

        const wsEdit = new vscode.WorkspaceEdit();
        for (const fileInfo of filesInfo) {
            const fileBody = await this.getFileBody(rootDir, fileInfo, vars);
            wsEdit.createFile(fileInfo.path.uri, {
                overwrite: true,
                contents: Buffer.from(fileBody)
            });
        }

        //console.log("5");

        const result = await vscode.workspace.applyEdit(wsEdit, { isRefactoring: false });
        if (!result) {
            this.logger.error(`Something went wrong and the file(${file}) was not created`);
            console.log(`create: ${file} fail`)
            return undefined;
        }

        //console.log("6");

        //console.log(`create: ${file} succes ${filesInfo[0].path}`);
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
        const dir = newFileName.getDirectory();

        const stdVars = {
            workspaceDirectory: rootDir.fullPath,
            time: {
                utc: now.toISOString(),
                locale: now.toLocaleString()
            },
            file: {
                fullName: newFileName.getFileName(false),
                baseName: newFileName.getFileName(true),
                fullDir: dir.getRelative(rootDir),
                baseDir: dir.getRelative(dir.getParentDirectory())
            }
        };

        return {
            ...stdVars,
            ...ctx.getVars(),
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

        // todo check absolute path

        const wsTemplatesFile = rootDir?.appendFile(".vscode", "templates", template);

        const contentFromWs = await this.readFile(wsTemplatesFile);
        if (contentFromWs) {
            return contentFromWs;
        }

        // todo check vscode.workspace.workspaceFile

        const defaultTemplatesFile = this.extensionDir.appendFile("templates", template);

        return await this.readFile(defaultTemplatesFile) ?? "";
    }

    private getTemplateBodyAsRawStr(template: string): string {
        return template.substring(DefaultFileCreator.templateRawStrStart.length);
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