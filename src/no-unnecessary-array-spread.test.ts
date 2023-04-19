import { RuleTester } from 'eslint'
import {noUnnecessaryArraySpreadRule} from './no-unnecessary-array-spread'

const tester = new RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  });

const err = (identifier: string) => `Unnecessary array spread operator - prefer direct ${identifier}.map call. For extra safety, mark callback parameter as Readonly<T>.
Example: array.map((item: Readonly<T>) => ...`

const errConstructor = `Unnecessary array spread operator - prefer new Array(n).fill(value).map call
Example: new Array(10).fill(0).map(item => ...`
  
tester.run("no-map-shallow-copy",noUnnecessaryArraySpreadRule, {
    valid: [
        {code: "[...arr]"},
        {code: "array.map(item => item)"},
        {code: "new Array(10).map(item => item)"},
    ],
    invalid: [
        {code: "[...arr].map(item => item)", errors: [{message: err("arr")}]},
        {code: "[...new Array(20)].map(item => item)", errors: [{message: errConstructor}]},
        {code: "[...Array(20)].map(item => item)", errors: [{message: errConstructor}]},
    ]
});