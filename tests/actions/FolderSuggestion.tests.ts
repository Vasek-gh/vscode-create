import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { InputInfo } from "@src/actions/InputInfo";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { TestsUtils } from "@tests/TestsUtils";
import { ContextMock } from "@tests/mocks/ContextMock";
import { FolderSuggestion } from "@src/actions/factory/FolderSuggestion";
import { FileSystemServiceImpl } from "@src/services/fs/FileSystemServiceImpl";

suite("FolderSuggestion", async () => {
    const testDir = TestsUtils.getProjPath("Proj1").appendDir("Test");
    const fsService = new FileSystemServiceImpl(LoggerMock.instance);

    const contextMock = new ContextMock(
        TestsUtils.getWsRootDir(testDir),
        testDir,
        testDir
    );

    const action = new FolderSuggestion(
        LoggerMock.instance,
        fsService,
    );

    suiteSetup(async () => {
        await vscode.workspace.fs.delete(testDir.uri, { useTrash: false, recursive: true });
        await vscode.workspace.fs.createDirectory(testDir.uri);
    });

    test("Invalid input throws errors", async () => {
        await assert.rejects(() => execute(undefined, undefined, undefined, undefined), Error);
        await assert.rejects(() => execute(undefined, "fn", undefined, undefined), Error);
        await assert.rejects(() => execute(undefined, undefined, "ext", undefined), Error);
        await assert.rejects(() => execute(undefined, undefined, undefined, "templ"), Error);
        await assert.rejects(() => execute("dir", "fn", undefined, undefined), Error);
        await assert.rejects(() => execute("dir", undefined, "ext", undefined), Error);
    });

    test("Create sub folders", async () => {
        await execute("dir1/dir2");

        const stat = await fsService.getStat(contextMock.currentDir.appendDir("dir1", "dir2"));

        assert.ok(stat);
        assert.strictEqual(stat.type, vscode.FileType.Directory);
    });

    test("Duplicate not throw", async () => {
        await execute("dir3");

        const stat = await fsService.getStat(contextMock.currentDir.appendDir("dir3"));
        assert.ok(stat);
        assert.strictEqual(stat.type, vscode.FileType.Directory);

        await assert.doesNotReject(() => execute("dir3"), Error);
    });

    test("GetTemplateCommands return empty", async () => {
        apply("dir3");

        const commands = action.getTemplateCommands();

        assert.strictEqual(commands.length, 0);
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
});