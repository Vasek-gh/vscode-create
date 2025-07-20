import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { TestsUtils } from "@tests/TestsUtils";
import { Context } from "@src/context/Context";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { GenericActionProvider } from "@src/providers/GenericActionProvider";
import { ContextFilesMock } from "@tests/mocks/ContextFilesMock";

suite("GenericActionProvider", () => {
    const rootDir = TestsUtils.getProjPath("Proj1");

    test("Current: empty; Parent: empty; Siblings: empty => Return empty", async () => {
        const currentDir = rootDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            currentDir,
            [
                [],
                [],
                []
            ]
        );

        assert.strictEqual(suggestions.length, 0);
    });

    test("Current: txt; Parent: xml; Siblings: json => Return txt", async () => {
        const currentDir = rootDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            currentDir,
            [
                [rootDir.appendFile("f.xml")],
                [currentDir.appendFile("f.txt")],
                [currentDir.appendFile("dir2", "f.json")]
            ]
        );

        assert.strictEqual(suggestions.length, 1);
        assert.strictEqual(suggestions[0].extension, "txt");
    });

    test("Current: empty; Parent: xml; Siblings: json => Return xml", async () => {
        const currentDir = rootDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            currentDir,
            [
                [rootDir.appendFile("f.xml")],
                [],
                [currentDir.appendFile("dir2", "f.json")]
            ]
        );

        assert.strictEqual(suggestions.length, 1);
        assert.strictEqual(suggestions[0].extension, "xml");
    });

    test("Current: empty; Parent: empty; Siblings: json => Return json", async () => {
        const currentDir = rootDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            currentDir,
            [
                [],
                [],
                [currentDir.appendFile("dir2", "f.json")]
            ]
        );

        assert.strictEqual(suggestions.length, 1);
        assert.strictEqual(suggestions[0].extension, "json");
    });

    test("Return only 3 most wanted extensions", async () => {
        const currentDir = rootDir;
        const suggestions = await getSuggestions(
            currentDir,
            [
                [
                    currentDir.appendFile("1.json"),
                    currentDir.appendFile("2.json"),
                    currentDir.appendFile("3.json"),
                    currentDir.appendFile("4.json"),
                    currentDir.appendFile("1.txt"),
                    currentDir.appendFile("1.xml"),
                    currentDir.appendFile("2.xml"),
                    currentDir.appendFile("3.xml"),
                    currentDir.appendFile("1.yml"),
                    currentDir.appendFile("2.yml"),
                ],
                []
            ]
        );

        assert.strictEqual(suggestions.length, 3);
        assert.ok(suggestions.some(s => s.extension === "xml"));
        assert.ok(suggestions.some(s => s.extension === "yml"));
        assert.ok(suggestions.some(s => s.extension === "json"));
    });

    function getSuggestions(
        contextPath: Path,
        files: Path[][],
        currentLevelIndex?: number
    ): SuggestionAction[] {
        const context: Context = {
            uuid: "test",
            rootDir: rootDir,
            currentDir: contextPath.getDirectory(),
            currentPath: contextPath,
            files: new ContextFilesMock(files, currentLevelIndex),
            getTemplateVariables(): { [key: string]: any } {
                return {};
            }
        };

        const provider = new GenericActionProvider(
            LoggerMock.instance,
            ActionFactoryMock.instance
        );

        return provider.getSuggestions(context);
    }
});