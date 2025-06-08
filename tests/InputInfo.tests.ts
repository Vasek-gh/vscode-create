import * as assert from "assert";
import { InputInfo } from "../src/actions/InputInfo";

suite("InputInfo", () => {
    const parseTestCases = [
        { input: "dir/", expected: inputInfo("dir", undefined, undefined, undefined), filename: "dir/" },
        { input: "/dir/", expected: inputInfo("dir", undefined, undefined, undefined), filename: "dir/" },
        { input: "/dir/dir/", expected: inputInfo("dir/dir", undefined, undefined, undefined), filename: "dir/dir/" },
        { input: "./dir/dir/", expected: inputInfo("./dir/dir", undefined, undefined, undefined), filename: "./dir/dir/" },
        { input: "./dir/../dir/", expected: inputInfo("./dir/../dir", undefined, undefined, undefined), filename: "./dir/../dir/" },
        { input: "\\dir/dir\\dir\\", expected: inputInfo("dir/dir/dir", undefined, undefined, undefined), filename: "dir/dir/dir/" },
        { input: "dir/fn", expected: inputInfo("dir", "fn", undefined, undefined), filename: "dir/fn" },
        { input: "dir/.ext", expected: inputInfo("dir", ".ext", undefined, undefined), filename: "dir/.ext" },
        { input: "dir/:tm", expected: inputInfo("dir", undefined, undefined, "tm"), filename: "dir/" },
        { input: "fn", expected: inputInfo(undefined, "fn", undefined, undefined), filename: "fn" },
        { input: "fn.ext", expected: inputInfo(undefined, "fn", "ext", undefined), filename: "fn.ext" },
        { input: ".ext", expected: inputInfo(undefined, ".ext", undefined, undefined), filename: ".ext" },
        { input: "fn:tm", expected: inputInfo(undefined, "fn", undefined, "tm"), filename: "fn" },
        { input: ".ext:tm", expected: inputInfo(undefined, ".ext", undefined, "tm"), filename: ".ext" },
        { input: "dir/ fn.ext : tm", expected: inputInfo("dir", "fn", "ext", "tm"), filename: "dir/fn.ext" },
        { input: "dir/.ext:tm", expected: inputInfo("dir", ".ext", undefined, "tm"), filename: "dir/.ext" },
        { input: ":tm", expected: inputInfo(undefined, undefined, undefined, "tm"), filename: "" },
        { input: "fn.ext: tm :fn.ext : tm", expected: inputInfo(undefined, "fn", "ext", "tm :fn.ext : tm"), filename: "fn.ext" },
    ];

    for (const testCase of parseTestCases) {
        test(`Parse: ${testCase.input}: ${testCase.expected.toString()}`, () => {
            const actual = InputInfo.parse(testCase.input);
            assert.strictEqual(actual.toString(), testCase.expected.toString());
            assert.strictEqual(actual.getFilename(), testCase.filename);
        });
    }

    function inputInfo(directory?: string, name?: string, extension?: string, template?: string): InputInfo {
        return new InputInfo(
            directory,
            name,
            extension,
            template
        );
    }
});