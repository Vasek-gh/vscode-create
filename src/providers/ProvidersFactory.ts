import { Context } from "@src/context/Context";
import { ActionProvider } from "./ActionProvider";

export interface ProvidersFactory {
    create(context: Context): Promise<ActionProvider | undefined>;
}