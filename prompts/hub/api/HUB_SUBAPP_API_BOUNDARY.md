# HUB ↔ SUBJECT APP API BOUNDARY

This file defines **logical capabilities**, not invented concrete endpoints.

Actual URL/path/transport must come from a registered subject-app contract.

## Hub may READ only registered capabilities

Typical logical read capabilities:
- `subject.descriptor.read`
- `subject.health.read`
- `subject.status.read`
- `subject.progress.summary.read`
- `subject.resume.read`
- `subject.assessment.summary.read` when explicitly exported
- `subject.notifications.read` when explicitly exported

## Hub may SEND only registered capabilities

Typical logical outbound capabilities:
- `hub.context.apply`
- `hub.navigation.request`
- `hub.preferences.apply`
- `hub.sync.request`
- `hub.lifecycle.ping`

These are capability names, not assumed HTTP routes. Do not invent an endpoint.

## Default-deny commands

Without an explicit versioned contract, Hub must NOT send:
- grade/mastery override;
- answer injection;
- lesson/content mutation;
- assessment mutation;
- internal database commands;
- arbitrary script execution;
- credential exchange;
- subject deployment commands.

## Required envelope properties

A registered integration should expose enough information to validate:
- `subjectId`
- `contractVersion`
- `capability`
- `requestId`
- `timestamp`
- `source`
- `payload`
- optional `etag/version`
- explicit error/status

Hub adapters normalize external subject contracts into one Hub read model. Hub UI consumes the normalized model, never subject internals.
