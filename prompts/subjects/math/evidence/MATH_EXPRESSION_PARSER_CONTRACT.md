# MATH04 · EXPRESSION PARSER CONTRACT

Status: ACTIVE

The local parser is a bounded arithmetic parser, never arbitrary JavaScript evaluation.

Supported local grammar: numbers, variables supplied explicitly by the caller, parentheses, unary +/-,
`+ - * / ^`, constants `pi/e`, and allowlisted one-argument functions `sin cos tan sqrt abs exp log`.

Safety limits:
- expression length <= 240 characters;
- <= 160 tokens;
- unknown identifiers/functions fail;
- division by zero, non-finite values and domain failures are explicit errors;
- no property access, assignment, arrays, object literals, callbacks, HTML or code execution.

Renderer syntax is not parser syntax. Rendered HTML/LaTeX must be converted through an explicit adapter before evaluation.

General symbolic grammar is NOT claimed by this parser.
