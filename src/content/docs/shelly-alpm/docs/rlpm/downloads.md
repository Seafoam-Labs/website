---
title: RLPM downloads and repository refresh
description: Verified caches, bounded transfers, mirror retries, repository publication, and download privilege separation.
sidebar:
  label: Downloads and refresh
  order: 6
---

RLPM uses `Shelly.Download` for package acquisition and repository refresh. HTTP and HTTPS use the shared HTTP client, with libcurl handling other enabled transport or proxy cases. Neither the shared transport nor the RLPM engine delegates downloads to libalpm.

## Cache selection and partial downloads

Configured cache directories are searched in order before choosing a writable destination. Hits are checked against current size, digest, signature, and trust policy. A file's presence in the cache does not make it accepted automatically. Corrupt-file removal can require a frontend answer.

Partial files live in private staging directories guarded against concurrent reuse. HTTP range replies are validated. If a server responds with a complete file instead of the requested range, the partial download restarts rather than appending unrelated content. Transfer size ceilings, deadlines, and cancellation apply through setup, body transfer, and retries.

Archive basenames reject separators, traversal, and NUL, including unsafe names obtained from decoded URL paths. Rejected candidates stay out of the accepted final cache path. Successfully published cache files remain after the caller releases its result object.

## Concurrency and mirrors

`ParallelDownloads` controls the bounded queue, capped at 255 workers. A payload, its signature request, and retries keep their job slot. Resource exhaustion can reduce concurrency.

Cache servers are tried before repository mirrors. Failure handling distinguishes cache servers from repository hosts, and host failure counters can persist across successive package batches. Ordinary HTTP batches can reuse connections; separately sandboxed worker processes do not share that connection pool.

Independent repository databases and signatures can be acquired concurrently under the same limit. Candidate verification and publication remain on the owner thread. A rejected candidate can start another bounded mirror round without downloading successful repositories again.

## What progress means

A transferred payload is not yet an accepted package. Progress separates queued work, active transfer attempts, retries, transferred bytes, processing, and final acceptance.

Verification and publication show their stage and batch position after transfer. A mirror retry receives a new attempt identity. Cache hits do not emit artificial transfer bars. Isolated provisioning combines active byte counters into a throttled summary while forwarding stage changes, errors, and hook output immediately.

## Repository refresh

Refresh requires `db.lck`, cannot run inside an active transaction, and honors repository synchronization usage and the configured database extension. It reports updated, unchanged, skipped, and failed outcomes per repository.

The new database and detached signature are sealed, verified, and parsed before publication. Invalid candidates leave the previous usable generation intact. An unchanged database retains its references; a changed database publishes a new generation.

Publication synchronizes files and backups, writes a journal, replaces the pair, and durably removes the journal at completion. Cooperating RLPM readers hold a shared directory lock while capturing the pair. Interrupted publication requires recovery; refresh can perform that recovery under the writer lock. Arbitrary readers that ignore the directory lock are not guaranteed an atomic view of two separate pathnames.

## Download workers and privileges

When running as root with a configured download user and applicable sandbox controls, RLPM starts a child that clears supplementary groups, changes GID and UID, and applies configured Landlock and seccomp restrictions. Setup failure aborts the request. The parent does not change credentials.

The parent accepts regular worker output without following symlinks, verifies sealed bytes, and publishes the accepted files. Cancellation terminates and reaps the child. Worker processes re-execute the hosting binary through `/proc/self/exe`; no companion download executable is required.

Unprivileged callers, missing download-user configuration, or disabled sandbox switches can take different paths. Action network isolation is a separate control described in [hooks and scriptlets](/shelly-alpm/docs/rlpm/actions/).

## Acquisition without installation

The transaction API can explicitly download a prepared plan without committing it. A download-only transaction with additions verifies cache acquisition without changing installed packages or running package actions. The removal-only `DOWNLOADONLY` flag combination follows the native removal path, so embedders must not treat that flag as a universal read-only guarantee.

See [integrity and signatures](/shelly-alpm/docs/rlpm/verification/) and the [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/downloads.md) for verification policy, callback contracts, recovery, and sandbox tests.
