import * as cp from "child_process";
import { Logger } from "./Logger";

// todo kill ???
export class Shell {
    public constructor(
        private readonly logger: Logger
    ) {
        this.logger = logger.createChild("Shell");
    }

    public async exec(command: string, cwd?: string): Promise<string | undefined> {
        try {
            const [error, output] = await new Promise<[cp.ExecException | null, string]>((resolve, reject) => {
                cp.exec(
                    command,
                    {
                        cwd: cwd,
                        shell: "powershell.exe"
                    },
                    (err, out) => {
                        return resolve([err, out]);
                    }
                );
            });

            if (error) {
                this.logger.error(error.message);
                return undefined;
            }

            this.logger.trace(`${command}\n${output}`);
            return output;
        }
        catch (e) {
            this.logger.exception(e);
            return undefined;
        }
    }
}