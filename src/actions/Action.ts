import { Path } from "@src/tools/Path";
import { Context } from "@src/context/Context";

export interface Action {
    value: string;
    description: string;
    detail?: string;

    execute(ctx: Context): Promise<Path | undefined>;
}