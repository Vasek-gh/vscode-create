import { Path } from "@src/tools/Path";
import { FileLevel } from "./FileLevel";

export interface ContextFiles {
    getFiles(level: number | FileLevel): undefined | Path[];
    getByRegExp(level: number | FileLevel, pattern: string): undefined | Path[];
}