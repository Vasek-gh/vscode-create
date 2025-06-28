import { Context } from "@src/shared/Context";
import { ContextFiles } from "@src/shared/ContextFiles";
import { Path } from "@src/shared/Path";

export class SharedContextMock implements Context {
    public constructor(
        public readonly rootDir: Path,
        public readonly currentDir: Path,
        public readonly currentPath: Path,
        public readonly files: ContextFiles,
    ) {
    }

    public setTemplateVariable(key: string, templateVariable: any): void {
        // nop
    }

    public getTemplateVariables(): { [key: string]: any } {
        return {};
    }
}
