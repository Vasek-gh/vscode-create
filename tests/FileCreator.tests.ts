import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/utils/Path";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { Context } from "@src/context/Context";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { FilesInfo } from "@src/context/FilesInfo";
import { TestsUtils } from "@tests/TestsUtils";
import { DefaultFileCreator } from "@src/fs/DefaultFileCreator";
import { FileSystemServiceMock } from "./mocks/FileSystemServiceMock";
import { DefaultFileSystemService } from "@src/fs/DefaultFileSystemService";

suite("FileCreator", () => {
    const contextMock = new Context(
        LoggerMock.instance,
        new ActionFactoryMock(undefined, undefined),
        TestsUtils.getProjPath("Proj1"),
        new FilesInfo([], [], [])
    );

    const fsServiceMock = new FileSystemServiceMock(
        new DefaultFileSystemService(LoggerMock.instance)
    );

    const fileCreator = new DefaultFileCreator(
        LoggerMock.instance,
        ExtensionMock.instance,
        fsServiceMock
    );

    const proj1Dir = TestsUtils.getProjPath("Proj1").appendDir("Test");
    const fctExtensionConfig = new Config(ExtensionMock.instance).getExtension("fct");

    suiteSetup(async () => {
        await vscode.workspace.fs.delete(proj1Dir.uri, { useTrash: false, recursive: true });
    });

    test("Null template create empty file", async () => {
        const content = await createFile("null.fct", "null");
        assert.strictEqual(content, "");
    });

    test("Empty template create empty file", async () => {
        const content = await createFile("empty.fct", "emptyTemplate");
        assert.strictEqual(content, "");
    });

    test("Template from the project found", async () => {
        const content = await createFile("proj1.fct", "proj1Template");
        assert.strictEqual(content, "proj1");
    });

    test("Template from the extension found", async () => {
        const content = await createFile("extension.fct", "extensionTemplate");
        assert.strictEqual(content, "todo");
    });

    test("Complex template create files and return first", async () => {
        const file = proj1Dir.appendFile("complext.fct");
        const newFile = TestsUtils.assertIfNull(
            await fileCreator.create(contextMock, file, fctExtensionConfig["comlexTemplate"])
        );

        assert.strictEqual(newFile.fullPath, file.fullPath + ".zxc");
        assert.strictEqual(await fsServiceMock.readTextFile(proj1Dir.appendFile("complext.fct.zxc")), "html");
        assert.strictEqual(await fsServiceMock.readTextFile(proj1Dir.appendFile("complext.fct.qwe")), "css");
    });

    test("Duplicate overwrite apply", async () => {
        const filename = "dupp1.fct";

        const content = await createFile(filename, "null");
        assert.strictEqual(content, "");

        await withMessageMock(true, async () => {
            const content = await createFile(filename, "proj1Template");
            assert.strictEqual(content, "proj1");
        });
    });

    test("Duplicate overwrite dismiss", async () => {
        const filename = "dupp2.fct";

        const content = await createFile(filename, "null");
        assert.strictEqual(content, "");

        await withMessageMock(false, async () => {
            TestsUtils.assertIfNotNull(
                await fileCreator.create(contextMock, proj1Dir.appendFile(filename), fctExtensionConfig["proj1Template"])
            );
        });
    });

    async function createFile(name: string, template: string): Promise<string> {
        const newFile = TestsUtils.assertIfNull(
            await fileCreator.create(contextMock, proj1Dir.appendFile(name), fctExtensionConfig[template])
        );

        const content = TestsUtils.assertIfNull(
            await fsServiceMock.readTextFile(newFile)
        );

        return content;
    }

    async function withMessageMock(overwrite: boolean, action: () => Promise<void>): Promise<void> {
        const oldShowWarningMessage = vscode.window.showWarningMessage;

        try {
            vscode.window.showWarningMessage = (message: string, options: vscode.MessageOptions, ...items: any[]): Promise<any | undefined> => {
                console.log(`Showmsg: ${overwrite ? items[0] : undefined}`);
                return Promise.resolve(overwrite ? items[0] : undefined);
            };

            await action();
        }
        finally {
            vscode.window.showWarningMessage = oldShowWarningMessage;
        }
    }
});