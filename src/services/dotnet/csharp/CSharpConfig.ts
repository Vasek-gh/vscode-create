import { Config } from "@src/configuration/Config";

class Keys {
    private static root = "csharp";
    public static enable = `${this.root}.enable`;
}

export class CSharpConfig {
    public constructor(
        private readonly config: Config
    ) {
    }

    public isEnableAll(): boolean {
        return this.get<boolean>(Keys.enable, true);
    }

    private get<T>(path: string, defaultValue: T): T {
        return this.config.get<T>(path) ?? defaultValue;
    }
}