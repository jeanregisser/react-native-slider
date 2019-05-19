/* @flow */

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require("path");

module.exports = {
    projectRoot: path.resolve(__dirname),
    watchFolders: [
        // Let's add the root folder to the watcher
        // for live reload purpose
        path.resolve(__dirname, "../src"),
    ],
    resolver: {
        extraNodeModules: new Proxy(
            {},
            {
                get: (target, name) =>
                    path.join(process.cwd(), `node_modules/${name}`),
            }
        ),
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
    },
};
