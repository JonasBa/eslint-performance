import { RuleTester } from "eslint";
import { preferUseLayoutEffectRule } from "./prefer-use-layout-effect";

const tester = new RuleTester({
	parser: require.resolve("@typescript-eslint/parser"),
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
});

tester.run("prefer-use-layout-effect", preferUseLayoutEffectRule, {
	valid: [
		{
			code: `const Foo = () => {
useLayoutEffect(() => {
const d = node.getBoundingClientRect();
}, []);

return null;
}`,
		},
	],
	invalid: [
		{
			code: `const Foo = () => {
useEffect(() => {
const d = node.getBoundingClientRect();
}, []);

return null;
}`,
			errors: [
				{
					message:
						"Prefer `useLayoutEffect` over `useEffect` when reading from DOM with `getBoundingClientRect` to avoid causing an extra reflow.",
				},
			],
		},
	],
});
