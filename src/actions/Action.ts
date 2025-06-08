import { Context } from "../context/Context";

export interface Action {
    value: string;
    description: string;
    detail?: string;

    execute(ctx: Context): Promise<void>;
}