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
            return [...acc, i]}
            , []);    
            `, errors: [{message: "Exponential function - there is no need to spread the accumulator in a reduce function."}]},
            {code: `arr.reduce((acc, item) => {
                return [...acc, i]
            }, [])
            `, errors:  [{message: "Exponential function - there is no need to spread the accumulator in a reduce function."}]},
            {code: `arr.reduce((acc, item) => {
                const acc = [...acc, i];
                return acc;
            }, [])
            `,errors: [{message: "Exponential function - there is no need to spread the accumulator in a reduce function."}]},
        ]
    });