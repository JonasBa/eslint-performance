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
        // Track all variables that reference the accumulator
        let accumulatorAliases = new Set<string>();
		return {
            CallExpression(node) {
                if(node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier"){
                    // Check for reduce calls to track the accumulator
                    if(node.callee.property.name === "reduce"){
                        if(node.arguments[0].type === "ArrowFunctionExpression" || node.arguments[0].type === "FunctionExpression"){
                            if(node.arguments[0].params[0].type === "Identifier"){
                                // Reset and add the accumulator parameter name
                                accumulatorAliases = new Set<string>();
                                accumulatorAliases.add(node.arguments[0].params[0].name);
                            };
                        }
                    }
                    // Check for concat calls on accumulator: acc.concat(item)
                    if(node.callee.property.name === "concat"){
                        if(node.callee.object.type === "Identifier" && accumulatorAliases.has(node.callee.object.name)){
                            const varName = node.callee.object.name;
                            context.report({
                                node,
                                message: `Avoid using concat on accumulator in reduce (O(n²) complexity). Use ${varName}.push() instead for O(n) performance.`,
                            });
                        }
                    }
                }
            },
            // Track variable declarations like: const result = acc
            VariableDeclarator(node) {
                if(node.init && node.init.type === "Identifier" && accumulatorAliases.has(node.init.name)){
                    if(node.id.type === "Identifier"){
                        accumulatorAliases.add(node.id.name);
                    }
                }
            },
            // Track assignments like: result = acc
            AssignmentExpression(node) {
                if(node.right.type === "Identifier" && accumulatorAliases.has(node.right.name)){
                    if(node.left.type === "Identifier"){
                        accumulatorAliases.add(node.left.name);
                    }
                }
            },
			SpreadElement(node) {
                // Check if this spread element is spreading the accumulator or any of its aliases
                if(node.argument.type === "Identifier" && accumulatorAliases.has(node.argument.name)){
                    const varName = node.argument.name;
                    // Check for array spreads: [...acc, item]
                    if(node.parent.type === "ArrayExpression"){
                        context.report({
                            node,
                            message: `Avoid spreading accumulator in reduce (O(n²) complexity). Use ${varName}.push() instead for O(n) performance.`,
                        });
                    }
                    // Check for object spreads: {...acc, key: value}
                    if(node.parent.type === "ObjectExpression"){
                        context.report({
                            node,
                            message: `Avoid spreading accumulator in reduce (O(n²) complexity). Mutate ${varName} directly (e.g., ${varName}[key] = value) for O(n) performance.`,
                        });
                    }
                }
			},
		};
	},
};

export { noImmutableReduceRule };
