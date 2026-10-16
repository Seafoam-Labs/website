---
title: RLPM integrity and signature verification
description: Package and database signing policy, trust checks, key import, and sealed archive ownership in RLPM.
sidebar:
  label: Integrity and signatures
  order: 5
---

RLPM checks archives and synchronization databases under their effective signature policy. Repository policy can inherit the owner's defaults, and local and remote package files have their own policy paths. The native configuration and selected keyring determine those checks; choosing RLPM does not remove the need for trust configuration.

## Signature requirements

| Policy   | Missing signature  | Present signature                      |
| -------- | ------------------ | -------------------------------------- |
| Disabled | No signature check | No signature check                     |
| Optional | Allowed            | Must satisfy validity and trust policy |
| Required | Rejected           | Must satisfy validity and trust policy |

Full or ultimate trust is accepted. Marginal and unknown trust require their respective allowances. Those allowances do not make revoked, disabled, unknown, or invalid signing keys acceptable. Signature expiry and signing-key expiry have distinct handling, including the applicable expired-key refresh path for file packages.

GPG verification uses the configured package keyring rather than implicitly choosing the user's personal GPG home. Verification reads the keyring's trust database and does not automatically grant trust or perform routine keyring maintenance.

## Digests and signature forms

Repository digest checks prefer SHA-256 and fall back to MD5 when applicable. Under enabled policy, an embedded signature takes precedence over repository digests according to the reference rules. Detached signatures still require any supplied digest to pass. Disabling signature checks does not disable supplied checksums.

Repository metadata can advertise a digest or signature before an archive has been acquired. RLPM distinguishes that advertised information from checks actually performed. A package inventory or successful metadata parse is not an integrity result.

## Verifying the bytes that will be used

Loading copies input into a sealed Linux `memfd`, an anonymous memory-backed file. GPG and libarchive inspect those same bytes. The verified package retains that sealed file for subsequent readers and extraction, even if the original pathname is replaced or removed.

This prevents a pathname replacement from substituting different bytes after verification. It requires Linux memfd sealing and `/proc` access, and retained snapshots occupy RAM or swap proportional to their size. Memory, descriptor, and copying failures propagate as errors.

A database replacement is published only after verification and parsing succeed. Rejected replacements leave the previous usable cache intact. Preflight can reapply current trust and detached-signature checks because those inputs may change even when the sealed archive cannot.

## Key acquisition

Unknown keys invoke an import question with denial as the default. After consent, acquisition can try configured local key files, WKD when an email is available, and the configured keyserver. Network acquisition routes can be disabled independently.

Local key sources must match the requested key identity. Unrelated key bundles and secret keys are rejected by this acquisition path. A successful import triggers verification again; importing a key does not make it trusted.

RLPM retains structured signature results and acquisition diagnostics, including fingerprints, cryptographic validity, trust, key state, process status, and GPG output. A missing key, denied import, failed acquisition, and invalid signature remain different outcomes.

## Library APIs

`Package.loadArchive` is an unverified metadata API. `Owner.loadPackage` applies the selected source policy and retains the verified bytes. Callers must choose the authenticated path when the result will authorize package work.

Open archive, member, and mtree readers have explicit ownership and must be closed. Changing effective database signature policy or keyring invalidates affected caches. Each new authenticated load checks the current policy, including a load from a cache hit.

Checksums and signatures authenticate data under the configured trust policy; they do not establish that package scripts are harmless. Execution controls are described in [hooks and scriptlets](/shelly-alpm/docs/rlpm/actions/), while [filesystem preflight](/shelly-alpm/docs/rlpm/preflight/) checks the proposed installation effects.

See the [implementation reference](https://github.com/Seafoam-Labs/Shelly-ALPM/blob/development/Shelly.Rlpm/verification.md) for policy inheritance, result ownership, GPG fixtures, and reference boundaries.
