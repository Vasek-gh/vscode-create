import { Path } from "@src/tools/Path";
import { ContextFiles } from "./ContextFiles";

export interface Context {
    /**
     * Unique context identifier. Created each time for a new file creation operation.
     */
    readonly uuid: string;

    /**
     * Current project root directory. For multi-root workspace it will reference form folder in which command executed.
     */
    readonly rootDir: Path;

    /**
     * Current directory. Points to directory on which the command was executed.
     */
    readonly currentDir: Path;

    /**
     * Current path. Points to the file or directory on which the command was executed.
     */
    readonly currentPath: Path;

    /**
     * List of all files in the current directory, plus all files from parent and sibling folders.
     */
    readonly files: ContextFiles;

    /**
     * Returns all variables that are used in the file template.
     */
    getTemplateVariables(): { [key: string]: any };
}