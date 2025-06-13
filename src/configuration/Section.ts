import { Config } from "./Config";

export class Section<T> {
    private readonly config: Config;
    private readonly defaultValue: T;

    public readonly path: string;

    public constructor(
        config: Config,
        name: string,
        parent: string | undefined,
        defaultValue: T
    ) {
        this.config = config,
        this.path = parent ? `${parent}.${name}` : name;
        this.defaultValue = defaultValue;
    }

    public get(): T {
        return this.config.get<T>(this.path) ?? this.defaultValue;
    }
}