import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/experimental-utils";

const mapFilterRule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Calling `filter` first reduces the amount of iterations on the `map`.",
			category: "Best Practices",
			recommended: true,
		},
	},
	create: (context) => ({
		CallExpression(node: TSESTree.CallExpression) {
			const { callee } = node;
			if (
				callee.type === "MemberExpression" &&
				callee.property &&
				callee.property.name === "filter" &&
				callee.object &&
				callee.object.type === "CallExpression" &&
				callee.object.callee.property &&
				callee.object.callee.property.name === "map"
			) {
				context.report({
					node,
					message: "Prefer using `.filter().map()` instead of `.map().filter()`.",
					fix: (fixer) => {
						const mapArguments = callee.object.arguments.map((arg) => context.getSourceCode().getText(arg));
						const filterArguments = node.arguments.map((arg) => context.getSourceCode().getText(arg));
						const replacement = `filter(${filterArguments[0]}).map(${mapArguments[0]})`;

						return fixer.replaceText(node, replacement);
					},
				});
			}
		},
	}),
};
export = {
	mapFilterRule,
};
