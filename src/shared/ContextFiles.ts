import { Path } from "@src/shared/Path";
import { FileLevel } from "@src/shared/FileLevel";

export interface ContextFiles {
    getFiles(level: number | FileLevel, pattern?: string): undefined | Path[];
}