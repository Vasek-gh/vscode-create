import { Context } from "@src/context/Context";
import { ContextFiles } from "@src/context/ContextFiles";
import { Path } from "@src/tools/Path";

export class SharedContextMock implements Context {
    public constructor(
        public readonly rootDir: Path,
        public readonly currentDir: Path,
        public readonly currentPath: Path,
        public readonly files: ContextFiles,
    ) {
    }

    public getTemplateVariables(): { [key: string]: any } {
        return {};
    }
}
