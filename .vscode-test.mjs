import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: "out/tests/**/*.tests.js",
    workspaceFolder: "tests/project/project.code-workspace",
    mocha: {
        require: [ "./out/tests/MochaHooks.js" ],
    }
});
