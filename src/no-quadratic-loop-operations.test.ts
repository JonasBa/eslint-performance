import { RuleTester } from 'eslint'
import { noQuadraticLoopOperationsRule } from './no-quadratic-loop-operations'

const tester = new RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
});

tester.run("no-quadratic-loop-operations", noQuadraticLoopOperationsRule, {
    valid: [
        // Loop-local arrays - should NOT warn
        {
            code: `for (let i = 0; i < 10; i++) {
                const temp = [1, 2, 3];
                temp.shift();
            }`
        },
        {
            code: `for (let item of items) {
                const temp = [];
                temp.unshift(item);
            }`
        },
        {
            code: `items.forEach(item => {
                const temp = [1, 2, 3];
                temp.shift();
            })`
        },
        // Regular push operations - should NOT warn
        {
            code: `const result = [];
            for (let item of items) {
                result.push(item);
            }`
        },
        // Pop operations - should NOT warn (O(1))
        {
            code: `const stack = [...items];
            while (stack.length > 0) {
                stack.pop();
            }`
        },
        // Array declared inside loop - should NOT warn
        {
            code: `for (let i = 0; i < 10; i++) {
                let arr = [1, 2, 3];
                arr.shift();
            }`
        },
    ],
    invalid: [
        // HIGH CONFIDENCE: Accumulation pattern with unshift
        {
            code: `const result = [];
            for (let item of items) {
                result.unshift(item);
            }`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
        {
            code: `let result = [];
            for (let i = 0; i < items.length; i++) {
                result.unshift(items[i]);
            }`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
        {
            code: `const result = [];
            items.forEach(item => {
                result.unshift(item);
            });`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
        // HIGH CONFIDENCE: Self-modification pattern with shift (while loop)
        {
            code: `const queue = [...items];
            while (queue.length > 0) {
                queue.shift();
                // process...
            }`,
            errors: [{
                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure"
            }]
        },
        {
            code: `let queue = [1, 2, 3, 4, 5];
            while (queue.length) {
                const item = queue.shift();
            }`,
            errors: [{
                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure"
            }]
        },
        // HIGH CONFIDENCE: Self-modification in do-while
        {
            code: `const queue = [...items];
            do {
                queue.shift();
            } while (queue.length > 0);`,
            errors: [{
                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure"
            }]
        },
        // HIGH CONFIDENCE: shift in for loop modifying loop-controlling array
        {
            code: `const arr = [1, 2, 3, 4, 5];
            for (let i = 0; i < arr.length; i++) {
                if (condition) {
                    arr.shift();
                }
            }`,
            errors: [{
                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure"
            }]
        },
        // unshift with different loop types
        {
            code: `const result = [];
            while (condition) {
                result.unshift(item);
            }`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
        {
            code: `const result = [];
            do {
                result.unshift(item);
            } while (condition);`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
        // Multiple operations in same loop
        {
            code: `const queue = [...items];
            while (queue.length > 0) {
                const first = queue.shift();
                const last = queue.pop();
            }`,
            errors: [{
                message: "shift() in loop causes O(n²) complexity. Consider: use an index pointer, iterate in reverse with pop(), or use a deque data structure"
            }]
        },
        // Nested loops - outer variable
        {
            code: `const result = [];
            for (let i = 0; i < outer.length; i++) {
                for (let j = 0; j < inner.length; j++) {
                    result.unshift(inner[j]);
                }
            }`,
            errors: [{
                message: "unshift() in loop causes O(n²) complexity. Consider: use push() then reverse once, iterate in reverse order, or use a deque data structure"
            }]
        },
    ]
});
