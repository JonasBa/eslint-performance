import { Rule } from "eslint";

export const preferArrayFromRule: Rule.RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"`Array.from(a, b)` is faster and produces an equal result to `Array.from(a).map(b)`",
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
				callee.object.type !== "Identifier" ||
				callee.object.name !== "Array" ||
				callee.property.type !== "Identifier" ||
				callee.property.name !== "from"
			) {
				return;
			}

			const parent = node.parent;
			if (
				parent.type !== "MemberExpression" ||
				parent.property.type !== "Identifier" ||
				parent.property.name !== "map"
			) {
				return;
			}

			context.report({
				node: parent,
				message:
					"Prefer using `Array.from(arr, a => a)` over `Array.from(arr).map(a => a)` to avoid an unnecessary function call while keeping functionality equal.",
			});
		},
	}),
};
