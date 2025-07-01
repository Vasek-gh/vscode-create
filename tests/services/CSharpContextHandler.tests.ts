import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { TestsUtils } from "@tests/TestsUtils";
import { CSharpActionProvider } from "@src/services/csharp/CSharpActionProvider";
import { FileSystemServiceImpl } from "@src/services/fs/FileSystemServiceImpl";
import { CSharpVars } from "@src/services/csharp/CSharpVars";
import { Utils } from "@src/tools/Utils";
import { Context } from "@src/context/Context";
import { CSharpConfig } from "@src/services/csharp/CSharpConfig";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";
import { CommandAction } from "@src/actions/CommandAction";

class ContextFilesMock implements ContextFiles {
    private readonly items: Path[][];
    private readonly currentLevelIndex: number;

    public constructor(
        items?: Path[][],
        currentLevelIndex?: number
    ) {
        this.items = items ?? [];
        this.currentLevelIndex ??= currentLevelIndex ?? (items?.length ?? 0) - 2;
    }

    public getFiles(level: number | FileLevel): undefined | Path[] {
        const index = this.levelToIndex(level);

        return index === undefined
            ? undefined
            : this.items[index];
    }

    private levelToIndex(level: number | FileLevel): number | undefined {
        if (this.currentLevelIndex < 0) {
            return undefined;
        }

        if (level === FileLevel.Root) {
            return 0;
        }

        const index = this.currentLevelIndex + level;

        return index >= 0 && index < this.items.length
            ? index
            : undefined;
    }

    public getByRegExp(level: number | FileLevel, pattern: string): undefined | Path[] {
        return undefined;
    }
}

suite("CSharpContextHandler", () => {
    const csRootDir = TestsUtils.getProjPath("CSharpProj");
    const wsRoorDir = TestsUtils.getWsRootDir(csRootDir);
    const cliProjFile = csRootDir.appendFile("Src", "Proj1.Cli", "Proj1.Cli.csproj");
    const libProjFile = csRootDir.appendFile("Src", "Proj1.Lib", "Proj1.Lib.csproj");

    const fsService = new FileSystemServiceImpl(
        LoggerMock.instance,
    );

    test("Csproj vars", async () => {
        const context = createContext(libProjFile);
        const provider = createActionProvider(libProjFile);

        const csprojVar = (await provider.getTemplateVariables(context))[CSharpVars.csproj];
        const fileVars = Utils.getFileVars(libProjFile, wsRoorDir);

        assert.strictEqual(csprojVar.fullName, fileVars.fullName);
        assert.strictEqual(csprojVar.baseName, fileVars.baseName);
        assert.strictEqual(csprojVar.fullDir, fileVars.fullDir);
        assert.strictEqual(csprojVar.baseDir, fileVars.baseDir);
    });

    test("Namesapce detect from filename", async () => {
        const context = createContext(libProjFile);
        const provider = createActionProvider(libProjFile);

        const csprojVar = (await provider.getTemplateVariables(context))[CSharpVars.csproj];

        assert.strictEqual(csprojVar.namespace, libProjFile.getFileName(true));
    });

    test("Namesapce detect from RootNamespace", async () => {
        const context = createContext(cliProjFile);
        const provider = createActionProvider(cliProjFile);

        const csprojVar = (await provider.getTemplateVariables(context))[CSharpVars.csproj];

        assert.strictEqual(csprojVar.namespace, "SuperCli");
    });

    test("Commands always empty", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir;
        const commands = await getCommands(
            libProjFile,
            currentDir,
            [
                [currentDir.appendFile("test.cs")],
                []
            ]
        );

        assert.strictEqual(commands.length, 0);
    });

    test("Parent: empty; Current: empty; Siblings: empty => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [],
                [],
                []
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: root; Current: empty; Siblings: empty => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [libProjFile, projDir.appendFile("test.json")],
                [],
                []
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: root; Current: empty; Siblings: assets => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [libProjFile, projDir.appendFile("test.json")],
                [],
                [currentDir.appendFile("Assets", "test.json")]
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: empty; Current: cs; Siblings: assets => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [],
                [currentDir.appendFile("test.cs")],
                [currentDir.appendFile("Assets", "test.json")]
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: cs; Current: empty; Siblings: assets => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [currentDir.getParentDirectory().appendFile("test.cs")],
                [],
                [currentDir.appendFile("Assets", "test.json")]
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: cs; Current: cs; Siblings: assets => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [currentDir.getParentDirectory().appendFile("test.cs")],
                [currentDir.appendFile("test.cs")],
                [currentDir.appendFile("Assets", "test.json")]
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: empty; Current: empty; Siblings: assets => Has cs file", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [],
                [],
                [currentDir.appendDir("dir3").appendFile("test.json")]
            ]
        );

        assert.ok(suggestions.find(s => s.extension === "cs"));
    });

    test("Parent: empty; Current: assets; Siblings: empty => Has not cs files", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [],
                [currentDir.appendFile("test.json")],
                []
            ]
        );

        assert.strictEqual(suggestions.length, 0);
    });

    test("Parent: assets; Current: empty; Siblings: empty => Has not cs files", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1", "dir2");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [currentDir.getParentDirectory().appendFile("test.json")],
                [],
                []
            ]
        );

        assert.strictEqual(suggestions.length, 0);
    });

    test("Parent: root; Current: assets; Siblings: empty => Has not cs files", async () => {
        const projDir = libProjFile.getDirectory();
        const currentDir = projDir.appendDir("dir1");
        const suggestions = await getSuggestions(
            libProjFile,
            currentDir,
            [
                [currentDir.getParentDirectory().appendFile("test.cs")],
                [currentDir.appendFile("test.json")],
                []
            ]
        );

        assert.strictEqual(suggestions.length, 0);
    });


    function createContext(at: Path, files?: Path[][], currentLevelIndex?: number): Context {
        return {
            rootDir: wsRoorDir,
            currentDir: at.getDirectory(),
            currentPath: at,
            files: new ContextFilesMock(files, currentLevelIndex),
            getTemplateVariables(): { [key: string]: any } {
                return {};
            }
        };
    }

    function createActionProvider(csprojFile: Path): CSharpActionProvider {
        return new CSharpActionProvider(
            LoggerMock.instance,
            new CSharpConfig(new Config(ExtensionMock.instance)),
            0,
            csprojFile,
            fsService,
            ActionFactoryMock.instance,
        );
    }

    function getSuggestions(
        csprojFile: Path,
        contextPath: Path,
        files: Path[][],
        currentLevelIndex?: number
    ): Promise<SuggestionAction[]> {
        const context = createContext(contextPath, files, currentLevelIndex);
        const provider = createActionProvider(csprojFile);

        return provider.getSuggestions(context);
    }

    function getCommands(
        csprojFile: Path,
        contextPath: Path,
        files: Path[][],
        currentLevelIndex?: number
    ): Promise<CommandAction[]> {
        const context = createContext(contextPath, files, currentLevelIndex);
        const provider = createActionProvider(csprojFile);

        return provider.getCommands(context);
    }
});