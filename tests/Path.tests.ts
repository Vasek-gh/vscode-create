import * as vscode from "vscode";
import * as assert from "assert";
import path from "path";
import { Path } from "@src/shared/Path";
import { ExtensionMock } from "./mocks/ExtensionMock";

suite("Path", () => {
    test("File", () => {
        const basename = "dummy";
        const extension = "txt";
        const filename = `${basename}.${extension}`;
        const dir = getExtensionDir();
        const path = dir.appendFile(filename);

        assert.strictEqual(path.isFile(), true);
        assert.strictEqual(path.isDirectory(), false);
        assert.strictEqual(path.hasExtension(extension), true);
        assert.strictEqual(path.hasExtension(extension.substring(0, 2)), false);
        assert.strictEqual(path.getDirectory().fullPath, dir.fullPath);
        assert.strictEqual(path.getParentDirectory().fullPath, dir.fullPath);
        assert.strictEqual(path.getRelative(dir), filename);
        assert.strictEqual(path.getFileName(false), filename);
        assert.strictEqual(path.getFileName(true), basename);
        assert.strictEqual(path.getExtension(false), "." + extension);
        assert.strictEqual(path.getExtension(true), extension);

        assert.throws(() => path.appendDir("qwerty"), Error);
        assert.throws(() => path.appendFile("qwerty.txt"), Error);
    });

    test("Directory", () => {
        const basename = "dummy";
        const extension = "txt";
        const dirName = `${basename}.${extension}`;
        const dir = getExtensionDir();
        const path = dir.appendDir(dirName);

        assert.strictEqual(path.isFile(), false);
        assert.strictEqual(path.isDirectory(), true);
        assert.strictEqual(path.hasExtension(extension), false);
        assert.strictEqual(path.hasExtension(extension.substring(0, 2)), false);
        assert.strictEqual(path.getDirectory().fullPath, dir.appendDir(dirName).fullPath);
        assert.strictEqual(path.getParentDirectory().fullPath, dir.fullPath);
        assert.strictEqual(path.getRelative(dir), dirName);
        assert.strictEqual(path.getFileName(false), dirName);
        assert.strictEqual(path.getFileName(true), dirName);
        assert.strictEqual(path.getExtension(false), "");
        assert.strictEqual(path.getExtension(true), "");
        assert.strictEqual(path.appendDir("qwerty").isFile(), false);
        assert.strictEqual(path.appendFile("qwerty.txt").isFile(), true);

        assert.doesNotThrow(() => path.appendDir("qwerty"), Error);
        assert.doesNotThrow(() => path.appendFile("qwerty.txt"), Error);
    });

    test("Driver case", () => {
        const uriUpper = vscode.Uri.file("C:\\somedir\\qwerty.txt");
        const pathUpper = Path.fromFile(uriUpper);
        const uriLower = vscode.Uri.file("c:\\somedir\\qwerty.txt");
        const pathLower = Path.fromFile(uriLower);

        assert.notStrictEqual(uriLower.path, uriUpper.path);

        assert.ok(pathLower.isSame(pathUpper), "isSame");
    });

    test("Query and fragment unsupported", () => {
        assert.throws(
            () =>
                Path.fromDir(vscode.Uri.from({
                    scheme: "scheme",
                    path: "/path",
                    authority: "authority",
                    query: "query"
                })),
            Error
        );

        assert.throws(
            () =>
                Path.fromDir(vscode.Uri.from({
                    scheme: "scheme",
                    path: "/path",
                    authority: "authority",
                    fragment: "fragment"
                })),
            Error
        );
    });

    const isSameTestCases = [
        {
            a: { scheme: "scheme1", path: "/path", authority: "authority" },
            b: { scheme: "scheme1", path: "/path", authority: "authority" },
            expected: true
        },
        {
            a: { scheme: "scheme1", path: "/path", authority: "authority" },
            b: { scheme: "scheme2", path: "/path", authority: "authority" },
            expected: false
        },
        {
            a: { scheme: "scheme1", path: "/path", authority: "authority1" },
            b: { scheme: "scheme1", path: "/path", authority: "authority2" },
            expected: false
        },
        {
            a: { scheme: "scheme1", path: "/path1", authority: "authority1" },
            b: { scheme: "scheme1", path: "/path2", authority: "authority1" },
            expected: false
        },
    ];

    for (const isSameTestCase of isSameTestCases) {
        const aPath = Path.fromFile(vscode.Uri.from(isSameTestCase.a));
        const bPath = Path.fromFile(vscode.Uri.from(isSameTestCase.b));

        const caseOp = isSameTestCase.expected ? "==" : "!=";
        const caseCaption = `${aPath} ${caseOp} ${bPath}`;

        test(`IsSame: ${caseCaption}`, () => {
            assert.ok(aPath.isSame(bPath) === isSameTestCase.expected);
        });
    }

    function getExtensionDir(): Path {
        const extension = vscode.extensions.getExtension(new ExtensionMock().id); // todo get from mock
        if (!extension) {
            assert.ok(false, `extension is emtpy: ${extension}`);
        }

        const extensionUri = extension.extensionUri;
        if (!extensionUri) {
            assert.ok(false, `extensionUri is emtpy: ${extensionUri}`);
        }

        return Path.fromDir(extensionUri);
    }
});