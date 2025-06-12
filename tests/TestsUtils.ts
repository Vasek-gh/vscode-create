import * as vscode from "vscode";
import * as assert from "assert";

export class TestsUtils {
    public static assertIfNull<T>(value: T | undefined | null): T {
        if (value === undefined || value === null) {
            assert.fail("value is null");
        }

        return value;
    }

    public static assertIfNotNull<T>(value: T | undefined | null): void {
        if (value !== undefined && value !== null) {
            assert.fail("value is not null");
        }
    }
}