import { Linter } from "eslint";

import { noUnnecessaryArraySpreadRule } from "./no-unnecessary-array-spread.js";
import { noImmutableReduceRule } from "./no-immutable-reduce.js";
import { noQuadraticLoopOperationsRule } from "./no-quadratic-loop-operations.js";

export const rules = {
    "no-unnecessary-array-spread": noUnnecessaryArraySpreadRule,
    "no-immutable-reduce": noImmutableReduceRule,
    "no-quadratic-loop-operations": noQuadraticLoopOperationsRule,
};

// Legacy config format for .eslintrc
const legacyRecommended: Linter.BaseConfig = {
    plugins: ["runtime-complexity"],
    rules: {
        "runtime-complexity/no-unnecessary-array-spread": "warn",
        "runtime-complexity/no-immutable-reduce": "warn",
        "runtime-complexity/no-quadratic-loop-operations": "warn",
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
        "runtime-complexity/no-quadratic-loop-operations": "warn",
    },
};

export const configs = {
    recommended: flatRecommended,
    legacy: legacyRecommended,
};

// Default export for flat config
export default { rules, configs };