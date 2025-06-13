import * as vscode from "vscode";
import * as assert from "assert";
import { TestsUtils } from "./TestsUtils";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "./mocks/ExtensionMock";
import { Path } from "@src/utils/Path";

suite("Config", () => {
    const extension = new ExtensionMock();
    const config = new Config(extension);

    test("Reload on empty", () => {
        config.reload(undefined);

        const extCfg = TestsUtils.assertIfNull(config.getExtension("txt"));

        assert.strictEqual(extCfg?.default, "ws");
    });

    test("Reload on project", () => {
        const proj1Uri = TestsUtils.assertIfNull(vscode.workspace.workspaceFolders?.find(wf => wf.name === "Proj1")?.uri);
        const proj2Uri = TestsUtils.assertIfNull(vscode.workspace.workspaceFolders?.find(wf => wf.name === "Proj2")?.uri);

        config.reload(new Path(proj1Uri, vscode.FileType.Directory));

        const proj1ExtCfg = TestsUtils.assertIfNull(config.getExtension("txt"));

        assert.strictEqual(proj1ExtCfg?.default, "proj1");

        TestsUtils.assertIfNull(proj1ExtCfg["ws"]?.template);
        TestsUtils.assertIfNull(proj1ExtCfg["proj1"]?.template);
        TestsUtils.assertIfNotNull(proj1ExtCfg["proj2"]?.template);

        config.reload(new Path(proj2Uri, vscode.FileType.Directory));

        const proj2ExtCfg = TestsUtils.assertIfNull(config.getExtension("txt"));

        assert.strictEqual(proj2ExtCfg?.default, "proj2");

        TestsUtils.assertIfNull(proj2ExtCfg["ws"]?.template);
        TestsUtils.assertIfNull(proj2ExtCfg["proj2"]?.template);
        TestsUtils.assertIfNotNull(proj2ExtCfg["proj1"]?.template);
    });

    test("Change apply after reload", async () => {
        config.reload(undefined);

        const beforeChangeValue = TestsUtils.assertIfNull(config.getExtension("txt")["ws"]?.template);

        const vsConfig = vscode.workspace.getConfiguration(extension.name);
        const vsConfigSection = vsConfig.inspect("extensions")?.workspaceValue as any;
        vsConfigSection.txt.ws.template += "qwerty";
        await vsConfig.update("extensions", vsConfigSection, vscode.ConfigurationTarget.Workspace);

        const afterChangeValue = TestsUtils.assertIfNull(config.getExtension("txt")["ws"]?.template);

        config.reload(undefined);

        const afterReloadValue = TestsUtils.assertIfNull(config.getExtension("txt")["ws"]?.template);

        assert.strictEqual(afterChangeValue, beforeChangeValue);
        assert.notStrictEqual(afterReloadValue, beforeChangeValue);
    });
});