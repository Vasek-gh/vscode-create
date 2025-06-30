import { Context } from "@src/context/Context";
import { ContextFiles } from "@src/context/ContextFiles";
import { Path } from "@src/tools/Path";
import { ContextFilesMock } from "./ContextFilesMock";

export class ContextMock implements Context {
    public readonly files: ContextFiles;

    public constructor(
        public readonly rootDir: Path,
        public readonly currentDir: Path,
        public readonly currentPath: Path,
        files?: ContextFiles
    ) {
        this.files = files ?? ContextFilesMock.instance;
    }

    public getTemplateVariables(): { [key: string]: any } {
        return {};
    }
}
