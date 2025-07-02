import * as vscode from "vscode";
import * as assert from "assert";
import os from "os";
import fs from "fs";
import { Path } from "@src/tools/Path";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { TestsUtils } from "@tests/TestsUtils";
import { FileCreatorImpl } from "@src/services/fs/FileCreatorImpl";
import { FileSystemServiceImpl } from "@src/services/fs/FileSystemServiceImpl";
import { ContextMock } from "@tests/mocks/ContextMock";

suite("FileCreator", () => {
    const fsService = new FileSystemServiceImpl(
        LoggerMock.instance
    );

    const fileCreator = new FileCreatorImpl(
        LoggerMock.instance,
        ExtensionMock.instance,
        fsService
    );

    const proj1Dir = TestsUtils.getProjPath("Proj1").appendDir("Test");
    const fctExtensionConfig = new Config(ExtensionMock.instance).getExtension("fct");

    const contextMock = new ContextMock(
        TestsUtils.getWsRootDir(proj1Dir),
        proj1Dir,
        proj1Dir,
    );

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

    test("Template from the workspace found", async () => {
        const content = await createFile("workspace.fct", "workspaceTemplate");
        assert.strictEqual(content, "ws");
    });

    test("Template from the extension found", async () => {
        const content = await createFile("extension.fct", "extensionTemplate");
        assert.strictEqual(content, "todo");
    });

    test("Template from absolute path found", async () => {
        const file = proj1Dir.appendFile("absolute.fct");
        const templateFile = Path.fromDir(vscode.Uri.file(os.tmpdir())).appendFile("vscode-create.txt");
        const testContent = "absolute path";

        fs.writeFileSync(templateFile.uri.fsPath, testContent);

        TestsUtils.assertIfNull(
            await fileCreator.create(contextMock, file, {
                template: templateFile.uri.fsPath
            })
        );

        const content = TestsUtils.assertIfNull(
            await fsService.readTextFile(file)
        );

        assert.strictEqual(testContent, content);
    });

    test("Complex template create files and return first", async () => {
        const file = proj1Dir.appendFile("complext.fct");
        const newFile = TestsUtils.assertIfNull(
            await fileCreator.create(contextMock, file, fctExtensionConfig["comlexTemplate"])
        );

        assert.strictEqual(newFile.fullPath, file.fullPath + ".zxc");
        assert.strictEqual(await fsService.readTextFile(proj1Dir.appendFile("complext.fct.zxc")), "html");
        assert.strictEqual(await fsService.readTextFile(proj1Dir.appendFile("complext.fct.qwe")), "css");
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

    test("Default vars is assigned", async () => {
        const content = await createFile("vars_test_dir/vars.fct", "varTemplate");
        const rows = content.split(os.EOL);

        assert.strictEqual(rows.length, 7);
        assert.strictEqual(rows[3], "vars.fct");
        assert.strictEqual(rows[4], "vars");
        assert.strictEqual(rows[5], "Test/vars_test_dir");
        assert.strictEqual(rows[6], "vars_test_dir");
    });

    async function createFile(name: string, template: string): Promise<string> {
        const newFile = TestsUtils.assertIfNull(
            await fileCreator.create(contextMock, proj1Dir.appendFile(name), fctExtensionConfig[template])
        );

        const content = TestsUtils.assertIfNull(
            await fsService.readTextFile(newFile)
        );

        return content;
    }

    async function withMessageMock(overwrite: boolean, action: () => Promise<void>): Promise<void> {
        const oldShowWarningMessage = vscode.window.showWarningMessage;

        try {
            vscode.window.showWarningMessage = (message: string, options: vscode.MessageOptions, ...items: any[]): Promise<any | undefined> => {
                return Promise.resolve(overwrite ? items[0] : undefined);
            };

            await action();
        }
        finally {
            vscode.window.showWarningMessage = oldShowWarningMessage;
        }
    }
});