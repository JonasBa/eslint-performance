import { Rule } from "eslint";
import { TSESTree } from "@typescript-eslint/experimental-utils";

const arrayFromMapRule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "`Array.from(a, b)` is faster and equal to `Array.from(a).map(b)`",
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
				callee.property.name === "map" &&
				callee.object &&
				callee.object.type === "CallExpression" &&
				callee.object.callee.object &&
				callee.object.callee.object.type === "CallExpression" &&
				callee.object.callee.object.callee.property &&
				callee.object.callee.object.callee.property.name === "from"
			) {
				context.report({
					node,
					message: "Prefer using `Array.from(a, b)` instead of `Array.from(a).map(b)`.",
					fix: (fixer) => {
						const arrayFromArguments = callee.object.arguments.map((arg) => context.getSourceCode().getText(arg));
						const mapArgument = node.arguments.map((arg) => context.getSourceCode().getText(arg));
						const replacement = `Array.from(${arrayFromArguments[0]}, ${mapArgument[0]})`;

						return fixer.replaceText(node, replacement);
					},
				});
			}
		},
	}),
};

export = {
	arrayFromMapRule,
};
