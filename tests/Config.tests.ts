import * as vscode from "vscode";
import * as assert from "assert";
import { TestsUtils } from "./TestsUtils";
import { Config } from "../src/configuration/Config";
import { TestExtension } from "./mocks/TestExtension";
import { Path } from "../src/utils/Path";

suite("Config", () => {
    const config = new Config(new TestExtension());

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
});