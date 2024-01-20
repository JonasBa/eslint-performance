import { Rule } from "eslint";

export const preferFilterFirstRule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Calling `filter` first reduces the amount of iterations on the `map`.",
			category: "Best Practices",
			recommended: true,
		},
		// fixable: "code",
	},
	create: (context) => ({
		CallExpression(node) {
			if (node.callee.type !== "MemberExpression") {
				return;
			}

			const callee = node.callee;
			if (
				callee.property.type !== "Identifier" ||
				callee.property.name !== "map"
			) {
				return;
			}

			const parent = node.parent;
			if (
				parent.type !== "MemberExpression" ||
				parent.property.type !== "Identifier" ||
				parent.property.name !== "filter"
			) {
				return;
			}

			context.report({
				node: parent,
				message:
					"Prefer using `arr.filter(a => !a).map(a => a)` instead of `arr.map(a => a).filter(a => !a)` to reduce the iterations the `map` runs over.",
			});
		},
	}),
};
