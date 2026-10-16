---
title: RLPM databases and cache lifetimes
description: How RLPM reads local package records, tar and CachyOS SQLite repositories, and keeps metadata and references consistent during reloads.
sidebar:
  label: Databases and caches
  order: 1
---

RLPM uses the native installed-package database format and supports both traditional tar repositories and CachyOS SQLite repositories. The backend choice does not select a new database location: configuration and the compiled path profile determine which database Shelly opens. Start with the [RLPM overview](/shelly-alpm/docs/rlpm/) for backend selection and distribution paths.

## Installed package records

The local database uses format version 9. Records include package identity, descriptions, dependencies, file inventories, backup hashes, installation reasons, validation history, and optional install, changelog, and mtree members. CachyOS's `INSTALLED_DB` field preserves the repository a package was installed from, even when that repository is no longer configured.

The root and database directories must exist before library initialization. The default creation mode can initialize missing local storage and its version marker. Explicit read-only mode does not create storage. A populated local database with a missing or unsupported version marker is rejected.

Initial loading reads package identities. Descriptions, files, backups, and groups load as needed. Missing or damaged metadata is distinguished from a package that is not installed. Invalid directory identities and duplicate names are recorded as skipped entries; a metadata identity mismatch does not silently rename the installed package.

## Repository formats

| Format                         | How RLPM reads it                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Traditional repository archive | Libarchive traverses `desc`, `depends`, and `files` records and combines them by package identity. Supported compression comes from the installed libarchive. |
| CachyOS SQLite repository      | A `pacman.db` member is deserialized into a read-only in-memory SQLite database. It is not extracted into the installation root.                              |
| File-list repository           | A configured `.files` extension selects that archive. RLPM does not implicitly merge it with `.db`.                                                           |

Both repository formats produce the same package model and indexes. SQLite ingestion includes package identity, architecture, sizes, digests, signatures, dependencies, provisions, conflicts, replacements, groups, and file lists supported by the pinned reference format.

Malformed archives, unsafe identities, invalid repository filenames, and unusable SQLite rows fail before a replacement cache is published. Metadata limits produce errors rather than silently dropping records. Package digests and signatures in repository records describe available verification data; they do not establish that an archive has already been verified.

## Queries and repository priority

The library exposes exact lookup, group membership, searches, candidate lookup, required-by relationships, and optional reverse dependencies. Repository usage flags separately control synchronization, search, installation, and upgrades.

Database search uses case-insensitive POSIX extended regular expressions. Multiple patterns are combined with AND and can match package names, descriptions, provided names, and groups. Shelly's ranked frontend search is a separate layer.

Candidate and cross-repository queries retain configured repository priority. A direct metadata lookup and a policy-aware install candidate lookup are different operations; finding a package in a database does not automatically make it eligible for an upgrade.

## Reloads and reference lifetimes

Reloading builds a candidate cache and indexes before replacing the published generation. A successful reload invalidates references to the old generation. A failed reload preserves the last usable generation and records the failure; it does not expose half-loaded indexes.

Library callers should resolve package IDs again after mutations and release owned query arrays with the allocator that created them. Borrowed metadata must not outlive its documented generation. Prepared plans hold independent metadata copies, so later cache activity cannot change the package set being reviewed.

Changing a database path, effective signature policy, or keyring invalidates affected caches. Ordinary server-list and usage edits can retain their existing generations. Open archive or local-member streams own their stream resources separately and must be closed by the caller.

## Publication and recovery

Repository refresh verifies and parses a candidate before publishing it. Database/signature publication and local-record publication use journals, with shared directory locks for cooperating RLPM readers. Native writers also coordinate through `db.lck`.

An interrupted journal can require recovery before readers proceed. The record journal does not roll back package payload files. See [downloads and refresh](/shelly-alpm/docs/rlpm/downloads/) and [execution and recovery](/shelly-alpm/docs/rlpm/execution/) for the two publication paths.

Compatible record formats and disposable-root interoperability tests do not establish complete libalpm parity. The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/databases.md) documents query APIs, metadata bounds, and reference fixtures.
