import { Path } from "@src/tools/Path";
import { ContextFiles } from "./ContextFiles";

export interface Context {
    readonly uuid: string;
    readonly rootDir: Path;
    readonly currentDir: Path;
    readonly currentPath: Path;
    readonly files: ContextFiles;

    getTemplateVariables(): { [key: string]: any };
}