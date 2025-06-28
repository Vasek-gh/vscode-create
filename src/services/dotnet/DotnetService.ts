import { Logger } from "../../tools/Logger";

export class DotnetService {
    private readonly logger: Logger;

    public constructor(
        logger: Logger
    ) {
        this.logger = logger.create(this);
    }
}