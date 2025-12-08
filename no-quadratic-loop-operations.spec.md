# Rule Spec: no-quadratic-loop-operations

## Overview

This rule detects O(n) operations performed inside loops that result in O(n²) runtime complexity. These patterns are common performance pitfalls that can significantly degrade application performance as data sizes grow.

## Motivation

When O(n) operations are repeatedly executed inside a loop that runs n times, the overall complexity becomes O(n²). This quadratic growth can cause severe performance degradation:
- A loop processing 100 items: 10,000 operations
- A loop processing 1,000 items: 1,000,000 operations
- A loop processing 10,000 items: 100,000,000 operations

## Scope

This rule detects O(n²) patterns in:
- `for` loops (traditional, for...of, for...in)
- `while` loops
- `do...while` loops
- Array iteration methods (forEach, map, filter, etc.) when they contain O(n) operations

## Problematic Operations

### 1. Array Mutation Operations (Beginning/Middle)

These operations require shifting subsequent elements, making them O(n):

#### `array.shift()`
Removes the first element and shifts all others down by one index.

**Bad:**
```javascript
for (let i = 0; i < items.length; i++) {
  queue.shift(); // O(n) - shifts all remaining elements
}
```

**Alternative:**
```javascript
// Use a queue with O(1) dequeue: array with index pointer
let index = 0;
for (let i = 0; i < items.length; i++) {
  const item = queue[index++]; // O(1)
}

// Or reverse and use pop() which is O(1)
queue.reverse();
for (let i = 0; i < items.length; i++) {
  queue.pop(); // O(1)
}
```

#### `array.unshift(item)`
Adds element at the beginning and shifts all others up by one index.

**Bad:**
```javascript
for (let item of items) {
  result.unshift(item); // O(n) - shifts all existing elements
}
```

**Alternative:**
```javascript
// Use push and reverse once at the end
for (let item of items) {
  result.push(item); // O(1)
}
result.reverse(); // O(n) once, not O(n²)
```

#### `array.splice(index, deleteCount, ...items)`
When used at the beginning or middle, requires shifting elements.

**Bad:**
```javascript
for (let i = 0; i < items.length; i++) {
  arr.splice(0, 1); // O(n) - equivalent to shift
  // or
  arr.splice(i, 0, items[i]); // O(n) - shifts elements after index
}
```

**Alternative:**
```javascript
// For removals: use filter once
const toRemove = new Set(/* items to remove */);
arr = arr.filter(item => !toRemove.has(item)); // O(n) once

// For insertions: collect and reconstruct
const newArr = [];
for (let i = 0; i < items.length; i++) {
  newArr.push(items[i]); // O(1)
}
```

### 2. Array Search Operations

These operations scan through the array, making them O(n):

#### `array.indexOf(item)` / `array.lastIndexOf(item)`
**Bad:**
```javascript
for (let item of items) {
  if (reference.indexOf(item) !== -1) { // O(n) search
    // ...
  }
}
```

**Alternative:**
```javascript
// Convert to Set for O(1) lookups
const referenceSet = new Set(reference);
for (let item of items) {
  if (referenceSet.has(item)) { // O(1)
    // ...
  }
}
```

#### `array.includes(item)`
**Bad:**
```javascript
for (let item of items) {
  if (reference.includes(item)) { // O(n) search
    // ...
  }
}
```

**Alternative:**
```javascript
// Convert to Set for O(1) lookups
const referenceSet = new Set(reference);
for (let item of items) {
  if (referenceSet.has(item)) { // O(1)
    // ...
  }
}
```

#### `array.find(predicate)` / `array.findIndex(predicate)`
**Bad:**
```javascript
for (let id of ids) {
  const user = users.find(u => u.id === id); // O(n) search
}
```

**Alternative:**
```javascript
// Build a lookup map
const userMap = new Map(users.map(u => [u.id, u]));
for (let id of ids) {
  const user = userMap.get(id); // O(1)
}
```

### 3. Array Copy/Creation Operations

These operations create new arrays, making them O(n):

#### Array spread operator `[...array]`
**Bad:**
```javascript
let result = [];
for (let item of items) {
  result = [...result, item]; // O(n) - copies entire array each iteration
}
```

**Alternative:**
```javascript
let result = [];
for (let item of items) {
  result.push(item); // O(1)
}
```

#### `array.slice()`
**Bad:**
```javascript
let arr = originalArray;
for (let i = 0; i < n; i++) {
  arr = arr.slice(1); // O(n) - copies array minus first element
}
```

**Alternative:**
```javascript
// Use index pointer
let index = 0;
for (let i = 0; i < n; i++) {
  const current = originalArray[index++]; // O(1)
}
```

#### `array.concat(other)`
**Bad:**
```javascript
let result = [];
for (let item of items) {
  result = result.concat([item]); // O(n) - creates new array
}
```

**Alternative:**
```javascript
let result = [];
for (let item of items) {
  result.push(item); // O(1)
}
```

#### `Array.from(arrayLike)`
**Bad:**
```javascript
for (let i = 0; i < n; i++) {
  const copy = Array.from(largeArray); // O(n) - copies array
  // process copy...
}
```

**Alternative:**
```javascript
// Only copy if actually needed
const copy = Array.from(largeArray); // O(n) once
for (let i = 0; i < n; i++) {
  // work with copy or original directly
}
```

### 4. Object Copy/Spread Operations

These operations copy all properties, making them O(n) where n is the number of properties:

#### Object spread operator `{...object}`
**Bad:**
```javascript
let result = {};
for (let item of items) {
  result = { ...result, [item.key]: item.value }; // O(n) - copies all properties
}
```

**Alternative:**
```javascript
let result = {};
for (let item of items) {
  result[item.key] = item.value; // O(1)
}
```

#### `Object.assign({}, object)`
**Bad:**
```javascript
let config = {};
for (let option of options) {
  config = Object.assign({}, config, option); // O(n) - copies all properties
}
```

**Alternative:**
```javascript
let config = {};
for (let option of options) {
  Object.assign(config, option); // O(1) per property, mutates in place
}
```

### 5. Object Iteration Operations

These operations iterate over all properties, making them O(n):

#### `Object.keys(object)` / `Object.values(object)` / `Object.entries(object)`
**Bad:**
```javascript
for (let i = 0; i < n; i++) {
  const keys = Object.keys(largeObject); // O(n) - iterates all properties
  // ... use keys
}
```

**Alternative:**
```javascript
// Compute once outside loop
const keys = Object.keys(largeObject); // O(n) once
for (let i = 0; i < n; i++) {
  // ... use keys
}
```

**Note:** This is only problematic if the object remains unchanged in the loop. If the object is being modified, computing keys each iteration may be necessary.

### 6. String Operations

Some string operations are O(n) where n is the string length:

#### String concatenation with `+` operator (in some engines)
**Bad:**
```javascript
let result = '';
for (let item of items) {
  result = result + item; // Can be O(n) - may reallocate string
}
```

**Alternative:**
```javascript
// Use array join
const parts = [];
for (let item of items) {
  parts.push(item); // O(1)
}
const result = parts.join(''); // O(n) once
```

**Note:** Modern JavaScript engines optimize string concatenation, but this pattern is still worth detecting for large strings.

## Distinguishing True O(n²) from False Positives

The key challenge is determining whether an O(n) operation inside a loop actually creates O(n²) complexity. This requires tracking whether the array/object being operated on **grows proportionally with loop iterations**.

### True O(n²) Patterns (Must Warn)

#### 1. Accumulation Pattern
The array/object grows with each loop iteration:

```javascript
// Array accumulation
let result = [];
for (let item of items) {
  result = [...result, item]; // TRUE O(n²): result size = iteration count
  // or
  result.unshift(item); // TRUE O(n²): result size = iteration count
}

// Object accumulation
let config = {};
for (let option of options) {
  config = { ...config, [option.key]: option.value }; // TRUE O(n²)
}
```

**Detection criteria:**
- Variable declared before loop
- Variable is reassigned/mutated inside loop
- Operation creates new array/object or mutates existing one
- Size correlates with loop iterations

#### 2. Self-modification Pattern
Operating on the same array being iterated:

```javascript
let queue = [...items];
while (queue.length > 0) {
  queue.shift(); // TRUE O(n²): operating on array that determines loop count
}

// or
for (let i = 0; i < arr.length; i++) {
  if (condition) {
    arr.splice(i, 1); // TRUE O(n²): modifying the iteration array
  }
}
```

**Detection criteria:**
- Array/object is loop condition or iteration target
- Operation modifies that same array/object

#### 3. Repeated Search on Static External Array
Searching the same external array repeatedly:

```javascript
const reference = [...largeArray]; // Static, doesn't change
for (let item of items) { // n iterations
  if (reference.includes(item)) { // O(n) search each time
    // TRUE O(n²): n iterations × n search
  }
}
```

**Detection criteria:**
- Array is declared outside loop
- Array is not modified inside loop
- Search operation happens each iteration
- Loop iterations ~ array size (harder to detect statically)

### False Positives (Should NOT Warn)

#### 1. Fixed-size Array Consumption
Operating on a small, constant-size array:

```javascript
const smallQueue = [1, 2, 3, 4, 5]; // constant size k
for (let item of largeArray) { // n iterations
  if (smallQueue.length > 0) {
    smallQueue.shift(); // O(k) work, not O(n²)
  }
}
// Total: O(n × k) = O(n) when k is constant
```

**Detection criteria:**
- Array is small (e.g., length <= 10)
- Array declared outside loop
- Array not growing inside loop

#### 2. Loop-local Variables
Variables created fresh each iteration:

```javascript
for (let item of items) {
  const temp = [1, 2, 3];
  temp.shift(); // Fine: fresh array each time, no accumulation
}
```

**Detection criteria:**
- Variable declared inside loop body
- Not captured or persisted across iterations

#### 3. Independent Array Operations
Operating on unrelated arrays:

```javascript
const queueA = [1, 2, 3];
const itemsB = [...largeArray];

for (let item of itemsB) {
  queueA.shift(); // Different arrays, size independent
}
```

**Detection criteria:**
- Arrays have different origins
- No data flow between loop array and operated array

## Detection Strategy

### Phase 1: Basic Detection (Must Have)

1. **Identify loop contexts:**
   - ForStatement
   - ForInStatement
   - ForOfStatement
   - WhileStatement
   - DoWhileStatement
   - Array methods (forEach, map, filter, reduce, etc.)

2. **Within loops, detect problematic operations:**
   - CallExpression nodes where callee is a method from the problematic operations list
   - SpreadElement nodes in ArrayExpression/ObjectExpression
   - String concatenation patterns

3. **Track accumulation pattern:**
   ```
   - Find variable declared before loop (VariableDeclarator)
   - Track if variable is assigned/mutated inside loop
   - Check if operation grows the variable (push, unshift, spread, etc.)
   - If yes: WARN
   ```

4. **Track self-modification pattern:**
   ```
   - Check if array/object being operated on is:
     - The iteration target (for...of array)
     - The loop condition (while array.length)
   - If yes: WARN
   ```

### Phase 2: Data Flow Analysis (Should Have)

5. **Track variable origins:**
   - Where was the array/object declared?
   - Is it modified inside the loop?
   - Does its size correlate with loop iterations?

6. **Track variable scopes:**
   - Is variable loop-local or outer-scoped?
   - Is variable captured across iterations?

7. **Analyze array/object size:**
   - Can we determine array is small/constant? (e.g., `const small = [1, 2, 3]`)
   - Is array length correlated with loop iterations?

### Phase 3: Advanced Analysis (Nice to Have)

8. **Escape analysis:**
   - Does variable escape the loop?
   - Is variable used after the loop?

9. **Value flow analysis:**
   - Track assignments across multiple statements
   - Handle aliasing (const a = arr; a.shift())

10. **Correlation analysis:**
   - Determine if operation count correlates with loop iterations

### Practical Implementation Strategy

Start with **high-confidence cases** only:

```typescript
// Confidence levels for warnings
enum Confidence {
  HIGH,    // Definitely O(n²) - warn by default
  MEDIUM,  // Likely O(n²) - warn if strict mode
  LOW      // Possibly O(n²) - no warn
}

// HIGH confidence cases:
- Accumulation pattern with spread/unshift/Object spread
- Self-modification with shift/splice on loop array

// MEDIUM confidence cases:
- Search operations (indexOf, includes) on external array
- Operations on arrays declared outside loop

// LOW confidence cases:
- Operations on possibly-small arrays
- Complex data flow
```

### Example Detection Logic

```typescript
function detectAccumulationPattern(node, context) {
  // 1. Find the variable being operated on
  const varName = getOperatedVariable(node);

  // 2. Find where it's declared
  const declaration = findDeclaration(varName, context);

  // 3. Check if declared before loop
  const loopNode = getEnclosingLoop(node);
  if (!isDeclaredBefore(declaration, loopNode)) {
    return null; // Loop-local, safe
  }

  // 4. Check if it's being accumulated
  const isInitializedEmpty = isEmptyInitializer(declaration); // [], {}
  const isReassignedInLoop = hasReassignmentInLoop(varName, loopNode);
  const isGrowingOperation = ['unshift', 'concat', 'SpreadElement'].includes(node.type);

  if (isInitializedEmpty && isReassignedInLoop && isGrowingOperation) {
    return { confidence: Confidence.HIGH };
  }

  // 5. Check if it's the iteration target
  if (isIterationTarget(varName, loopNode)) {
    return { confidence: Confidence.HIGH };
  }

  // 6. Check for search operations
  if (isSearchOperation(node)) {
    // Medium confidence: might be small array
    return { confidence: Confidence.MEDIUM };
  }

  return null;
}
```

## Avoiding False Positives

### Strategies

1. **Allowlist small arrays:**
   ```typescript
   if (canDetermineSize(array) && array.elements.length <= threshold) {
     return; // Don't warn
   }
   ```

2. **Check for loop-local scope:**
   ```typescript
   if (isDeclaredInside(variable, loopNode)) {
     return; // Don't warn
   }
   ```

3. **Detect accumulation pattern explicitly:**
   ```typescript
   // Only warn if we can prove it's accumulating
   if (!isAccumulationPattern(variable, loopNode)) {
     return; // Don't warn unless confident
   }
   ```

4. **Provide escape hatch:**
   ```javascript
   // Allow users to suppress with comment
   for (let item of items) {
     // eslint-disable-next-line runtime-complexity/no-quadratic-loop-operations
     externalArray.shift(); // User knows this is safe
   }
   ```

### Example: Avoiding False Positive

```javascript
// Should NOT warn - small fixed size
const buffer = [1, 2, 3]; // length = 3
for (let item of largeArray) {
  if (buffer.length > 0) buffer.shift();
}

// SHOULD warn - accumulating
const result = []; // starts empty
for (let item of items) {
  result.unshift(item); // grows to items.length
}
```

Detection:
```typescript
if (isEmptyInitializer(result) && isGrowingInLoop(result)) {
  warn(); // Accumulation detected
}

if (!isEmptyInitializer(buffer) && !isModifiedInLoop(buffer)) {
  // Don't warn - fixed size consumption
}
```

## Severity Levels

Suggest different severity based on impact:

- **High severity:** shift, unshift, object spread accumulation (clear O(n²))
- **Medium severity:** indexOf, includes, find (O(n²) but may be acceptable for small arrays)
- **Low severity:** Object.keys in loop with unchanged object (often intentional)

## Configuration Options

```typescript
{
  "runtime-complexity/no-quadratic-loop-operations": ["warn", {
    "arrayOperations": true,      // Detect array operations (default: true)
    "objectOperations": true,     // Detect object operations (default: true)
    "searchOperations": true,     // Detect search operations (default: true)
    "stringOperations": false,    // Detect string operations (default: false)
    "maxIterations": 10,          // Don't warn for loops with <= N iterations (default: none)
    "ignoreSmallArrays": true     // Don't warn if array.length <= threshold (default: false)
  }]
}
```

## Message Format

```
[operation] inside loop causes O(n²) complexity. Consider: [alternative]

Examples:
- "array.shift() inside loop causes O(n²) complexity. Consider: use pop() after reversing, or use an index pointer"
- "array.includes() inside loop causes O(n²) complexity. Consider: convert array to Set for O(1) lookups"
- "Object spread inside loop causes O(n²) complexity. Consider: mutate object directly with obj[key] = value"
```

## Open Questions

1. Should we detect `array.reverse()` in loops? It's O(n) but rarely used this way.
2. Should we warn about nested array methods like `arr.map(x => arr2.includes(x))`?
3. Should string concatenation be enabled by default given modern engine optimizations?
4. How do we handle cases where the O(n) operation is intentional (e.g., copying for immutability)?

## Examples Summary

| Operation | Bad | Good |
|-----------|-----|------|
| shift() | `arr.shift()` in loop | Use index pointer or pop() after reverse |
| unshift() | `arr.unshift(x)` in loop | Use push() then reverse() once |
| splice(0,1) | `arr.splice(0,1)` in loop | Use filter() once or index pointer |
| indexOf() | `arr.indexOf(x)` in loop | Convert to Set, use has() |
| includes() | `arr.includes(x)` in loop | Convert to Set, use has() |
| find() | `arr.find(fn)` in loop | Build Map for O(1) lookup |
| [...arr] | `result = [...result, x]` | Use push() |
| slice() | `arr = arr.slice(1)` in loop | Use index pointer |
| concat() | `arr = arr.concat([x])` in loop | Use push() |
| {...obj} | `obj = {...obj, k: v}` in loop | Use obj[k] = v |
| Object.assign | `Object.assign({}, obj, x)` in loop | Use Object.assign(obj, x) |
| Object.keys | `Object.keys(obj)` in loop | Compute once before loop |

## Implementation Priority

1. **Phase 1 (High impact, clear cases):**
   - array.shift()
   - array.unshift()
   - Object spread accumulation pattern
   - Array spread accumulation pattern

2. **Phase 2 (Common patterns):**
   - array.indexOf()
   - array.includes()
   - array.find()

3. **Phase 3 (Less common):**
   - array.splice() with early indices
   - array.slice() in accumulation
   - Object.keys/values/entries on unchanged objects
   - String concatenation patterns
