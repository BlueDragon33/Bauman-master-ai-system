# Russian Engine RE12 — Pronunciation Lab

State: VALIDATING

## Purpose

Build a pronunciation evidence layer that is useful without lying about what the browser can measure.

## Provider capability rule

A signal is accepted only when the provider explicitly declares the corresponding capability.

Examples:
- browser ASR may declare transcript recognition;
- a real acoustic provider may separately declare phoneme or stress signals.

If browser ASR returns transcript confidence, Engine does not reinterpret it as phoneme score.

## Current claims

The observation separately exposes whether evidence exists for:
- phoneme;
- word stress;
- rhythm;
- intonation.

If none exists, those claims remain false.

## Self-comparison

Learner/model duration and pause structure can be compared as coaching data.

This remains non-authoritative.

## Canonical target rule

Current pronunciation targets are explicit fixtures marked noncanonical pending RU03.

Production targets must resolve to RU03 authority before canonical use.

## Exit gate

PASS when unsupported phoneme/stress claims are rejected, provider capabilities are explicit, self-comparison remains coaching-only, and no pronunciation observation writes mastery.
