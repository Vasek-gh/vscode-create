import { Context } from "@src/context/Context";
import { ActionProvider } from "./ActionProvider";

export interface ActionProviderFactory {
    create(context: Context): Promise<ActionProvider | undefined>;
}