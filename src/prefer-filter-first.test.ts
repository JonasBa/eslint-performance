import { RuleTester } from "eslint";
import { preferFilterFirstRule } from "./prefer-filter-first";

const tester = new RuleTester({
	parser: require.resolve("@typescript-eslint/parser"),
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

tester.run("prefer-filter-first", preferFilterFirstRule, {
	valid: [],
	invalid: [
		{
			code: "arr.map(a => a).filter(a => !a)",
			errors: [
				{
					message:
						"Prefer using `arr.filter(a => !a).map(a => a)` instead of `arr.map(a => a).filter(a => !a)` to reduce the iterations the `map` runs over.",
				},
			],
		},
	],
});
