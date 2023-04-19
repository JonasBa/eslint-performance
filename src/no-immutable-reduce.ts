import { Rule } from "eslint";

const noImmutableReduceRule: Rule.RuleModule = {
	meta: {
		docs: {
			description: "Immutable reduce operator",
			category: "Best Practices",
			recommended: true,
		},
		type: "suggestion",
	},

	create(context: Rule.RuleContext): Rule.RuleListener {
        let acc = ""
		return {
            CallExpression(node) {
                if(node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier" && node.callee.property.name === "reduce"){
                    if(node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression"){
                        if(node.arguments[0].params[0].type === "Identifier"){
                            acc = node.arguments[0].params[0].name;
                        };
                    }
                }
            },
			SpreadElement(node) {
                if(node.parent.type === "ArrayExpression"){
                    const argv = new Set()
                    for(const arg of node.parent.elements){
                        if(arg?.type === "SpreadElement" && arg.argument.type === "Identifier"){
                            argv.add(arg.argument.name);

                            if(acc === arg.argument.name){
                                context.report({
                                    node,
                                    message: `Exponential function - there is no need to spread the accumulator in a reduce function.`,
                                });
                            }
                        }
                    }
                }
			},
		};
	},
};

export { noImmutableReduceRule };
