import { Rule } from "eslint";

export const preferUseLayoutEffectRule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"`getBoundinggClientRect` causes [reflow](https://webperf.tips/tip/layout-thrashing/#react-development), so reading from DOM should be done in `useLayoutEffect`.",
			category: "Best Practices",
			recommended: true,
		},
	},
	create: (context) => ({
		CallExpression(node) {
			if (
				node.callee.type !== "MemberExpression" ||
				node.callee.property.type !== "Identifier" ||
				node.callee.property.name !== "getBoundingClientRect"
			)
				return;

			if (
				!node.parent ||
				!node.parent.parent ||
				!node.parent.parent.parent ||
				!node.parent.parent.parent.parent
			)
				return;

			const parent = node.parent.parent.parent.parent;

			if (
				parent.type !== "ArrowFunctionExpression" &&
				parent.type !== "FunctionExpression"
			)
				return;

			if (!parent.parent) return;

			const maybeUseEffect = parent.parent;

			if (
				maybeUseEffect.type !== "CallExpression" ||
				maybeUseEffect.callee.type !== "Identifier" ||
				maybeUseEffect.callee.name !== "useEffect"
			)
				return;

			context.report({
				node,
				message:
					"Prefer `useLayoutEffect` over `useEffect` when reading from DOM with `getBoundingClientRect` to avoid causing an extra reflow.",
			});
		},
	}),
};
