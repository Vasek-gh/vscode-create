import { Context } from "@src/context/Context";
import { SuggestionAction } from "../actions/SuggestionAction";
import { FileLevel } from "@src/context/FileLevel";
import { Path } from "@src/tools/Path";
import { Logger } from "@src/tools/Logger";
import { GenericExtensionSuggestion } from "../actions/common/GenericExtensionSuggestion";
import { ActionFactory } from "../actions/ActionFactory";

export class GenericActionProvider {
    private static readonly limit = 3;

    public constructor(
        private readonly logger: Logger,
        private readonly actionFactory: ActionFactory,
    ) {

    }

    public getSuggestions(context: Context): SuggestionAction[] {
        const files = this.getFiles(context);
        const extensions = this.getExtensions(files);
        const suggestions = this.createSuggestions(extensions);

        return suggestions;
    }

    private getFiles(context:Context): Path[] {
        let files = context.files.getFiles(FileLevel.Current) ?? [];

        if (files.length === 0) {
            files = context.files.getFiles(FileLevel.Parent) ?? [];
        }

        if (files.length === 0) {
            files = context.files.getFiles(FileLevel.Siblings) ?? [];
        }

        return files;
    }

    private getExtensions(files: Path[]): string[] {
        const countMap = new Map<string, number>();
        for (const file of files) {
            const extension = file.getExtension(true);
            countMap.set(extension, (countMap.get(extension) || 0) + 1);
        }

        return Array.from(countMap.entries())
            .sort((a, b) => {
                if (b[1] !== a[1]) {
                    return b[1] - a[1];
                }

                return a[0].localeCompare(b[0]);
            })
            .slice(0, GenericActionProvider.limit)
            .map(entry => entry[0]);
    }

    private createSuggestions(extensions: string[]): SuggestionAction[] {
        return extensions.map(ext => new GenericExtensionSuggestion(
            this.logger,
            this.actionFactory,
            ext
        ));
    }
}
