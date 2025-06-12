import * as vscode from "vscode";
import * as assert from "assert";
import { Path } from "../src/utils/Path";
import { TestExtension } from "./mocks/TestExtension";

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

    function getExtensionDir(): Path {
        const extension = vscode.extensions.getExtension(new TestExtension().id);
        if (!extension) {
            assert.ok(false, `extension is emtpy: ${extension}`);
        }

        const extensionUri = extension.extensionUri;
        if (!extensionUri) {
            assert.ok(false, `extensionUri is emtpy: ${extensionUri}`);
        }

        return new Path(extensionUri, vscode.FileType.Directory);
    }
});