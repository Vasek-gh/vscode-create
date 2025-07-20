import { Logger } from "@src/tools/Logger";

export class LoggerMock extends Logger {
    public static readonly instance = new LoggerMock();

    public constructor(
    ) {
        super("");
    }
}