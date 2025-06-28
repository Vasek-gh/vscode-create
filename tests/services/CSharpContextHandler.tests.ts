import * as vscode from "vscode";
import * as assert from "assert";
import path from "path";
import { Path } from "@src/shared/Path";
import { Config } from "@src/configuration/Config";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { TestsUtils } from "@tests/TestsUtils";
import { DefaultFileCreator } from "@src/services/fs/DefaultFileCreator";
import { FileSystemServiceMock } from "../mocks/FileSystemServiceMock";
import { ContextBuilder } from "@src/context/ContextBuilder";
import { CSharpActionProvider } from "@src/services/csharp/CSharpActionProvider";
import { DefaultFileSystemService } from "@src/services/fs/DefaultFileSystemService";
import { CSharpVars } from "@src/services/csharp/CSharpVars";
import { Utils } from "@src/tools/Utils";

suite("CSharpContextHandler", () => {
    /*let wsRoorDir: Path;
    const csRootDir: Path = TestsUtils.getProjPath("CSharpProj");
    const cliProjFile: Path = csRootDir.appendFile("Src", "Proj1.Cli", "Proj1.Cli.csproj");
    const libProjFile: Path = csRootDir.appendFile("Src", "Proj1.Lib", "Proj1.Lib.csproj");

    const fsService = new DefaultFileSystemService(
        LoggerMock.instance,
    );

    const handler = new CSharpActionProvider(
        LoggerMock.instance,
        new Config(ExtensionMock.instance),
        fsService,
        ActionFactoryMock.instance,
    );

    suiteSetup(async () => {
        wsRoorDir = await TestsUtils.getWsRootDir(csRootDir);

        console.log(`Q1: ${wsRoorDir.fullPath}`);
        console.log(`Q2: ${libProjFile.fullPath}`);
        if (vscode.workspace.workspaceFolders) {
            console.log(`Q3: ${vscode.workspace.workspaceFolders[2]?.uri ?? "qqqq"}`);
            console.log(`Q3: ${vscode.workspace.workspaceFolders[2]?.uri.fsPath ?? "qqqq"}`);
            const dir = Path.fromDir(vscode.workspace.workspaceFolders[2]?.uri);
            console.log(`Q4: ${dir.fullPath}`);
            console.log(`Q4: ${dir.uri.path}`);
            console.log(`Q4: ${dir.uri.fsPath}`);
        }
    });

    test("Csproj vars", async () => {
        const ctx = await execute(libProjFile);
        const csprojVar = ctx.getVar<any>(CSharpVars.csproj);
        const fileVars = Utils.getFileVars(libProjFile, wsRoorDir);

        assert.strictEqual(csprojVar.fullName, fileVars.fullName);
        assert.strictEqual(csprojVar.baseName, fileVars.baseName);
        assert.strictEqual(csprojVar.fullDir, fileVars.fullDir);
        assert.strictEqual(csprojVar.baseDir, fileVars.baseDir);
    });

    test("Namesapce detect from filename", async () => {
        const ctx = await execute(libProjFile);
        const csprojVar = ctx.getVar<any>(CSharpVars.csproj);

        assert.strictEqual(csprojVar.namespace, libProjFile.getFileName(true));
    });

    test("Namesapce detect from RootNamespace", async () => {
        const ctx = await execute(cliProjFile);
        const csprojVar = ctx.getVar<any>(CSharpVars.csproj);

        assert.strictEqual(csprojVar.namespace, "SuperCli");
    });

    async function execute(
        at: Path,
        parentFiles?: string[],
        currentFiles?: string[],
        siblingsFiles?: string[]
    ): Promise<InternalContext> {
        const parentFilesInfo = (parentFiles ?? []).map(toFileInfo);
        const currentFilesInfo = (currentFiles ?? []).map(toFileInfo);
        const siblingsFilesInfo = (siblingsFiles ?? []).map(toFileInfo);

        const context = new InternalContext(
            LoggerMock.instance,
            ActionFactoryMock.instance,
            wsRoorDir,
            at,
            new FilesInfo(parentFilesInfo, currentFilesInfo, siblingsFilesInfo),
        );

        await handler.execute(context, []);

        return context;
    }

    function toFileInfo(file: string): FileNameInfo {
        return {
            name: path.basename(file),
            extension: path.extname(file)
        }
    }*/
});