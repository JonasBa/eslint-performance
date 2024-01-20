import { Linter } from "eslint";

import { noUnnecessaryArraySpreadRule } from "./no-unnecessary-array-spread";
import { noImmutableReduceRule } from "./no-immutable-reduce";
import { preferUseLayoutEffectRule } from "./prefer-use-layout-effect";
import { preferArrayFromRule } from "./prefer-array-from";
import { preferFilterFirstRule } from "./prefer-filter-first";

const recommended: Linter.BaseConfig = {
	plugins: ["eslint-performance"],
	rules: {
		"eslint-performance/no-unnecessary-array-spread": "warn",
		"eslint-performance/no-immutable-reduce": "warn",
		"eslint-performance/prefer-array-from": "warn",
		"eslint-performance/prefer-filter-first": "warn",
	},
};

const react: Linter.BaseConfig = {
	plugins: ["eslint-performance"],
	rules: {
		"eslint-performance/prefer-use-layout-effect": "warn",
	},
};

export const configs = {
	recommended,
	react,
};

export const rules = {
	"no-unnecessary-array-spread": noUnnecessaryArraySpreadRule,
	"no-immutable-reduce": noImmutableReduceRule,
	"prefer-use-layout-effect": preferUseLayoutEffectRule,
	"prefer-array-from": preferArrayFromRule,
	"prefer-filter-first": preferFilterFirstRule,
};
