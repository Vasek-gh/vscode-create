import { Path } from "../shared/Path";

export interface Extension {
    id: string;
    name: string;
    version: string;
    extensionDir: Path;
}
