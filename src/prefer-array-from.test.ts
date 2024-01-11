import { RuleTester } from "eslint";
import { preferArrayFromRule } from "./prefer-array-from";

const tester = new RuleTester({
	parser: require.resolve("@typescript-eslint/parser"),
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

tester.run("prefer-array-from", preferArrayFromRule, {
	valid: [],
	invalid: [
		{
			code: "Array.from(a).map(a => a)",
			errors: [
				{
					message:
						"Prefer using `Array.from(arr, a => a)` over `Array.from(arr).map(a => a)` to avoid an unnecessary function call while keeping functionality equal.",
				},
			],
			// output: "Array.from(a, a => a)",
		},
	],
});
