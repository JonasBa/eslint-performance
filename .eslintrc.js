module.exports = {
    env: {
      node: true,
    },
    parser: "@typescript-eslint/parser",
    extends: ["plugin:eslint-plugin/recommended", "plugin:prettier/recommended"],
    parserOptions: {
      project: "./tsconfig.json",
    },
  };