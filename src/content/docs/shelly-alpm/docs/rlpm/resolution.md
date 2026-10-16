---
title: RLPM dependency resolution
description: How RLPM chooses repositories and providers and prepares install, removal, and system-upgrade plans.
sidebar:
  label: Dependency resolution
  order: 3
---

RLPM's resolver turns requested installs, removals, and system upgrades into an ordered plan. It identifies the package set and questions before execution. A resolution plan is review data; it does not acquire a transaction lock or authorize installation by itself.

## Targets and providers

Targets can be textual package relations, repository-qualified names such as `repository/package`, current repository package references, or package archives. The resolver uses dependencies, provisions, conflicts, replacements, installed packages, and configured assumed provisions.

Repository priority matters more than choosing the highest version across every repository. Literal package candidates precede provider choices. When a dependency can be satisfied by several providers, the frontend may ask which one to use; an installed provider's name is preferred among suitable repository providers.

Provider candidates keep their repository identity even when names repeat. The plan records the selected provisions and final dependency edges, so callers can explain why a package entered the transaction.

Only runtime dependencies expand the native transaction graph. PKGBUILD build and check dependencies are supplied by the build coordinator when constructing its environment; the package resolver does not execute a PKGBUILD to discover them.

## Checking the future installed state

Resolution checks the state that will exist after removing old versions and selected removals and adding the chosen packages. Surviving installed packages are checked when a changed package previously satisfied one of their dependencies.

An unrelated pre-existing broken dependency does not automatically invalidate the transaction. Conflicts are checked in both directions and include versioned provisions. Removing an installed conflict requires the applicable question to be answered.

Dependency cycles produce an ordered plan with warnings. Missing requirements and invalid architectures are structured failures, allowing the frontend to identify the requirement and affected package rather than reporting only a generic resolution error.

## Removal and upgrades

Removal planning supports cascade, recursive dependency cleanup, inclusion of explicitly installed dependencies when requested, and unneeded filtering. Shared providers and dependency cycles participate in those decisions. Optional dependencies generate warnings and do not act as mandatory removal blockers.

System upgrades follow configured repository priority, consider replacements, honor ignored packages, and retain installed packages that are absent from synchronization databases. Upgrade operations preserve installation reasons, and replacements transfer the relevant reason. An explicit older target and a system upgrade that permits downgrades are separate ways to select older versions.

`IgnorePkg` and `IgnoreGroup` use pattern matching. Explicit ignored targets can prompt, ignored dependency candidates are skipped, and ignored upgrades produce warnings. `AssumeInstalled` supplies provisions for resolution; it does not install a package or satisfy hook dependencies against the actual installed database.

## Flags and plan contents

Solve-time flags cover dependency checks, dependency-version checks, conflicts, needed-only installation, cascade, recursion, unneeded filtering, and installation reasons. These flags are independent: disabling dependency checks does not also disable conflicts, and disabling version checks does not erase version semantics from every other phase.

A plan contains:

- Ordered additions and removals, with action and installation reason.
- Dependency edges, selected providers, and unchanged installed satisfiers.
- Questions and accepted answers, warnings, and structured issues.
- Known size totals and explicit unknown-size counts.
- Repository provenance for incoming packages.

Library callers must check the plan's semantic result before using its package lists. A failed plan can contain provisional selections. Operational errors such as cancellation, stale references, or allocation failure are distinct from semantic failures such as a missing dependency.

Plans own their metadata and remain readable independently of the source cache's lifetime. A transaction binds its plan to frozen configuration, the held lock, and checked database state. See [transactions and locking](/shelly-alpm/docs/rlpm/transactions/).

## Compatibility boundaries

The resolver follows a pinned CachyOS libalpm reference, including documented provider-ordering and dependency-range behavior. It is not a promise of globally optimal dependency solving. Independent fixtures cover preparation scenarios, while archive transfer, filesystem checks, hooks, and payload execution have separate validation.

The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/resolution.md) describes plan ownership, individual flags, and reference coverage.
