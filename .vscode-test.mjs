import { defineConfig } from '@vscode/test-cli';
import { fileURLToPath } from "url";
import { dirname } from "path";

const filename = fileURLToPath(import.meta.url);
const currentDir = dirname(filename);
const fixedCwd = currentDir[0].toLowerCase() + currentDir.substring(1);

export default defineConfig({
    tests: [{
        files: "./out/tests/**/*.tests.js",
        srcDir: fixedCwd,
        workspaceFolder: "out/tests/project/project.code-workspace"
    }],
    coverage: {
        includeAll: true,
        include: [
            `${fixedCwd}/out/src/**/*.js`,
        ],
        exclude: [
            // todo fix hardcoding
            `${fixedCwd}/out/src/api/*.*`,
            `${fixedCwd}/out/src/context/*.*`,
            `${fixedCwd}/out/src/extension.js`,
            `${fixedCwd}/out/src/actions/Action.js`,
            `${fixedCwd}/out/src/actions/ActionFactory.js`,
            `${fixedCwd}/out/src/actions/CommandAction.js`,
            `${fixedCwd}/out/src/actions/SuggestionAction.js`,
            `${fixedCwd}/out/src/actions/common/ActionFactoryImpl.js`,
            `${fixedCwd}/out/src/configuration/ExtensionConfig.js`,
            `${fixedCwd}/out/src/configuration/TemplateConfig.js`,
            `${fixedCwd}/out/src/configuration/TemplateItemConfig.js`,
            `${fixedCwd}/out/src/providers/ActionProvider.js`,
            `${fixedCwd}/out/src/providers/TemplateVariablesProvider.js`,
            `${fixedCwd}/out/src/providers/ProvidersFactory.js`,
            `${fixedCwd}/out/src/services/FileCreator.js`,
            `${fixedCwd}/out/src/services/FileSystemService.js`,
            `${fixedCwd}/out/src/tools/Extension.js`,
        ]
    }
});
