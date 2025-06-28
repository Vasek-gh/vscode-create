import { Path } from "@src/shared/Path";
import { Context } from "@src/shared/Context";

export interface Action {
    value: string;
    description: string;
    detail?: string;

    execute(ctx: Context): Promise<Path | undefined>;
}