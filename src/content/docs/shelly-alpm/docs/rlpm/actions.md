---
title: RLPM hooks and scriptlets
description: Hook discovery, package script stages, worker execution, network controls, and failure behavior in RLPM transactions.
sidebar:
  label: Hooks and scriptlets
  order: 8
---

RLPM runs native package hooks and scriptlets as part of commit. Their ordering is tied to package execution and local-record publication. The transaction retains action outcomes, including failures that are warnings rather than fatal transaction errors.

## Hook discovery and matching

The parser handles package and path triggers, operation types, targets, timing, commands, dependencies, descriptions, `AbortOnFail`, `NeedsTargets`, and CachyOS `NetworkAccess`.

Later configured directories override earlier hook files with the same basename. Empty files and `/dev/null` symlinks mask lower-priority hooks. Applicable hook files run in lexical order. `HookDirMode = Replace` can replace the default directory list; see the [configuration overview](/shelly-alpm/docs/rlpm/#distribution-and-configuration-knobs).

Path triggers include old inventories for upgrades and removals, even when a listed file is already missing. Incoming `NoExtract` paths are excluded, ownership transfers count as upgrades, and `.pacnew` events match the original pathname. `NeedsTargets` supplies sorted, deduplicated matching targets on standard input.

Hook `Exec` follows native word splitting rather than shell expansion or PATH lookup. Hook `Depends` is checked against the actual local package cache at invocation time, including versioned providers. `AssumeInstalled` does not satisfy these dependencies.

## Execution order

1. Revalidate the plan, archives, root and database identity, and preflight manifest.
2. Discover and run applicable pre-transaction hooks.
3. Process removals and additions in plan order, running package pre- and post-scriptlets around their mutation stages.
4. Publish the actual resulting package state and perform linker-cache maintenance.
5. Rediscover and run applicable post-transaction hooks.

Post hooks are discovered again because newly installed packages may provide new hooks and commands. They see the resulting local package state.

Incoming pre-install or pre-upgrade scripts come from the sealed archive. Post-installation scripts use the new local database member. Removal stages use the old member. Reinstalls and downgrades use upgrade functions; upgrade arguments are the new and old versions. Version values are quoted literally when passed through the shell.

## Worker environment

A fresh action worker enters the held target root and executes the action there. It resets signals, closes inherited descriptors on execution, removes `BASH_ENV`, and applies the action umask. The parent process keeps its own working directory, environment, credentials, and network state.

The hosting binary re-executes `/proc/self/exe` with a reserved worker mode. Embedders must dispatch those modes before ordinary application initialization or provide an absolute path to a compatible worker host. A binary compiled with libalpm still has that dynamic dependency in worker mode; an RLPM-only binary excludes it.

The parent feeds action input while draining output, forwards scriptlet lines, distinguishes setup errors from command exit codes, and checks cancellation. Cancellation terminates the process group and reaps the direct child.

## Network controls

By default, hooks and scriptlets require a network namespace, with loopback brought up on a best-effort basis. Failure to establish required isolation prevents the action from executing.

- A hook can allow network access with `NetworkAccess=allowed`.
- Native configuration `DisableSandboxNetwork`, or the API's `sandbox.disable_network`, permits action network access.
- Global sandbox disabling also disables action network isolation.
- Download filesystem and syscall controls are independent and do not themselves disable action network isolation.

Linker-cache maintenance has its own best-effort isolation behavior and only runs when the configured root contains its required configuration and executable.

## Failures and flags

A pre-hook marked `AbortOnFail` can stop the transaction before payload changes. Ordinary scriptlet failures, post-hook failures, and other failures treated as nonfatal by the reference are retained as warnings and action outcomes. Allocation failures and cancellation still propagate.

Failed or interrupted payload execution does not run successful-completion post hooks. Earlier script effects are not rolled back. Isolated build provisioning additionally rejects package setup failures even when the native package transaction otherwise committed.

`NOHOOKS` and `NOSCRIPTLET` independently suppress their respective actions; neither suppresses linker-cache maintenance. `DBONLY` still runs native actions, while download-only transactions with additions do not. See [execution and recovery](/shelly-alpm/docs/rlpm/execution/) before using these flags in an embedder.

The [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/actions.md) documents parser bounds, process contracts, and disposable-root action tests.
