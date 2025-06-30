import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";
import { Path } from "@src/tools/Path";

export class ContextFilesMock implements ContextFiles {
    public static readonly instance = new ContextFilesMock();

    public getFiles(level: number | FileLevel): undefined | Path[] {
        return undefined;
    }

    public getByRegExp(level: number | FileLevel, pattern: string): undefined | Path[] {
        return undefined;
    }
}
