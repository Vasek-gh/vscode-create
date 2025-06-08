import { FileNameInfo } from "./FileNameInfo";

export class FilesInfo {
    public constructor(
        public parentFiles: FileNameInfo[],
        public currentFiles: FileNameInfo[],
        public siblingsFiles: FileNameInfo[]
    ) {
    }

    public get totalCount(): number {
        return this.currentFiles.length + this.parentFiles.length + this.siblingsFiles.length;
    }

    public getExtensions(): string[] {
        var exts = this.currentFiles
            .concat(this.parentFiles)
            .concat(this.siblingsFiles)
            .map(f => f.extension);

        return Array.from(new Set(exts));
    }

    public extract(predicate: (fni: FileNameInfo) => boolean): FilesInfo {
        const [thisParent, resultParent] = FilesInfo.split(this.parentFiles, (f) => predicate(f));
        const [thisCurrent, resultCurrent] = FilesInfo.split(this.currentFiles, (f) => predicate(f));
        const [thisSiblings, resultSiblings] = FilesInfo.split(this.siblingsFiles, (f) => predicate(f));
        this.parentFiles = thisParent;
        this.currentFiles = thisCurrent;
        this.siblingsFiles = thisSiblings;

        return new FilesInfo(
            resultParent,
            resultCurrent,
            resultSiblings
        );
    }

    public extractExtension(extension: string): FilesInfo {
        return this.extract((fni) => fni.extension === extension);
    }

    private static split<T>(items: T[], predicate: (item: T) => boolean): [old: T[], new: T[]] {
        const oldItems: T[] = [];
        const newItems: T[] = [];

        for (const item of items) {
            if (predicate(item)) {
                newItems.push(item);
            }
            else {
                oldItems.push(item);
            }
        }

        return [oldItems, newItems];
    }
}