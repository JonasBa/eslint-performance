import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/experimental-utils";

const rule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "`getBoundinggClientRect` is expensive, so it should be used in `useLayoutEffect`.",
			category: "Best Practices",
			recommended: true,
		},
	},
	create: (context) => ({
		CallExpression(node: TSESTree.CallExpression) {
			const { callee } = node;
			if (
				callee.type === "MemberExpression" &&
				callee.object.type === "CallExpression" &&
				callee.object.callee.property &&
				callee.object.callee.property.name === "getBoundingClientRect" &&
				callee.object.callee.object &&
				callee.object.callee.object.type === "ThisExpression" &&
				callee.object.callee.object.type === "Identifier" &&
				callee.object.callee.object.name === "useEffect"
			) {
				context.report({
					node,
					message: "Prefer using useLayoutEffect with getBoundingClientRect.",
				});
			}
		},
	}),
};

export = rule;
