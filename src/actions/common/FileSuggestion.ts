import { Logger } from "@src/tools/Logger";
import { Context } from "@src/context/Context";
import { Config } from "@src/configuration/Config";
import { TemplateConfig } from "@src/configuration/TemplateConfig";
import { FileCreator } from "@src/services/FileCreator";
import { InputInfo } from "@src/actions/InputInfo";
import { BaseAction } from "./BaseAction";
import { CommandAction } from "@src/actions/CommandAction";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { Path } from "@src/tools/Path";

class FileTemplateInfo {
    public constructor(
        public readonly id: string,
        public readonly config: TemplateConfig
    ) {
    }
}

export class FileSuggestion extends BaseAction implements SuggestionAction {
    private filename?: string;
    private template?: string;
    private templates: FileTemplateInfo[];
    private readonly logger: Logger;

    public constructor(
        logger: Logger,
        private readonly config: Config,
        private readonly fileCreator: FileCreator
    ) {
        super("", undefined);

        this.logger = logger.create(this);
        this.templates = [];

        this.invalidate();
    }

    public execute(ctx: Context): Promise<Path | undefined> {
        return this.executeWithTemplate(ctx, this.getCurrentTemplate());
    }

    private async executeWithTemplate(ctx: Context, template: FileTemplateInfo | undefined): Promise<Path | undefined> {
        if (!this.filename) {
            throw new Error("File name not set");
        }

        this.logger.trace(`Execute filename: ${this.filename} dir: ${ctx.currentDir} template: ${template?.id ?? "<unset>"}`);

        return await this.fileCreator.create(
            ctx,
            ctx.currentDir.appendFile(this.filename),
            template?.config
        );
    }

    public applyInput(input: InputInfo): void {
        this.invalidate();
        if (!input.name) {
            this.logger.warn("Input has not file name");
            return;
        }

        this.filename = input.getFilename();
        this.template = input.template;
        this.templates = this.getTemplates(input);

        const currentTemplate = this.getCurrentTemplate();

        this.description = this.createDescription(currentTemplate);
    }

    private createDescription(template: FileTemplateInfo | undefined): string {
        return template
            ? `Create file with template: ${template.id}`
            : "Create as blank file";
    }

    public getTemplateCommands(): CommandAction[] {
        if (this.template === undefined || this.filename === undefined
        ) {
            return [];
        }

        const that = this;
        const result: CommandAction[] = [];

        for (const template of this.templates) {
            if (this.template.length > 0 && template.id.indexOf(this.template) < 0) {
                continue;
            }

            result.push({
                label: this.filename,
                description: this.createDescription(template),
                execute(context: Context): Promise<Path | undefined> {
                    return that.executeWithTemplate(context, template);
                }
            });
        }

        return result;
    }

    private invalidate(): void {
        this.description = "<invalid>";
        this.filename = undefined;
        this.template = undefined;
        this.templates = [];
    }

    private getTemplates(input: InputInfo): FileTemplateInfo[] {
        if (input.extension === undefined) {
            return [];
        }

        const config = this.config.getExtension(input.extension);
        const templates = Object.entries(config)
            .filter(e => {
                return typeof e[1] === "object";
            })
            .map(e => {
                return new FileTemplateInfo(e[0], e[1] as TemplateConfig);
            });

        const result: FileTemplateInfo[] = [];
        for (const template of templates) {
            if (template.id === config.default) {
                result.unshift(template);
            }
            else if (
                (input.template !== undefined && template.config.hidden !== true)
                || (config.default === undefined && result.length === 0)
            ) {
                result.push(template);
            }
        }

        return result;
    }

    private getCurrentTemplate(): FileTemplateInfo | undefined {
        if (this.template === undefined) {
            return this.templates.length === 1
                ? this.templates[0]
                : undefined;
        }

        return this.templates.find(t => t.id === this.template);
    }
}