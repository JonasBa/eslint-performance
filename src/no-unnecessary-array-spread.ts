import { Rule } from "eslint";

// Disclaimer:
// This rule is unstable and may produce false positives in cases where array spread
// is used for other purposes than shallow copying - e.g. when using it to convert a NodeList to an array.
const noUnnecessaryArraySpreadRule: Rule.RuleModule = {
	meta: {
		docs: {
			description: "Unnecessary spread operator",
			category: "Best Practices",
			recommended: true,
		},
		type: "suggestion",
	},

	create(context: Rule.RuleContext): Rule.RuleListener {
		return {
			ArrayExpression(node) {
				// First argument is a spread operator
				if (node.elements.length === 1 && node.elements[0]?.type === "SpreadElement") {
					// If it's just a declaration like var x = [...array], allow it
					if(node.parent.type !== "MemberExpression"){
						return;
					}
					// [...array].
					if (node.elements[0].argument.type === "Identifier") {
						context.report({
							node,
							message: `Unnecessary array spread operator - prefer direct ${node.elements[0].argument.name}.map call. For extra safety, mark callback parameter as Readonly<T>.\nExample: array.map((item: Readonly<T>) => ...`,
						});
					} else if (
						// [...new Array(n)].map
						node.elements[0].argument.type === "NewExpression" &&
						node.elements[0].argument.callee.type === "Identifier" &&
						node.elements[0].argument.callee.name === "Array"
					) {
						context.report({
							node,
							message: `Unnecessary array spread operator - prefer new Array(n).fill(value).map call\nExample: new Array(10).fill(0).map(item => ...`,
						});
					} else if (
						// [...Array(n)].map
						node.elements[0].argument.type === "CallExpression" &&
						node.elements[0].argument.callee.type === "Identifier" &&
						node.elements[0].argument.callee.name === "Array"
					) {
						context.report({
							node,
							message: `Unnecessary array spread operator - prefer new Array(n).fill(value).map call\nExample: new Array(10).fill(0).map(item => ...`,
						});
					}
				}
			},
		};
	},
};

export { noUnnecessaryArraySpreadRule };
