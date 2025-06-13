import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: "out/tests/**/*.tests.js",
    workspaceFolder: "out/tests/project/project.code-workspace",
    mocha: {
        require: [ "./out/tests/MochaHooks.js" ],
    },
    coverage: {
        output: "./cov",
        includeAll: true,
        include: [
            "out/src/**/*.js"
        ]
    }
});
