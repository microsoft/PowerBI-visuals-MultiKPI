import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";
import tseslint from 'typescript-eslint';

export default [
    ...tseslint.configs.recommended,
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", ".vscode/**", ".tmp/**", "coverage/**", "specs/**", "test.webpack.config.js", "karma.conf.ts"],
    },
];