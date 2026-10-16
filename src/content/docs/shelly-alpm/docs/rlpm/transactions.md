---
title: RLPM transactions and locking
description: Transaction states, shared database locks, stable preparation, callbacks, and cancellation in RLPM.
sidebar:
  label: Transactions and locks
  order: 4
---

An RLPM transaction owns the prepared plan and the resources needed to execute it. Its lifecycle distinguishes preparation, review, execution, completion, failure, and interruption. The database lock remains held until the transaction is released, including after a failed prepare or cancelled operation.

## Lifecycle

| State                             | What callers can do                                                              |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Initialized                       | Add targets, package archives, removals, or system-upgrade intent, then prepare. |
| Preparing                         | Receive synchronous callbacks; request cancellation.                             |
| Prepared                          | Inspect the plan, acquire archives, run preflight, or commit.                    |
| Committing                        | Receive progress, questions, and action output; request cancellation.            |
| Completed, failed, or interrupted | Inspect retained results and diagnostics, then release.                          |

Calls in the wrong state fail with `InvalidTransactionState`. A failed preparation requires a fresh transaction for retry. Releasing destroys the transaction's views and resources, so callers must copy any information they need to retain.

The library's `Owner` keeps one active transaction. It rejects destruction while that transaction remains active. Read-only resolution is a separate API and cannot run while the owner has an active transaction.

## Shared writer lock

Initialization exclusively creates `db.lck` in the configured database directory. RLPM and libalpm use this same writer lock. A conflicting or inaccessible lock prevents the transaction from starting.

RLPM retains the lock's file descriptor and checks that the pathname still identifies the same file before unlinking it. If another file has replaced the lock, cleanup preserves the replacement and reports lost ownership. Ordinary initialization and owner cleanup do not delete a stale lock left by another process.

`NOLOCK` skips acquisition but cannot authorize commit. Explicitly releasing the owner's lock also makes that transaction unable to commit. These rules apply even when a commit would otherwise be empty.

The lock excludes cooperating package writers. It is not protection against every process that can modify the filesystem. Shared directory locks provide additional publication coordination for RLPM readers; clients that ignore those locks are outside that guarantee.

## Stable preparation

Transaction initialization reloads local identities and invalidates old package-cache generations. Callers must obtain current references after initialization.

Configuration, repository registrations, callback settings, and explicit cache mutations are frozen until release. Preparation copies the reviewed metadata into the transaction plan. Later lazy reads cannot silently change the chosen package set.

Content fingerprints check local and synchronization database state around preparation and before commit. If external changes invalidate the reviewed state, RLPM reports `StaleDatabaseState` instead of preparing and installing a different plan without review. This conservative hashing has a cost on large databases and does not replace filesystem or signature revalidation.

## Questions and callbacks

Questions cover choices such as providers, ignored targets, conflicts, corrupted files, and key import. Defaults are conservative. Callbacks may change answer fields only; invalid answers fail rather than selecting an arbitrary provider.

Callbacks run synchronously and borrow their payloads. Reentering the owner from a callback is rejected. PackageManager's operation adapter copies question data for deferred frontend responses and connects UI and CLI cancellation to the owner.

## Cancellation and partial work

Cancellation is checked through resolution, downloads, preflight, actions, and payload mutations. Action cancellation terminates the worker process group. Payload cancellation can stop inside a package, leaving already completed work in place.

An interrupted result retains completed and remaining packages and the boundary where execution stopped. It is not a full filesystem rollback. Switching backends does not repair an unfinished operation or recover its journal. See [execution and recovery](/shelly-alpm/docs/rlpm/execution/) before interpreting a failed transaction as unchanged installed state.

The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/transactions.md) covers ownership, empty transactions, callback contracts, and lock tests.
