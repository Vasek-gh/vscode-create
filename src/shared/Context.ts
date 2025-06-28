import { Path } from "./Path";
import { ContextFiles } from "./ContextFiles";

export interface Context {
    readonly rootDir: Path;
    readonly currentDir: Path;
    readonly currentPath: Path;
    readonly files: ContextFiles;

    setTemplateVariable(key: string, templateVariable: any): void;
    getTemplateVariables(): { [key: string]: any };
}