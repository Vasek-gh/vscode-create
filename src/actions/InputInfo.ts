import { Utils } from "@src/tools/Utils";

export class InputInfo {
    public constructor(
        public readonly directory?: string,
        public readonly name?: string,
        public readonly extension?: string,
        public readonly template?: string
    ) {
        if (directory === "") {
            directory = undefined;
        }

        if (name === "") {
            name = undefined;
        }

        if (extension === "") {
            extension = undefined;
        }

        if (template === "") {
            template = undefined;
        }
    }

    public getFilename(): string {
        const dir = this.directory && this.directory.length > 0
            ? this.directory + "/"
            : "";

        const ext = this.extension && this.extension.length > 0
            ? "." + this.extension
            : "";

        return dir + (this.name ?? "") + ext;
    }

    public toString(): string {
        return `[${this.directory ?? "u"}][${this.name ?? "u"}][${this.extension ?? "u"}][${this.template ?? "u"}]`;
    }

    public static parse(input: string): InputInfo {
        if (input === "") {
            return new InputInfo();
        }

        let templateIndex = input.indexOf(Utils.templateSelector);
        if (templateIndex < 0) {
            templateIndex = input.length;
        }

        const template = templateIndex < input.length
            ? input.substring(templateIndex + 1)
            : undefined;

        if (templateIndex > 0) {
            while (input[templateIndex - 1] === " ") {
                templateIndex--;
            }
        }

        let folderIndex = this.indexOfSlash(input, templateIndex);
        if (folderIndex < 0) {
            folderIndex = -1;
        }

        let extensionIndex = input.lastIndexOf(".", templateIndex);
        if (extensionIndex < folderIndex || extensionIndex < 0) {
            extensionIndex = templateIndex;
        }

        let extension = extensionIndex < templateIndex
            ? input.substring(extensionIndex + 1, templateIndex)
            : undefined;

        let name = folderIndex < extensionIndex - 1
            ? input.substring(folderIndex + 1, extensionIndex).trimStart()
            : undefined;

        let directory = folderIndex > -1
            ? input.substring(0, folderIndex)
            : undefined;

        if (!name && extension) {
            name = "." + extension;
            extension = undefined;
        }

        return new InputInfo(
            this.normalizeDir(directory),
            name?.trimStart(),
            extension,
            template?.trim(),
        );
    }

    private static indexOfSlash(input: string, limit: number): number {
        const backSlash = input.lastIndexOf("\\", limit);
        const forwardSlash = input.lastIndexOf("/", limit);

        return Math.max(backSlash, forwardSlash);
    }

    private static normalizeDir(dir: string | undefined): string | undefined {
        if (!dir) {
            return dir;
        }

        const result = dir.replaceAll("\\", "/")
            .split("/")
            .filter(i => i.trim() !== "")
            .join("/")
            .trim();

        return result === ""
            ? undefined
            : result.trim();
    }
}