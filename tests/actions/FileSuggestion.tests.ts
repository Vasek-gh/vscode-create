import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { Config } from "@src/configuration/Config";
import { FileCreatorMock } from "@tests/mocks/FileCreatorMock";
import { FileSuggestion } from "@src/actions/factory/FileSuggestion";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { InputInfo } from "@src/actions/InputInfo";
import { Context } from "@src/context/Context";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { TestsUtils } from "@tests/TestsUtils";
import { ContextFilesImpl } from "@src/wizard/ContextFilesImpl";
import { SharedContextMock } from "@tests/mocks/SharedContextMock";

suite("FileSuggestion", async () => {
    let contextMock: Context;

    const fileCreatorMock = new FileCreatorMock();

    const action = new FileSuggestion(
        LoggerMock.instance,
        new Config(ExtensionMock.instance),
        fileCreatorMock
    );

    suiteSetup(async () => {
        fileCreatorMock.clearInvocations();

        const testPath = TestsUtils.getProjPath("Proj1");
        const wsRootDir = await TestsUtils.getWsRootDir(testPath);

        contextMock = new SharedContextMock(
            wsRootDir,
            TestsUtils.getProjPath("Proj1"),
            TestsUtils.getProjPath("Proj1"),
            new ContextFilesImpl([])
        );
    });

    test("Fixed template", async () => {
        await execute("dir/dir", "test", "fstu", "template1");
        validate("dir/dir/test.fstu", "template1");

        await execute("dir/dir", "test", "fstu", "template2");
        validate("dir/dir/test.fstu", "template2");
    });

    test("Invalid input throws errors", () => {
        assert.rejects(() => execute(undefined, undefined, undefined, undefined), Error);
        assert.rejects(() => execute(undefined, undefined, "fstu", undefined), Error);
        assert.rejects(() => execute(undefined, undefined, undefined, "template1"), Error);
        assert.rejects(() => execute("dir/dir", undefined, undefined, undefined), Error);

        assert.strictEqual(fileCreatorMock.createQueries.length, 0);
    });

    test("Executing with empty extension creates blank file", async () => {
        await execute(undefined, "test", undefined, undefined);
        validate("test", undefined);
    });

    test("Executing with unknown extension creates blank file", async () => {
        await execute(undefined, "test", "fstx", undefined);
        validate("test.fstx", undefined);
    });

    test("Executing with empty template creates blank file", async () => {
        await execute(undefined, "test", "fstu", "");
        validate("test.fstu", undefined);
    });

    test("Executing with unknown template creates blank file", async () => {
        await execute(undefined, "test", "fstu", "temp");
        validate("test.fstu", undefined);
    });

    test("When a default template is specified, it is selected", async () => {
        await execute(undefined, "test", "fstd", undefined);
        validate("test.fstd", "template2");
    });

    test("When no default template is specified, the first one is selected", async () => {
        await execute(undefined, "test", "fstu", undefined);
        validate("test.fstu", "template1");
    });

    test("When template is not specified, commands are not returned", async () => {
        apply(undefined, "test", "fstu", undefined);
        const commands = action.getTemplateCommands();

        assert.strictEqual(commands.length, 0);
    });

    test("When template is specified and empty, all commands are returned", async () => {
        apply(undefined, "test", "fstu", "");
        const commands = action.getTemplateCommands();

        assert.strictEqual(commands.length, 4);
    });

    test("When template is specified and not empty, filtered commands are returned", async () => {
        apply(undefined, "test", "fstu", "template");
        const commands = action.getTemplateCommands();

        assert.strictEqual(commands.length, 3);
    });

    test("Calling the command creates a file using a template", async () => {
        apply("dir/dir", "test", "fstu", "t");
        const commands = action.getTemplateCommands();
        for (const command of commands) {
            command.execute(contextMock);
        }

        assert.ok(fileCreatorMock.createQueries.find(cq => cq.template?.template === "template1"));
        assert.ok(fileCreatorMock.createQueries.find(cq => cq.template?.template === "template2"));
        assert.ok(fileCreatorMock.createQueries.find(cq => cq.template?.template === "template3"));
        assert.ok(fileCreatorMock.createQueries.find(cq => cq.template?.template === "template4"));
        assert.strictEqual(
            fileCreatorMock.createQueries.filter(cq =>
                cq.file.getRelative(contextMock.currentDir) === "dir/dir/test.fstu"
            ).length,
            4
        );
    });

    function apply(directory?: string, name?: string, extension?: string, template?: string): void {
        const input = new InputInfo(
            directory,
            name,
            extension,
            template
        );

        action.applyInput(input);
    }

    function execute(directory?: string, name?: string, extension?: string, template?: string): Promise<Path | undefined> {
        apply(directory, name, extension, template);
        return action.execute(contextMock);
    }

    function validate(file: string, template?: string): void {
        assert.strictEqual(fileCreatorMock.createQueries.length, 1);

        const createQuery = fileCreatorMock.createQueries[0];
        const relativePath = createQuery.file.getRelative(contextMock.currentDir);
        const configTemplateBody = createQuery.template?.template;

        assert.strictEqual(file, relativePath);
        assert.strictEqual(template, configTemplateBody);

        fileCreatorMock.clearInvocations();
    }
});