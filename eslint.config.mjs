import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import stylistic from '@stylistic/eslint-plugin';

export default [
    {
        files: ["**/*.ts"]
    },
    {
        ignores: [
            "**/*.js",
            "**/*.mjs"
        ],

        plugins: {
            "@typescript-eslint": typescriptEslint,
            '@stylistic': stylistic,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            curly: "warn",
            eqeqeq: "warn",
            semi: ["warn", "always"],

            "@stylistic/array-element-newline": ["warn", "consistent"],
            "@stylistic/arrow-spacing": ["warn", { before: true, after: true }],
            "@stylistic/block-spacing": "warn",
            "@stylistic/brace-style": ["warn", "stroustrup"],
            "@stylistic/comma-spacing": ["warn", { "before": false, "after": true }],
            "@stylistic/comma-style": ["warn", "last"],
            "@stylistic/computed-property-spacing": ["warn", "never"],
            "@stylistic/curly-newline": ["warn", "always"],
            "@stylistic/dot-location": ["warn", "property"],
            "@stylistic/function-call-argument-newline": ["warn", "consistent"],
            "@stylistic/function-call-spacing": ["warn", "never"],
            "@stylistic/indent": ["warn", 4],
            "@stylistic/indent-binary-ops": ["warn", 4],
            "@stylistic/key-spacing": ["warn", { "afterColon": true }],
            "@stylistic/keyword-spacing": ["warn", { "before": true, "after": true }],
            "@stylistic/max-statements-per-line": ["warn", { "max": 1 }],
            "@stylistic/member-delimiter-style": ["warn"],
            "@stylistic/new-parens": "warn",
            "@stylistic/no-confusing-arrow": "warn",
            "@stylistic/no-extra-semi": "warn",
            "@stylistic/no-floating-decimal": "warn",
            "@stylistic/no-mixed-spaces-and-tabs": "warn",
            "@stylistic/no-multi-spaces": "warn",
            "@stylistic/no-multiple-empty-lines": "warn",
            "@stylistic/no-tabs": "warn",
            "@stylistic/no-trailing-spaces": "warn",
            "@stylistic/no-whitespace-before-property": "warn",
            "@stylistic/nonblock-statement-body-position": ["warn", "below"],
            "@stylistic/object-curly-newline": ["warn", { "consistent": true }],
            "@stylistic/object-curly-spacing": ["warn", "always"],
            "@stylistic/operator-linebreak": ["warn", "before"],
            "@stylistic/padded-blocks": ["warn", "never"],
            "@stylistic/padding-line-between-statements": "warn",
            "@stylistic/quotes": ["warn", "double"],
            "@stylistic/rest-spread-spacing": ["warn", "never"],
            "@stylistic/semi": "warn",
            "@stylistic/semi-spacing": ["warn", { "before": false, "after": true }],
            "@stylistic/space-before-blocks": "warn",
            "@stylistic/space-in-parens": ["warn", "never"],
            "@stylistic/space-infix-ops": "warn",
            "@stylistic/spaced-comment": ["warn", "always"],
            "@stylistic/switch-colon-spacing": "warn",
            "@stylistic/template-curly-spacing": "warn",
            "@stylistic/template-tag-spacing": "warn",
            //"@stylistic/ts/type-annotation-spacing": "warn",
            "@stylistic/type-generic-spacing": ["warn"],
            "@stylistic/type-named-tuple-spacing": ["warn"],

            "@stylistic/space-before-function-paren": [
                "warn",
                {
                    "anonymous": "always",
                    "named": "never",
                    "asyncArrow": "always"
                }
            ],

            "@stylistic/lines-between-class-members": [
                "warn",
                {
                    "enforce": [
                        { "blankLine": "always", "prev": "*", "next": "method" },
                        { "blankLine": "always", "prev": "method", "next": "method" }
                    ]
                }
            ],


            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/explicit-member-accessibility": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-extra-non-null-assertion": "error",
            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-unnecessary-parameter-property-assignment": "warn",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-wrapper-object-types": "warn",

            //"@typescript-eslint/no-confusing-void-expression": "error",
            //"@typescript-eslint/no-unnecessary-condition": "warn",
            //"@typescript-eslint/no-unsafe-enum-comparison": "warn",
            //"no-throw-literal": "off",
            //"@typescript-eslint/only-throw-error": "error",

            "@typescript-eslint/ban-ts-comment": [
                "warn",
                { "ts-ignore": "allow-with-description"}
            ],

            "@typescript-eslint/consistent-indexed-object-style": [
                "warn",
                "index-signature"
            ],

            "@typescript-eslint/method-signature-style": [
                "error",
                "method"
            ],

            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "import",
                    format: ["camelCase", "PascalCase"],
                },
                {
                    selector: "interface",
                    format: ["PascalCase"],
                    custom: {
                        "regex": "^I[A-Z]",
                        "match": false,
                    }
                },
                {
                    selector: "typeParameter",
                    format: ["PascalCase"],
                    prefix: ["T"]
                },
                {
                    selector: ["class", "enum", "typeAlias"],
                    format: ["PascalCase"],
                },
                {
                    selector: ["enumMember"],
                    format: ["PascalCase"],
                },
                {
                    selector: ["variable"],
                    format: ["UPPER_CASE"],
                    modifiers: ["global", "const"]
                },
                {
                    selector: ["default"],
                    format: ["camelCase"],
                },
            ]
        },
    }
];