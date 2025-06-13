import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/utils/Path";
import { Config } from "@src/configuration/Config";
import { FileCreatorMock } from "@tests/mocks/FileCreatorMock";
import { FileSuggestion } from "@src/actions/FileSuggestion";
import { ExtensionMock } from "@tests/mocks/ExtensionMock";
import { InputInfo } from "@src/actions/InputInfo";
import { Context } from "@src/context/Context";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { ActionFactoryMock } from "@tests/mocks/ActionFactoryMock";
import { FilesInfo } from "@src/context/FilesInfo";
import { TestsUtils } from "@tests/TestsUtils";
import { DefaultFileCreator } from "@src/fs/DefaultFileCreator";
import { FileSystemServiceMock } from "./mocks/FileSystemServiceMock";
import { DefaultFileSystemService } from "./fs/DefaultFileSystemService";

suite("FileCreator", () => {
    const contextMock = new Context(
        LoggerMock.instance,
        new ActionFactoryMock(undefined, undefined),
        TestsUtils.getProjPath("Proj1"),
        new FilesInfo([], [], [])
    );

    const fsServiceMock = new FileSystemServiceMock(
        new DefaultFileSystemService()
    );

    const fileCreator = new DefaultFileCreator(
        LoggerMock.instance,
        ExtensionMock.instance,
        fsServiceMock
    );

    setup(() => {

    });

    test("qqq", async () => {
        vscode.window.showErrorMessage = async (message: string, ...items: any[]): Promise<any | undefined> => {
            console.log(`Error message ${message}`);
        };

        vscode.window.showErrorMessage("ololo");
    });
});