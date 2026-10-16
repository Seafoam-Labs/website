---
title: RLPM filesystem preflight
description: Archive validation, file conflicts, backup decisions, path confinement, and space checks before RLPM changes package payloads.
sidebar:
  label: Filesystem preflight
  order: 7
---

Preflight turns a prepared package plan into a manifest of intended filesystem and database effects. It inspects the packages and target root without extracting installed payloads. The executor later consumes that manifest and rechecks mutable state.

## Archive and plan agreement

Preflight verifies the archive under its effective source policy and checks its name, version, architecture, size, dependencies, provisions, conflicts, replacements, and groups against the prepared selection.

Each archive is traversed completely, including payload data. Mtree inventory must agree with actual payload paths and directory markers. Root metadata such as `.PKGINFO`, `.BUILDINFO`, `.INSTALL`, `.CHANGELOG`, and `.MTREE` must be regular files and never becomes an ordinary installation-root operation.

The transaction retains sealed bytes and archive-entry information for execution. A metadata-only package input gains authenticated bytes at this stage. Revalidation can repeat signature and trust checks because policy inputs may change independently of the retained archive.

## File ownership and conflicts

The manifest lists explicit removals, upgrades' old-file effects, incoming payloads, implicit parents, database changes, and conditional backup operations. Conflicts distinguish target-to-target collisions from collisions with the existing filesystem.

Ownership checks use every installed package inventory, not only selected packages. Shared directories, scheduled removals, old owners, and files transferred between upgrading packages affect the decision. Missing local file records stop preflight instead of making those files appear unowned.

Replacing a directory requires eligible ownership of the directory and its descendants. An overwrite pattern does not authorize replacing an unowned tree. Removing a directory means attempting a nonrecursive removal when appropriate; it does not authorize deleting arbitrary contents.

## Configuration files and patterns

Backup decisions compare three values: the old recorded hash, the current local file, and the incoming file. Depending on those values, RLPM replaces the file, preserves it, or prepares a `.pacnew`. Modified removed backups can become `.pacsave` unless `NOSAVE` is set.

`NoUpgrade` preserves an existing file and chooses `.pacnew`; an absent file installs normally. `NoExtract` skips extraction but does not bypass conflict checks, and its paths remain in the installed inventory. Pattern order, negation, and rooted overwrite matches follow the reference rules.

Hooks and pre-scriptlets can change configuration files. The executor therefore recomputes backup decisions using actual content after those actions instead of blindly trusting the earlier observation.

## Confined path resolution

Inspection uses Linux `openat2` with `RESOLVE_IN_ROOT | RESOLVE_NO_MAGICLINKS` against a held root directory descriptor. Followed symlinks resolve inside that root. Unsupported kernels do not receive an unconstrained fallback.

Absolute archive paths, internal dot or dot-dot components, duplicate payload paths, invalid hardlinks, and inconsistent inventories are rejected. Hardlinks must resolve to eligible regular payload in the same archive. Existing symlinked directories can be supported while their observed identities are retained for later checks.

Preflight alone cannot make later writes safe against every concurrent mutation. Execution uses confined parent descriptors and descriptor-relative publication and checks expected state at mutation boundaries.

## Space and access

Capacity estimates are aggregated by filesystem, including cases where the database and installation root are on different mounts. They account for payload blocks, temporary replacement staging, retained backups, directories, links, serialized records, and publication journals.

When enabled, the space cushion follows the reference's smaller-of-roughly-five-percent-or-20-MiB rule. RLPM's estimate includes more staging overhead than a payload-only estimate, so it can reject a nearly full filesystem that the reference accepts. Known read-only or access failures are reported early; unavailable capacity can remain a warning.

Successful explicit preflight leaves the transaction prepared. Failure retains available conflicts and diagnostics and requires a new transaction to retry. Database-only mode still verifies full archives and plans records but omits payload conflict and extraction work. See [execution and recovery](/shelly-alpm/docs/rlpm/execution/) for mode effects.

The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/preflight.md) describes manifest ownership, pattern matching, and validation fixtures.
