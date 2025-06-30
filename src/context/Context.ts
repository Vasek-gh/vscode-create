import { Path } from "@src/tools/Path";
import { ContextFiles } from "./ContextFiles";

export interface Context {
    readonly rootDir: Path;
    readonly currentDir: Path;
    readonly currentPath: Path;
    readonly files: ContextFiles;

    getTemplateVariables(): { [key: string]: any };
}