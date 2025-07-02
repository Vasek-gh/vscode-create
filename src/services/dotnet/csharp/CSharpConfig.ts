import { Section } from "@src/configuration/Section";
import { Config } from "@src/configuration/Config";

// todo example kill
class InnerSection {
    public readonly enable: Section<boolean>;
    public readonly enable2: Section<boolean>;

    public constructor(
        config: Config,
        parent: string,
    ) {
        const self = new Section<any>(config, "inner", parent, {});
        this.enable = new Section<boolean>(config, "enable", self.path, true);
        this.enable2 = new Section<boolean>(config, "enable", self.path, true);
    }
}

export class CSharpConfig {
    public readonly enableAll: Section<boolean>;
    public readonly enableCommands: Section<boolean>;
    public readonly enableSuggections: Section<boolean>;
    public readonly enableAutoInterface: Section<boolean>;
    public readonly inner: InnerSection;

    public constructor(
        config: Config
    ) {
        const self = "csharp";
        this.enableAll = new Section<boolean>(config, "enable", self, true);
        this.enableCommands = new Section<boolean>(config, "enableCommands", self, true);
        this.enableSuggections = new Section<boolean>(config, "enableSuggestions", self, true);
        this.enableAutoInterface = new Section<boolean>(config, "enableAutoInterface", self, true);
        this.inner = new InnerSection(config, self);
    }
}