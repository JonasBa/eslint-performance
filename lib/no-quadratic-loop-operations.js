const noQuadraticLoopOperationsRule = {
    meta: {
        docs: {
            description: "Detects O(n) operations inside loops that cause O(n²) complexity",
            category: "Best Practices",
            recommended: true,
        },
        type: "suggestion",
    },
    create(context) {
        // Track variables declared outside loops to detect accumulation patterns
        const outerScopeVariables = new Map();
        // Helper: Check if a node is inside a loop
        function getEnclosingLoop(node) {
            let current = node.parent;
            while (current) {
                if (current.type === "ForStatement" ||
                    current.type === "ForOfStatement" ||
                    current.type === "ForInStatement" ||
                    current.type === "WhileStatement" ||
                    current.type === "DoWhileStatement") {
                    return current;
                }
                // Also check for array iteration methods (forEach, map, etc.)
                // We treat these as loop contexts but don't return them as LoopNode
                // Instead, we continue searching up the tree
                if (current.type === "CallExpression" &&
                    current.callee.type === "MemberExpression" &&
                    current.callee.property.type === "Identifier") {
                    const methodName = current.callee.property.name;
                    if ([
                        "forEach",
                        "map",
                        "filter",
                        "reduce",
                        "some",
                        "every",
                        "find",
                        "findIndex",
                    ].includes(methodName)) {
                        // For array methods, we'll treat them as implicit loops
                        // Return a synthetic loop marker (we'll use the parent structure)
                        // For simplicity, treat this CallExpression context as a loop
                        return { type: "ForOfStatement" };
                    }
                }
                current = current.parent;
            }
            return null;
        }
        // Helper: Check if a variable is declared inside a loop or callback
        function isDeclaredInsideLoop(varName, loopNode, currentNode) {
            const declaration = outerScopeVariables.get(varName);
            if (!declaration) {
                // If we haven't tracked it, assume it's declared inside
                return true;
            }
            // Check if declaration is a child of the loop node
            let current = declaration;
            while (current) {
                if (current === loopNode) {
                    return true;
                }
                current = current.parent;
            }
            // Special handling for array iteration methods (forEach, map, etc.)
            // Check if the declaration is inside a callback function that's an argument to an iteration method
            let checkNode = currentNode;
            while (checkNode) {
                // Check if we're inside a function expression/arrow function
                if (checkNode.type === "FunctionExpression" ||
                    checkNode.type === "ArrowFunctionExpression") {
                    // Check if this function is an argument to an array iteration method
                    const parent = checkNode.parent;
                    if (parent &&
                        parent.type === "CallExpression" &&
                        parent.callee.type === "MemberExpression" &&
                        parent.callee.property.type === "Identifier") {
                        const methodName = parent.callee.property.name;
                        if ([
                            "forEach",
                            "map",
                            "filter",
                            "reduce",
                            "some",
                            "every",
                            "find",
                            "findIndex",
                        ].includes(methodName)) {
                            // Now check if the declaration is inside this callback
                            let declCurrent = declaration;
                            while (declCurrent) {
                                if (declCurrent === checkNode) {
                                    return true; // Declaration is inside this callback
                                }
                                declCurrent = declCurrent.parent;
                            }
                        }
                    }
                }
                checkNode = checkNode.parent;
            }
            return false;
        }
        // Helper: Check if array is used in loop condition (for while loops)
        function isUsedInLoopCondition(varName, loopNode) {
            if (loopNode.type === "WhileStatement" || loopNode.type === "DoWhileStatement") {
                const condition = loopNode.test;
                return containsIdentifier(condition, varName);
            }
            if (loopNode.type === "ForStatement" && loopNode.test) {
                return containsIdentifier(loopNode.test, varName);
            }
            return false;
        }
        // Helper: Check if a node contains an identifier with given name
        function containsIdentifier(node, name) {
            if (!node)
                return false;
            if (node.type === "Identifier" && node.name === name) {
                return true;
            }
            // Recursively check child nodes
            for (const key in node) {
                if (key === "parent")
                    continue; // Skip parent to avoid cycles
                const value = node[key];
                if (value && typeof value === "object") {
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            if (item && typeof item === "object" && containsIdentifier(item, name)) {
                                return true;
                            }
                        }
                    }
                    else if (containsIdentifier(value, name)) {
                        return true;
                    }
                }
            }
            return false;
        }
        return {
            // Track variable declarations at the top level
            VariableDeclarator(node) {
                if (node.id.type === "Identifier") {
                    outerScopeVariables.set(node.id.name, node);
                }
            },
            CallExpression(node) {
                // Check for shift() and unshift() calls
                if (node.callee.type === "MemberExpression" &&
                    node.callee.property.type === "Identifier") {
                    const methodName = node.callee.property.name;
                    if (methodName !== "shift" && methodName !== "unshift") {
                        return;
                    }
                    // Check if we're inside a loop
                    const loopNode = getEnclosingLoop(node);
                    if (!loopNode) {
                        return;
                    }
                    // Get the variable name being operated on
                    const object = node.callee.object;
                    if (object.type !== "Identifier") {
                        return;
                    }
                    const varName = object.name;
                    // Check if variable is declared inside the loop (loop-local)
                    if (isDeclaredInsideLoop(varName, loopNode, node)) {
                        // Don't warn - this is a loop-local variable
                        return;
                    }
                    // HIGH CONFIDENCE CASE 1: unshift (accumulation pattern)
                    if (methodName === "unshift") {
                        // Variable is declared outside loop and being accumulated with unshift
                        context.report({
                            node,
                            message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure",
                        });
                        return;
                    }
                    // HIGH CONFIDENCE CASE 2: shift with self-modification
                    if (methodName === "shift") {
                        // Check if array is used in loop condition
                        if (isUsedInLoopCondition(varName, loopNode)) {
                            context.report({
                                node,
                                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure",
                            });
                            return;
                        }
                        // Also warn for shift on outer-scope arrays (potential self-modification)
                        // This catches cases where shift is called on arrays that might control iteration
                        context.report({
                            node,
                            message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure",
                        });
                    }
                }
            },
        };
    },
};
export { noQuadraticLoopOperationsRule };
