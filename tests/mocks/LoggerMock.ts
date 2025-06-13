import { Logger } from "@src/utils/Logger";

export class LoggerMock extends Logger {
    public static readonly instance = new LoggerMock();

    public constructor(
    ) {
        super("");
    }
};
