---
title: RLPM execution and recovery
description: Payload installation, durable package records, writeback barriers, partial failures, and the limits of RLPM recovery.
sidebar:
  label: Execution and recovery
  order: 9
---

RLPM's executor connects the prepared plan, verified archives, filesystem manifest, and transaction actions to actual package installation and removal. It reports the work completed if an error or cancellation interrupts execution. Record recovery and payload rollback are different guarantees.

## Installing and removing payloads

After revalidation and pre-hooks, execution processes resolved removals followed by additions. It resolves parents through held root-relative descriptors, extracts into private sibling staging, and publishes entries with descriptor-relative operations. Archive-controlled paths do not go directly to libarchive's disk writer.

Extraction preserves supported modes, ownership, timestamps, sparse extents, extended attributes, and file capabilities. The pinned native extraction flags do not enable ACL extraction, and RLPM uses those same flags. Device creation remains subject to kernel privileges. Shared existing directories retain their attributes.

Removal uses unlink and nonrecursive directory removal. Nonempty directories remain, and transferred files are left for their incoming owner. Backup decisions use the filesystem after hooks and pre-scriptlets together with old recorded hashes and the actual incoming content.

## Package writeback barriers

The executor records affected filesystems before payload mutation. After an addition's payload and staging cleanup complete, `syncfs()` flushes those targets before the new package record is published. Upgrade removal and incoming extraction share a tracker. Standalone removal flushes before its post-scriptlet and operation-done events.

The status `Finishing writes for <package>` means a package barrier is in progress; it is not an estimate of kernel writeback completion. Filesystem-wide flushing can wait for unrelated writes and can report their errors.

A failed flush stops execution at `payload_sync`, retains the affected path and error, and prevents publication of the current addition's new record. Flushing one filesystem successfully does not make a multi-filesystem operation atomic. Cancellation checks surround the barrier, but a kernel writeback wait may not stop immediately.

## Durable local records

Installed records include descriptions, inventories, backup hashes, validation, dates, installation reasons, archive members, and repository provenance. The new record is staged outside `local/`, and its files are synchronized before publication.

A durable journal records the old and new record locations. Publication moves the old record into staging, moves the new record into place, synchronizes the directories, and durably removes the journal at the commit point. Ordinary publication errors attempt to restore the old record.

Cooperating RLPM readers take a shared local-directory lock while publication holds an exclusive lock. Native writers also use `db.lck`. Readers that ignore the relevant locks are outside the atomic publication contract.

After successful publication, local identities are rebuilt. On failure, the cache is invalidated or reloaded from disk; a failed reload cannot continue advertising an obsolete cached state as current.

## What recovery restores

An interrupted journal makes RLPM readers report `DatabaseRecoveryRequired`. The library API `Owner.recoverLocalDatabase` acquires the normal writer lock, restores a coherent old record, and can remove abandoned staging that has no journal. Recovery is designed to be repeatable if another interruption occurs.

Recovery does not remove a foreign or stale `db.lck` automatically. The dead-writer condition must be resolved explicitly before journal recovery can acquire the lock. Changing `NativePackageBackend` does not perform that recovery.

**There is no full filesystem rollback.** Payloads already written or removed, prior completed packages, and scriptlet effects can remain after failure. A crash before a package's barrier can leave old records describing partially changed files. Journal recovery repairs record consistency, not the package files themselves.

## Reading a failed result

Execution diagnostics retain completed and remaining package IDs, the current package, operation boundary, path, mutation count, record-publication status, native extraction error, and cleanup failures. `packages_committed` counts completed package operations. `database_published` confirms the current record publication; it does not mean all payload work can be rolled back.

RLPM stops at a failed mutation. Cancellation may stop within a package rather than waiting for the next package boundary. Resource release remains necessary, and a failed payload phase does not emit successful transaction completion or run post hooks.

## Mode differences

| Mode                              | Effect                                                                    |
| --------------------------------- | ------------------------------------------------------------------------- |
| Normal                            | Payloads, local records, scripts, hooks, and linker maintenance.          |
| `DBONLY`                          | Records and members without payload extraction; native actions still run. |
| `DOWNLOADONLY` with additions     | Verified cache acquisition without installed-state or action execution.   |
| `DOWNLOADONLY` with only removals | Native removal behavior, including payload and record deletion.           |
| `NOHOOKS` / `NOSCRIPTLET`         | Independent action suppression; linker maintenance can still run.         |
| `NOLOCK`                          | Commit rejected.                                                          |
| Read-only local database          | Installed-state mutation and installation-reason changes rejected.        |

These are library transaction flags, not a suggestion to use them to recover an arbitrary damaged system. See [transactions and locks](/shelly-alpm/docs/rlpm/transactions/) for state and ownership requirements.

The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/execution.md) describes publication ordering, fault fixtures, namespace integration, and pinned native interoperability tests. That coverage does not certify complete libalpm parity.
