#!/usr/bin/env node

import { run } from './runner.js';

const args = process.argv.slice(2);

// Parse flags and paths
const flags = {
  json: false,
  quiet: false,
};

const paths = [];

for (const arg of args) {
  if (arg === '--json') {
    flags.json = true;
  } else if (arg === '--quiet') {
    flags.quiet = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
eslint-performance - Detect runtime complexity issues

Usage:
  eslint-performance [paths...] [options]

Arguments:
  paths              Files or directories to analyze (default: current directory)

Options:
  --json             Output results as JSON
  --quiet            Only show files with issues
  --help, -h         Show this help message

Examples:
  eslint-performance
  eslint-performance src/
  eslint-performance "src/**/*.ts"
  eslint-performance --json --quiet
`);
    process.exit(0);
  } else {
    paths.push(arg);
  }
}

// Default to current directory if no paths provided
if (paths.length === 0) {
  paths.push('.');
}

// Run the linter
run(paths, flags)
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(2);
  });
