import { ESLint } from 'eslint';
import runtimeComplexityPlugin from '@eslint-performance/plugin-runtime-complexity';
import typescriptParser from '@typescript-eslint/parser';

/**
 * Create ESLint configuration for the runner
 * Using flat config format for ESLint 9
 */
function createConfig(files) {
  return {
    files: files,
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'runtime-complexity': runtimeComplexityPlugin,
    },
    rules: {
      'runtime-complexity/no-unnecessary-array-spread': 'warn',
      'runtime-complexity/no-immutable-reduce': 'warn',
      'runtime-complexity/no-quadratic-loop-operations': 'warn',
    },
  };
}

/**
 * Format results for console output
 */
function formatResults(results, quiet) {
  let output = '';
  let totalProblems = 0;
  let totalFiles = 0;

  for (const result of results) {
    if (result.messages.length === 0 && quiet) {
      continue;
    }

    if (result.messages.length > 0) {
      totalFiles++;
      totalProblems += result.messages.length;

      output += `\n${result.filePath}\n`;

      for (const message of result.messages) {
        const severity = message.severity === 2 ? 'error' : 'warning';
        output += `  ${message.line}:${message.column}  ${severity}  ${message.message}  ${message.ruleId}\n`;
      }
    }
  }

  if (totalProblems > 0) {
    output += `\n`;
    output += `${totalProblems} problem${totalProblems === 1 ? '' : 's'} found in ${totalFiles} file${totalFiles === 1 ? '' : 's'}\n`;
  } else {
    output += 'No performance issues found!\n';
  }

  return output;
}

/**
 * Run ESLint on the specified paths
 */
export async function run(paths, flags = {}) {
  const eslint = new ESLint({
    overrideConfigFile: true, // ESLint 9: Prevent loading external config
    baseConfig: createConfig(paths),
    ignore: false, // Don't use .eslintignore files
    errorOnUnmatchedPattern: false,
  });

  // Lint files
  const results = await eslint.lintFiles(paths);

  // Output results
  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const formattedOutput = formatResults(results, flags.quiet);
    console.log(formattedOutput);
  }

  // Determine exit code
  const hasErrors = results.some((result) =>
    result.messages.some((message) => message.severity === 2)
  );
  const hasWarnings = results.some((result) =>
    result.messages.some((message) => message.severity === 1)
  );

  // Exit code: 0 = no issues, 1 = warnings or errors found
  return hasErrors || hasWarnings ? 1 : 0;
}
