import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { TestsUtils } from "@tests/TestsUtils";
import { CSharpActionProvider } from "@src/services/csharp/CSharpActionProvider";
import { DefaultFileSystemService } from "@src/services/fs/DefaultFileSystemService";
import { CSharpVars } from "@src/services/csharp/CSharpVars";
import { Utils } from "@src/tools/Utils";
import { ContextFilesImpl } from "@src/wizard/ContextFilesImpl";
import { Context } from "@src/context/Context";
import { CSharpConfig } from "@src/services/csharp/CSharpConfig";
import { SuggestionAction } from "@src/actions/SuggestionAction";
import { ContextFilesMock } from "@tests/mocks/ContextFilesMock";

suite("CSharpContextHandler", () => {
    let wsRoorDir: Path;
    const csRootDir: Path = TestsUtils.getProjPath("CSharpProj");
    const cliProjFile: Path = csRootDir.appendFile("Src", "Proj1.Cli", "Proj1.Cli.csproj");
    const libProjFile: Path = csRootDir.appendFile("Src", "Proj1.Lib", "Proj1.Lib.csproj");

    const fsService = new DefaultFileSystemService(
        LoggerMock.instance,
    );

    suiteSetup(async () => {
        wsRoorDir = await TestsUtils.getWsRootDir(csRootDir);
    });

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

    function createContext(at: Path, files?: Path[][]): Context {
        return {
            rootDir: wsRoorDir,
            currentDir: at.getDirectory(),
            currentPath: at,
            files: new ContextFilesMock(),
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

    /*function getSuggestions(
        workspaceDir: Path,
        csprojFile: Path,
        contextPath: Path,
        files?: Path[]
    ): Promise<SuggestionAction[]> {
        ContextFilesImpl.createFromFiles(
            workspaceDir, files,
        )
        const context = createContext(contextPath, files);
        const provider = createActionProvider(csprojFile);

        return provider.getSuggestions(context);
    }*/
});