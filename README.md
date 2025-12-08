# @eslint-performance/plugin-runtime-complexity

ESLint plugin to detect runtime complexity issues and algorithmic anti-patterns.

## Installation

```bash
npm install --save-dev @eslint-performance/plugin-runtime-complexity
```

## Usage

### ESLint Flat Config (eslint.config.mjs)

For ESLint 9+ with the flat config format:

```javascript
import runtimeComplexityPlugin from '@eslint-performance/plugin-runtime-complexity';

export default [
  {
    plugins: {
      'runtime-complexity': runtimeComplexityPlugin
    },
    rules: {
      'runtime-complexity/no-immutable-reduce': 'warn',
      'runtime-complexity/no-unnecessary-array-spread': 'warn'
    }
  }
];
```

Or use the recommended configuration:

```javascript
import runtimeComplexityPlugin from '@eslint-performance/plugin-runtime-complexity';

export default [
  runtimeComplexityPlugin.configs.recommended
];
```

### Legacy Config (.eslintrc)

Add `runtime-complexity` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["runtime-complexity"]
}
```

Then configure the rules you want to use under the rules section:

```json
{
  "rules": {
    "runtime-complexity/no-immutable-reduce": "warn",
    "runtime-complexity/no-unnecessary-array-spread": "warn"
  }
}
```

Or use the recommended configuration:

```json
{
  "extends": ["plugin:runtime-complexity/legacy"]
}
```

## Rules

### `no-immutable-reduce`

Detects quadratic runtime when spreading the accumulator in a reduce function. This pattern creates a new array on each iteration, leading to O(n^2) time complexity.

#### Bad

```javascript
// This creates a new array on each iteration - O(n�) complexity
arr.reduce((acc, item) => [...acc, item], []);
```

#### Good

```javascript
// Mutate the accumulator directly - O(n) complexity
arr.reduce((acc, item) => {
  acc.push(item);
  return acc;
}, []);
```

### `no-unnecessary-array-spread`

Detects unnecessary array spread operations that can be replaced with more efficient direct method calls.

#### Bad

```javascript
// Unnecessary shallow copy before map
[...arr].map(item => item * 2);

// Inefficient way to create array
[...new Array(10)].map((_, i) => i);
[...Array(10)].map((_, i) => i);
```

#### Good

```javascript
// Direct map call - if you need immutability, use Readonly<T> in TypeScript
arr.map((item: Readonly<Item>) => item.value);

// Efficient array creation
new Array(10).fill(0).map((_, i) => i);
```

## Why these rules?

### Performance Impact

The rules in this plugin help identify common performance pitfalls:

- **no-immutable-reduce**: Spreading the accumulator in reduce creates O(n�) complexity instead of O(n), which can significantly impact performance on large arrays.

- **no-unnecessary-array-spread**: Creating shallow copies before mapping is redundant if you're not mutating the original items. If immutability is a concern, TypeScript's `Readonly<T>` provides type-safety without the performance overhead.

### Best Practices

These rules encourage:
- Writing performant array operations
- Understanding time complexity implications
- Using type systems for safety instead of runtime copies

## License

MIT

## Author

JonasBa <jonas.badalic@gmail.com>
