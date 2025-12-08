import { Linter } from "eslint";
export declare const rules: {
    "no-unnecessary-array-spread": import("eslint").Rule.RuleModule;
    "no-immutable-reduce": import("eslint").Rule.RuleModule;
    "no-quadratic-loop-operations": import("eslint").Rule.RuleModule;
};
export declare const configs: {
    recommended: Linter.FlatConfig;
    legacy: Linter.BaseConfig<Linter.RulesRecord, Linter.RulesRecord>;
};
declare const _default: {
    rules: {
        "no-unnecessary-array-spread": import("eslint").Rule.RuleModule;
        "no-immutable-reduce": import("eslint").Rule.RuleModule;
        "no-quadratic-loop-operations": import("eslint").Rule.RuleModule;
    };
    configs: {
        recommended: Linter.FlatConfig;
        legacy: Linter.BaseConfig<Linter.RulesRecord, Linter.RulesRecord>;
    };
};
export default _default;
