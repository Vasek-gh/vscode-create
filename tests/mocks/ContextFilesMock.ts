import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";
import { Path } from "@src/tools/Path";

export class ContextFilesMock implements ContextFiles {
    public static readonly instance = new ContextFilesMock();

    private readonly items: Path[][];
    private readonly currentLevelIndex: number;

    public constructor(
        items?: Path[][],
        currentLevelIndex?: number
    ) {
        this.items = items ?? [];
        this.currentLevelIndex ??= currentLevelIndex ?? (items?.length ?? 0) - 2;
    }

    public getFiles(level: number | FileLevel): undefined | Path[] {
        const index = this.levelToIndex(level);

        return index === undefined
            ? undefined
            : this.items[index];
    }

    private levelToIndex(level: number | FileLevel): number | undefined {
        if (this.currentLevelIndex < 0) {
            return undefined;
        }

        if (level === FileLevel.Root) {
            return 0;
        }

        const index = this.currentLevelIndex + level;

        return index >= 0 && index < this.items.length
            ? index
            : undefined;
    }

    public getByRegExp(level: number | FileLevel, pattern: string): undefined | Path[] {
        return undefined;
    }
}
