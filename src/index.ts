import { Linter } from "eslint";

import { noUnnecessaryArraySpreadRule } from "./no-unnecessary-array-spread";
import { noImmutableReduceRule } from "./no-immutable-reduce";

const recommended: Linter.BaseConfig = {
    plugins: ["eslint-performance"],
    rules: {
        "eslint-performance/no-unnecessary-array-spread": "warn",
        "eslint-performance/no-immutable-reduce": "warn",
    },
};

export const configs = {
    recommended,
};

export const rules = {
    "no-unnecessary-array-spread": noUnnecessaryArraySpreadRule,
    "no-immutable-reduce": noImmutableReduceRule,
};