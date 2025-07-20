import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "@src/tools/Path";
import { TestsUtils } from "@tests/TestsUtils";
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
    const wsRoorDir = TestsUtils.getWsRootDir(TestsUtils.getProjPath("Proj1"));

    test("Basic", async () => {
        const dir1 = wsRoorDir;
        const file11 = wsRoorDir.appendFile("file11.txt");
        const file12 = wsRoorDir.appendFile("file12.txt");

        const dir2 = dir1.appendDir("dir2");

        const dir3 = dir2.appendDir("dir3");
        const file31 = dir3.appendFile("file31.txt");
        const file32 = dir3.appendFile("file32.txt");
        const file33 = dir3.appendFile("file33.txt");

        const dir4 = dir3.appendDir("dir4");
        const file41 = dir4.appendFile("file41.txt");
        const file42 = dir4.appendFile("file42.txt");

        const dir5 = dir3.appendDir("dir5");
        const file51 = dir5.appendFile("file51.txt");
        const file52 = dir5.appendFile("file52.txt");

        const files = await new FilesCase(
            file11,
            file12,
            file31,
            file32,
            file33,
            file41,
            file42,
            file51,
            file52
        ).run(
            wsRoorDir,
            file32
        );

        const rootFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Root));
        const parentFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Parent));
        const currentFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Current));
        const siblingsFiles = TestsUtils.assertIfNull(files.getFiles(FileLevel.Siblings));

        assert.strictEqual(rootFiles.length, 2);
        assert.strictEqual(parentFiles.length, 0);
        assert.strictEqual(currentFiles.length, 3);
        assert.strictEqual(siblingsFiles.length, 4);

        TestsUtils.assertIfNull(rootFiles.find(f => f.isSame(file11)));
        TestsUtils.assertIfNull(rootFiles.find(f => f.isSame(file12)));

        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(file31)));
        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(file32)));
        TestsUtils.assertIfNull(currentFiles.find(f => f.isSame(file33)));

        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(file41)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(file42)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(file51)));
        TestsUtils.assertIfNull(siblingsFiles.find(f => f.isSame(file52)));
    });

    test("Create empty levels", async () => {
        const file = wsRoorDir.appendFile("file1.txt");

        const files = await new FilesCase(
            file
        ).run(
            wsRoorDir,
            wsRoorDir.appendDir("dir1", "dir2")
        );

        assert.strictEqual(files.getFiles(1)?.length, 0);
        assert.strictEqual(files.getFiles(0)?.length, 0);
        assert.strictEqual(files.getFiles(-1)?.length, 0);
        assert.strictEqual(files.getFiles(-2)?.length, 1);

        const testFile = TestsUtils.assertIfNull(files.getFiles(-2))[0];

        assert.ok(testFile.isSame(file));
    });

    test("Outside level not throw", async () => {
        const file = wsRoorDir.appendFile("file.txt");

        const files = await new FilesCase(
            file
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

