import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { LoggerMock } from "@tests/mocks/LoggerMock";
import { TestsUtils } from "@tests/TestsUtils";
import { DefaultFileSystemService } from "@src/services/fs/DefaultFileSystemService";
import { ContextFilesImpl } from "@src/wizard/ContextFilesImpl";
import { ContextFiles } from "@src/context/ContextFiles";
import { FileLevel } from "@src/context/FileLevel";

class FilesCase {
    public readonly files: Path[];

    public constructor(
        ...files: Path[]
    ) {
        this.files = files;
    }

    public async run(wsRoorDir: Path, contextPath: Path): Promise<ContextFiles> {
        const files = this.files.map(f => f.uri);
        const oldFindFiles = vscode.workspace.findFiles;

        try {
            vscode.workspace.findFiles = (
                include: vscode.GlobPattern,
                exclude?: vscode.GlobPattern | null,
                maxResults?: number,

                token?: vscode.CancellationToken
            ): Promise<vscode.Uri[]> => {
                return Promise.resolve(files);
            };

            return await ContextFilesImpl.createFromPath(wsRoorDir, contextPath);
        }
        finally {
            vscode.workspace.findFiles = oldFindFiles;
        }
    }
}

suite("ContextFilesImpl", () => {
    let wsRoorDir: Path;

    suiteSetup(async () => {
        wsRoorDir = await TestsUtils.getWsRootDir(TestsUtils.getProjPath("Proj1"));
    });

    test("Basic", async () => {
        const dir1 = wsRoorDir;
        const files11 = wsRoorDir.appendFile("file11.txt");
        const files12 = wsRoorDir.appendFile("file12.txt");

        const dir2 = dir1.appendDir("dir2");

        const dir3 = dir2.appendDir("dir3");
        const files31 = dir3.appendFile("file31.txt");
        const files32 = dir3.appendFile("file32.txt");
        const files33 = dir3.appendFile("file33.txt");

        const dir4 = dir3.appendDir("dir4");
        const files41 = dir4.appendFile("file41.txt");
        const files42 = dir4.appendFile("file42.txt");

        const dir5 = dir3.appendDir("dir5");
        const files51 = dir5.appendFile("file51.txt");
        const files52 = dir5.appendFile("file52.txt");

        const files = await new FilesCase(
            files11,
            files12,
            files31,
            files32,
            files33,
            files41,
            files42,
            files51,
            files52
        ).run(
            wsRoorDir,
            files32
        );

        const rootFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Root));
        const parentFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Parent));
        const currentFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Current));
        const siblingsFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Siblings));

        assert.strictEqual(rootFiles.length, 2);
        assert.strictEqual(parentFiles.length, 0);
        assert.strictEqual(currentFiles.length, 3);
        assert.strictEqual(siblingsFiles.length, 4);

        TestsUtils.assertIfNull(rootFiles.find(f => f.isSame(files11)));
        TestsUtils.assertIfNull(rootFiles.find(f => f.isSame(files12)));

        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(files31)));
        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(files32)));
        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(files33)));

        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(files41)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(files42)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(files51)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(files52)));
    });


    test("Outside level not throw", async () => {
        const files1 = wsRoorDir.appendFile("file1.txt");

        const files = await new FilesCase(
            files1
        ).run(
            wsRoorDir,
            wsRoorDir
        );

        assert.doesNotThrow(() => files.getFiles(-10));
        assert.doesNotThrow(() => files.getFiles(+10));

        const currentFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Current));
    });

    test("RegExp work", async () => {
        const files1 = wsRoorDir.appendFile("file1.txt");
        const files2 = wsRoorDir.appendFile("file2.txtt");
        const files3 = wsRoorDir.appendFile("file3.txt");
        const files4 = wsRoorDir.appendFile("file4.ttxt");
        const files5 = wsRoorDir.appendFile("file5.xml");

        const files = await new FilesCase(
            files1,
            files2,
            files3,
            files4,
            files5
        ).run(
            wsRoorDir,
            wsRoorDir
        );

        const currentFiles = TestsUtils.assertIfNull(files.getByRegExp(FileLevel.Current, ".+\\.txt$"));

        assert.strictEqual(currentFiles.length, 2);

        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(files1)));
        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(files3)));
    });
});

