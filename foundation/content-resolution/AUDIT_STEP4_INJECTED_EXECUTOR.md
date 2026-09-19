# Bauman Foundation — Content Resolution & Runtime Delivery — Step 4 Injected Delivery Executor Audit

## Goal

Allow future consumers to retrieve bytes through an explicitly injected adapter while guaranteeing integrity verification before those bytes reach a consumer.

The executor itself owns no transport implementation.

## Executor boundary

`runtime-delivery-executor.js` accepts:

1. a ready `BAUMAN_RUNTIME_DELIVERY_PLAN_V1`;
2. an adapter map supplied by the caller;
3. an optional consumer callback.

The adapter is selected only by the exact `adapterId` already frozen into the plan.

There is no global adapter discovery.

## Verification sequence

1. validate the delivery plan;
2. locate the explicitly injected adapter;
3. ask the adapter for bytes;
4. copy the adapter-owned payload;
5. verify SHA-256 digest and byte length;
6. only after verification, give a second payload copy to the consumer.

Failed or malformed bytes are never forwarded to the consumer.

## Side-effect ownership

Injected adapters may perform environment-specific I/O in future integrations.

The executor core itself contains no:

- `fetch`;
- XMLHttpRequest;
- WebSocket;
- localStorage/sessionStorage/IndexedDB access;
- route mutation;
- registry mutation;
- learner-state mutation.

This preserves a testable boundary between policy/integrity and environment-specific transport.

## Result

The executor returns only a verification summary. It does not return payload bytes itself.

This reduces the chance that unverified or mutable adapter-owned bytes leak around the verification gate.

## Step 4 gate

Step 4 requires:

- Step 1–3 gates PASS;
- correct adapter injection PASS;
- adapter missing/error/invalid-payload fail closed;
- digest or byte-length mismatch blocks consumer;
- successful payload reaches consumer only after verification;
- consumer receives a copy isolated from adapter mutation;
- executor source contains no direct network/storage API.

A later step may provide a narrowly scoped real adapter, but it must remain injected and must preserve this verification sequence.
