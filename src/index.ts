import { Linter } from "eslint";

import { noUnnecessaryArraySpreadRule } from "./no-unnecessary-array-spread";
import { noImmutableReduceRule } from "./no-immutable-reduce";

export const rules = {
    "no-unnecessary-array-spread": noUnnecessaryArraySpreadRule,
    "no-immutable-reduce": noImmutableReduceRule,
};

// Legacy config format for .eslintrc
const legacyRecommended: Linter.BaseConfig = {
    plugins: ["runtime-complexity"],
    rules: {
        "runtime-complexity/no-unnecessary-array-spread": "warn",
        "runtime-complexity/no-immutable-reduce": "warn",
    },
};

// Flat config format for eslint.config.mjs
const flatRecommended: Linter.FlatConfig = {
    plugins: {
        "runtime-complexity": { rules },
    },
    rules: {
        "runtime-complexity/no-unnecessary-array-spread": "warn",
        "runtime-complexity/no-immutable-reduce": "warn",
    },
};

export const configs = {
    recommended: flatRecommended,
    legacy: legacyRecommended,
};

// Default export for flat config
export default { rules, configs };