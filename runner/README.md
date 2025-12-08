# eslint-performance

Standalone runner for detecting runtime complexity issues in JavaScript and TypeScript code. No configuration required - just run and get instant performance insights.

## Features

- **Zero Configuration**: Works out of the box without any setup
- **TypeScript & JavaScript**: Analyzes both `.js/.jsx` and `.ts/.tsx` files
- **Performance-Focused Rules**: Detects quadratic loops, immutable reduce patterns, and unnecessary array operations
- **CI/CD Ready**: Exit codes and JSON output for automation

## Usage

### Quick Start

Run analysis on current directory:

```bash
npx eslint-performance
```

### Analyze Specific Paths

```bash
# Analyze a specific directory
npx eslint-performance src/

# Analyze specific files
npx eslint-performance src/utils.ts src/helpers.js

# Use glob patterns
npx eslint-performance "src/**/*.ts"
```

### Options

```bash
# JSON output (useful for tooling/CI)
npx eslint-performance --json

# Quiet mode (only show files with issues)
npx eslint-performance --quiet

# Combine options
npx eslint-performance src/ --quiet --json
```

## Rules

This runner automatically enables these performance-focused rules:

### `no-quadratic-loop-operations`

Detects operations inside loops that scale quadratically with input size.

**Example Issue**:
```javascript
for (const item of items) {
  filtered = filtered.filter(x => x !== item);  // O(n²)
}
```

### `no-immutable-reduce`

Detects spreading accumulator in reduce, causing O(n²) complexity.

**Example Issue**:
```javascript
arr.reduce((acc, item) => [...acc, item], []);  // O(n²)
```

### `no-unnecessary-array-spread`

Detects unnecessary array spread operations that create redundant copies.

**Example Issue**:
```javascript
[...arr].map(x => x * 2);  // Unnecessary copy
```

## CI/CD Integration

The runner exits with code `1` if any issues are found, making it perfect for CI pipelines:

```yaml
# GitHub Actions example
- name: Check performance issues
  run: npx eslint-performance
```

```bash
# Local pre-commit hook
npx eslint-performance src/ || exit 1
```

## Output Example

```
/path/to/file.ts
  15:3  warning  Spreading accumulator in reduce creates O(n²) complexity  runtime-complexity/no-immutable-reduce
  23:5  warning  Quadratic loop operation detected  runtime-complexity/no-quadratic-loop-operations

2 problems found in 1 file
```

## When to Use

Use this tool when you want:

- Quick performance audits without ESLint configuration
- One-off analysis of codebases
- CI/CD performance checks
- Pre-commit performance validation

For ongoing development with custom ESLint configs, consider using the [@eslint-performance/plugin-runtime-complexity](https://www.npmjs.com/package/@eslint-performance/plugin-runtime-complexity) plugin directly.

## Related

- [@eslint-performance/plugin-runtime-complexity](https://www.npmjs.com/package/@eslint-performance/plugin-runtime-complexity) - The ESLint plugin this runner uses

## License

MIT

## Author

JonasBa <jonas.badalic@gmail.com>
