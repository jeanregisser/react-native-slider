/* @flow */

const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    env: {
        es6: true,
        jest: true,
        jasmine: true,
        "shared-node-browser": true,
    },
    extends: [
        "airbnb",
        "plugin:flowtype/recommended",
        "prettier",
        "prettier/flowtype",
        "prettier/react",
    ],
    parserOptions: {
        ecmaFeatures: {
            impliedStrict: true,
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
    },
    plugins: ["flowtype", "prettier", "react", "react-native-a11y"],
    rules: {
        // builtins
        "class-methods-use-this": OFF,
        "comma-dangle": [ERROR, "always-multiline"],
        "default-case": OFF,
        eqeqeq: [ERROR, "always", {null: "ignore"}],
        "no-case-declarations": OFF,
        "no-extra-boolean-cast": OFF,
        "no-underscore-dangle": OFF,
        "prefer-promise-reject-errors": OFF,
        "sort-imports": OFF,

        // eslint-plugin-flowtype
        "flowtype/delimiter-dangle": [ERROR, "always-multiline"],
        "flowtype/no-dupe-keys": ERROR,
        "flowtype/no-types-missing-file-annotation": ERROR,
        "flowtype/no-weak-types": [
            ERROR,
            {
                any: true,
                Object: true,
                Function: true,
            },
        ],
        "flowtype/require-parameter-type": [
            ERROR,
            {
                excludeArrowFunctions: true,
                excludeParameterMatch: "^_",
            },
        ],
        "flowtype/require-valid-file-annotation": [
            WARN,
            "always",
            {
                annotationStyle: "block",
            },
        ],
        "flowtype/semi": OFF,
        "flowtype/sort-keys": ERROR,
        "no-restricted-imports": [
            ERROR,
            {
                name: "react-native",
                importNames: ["Image", "ImageBackground"],
                message:
                    "please use @nfl/rn-components Image/ImageBackground component instead",
            },
        ],

        // eslint-plugin-import
        "import/first": OFF,
        "import/prefer-default-export": OFF,
        "import/no-extraneous-dependencies": [
            ERROR,
            {
                devDependencies: [
                    "**/{shell,config,storybook}/**", // nfl
                    "**/test/**", // tape, common npm pattern
                    "**/__stor{y,ies}__/**", // storybook
                    "**/story.{js,jsx}", // storybook
                    "**/tests/**", // also common npm pattern
                    "**/specs/**", // mocha, rspec-like pattern
                    "**/__{tests,snapshots}__/**", // jest pattern
                    "test.{js,jsx}", // repos with a single test file
                    "test-*.{js,jsx}", // repos with multiple top-level test files
                    "**/*.{test,spec}.{js,jsx}", // tests where the extension denotes that it is a test
                    "**/e2e/**", // detox e2e integration setup
                    "**/jest.config.js", // jest config
                    "**/webpack.config.js", // webpack config
                    "**/webpack.config.*.js", // webpack config
                    "**/rollup.config.js", // rollup config
                    "**/rollup.config.*.js", // rollup config
                    "**/gulpfile.js", // gulp config
                    "**/gulpfile.*.js", // gulp config
                    "**/Gruntfile{,.js}", // grunt config
                    "**/protractor.conf.js", // protractor config
                    "**/protractor.conf.*.js", // protractor config
                    "**/*.config.js", // React Native config
                ],
                optionalDependencies: false,
            },
        ],
        "import/order": OFF,

        // eslint-plugin-jsx-a11y
        "jsx-a11y/accessible-emoji": OFF,

        // eslint-plugin-react
        "react/default-props-match-prop-types": OFF,
        "react/destructuring-assignment": OFF,
        "react/no-unescaped-entities": OFF,
        "react/no-unused-prop-types": OFF,
        "react/jsx-boolean-value": OFF,
        "react/jsx-filename-extension": OFF,
        // Enforce props alphabetical sorting
        // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md
        "react/jsx-sort-props": [
            ERROR,
            {
                ignoreCase: false,
                callbacksLast: true,
                shorthandFirst: true,
            },
        ],
        "react/require-default-props": OFF,
        "react/sort-comp": [
            ERROR,
            {
                order: [
                    "lifecycle",
                    "/^on.+$/",
                    "/^get.+$/",
                    "everything-else",
                    "rendering",
                ],
                groups: {
                    lifecycle: [
                        "constructor",
                        "displayName",
                        "state",
                        "contextTypes",
                        "childContextTypes",
                        "props",
                        "propTypes",
                        "defaultProps",
                        "static-methods",
                        "componentWillMount",
                        "componentDidMount",
                        "componentWillReceiveProps",
                        "shouldComponentUpdate",
                        "/^should.+$/",
                        "componentWillUpdate",
                        "componentDidUpdate",
                        "componentWillReact",
                        "/^component(Will|Did).+$/",
                        "componentWillUnmount",
                    ],
                    rendering: ["/^render.+$/", "render"],
                },
            },
        ],

        // eslint-plugin-react-native-a11y
        "react-native-a11y/accessibility-label": WARN,
        "react-native-a11y/has-accessibility-props": WARN,
        "react-native-a11y/has-valid-accessibility-component-type": WARN,
        "react-native-a11y/has-valid-accessibility-traits": WARN,
        "react-native-a11y/has-valid-important-for-accessibility": WARN,
        "react-native-a11y/no-nested-touchables": WARN,

        // eslint-plugin-prettier
        "prettier/prettier": [
            ERROR,
            {
                printWidth: 80,
                tabWidth: 4,
                singleQuote: false,
                trailingComma: "es5",
                bracketSpacing: false,
                semi: true,
                useTabs: false,
                jsxBracketSameLine: false,
            },
        ],

        // eslint-plugin-unicorn
        "unicorn/no-abusive-eslint-disable": ERROR,

        // LEGACY
        yoda: [ERROR, "never"],
        "no-cond-assign": [ERROR, "except-parens"],
    },
};
