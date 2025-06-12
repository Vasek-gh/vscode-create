import { BaseAction } from "./BaseAction";
import { SuggestionAction } from "./SuggestionAction";
import { Context } from "../context/Context";
import { Logger } from "../utils/Logger";
import { InputInfo } from "./InputInfo";
import { CommandAction } from "./CommandAction";
import { Config } from "../configuration/Config";
import { TemplateConfig } from "../configuration/TemplateConfig";
import { FileCreator } from "../services/FileCreator";

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
        super("", "", undefined);

        this.logger = logger.create(this);
        this.templates = [];
    }

    public execute(ctx: Context): Promise<void> {
        return this.executeWithTemplate(ctx, this.getCurrentTemplate());
    }

    private async executeWithTemplate(ctx: Context, template: FileTemplateInfo | undefined): Promise<void> {
        if (!this.filename) {
            throw new Error("File name not set");
        }

        this.logger.trace(`Execute filename: ${this.filename} dir: ${ctx.dir} template: ${template?.id ?? "<unset>"}`);

        await this.fileCreator.create(
            ctx,
            ctx.dir.appendFile(this.filename),
            template?.config
        );
    }

    public applyInput(input: InputInfo): void {
        if (!input.name) {
            this.logger.warn("Input has not file name");
        }

        this.filename = input.getFilename();
        this.template = input.template;
        this.templates = this.getTemplates(input);

        const currentTemplate = this.getCurrentTemplate();

        this.value = this.filename;
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
                value: this.filename,
                description: this.createDescription(template),
                execute(context: Context): Promise<void> {
                    return that.executeWithTemplate(context, template);
                }
            });
        }

        return result;
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