import { RuleTester } from 'eslint'
import {noImmutableReduceRule} from './no-immutable-reduce'

const tester = new RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
});

tester.run("no-immutable-reduce",noImmutableReduceRule, {
    valid: [
        {code: `arr.reduce((acc, item) => {
            acc.push(i);
            return acc;
        }, [])`},
    ],
    invalid: [
        {code: `arr.reduce((acc, item) => {
            return [...acc, item]}
            , []);
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                return [...acc, item]
            }, [])
            `, errors:  [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                const acc = [...acc, item];
                return acc;
            }, [])
            `,errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            // Object spread tests
            {code: `arr.reduce((acc, item) => {
                return {...acc, [item.key]: item.value}
            }, {})
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Mutate acc directly (e.g., acc[key] = value) for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => ({...acc, key: item}), {})
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Mutate acc directly (e.g., acc[key] = value) for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                const newAcc = {...acc, newKey: item};
                return newAcc;
            }, {})
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Mutate acc directly (e.g., acc[key] = value) for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                return {...acc, ...item}
            }, {})
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Mutate acc directly (e.g., acc[key] = value) for O(n) performance."}]},
            // Variable reassignment tests - spreading aliased accumulator
            {code: `arr.reduce((acc, item) => {
                const result = acc;
                return [...result, item];
            }, [])
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use result.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                const result = acc;
                return {...result, key: item};
            }, {})
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Mutate result directly (e.g., result[key] = value) for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                let result = acc;
                result = [...result, item];
                return result;
            }, [])
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use result.push() instead for O(n) performance."}]},
            {code: `arr.reduce((accumulator, item) => {
                const temp = accumulator;
                const final = temp;
                return [...final, item];
            }, [])
            `, errors: [{message: "Avoid spreading accumulator in reduce (O(n²) complexity). Use final.push() instead for O(n) performance."}]},
            // Concat tests - also O(n²) complexity
            {code: `arr.reduce((acc, item) => acc.concat(item), [])
            `, errors: [{message: "Avoid using concat on accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                return acc.concat([item]);
            }, [])
            `, errors: [{message: "Avoid using concat on accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                const result = acc.concat(item);
                return result;
            }, [])
            `, errors: [{message: "Avoid using concat on accumulator in reduce (O(n²) complexity). Use acc.push() instead for O(n) performance."}]},
            {code: `arr.reduce((acc, item) => {
                const result = acc;
                return result.concat(item);
            }, [])
            `, errors: [{message: "Avoid using concat on accumulator in reduce (O(n²) complexity). Use result.push() instead for O(n) performance."}]},
        ]
    });