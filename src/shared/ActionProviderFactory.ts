import { Context } from "./Context";
import { ActionProvider } from "./ActionProvider";

export interface ActionProviderFactory {
    create(context: Context): Promise<ActionProvider | undefined>;
}