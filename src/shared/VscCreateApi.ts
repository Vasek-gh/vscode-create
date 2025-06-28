import { ActionProviderFactory } from "@src/shared/ActionProviderFactory";
import { SuggestionAction } from "@src/shared/SuggestionAction";

export interface VscCreateApi {
    createFileSuggestion(): SuggestionAction;
    registerActionProviderFactory(factory: ActionProviderFactory): void;
    registerExtensionConfiguration(section: string): void;
}